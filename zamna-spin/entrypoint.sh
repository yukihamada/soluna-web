#!/bin/sh
# Map existing Fly.io secrets to Spin variable env vars
export SPIN_VARIABLE_ADMIN_KEY="${ADMIN_KEY:-}"
export SPIN_VARIABLE_STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"
export SPIN_VARIABLE_RESEND_API_KEY="${RESEND_API_KEY:-}"
export SPIN_VARIABLE_ADMIN_EMAIL="${ADMIN_EMAIL:-info@solun.art}"
export SPIN_VARIABLE_ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
export SPIN_VARIABLE_WHATSAPP_TOKEN="${WHATSAPP_TOKEN:-}"
export SPIN_VARIABLE_WHATSAPP_VERIFY_TOKEN="${WHATSAPP_VERIFY_TOKEN:-zamna-verify-2026}"
export SPIN_VARIABLE_WHATSAPP_PHONE_ID="${WHATSAPP_PHONE_ID:-}"

exec spin up --listen 0.0.0.0:3000 --runtime-config-file runtime-config.toml
