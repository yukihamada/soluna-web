use anyhow::{Context, Result};
use reqwest::Client;
use std::collections::HashMap;
use tokio::time::Instant;
use tracing::{debug, error, info, warn};

use crate::config::NotifyConfig;

const RATE_LIMIT_SECS: u64 = 300; // 5 minutes per event type

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Level {
    Critical, // LINE + Telegram
    Warning,  // LINE only
    Info,     // log only
}

pub struct NotifyClient {
    http: Client,
    line_token: String,
    telegram_bot_token: String,
    telegram_chat_id: String,
    last_sent: HashMap<String, Instant>,
}

impl NotifyClient {
    pub fn new(cfg: &NotifyConfig) -> Self {
        NotifyClient {
            http: Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .build()
                .expect("HTTP client"),
            line_token: cfg.line_token.clone(),
            telegram_bot_token: cfg.telegram_bot_token.clone(),
            telegram_chat_id: cfg.telegram_chat_id.clone(),
            last_sent: HashMap::new(),
        }
    }

    /// Send notification with rate limiting.
    pub async fn send(&mut self, event_type: &str, level: Level, message: &str) {
        // Rate limit check
        if let Some(last) = self.last_sent.get(event_type) {
            if last.elapsed().as_secs() < RATE_LIMIT_SECS {
                debug!(event_type, "Notification rate-limited, skipping");
                return;
            }
        }

        match level {
            Level::Critical => {
                self.send_line(message).await;
                self.send_telegram(message).await;
            }
            Level::Warning => {
                self.send_line(message).await;
            }
            Level::Info => {
                info!(event_type, message, "Notification (info level, log only)");
            }
        }

        self.last_sent.insert(event_type.to_string(), Instant::now());
    }

    async fn send_line(&self, message: &str) {
        if self.line_token.is_empty() {
            return;
        }
        let res = self
            .http
            .post("https://notify-api.line.me/api/notify")
            .header("Authorization", format!("Bearer {}", self.line_token))
            .form(&[("message", message)])
            .send()
            .await;
        match res {
            Ok(r) if r.status().is_success() => debug!("LINE notification sent"),
            Ok(r) => warn!(status = %r.status(), "LINE notification failed"),
            Err(e) => error!(error = %e, "LINE notification request failed"),
        }
    }

    async fn send_telegram(&self, message: &str) {
        if self.telegram_bot_token.is_empty() || self.telegram_chat_id.is_empty() {
            return;
        }
        let url = format!(
            "https://api.telegram.org/bot{}/sendMessage",
            self.telegram_bot_token
        );
        let res = self
            .http
            .post(&url)
            .json(&serde_json::json!({
                "chat_id": self.telegram_chat_id,
                "text": message,
                "parse_mode": "HTML"
            }))
            .send()
            .await;
        match res {
            Ok(r) if r.status().is_success() => debug!("Telegram notification sent"),
            Ok(r) => warn!(status = %r.status(), "Telegram notification failed"),
            Err(e) => error!(error = %e, "Telegram notification request failed"),
        }
    }
}

// --- Notification templates ---

pub fn water_leak(room: &str) -> (Level, String) {
    (
        Level::Critical,
        format!("\n[SOLUNA NEURO] 漏水検知\n場所: {}\n即座に確認してください。", room),
    )
}

pub fn smoke_detected(room: &str) -> (Level, String) {
    (
        Level::Critical,
        format!("\n[SOLUNA NEURO] 煙感知\n場所: {}\n火災の可能性 — 直ちに確認してください。", room),
    )
}

pub fn intrusion(room: &str, distance_cm: u16) -> (Level, String) {
    (
        Level::Critical,
        format!(
            "\n[SOLUNA NEURO] 不審な人体検知\n場所: {}\n距離: {}cm\n予約外の侵入の可能性があります。",
            room, distance_cm
        ),
    )
}

pub fn temperature_alert(room: &str, temp: f32, threshold: f32) -> (Level, String) {
    (
        Level::Warning,
        format!(
            "\n[SOLUNA NEURO] 温度異常\n場所: {}\n現在: {:.1}°C (閾値: {:.1}°C)",
            room, temp, threshold
        ),
    )
}

pub fn guest_arrival(room: &str) -> (Level, String) {
    (
        Level::Info,
        format!("\n[SOLUNA NEURO] ゲスト到着\n場所: {}\nウェルカムモードを起動しました。", room),
    )
}
