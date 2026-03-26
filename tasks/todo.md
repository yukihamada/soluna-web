# SOLUNA リポジション — フェス体験プラットフォームへの進化

## 概要
SOLUNAを「オンラインラジオ＋音楽配信」から「フェス体験プラットフォーム」にリポジションする。
既存の音楽配信基盤（tracks/radios/rights/royalties/tickets）を活かしつつ、Vote・Live・Community 機能を段階的に追加する。

## 調査結果

### 現在のアーキテクチャ
- **フロント**: Next.js 16 (static export → `out/`) — 29ページ、Stage 段階的公開システム
- **サーバー**: Express.js `server.js` (4,440行の巨大モノリス) — SSRラジオ・アーティストページ含む
- **DB**: SQLite (libSQL) — 18テーブル (submissions, users, tracks, radios, rights, tickets 等)
- **ストレージ**: Tigris S3 (音声+カバーアート)
- **デプロイ**: Fly.io (`soluna-web`, nrt, 256MB, Volume `/data`)
- **ドメイン**: solun.art (metadataBase に設定済み)

### 実装済み機能 (活用可能)
| 機能 | API | DB テーブル | 成熟度 |
|------|-----|------------|--------|
| ユーザー認証 | `/api/v1/auth/*` | users, api_keys | 完成 |
| トラック管理 | `/api/v1/tracks/*` | tracks | 完成 |
| ラジオチャンネル | `/api/v1/radios/*` + SSR `/radio/:slug` | radios, radio_tracks | 完成 |
| 権利管理 | `/api/v1/rights-holders/*` | rights_holders, track_rights, rights_disputes | 完成 |
| ロイヤリティ | `/api/v1/tracks/:id/royalties` | royalty_events, royalty_splits, payouts | 完成 |
| チケット販売 | `/api/v1/tickets/*` | ticket_types, tickets, ticket_orders, ticket_transfers | 完成 (Stripe未稼働) |
| AIカバーアート | `/api/v1/tracks/:id/cover/generate` | — | 完成 |
| 重複検出 | Chromaprint + SHA-256 | — | 完成 |
| ISRC発行 | 自動 | tracks.isrc | 完成 |
| Solanaアンカリング | tracks.anchor_tx | — | コード有り・未稼働 |
| メールサインアップ | `/api/email` | email_signups | 完成 |
| NFTパス | `/api/nft-passes/*` | nft_passes | 完成 |

### フロントページ構成 (29ページ)
```
フェス系: lineup, tickets, schedule, venue-agreement, vip, vip-lounge, hotel-plan, safety, press, production, staff
ビジネス系: investor, sponsor, deal, contract, artist-contract, budget, rights
音楽系: artist (ダッシュボード), music (エクスプローラ), mint, login
管理系: admin
その他: info, guide, developers, privacy, terms
```

### 注意点
- server.js が 4,440行のモノリス → 機能追加前に分割推奨
- `NEXT_PUBLIC_STAGE` で段階的公開 → 新機能もこの仕組みで制御可能
- フロントは static export → Vote等のリアルタイム機能は API polling or SSE
- Fly.io 256MB RAM → WebSocket 大量接続は厳しい、SSE or polling が現実的
- ドメインは solun.art（layout.tsx の metadataBase）

---

## フェーズ1: 土台づくり（1週間）

### 目的
ドメイン・ブランディング・OGP を SOLUNA フェスプラットフォームとして整備し、埋め込みプレイヤーでバイラル拡散の基盤を作る。

- [ ] **Step 1.1: ブランド統一** (小)
  - layout.tsx: タイトル・OGP を「ZAMNA HAWAII」→「SOLUNA」に更新
  - favicon.svg 更新
  - globals.css: カラーパレット調整（--gold をメインカラーに統一）
  - server.js 内の SSR ページの `<title>` も統一

- [ ] **Step 1.2: OGP動的生成** (中)
  - `app/opengraph-image.tsx` を改善（現在存在するが内容未確認）
  - ラジオ・アーティスト SSR ページに og:image を動的設定
  - Twitter Card 対応

- [ ] **Step 1.3: 埋め込みプレイヤー** (中)
  - 新SSRルート: `GET /embed/:radioSlug` — iframe 用コンパクトプレイヤー
  - 小型UI: カバーアート + 曲名 + 再生/停止 + SOLUNA ロゴリンク
  - oEmbed エンドポイント: `GET /api/v1/oembed?url=...` → JSON
  - コピー用埋め込みコード表示を radio ページに追加

- [ ] **Step 1.4: server.js 分割** (大)
  - `routes/auth.js` — 認証 (register, login, me, keys)
  - `routes/tracks.js` — トラック CRUD + ストリーミング
  - `routes/radios.js` — ラジオ CRUD + SSR
  - `routes/rights.js` — 権利管理 + ロイヤリティ
  - `routes/tickets.js` — チケット販売
  - `routes/admin.js` — 管理系エンドポイント
  - `routes/legacy.js` — フェス旧 API (submissions, email, budget 等)
  - server.js はルーティングのみ残す（500行以下目標）

- [ ] **Step 1.5: ランディングページ刷新** (中)
  - トップページを「フェスLP」→「SOLUNA プラットフォーム LP」に変更
  - セクション: Hero (キャッチコピー) → Feature紹介 → アーティスト向けCTA → フェス連携 → Footer
  - 既存の Stage システムは維持（段階的公開に活用）

## フェーズ2: インディーズ獲得（2週間）

### 目的
楽曲コンテスト・ファン投票でアーティストの自発的参加を促す。

- [ ] **Step 2.1: 楽曲コンテスト機能** (大)
  - 新テーブル: `contests` (id, title, description, start_at, end_at, prize, status)
  - 新テーブル: `contest_entries` (id, contest_id, track_id, user_id, status, created_at)
  - API: `POST /api/v1/contests` (admin), `GET /api/v1/contests`, `POST /api/v1/contests/:id/enter`
  - フロント: `app/contests/page.tsx` — コンテスト一覧
  - フロント: `app/contests/[id]/page.tsx` — コンテスト詳細 + エントリー

- [ ] **Step 2.2: ファン投票 (Vote)** (大)
  - 新テーブル: `votes` (id, contest_id, entry_id, voter_ip_hash, wallet_address, weight, created_at)
  - 投票制限: IP hash + 任意の Solana wallet 連携（1 wallet = 追加投票権）
  - API: `POST /api/v1/contests/:id/vote`, `GET /api/v1/contests/:id/results`
  - リアルタイム順位表示: SSE `GET /api/v1/contests/:id/live`
  - フロント: `app/vote/page.tsx` — 投票ダッシュボード

- [ ] **Step 2.3: アーティストプロフィール強化** (中)
  - SSR `/artists/:slug` に SNS リンク、バイオ、コンテスト実績を追加
  - `users` テーブルに `bio`, `avatar_url`, `social_links` (JSON) カラム追加
  - API: `PATCH /api/v1/me/profile` — プロフィール編集

- [ ] **Step 2.4: フォロー機能** (中)
  - 新テーブル: `follows` (id, follower_id, following_id, created_at)
  - API: `POST /api/v1/follow/:userId`, `DELETE /api/v1/follow/:userId`, `GET /api/v1/me/following`
  - アーティストページにフォロワー数・フォローボタン表示

- [ ] **Step 2.5: 通知メール** (小)
  - Resend 連携: フォロー通知、コンテスト開始通知、投票結果通知
  - `ADMIN_EMAIL` 以外に from: `noreply@solun.art` で送信

## フェーズ3: 中堅アーティスト＋フェス連動（3週間）

### 目的
フェスとプラットフォームの相互送客。限定チャンネル・チケット連携で価値を上げる。

- [ ] **Step 3.1: フェス機能（Festival）** (大)
  - 新テーブル: `festivals` (id, title, description, date_start, date_end, location, cover_url, status)
  - 新テーブル: `festival_lineup` (id, festival_id, user_id, stage, time_slot, confirmed)
  - API: CRUD + `GET /api/v1/festivals/:id/lineup`
  - フロント: `app/festivals/page.tsx` — フェス一覧
  - フロント: `app/festivals/[id]/page.tsx` — 詳細 (ラインナップ、タイムテーブル、チケット)
  - 既存 `ticket_types` に `festival_id` カラム追加でフェス紐付け

- [ ] **Step 3.2: 限定チャンネル** (中)
  - `radios` テーブルに `access_type` (public/ticket_holder/subscriber) カラム追加
  - チケット所持者のみ聴けるラジオ: チケット QR → セッション → ストリーム認可
  - SSR ラジオページにアクセス制限UI表示

- [ ] **Step 3.3: プレイリスト共有** (中)
  - 新テーブル: `playlists` (id, user_id, title, description, public, created_at)
  - 新テーブル: `playlist_tracks` (id, playlist_id, track_id, position)
  - API: CRUD + SSR `/playlists/:slug`
  - シェア用 OGP + 埋め込みプレイヤー対応

- [ ] **Step 3.4: Stripe 稼働** (中)
  - チケット販売の Stripe Checkout を実際に有効化
  - Webhook エンドポイント `/api/v1/tickets/webhook` のテスト
  - サブスクリプション (Pro プラン: トラック無制限、限定チャンネルアクセス)

- [ ] **Step 3.5: チャット (Community)** (大)
  - 新テーブル: `chat_messages` (id, channel_id, user_id, content, created_at)
  - channel_id = radio_id or festival_id
  - API: `POST /api/v1/chat/:channelId`, `GET /api/v1/chat/:channelId` (polling)
  - SSE 不要 — 5秒 polling で十分（256MB RAM 制約）
  - ラジオページ・フェスページにチャットパネル追加

## フェーズ4: 差別化（4週間〜）

### 目的
ライブ配信・Koe Device連携・ブロックチェーン証明で他プラットフォームとの差別化。

- [ ] **Step 4.1: ライブ配信 (Live)** (大)
  - HLS ストリーム取り込み: アーティストが OBS → RTMP → HLS 変換サーバー → S3
  - 新テーブル: `live_streams` (id, user_id, title, hls_url, status, viewer_count, started_at)
  - フロント: `app/live/page.tsx` — ライブ一覧 + HLS プレイヤー (hls.js)
  - フェスページにライブ配信埋め込み

- [ ] **Step 4.2: Koe Device 連携** (大)
  - Soluna P2P プロトコル (soluna://) との連携
  - ラジオチャンネルを Koe Device に自動配信
  - LED パターン同期: BPM ベースの視覚演出
  - デバイス登録 API: `POST /api/v1/devices`, `GET /api/v1/devices/:id/stream`

- [ ] **Step 4.3: Solana ブロックチェーン証明の稼働** (中)
  - 既存 `anchor_tx` フィールドを活用
  - トラックアップロード時に SHA-256 ハッシュを Solana memo に記録
  - 証明ページ `/api/v1/tracks/:id/proof` をリッチ化（Solscan リンク、タイムスタンプ）
  - コンテスト結果も on-chain にアンカリング

- [ ] **Step 4.4: NFT チケット** (中)
  - 既存 `nft_passes` テーブルを拡張
  - Solana 上に cNFT (compressed NFT) としてチケット発行
  - Phantom Wallet 連携は既に `providers.tsx` にある → 活用
  - 二次流通: Transfer API の on-chain 版

- [ ] **Step 4.5: アナリティクスダッシュボード** (中)
  - アーティスト向け: 再生数推移、リスナー地域、ロイヤリティ推定
  - 既存 `royalty_events` テーブルを集計
  - フロント: アーティストダッシュボード (`app/artist/page.tsx`) に統合

---

## テスト方針
- [ ] API テスト: 各エンドポイントを curl で手動検証（CI は後回し）
- [ ] フロント: `npm run build` が通ることを毎フェーズ末に確認
- [ ] デプロイ: `fly deploy --remote-only -a soluna-web` で本番確認
- [ ] DB マイグレーション: `initDb()` に `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` で追加

## リスク
- **server.js 巨大モノリス**: 分割せずに機能追加するとメンテ不能になる → フェーズ1で分割必須
- **256MB RAM**: WebSocket/SSE 大量接続は不可 → polling ベースで設計
- **Stripe 未テスト**: 本番決済前に test mode で E2E 検証必要
- **Solana RPC**: メインネット rate limit あり → Helius/QuickNode 等の RPC 推奨
- **ドメイン solun.art**: DNS 設定が完了しているか要確認（会議メモで指摘あり）

## 完了条件
- フェーズ1: solun.art にアクセスして SOLUNA ブランドのLPが表示、埋め込みプレイヤーが動作
- フェーズ2: アーティストがコンテストにエントリーし、ファンが投票できる
- フェーズ3: フェスページでラインナップ表示、チケット購入→限定チャンネルアクセス
- フェーズ4: ライブ配信が視聴可能、トラックの on-chain 証明が確認可能
