use anyhow::{Context, Result};
use chrono::{Local, NaiveTime};
use reqwest::Client;
use serde::Deserialize;
use tracing::{debug, error, info, warn};

use crate::config::MusicConfig;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Preset {
    Forest,
    Waves,
    Fire,
    Rain,
    Insects,
    Silent,
}

impl Preset {
    pub fn as_str(&self) -> &'static str {
        match self {
            Preset::Forest => "forest",
            Preset::Waves => "waves",
            Preset::Fire => "fire",
            Preset::Rain => "rain",
            Preset::Insects => "insects",
            Preset::Silent => "silent",
        }
    }
}

/// Select preset based on time of day.
fn time_based_preset() -> Preset {
    let hour = Local::now().time().hour();
    match hour {
        5..=8 => Preset::Forest,   // morning birds
        9..=16 => Preset::Waves,   // daytime ocean
        17..=20 => Preset::Fire,   // evening fireplace
        _ => Preset::Insects,      // night crickets
    }
}

/// Volume scaled by time of day (quiet after 22:00).
fn time_based_volume(default: u8) -> u8 {
    let hour = Local::now().time().hour();
    match hour {
        22..=23 | 0..=5 => (default / 3).max(5),
        6..=7 | 21 => default / 2,
        _ => default,
    }
}

use chrono::Timelike;

pub struct MusicController {
    http: Client,
    koe_urls: Vec<String>,
    current_preset: Preset,
    volume: u8,
    default_volume: u8,
    playing: bool,
}

impl MusicController {
    pub fn new(cfg: &MusicConfig) -> Self {
        MusicController {
            http: Client::builder()
                .timeout(std::time::Duration::from_secs(5))
                .build()
                .expect("HTTP client"),
            koe_urls: cfg.koe_urls.clone(),
            current_preset: Preset::Silent,
            volume: cfg.default_volume,
            default_volume: cfg.default_volume,
            playing: false,
        }
    }

    /// Set environment preset on all Koe speakers.
    pub async fn set_preset(&mut self, preset: Preset) -> Result<()> {
        if preset == self.current_preset && self.playing {
            return Ok(());
        }
        info!(preset = preset.as_str(), "Setting audio preset");
        for url in &self.koe_urls {
            if let Err(e) = self
                .http
                .post(format!("{}/api/preset", url))
                .json(&serde_json::json!({ "preset": preset.as_str() }))
                .send()
                .await
            {
                warn!(url, error = %e, "Failed to set preset on Koe speaker");
            }
        }
        self.current_preset = preset;
        self.playing = preset != Preset::Silent;
        Ok(())
    }

    /// Set volume on all Koe speakers (0-100).
    pub async fn set_volume(&mut self, vol: u8) -> Result<()> {
        let vol = vol.min(100);
        if vol == self.volume {
            return Ok(());
        }
        debug!(volume = vol, "Setting volume");
        for url in &self.koe_urls {
            if let Err(e) = self
                .http
                .post(format!("{}/api/volume", url))
                .json(&serde_json::json!({ "volume": vol }))
                .send()
                .await
            {
                warn!(url, error = %e, "Failed to set volume on Koe speaker");
            }
        }
        self.volume = vol;
        Ok(())
    }

    /// Stop all audio on all speakers.
    pub async fn stop_all(&mut self) -> Result<()> {
        info!("Stopping all audio");
        for url in &self.koe_urls {
            if let Err(e) = self
                .http
                .post(format!("{}/api/stop", url))
                .send()
                .await
            {
                warn!(url, error = %e, "Failed to stop Koe speaker");
            }
        }
        self.current_preset = Preset::Silent;
        self.playing = false;
        Ok(())
    }

    /// Called on guest arrival: start welcome playlist.
    pub async fn on_guest_arrival(&mut self) -> Result<()> {
        info!("Guest arrival — starting welcome audio");
        self.set_volume(self.default_volume).await?;
        self.set_preset(Preset::Forest).await
    }

    /// Called on guest departure: stop all audio.
    pub async fn on_guest_departure(&mut self) -> Result<()> {
        info!("Guest departure — stopping audio");
        self.stop_all().await
    }

    /// Periodic tick: auto-switch preset and volume based on time of day.
    pub async fn tick(&mut self) -> Result<()> {
        if !self.playing {
            return Ok(());
        }
        let target_preset = time_based_preset();
        let target_volume = time_based_volume(self.default_volume);
        self.set_volume(target_volume).await?;
        self.set_preset(target_preset).await
    }
}
