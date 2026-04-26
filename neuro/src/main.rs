mod api;
mod automation;
mod cloud;
mod config;
mod guest;
mod kagi;
mod music;
mod notify;
mod sensors;

use anyhow::Result;
use clap::Parser;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::signal;
use tokio::sync::{broadcast, RwLock};
use tracing::{error, info};

#[derive(Parser)]
#[command(name = "soluna-neuro", about = "SOLUNA NEURO AI CABIN controller")]
struct Cli {
    /// Path to config file
    #[arg(short, long, default_value = "config.yaml")]
    config: PathBuf,

    /// Log level (trace, debug, info, warn, error)
    #[arg(short, long, default_value = "info")]
    log_level: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Initialize structured logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&cli.log_level)),
        )
        .json()
        .init();

    info!(version = env!("CARGO_PKG_VERSION"), "SOLUNA NEURO starting");

    // Load configuration
    let cfg = config::Config::load(&cli.config)?;
    info!(
        device_id = %cfg.device.id,
        room_count = cfg.rooms.len(),
        "Configuration loaded"
    );

    let cfg = Arc::new(cfg);
    let start_time = std::time::Instant::now();

    // Shutdown signal
    let (shutdown_tx, _) = broadcast::channel::<()>(1);

    // Shared sensor state
    let sensor_state = Arc::new(RwLock::new(Vec::<sensors::SensorReading>::new()));

    // Shared actions log (for API)
    let actions_log = Arc::new(RwLock::new(Vec::<automation::ActionLog>::new()));

    // Notification client
    let notify_client = Arc::new(RwLock::new(notify::NotifyClient::new(&cfg.notify)));

    // Start sensor read loop (every 2s)
    let sensor_handle = {
        let cfg = Arc::clone(&cfg);
        let state = Arc::clone(&sensor_state);
        let mut shutdown_rx = shutdown_tx.subscribe();
        tokio::spawn(async move {
            info!("Sensor loop started");
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(2));
            loop {
                tokio::select! {
                    _ = interval.tick() => {
                        match sensors::read_all(&cfg).await {
                            Ok(readings) => {
                                let count = readings.len();
                                *state.write().await = readings;
                                tracing::debug!(count, "Sensor readings updated");
                            }
                            Err(e) => error!(error = %e, "Sensor read cycle failed"),
                        }
                    }
                    _ = shutdown_rx.recv() => {
                        info!("Sensor loop stopping");
                        break;
                    }
                }
            }
        })
    };

    // Start automation engine
    let automation_handle = {
        let cfg = Arc::clone(&cfg);
        let state = Arc::clone(&sensor_state);
        let log = Arc::clone(&actions_log);
        let mut shutdown_rx = shutdown_tx.subscribe();
        tokio::spawn(async move {
            info!("Automation engine started");
            let mut engine = automation::AutomationEngine::new(&cfg);
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(2));
            loop {
                tokio::select! {
                    _ = interval.tick() => {
                        let readings = state.read().await.clone();
                        if let Err(e) = engine.evaluate(&readings).await {
                            error!(error = %e, "Automation evaluation failed");
                        }
                        // Copy actions to shared log for API
                        let new_actions = engine.drain_actions();
                        if !new_actions.is_empty() {
                            let mut log = log.write().await;
                            log.extend(new_actions);
                            // Keep last 1000
                            if log.len() > 1000 {
                                log.drain(0..log.len() - 1000);
                            }
                        }
                    }
                    _ = shutdown_rx.recv() => {
                        info!("Automation engine stopping");
                        engine.shutdown().await;
                        break;
                    }
                }
            }
        })
    };

    // Start cloud sync (batch every 60s + WebSocket real-time)
    let cloud_handle = {
        let cfg = Arc::clone(&cfg);
        let state = Arc::clone(&sensor_state);
        let mut shutdown_rx = shutdown_tx.subscribe();
        tokio::spawn(async move {
            info!("Cloud sync started");
            let mut client = cloud::CloudClient::new(&cfg);
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
            loop {
                tokio::select! {
                    _ = interval.tick() => {
                        let readings = state.read().await.clone();
                        if let Err(e) = client.sync_telemetry(&readings).await {
                            error!(error = %e, "Cloud sync failed, buffering offline");
                        }
                    }
                    _ = shutdown_rx.recv() => {
                        info!("Cloud sync stopping");
                        client.flush_buffer().await;
                        break;
                    }
                }
            }
        })
    };

    // Start music controller (tick every 60s for time-based switching)
    let music_handle = {
        let cfg = Arc::clone(&cfg);
        let mut shutdown_rx = shutdown_tx.subscribe();
        tokio::spawn(async move {
            info!("Music controller started");
            let mut controller = music::MusicController::new(&cfg.music);
            let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
            loop {
                tokio::select! {
                    _ = interval.tick() => {
                        if let Err(e) = controller.tick().await {
                            error!(error = %e, "Music controller tick failed");
                        }
                    }
                    _ = shutdown_rx.recv() => {
                        info!("Music controller stopping");
                        let _ = controller.stop_all().await;
                        break;
                    }
                }
            }
        })
    };

    // Start guest web server (port 8080)
    let guest_handle = {
        let cfg = Arc::clone(&cfg);
        tokio::spawn(async move {
            if let Err(e) = guest::start(&cfg.guest).await {
                error!(error = %e, "Guest web server failed");
            }
        })
    };

    // Start dashboard API server (port 8081)
    let api_handle = {
        let cfg = Arc::clone(&cfg);
        let api_state = api::ApiState {
            sensor_state: Arc::clone(&sensor_state),
            actions_log: Arc::clone(&actions_log),
            token: cfg.api.token.clone(),
            start_time,
        };
        tokio::spawn(async move {
            if let Err(e) = api::start(&cfg.api, api_state).await {
                error!(error = %e, "Dashboard API server failed");
            }
        })
    };

    // Wait for SIGTERM / SIGINT
    info!("SOLUNA NEURO ready — waiting for shutdown signal");
    signal::ctrl_c().await?;
    info!("Shutdown signal received");

    // Broadcast shutdown
    let _ = shutdown_tx.send(());

    // Wait for all tasks
    let _ = tokio::join!(
        sensor_handle,
        automation_handle,
        cloud_handle,
        music_handle,
    );

    // Guest and API servers will stop when the runtime drops
    drop(guest_handle);
    drop(api_handle);

    info!("SOLUNA NEURO shut down cleanly");
    Ok(())
}
