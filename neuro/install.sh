#!/usr/bin/env bash
set -euo pipefail

# SOLUNA NEURO AI CABIN Controller — One-line installer for Raspberry Pi 5
# Usage: curl -sSf https://solun.art/install-neuro.sh | bash

INSTALL_DIR="/opt/soluna-neuro"
CONFIG_DIR="/etc/soluna-neuro"
DATA_DIR="/var/lib/soluna-neuro"
SERVICE_NAME="soluna-neuro"

echo "=== SOLUNA NEURO AI CABIN Controller Installer ==="
echo ""

# Must run as root
if [ "$EUID" -ne 0 ]; then
    echo "Error: Run as root (sudo bash install.sh)"
    exit 1
fi

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" != "aarch64" ]; then
    echo "Warning: Expected aarch64 (Raspberry Pi 5), got $ARCH"
fi

# 1. Install Rust if not present
if ! command -v cargo &>/dev/null; then
    echo ">>> Installing Rust via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

echo ">>> Rust $(rustc --version)"

# 2. Install system dependencies
echo ">>> Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq build-essential pkg-config libssl-dev

# 3. Enable hardware interfaces
echo ">>> Enabling I2C, 1-Wire, UART..."

# I2C
if ! grep -q "^dtparam=i2c_arm=on" /boot/firmware/config.txt 2>/dev/null; then
    echo "dtparam=i2c_arm=on" >> /boot/firmware/config.txt
    echo "  I2C enabled (reboot required)"
fi

# 1-Wire
if ! grep -q "^dtoverlay=w1-gpio" /boot/firmware/config.txt 2>/dev/null; then
    echo "dtoverlay=w1-gpio" >> /boot/firmware/config.txt
    echo "  1-Wire enabled (reboot required)"
fi

# UART
if ! grep -q "^enable_uart=1" /boot/firmware/config.txt 2>/dev/null; then
    echo "enable_uart=1" >> /boot/firmware/config.txt
    echo "  UART enabled (reboot required)"
fi

# Load modules now if possible
modprobe i2c-dev 2>/dev/null || true
modprobe w1-gpio 2>/dev/null || true
modprobe w1-therm 2>/dev/null || true

# 4. Build
echo ">>> Building soluna-neuro (release)..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
cargo build --release

# 5. Install binary
echo ">>> Installing binary..."
mkdir -p "$INSTALL_DIR"
cp target/release/soluna-neuro "$INSTALL_DIR/soluna-neuro"
chmod 755 "$INSTALL_DIR/soluna-neuro"

# 6. Install config
mkdir -p "$CONFIG_DIR"
if [ ! -f "$CONFIG_DIR/config.yaml" ]; then
    cp config.yaml "$CONFIG_DIR/config.yaml"
    echo "  Config installed to $CONFIG_DIR/config.yaml"
else
    echo "  Config already exists, not overwriting"
fi

# 7. Create data directory
mkdir -p "$DATA_DIR"

# 8. Generate device token if not set
if ! grep -q "token:" "$CONFIG_DIR/config.yaml" || grep -q 'token: ""' "$CONFIG_DIR/config.yaml"; then
    TOKEN=$(openssl rand -hex 32)
    sed -i "s/token: \"\"/token: \"$TOKEN\"/" "$CONFIG_DIR/config.yaml"
    echo "  Generated device token: ${TOKEN:0:8}..."
fi

# 9. Install systemd service
echo ">>> Installing systemd service..."
cat > /etc/systemd/system/${SERVICE_NAME}.service << 'EOF'
[Unit]
Description=SOLUNA NEURO AI CABIN Controller
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=300
StartLimitBurst=5

[Service]
Type=simple
User=root
ExecStart=/opt/soluna-neuro/soluna-neuro --config /etc/soluna-neuro/config.yaml
WorkingDirectory=/opt/soluna-neuro
Restart=always
RestartSec=10
WatchdogSec=120

# Environment
Environment=RUST_LOG=info

# Security hardening
ProtectSystem=strict
ReadWritePaths=/var/lib/soluna-neuro
PrivateTmp=true
NoNewPrivileges=true

# GPIO/I2C/UART access
SupplementaryGroups=gpio i2c dialout

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ${SERVICE_NAME}
systemctl start ${SERVICE_NAME}

echo ""
echo "=== Installation complete ==="
echo "  Binary:  $INSTALL_DIR/soluna-neuro"
echo "  Config:  $CONFIG_DIR/config.yaml"
echo "  Data:    $DATA_DIR/"
echo "  Service: systemctl status $SERVICE_NAME"
echo ""
echo "  Edit config: sudo nano $CONFIG_DIR/config.yaml"
echo "  View logs:   journalctl -u $SERVICE_NAME -f"
echo "  Restart:     sudo systemctl restart $SERVICE_NAME"
echo ""

# Check if reboot needed
if dmesg | grep -q "kernel: .*i2c\|w1-gpio"; then
    echo "  Hardware interfaces already loaded."
else
    echo "  *** Reboot recommended to enable I2C/1-Wire/UART ***"
    echo "  Run: sudo reboot"
fi
