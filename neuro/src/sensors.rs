use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Utc};
use rppal::i2c::I2c;
use rppal::uart::{Parity, Uart};
use serde::Serialize;
use std::path::Path;
use tracing::{debug, warn};

use crate::config::Config;

#[derive(Debug, Clone, Serialize)]
pub struct SensorReading {
    pub room_id: String,
    pub timestamp: DateTime<Utc>,
    pub temperature_c: Option<f32>,
    pub humidity_pct: Option<f32>,
    pub pressure_hpa: Option<f32>,
    pub co2_ppm: Option<u16>,
    pub occupied: Option<bool>,
    pub distance_cm: Option<u16>,
}

/// Read all sensors for all configured rooms.
pub async fn read_all(cfg: &Config) -> Result<Vec<SensorReading>> {
    let mut readings = Vec::new();

    for room in &cfg.rooms {
        let mut reading = SensorReading {
            room_id: room.id.clone(),
            timestamp: Utc::now(),
            temperature_c: None,
            humidity_pct: None,
            pressure_hpa: None,
            co2_ppm: None,
            occupied: None,
            distance_cm: None,
        };

        // BME280 — temperature, humidity, pressure
        if let Some(addr) = room.bme280_addr {
            match read_bme280(addr).await {
                Ok((temp, hum, press)) => {
                    reading.temperature_c = Some(temp);
                    reading.humidity_pct = Some(hum);
                    reading.pressure_hpa = Some(press);
                    debug!(room = %room.id, temp, hum, press, "BME280 read");
                }
                Err(e) => warn!(room = %room.id, error = %e, "BME280 read failed"),
            }
        }

        // DS18B20 — floor/water temperature
        if let Some(ref device_id) = room.ds18b20_id {
            match read_ds18b20(device_id).await {
                Ok(temp) => {
                    // Use DS18B20 as primary temp if BME280 absent
                    if reading.temperature_c.is_none() {
                        reading.temperature_c = Some(temp);
                    }
                    debug!(room = %room.id, temp, "DS18B20 read");
                }
                Err(e) => warn!(room = %room.id, error = %e, "DS18B20 read failed"),
            }
        }

        // MH-Z19B — CO2
        if let Some(ref uart_path) = room.mhz19b_uart {
            match read_mhz19b(uart_path).await {
                Ok(co2) => {
                    reading.co2_ppm = Some(co2);
                    debug!(room = %room.id, co2, "MH-Z19B read");
                }
                Err(e) => warn!(room = %room.id, error = %e, "MH-Z19B read failed"),
            }
        }

        // LD2410 — presence detection
        if let Some(ref uart_path) = room.ld2410_uart {
            match read_ld2410(uart_path).await {
                Ok((occupied, distance)) => {
                    reading.occupied = Some(occupied);
                    reading.distance_cm = Some(distance);
                    debug!(room = %room.id, occupied, distance, "LD2410 read");
                }
                Err(e) => warn!(room = %room.id, error = %e, "LD2410 read failed"),
            }
        }

        readings.push(reading);
    }

    Ok(readings)
}

// --- BME280 via I2C (Bosch compensation algorithm) ---

/// BME280 calibration data
struct Bme280Calib {
    dig_t1: u16,
    dig_t2: i16,
    dig_t3: i16,
    dig_h1: u8,
    dig_h2: i16,
    dig_h3: u8,
    dig_h4: i16,
    dig_h5: i16,
    dig_h6: i8,
    dig_p1: u16,
    dig_p2: i16,
    dig_p3: i16,
    dig_p4: i16,
    dig_p5: i16,
    dig_p6: i16,
    dig_p7: i16,
    dig_p8: i16,
    dig_p9: i16,
}

async fn read_bme280(addr: u16) -> Result<(f32, f32, f32)> {
    // I2C operations are blocking — run in spawn_blocking
    tokio::task::spawn_blocking(move || read_bme280_sync(addr))
        .await
        .context("BME280 task panicked")?
}

fn read_bme280_sync(addr: u16) -> Result<(f32, f32, f32)> {
    let mut i2c = I2c::new().context("Failed to open I2C bus")?;
    i2c.set_slave_address(addr)
        .context("Failed to set I2C address")?;

    // Read chip ID (should be 0x60 for BME280)
    let chip_id = i2c_read_byte(&mut i2c, 0xD0)?;
    if chip_id != 0x60 {
        return Err(anyhow!("BME280 chip ID mismatch: 0x{:02X}", chip_id));
    }

    // Read calibration data
    let calib = read_bme280_calibration(&mut i2c)?;

    // Configure: humidity oversampling x1
    i2c_write_byte(&mut i2c, 0xF2, 0x01)?;
    // Configure: temp x2, pressure x16, forced mode
    i2c_write_byte(&mut i2c, 0xF4, 0b01010101)?;

    // Wait for measurement (typ. 40ms for these settings)
    std::thread::sleep(std::time::Duration::from_millis(50));

    // Read raw data: pressure(0xF7-0xF9), temp(0xFA-0xFC), humidity(0xFD-0xFE)
    let mut buf = [0u8; 8];
    i2c.block_read(0xF7, &mut buf)
        .context("Failed to read BME280 data")?;

    let adc_p = ((buf[0] as i32) << 12) | ((buf[1] as i32) << 4) | ((buf[2] as i32) >> 4);
    let adc_t = ((buf[3] as i32) << 12) | ((buf[4] as i32) << 4) | ((buf[5] as i32) >> 4);
    let adc_h = ((buf[6] as i32) << 8) | (buf[7] as i32);

    // Bosch compensation formulas
    let (temp, t_fine) = compensate_temperature(adc_t, &calib);
    let pressure = compensate_pressure(adc_p, t_fine, &calib);
    let humidity = compensate_humidity(adc_h, t_fine, &calib);

    Ok((temp, humidity, pressure))
}

fn read_bme280_calibration(i2c: &mut I2c) -> Result<Bme280Calib> {
    let mut buf = [0u8; 26];
    i2c.block_read(0x88, &mut buf)
        .context("Failed to read BME280 calibration 0x88")?;

    let dig_h1 = i2c_read_byte(i2c, 0xA1)?;

    let mut buf2 = [0u8; 7];
    i2c.block_read(0xE1, &mut buf2)
        .context("Failed to read BME280 calibration 0xE1")?;

    Ok(Bme280Calib {
        dig_t1: u16::from_le_bytes([buf[0], buf[1]]),
        dig_t2: i16::from_le_bytes([buf[2], buf[3]]),
        dig_t3: i16::from_le_bytes([buf[4], buf[5]]),
        dig_p1: u16::from_le_bytes([buf[6], buf[7]]),
        dig_p2: i16::from_le_bytes([buf[8], buf[9]]),
        dig_p3: i16::from_le_bytes([buf[10], buf[11]]),
        dig_p4: i16::from_le_bytes([buf[12], buf[13]]),
        dig_p5: i16::from_le_bytes([buf[14], buf[15]]),
        dig_p6: i16::from_le_bytes([buf[16], buf[17]]),
        dig_p7: i16::from_le_bytes([buf[18], buf[19]]),
        dig_p8: i16::from_le_bytes([buf[20], buf[21]]),
        dig_p9: i16::from_le_bytes([buf[22], buf[23]]),
        dig_h1,
        dig_h2: i16::from_le_bytes([buf2[0], buf2[1]]),
        dig_h3: buf2[2],
        dig_h4: ((buf2[3] as i16) << 4) | ((buf2[4] as i16) & 0x0F),
        dig_h5: ((buf2[5] as i16) << 4) | ((buf2[4] as i16) >> 4),
        dig_h6: buf2[6] as i8,
    })
}

fn compensate_temperature(adc_t: i32, c: &Bme280Calib) -> (f32, i32) {
    let var1 = ((adc_t >> 3) - ((c.dig_t1 as i32) << 1)) * (c.dig_t2 as i32) >> 11;
    let var2 = (((((adc_t >> 4) - (c.dig_t1 as i32)) * ((adc_t >> 4) - (c.dig_t1 as i32))) >> 12)
        * (c.dig_t3 as i32))
        >> 14;
    let t_fine = var1 + var2;
    let temp = ((t_fine * 5 + 128) >> 8) as f32 / 100.0;
    (temp, t_fine)
}

fn compensate_pressure(adc_p: i32, t_fine: i32, c: &Bme280Calib) -> f32 {
    let mut var1 = (t_fine as i64) - 128000;
    let mut var2 = var1 * var1 * (c.dig_p6 as i64);
    var2 += (var1 * (c.dig_p5 as i64)) << 17;
    var2 += (c.dig_p4 as i64) << 35;
    var1 = ((var1 * var1 * (c.dig_p3 as i64)) >> 8) + ((var1 * (c.dig_p2 as i64)) << 12);
    var1 = ((1i64 << 47) + var1) * (c.dig_p1 as i64) >> 33;
    if var1 == 0 {
        return 0.0;
    }
    let mut p: i64 = 1048576 - adc_p as i64;
    p = (((p << 31) - var2) * 3125) / var1;
    var1 = ((c.dig_p9 as i64) * (p >> 13) * (p >> 13)) >> 25;
    var2 = ((c.dig_p8 as i64) * p) >> 19;
    p = ((p + var1 + var2) >> 8) + ((c.dig_p7 as i64) << 4);
    (p as f32) / 25600.0 // Pa -> hPa
}

fn compensate_humidity(adc_h: i32, t_fine: i32, c: &Bme280Calib) -> f32 {
    let mut var = t_fine - 76800i32;
    if var == 0 {
        return 0.0;
    }
    var = ((((adc_h << 14) - ((c.dig_h4 as i32) << 20) - ((c.dig_h5 as i32) * var)) + 16384)
        >> 15)
        * (((((((var * (c.dig_h6 as i32)) >> 10) * (((var * (c.dig_h3 as i32)) >> 11) + 32768))
            >> 10)
            + 2097152)
            * (c.dig_h2 as i32)
            + 8192)
            >> 14);
    var -= ((((var >> 15) * (var >> 15)) >> 7) * (c.dig_h1 as i32)) >> 4;
    var = var.clamp(0, 419430400);
    (var >> 12) as f32 / 1024.0
}

fn i2c_read_byte(i2c: &mut I2c, reg: u8) -> Result<u8> {
    let mut buf = [0u8; 1];
    i2c.block_read(reg, &mut buf)?;
    Ok(buf[0])
}

fn i2c_write_byte(i2c: &mut I2c, reg: u8, val: u8) -> Result<()> {
    i2c.block_write(reg, &[val])?;
    Ok(())
}

// --- DS18B20 via 1-wire sysfs ---

async fn read_ds18b20(device_id: &str) -> Result<f32> {
    let path = format!("/sys/bus/w1/devices/{}/w1_slave", device_id);
    let content = tokio::fs::read_to_string(&path)
        .await
        .with_context(|| format!("Failed to read DS18B20: {}", path))?;

    // Line 1 must end with "YES" (CRC check)
    let lines: Vec<&str> = content.lines().collect();
    if lines.len() < 2 || !lines[0].ends_with("YES") {
        return Err(anyhow!("DS18B20 CRC check failed"));
    }

    // Line 2 contains "t=XXXXX" in millidegrees
    let t_pos = lines[1]
        .find("t=")
        .ok_or_else(|| anyhow!("DS18B20 missing t= field"))?;
    let millideg: f32 = lines[1][t_pos + 2..]
        .parse()
        .context("DS18B20 parse error")?;

    Ok(millideg / 1000.0)
}

// --- MH-Z19B CO2 via UART ---

async fn read_mhz19b(uart_path: &str) -> Result<u16> {
    let path = uart_path.to_string();
    tokio::task::spawn_blocking(move || read_mhz19b_sync(&path))
        .await
        .context("MH-Z19B task panicked")?
}

fn read_mhz19b_sync(uart_path: &str) -> Result<u16> {
    let mut uart = Uart::with_path(
        Path::new(uart_path),
        9600,
        Parity::None,
        8,
        1,
    )
    .with_context(|| format!("Failed to open UART: {}", uart_path))?;

    uart.set_read_mode(9, std::time::Duration::from_secs(2))?;

    // Command: read CO2 concentration
    let cmd: [u8; 9] = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79];
    uart.write(&cmd).context("MH-Z19B write failed")?;

    let mut buf = [0u8; 9];
    let n = uart.read(&mut buf).context("MH-Z19B read failed")?;
    if n != 9 {
        return Err(anyhow!("MH-Z19B short read: {} bytes", n));
    }

    // Verify checksum
    let checksum = mhz19b_checksum(&buf);
    if buf[8] != checksum {
        return Err(anyhow!(
            "MH-Z19B checksum mismatch: got 0x{:02X}, expected 0x{:02X}",
            buf[8],
            checksum
        ));
    }

    if buf[0] != 0xFF || buf[1] != 0x86 {
        return Err(anyhow!("MH-Z19B unexpected response header"));
    }

    let co2 = ((buf[2] as u16) << 8) | (buf[3] as u16);
    Ok(co2)
}

fn mhz19b_checksum(buf: &[u8; 9]) -> u8 {
    let sum: u8 = buf[1..8].iter().fold(0u8, |acc, &b| acc.wrapping_add(b));
    0xFF - sum + 1
}

// --- LD2410 mmWave presence via UART ---

async fn read_ld2410(uart_path: &str) -> Result<(bool, u16)> {
    let path = uart_path.to_string();
    tokio::task::spawn_blocking(move || read_ld2410_sync(&path))
        .await
        .context("LD2410 task panicked")?
}

fn read_ld2410_sync(uart_path: &str) -> Result<(bool, u16)> {
    let mut uart = Uart::with_path(
        Path::new(uart_path),
        256000,
        Parity::None,
        8,
        1,
    )
    .with_context(|| format!("Failed to open UART: {}", uart_path))?;

    uart.set_read_mode(32, std::time::Duration::from_secs(1))?;

    // Read frames until we get a valid target report
    let mut buf = [0u8; 64];
    let n = uart.read(&mut buf).context("LD2410 read failed")?;

    // Find frame header: 0xF4 0xF3 0xF2 0xF1
    for i in 0..n.saturating_sub(12) {
        if buf[i] == 0xF4 && buf[i + 1] == 0xF3 && buf[i + 2] == 0xF2 && buf[i + 3] == 0xF1 {
            // Target state byte
            let target_state = buf.get(i + 8).copied().unwrap_or(0);
            let occupied = target_state != 0x00;

            // Moving target distance (little-endian u16 at offset 9-10)
            let distance = if i + 10 < n {
                u16::from_le_bytes([buf[i + 9], buf[i + 10]])
            } else {
                0
            };

            return Ok((occupied, distance));
        }
    }

    Err(anyhow!("LD2410 no valid frame found in {} bytes", n))
}
