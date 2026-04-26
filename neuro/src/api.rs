use anyhow::Result;
use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Json},
    routing::get,
    Router,
};
use serde::Serialize;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

use crate::automation::ActionLog;
use crate::config::ApiConfig;
use crate::sensors::SensorReading;

#[derive(Clone)]
pub struct ApiState {
    pub sensor_state: Arc<RwLock<Vec<SensorReading>>>,
    pub actions_log: Arc<RwLock<Vec<ActionLog>>>,
    pub token: String,
    pub start_time: std::time::Instant,
}

pub async fn start(cfg: &ApiConfig, state: ApiState) -> Result<()> {
    let state = Arc::new(state);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/sensors", get(sensors))
        .route("/api/energy", get(energy))
        .route("/api/actions", get(actions))
        .route("/api/health", get(health))
        .route("/ws/live", get(ws_live))
        .layer(cors)
        .with_state(state);

    let port = cfg.port;
    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    info!(port, "Dashboard API server starting");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

fn check_auth(headers: &HeaderMap, token: &str) -> Result<(), StatusCode> {
    if token.is_empty() {
        return Ok(());
    }
    let auth = headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if auth == format!("Bearer {}", token) {
        Ok(())
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

async fn sensors(
    headers: HeaderMap,
    State(state): State<Arc<ApiState>>,
) -> Result<Json<Vec<SensorReading>>, StatusCode> {
    check_auth(&headers, &state.token)?;
    let readings = state.sensor_state.read().await.clone();
    Ok(Json(readings))
}

#[derive(Serialize)]
struct EnergyStats {
    note: String,
}

async fn energy(
    headers: HeaderMap,
    State(state): State<Arc<ApiState>>,
) -> Result<Json<EnergyStats>, StatusCode> {
    check_auth(&headers, &state.token)?;
    Ok(Json(EnergyStats {
        note: "Energy monitoring not yet connected".to_string(),
    }))
}

async fn actions(
    headers: HeaderMap,
    State(state): State<Arc<ApiState>>,
) -> Result<Json<Vec<ActionLog>>, StatusCode> {
    check_auth(&headers, &state.token)?;
    let log = state.actions_log.read().await;
    let recent: Vec<ActionLog> = log.iter().rev().take(50).cloned().collect();
    Ok(Json(recent))
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    uptime_secs: u64,
    version: String,
}

async fn health(
    headers: HeaderMap,
    State(state): State<Arc<ApiState>>,
) -> Result<Json<HealthResponse>, StatusCode> {
    check_auth(&headers, &state.token)?;
    Ok(Json(HealthResponse {
        status: "ok".to_string(),
        uptime_secs: state.start_time.elapsed().as_secs(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }))
}

async fn ws_live(
    ws: WebSocketUpgrade,
    State(state): State<Arc<ApiState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_ws(socket, state))
}

async fn handle_ws(mut socket: WebSocket, state: Arc<ApiState>) {
    let mut interval = tokio::time::interval(std::time::Duration::from_secs(2));
    loop {
        interval.tick().await;
        let readings = state.sensor_state.read().await.clone();
        let json = match serde_json::to_string(&readings) {
            Ok(j) => j,
            Err(_) => continue,
        };
        if socket.send(Message::Text(json.into())).await.is_err() {
            break;
        }
    }
}
