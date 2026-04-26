use anyhow::{Context, Result};
use futures_util::{SinkExt, StreamExt};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::path::PathBuf;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use tracing::{debug, error, info, warn};

use crate::config::Config;
use crate::sensors::SensorReading;

const OFFLINE_BUFFER_PATH: &str = "/var/lib/soluna-neuro/offline_buffer.json";
const MAX_BUFFER_SIZE: usize = 10_000;

pub struct CloudClient {
    http: Client,
    api_url: String,
    ws_url: String,
    token: String,
    device_id: String,
    offline_buffer: VecDeque<SensorReading>,
}

#[derive(Debug, Serialize)]
struct TelemetryBatch {
    device_id: String,
    readings: Vec<SensorReading>,
}

#[derive(Debug, Serialize)]
struct EventBatch {
    device_id: String,
    events: Vec<EventPayload>,
}

#[derive(Debug, Serialize)]
pub struct EventPayload {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub room_id: String,
    pub action: String,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct RemoteConfig {
    pub co2_high_ppm: Option<u16>,
    pub humidity_high_pct: Option<f32>,
    pub temp_target_c: Option<f32>,
}

#[derive(Debug, Deserialize)]
pub struct Reservation {
    pub check_in: chrono::DateTime<chrono::Utc>,
    pub check_out: chrono::DateTime<chrono::Utc>,
    pub room_id: String,
    pub guest_name: String,
}

impl CloudClient {
    pub fn new(cfg: &Config) -> Self {
        let http = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        let mut client = CloudClient {
            http,
            api_url: cfg.cloud.api_url.clone(),
            ws_url: cfg.cloud.ws_url.clone(),
            token: cfg.device.token.clone(),
            device_id: cfg.device.id.clone(),
            offline_buffer: VecDeque::new(),
        };

        // Load persisted offline buffer
        client.load_buffer();
        client
    }

    /// POST /api/neuro/telemetry — batch sensor data
    pub async fn sync_telemetry(&mut self, readings: &[SensorReading]) -> Result<()> {
        // Add current readings to buffer
        for r in readings {
            self.offline_buffer.push_back(r.clone());
        }

        // Cap buffer size
        while self.offline_buffer.len() > MAX_BUFFER_SIZE {
            self.offline_buffer.pop_front();
        }

        // Try to flush everything
        let batch: Vec<SensorReading> = self.offline_buffer.iter().cloned().collect();
        if batch.is_empty() {
            return Ok(());
        }

        let payload = TelemetryBatch {
            device_id: self.device_id.clone(),
            readings: batch,
        };

        let resp = self
            .http
            .post(format!("{}/telemetry", self.api_url))
            .bearer_auth(&self.token)
            .json(&payload)
            .send()
            .await
            .context("Telemetry POST failed")?;

        if resp.status().is_success() {
            let count = self.offline_buffer.len();
            self.offline_buffer.clear();
            info!(count, "Telemetry synced to cloud");
            Ok(())
        } else {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            warn!(
                status = %status,
                body = %body,
                buffered = self.offline_buffer.len(),
                "Telemetry sync failed, data buffered offline"
            );
            self.persist_buffer();
            Err(anyhow::anyhow!("Telemetry sync failed: {}", status))
        }
    }

    /// POST /api/neuro/events — log automation actions
    pub async fn send_events(&self, events: Vec<EventPayload>) -> Result<()> {
        if events.is_empty() {
            return Ok(());
        }

        let payload = EventBatch {
            device_id: self.device_id.clone(),
            events,
        };

        let resp = self
            .http
            .post(format!("{}/events", self.api_url))
            .bearer_auth(&self.token)
            .json(&payload)
            .send()
            .await
            .context("Events POST failed")?;

        if resp.status().is_success() {
            debug!("Events sent to cloud");
            Ok(())
        } else {
            warn!(status = %resp.status(), "Events sync failed");
            Err(anyhow::anyhow!("Events sync failed"))
        }
    }

    /// GET /api/neuro/config — fetch remote automation thresholds
    pub async fn fetch_config(&self) -> Result<RemoteConfig> {
        let resp = self
            .http
            .get(format!("{}/config", self.api_url))
            .bearer_auth(&self.token)
            .query(&[("device_id", &self.device_id)])
            .send()
            .await
            .context("Config GET failed")?;

        resp.json::<RemoteConfig>()
            .await
            .context("Config parse failed")
    }

    /// GET /api/neuro/reservations — upcoming check-ins for predictive control
    pub async fn fetch_reservations(&self) -> Result<Vec<Reservation>> {
        let resp = self
            .http
            .get(format!("{}/reservations", self.api_url))
            .bearer_auth(&self.token)
            .query(&[("device_id", &self.device_id)])
            .send()
            .await
            .context("Reservations GET failed")?;

        resp.json::<Vec<Reservation>>()
            .await
            .context("Reservations parse failed")
    }

    /// WebSocket /ws/neuro/live — real-time stream to dashboard
    pub async fn start_websocket(&self, mut rx: tokio::sync::broadcast::Receiver<SensorReading>) {
        let url = format!("{}?token={}&device_id={}", self.ws_url, self.token, self.device_id);

        loop {
            match connect_async(&url).await {
                Ok((ws_stream, _)) => {
                    info!("WebSocket connected to cloud dashboard");
                    let (mut write, mut read) = ws_stream.split();

                    loop {
                        tokio::select! {
                            // Forward sensor readings to cloud
                            Ok(reading) = rx.recv() => {
                                let json = serde_json::to_string(&reading).unwrap_or_default();
                                if let Err(e) = write.send(Message::Text(json.into())).await {
                                    error!(error = %e, "WebSocket send failed");
                                    break;
                                }
                            }
                            // Handle incoming messages (commands from dashboard)
                            msg = read.next() => {
                                match msg {
                                    Some(Ok(Message::Text(text))) => {
                                        debug!(msg = %text, "WebSocket message from cloud");
                                        // TODO: Handle remote commands (relay override, config update)
                                    }
                                    Some(Ok(Message::Close(_))) | None => {
                                        info!("WebSocket closed by server");
                                        break;
                                    }
                                    Some(Err(e)) => {
                                        error!(error = %e, "WebSocket error");
                                        break;
                                    }
                                    _ => {}
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    error!(error = %e, "WebSocket connection failed");
                }
            }

            // Reconnect after 10s
            info!("WebSocket reconnecting in 10s...");
            tokio::time::sleep(std::time::Duration::from_secs(10)).await;
        }
    }

    /// Flush offline buffer before shutdown.
    pub async fn flush_buffer(&self) {
        if !self.offline_buffer.is_empty() {
            info!(
                buffered = self.offline_buffer.len(),
                "Persisting offline buffer to disk"
            );
            self.persist_buffer();
        }
    }

    fn persist_buffer(&self) {
        let path = PathBuf::from(OFFLINE_BUFFER_PATH);
        if let Some(parent) = path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }
        match serde_json::to_string(&self.offline_buffer) {
            Ok(json) => {
                if let Err(e) = std::fs::write(&path, json) {
                    error!(error = %e, "Failed to persist offline buffer");
                }
            }
            Err(e) => error!(error = %e, "Failed to serialize offline buffer"),
        }
    }

    fn load_buffer(&mut self) {
        let path = PathBuf::from(OFFLINE_BUFFER_PATH);
        if path.exists() {
            match std::fs::read_to_string(&path) {
                Ok(json) => match serde_json::from_str::<VecDeque<SensorReading>>(&json) {
                    Ok(buf) => {
                        info!(count = buf.len(), "Loaded offline buffer from disk");
                        self.offline_buffer = buf;
                    }
                    Err(e) => warn!(error = %e, "Failed to parse offline buffer"),
                },
                Err(e) => warn!(error = %e, "Failed to read offline buffer file"),
            }
        }
    }
}
