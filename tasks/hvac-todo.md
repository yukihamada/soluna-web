# KUMAUSHI CLIMATE — 独自換気・空調システム設計計画

## コンセプト
KUMAUSHI BASE（12コンテナ、屈斜路湖畔）の換気・空調を完全自作Rustで制御する。
センサーノード（ESP32-S3）→ MQTT → 中央コントローラー（Raspberry Pi, Rust）→ axum REST API → KAGI連携

---

## アーキテクチャ

```
[コンテナ各部屋]
  ESP32-S3 センサーノード
    ├─ MH-Z19B (CO2, UART)
    ├─ SHT31 (温度/湿度, I2C)
    ├─ DS18B20 (水温/床暖, 1-Wire)
    └─ WiFi → MQTT publish

         ↓ MQTT (Mosquitto on Pi)

[Raspberry Pi 5 — 中央コントローラー]
  Rust (tokio + axum)
    ├─ MQTT subscriber
    ├─ PID制御ループ
    │    ├─ 換気ファン (CO2 → PWM)
    │    ├─ 温度 (heating relay)
    │    └─ 湿度 (dehumidifier relay)
    ├─ GPIO出力
    │    ├─ 換気ファン x4 (PWM via PCA9685)
    │    ├─ モーター付きダンパー x8 (サーボ)
    │    ├─ 床暖房ボイラー relay
    │    ├─ サウナ heater relay
    │    └─ 水ポンプ relay
    ├─ SQLite (sensor history, control log)
    ├─ axum REST API (:3000)
    │    ├─ GET  /api/v1/sensors        # 全センサー最新値
    │    ├─ GET  /api/v1/sensors/:id    # 個別センサー
    │    ├─ GET  /api/v1/sensors/:id/history?hours=24
    │    ├─ GET  /api/v1/zones          # ゾーン別状態
    │    ├─ POST /api/v1/zones/:id/mode # manual/auto/off
    │    ├─ POST /api/v1/zones/:id/setpoint # 目標温度/CO2
    │    ├─ GET  /api/v1/controls       # ファン/ダンパー現在値
    │    ├─ POST /api/v1/controls/:id   # 手動オーバーライド
    │    ├─ GET  /api/v1/schedule       # スケジュール
    │    ├─ POST /api/v1/schedule       # スケジュール設定
    │    ├─ GET  /api/v1/dashboard      # ダッシュボード用JSON
    │    └─ GET  /ws                    # WebSocket live feed
    └─ 静的ダッシュボード (/dashboard)
```

---

## ゾーン定義（12コンテナ）

| Zone | コンテナ | 用途 | センサー | 制御 |
|------|---------|------|---------|------|
| Z1 | 1-2 | メインリビング | CO2/温湿度x2 | 換気x2, 床暖 |
| Z2 | 3-4 | 寝室A | CO2/温湿度x2 | 換気x1, 床暖 |
| Z3 | 5-6 | 寝室B | CO2/温湿度x2 | 換気x1, 床暖 |
| Z4 | 7-8 | バス/サウナ | 温湿度x2, 水温 | サウナheat, ポンプ |
| Z5 | 9-10 | 多目的/ワーク | CO2/温湿度x1 | 換気x1 |
| Z6 | 11-12 | 機械室/廊下 | 温湿度x1 | — |

---

## センサーノードファームウェア仕様

- MCU: ESP32-S3-MINI-1 (WiFi内蔵、技適済)
- Framework: `esp-idf-hal` + `esp-idf-svc` (Rust std on ESP-IDF)
- MQTT: `esp-idf-svc::mqtt`
- Topic: `kumaushi/sensors/{node_id}/{sensor_type}`
- Payload: JSON `{"v": 1234, "unit": "ppm", "ts": 1713456789}`
- OTA: `esp-idf-svc::ota` via HTTP
- 送信間隔: 30秒
- 電源: DC 5V/USB-C（コンテナ電源引き込み）

---

## PID制御パラメータ初期値

### CO2制御（換気ファン）
- SP: 800 ppm (人がいる時), 400 ppm (不在時)
- Kp: 0.05, Ki: 0.001, Kd: 0.01
- 出力: ファンPWM 0-100%

### 温度制御（床暖ボイラー）
- SP: 22°C (在室), 18°C (不在)
- Kp: 2.0, Ki: 0.1, Kd: 0.5
- On/Off制御（継電器）

---

## ディレクトリ構成

```
kumaushi-climate/
├── Cargo.toml              # workspace
├── README.md
├── crates/
│   ├── common/             # 共通型定義
│   │   └── src/lib.rs      # SensorReading, ZoneState, ControlCommand
│   ├── sensor-node/        # ESP32-S3ファームウェア
│   │   ├── .cargo/config.toml  # esp-idf target設定
│   │   ├── build.rs
│   │   └── src/
│   │       ├── main.rs
│   │       ├── sensors/co2.rs
│   │       ├── sensors/sht31.rs
│   │       ├── mqtt.rs
│   │       └── ota.rs
│   └── controller/         # Raspberry Pi コントローラー
│       └── src/
│           ├── main.rs
│           ├── api.rs          # axum routes
│           ├── mqtt_client.rs
│           ├── control/pid.rs
│           ├── control/zones.rs
│           ├── gpio.rs
│           ├── db.rs
│           └── dashboard.rs    # 静的HTML embed
├── dashboard/
│   └── index.html          # リアルタイムダッシュボード
└── docs/
    └── wiring.md
```

---

## 実装ステップ

- [x] Plan作成 (このファイル)
- [ ] Step 1: common crate (共通型)
- [ ] Step 2: controller crate (Pi側、フル実装)
  - [ ] MQTT subscriber
  - [ ] PID制御
  - [ ] axum REST API
  - [ ] SQLite storage
  - [ ] WebSocket live feed
- [ ] Step 3: sensor-node crate (ESP32-S3)
  - [ ] MH-Z19B CO2読み取り
  - [ ] SHT31 温湿度読み取り
  - [ ] MQTT publish
  - [ ] OTA対応
- [ ] Step 4: dashboard HTML
- [ ] Step 5: cabin/kumaushi-hvac.html ページ作成
- [ ] Step 6: GitHubリポジトリ作成・push
- [ ] Step 7: soluna-web deploy (hvacページ追加)

---

## 完了条件
- `cargo build --release` が controller, common で通る
- sensor-node が ESP32-S3 向けにクロスコンパイルできる設定になっている
- REST API が完全な仕様で実装されている
- リアルタイムダッシュボード (WebSocket) が動く
- kumaushi-hvac.html がsolun.artで公開される
- GitHubにpush済み
