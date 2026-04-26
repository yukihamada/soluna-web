use anyhow::Result;
use axum::{extract::State, response::Html, routing::get, Router};
use std::sync::Arc;
use tracing::info;

use crate::config::GuestConfig;

const GUEST_HTML: &str = include_str!("../static/guest.html");

#[derive(Clone)]
struct GuestState {
    html: String,
}

pub async fn start(cfg: &GuestConfig) -> Result<()> {
    let html = render_html(cfg);
    let state = Arc::new(GuestState { html });

    let app = Router::new()
        .route("/", get(index))
        .with_state(state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], 8080));
    info!(port = 8080, "Guest web server starting");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn index(State(state): State<Arc<GuestState>>) -> Html<String> {
    Html(state.html.clone())
}

fn render_html(cfg: &GuestConfig) -> String {
    let area_guide_html: String = cfg
        .area_guide
        .iter()
        .map(|item| format!("<li>{}</li>", item))
        .collect::<Vec<_>>()
        .join("\n");

    GUEST_HTML
        .replace("{{WIFI_SSID}}", &cfg.wifi_ssid)
        .replace("{{WIFI_PASSWORD}}", &cfg.wifi_password)
        .replace("{{CHECKOUT_TIME}}", &cfg.checkout_time)
        .replace("{{AREA_GUIDE}}", &area_guide_html)
        .replace("{{EMERGENCY_PHONE}}", &cfg.emergency_phone)
}
