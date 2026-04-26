use anyhow::{Context, Result};
use serde::Deserialize;
use std::path::Path;
use tracing::info;

#[derive(Debug, Deserialize, Clone)]
pub struct Config {
    pub device: DeviceConfig,
    pub cloud: CloudConfig,
    pub rooms: Vec<RoomConfig>,
    pub thresholds: Thresholds,
    pub pins: PinConfig,
    #[serde(default)]
    pub music: MusicConfig,
    #[serde(default)]
    pub notify: NotifyConfig,
    #[serde(default)]
    pub kagi: KagiConfig,
    #[serde(default)]
    pub guest: GuestConfig,
    #[serde(default)]
    pub api: ApiConfig,
}

#[derive(Debug, Deserialize, Clone)]
pub struct DeviceConfig {
    pub id: String,
    pub token: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct CloudConfig {
    pub api_url: String,
    pub ws_url: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct RoomConfig {
    pub id: String,
    pub name: String,
    /// BME280 I2C address (0x76 or 0x77)
    pub bme280_addr: Option<u16>,
    /// DS18B20 1-wire device ID
    pub ds18b20_id: Option<String>,
    /// MH-Z19B UART device path
    pub mhz19b_uart: Option<String>,
    /// LD2410 UART device path
    pub ld2410_uart: Option<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Thresholds {
    pub co2_high_ppm: u16,
    pub humidity_high_pct: f32,
    pub humidity_low_pct: f32,
    pub temp_drift_c: f32,
    pub temp_target_c: f32,
    pub no_motion_minutes: u32,
    pub night_mode_after: String,
    pub solar_surplus_kw: f32,
    pub preheat_hours: u32,
    pub ventilation_minutes: u32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PinConfig {
    pub ventilation_fan: u8,
    pub exhaust_fan: u8,
    pub hvac_relay: u8,
    pub lights_main: u8,
    pub lights_dim: u8,
    pub ev_charger: u8,
    pub welcome_lights: u8,
}

#[derive(Debug, Deserialize, Clone)]
pub struct MusicConfig {
    pub koe_urls: Vec<String>,
    pub default_volume: u8,
}

impl Default for MusicConfig {
    fn default() -> Self {
        MusicConfig {
            koe_urls: vec!["http://192.168.1.100:8080".into()],
            default_volume: 40,
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct NotifyConfig {
    pub line_token: String,
    pub telegram_bot_token: String,
    pub telegram_chat_id: String,
}

impl Default for NotifyConfig {
    fn default() -> Self {
        NotifyConfig {
            line_token: String::new(),
            telegram_bot_token: String::new(),
            telegram_chat_id: String::new(),
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct KagiConfig {
    pub base_url: String,
    pub api_key: String,
}

impl Default for KagiConfig {
    fn default() -> Self {
        KagiConfig {
            base_url: "http://localhost:3000".into(),
            api_key: String::new(),
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct GuestConfig {
    pub wifi_ssid: String,
    pub wifi_password: String,
    pub checkout_time: String,
    pub area_guide: Vec<String>,
    pub emergency_phone: String,
}

impl Default for GuestConfig {
    fn default() -> Self {
        GuestConfig {
            wifi_ssid: "SOLUNA-GUEST".into(),
            wifi_password: String::new(),
            checkout_time: "10:00".into(),
            area_guide: vec!["Nearest convenience store: 500m".into()],
            emergency_phone: "110".into(),
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct ApiConfig {
    pub port: u16,
    pub token: String,
}

impl Default for ApiConfig {
    fn default() -> Self {
        ApiConfig {
            port: 8081,
            token: String::new(),
        }
    }
}

impl Config {
    pub fn load(path: &Path) -> Result<Self> {
        // Try file first, then fall back to env-only
        let mut cfg: Config = if path.exists() {
            let content = std::fs::read_to_string(path)
                .with_context(|| format!("Failed to read config: {}", path.display()))?;
            serde_yaml::from_str(&content)
                .with_context(|| format!("Failed to parse config: {}", path.display()))?
        } else {
            info!(path = %path.display(), "Config file not found, using defaults + env vars");
            Self::defaults()
        };

        // Override with env vars
        if let Ok(v) = std::env::var("NEURO_DEVICE_ID") {
            cfg.device.id = v;
        }
        if let Ok(v) = std::env::var("NEURO_DEVICE_TOKEN") {
            cfg.device.token = v;
        }
        if let Ok(v) = std::env::var("NEURO_API_URL") {
            cfg.cloud.api_url = v;
        }
        if let Ok(v) = std::env::var("NEURO_WS_URL") {
            cfg.cloud.ws_url = v;
        }

        Ok(cfg)
    }

    fn defaults() -> Self {
        Config {
            device: DeviceConfig {
                id: "neuro-001".into(),
                token: String::new(),
            },
            cloud: CloudConfig {
                api_url: "https://solun.art/api/neuro".into(),
                ws_url: "wss://solun.art/ws/neuro/live".into(),
            },
            rooms: vec![RoomConfig {
                id: "main".into(),
                name: "Main Cabin".into(),
                bme280_addr: Some(0x76),
                ds18b20_id: None,
                mhz19b_uart: Some("/dev/ttyS0".into()),
                ld2410_uart: Some("/dev/ttyAMA0".into()),
            }],
            thresholds: Thresholds {
                co2_high_ppm: 1000,
                humidity_high_pct: 75.0,
                humidity_low_pct: 65.0,
                temp_drift_c: 2.0,
                temp_target_c: 24.0,
                no_motion_minutes: 30,
                night_mode_after: "22:00".into(),
                solar_surplus_kw: 1.5,
                preheat_hours: 2,
                ventilation_minutes: 15,
            },
            pins: PinConfig {
                ventilation_fan: 17,
                exhaust_fan: 27,
                hvac_relay: 22,
                lights_main: 23,
                lights_dim: 24,
                ev_charger: 25,
                welcome_lights: 5,
            },
            music: MusicConfig::default(),
            notify: NotifyConfig::default(),
            kagi: KagiConfig::default(),
            guest: GuestConfig::default(),
            api: ApiConfig::default(),
        }
    }
}
