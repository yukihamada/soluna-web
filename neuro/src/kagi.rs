use anyhow::{Context, Result};
use chrono::{DateTime, Duration, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tracing::{debug, info, warn};

use crate::config::KagiConfig;

#[derive(Debug, Clone, Deserialize)]
pub struct Reservation {
    pub id: String,
    pub check_in: DateTime<Utc>,
    pub check_out: DateTime<Utc>,
    pub guest_name: String,
    pub room_id: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BookingStatus {
    Vacant,
    Occupied,
    Checkout, // within 2 hours of check-out
}

#[derive(Debug, Serialize)]
struct DeviceStatus {
    device_id: String,
    status: String,
    uptime_secs: u64,
    sensor_count: usize,
}

pub struct KagiClient {
    http: Client,
    base_url: String,
    api_key: String,
    device_id: String,
    cached_reservations: Vec<Reservation>,
    last_fetch: Option<DateTime<Utc>>,
}

impl KagiClient {
    pub fn new(cfg: &KagiConfig, device_id: &str) -> Self {
        KagiClient {
            http: Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .build()
                .expect("HTTP client"),
            base_url: cfg.base_url.clone(),
            api_key: cfg.api_key.clone(),
            device_id: device_id.to_string(),
            cached_reservations: Vec::new(),
            last_fetch: None,
        }
    }

    /// Fetch upcoming reservations from KAGI.
    pub async fn fetch_reservations(&mut self) -> Result<&[Reservation]> {
        // Cache for 5 minutes
        if let Some(last) = self.last_fetch {
            if Utc::now() - last < Duration::minutes(5) {
                return Ok(&self.cached_reservations);
            }
        }

        let resp = self
            .http
            .get(format!("{}/api/reservations", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .query(&[("device_id", &self.device_id)])
            .send()
            .await
            .context("KAGI reservations fetch failed")?;

        if resp.status().is_success() {
            self.cached_reservations = resp
                .json()
                .await
                .context("KAGI reservations parse failed")?;
            self.last_fetch = Some(Utc::now());
            debug!(count = self.cached_reservations.len(), "KAGI reservations fetched");
        } else {
            warn!(status = %resp.status(), "KAGI reservations fetch failed");
        }

        Ok(&self.cached_reservations)
    }

    /// Report device health to KAGI.
    pub async fn report_status(&self, uptime_secs: u64, sensor_count: usize) -> Result<()> {
        let payload = DeviceStatus {
            device_id: self.device_id.clone(),
            status: "healthy".to_string(),
            uptime_secs,
            sensor_count,
        };

        let resp = self
            .http
            .post(format!("{}/api/device/status", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await
            .context("KAGI status report failed")?;

        if !resp.status().is_success() {
            warn!(status = %resp.status(), "KAGI status report failed");
        }
        Ok(())
    }

    /// Determine current booking status for a room.
    pub fn booking_status(&self, room_id: &str) -> BookingStatus {
        let now = Utc::now();
        for res in &self.cached_reservations {
            if res.room_id != room_id {
                continue;
            }
            if now >= res.check_in && now <= res.check_out {
                if res.check_out - now < Duration::hours(2) {
                    return BookingStatus::Checkout;
                }
                return BookingStatus::Occupied;
            }
        }
        BookingStatus::Vacant
    }

    /// Check if pre-heating should start (within preheat_hours before next check-in).
    pub fn should_preheat(&self, room_id: &str, preheat_hours: u32) -> bool {
        let now = Utc::now();
        let window = Duration::hours(preheat_hours as i64);
        self.cached_reservations.iter().any(|r| {
            r.room_id == room_id && r.check_in > now && r.check_in - now <= window
        })
    }

    /// Light scene name based on booking status.
    pub fn light_scene(status: BookingStatus) -> &'static str {
        match status {
            BookingStatus::Vacant => "energy_save",
            BookingStatus::Occupied => "welcome",
            BookingStatus::Checkout => "bright",
        }
    }

    /// Generate a lock code for a reservation (simple hash-based).
    pub fn lock_code(reservation: &Reservation) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        let mut hasher = DefaultHasher::new();
        reservation.id.hash(&mut hasher);
        reservation.check_in.timestamp().hash(&mut hasher);
        let hash = hasher.finish();
        // 6-digit numeric code
        format!("{:06}", hash % 1_000_000)
    }
}
