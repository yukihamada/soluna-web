# SOLUNA — Music Distribution Platform

アーティストファーストの音楽配信プラットフォーム。曲をドロップするだけで、ラジオチャンネルが即完成。

Artist-first music platform. Drop a track, get a radio channel.

**Live:** https://soluna-web.fly.dev

---

## 機能 / Features

| 機能 | 説明 |
|------|------|
| **即時公開** | MP3/WAV/FLACをアップロード、5秒でライブ配信開始 |
| **AIカバーアート** | Gemini がジャンル・雰囲気からアートワークを自動生成 |
| **著作権自動保護** | ISRC発行 + SHA-256ハッシュ証明で全トラックを保護 |
| **パーソナルラジオ** | 初回アップロードでチャンネルURL自動発行、SNSでシェアするだけ |
| **ロイヤリティ記録 (β)** | 業界標準30秒再生で計測、再生ごとにログ蓄積 |
| **メタデータ自動取得** | iTunes・MusicBrainz・AcoustID・lyrics.ovh から一括フェッチ |
| **重複検出** | SHA-256 + Chromaprint フィンガープリントで同一曲を検出 |
| **ドラッグ＆ドロップ** | 複数ファイル同時対応、プリフェッチ → アップロード → 公開が全自動 |
| **無料プラン** | 30曲まで無料、クレジットカード不要 |

## 技術構成 / Tech Stack

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 16（静的エクスポート） |
| サーバー | Express.js（Node 22） |
| データベース | SQLite（libSQL）/ Fly.io Volume |
| ファイルストレージ | Tigris S3（音声 + カバーアート） |
| AI | Gemini 3.1 Flash（カバーアート生成） |
| デプロイ | Fly.io（東京 nrt）、2台構成、ローリングデプロイ |
| 音声解析 | Chromaprint / fpcalc（フィンガープリント） |

## アーキテクチャ / Architecture

```
ブラウザ ──► Express (server.js)
              ├── /api/v1/tracks          → アップロード → S3 (Tigris)
              ├── /api/v1/tracks/:id/stream → S3 から配信（Range対応）
              ├── /api/v1/radios          → ラジオチャンネル CRUD
              ├── /radio/:slug            → SSR ラジオプレイヤー
              ├── /artists/:slug          → SSR アーティストプロフィール
              ├── /covers/:file           → S3 → ローカルフォールバック
              └── out/                    → Next.js 静的ページ
```

## ローカル開発 / Local Development

```bash
npm install
npm run dev          # Next.js 開発サーバー（フロントエンド）
node server.js       # Express サーバー（API + 静的ファイル配信）
```

## デプロイ / Deploy

```bash
npm run build                          # Next.js 静的エクスポート → out/
fly deploy --remote-only -a soluna-web  # Docker ビルド + デプロイ
```

## 環境変数 / Environment Variables (Fly.io Secrets)

| キー | 用途 |
|------|------|
| `ADMIN_KEY` | 管理用APIエンドポイントの認証 |
| `GEMINI_API_KEY` | AIカバーアート生成 |
| `BUCKET_NAME` | Tigris S3 バケット名 |
| `AWS_ACCESS_KEY_ID` | Tigris 認証情報 |
| `AWS_SECRET_ACCESS_KEY` | Tigris 認証情報 |
| `AWS_ENDPOINT_URL_S3` | Tigris エンドポイント |
| `STRIPE_SECRET_KEY` | 決済（将来実装） |
| `SOLANA_ANCHOR_KEY` | ブロックチェーンアンカリング（任意） |

## 管理エンドポイント / Admin Endpoints

```bash
# AIカバーアートの一括生成
curl -X POST /api/v1/admin/generate-covers -H "x-admin-key: $KEY"

# ローカルファイルを S3 に移行
curl -X POST /api/v1/admin/migrate-s3 -H "x-admin-key: $KEY"

# メタデータの一括取得
curl -X POST /api/v1/admin/backfill-metadata -H "x-admin-key: $KEY"
```

## プロジェクト構成 / Project Structure

```
server.js             # Express サーバー（API + SSR ラジオ/アーティストページ）
server-package.json   # サーバー専用依存パッケージ（Docker 用）
app/                  # Next.js ページ（静的エクスポート）
  artist/page.tsx     # アーティストポータル（ランディング + ダッシュボード）
public/images/        # Gemini 生成のランディングページ画像
Dockerfile            # Node 22 + Chromaprint
fly.toml              # Fly.io 設定
```

## ライセンス / License

Private
