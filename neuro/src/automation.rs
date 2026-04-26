use anyhow::Result;
use chrono::{Local, NaiveTime, Utc};
use rppal::gpio::{Gpio, OutputPin};
use std::collections::HashMap;
use tokio::time::{Duration, Instant};
use tracing::{info, warn};

use crate::config::Config;
use crate::sensors::SensorReading;

/// Manages GPIO relay pins with timed auto-off.
struct RelayController {
    pins: HashMap<String, OutputPin>,
    timers: HashMap<String, Instant>,
}

impl RelayController {
    fn new(cfg: &Config) -> Self {
        let gpio = Gpio::new().expect("Failed to initialize GPIO");
        let mut pins = HashMap::new();

        let pin_map = [
            ("ventilation_fan", cfg.pins.ventilation_fan),
            ("exhaust_fan", cfg.pins.exhaust_fan),
            ("hvac_relay", cfg.pins.hvac_relay),
            ("lights_main", cfg.pins.lights_main),
            ("lights_dim", cfg.pins.lights_dim),
            ("ev_charger", cfg.pins.ev_charger),
            ("welcome_lights", cfg.pins.welcome_lights),
        ];

        for (name, pin_num) in pin_map {
            match gpio.get(pin_num) {
                Ok(pin) => {
                    pins.insert(name.to_string(), pin.into_output_low());
                }
                Err(e) => {
                    warn!(pin = pin_num, name, error = %e, "Failed to initialize GPIO pin");
                }
            }
        }

        RelayController {
            pins,
            timers: HashMap::new(),
        }
    }

    /// Turn relay ON with optional auto-off timer (in minutes).
    fn relay_on(&mut self, name: &str, auto_off_minutes: Option<u32>, reason: &str) {
        if let Some(pin) = self.pins.get_mut(name) {
            if pin.is_set_low() {
                pin.set_high();
                info!(relay = name, reason, "Relay ON");
                if let Some(mins) = auto_off_minutes {
                    self.timers
                        .insert(name.to_string(), Instant::now() + Duration::from_secs(mins as u64 * 60));
                }
            }
        }
    }

    /// Turn relay OFF.
    fn relay_off(&mut self, name: &str, reason: &str) {
        if let Some(pin) = self.pins.get_mut(name) {
            if pin.is_set_high() {
                pin.set_low();
                info!(relay = name, reason, "Relay OFF");
                self.timers.remove(name);
            }
        }
    }

    /// Check and execute expired timers.
    fn check_timers(&mut self) {
        let now = Instant::now();
        let expired: Vec<String> = self
            .timers
            .iter()
            .filter(|(_, deadline)| now >= **deadline)
            .map(|(name, _)| name.clone())
            .collect();

        for name in expired {
            self.relay_off(&name, "タイマー自動OFF");
        }
    }

    /// Set all relays to LOW on shutdown.
    fn all_off(&mut self) {
        for (name, pin) in self.pins.iter_mut() {
            if pin.is_set_high() {
                pin.set_low();
                info!(relay = name, "Shutdown: relay OFF");
            }
        }
    }
}

pub struct AutomationEngine {
    relays: RelayController,
    co2_high_ppm: u16,
    humidity_high_pct: f32,
    humidity_low_pct: f32,
    temp_drift_c: f32,
    temp_target_c: f32,
    no_motion_minutes: u32,
    night_mode_after: NaiveTime,
    solar_surplus_kw: f32,
    ventilation_minutes: u32,
    last_motion: HashMap<String, chrono::DateTime<Utc>>,
    actions_log: Vec<ActionLog>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ActionLog {
    pub timestamp: chrono::DateTime<Utc>,
    pub room_id: String,
    pub action: String,
    pub reason: String,
}

impl AutomationEngine {
    pub fn new(cfg: &Config) -> Self {
        let night_time = NaiveTime::parse_from_str(&cfg.thresholds.night_mode_after, "%H:%M")
            .unwrap_or_else(|_| NaiveTime::from_hms_opt(22, 0, 0).unwrap());

        AutomationEngine {
            relays: RelayController::new(cfg),
            co2_high_ppm: cfg.thresholds.co2_high_ppm,
            humidity_high_pct: cfg.thresholds.humidity_high_pct,
            humidity_low_pct: cfg.thresholds.humidity_low_pct,
            temp_drift_c: cfg.thresholds.temp_drift_c,
            temp_target_c: cfg.thresholds.temp_target_c,
            no_motion_minutes: cfg.thresholds.no_motion_minutes,
            night_mode_after: night_time,
            solar_surplus_kw: cfg.thresholds.solar_surplus_kw,
            ventilation_minutes: cfg.thresholds.ventilation_minutes,
            last_motion: HashMap::new(),
            actions_log: Vec::new(),
        }
    }

    /// Evaluate all automation rules against current sensor readings.
    pub async fn evaluate(&mut self, readings: &[SensorReading]) -> Result<()> {
        // Check auto-off timers first
        self.relays.check_timers();

        for reading in readings {
            self.rule_co2(reading);
            self.rule_humidity(reading);
            self.rule_temperature(reading);
            self.rule_presence(reading);
            self.rule_night_mode(reading);
        }

        Ok(())
    }

    /// CO2 > threshold → ventilation fan ON (timed)
    fn rule_co2(&mut self, r: &SensorReading) {
        if let Some(co2) = r.co2_ppm {
            if co2 > self.co2_high_ppm {
                let reason = format!(
                    "CO2 {}ppm > {}ppm → 換気ファン自動起動 ({}分タイマー)",
                    co2, self.co2_high_ppm, self.ventilation_minutes
                );
                self.relays
                    .relay_on("ventilation_fan", Some(self.ventilation_minutes), &reason);
                self.log_action(&r.room_id, "ventilation_fan_on", &reason);
            }
        }
    }

    /// Humidity > high → exhaust ON; Humidity < low → exhaust OFF
    fn rule_humidity(&mut self, r: &SensorReading) {
        if let Some(hum) = r.humidity_pct {
            if hum > self.humidity_high_pct {
                let reason = format!(
                    "浴室湿度 {:.0}% > {:.0}% → 換気ファン自動起動 ({}分タイマー)",
                    hum, self.humidity_high_pct, self.ventilation_minutes
                );
                self.relays
                    .relay_on("exhaust_fan", Some(self.ventilation_minutes), &reason);
                self.log_action(&r.room_id, "exhaust_fan_on", &reason);
            } else if hum < self.humidity_low_pct {
                let reason = format!(
                    "湿度 {:.0}% < {:.0}% → 排気ファン自動停止",
                    hum, self.humidity_low_pct
                );
                self.relays.relay_off("exhaust_fan", &reason);
            }
        }
    }

    /// Temperature drift from target → HVAC adjust
    fn rule_temperature(&mut self, r: &SensorReading) {
        if let Some(temp) = r.temperature_c {
            let drift = (temp - self.temp_target_c).abs();
            if drift > self.temp_drift_c {
                let reason = format!(
                    "室温 {:.1}°C (目標 {:.1}°C, 差 {:.1}°C) → HVAC調整",
                    temp, self.temp_target_c, drift
                );
                self.relays.relay_on("hvac_relay", None, &reason);
                self.log_action(&r.room_id, "hvac_adjust", &reason);
            } else {
                // Within range — turn off HVAC boost
                self.relays
                    .relay_off("hvac_relay", "室温が目標範囲内 → HVAC通常運転");
            }
        }
    }

    /// Presence tracking + welcome mode
    fn rule_presence(&mut self, r: &SensorReading) {
        if let Some(occupied) = r.occupied {
            if occupied {
                let prev = self.last_motion.get(&r.room_id);
                let is_new_arrival = prev
                    .map(|t| Utc::now().signed_duration_since(*t).num_minutes() > 5)
                    .unwrap_or(true);

                self.last_motion.insert(r.room_id.clone(), Utc::now());

                if is_new_arrival {
                    let reason = format!(
                        "入口で人体検知 (距離 {}cm) → ウェルカムモード起動",
                        r.distance_cm.unwrap_or(0)
                    );
                    self.relays
                        .relay_on("welcome_lights", Some(10), &reason);
                    self.relays.relay_on("hvac_relay", None, &reason);
                    self.log_action(&r.room_id, "welcome_mode", &reason);
                }
            }
        }
    }

    /// Night mode: no motion after 22:00 for N minutes → dim lights, quiet HVAC
    fn rule_night_mode(&mut self, r: &SensorReading) {
        let now_local = Local::now().time();
        if now_local < self.night_mode_after {
            return;
        }

        let minutes_since_motion = self
            .last_motion
            .get(&r.room_id)
            .map(|t| Utc::now().signed_duration_since(*t).num_minutes())
            .unwrap_or(i64::MAX);

        if minutes_since_motion >= self.no_motion_minutes as i64 {
            let reason = format!(
                "{}以降 {}分間モーションなし → ナイトモード (照明減光, HVAC静音)",
                self.night_mode_after.format("%H:%M"),
                minutes_since_motion
            );
            self.relays.relay_off("lights_main", &reason);
            self.relays.relay_on("lights_dim", None, &reason);
            self.log_action(&r.room_id, "night_mode", &reason);
        }
    }

    fn log_action(&mut self, room_id: &str, action: &str, reason: &str) {
        self.actions_log.push(ActionLog {
            timestamp: Utc::now(),
            room_id: room_id.to_string(),
            action: action.to_string(),
            reason: reason.to_string(),
        });

        // Keep last 1000 actions in memory
        if self.actions_log.len() > 1000 {
            self.actions_log.drain(0..500);
        }
    }

    /// Drain pending action logs for cloud sync.
    pub fn drain_actions(&mut self) -> Vec<ActionLog> {
        std::mem::take(&mut self.actions_log)
    }

    /// Graceful shutdown — all relays off.
    pub async fn shutdown(&mut self) {
        info!("Automation engine shutting down — all relays OFF");
        self.relays.all_off();
    }
}
