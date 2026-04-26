#!/bin/bash
# ============================================================
# Soluna Stays - App Store スクリーンショット自動生成
# ============================================================
# 使い方: ./generate-screenshots.sh
# 前提: Xcode, xcrun simctl, screencapture がインストール済み
# ============================================================

set -euo pipefail

# --- 設定 ---
PROJECT_DIR="/Users/yuki/workspace/soluna-web/ios"
APP_BUNDLE_ID="com.enablerdao.soluna"
SCHEME="Soluna"
OUTPUT_DIR="${PROJECT_DIR}/screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# シミュレーターデバイス名
DEVICE_67="iPhone 16 Pro Max"
# iPhone SE不要であればコメントアウト
# DEVICE_47="iPhone SE (3rd generation)"

# --- 出力ディレクトリ作成 ---
mkdir -p "${OUTPUT_DIR}/6.7inch"
echo "[INFO] スクリーンショット出力先: ${OUTPUT_DIR}"

# --- ヘルパー関数 ---
wait_for_boot() {
    local device_udid="$1"
    echo "[INFO] シミュレーター起動待機中..."
    local count=0
    while [ $count -lt 30 ]; do
        local state
        state=$(xcrun simctl list devices | grep "$device_udid" | grep -o "Booted" || true)
        if [ "$state" = "Booted" ]; then
            echo "[INFO] シミュレーター起動完了"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    echo "[ERROR] シミュレーター起動タイムアウト"
    return 1
}

wait_for_app() {
    local device_udid="$1"
    local bundle_id="$2"
    echo "[INFO] アプリ起動待機中 (5秒)..."
    sleep 5
}

take_screenshot() {
    local device_udid="$1"
    local name="$2"
    local size_dir="$3"
    local filepath="${OUTPUT_DIR}/${size_dir}/${name}_${TIMESTAMP}.png"

    xcrun simctl io "$device_udid" screenshot "$filepath"
    echo "[OK] スクリーンショット保存: ${filepath}"
}

# --- UDIDを取得または作成 ---
get_or_create_device() {
    local device_name="$1"
    local udid

    # 既存デバイスのUDIDを検索
    udid=$(xcrun simctl list devices available | grep "$device_name" | head -1 | grep -oE '[0-9A-F-]{36}' || true)

    if [ -z "$udid" ]; then
        echo "[INFO] シミュレーター '${device_name}' が見つかりません。利用可能なデバイス:"
        xcrun simctl list devices available | grep -i "iphone"
        echo ""
        echo "[ERROR] '${device_name}' を Xcode > Window > Devices and Simulators で追加してください"
        exit 1
    fi

    echo "$udid"
}

# --- メイン処理 ---
capture_for_device() {
    local device_name="$1"
    local size_dir="$2"

    echo ""
    echo "============================================================"
    echo " ${device_name} (${size_dir})"
    echo "============================================================"

    # UDID取得
    local udid
    udid=$(get_or_create_device "$device_name")
    echo "[INFO] UDID: ${udid}"

    # シミュレーター起動
    echo "[INFO] シミュレーター起動中: ${device_name}"
    xcrun simctl boot "$udid" 2>/dev/null || true
    wait_for_boot "$udid"

    # アプリのビルド & インストール
    echo "[INFO] アプリをビルド中..."
    local build_dir="${PROJECT_DIR}/build/screenshots"
    xcodebuild build \
        -project "${PROJECT_DIR}/Soluna.xcodeproj" \
        -scheme "${SCHEME}" \
        -destination "platform=iOS Simulator,id=${udid}" \
        -derivedDataPath "${build_dir}" \
        -quiet 2>&1 | tail -3

    # ビルド成果物のパスを探す
    local app_path
    app_path=$(find "${build_dir}" -name "Soluna.app" -type d | head -1)
    if [ -z "$app_path" ]; then
        echo "[ERROR] ビルド成果物が見つかりません"
        exit 1
    fi

    # アプリインストール
    echo "[INFO] アプリインストール中..."
    xcrun simctl install "$udid" "$app_path"

    # アプリ起動
    echo "[INFO] アプリ起動中..."
    xcrun simctl launch "$udid" "$APP_BUNDLE_ID"

    # 初期アニメーション待機
    wait_for_app "$udid" "$APP_BUNDLE_ID"

    # --- スクリーンショット撮影 ---
    mkdir -p "${OUTPUT_DIR}/${size_dir}"

    # 1. マップ画面（初期表示）
    echo "[INFO] スクリーンショット 1/3: マップ画面"
    take_screenshot "$udid" "01_map" "$size_dir"

    # 2. 物件一覧へ遷移（タブバーの2番目をタップ）
    # simctl ではUIイベント送信が限定的なので、ディープリンクを使用
    echo "[INFO] スクリーンショット 2/3: 物件一覧画面"
    echo "[INFO]   ディープリンクで遷移を試行..."
    xcrun simctl openurl "$udid" "soluna://collection" 2>/dev/null || true
    sleep 3
    take_screenshot "$udid" "02_collection" "$size_dir"

    # 3. 物件詳細へ遷移
    echo "[INFO] スクリーンショット 3/3: 物件詳細画面"
    xcrun simctl openurl "$udid" "soluna://property/1" 2>/dev/null || true
    sleep 3
    take_screenshot "$udid" "03_detail" "$size_dir"

    echo ""
    echo "[DONE] ${device_name} のスクリーンショット完了"
    echo "[INFO] 出力先: ${OUTPUT_DIR}/${size_dir}/"
    ls -la "${OUTPUT_DIR}/${size_dir}/"

    # シミュレーター停止
    echo "[INFO] シミュレーター停止中..."
    xcrun simctl shutdown "$udid" 2>/dev/null || true
}

# === 実行 ===
echo "============================================================"
echo " Soluna Stays - App Store スクリーンショット自動生成"
echo "============================================================"
echo ""
echo "[INFO] プロジェクト: ${PROJECT_DIR}"
echo "[INFO] バンドルID: ${APP_BUNDLE_ID}"

# 6.7インチ（iPhone 16 Pro Max）
capture_for_device "$DEVICE_67" "6.7inch"

# 4.7インチ（iPhone SE）が必要な場合はコメント解除
# capture_for_device "$DEVICE_47" "4.7inch"

echo ""
echo "============================================================"
echo " 全スクリーンショット生成完了"
echo "============================================================"
echo ""
echo "出力先: ${OUTPUT_DIR}/"
echo ""
echo "注意:"
echo "  - ディープリンク (soluna://) がアプリに実装されていない場合、"
echo "    画面遷移は手動で行い、以下のコマンドで個別に撮影してください:"
echo ""
echo "    xcrun simctl io <UDID> screenshot <filename>.png"
echo ""
echo "  - App Store Connect にアップロードする際のサイズ要件:"
echo "    6.7インチ: 1320 x 2868 px"
echo "    6.1インチ: 1206 x 2622 px"
echo ""
