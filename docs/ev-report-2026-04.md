# SOLUNA 進捗レポート — 2026年4月

## サマリー
- 全11物件（稼働中3 / 建設中5 / 計画中3）
- iOSアプリ TestFlight配信開始
- サイト全面リニューアル（solun.art）

---

## 物件状況

### 稼働中（3物件）
| 物件 | 場所 | 1泊単価 | Airbnb |
|---|---|---|---|
| TAPKOP | 北海道弟子屈 | ¥340,000 | ★5.0 スーパーホスト6年 |
| THE LODGE | 北海道弟子屈 美留和 | — | 天然温泉付き 12名収容 |
| WHITE HOUSE 熱海 | 静岡県熱海市 | — | プール付き 稼働中 |

### 建設中（5物件）
| 物件 | 場所 | 施工予定 |
|---|---|---|
| OFF-GRID CABIN | 北海道弟子屈 | **6/11-13 Work Party** |
| 天空道場 | 北海道弟子屈 熊牛原野 | **9/20-21 Work Party** |
| 美留和グランド | 北海道弟子屈 32,337坪 | 着工準備中 |
| DOME HOUSE | 北海道弟子屈 SOLUNA村 | 2026年9月 ドーム搬入 |
| NESTING | 東京近郊 | 2026年Q3 設計確定 |

### 新規追加（計画中 3物件）
| 物件 | 場所 | 備考 |
|---|---|---|
| 熱海２ | 静岡県熱海市 山上 | WHITE HOUSE上方の開発予定地 |
| SOLUNA 和歌山 | 和歌山県 熊野古道 | 2028年着工予定 土地取得済 |
| SOLUNA ZERO | 北海道屈斜路 | 地下施設 40ftコンテナ16本 |

---

## 口数販売状況（美留和グランド）
- **現在価格**: ¥530万/口（ボンディングカーブ）
- **完売時価格**: ¥1,480万/口
- **総口数**: 100口限定・紹介制
- **年間利用権**: 8泊・全棟利用可

---

## 技術開発

### iOSアプリ「Soluna Stays」
- App Store Connect登録済み（App ID: 6762459490）
- TestFlight Build 1.0.0 配信中
- 機能: マップツアー / 物件一覧 / 施工スケジュール / オーナー予約 / Work Party申込
- プッシュ通知（APNs）対応

### サイト（solun.art）
- 全11物件の詳細ページ + 地図 + BOM（部材リスト）+ Work Dayスケジュール
- 地図ツアーアニメーション（熱海→和歌山→弟子屈）
- ボンディングカーブ自動価格更新
- enabler-analytics全ページ導入
- sitemap.xml / robots.txt SEO対応

### バックエンド
- Properties DB + REST API（GET /api/v1/properties）
- Work Party申込API + 利用権管理API（年8泊制限）
- ボンディングカーブAPI（GET /api/v1/bonding/village）
- Beds24予約自動同期（5分ポーリング）
- Stripe決済連携

---

## Beds24 物件管理
| Beds24物件 | propId | 状態 |
|---|---|---|
| WHITE HOUSE 熱海 | 243406 | 稼働中 |
| THE LODGE 弟子屈 | 243408 | 稼働中 |
| THE NEST 弟子屈 | 243409 | 稼働中 |
| Instant House A 美留和 | 322965 | Room作成済み（roomId: 671098） |
| Instant House B 美留和 | 322966 | Room作成済み（roomId: 671099） |

---

## 今後の予定
- **6/11-13**: OFF-GRID CABIN Work Party（電力系統・内装・フル稼働テスト）
- **9/20-21**: 天空道場 仕上げ Work Party
- **2027年4月**: 天空道場 正式開業（¥80,000/泊）
- **2028年**: SOLUNA 和歌山 着工

---

*Enabler Inc. / 代表 濱田優貴*
*info@enablerdao.com*
