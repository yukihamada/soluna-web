# SOLUNA Web — CLAUDE.md

## 概要
SOLUNA は共同所有型リゾートのPWAアプリ。Fly.io `soluna-web` アプリでホスト。
- **URL**: https://soluna-web.fly.dev / https://solun.art（予定）
- **ソース**: `/Users/yuki/workspace/soluna-web/`
- **デプロイ**: `fly deploy --remote-only`（fly.toml があるルートで実行）

## 技術スタック
- **サーバー**: Node.js + Express (`server.js`)
- **DB**: libSQL/SQLite (`@libsql/client`) — Fly.io `/data` ボリューム
- **フロント**: バニラJS PWA (`cabin/app.html`) — SPA、screen slide遷移
- **メール**: Resend (`info@solun.art`)
- **予約管理**: Beds24 v2 API

## 物件一覧と価格

| slug | 物件名 | 購入価格 | 滞在単価 | 年間泊数 | beds24_prop | 状態 |
|------|--------|----------|----------|----------|-------------|------|
| atami | WHITE HOUSE 熱海 | ¥19,000,000 | ¥55,000/泊 | 36泊 | 243406 | 公開 |
| tapkop | TAPKOP | ¥80,000,000 | ¥340,000/泊 | 30泊 | 0 | 公開 |
| lodge | THE LODGE | ¥4,900,000 | ¥35,000/泊 | 30泊 | 243408 | 公開 |
| nesting | NESTING | ¥8,900,000 | ¥50,000/泊 | 30泊 | 243409 | 公開 |
| instant | インスタントハウス | ¥1,200,000 | ¥25,000/泊 | 30泊 | 322965 | 公開 |
| village | SOLUNAビレッジ（美留和） | ¥4,900,000 | ¥30,000/泊 | 30泊 | 0 | 2026-09オープン |
| kumaushi | 天空の道場（熊牛原野） | ¥4,800,000 | ¥80,000/泊 | 30泊 | 0 | 2026-09オープン |
| wakayama | SOLUNA 和歌山 | 未定 | 未定 | 30泊 | 0 | 計画中 |
| atami-hill | SOLUNA 熱海 II（熱海の上） | 未定 | 未定 | 未定 | 0 | 計画中 |
| honolulu | HONOLULU VILLA | ¥28,000,000 | ¥85,000/泊(月単位) | 30泊 | 243407 | 2026-11オープン |
| hawaii-kai | HAWAII KAI HOUSE | ¥38,000,000 | ¥120,000/泊(月単位) | 30泊 | 244738 | 2026-11オープン |

- HONOLULU・HAWAII KAIは `min_nights:30`（月単位ピッカーUI）
- TAPKOP は Beds24 未設定（要対応）
- 和歌山・熱海IIは計画中（詳細未定）

## Beds24 設定
- **認証**: `BEDS24_REFRESH_TOKEN`（.env）→ `/v2/authentication/token` でアクセストークン取得
- **Property IDs**: atami=243406, honolulu=243407, lodge=243408, nesting=243409, instant=322965
- **templates**: template1=チェックイン案内, template2=チェックアウト, template4=ドアコード送付

## DB スキーマ（soluna_members 拡張）
```sql
soluna_members: id, email, name, nah_access(0/1), member_type, line_user_id, created_at
soluna_sessions: id, member_id, token, expires_at (365日有効)
soluna_otps: id, email, code, expires_at, used (10分有効、rate limit 3回/5分)
soluna_purchases: id, member_id, property_slug, units, price_yen, status(pending/confirmed), ref_code
soluna_coupons: id, code, member_id, property_slug, nights_total, nights_used, valid_until
soluna_bookings: id, coupon_id, member_id, property_slug, check_in, check_out, nights, guests, status
soluna_chat_logs: id, member_id, email, question, answer, created_at
soluna_community_messages: id, member_id, display_name, member_type, message, is_ai, reply_to_id, reply_preview, image_url, deleted, created_at
soluna_community_reactions: message_id, member_id, emoji (PRIMARY KEY; インメモリキャッシュ+DB永続)
soluna_staff_codes: id, member_id, code
soluna_referrals: id, code, staff_member_id, purchase_id, referred_email, commission_rate, commission_yen, status
```

### インデックス
```sql
idx_sessions_token, idx_sessions_expires, idx_otps_email,
idx_bookings_prop_dates, idx_purchases_member, idx_chat_logs_member
```

## API エンドポイント
| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/soluna/otp | OTP送信 |
| POST | /api/soluna/verify | OTP検証 → トークン返却 |
| GET | /api/soluna/me | メンバー情報＋購入・クーポン・予約 |
| PATCH | /api/soluna/me | 名前更新 |
| GET | /api/soluna/properties | 全物件一覧 |
| POST | /api/soluna/register | 購入申込（pending） |
| POST | /api/soluna/stay | 宿泊申込（coupon必要） |
| POST | /api/soluna/coupon/redeem | クーポン利用（認証必須） |
| GET | /api/soluna/coupon/:id/availability | クーポン物件の予約済み日程 |
| POST | /api/soluna/booking | クーポンで宿泊予約作成 |
| GET | /api/soluna/guide/:slug | 物件ガイド（チェックイン情報、Wi-Fi、ドアコード等） |
| POST | /api/soluna/nah/reserve | NOT A HOTELをKAGI経由で予約 |
| POST | /api/soluna/nah/grant | 友人にNAHアクセス付与 |
| GET | /api/beds24/bookings | Beds24予約一覧プロキシ |
| POST | /api/beds24/bookings | Beds24予約作成プロキシ |
| GET | /api/soluna/admin/bookings | 全予約一覧（admin） |
| POST | /api/soluna/coupon/issue | クーポン発行（admin） |
| GET | /api/soluna/admin/chat-logs | AIチャットログ一覧（admin） |
| POST | /api/soluna/chat | AI質問チャット（ask.html用） |
| GET | /api/soluna/owner/revenue | オーナー収益サマリー（要認証） |
| GET | /api/soluna/availability/next | 各物件の次の空き日（Beds24） |
| GET | /api/soluna/community/messages | コミュニティチャット一覧 |
| POST | /api/soluna/community/message | コミュニティチャット送信 |
| POST | /api/soluna/community/react | リアクション（12絵文字） |
| GET | /api/soluna/community/stream | SSEリアルタイムストリーム |

## NOT A HOTEL 連携
- **KAGI Server**: `https://kagi-server.fly.dev`
  - `GET /api/v1/soluna/properties` → `{ properties: [...] }` (group_name: "nah" or "soluna")
  - `GET /api/v1/soluna/availability?property=ID&from=YYYY-MM-DD&to=YYYY-MM-DD` → `{ blocked: [...] }`
  - `POST /api/v1/soluna/reservations` → `{ ok, reservation_id, cancel_token, status }`
- **アクセス権**: `nah_access=1` OR `soluna_coupons` 所持 OR 確定済み購入
- **管理者**: `mail@yukihamada.jp` は起動時に自動で `nah_access=1` セット

## PWA (cabin/app.html) の構成
- **認証**: メールOTP → localStorage `sln_token`（365日有効）
- **画面遷移**: `screen-list` ↔ `screen-detail`（CSS transform slide）
- **検索**: `screen-search`（横断検索、KAGI + SOLUNA物件）
- **タブ**: 宿泊を予約 / 口数を購入 / ガイド
- **ガイドタブ**: チェックイン時刻・住所・Wi-Fi・案内テンプレ・ドアコード（オーナーのみ）
- **FALLBACK_PROPS**: サーバー未通信時の物件データ（app.html内にハードコード）

## 物件ガイド静的情報（PROPERTY_GUIDE_STATIC）
各物件の Wi-Fi SSID・MAP URL・注意事項は `server.js` の `PROPERTY_GUIDE_STATIC` に定義。
実際のWi-Fiパスワード・ドアコードは `室内書類参照` として案内（セキュリティ上コードに書かない）。

## NAH物件写真
`cabin/img/` に格納:
- aoshima: `aoshima_pool.webp`（実写）
- nasu: `nah_nasu.webp`
- kitakaru: `nah_kitakaru.webp`
- ishigaki: `nah_ishigaki.webp`
- fuji: `nah_fuji.webp`
- setouchi: `nah_setouchi.webp`
出典: imagedelivery.net（NOT A HOTEL公式CDN）376×376 WebP

## Fly.io Secrets（要設定）
- `BEDS24_REFRESH_TOKEN` — Beds24認証
- `RESEND_API_KEY` — メール送信
- `ADMIN_KEY` — 管理者APIキー
- `DATABASE_URL` — libSQL URL（ローカルは sqlite:///data/soluna.db）

## ページ別ペルソナ & KPI

### ペルソナ定義

| ID | 名前 | 年齢 | 動機 | 流入元 |
|----|------|------|------|--------|
| **A: INVESTOR** | 共同オーナー希望者 | 35-55歳, 年収1500万+, テック/起業家 | 別荘コスト問題を解決、コミュニティに属したい | 濱田ネットワーク, Twitter/X, 紹介 |
| **B: AKIYA** | 空き家リノベ探索者 | 30-45歳, リモートワーク可 | 低コストで瀬戸内・地方に拠点を作りたい | Google「瀬戸内 空き家」, Instagram |
| **C: FEST** | フェス参加者 | 25-40歳, テクノ/EDM好き | ハワイでZAMNA×SOLUNA体験 | Instagram, ZAMNA公式, チケットSNS |
| **D: BUILDER** | 建築ファン | 30-50歳, DIY/建築/素材好き | 自然建材・工法を学ぶ、ビレッジ建築に参加 | YouTube, 建築メディア |

### ページ × ペルソナ × KPI

| ページ | 主ペルソナ | 一次KPI | 二次KPI | 目標値 |
|--------|-----------|---------|---------|--------|
| `index.html` | A | `email_signup` (rate vs PV) | `hero_places`/`hero_fest` clicks | 登録率 >3% |
| `scheme.html` | A | `consultation_click` | Time on page >3min | 相談率 >5% of scheme visitors |
| `homes.html` / `collection.html` | A | `purchase_click` | →`buy.html` CTR | 購入意向 >2% of homes visitors |
| `buy.html` | A | `app_login` (OTP完了) | Funnel drop-off | OTP完了率 >60% of page visitors |
| `kagawa-akiya.html` | B | `gate_unlock` (email登録率) | `consultation_click` | ゲート解除率 >15% |
| `wakayama-akiya.html` | B | `gate_unlock` | `consultation_click` | ゲート解除率 >12% |
| `zamna.html` | C | `email_signup` | Click-through to ticket page | 登録率 >8% |
| `village.html` / `workparty.html` | D | `consultation_click` | Time on page | 相談率 >4% |
| `app.html` | A+B (member) | `app_login` (DAU) | Booking conversions | リピート率 >40%/月 |

### イベント一覧 (POST /api/track で計測)

| event | 発生場所 | 意味 |
|-------|---------|------|
| `email_signup` | index(hero/fest), any | メール登録完了 |
| `gate_unlock` | kagawa/wakayama-akiya | ゲート解除（email入力） |
| `consultation_click` | scheme, kagawa-akiya, kumaushi | 相談CTA押下 |
| `purchase_click` | homes, buy, property pages | 購入意向CTA押下 |
| `app_login` | app.html | OTP認証+ログイン完了 |
| `magic_login` | app.html (magic link) | メール内リンクからのログイン |
| `property_view` | any property page | 特定物件の閲覧（`d.slug`） |

### KPI確認方法

```bash
# 直近30日のファネル
curl -s "https://solun.art/api/admin/kpi?days=30" \
  -H "x-admin-key: $ADMIN_KEY" | python3 -m json.tool

# kagawa-akiyaのゲート解除率確認
# PV (enabler-analytics) vs gate_unlock (soluna_events) で計算
curl "https://enabler-analytics.fly.dev/api/pages?days=30&site=solun.art" | python3 -c "
import sys,json
pages=json.load(sys.stdin)
for p in pages:
    if 'kagawa-akiya' in p['path']: print(p)
"
```

### 各ページの改善優先度 (2026-04 時点)

1. **🔴 index.html** — hero copyをペルソナAに最適化、HOMES/FESTセクション強化
2. **🔴 kagawa-akiya.html** — ゲート解除率計測開始、P19+ 追加候補調査
3. **🟡 scheme.html** — 相談CTA 2種類追加済み、スキーム説明動画追加検討
4. **🟡 zamna.html** — FEST email funnel、カウントダウン追加
5. **🟢 wakayama-akiya.html** — kagawa版と同様のgate+score構造に統一
6. **🟢 homes.html** — purchase_click tracking追加

### トラッキング実装パターン

```html
<!-- 全ページ共通: </head>直前に追加 -->
<script defer src="/js/sln-track.js"></script>

<!-- CTA要素にdata-sln-trackを付与 -->
<a href="..." data-sln-track="consultation_click">相談する</a>

<!-- JS内でカスタムイベント発火 -->
if(window.sln) sln.track('gate_unlock', {source:'kagawa-akiya'});
```

## よくある落とし穴
- KAGIの `/api/v1/soluna/properties` は `{ properties: [...] }` でラップされる（配列直接ではない）
- `SEARCH_PROPS_CACHE` は `raw.properties || raw` で正規化してからセット
- Beds24の `v2/properties/:id` エンドポイントが存在するか確認（プロパティ単体取得）
- セッション有効期限は365日（server.js `exp = Date.now() + 365*24*60*60*1000`）
- `guide-content` div は物件切り替え時にリセット（キャッシュは `_guideCache[slug]` で管理）
