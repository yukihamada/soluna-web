"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getSavedLang, saveLang } from "@/lib/lang";

type NftPass = { id: number; pass_type: string; name: string; description: string; image_url: string };

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

type Status = "done" | "in_progress" | "pending" | "urgent";
const STATUS_CYCLE: Status[] = ["pending", "in_progress", "done", "urgent"];

const STATUS_LABEL: Record<Status, { ja: string; en: string; color: string }> = {
  done:        { ja: "完了",   en: "Done",        color: "rgba(74,222,128,0.9)" },
  in_progress: { ja: "進行中", en: "In Progress",  color: "rgba(201,169,98,0.9)" },
  pending:     { ja: "未着手", en: "Pending",      color: "rgba(255,255,255,0.35)" },
  urgent:      { ja: "要対応", en: "Urgent",       color: "rgba(255,80,80,0.9)" },
};

type Task = { ja: string; en: string; status: Status; note?: { ja: string; en: string } };
type Section = { ja: string; en: string; tasks: Task[] };

type TaskOverride = { task_key: string; status: Status; updated_by: string | null; updated_at: string };
type AdminView = { member: string; last_viewed: string };

function timeAgo(dateStr: string, ja: boolean): string {
  const diff = Date.now() - new Date(dateStr + "Z").getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return ja ? "たった今" : "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SECTIONS: Section[] = [
  // ── 1. 資金調達 ───────────────────────────────────────────────
  {
    ja: "資金調達",
    en: "Funding",
    tasks: [
      { ja: "Vakas Investmentとの出資契約",              en: "Investment agreement with Vakas",             status: "done" },
      { ja: "創設パートナー $200,000 調達",               en: "Founding partner $200K raise",                status: "urgent",     note: { ja: "アーティストブッキングのデポジットに必須", en: "Required for artist booking deposit" } },
      { ja: "エスクロー口座の開設",                       en: "Open dedicated escrow account",               status: "pending",    note: { ja: "LLC設立後に即開設", en: "Open immediately after LLC incorporation" } },
      { ja: "イベントキャンセル保険の締結",               en: "Event cancellation insurance",                status: "pending" },
      { ja: "チケット売上収益の入金管理（Ticketblox）",   en: "Ticket revenue tracking via Ticketblox",      status: "in_progress",note: { ja: "販売開始済み・売上管理を整備", en: "Sales live — set up revenue tracking" } },
      { ja: "スポンサー収入の入金管理",                   en: "Sponsor payment tracking",                    status: "pending" },
    ],
  },

  // ── 2. 法人・財務 ─────────────────────────────────────────────
  {
    ja: "法人・財務",
    en: "Finance & Entity",
    tasks: [
      { ja: "ハワイ州 LLC / Corp の設立",                en: "Incorporate LLC / Corp in Hawaii",             status: "done",       note: { ja: "設立済み", en: "Incorporated" } },
      { ja: "事業用米国銀行口座の開設",                  en: "Open US business bank account",               status: "done",       note: { ja: "口座開設済み", en: "Account opened" } },
      { ja: "会計・経理担当者のアサイン",                en: "Assign accountant / bookkeeper",              status: "pending" },
      { ja: "詳細収支予算（P&L）の確定",                 en: "Finalize detailed P&L budget",                status: "in_progress",note: { ja: "チケット単価確定済：GA $120/$180、VIP $1,000+", en: "Ticket prices set: GA $120/$180, VIP $1,000+" } },
      { ja: "ハワイ州・連邦税申告の準備",                en: "Hawaii state & federal tax filing prep",      status: "pending" },
      { ja: "資金ショート時のブリッジ計画",              en: "Bridge plan for cash flow gaps",              status: "pending" },
    ],
  },

  // ── 3. 法務・契約 ─────────────────────────────────────────────
  {
    ja: "法務・契約",
    en: "Legal & Contracts",
    tasks: [
      { ja: "NDA テンプレートの整備",                    en: "NDA templates finalized",                     status: "done" },
      { ja: "投資契約書ドラフトの弁護士レビュー",        en: "Investment contract attorney review",         status: "urgent" },
      { ja: "スポンサー契約書の整備",                    en: "Sponsor contracts finalized",                 status: "in_progress" },
      { ja: "ZAMNA ブランドライセンス契約の締結（JC ZAMNA）",en: "ZAMNA brand license signed with JC ZAMNA", status: "in_progress",note: { ja: "JC ZAMNAとの正式ライセンス確認", en: "Formal license with JC ZAMNA required" } },
      { ja: "アーティスト出演契約テンプレートの準備",    en: "Artist performance contract template",        status: "pending" },
      { ja: "会場利用契約の法務レビュー",                en: "Venue contract legal review",                 status: "pending" },
      { ja: "個人情報保護ポリシー・利用規約の整備",      en: "Privacy policy & terms of service",           status: "done",       note: { ja: "solun.art/privacy および /terms で公開済み", en: "Live at solun.art/privacy and /terms" } },
    ],
  },

  // ── 4. 会場・制作 ─────────────────────────────────────────────
  {
    ja: "会場・制作",
    en: "Venue & Production",
    tasks: [
      { ja: "Moanalua Gardens (JP Damon) 会場契約の締結",              en: "Moanalua Gardens (JP Damon) venue contract signed",          status: "in_progress", note: { ja: "Sidが帰LA後にLetter of Intent送付予定。JP Damonから配管図受領済み", en: "Sid to send Letter of Intent upon return to LA. Blueprint with sprinkler/water lines received from JP Damon" } },
      { ja: "ハワイ州イベント営業許可の取得",            en: "Hawaii state special event permit",           status: "in_progress" },
      { ja: "アルコール提供ライセンス（Liquor License）",en: "Liquor license for the event",                status: "pending" },
      { ja: "ステージ設計・レイアウト確定",              en: "Stage design & venue layout finalized",       status: "pending" },
      { ja: "Hawaii Stage & Lighting との打ち合わせ・契約",en: "Hawaii Stage & Lighting meeting & contract",  status: "in_progress", note: { ja: "制作パートナー候補。機材倉庫を視察済み", en: "Production partner candidate. Warehouse visit done" } },
      { ja: "発電機・電気設備の手配",                    en: "Generator & power infrastructure",            status: "pending" },
      { ja: "仮設トイレ・水道設備の手配",                en: "Restrooms & water infrastructure",            status: "pending" },
      { ja: "Wi-Fi・通信インフラの整備",                 en: "On-site Wi-Fi & communications",              status: "pending" },
      { ja: "仮設テント・構造物の手配",                  en: "Tent & temporary structures",                 status: "pending" },
      { ja: "ステージ撤去・原状回復計画",                en: "Stage breakdown & site restoration plan",     status: "pending" },
    ],
  },

  // ── 4b. 会場承認・近隣対策 ────────────────────────────────────
  {
    ja: "会場承認・近隣対策",
    en: "Venue Approval & Neighbor Relations",
    tasks: [
      { ja: "JP Damon Estate オーナーとの正式合意",            en: "Formal agreement with JP Damon Estate owner",  status: "in_progress", note: { ja: "オーナーは前向き。正式契約書の詰めが必要", en: "Owner is receptive. Need to finalize formal contract" } },
      { ja: "弁護士を通した法的整理（過去イベント問題の対処）",en: "Legal cleanup via attorney (past event issues)", status: "urgent", note: { ja: "過去の別イベントで近隣苦情あり。法的クリアランスが最優先", en: "Past event caused neighbor complaints. Legal clearance is top priority" } },
      { ja: "市議会・行政ルートでの承認工作",                  en: "City council & political route approval",       status: "urgent", note: { ja: "政治コネクションを活用。Sidが担当", en: "Leveraging political connections. Sid leading" } },
      { ja: "近隣住民への事前説明・合意取得",                  en: "Neighbor pre-notification & consent",           status: "pending", note: { ja: "交通計画・騒音対策・時間制限を明示した説明資料が必要", en: "Need doc with traffic plan, noise mitigation, time limits" } },
      { ja: "駐車・交通管理計画の策定",                        en: "Parking & traffic management plan",             status: "pending", note: { ja: "シャトル中心の導線設計。自家用車を最小限に", en: "Shuttle-first design. Minimize private cars" } },
      { ja: "水道・設備配慮計画の策定",                        en: "Water & utility consideration plan",            status: "pending" },
      { ja: "会場承認用1枚サマリーの作成",                     en: "Venue approval one-pager",                      status: "urgent", note: { ja: "会場の強み・懸念・対策・承認フローを1枚に集約", en: "Strengths, concerns, mitigations, approval flow on one page" } },
    ],
  },

  // ── 5. アーティスト ───────────────────────────────────────────
  {
    ja: "アーティスト",
    en: "Artists",
    tasks: [
      { ja: "ヘッドライナー交渉・契約",                  en: "Headliner negotiation & contract",            status: "urgent",     note: { ja: "$200K調達後に即デポジット支払い。JCが会場詳細・時間・LOI受領後にオファー送付予定", en: "Pay deposit after $200K raised. JC to send offers once venue details, hours & LOI received" } },
      { ja: "サポートアクト 3〜5組の確定",               en: "Supporting acts (3–5) confirmed",             status: "pending" },
      { ja: "ローカル DJ / アーティストの選定（ハワイ）",en: "Local Hawaii DJ / artist selection",          status: "pending",    note: { ja: "Sean のネットワーク活用", en: "Leverage Sean's local network" } },
      { ja: "全アーティストの出演ライダー確認",          en: "All artist riders confirmed",                 status: "pending" },
      { ja: "外国人アーティストのビザ申請（O-1 / P-1）", en: "Artist visa applications (O-1 / P-1)",        status: "pending",    note: { ja: "申請〜取得に3〜6ヶ月。今すぐ手続き開始が必要", en: "3–6 months lead time — start NOW" } },
      { ja: "フライト・ホテル comp rooms の手配",        en: "Artist comp flights & hotel rooms",           status: "in_progress",note: { ja: "航空会社・ホテルにスポンサー型comp交渉中（Sean）", en: "Negotiating comp rooms via sponsor deals (Sean)" } },
      { ja: "バックステージライダー・ケータリング手配",  en: "Backstage catering & rider fulfillment",      status: "pending" },
      { ja: "2日間タイムテーブルの確定",                 en: "2-day timetable finalized",                   status: "pending",    note: { ja: "Day1（Sep4）・Day2（Sep5）各ステージ割り", en: "Day1 (Sep 4) & Day2 (Sep 5) set times" } },
    ],
  },

  // ── 6. チケット・販売 ─────────────────────────────────────────
  {
    ja: "チケット・販売",
    en: "Tickets & Sales",
    tasks: [
      { ja: "チケット販売プラットフォーム：Ticketblox",  en: "Ticket platform: Ticketblox — LIVE",          status: "done",       note: { ja: "zamnahawaii.ticketblox.com で公開済み（2026/02/08〜）", en: "zamnahawaii.ticketblox.com live since Feb 8, 2026" } },
      { ja: "チケット価格の確定",                        en: "Ticket pricing confirmed",                    status: "done",       note: { ja: "GA Day1 $120 / Day2 $180 / VIP $1,000〜", en: "GA Day1 $120 / Day2 $180 / VIP $1,000+" } },
      { ja: "目標販売枚数：GA 5,000〜8,000枚",           en: "Sales target: 5,000–8,000 GA tickets",        status: "in_progress" },
      { ja: "ホテル付きパッケージの販売構造の決定",      en: "Hotel package sales structure decision",      status: "urgent",     note: { ja: "Aloha7（小寺氏）が提案中。GA売切後にパッケージのみ残す戦略", en: "Aloha7 (Ohki) proposal: pivot to hotel package after GA sells out" } },
      { ja: "VIP パッケージ詳細の設計",                  en: "VIP package details designed",                status: "pending",    note: { ja: "バックステージアクセス＋ホテル＋$3,000前後を想定", en: "Backstage access + hotel, ~$3,000 target" } },
      { ja: "日本・アジア向け販売チャネルの確立",        en: "Japan & Asia sales channel (NEWT / Aloha7)",  status: "in_progress",note: { ja: "NEWT（Shino）× Aloha7（小寺氏）で4枚/室パッケージ案あり", en: "NEWT × Aloha7: 4 tickets per room package proposal active" } },
      { ja: "当日キャッシュレス決済システムの導入",      en: "On-site cashless payment system",             status: "pending" },
      { ja: "入場 QR コードシステムの構築",              en: "QR code check-in system",                     status: "pending" },
      { ja: "転売防止・本人確認ポリシーの策定",          en: "Anti-scalping / ID verification policy",      status: "pending" },
    ],
  },

  // ── 7. マーケティング・PR ─────────────────────────────────────
  {
    ja: "マーケティング・PR",
    en: "Marketing & PR",
    tasks: [
      { ja: "ブランドビジュアル・キービジュアルの確定",  en: "Brand visual & key artwork finalized",        status: "in_progress",note: { ja: "ZAMNA本部（JC）からアセット受領待ち", en: "Waiting for assets from ZAMNA HQ (JC)" } },
      { ja: "SNS ハワイローカルチームによる運用開始",    en: "SNS managed by Sean's local Hawaii team",     status: "done",       note: { ja: "2026/02以降Sean側チームが主導。日本チームは待機中", en: "Sean's team leading since Feb 2026. Japan team on standby" } },
      { ja: "ラインナップ発表（アーティスト確定後）",    en: "Lineup announcement (post-booking)",          status: "pending",    note: { ja: "最大の集客スイッチ。アーティスト確定が最優先", en: "Biggest attendance driver — artist booking is #1 priority" } },
      { ja: "日本・アジア向けプロモーション（ゆみこ）",  en: "Japan & Asia promotion (Yumiko team)",        status: "pending",    note: { ja: "ZAMNA DB 50万人 / SNS 125万フォロワーに向けアジア配信", en: "Target ZAMNA DB 500K users / 1.25M followers for Asia" } },
      { ja: "インフルエンサー・メディアリストの作成",    en: "Influencer & media list compiled",            status: "pending" },
      { ja: "有料 SNS 広告キャンペーンの実施",           en: "Paid social ad campaigns",                    status: "pending" },
      { ja: "プレスリリースの配信（英語・日本語）",      en: "Press releases (EN & JA)",                    status: "pending" },
      { ja: "カウントダウンコンテンツ計画（毎週投稿）",  en: "Weekly countdown content calendar",           status: "pending" },
      { ja: "アフタームービー制作チームの手配",          en: "After-movie production team arranged",        status: "pending" },
    ],
  },

  // ── 8. スポンサー ─────────────────────────────────────────────
  {
    ja: "スポンサー",
    en: "Sponsors",
    tasks: [
      { ja: "スポンサーデックの配布",                    en: "Sponsor deck distributed",                    status: "done",       note: { ja: "solun.art/sponsor で公開中。ZAMNA実績：来場85万人・SNS125万人", en: "Live at solun.art/sponsor. ZAMNA track record: 850K attendees, 1.25M followers" } },
      { ja: "Roberts Hawaii（シャトル・スポンサー）交渉",en: "Roberts Hawaii: shuttle sponsor negotiation", status: "in_progress",note: { ja: "Sean が交渉中。スポンサー兼シャトル業者として検討", en: "Sean in talks. Exploring as sponsor + shuttle provider" } },
      { ja: "航空会社への comp 交渉（アーティスト用）",  en: "Airline comp rooms negotiation (for artists)", status: "in_progress",note: { ja: "Sean が航空会社・ホテルに接触中", en: "Sean reaching out to airlines & hotels" } },
      { ja: "Presenting Partner 候補へのアプローチ",     en: "Presenting partner ($100K+) outreach",        status: "in_progress" },
      { ja: "Artist Stage Partner の確定",               en: "Artist stage partner ($50K) confirmed",       status: "pending" },
      { ja: "VIP Lounge Partner の確定",                 en: "VIP lounge partner ($20K) confirmed",         status: "pending" },
      { ja: "スポンサー露出プランの確定（媒体・ブランディング）",en: "Sponsor exposure plan finalized",       status: "pending" },
      { ja: "スポンサー向けリポートの作成（イベント後）",en: "Post-event sponsor report",                   status: "pending" },
    ],
  },

  // ── 9. ホテル・ホスピタリティ ─────────────────────────────────
  {
    ja: "ホテル・ホスピタリティ",
    en: "Hotel & Hospitality",
    tasks: [
      { ja: "ホテルパッケージ販売方針の決定",            en: "Hotel package sales policy decision",         status: "urgent",     note: { ja: "Sean・NEWT・Aloha7 三者で要意思決定。早急に決めないと在庫確保できない", en: "Sean + NEWT + Aloha7 must decide NOW — inventory won't hold" } },
      { ja: "Aloha7（小寺 優紀）とホテル卸契約",        en: "Hotel wholesale deal with Aloha7 (Ohki)",     status: "in_progress",note: { ja: "Aloha7はシェラトンワイキキ／プリンセスカイウラニを候補として提案中", en: "Aloha7 proposing Sheraton Waikiki / Princess Kaiulani" } },
      { ja: "目標：500〜1,000室 @$250/泊前後で仮押さえ",en: "Block 500–1,000 rooms @ ~$250/night",         status: "pending",    note: { ja: "プレスリリース前に確保しないと値上がりする", en: "Must block before press release — prices will spike" } },
      { ja: "シャトルバス（空港↔ホテル↔会場）の手配",   en: "Shuttle (airport ↔ hotel ↔ venue)",           status: "in_progress",note: { ja: "Roberts Hawaii が候補（スポンサー兼任の可能性）", en: "Roberts Hawaii as candidate (possible sponsor deal)" } },
      { ja: "アーティスト用 comp rooms の確保",          en: "Comp rooms for artists confirmed",            status: "in_progress",note: { ja: "航空会社・ホテルにスポンサー型で交渉中（Sean）", en: "Negotiating sponsor-based comp rooms (Sean)" } },
      { ja: "VIP エリアのゾーニング・コンシェルジュ設計",en: "VIP zone & concierge service design",         status: "pending" },
      { ja: "島内アクティビティ・体験プログラムの設計",  en: "Island activity & experience packages",       status: "pending" },
    ],
  },

  // ── 10. オペレーション・スタッフ ──────────────────────────────
  {
    ja: "オペレーション・スタッフ",
    en: "Operations & Staffing",
    tasks: [
      { ja: "イベントディレクターの確定",                en: "Event director / production manager confirmed",status: "in_progress",note: { ja: "Sean Tsai が現地統括。追加の制作マネージャーを要検討", en: "Sean Tsai as local lead. Additional production manager TBD" } },
      { ja: "現地スタッフの採用（30〜50名）",            en: "Local staff hiring (30–50 people)",           status: "pending" },
      { ja: "ボランティアの募集・研修",                  en: "Volunteer recruitment & training",            status: "pending" },
      { ja: "警備会社の選定・契約",                      en: "Security company contracted",                 status: "pending" },
      { ja: "スタッフ用無線・通信システムの手配",        en: "Staff radio / communication system",          status: "pending" },
      { ja: "全スタッフ向けオペレーションマニュアル",    en: "Operations manual for all staff",             status: "pending" },
      { ja: "リハーサル・スタッフブリーフィング",        en: "Production rehearsal & staff briefing",       status: "pending" },
    ],
  },

  // ── 11. アクセス・ロジスティクス ──────────────────────────────
  {
    ja: "アクセス・ロジスティクス",
    en: "Access & Logistics",
    tasks: [
      { ja: "駐車場の確保・管理計画",                    en: "Parking area secured & management plan",      status: "pending" },
      { ja: "Roberts Hawaii シャトルサービスの契約",     en: "Roberts Hawaii shuttle contract",             status: "in_progress",note: { ja: "Sean が交渉中。スポンサー兼務の可能性あり", en: "Sean in talks — may double as sponsor" } },
      { ja: "機材・物品の輸送・倉庫手配",                en: "Equipment transport & storage",               status: "pending" },
      { ja: "会場内サイネージ・案内の制作",              en: "On-site signage & wayfinding",                status: "pending" },
      { ja: "廃棄物処理・リサイクル計画",                en: "Waste management & recycling plan",           status: "pending" },
    ],
  },

  // ── 12. 安全・医療 ────────────────────────────────────────────
  {
    ja: "安全・医療",
    en: "Safety & Medical",
    tasks: [
      { ja: "救護・医療チームの手配",                    en: "On-site medical team arranged",               status: "pending" },
      { ja: "ファーストエイドステーションの設置計画",    en: "First aid station setup plan",                status: "pending" },
      { ja: "緊急時対応マニュアルの作成",                en: "Emergency response manual created",           status: "pending" },
      { ja: "消防署・警察との事前協議",                  en: "Pre-event coordination with fire dept & police",status: "pending" },
      { ja: "危険物・薬物対策ポリシーの策定",            en: "Drugs & contraband policy defined",           status: "pending" },
    ],
  },

  // ── 13. テクノロジー・デジタル ────────────────────────────────
  {
    ja: "テクノロジー・デジタル",
    en: "Technology & Digital",
    tasks: [
      { ja: "公式サイトの本番化（solun.art）",           en: "Official site live (solun.art)",              status: "done",       note: { ja: "zamna-hawaii.fly.dev で稼働中", en: "Running on zamna-hawaii.fly.dev" } },
      { ja: "パートナーポータルの整備",                  en: "Partner portal complete",                     status: "done",       note: { ja: "NDA / 投資 / スポンサー契約・DB保存対応済", en: "NDA / investment / sponsor + DB storage live" } },
      { ja: "solun.art カスタムドメインの DNS 設定",     en: "solun.art custom domain DNS setup",           status: "in_progress",note: { ja: "Fly.io証明書発行済み (A: 66.241.124.10 / AAAA: 2a09:8280:1::da:eaa9:0) — CloudflareからDNS切替中", en: "Fly.io cert issued (A: 66.241.124.10 / AAAA: 2a09:8280:1::da:eaa9:0) — switching DNS from Cloudflare" } },
      { ja: "メール配信システムの構築",                  en: "Email marketing system setup",                status: "in_progress",note: { ja: "管理画面からメール一斉送信可能（/admin → メール登録タブ）", en: "Blast emails from admin panel (Emails tab)" } },
      { ja: "来場者向け Web ガイド / アプリの制作",      en: "Attendee web guide / app",                    status: "done",       note: { ja: "solun.art/guide で公開済み（タイムライン・アクセス・持ち物）", en: "Live at solun.art/guide — timeline, transport, packing list" } },
      { ja: "ライブ配信 / ストリーミングの検討",         en: "Live stream / broadcasting plan",             status: "pending" },
    ],
  },

  // ── 14. サステナビリティ ──────────────────────────────────────
  {
    ja: "サステナビリティ",
    en: "Sustainability",
    tasks: [
      { ja: "環境方針・グリーン宣言の策定",              en: "Environmental policy & green pledge",         status: "done",       note: { ja: "サイト掲載済み（/guide — ZAMNA GREEN PLEDGE）", en: "Published on site (/guide — ZAMNA GREEN PLEDGE)" } },
      { ja: "使い捨てプラスチックゼロの実施計画",        en: "Single-use plastic-free plan",                status: "in_progress",note: { ja: "方針掲載済み・現地運営チームと詳細詰め中", en: "Policy published — coordinating with on-site ops team" } },
      { ja: "カーボンオフセット計画",                    en: "Carbon offset program",                       status: "pending" },
      { ja: "地域コミュニティ・環境保護への貢献策",      en: "Local community & environmental contribution", status: "pending" },
    ],
  },

  // ── 15. イベント後 ────────────────────────────────────────────
  {
    ja: "イベント後（アフターケア）",
    en: "Post-Event",
    tasks: [
      { ja: "投資家への返済・報告（チケット売上 First-out）",en: "Investor repayment (ticket revenue First-out)",status: "pending" },
      { ja: "スポンサー向け効果レポートの送付",          en: "Sponsor post-event impact report",            status: "pending" },
      { ja: "アフタームービーの公開",                    en: "After-movie release",                         status: "pending" },
      { ja: "来場者アンケートの実施・集計",              en: "Attendee survey & analysis",                  status: "pending" },
      { ja: "ZAMNA HAWAII 2027 の検討開始",              en: "ZAMNA HAWAII 2027 planning begins",           status: "pending" },
    ],
  },
];

const KPI = [
  { value: "Sep 4–5, 2026", label: { ja: "開催日（Labor Day週末）", en: "Event dates (Labor Day wknd)" } },
  { value: "9,000/day",     label: { ja: "想定来場者数（/日）",     en: "Expected attendance (per day)" } },
  { value: "$200,000",      label: { ja: "調達目標",               en: "Fundraise target" } },
  { value: "VIP $1,000+",   label: { ja: "VIPチケット最低価格",    en: "VIP ticket starting price" } },
  { value: "+850,000",      label: { ja: "ZAMNAグローバル来場実績", en: "ZAMNA global attendance" } },
  { value: "1.25M",         label: { ja: "ZAMNAグローバルSNS",     en: "ZAMNA global social followers" } },
];

// ── Team ──────────────────────────────────────────────────────────────────────
type TeamMember = { name: string; ja_role: string; en_role: string; status: "active" | "tbd"; img?: string };
const TEAM: TeamMember[] = [
  { name: "Sean Tsai",    ja_role: "現地統括 / プロダクション",  en_role: "Local Lead / Production",    status: "active", img: "https://ui-avatars.com/api/?name=Sean+Tsai&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
  { name: "Sid",          ja_role: "会場選定 / 行政ルート",      en_role: "Venue / Gov Relations",      status: "active", img: "https://ui-avatars.com/api/?name=S&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
  { name: "Vakas",        ja_role: "出資 / 財務 / アーティスト関係",  en_role: "Investment / Finance / Artist Relations",  status: "active", img: "https://ui-avatars.com/api/?name=V+S&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
  { name: "Keyanna",      ja_role: "オペレーション / 連絡調整",  en_role: "Operations / Coordination",  status: "active", img: "https://ui-avatars.com/api/?name=K&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
  { name: "Yuki",         ja_role: "テクノロジー / サイト",      en_role: "Technology / Website",        status: "active", img: "https://ui-avatars.com/api/?name=Y+H&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
];

// ── Partner CRM ──────────────────────────────────────────────────────────────
type PartnerStatus = "confirmed" | "in_progress" | "outreach" | "pending";
const PS: Record<PartnerStatus, { ja: string; en: string; color: string }> = {
  confirmed:   { ja: "確定",     en: "Confirmed",   color: "rgba(74,222,128,0.9)" },
  in_progress: { ja: "進行中",   en: "In Progress", color: "rgba(201,169,98,0.9)" },
  outreach:    { ja: "連絡済",   en: "Outreach",    color: "rgba(100,180,255,0.8)" },
  pending:     { ja: "未着手",   en: "Pending",     color: "rgba(255,255,255,0.35)" },
};

type Partner = {
  name: string;
  contact: string;
  type_ja: string;
  type_en: string;
  status: PartnerStatus;
  notes_ja: string;
  notes_en: string;
  email?: string;
  phone?: string;
  who: string;
  instagram?: string;
  link?: string;
};

const PARTNERS: Partner[] = [
  { name: "HPD (Manny)", contact: "Manny", type_ja: "警察/セキュリティ", type_en: "Police / Security", status: "in_progress", notes_ja: "元警察署長。会場/地図確定後にセキュリティ相談", notes_en: "Ex-chief of police. Security consult after venue/map finalized", phone: "", who: "Sean/Sid" },
  { name: "HPD (Doug)", contact: "Doug", type_ja: "警察", type_en: "Police", status: "pending", notes_ja: "Sidが手紙を書く", notes_en: "Sid to write a letter", who: "Sean/Sid" },
  { name: "Waiʻalae Country Club", contact: "Carl", type_ja: "VIP/会場", type_en: "VIP / Venue", status: "in_progress", notes_ja: "Kahalaオーナー、Waiʻalae CC副社長", notes_en: "Owns Kahala, VP of Waiʻalae CC", who: "Sean/Sid" },
  { name: "Moanalua Gardens", contact: "JP Damon", type_ja: "会場オーナー", type_en: "Venue Owner", status: "in_progress", notes_ja: "3月第1週までにフォローアップ。地域住民への寄付でグッドウィル", notes_en: "Follow up before end of March wk1. Donate to cover local price increase (goodwill)", who: "Sean/Sid", link: "https://www.moanaluagardens.com/" },
  { name: "Hawaii Stage & Lighting", contact: "Kuhio Lewis", type_ja: "ステージ/照明", type_en: "Stage / Lighting", status: "in_progress", notes_ja: "Kaula Luauオーナー。Hawaiian Counsel CEO。3月第1週までにフォロー", notes_en: "Owner Kaula Luau. CEO Hawaiian Counsel. Follow up March wk1", phone: "8083892006", who: "Sid", link: "https://www.hawaii-stage.com/" },
  { name: "Hawaii Tourism", contact: "Roy Tokujo", type_ja: "観光連携", type_en: "Tourism", status: "pending", notes_ja: "ハワイ観光の創設者。最長記録のルアウ", notes_en: "Founder of Hawaii Tourism. Longest running luau", phone: "8082262727", who: "" },
  { name: "Centered", contact: "Miko / Sound Sexy", type_ja: "プロモーター", type_en: "Promoter", status: "outreach", notes_ja: "木曜19時以降に通話を移動", notes_en: "Move call to after 7 PM Thursday", who: "" },
  { name: "Lit & Beyond", contact: "Gilly / Tropic Bamba", type_ja: "プロモーター", type_en: "Promoter", status: "outreach", notes_ja: "", notes_en: "", phone: "8084605056", who: "" },
  { name: "Lit & Beyond", contact: "Jean Jauque", type_ja: "プロモーター", type_en: "Promoter", status: "pending", notes_ja: "", notes_en: "", who: "" },
  { name: "Audiophile", contact: "Lee Anderson", type_ja: "プロモーター(競合)", type_en: "Promoter (Competitor)", status: "in_progress", notes_ja: "島のトップEDM。情報共有に慎重。レンタル費用未確定", notes_en: "Top EDM on island. Tight on sharing info. Figuring out rent", phone: "8087816522", who: "" },
  { name: "Audiophile", contact: "Brandon", type_ja: "音響技術", type_en: "Stage Tech / Sound", status: "pending", notes_ja: "", notes_en: "", email: "brandon@wearemetta.com", phone: "8082940427", who: "" },
  { name: "TMR / Reggae Festival", contact: "Ray Jr.", type_ja: "島内パートナー", type_en: "Island Partner", status: "pending", notes_ja: "連絡する", notes_en: "To reach out", phone: "8089541077", who: "" },
  { name: "Palm Tree / Electric Palm", contact: "Taylor", type_ja: "パートナー", type_en: "Partner", status: "pending", notes_ja: "連絡する", notes_en: "To reach out", who: "" },
  { name: "Rare Day", contact: "Luka", type_ja: "映像制作", type_en: "Video Production", status: "in_progress", notes_ja: "契約未署名。早急に再交渉が必要", notes_en: "Contract never signed. Renegotiation needed ASAP", who: "" },
  { name: "Video / Kuala Ranch", contact: "Keppra", type_ja: "映像/イベント", type_en: "Video / Events", status: "pending", notes_ja: "Hawaii Harley GM。Kuala Ranch コネクション。Bombastic MV", notes_en: "Hawaii Harley GM. Kuala Ranch connect. Bombastic Music Video", phone: "8082185824", who: "" },
  { name: "", contact: "Allen Arato", type_ja: "バー/飲食", type_en: "Bar / F&B", status: "pending", notes_ja: "Tom Muffetから引き継ぎ。Mai Tai's", notes_en: "Tom Muffet passing down to him. Mai Tai's", email: "alanarato@gmail.com", phone: "8087489870", who: "" },
  { name: "", contact: "Michael Scalera", type_ja: "テック/QR", type_en: "Tech / QR", status: "pending", notes_ja: "AI Scan Codes/QA/チャットボット。GaranTEE Tシャツ（クロスプロモ）", notes_en: "AI Scan Codes/QA/Chatbots. GaranTEE tshirt co (cross promote)", phone: "8084790335", who: "" },
  { name: "David & Dominic Vargas", contact: "David / Dominic", type_ja: "プロモーター", type_en: "Promoters (Sid)", status: "pending", notes_ja: "双子。Sidのプロモーター", notes_en: "Twins. Promoters for Sid", email: "davidvargas909@yahoo.com", phone: "8087829830", who: "Sid" },
  { name: "Fire (Taylor)", contact: "Taylor", type_ja: "ファイアーダンス", type_en: "Fire Spinner", status: "pending", notes_ja: "", notes_en: "", instagram: "Twisted.taay", who: "" },
  { name: "Fire (Maddie)", contact: "Maddie", type_ja: "ファイアーダンス", type_en: "Fire / Seraphix Entertainment", status: "pending", notes_ja: "Seraphix Entertainment", notes_en: "Seraphix Entertainment", who: "" },
  { name: "Decorations", contact: "Nia", type_ja: "装飾", type_en: "Decorations", status: "pending", notes_ja: "", notes_en: "", who: "" },
  { name: "DJ", contact: "Lizzie / DJ Fyrie", type_ja: "DJ/プロデューサー", type_en: "DJ / Producer", status: "pending", notes_ja: "", notes_en: "", who: "" },
  { name: "Bro Security Aether", contact: "Aether", type_ja: "セキュリティ", type_en: "Security", status: "pending", notes_ja: "", notes_en: "", phone: "8084765162", who: "" },
  { name: "Vibelab", contact: "Jovan", type_ja: "マーケティング", type_en: "Marketing / Promo", status: "in_progress", notes_ja: "2/17ミーティング済み。ラインナップ発表後にプッシュ強化希望", notes_en: "Meeting done 2/17. Wants more aggressive push once lineup announced", who: "" },
];

// ── Venue Pros / Cons ─────────────────────────────────────────────────────────
// ── Shared Resources ─────────────────────────────────────────────────────────
type SharedResource = { ja: string; en: string; url: string; icon: string; cat_ja: string; cat_en: string };
const SHARED_RESOURCES: SharedResource[] = [
  { ja: "Google Drive（全チーム共有）",           en: "Google Drive (Team Shared)",           url: "https://drive.google.com/drive/folders/0AFx6F488-MxQUk9PVA",         icon: "📁", cat_ja: "ファイル", cat_en: "Files" },
  { ja: "パートナー連絡先リスト",                 en: "Partner Contact List",                  url: "https://docs.google.com/spreadsheets/d/1vcUVIE7CX4Lvb_MJphHPy2ZJ8_Z3RZv_A3vwZ3ybUsA/edit?gid=1147233400#gid=1147233400", icon: "📊", cat_ja: "スプレッドシート", cat_en: "Spreadsheet" },
  { ja: "チームミーティング (Google Meet)",        en: "Team Meeting (Google Meet)",             url: "https://meet.google.com/mqf-rmdm-nkc",                              icon: "📹", cat_ja: "ミーティング", cat_en: "Meeting" },
  { ja: "Moanalua Gardens（会場候補 #1）",         en: "Moanalua Gardens (Venue #1)",            url: "https://www.moanaluagardens.com/",                                   icon: "🌴", cat_ja: "会場",     cat_en: "Venue" },
  { ja: "チケット販売 (Ticketblox)",               en: "Ticket Sales (Ticketblox)",              url: "https://zamnahawaii.ticketblox.com",                                  icon: "🎟", cat_ja: "チケット", cat_en: "Tickets" },
  { ja: "管理ダッシュボード",                      en: "Admin Dashboard",                        url: "/admin",                                                             icon: "⚙", cat_ja: "管理",     cat_en: "Admin" },
];

const VENUE_PROS = [
  { ja: "Waikikiから近い（車約12分）— 観光客の動線に乗せやすい", en: "Close to Waikiki (~12 min drive) — easy for tourists" },
  { ja: "圧倒的な自然景観（日立の樹 100年超）— LED演出コスト削減", en: "Stunning natural scenery (Hitachi tree, 100+ yrs) — reduces LED costs" },
  { ja: "オーナー（JP Damon）が長期開発に100%前向き", en: "Owner (JP Damon) is 100% supportive for long-term EDM development" },
  { ja: "初回キャパ 9,000人/日、将来的には倍以上も可能", en: "Initial 9,000/day capacity, potential for double or more" },
  { ja: "レンタル費が非常にリーズナブル（非公演日$4K / 公演日$8K）", en: "Very affordable rental ($4K non-show / $8K show days)" },
  { ja: "F&B 100%自社運営（利益率最大化）", en: "100% F&B revenue kept (maximize margins)" },
  { ja: "Home Depotが高速道路の向かい側（機材調達が容易）", en: "Home Depot across the freeway (easy equipment sourcing)" },
  { ja: "Hawaii Stage & Lighting と接触済み（Bruno Mars機材所有）", en: "Connected with Hawaii Stage & Lighting (owns Bruno Mars gear)" },
  { ja: "日本から寄贈された日立の樹の歴史的意義", en: "Historical significance of Hitachi tree donated from Japan" },
];
const VENUE_CONCERNS = [
  { ja: "2025年2月のMarleyイベントで近隣トラブル（住宅街への駐車・水道管影響）", en: "Feb 2025 Marley event caused neighbor issues (residential parking, water lines affected)" },
  { ja: "市・政治ルートを通した承認が必要（Sid + Seanの政治ネットワークで対応中）", en: "City & political route approval required (Sid + Sean leveraging political network)" },
  { ja: "駐車場・導線管理の計画が必須（シャトル中心の設計）", en: "Parking & traffic plan essential (shuttle-first design)" },
  { ja: "水道/設備の配慮が必要（JP Damonから配管図受領済み）", en: "Water/utility needs attention (blueprint with sprinkler/water lines received from JP Damon)" },
  { ja: "弁護士・オーナー・市側の三方合意が前提", en: "Lawyer + Owner + City alignment required" },
  { ja: "時間制限あり（3PM-10PM想定 + 別料金のアフターパーティー）", en: "Time-limited (3PM-10PM proposed + separate paid after-party)" },
];

// ── Gantt ─────────────────────────────────────────────────────────────────
const G_START = new Date("2026-01-01").getTime();
const G_END   = new Date("2026-10-01").getTime();
const G_TOTAL = G_END - G_START;
const dp = (s: string) => Math.min(100, Math.max(0, (new Date(s).getTime() - G_START) / G_TOTAL * 100));
const GM = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"];

type GStatus = Status | "event";
const GANTT: { ja: string; en: string; start: string; end: string; s: GStatus }[] = [
  { ja: "出資金 $200K 調達",         en: "Investment Raise $200K",  start: "2026-02-01", end: "2026-04-15", s: "urgent" },
  { ja: "ZAMNAライセンス締結",       en: "ZAMNA Brand License",     start: "2026-02-01", end: "2026-03-31", s: "in_progress" },
  { ja: "会場契約 (Moanalua Gardens)", en: "Venue Contract",          start: "2026-02-01", end: "2026-03-31", s: "in_progress" },
  { ja: "ホテル在庫確保 500室",      en: "Hotel Block (500 rooms)", start: "2026-02-15", end: "2026-03-31", s: "urgent" },
  { ja: "チケット販売 (Ticketblox)", en: "Ticket Sales Live",       start: "2026-02-08", end: "2026-09-05", s: "done" },
  { ja: "イベント許可申請",          en: "Event Permits",           start: "2026-02-15", end: "2026-05-31", s: "in_progress" },
  { ja: "会場承認 (行政・近隣)",     en: "Venue Approval (City)",    start: "2026-03-01", end: "2026-04-30", s: "urgent" },
  { ja: "ヘッドライナー契約",        en: "Headliner Booking",       start: "2026-03-01", end: "2026-04-30", s: "urgent" },
  { ja: "アーティストビザ申請",      en: "Artist Visa (O-1/P-1)",   start: "2026-03-01", end: "2026-07-31", s: "pending" },
  { ja: "Sydney コラボ / Pre-Event", en: "Sydney Collab / Pre-Event",start: "2026-03-15", end: "2026-05-31", s: "in_progress" },
  { ja: "音響・照明業者契約",        en: "Production Vendors",      start: "2026-04-01", end: "2026-06-30", s: "pending" },
  { ja: "プレス・広告展開",          en: "Press & Ad Campaign",     start: "2026-04-01", end: "2026-07-31", s: "pending" },
  { ja: "ラインナップ発表",          en: "Lineup Announcement",     start: "2026-05-01", end: "2026-06-30", s: "pending" },
  { ja: "スタッフ採用 (30-50名)",    en: "Staff Hiring",            start: "2026-06-01", end: "2026-08-15", s: "pending" },
  { ja: "ZAMNA HAWAII 開催",         en: "EVENT DAY",               start: "2026-09-04", end: "2026-09-05", s: "event" },
];

type Submission = {
  id: number;
  contract_type: string;
  name: string | null;
  company: string | null;
  email: string | null;
  amount: string | null;
  structure: string | null;
  return_type: string | null;
  sponsor_package: string | null;
  contact_person: string | null;
  signature: string;
  lang: string;
  paid: number;
  stripe_session_id: string | null;
  created_at: string;
};

type EmailSignup = {
  id: number;
  email: string;
  locale: string;
  created_at: string;
};

type MeetingRequest = {
  id: number;
  meeting_type: string;
  name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  date: string | null;
  time_slot: string | null;
  message: string | null;
  lang: string;
  created_at: string;
};

function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = filename;
  a.click();
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"ja" | "en">(() => getSavedLang());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [emailSignups, setEmailSignups] = useState<EmailSignup[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"contracts" | "emails" | "meetings">("contracts");
  const [blastSubject, setBlastSubject] = useState("");
  const [blastBodyJa, setBlastBodyJa] = useState("");
  const [blastBodyEn, setBlastBodyEn] = useState("");
  const [blastTest, setBlastTest] = useState("");
  const [blastSending, setBlastSending] = useState(false);
  const [blastResult, setBlastResult] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Status>>({});
  const [member, setMember] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [pendingMember, setPendingMember] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [viewHistory, setViewHistory] = useState<AdminView[]>([]);
  const [nftPasses, setNftPasses] = useState<NftPass[]>([]);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const { publicKey, connected } = useWallet();
  const ja = lang === "ja";

  const getEffectiveStatus = useCallback((sIdx: number, tIdx: number, defaultStatus: Status): Status => {
    const key = `${sIdx}:${tIdx}`;
    return overrides[key] ?? defaultStatus;
  }, [overrides]);

  const cycleStatus = useCallback((sIdx: number, tIdx: number, currentStatus: Status) => {
    const idx = STATUS_CYCLE.indexOf(currentStatus);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    const key = `${sIdx}:${tIdx}`;
    setOverrides(prev => ({ ...prev, [key]: next }));
    fetch(`/api/task-overrides/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
      body: JSON.stringify({ status: next, updated_by: member }),
    }).catch(() => {});
  }, [member]);

  useEffect(() => {
    // 1. ?key= URL parameter
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("key");
    if (urlKey === "LIFEISART") {
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (document.cookie.split(";").some(c => c.trim().startsWith("zamna_authed="))) {
      // 2. Admin server cookie (set by admin-server.js)
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
    } else if (sessionStorage.getItem("admin_auth") === "1") {
      // 3. Session storage (password login)
      setAuthed(true);
    }
    // Load saved member
    const saved = localStorage.getItem("zamna_member");
    if (saved) setMember(saved);
    else setShowMemberModal(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const headers = { "x-admin-key": "LIFEISART" } as Record<string, string>;
    fetch("/api/submissions", { headers }).then(r => r.ok ? r.json() : []).then(setSubmissions).catch(() => {});
    fetch("/api/emails", { headers }).then(r => r.ok ? r.json() : []).then(setEmailSignups).catch(() => {});
    fetch("/api/meetings", { headers }).then(r => r.ok ? r.json() : []).then(setMeetings).catch(() => {});
    // Load task overrides
    fetch("/api/task-overrides", { headers })
      .then(r => r.ok ? r.json() : [])
      .then((rows: TaskOverride[]) => {
        const map: Record<string, Status> = {};
        rows.forEach(r => { map[r.task_key] = r.status; });
        setOverrides(map);
      }).catch(() => {});
    // Load view history
    fetch("/api/admin-views", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setViewHistory).catch(() => {});
    // Load NFT passes
    fetch("/api/nft-passes", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setNftPasses).catch(() => {});
  }, [authed]);

  // Record view when member is set
  useEffect(() => {
    if (!authed || !member) return;
    fetch("/api/admin-views", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
      body: JSON.stringify({ member }),
    }).catch(() => {});
  }, [authed, member]);

  const handleBlast = async (isTest: boolean) => {
    if (!blastSubject || (!blastBodyJa && !blastBodyEn)) return;
    setBlastSending(true); setBlastResult(null);
    try {
      const body: Record<string, string> = { subject: blastSubject, body_ja: blastBodyJa, body_en: blastBodyEn };
      if (isTest) body.test_email = blastTest || "info@solun.art";
      const r = await fetch("/api/email-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (isTest) setBlastResult(ja ? `テスト送信完了 → ${body.test_email}` : `Test sent → ${body.test_email}`);
      else setBlastResult(ja ? `送信完了: ${d.sent}件成功 / ${d.failed}件失敗` : `Sent: ${d.sent} OK / ${d.failed} failed`);
    } catch { setBlastResult(ja ? "エラーが発生しました" : "Error occurred"); }
    setBlastSending(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "LIFEISART") {
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
      if (!localStorage.getItem("zamna_member")) setShowMemberModal(true);
    } else {
      setError(ja ? "パスワードが正しくありません" : "Incorrect password");
    }
  };

  const selectMember = (name: string) => {
    const welcomed = localStorage.getItem("zamna_welcomed");
    if (!welcomed) {
      setPendingMember(name);
      setShowEmailStep(true);
      setMemberEmail("");
      setEmailSent(false);
    } else {
      setMember(name);
      localStorage.setItem("zamna_member", name);
      setShowMemberModal(false);
    }
  };

  const handleWelcomeEmail = async () => {
    if (!pendingMember || !memberEmail || !memberEmail.includes("@")) return;
    setEmailSending(true);
    try {
      const r = await fetch("/api/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify({ member: pendingMember, email: memberEmail }),
      });
      if (r.ok) {
        setEmailSent(true);
        localStorage.setItem("zamna_welcomed", "1");
        localStorage.setItem("zamna_member_email", memberEmail);
        setTimeout(() => {
          setMember(pendingMember);
          localStorage.setItem("zamna_member", pendingMember!);
          setShowEmailStep(false);
          setShowMemberModal(false);
        }, 2000);
      }
    } catch { /* ignore */ }
    setEmailSending(false);
  };

  const skipWelcomeEmail = () => {
    if (!pendingMember) return;
    localStorage.setItem("zamna_welcomed", "1");
    setMember(pendingMember);
    localStorage.setItem("zamna_member", pendingMember);
    setShowEmailStep(false);
    setShowMemberModal(false);
  };

  const claimPass = async (passId: number) => {
    if (!connected || !publicKey) return;
    setClaimingId(passId);
    try {
      const r = await fetch(`/api/nft-passes/${passId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify({ wallet: publicKey.toBase58(), member }),
      });
      if (r.ok) {
        setNftPasses(prev => prev.filter(p => p.id !== passId));
      }
    } catch { /* ignore */ }
    setClaimingId(null);
  };

  if (!authed) {
    return (
      <main style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Lang toggle on login screen */}
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}>
          <button
            onClick={() => setLang(l => l === "ja" ? "en" : "ja")}
            style={{ padding: "5px 12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}
          >{ja ? "EN" : "JA"}</button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 1 }}>
          <a href="/" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 40 }}>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: "0.3em", color: "#fff" }}>ZAMNA HAWAII</p>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginTop: 4 }}>
              {ja ? "運営 · 内部限定" : "Operations · Internal"}
            </p>
          </a>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "36px 32px" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
              {ja ? "運営ページ" : "Operations Dashboard"}
            </p>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder={ja ? "パスワード" : "Password"}
                autoFocus
                style={{
                  padding: "13px 16px", background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif",
                }}
              />
              {error && <p style={{ color: "rgba(255,100,100,0.9)", fontSize: 13, margin: 0 }}>{error}</p>}
              <button type="submit" style={{
                padding: "13px 0", borderRadius: 999, background: "rgba(201,169,98,0.15)",
                border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.9)",
                fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer",
              }}>{ja ? "入室" : "Enter"}</button>
            </form>
          </div>
        </motion.div>
      </main>
    );
  }

  const allTasks = SECTIONS.flatMap((s, sIdx) => s.tasks.map((t, tIdx) => ({ ...t, effectiveStatus: getEffectiveStatus(sIdx, tIdx, t.status) })));
  const doneCnt   = allTasks.filter(t => t.effectiveStatus === "done").length;
  const totalCnt  = allTasks.length;
  const urgentCnt = allTasks.filter(t => t.effectiveStatus === "urgent").length;

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.05) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Member selection modal */}
      {showMemberModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "32px 28px", maxWidth: 360, width: "100%" }}>
            <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>ZAMNA HAWAII</p>

            {!showEmailStep ? (
              <>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{ja ? "あなたは誰ですか？" : "Who are you?"}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TEAM.filter(m => m.status === "active").map(m => (
                    <button key={m.name} onClick={() => selectMember(m.name)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textAlign: "left" }}>
                      <img src={m.img} alt={m.name} style={{ width: 36, height: 36, borderRadius: "50%" }} />
                      <div>
                        <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{m.name}</p>
                        <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 11 }}>{ja ? m.ja_role : m.en_role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  {ja ? `${pendingMember}さん、ようこそ！` : `Welcome, ${pendingMember}!`}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                  {ja
                    ? "メールアドレスを入力してください。プロジェクトの概要とダッシュボードの使い方をお送りします。"
                    : "Enter your email to receive a welcome guide with project overview and dashboard capabilities."}
                </p>

                {emailSent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <p style={{ color: "rgba(74,222,128,0.9)", fontSize: 28, marginBottom: 8 }}>✓</p>
                    <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 14, fontWeight: 600 }}>
                      {ja ? "送信しました！" : "Email sent!"}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>{memberEmail}</p>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handleWelcomeEmail(); }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={e => setMemberEmail(e.target.value)}
                      placeholder={ja ? "メールアドレス" : "Email address"}
                      autoFocus
                      required
                      style={{
                        padding: "13px 16px", background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                        color: "#fff", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif",
                      }}
                    />
                    <button type="submit" disabled={emailSending || !memberEmail.includes("@")}
                      style={{
                        padding: "13px 0", borderRadius: 999, background: "rgba(201,169,98,0.15)",
                        border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.9)",
                        fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer",
                        opacity: emailSending ? 0.5 : 1,
                      }}>
                      {emailSending
                        ? (ja ? "送信中..." : "Sending...")
                        : (ja ? "ウェルカムメールを受け取る" : "Send Welcome Email")}
                    </button>
                    <button type="button" onClick={skipWelcomeEmail}
                      style={{
                        padding: "10px 0", background: "transparent", border: "none",
                        color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer",
                      }}>
                      {ja ? "スキップ" : "Skip"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(8,8,8,0.92)", backdropFilter: "blur(12px)",
      }}>
        <a href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
          ZAMNA HAWAII
        </a>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {member && (
            <button onClick={() => setShowMemberModal(true)}
              style={{ padding: "4px 10px", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "rgba(201,169,98,0.08)", color: "rgba(201,169,98,0.8)", letterSpacing: "0.06em" }}>
              {member}
            </button>
          )}
          <span style={{ fontSize: 11, color: "rgba(201,169,98,0.6)", letterSpacing: "0.15em" }}>OPERATIONS</span>
          <button
            onClick={() => setLang(l => l === "ja" ? "en" : "ja")}
            style={{ padding: "4px 10px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.35)" }}
          >{ja ? "EN" : "JA"}</button>
          <button
            onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }}
            style={{ padding: "4px 10px", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,80,80,0.5)" }}
          >{ja ? "退出" : "Exit"}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 16 }}>
            Internal · Confidential · 2026
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.4rem,8vw,4rem)", color: "#fff", marginBottom: 12 }}>
            {ja ? "ZAMNA HAWAII 運営状況" : "ZAMNA HAWAII Operations"}
          </h1>

          {/* Progress bar */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 999, height: 6, marginBottom: 8 }}>
            <div style={{ background: "rgba(74,222,128,0.7)", borderRadius: 999, height: 6, width: `${Math.round(doneCnt / totalCnt * 100)}%`, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{doneCnt}/{totalCnt} {ja ? "タスク完了" : "tasks done"}</p>
            {urgentCnt > 0 && <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 12 }}>⚠ {urgentCnt} {ja ? "件 要対応" : "urgent"}</p>}
          </div>
          {/* View history */}
          {viewHistory.length > 0 && (
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8 }}>
              {viewHistory.map((v, i) => (
                <span key={v.member}>
                  {i > 0 && " · "}
                  <span style={{ color: "rgba(201,169,98,0.5)" }}>{v.member}</span>{" "}
                  {timeAgo(v.last_viewed, ja)}
                </span>
              ))}
            </p>
          )}
        </motion.div>

        {/* KPIs */}
        <motion.div {...fade} style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 48, gridAutoRows: "1fr" }}>
          {KPI.map(k => (
            <div key={k.value} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px" }}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "clamp(1.2rem,4vw,1.6rem)", marginBottom: 4 }}>{k.value}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{k.label[lang]}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Team ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16, letterSpacing: "0.06em" }}>
            {ja ? "チーム体制" : "Team"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${m.status === "tbd" ? "rgba(255,255,255,0.05)" : "rgba(201,169,98,0.15)"}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <img src={m.img} alt={m.name} style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, opacity: m.status === "tbd" ? 0.4 : 1 }} />
                <div>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m.name}</p>
                  <p style={{ color: m.status === "tbd" ? "rgba(255,255,255,0.3)" : "rgba(201,169,98,0.7)", fontSize: 11 }}>{ja ? m.ja_role : m.en_role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Venue Assessment ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 4, letterSpacing: "0.06em" }}>
            {ja ? "会場評価 — Moanalua Gardens (JP Damon)" : "Venue Assessment — Moanalua Gardens (JP Damon)"}
          </h2>
          <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 11, letterSpacing: "0.15em", marginBottom: 4 }}>
            {ja ? "#1 候補 — Sid 推薦 (3/1)" : "#1 CHOICE — Recommended by Sid (3/1)"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 16, lineHeight: 1.6 }}>
            {ja
              ? "レンタル: 非公演日$4K / 公演日$8K · キャパ: 9,000人/日（拡張可） · F&B: 100%自社 · 営業時間案: 15:00-22:00 + アフターパーティー"
              : "Rental: $4K non-show / $8K show · Capacity: 9,000/day (expandable) · F&B: 100% kept · Hours: 3PM-10PM + after party"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 10 }}>{ja ? "強み" : "STRENGTHS"}</p>
              {VENUE_PROS.map((p, i) => (
                <p key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5, marginBottom: 6, paddingLeft: 10, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "rgba(74,222,128,0.6)" }}>+</span>
                  {ja ? p.ja : p.en}
                </p>
              ))}
            </div>
            <div style={{ background: "rgba(255,80,80,0.04)", border: "1px solid rgba(255,80,80,0.12)", borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 10 }}>{ja ? "懸念・リスク" : "CONCERNS"}</p>
              {VENUE_CONCERNS.map((c, i) => (
                <p key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5, marginBottom: 6, paddingLeft: 10, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "rgba(255,80,80,0.6)" }}>!</span>
                  {ja ? c.ja : c.en}
                </p>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Document Hub ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 6, letterSpacing: "0.06em" }}>
            {ja ? "ドキュメント管理" : "Document Hub"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
            {ja ? "閲覧・PDF生成・リンク共有・契約署名" : "View, generate PDF, share link, sign contracts"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {([
              // 内部資料
              { href: "/production",       ja: "制作計画",           en: "Production Plan",       cat_ja: "内部資料", cat_en: "Internal",  canPdf: true,  canSign: false },
              { href: "/safety",           ja: "安全管理計画",       en: "Safety Plan",           cat_ja: "内部資料", cat_en: "Internal",  canPdf: true,  canSign: false },
              { href: "/staff",            ja: "スタッフマニュアル", en: "Staff Manual",          cat_ja: "内部資料", cat_en: "Internal",  canPdf: true,  canSign: false },
              { href: "/schedule",         ja: "面談予約",           en: "Meeting Schedule",      cat_ja: "内部資料", cat_en: "Internal",  canPdf: false, canSign: false },
              // 財務
              { href: "/budget",           ja: "収支計画書",         en: "Budget & P&L",          cat_ja: "財務",     cat_en: "Finance",   canPdf: true,  canSign: false },
              // 対外資料
              { href: "/press",            ja: "プレスキット",       en: "Press Kit",             cat_ja: "対外資料", cat_en: "External",  canPdf: true,  canSign: false },
              { href: "/sponsor",          ja: "スポンサーデック",   en: "Sponsor Deck",          cat_ja: "対外資料", cat_en: "External",  canPdf: true,  canSign: false },
              { href: "/investor",         ja: "投資家デック",       en: "Investor Deck",         cat_ja: "対外資料", cat_en: "External",  canPdf: true,  canSign: false },
              { href: "/deal",             ja: "ディールサマリー",   en: "Deal Summary",          cat_ja: "対外資料", cat_en: "External",  canPdf: true,  canSign: false },
              // 契約
              { href: "/venue-agreement",  ja: "会場使用契約書",     en: "Venue Agreement",       cat_ja: "契約",     cat_en: "Contract",  canPdf: true,  canSign: true },
              { href: "/artist-contract",  ja: "アーティスト出演契約",en: "Artist Contract",      cat_ja: "契約",     cat_en: "Contract",  canPdf: true,  canSign: true },
              { href: "/contract?type=nda",ja: "NDA（秘密保持契約）",en: "NDA",                   cat_ja: "契約",     cat_en: "Contract",  canPdf: false, canSign: true },
              { href: "/contract?type=investment", ja: "投資契約", en: "Investment Agreement",    cat_ja: "契約",     cat_en: "Contract",  canPdf: false, canSign: true },
              { href: "/contract?type=sponsor",    ja: "スポンサー契約", en: "Sponsor Agreement", cat_ja: "契約",     cat_en: "Contract",  canPdf: false, canSign: true },
              // 公開ページ
              { href: "/",                 ja: "トップページ",       en: "Home",                  cat_ja: "公開",     cat_en: "Public",    canPdf: false, canSign: false },
              { href: "/lineup",           ja: "ラインナップ",       en: "Lineup",                cat_ja: "公開",     cat_en: "Public",    canPdf: false, canSign: false },
              { href: "/vip",              ja: "VIPチケット",        en: "VIP Tickets",           cat_ja: "公開",     cat_en: "Public",    canPdf: false, canSign: false },
              { href: "/guide",            ja: "当日ガイド",         en: "Event Guide",           cat_ja: "公開",     cat_en: "Public",    canPdf: true,  canSign: false },
              { href: "/info",             ja: "アクセス・FAQ",      en: "Info & FAQ",            cat_ja: "公開",     cat_en: "Public",    canPdf: false, canSign: false },
              { href: "/privacy",          ja: "プライバシーポリシー",en: "Privacy Policy",       cat_ja: "法務",     cat_en: "Legal",     canPdf: true,  canSign: false },
              { href: "/terms",            ja: "利用規約",           en: "Terms of Service",      cat_ja: "法務",     cat_en: "Legal",     canPdf: true,  canSign: false },
              // NFT / Web3
              { href: "/mint",             ja: "NFTミント",          en: "Mint Pass",             cat_ja: "Web3",     cat_en: "Web3",      canPdf: false, canSign: false },
              { href: "/vip-lounge",       ja: "VIPラウンジ",        en: "VIP Lounge",            cat_ja: "Web3",     cat_en: "Web3",      canPdf: false, canSign: false },
              { href: "/artist-lounge",    ja: "アーティストラウンジ",en: "Artist Lounge",        cat_ja: "Web3",     cat_en: "Web3",      canPdf: false, canSign: false },
              { href: "/login",            ja: "パートナーログイン", en: "Partner Login",          cat_ja: "管理",     cat_en: "Admin",     canPdf: false, canSign: false },
            ] as const).map(d => {
              const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://solun.art";
              const fullUrl = `${baseUrl}${d.href}`;
              const catColor = d.cat_en === "Contract" ? "rgba(201,169,98,0.7)" : d.cat_en === "External" ? "rgba(74,222,128,0.6)" : d.cat_en === "Finance" ? "rgba(100,180,255,0.6)" : d.cat_en === "Public" ? "rgba(255,255,255,0.4)" : d.cat_en === "Legal" ? "rgba(250,204,21,0.6)" : d.cat_en === "Web3" ? "rgba(168,85,247,0.7)" : d.cat_en === "Admin" ? "rgba(255,80,80,0.6)" : "rgba(255,255,255,0.3)";
              return (
                <div key={d.href} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 9, color: catColor, border: `1px solid ${catColor}`, borderRadius: 999, padding: "1px 7px", letterSpacing: "0.1em", flexShrink: 0 }}>
                        {ja ? d.cat_ja : d.cat_en}
                      </span>
                      <a href={d.href} style={{ color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ja ? d.ja : d.en}
                      </a>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {/* View */}
                    <a href={d.href} style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 11, textDecoration: "none", cursor: "pointer" }}>
                      {ja ? "閲覧" : "View"}
                    </a>
                    {/* Copy Link */}
                    <button
                      onClick={() => { navigator.clipboard.writeText(fullUrl); const el = document.getElementById(`cp-${d.href}`); if (el) { el.textContent = "✓"; setTimeout(() => { el.textContent = ja ? "リンク" : "Link"; }, 1500); } }}
                      id={`cp-${d.href}`}
                      style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.2)", color: "rgba(201,169,98,0.8)", fontSize: 11, cursor: "pointer" }}
                    >
                      {ja ? "リンク" : "Link"}
                    </button>
                    {/* Sign (contract pages only) */}
                    {d.canSign && (
                      <a href={d.href.startsWith("/contract") ? d.href : `/contract`} style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "rgba(74,222,128,0.8)", fontSize: 11, textDecoration: "none", cursor: "pointer" }}>
                        {ja ? "署名" : "Sign"}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Shared Resources ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 6, letterSpacing: "0.06em" }}>
            {ja ? "共有リソース" : "Shared Resources"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
            {ja ? "チーム共有のリンク・ドキュメント" : "Team-shared links & documents"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {SHARED_RESOURCES.map(r => (
              <a key={r.url} href={r.url} target={r.url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer"
                style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                  padding: "16px 18px", textDecoration: "none", display: "flex", alignItems: "center", gap: 14,
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(201,169,98,0.3)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,169,98,0.04)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)"; }}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ja ? r.ja : r.en}</p>
                  <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 10, letterSpacing: "0.08em" }}>{ja ? r.cat_ja : r.cat_en}</p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14, flexShrink: 0 }}>{r.url.startsWith("/") ? "→" : "↗"}</span>
              </a>
            ))}
          </div>
        </motion.section>

        {/* ── NFT Passes ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 6, letterSpacing: "0.06em" }}>
            {ja ? "NFT パス" : "NFT Passes"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
            {ja ? "Phantom Walletを接続してパスをクレームしてください" : "Connect Phantom Wallet to claim your pass"}
          </p>

          {/* Wallet connect */}
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <WalletMultiButton style={{
              background: connected ? "rgba(74,222,128,0.1)" : "rgba(168,85,247,0.15)",
              border: `1px solid ${connected ? "rgba(74,222,128,0.3)" : "rgba(168,85,247,0.4)"}`,
              borderRadius: 999, color: connected ? "rgba(74,222,128,0.9)" : "rgba(168,85,247,0.9)",
              fontWeight: 700, fontSize: 12, padding: "10px 20px", height: "auto",
            }} />
            {connected && publicKey && (
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "monospace" }}>
                {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
              </span>
            )}
            {!connected && (
              <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer"
                style={{ color: "rgba(168,85,247,0.6)", fontSize: 11, textDecoration: "none" }}>
                {ja ? "Phantom Walletをインストール →" : "Install Phantom Wallet →"}
              </a>
            )}
          </div>

          {nftPasses.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "20px 0" }}>
              {ja ? "クレーム可能なパスはありません" : "No passes available"}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
              {nftPasses.map(pass => {
                const isArtist = pass.pass_type === "artist";
                const color = isArtist ? "rgba(74,222,128," : "rgba(201,169,98,";
                const isClaiming = claimingId === pass.id;
                return (
                  <div key={pass.id} style={{
                    background: "rgba(255,255,255,0.02)", border: `1px solid ${color}0.15)`,
                    borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s",
                  }}>
                    {/* Pass image */}
                    <div style={{ aspectRatio: "1", background: `${color}0.04)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <img src={pass.image_url} alt={pass.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span style={{
                        position: "absolute", top: 8, right: 8, fontSize: 9,
                        background: `${color}0.15)`, color: `${color}0.9)`,
                        padding: "2px 8px", borderRadius: 999, letterSpacing: "0.1em", fontWeight: 700,
                      }}>
                        {isArtist ? "ARTIST" : "VIP"}
                      </span>
                    </div>
                    {/* Info + claim */}
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{pass.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginBottom: 12, lineHeight: 1.5 }}>{pass.description}</p>
                      <button
                        onClick={() => claimPass(pass.id)}
                        disabled={!connected || isClaiming}
                        style={{
                          width: "100%", padding: "9px 0", borderRadius: 999, cursor: connected ? "pointer" : "not-allowed",
                          background: !connected ? "rgba(255,255,255,0.04)" : isClaiming ? `${color}0.3)` : `${color}0.8)`,
                          border: "none", color: !connected ? "rgba(255,255,255,0.2)" : "#000",
                          fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", transition: "all 0.2s",
                        }}>
                        {isClaiming ? "..." : !connected ? (ja ? "要ウォレット接続" : "Connect Wallet") : (ja ? "クレーム" : "Claim")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ── Partner CRM ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 6, letterSpacing: "0.06em" }}>
            {ja ? "パートナー・連絡先" : "Partner CRM"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
            {ja ? `${PARTNERS.length}件のパートナー・ベンダー` : `${PARTNERS.length} partners & vendors`}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PARTNERS.map((p, i) => {
              const s = PS[p.status];
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{p.name || p.contact}</span>
                        {p.name && p.name !== p.contact && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>— {p.contact}</span>}
                        <span style={{ fontSize: 9, color: s.color, border: `1px solid ${s.color}`, borderRadius: 999, padding: "1px 7px", letterSpacing: "0.08em", flexShrink: 0 }}>
                          {ja ? s.ja : s.en}
                        </span>
                      </div>
                      <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, marginTop: 2 }}>{ja ? p.type_ja : p.type_en}</p>
                    </div>
                    {p.who && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 999 }}>{p.who}</span>}
                  </div>
                  {(ja ? p.notes_ja : p.notes_en) && (
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.5, marginBottom: 6 }}>{ja ? p.notes_ja : p.notes_en}</p>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {p.email && <a href={`mailto:${p.email}`} style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, textDecoration: "none" }}>{p.email}</a>}
                    {p.phone && <a href={`tel:${p.phone}`} style={{ color: "rgba(100,180,255,0.7)", fontSize: 11, textDecoration: "none" }}>{p.phone}</a>}
                    {p.instagram && <span style={{ color: "rgba(168,85,247,0.7)", fontSize: 11 }}>@{p.instagram}</span>}
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(74,222,128,0.7)", fontSize: 11, textDecoration: "none" }}>{p.link.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Gantt ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16, letterSpacing: "0.06em" }}>
            {ja ? "プロジェクトタイムライン" : "Project Timeline"}
          </h2>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as never }}>
            <div style={{ minWidth: 520, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 16px 14px" }}>
              {(() => {
                const LW = 150;
                const todayPct = Math.min(100, Math.max(0, (Date.now() - G_START) / G_TOTAL * 100));
                const bc = (s: GStatus) =>
                  s === "done"        ? "rgba(74,222,128,0.55)"
                  : s === "in_progress" ? "rgba(201,169,98,0.55)"
                  : s === "urgent"      ? "rgba(255,80,80,0.55)"
                  : s === "event"       ? "rgba(201,169,98,0.85)"
                  : "rgba(255,255,255,0.1)";
                const lc = (s: GStatus) =>
                  s === "urgent" ? "rgba(255,130,130,0.75)"
                  : s === "done" ? "rgba(74,222,128,0.6)"
                  : s === "event" ? "rgba(201,169,98,0.85)"
                  : "rgba(255,255,255,0.4)";
                return (
                  <>
                    {/* Month header */}
                    <div style={{ display: "flex", marginBottom: 8 }}>
                      <div style={{ width: LW, flexShrink: 0 }} />
                      <div style={{ flex: 1, position: "relative", height: 14 }}>
                        {GM.map((m, i) => (
                          <span key={m} style={{
                            position: "absolute",
                            left: `${dp(`2026-${String(i + 1).padStart(2, "0")}-01`)}%`,
                            transform: "translateX(-50%)",
                            fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em",
                          }}>{m}</span>
                        ))}
                      </div>
                    </div>

                    {/* Rows */}
                    {GANTT.map((item, i) => {
                      const l = dp(item.start);
                      const w = Math.max(dp(item.end) - l, 0.6);
                      const isEvent = item.s === "event";
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
                          <div style={{ width: LW, flexShrink: 0, paddingRight: 10 }}>
                            <p style={{ color: lc(item.s), fontSize: 10.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {ja ? item.ja : item.en}
                            </p>
                          </div>
                          <div style={{ flex: 1, position: "relative", height: 22 }}>
                            {GM.map((_, mi) => (
                              <div key={mi} style={{
                                position: "absolute",
                                left: `${dp(`2026-${String(mi + 1).padStart(2, "0")}-01`)}%`,
                                top: 0, bottom: 0, width: 1,
                                background: "rgba(255,255,255,0.04)",
                                pointerEvents: "none",
                              }} />
                            ))}
                            <div style={{
                              position: "absolute", left: `${todayPct}%`,
                              top: -1, bottom: -1, width: 1,
                              background: "rgba(201,169,98,0.4)",
                              pointerEvents: "none",
                            }} />
                            <div style={{
                              position: "absolute",
                              left: `${l}%`, width: `${w}%`,
                              top: isEvent ? 0 : 4, height: isEvent ? "100%" : 14,
                              background: bc(item.s),
                              borderRadius: 3,
                              border: isEvent ? "1px solid rgba(201,169,98,0.6)" : "none",
                            }} />
                          </div>
                        </div>
                      );
                    })}

                    {/* Today label */}
                    <div style={{ display: "flex", marginTop: 4 }}>
                      <div style={{ width: LW, flexShrink: 0 }} />
                      <div style={{ flex: 1, position: "relative", height: 14 }}>
                        <span style={{
                          position: "absolute", left: `${todayPct}%`,
                          transform: "translateX(-50%)",
                          fontSize: 9, color: "rgba(201,169,98,0.55)", letterSpacing: "0.06em", whiteSpace: "nowrap",
                        }}>TODAY</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: "flex", gap: 16, marginTop: 14, paddingLeft: LW, flexWrap: "wrap" }}>
                      {([
                        ["rgba(74,222,128,0.55)", ja ? "完了" : "Done"],
                        ["rgba(201,169,98,0.55)", ja ? "進行中" : "In Progress"],
                        ["rgba(255,80,80,0.55)",  ja ? "要対応" : "Urgent"],
                        ["rgba(255,255,255,0.1)", ja ? "未着手" : "Pending"],
                      ] as [string, string][]).map(([color, label]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.section>

        {/* Task sections */}
        {SECTIONS.map((section, sIdx) => (
          <motion.section key={section.ja} {...fade} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 14, letterSpacing: "0.06em" }}>
              {ja ? section.ja : section.en}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {section.tasks.map((task, tIdx) => {
                const eff = getEffectiveStatus(sIdx, tIdx, task.status);
                const s = STATUS_LABEL[eff];
                const isFirst = tIdx === 0;
                const isLast = tIdx === section.tasks.length - 1;
                return (
                  <div key={task.ja}
                    onClick={() => cycleStatus(sIdx, tIdx, eff)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "14px 18px", cursor: "pointer", userSelect: "none",
                      background: eff === "urgent" ? "rgba(255,80,80,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${eff === "urgent" ? "rgba(255,80,80,0.2)" : "rgba(255,255,255,0.07)"}`,
                      borderTop: isFirst ? undefined : "none",
                      borderRadius: isFirst ? "12px 12px 0 0" : isLast ? "0 0 12px 12px" : 0,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = eff === "urgent" ? "rgba(255,80,80,0.04)" : "rgba(255,255,255,0.02)"; }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0, marginTop: 5, transition: "background 0.2s" }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: task.note ? 4 : 0 }}>
                        {ja ? task.ja : task.en}
                      </p>
                      {task.note && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{ja ? task.note.ja : task.note.en}</p>}
                    </div>
                    <span style={{ color: s.color, fontSize: 11, letterSpacing: "0.08em", flexShrink: 0, fontWeight: 600, transition: "color 0.2s" }}>
                      {s[lang]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}

        {/* Contract submissions + Email signups */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          {/* Tab header */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex" }}>
            {([
              { key: "contracts", ja: `契約申込 (${submissions.length})`, en: `Contracts (${submissions.length})` },
              { key: "emails",    ja: `メール登録 (${emailSignups.length})`, en: `Emails (${emailSignups.length})` },
              { key: "meetings",  ja: `ミーティング (${meetings.length})`, en: `Meetings (${meetings.length})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 20px", background: "transparent", border: "none",
                  borderBottom: activeTab === tab.key ? "2px solid var(--gold, #c9a962)" : "2px solid transparent",
                  color: activeTab === tab.key ? "var(--gold, #c9a962)" : "rgba(255,255,255,0.3)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
                  marginBottom: -1,
                }}
              >{ja ? tab.ja : tab.en}</button>
            ))}
            </div>
            {/* CSV export */}
            <button
              onClick={() => {
                if (activeTab === "contracts") downloadCSV(submissions as unknown as Record<string, unknown>[], "contracts.csv");
                else if (activeTab === "emails") downloadCSV(emailSignups as unknown as Record<string, unknown>[], "emails.csv");
                else downloadCSV(meetings as unknown as Record<string, unknown>[], "meetings.csv");
              }}
              style={{ marginBottom: 1, padding: "5px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}
            >CSV ↓</button>
          </div>

          {activeTab === "contracts" && (
            submissions.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "20px 0" }}>
                {ja ? "まだ申込はありません" : "No submissions yet"}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {submissions.map((s, i) => {
                  const isFirst = i === 0;
                  const isLast = i === submissions.length - 1;
                  const typeColor =
                    s.contract_type === "investment" ? "rgba(201,169,98,0.85)"
                    : s.contract_type === "sponsor" ? "rgba(74,222,128,0.85)"
                    : "rgba(147,197,253,0.85)";
                  const typeLabel =
                    s.contract_type === "investment" ? (ja ? "投資" : "Investment")
                    : s.contract_type === "sponsor" ? (ja ? "スポンサー" : "Sponsor")
                    : "NDA";
                  return (
                    <div key={s.id} style={{
                      display: "grid", gridTemplateColumns: "auto 1fr auto",
                      gap: "8px 16px", alignItems: "start",
                      padding: "14px 18px", background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderTop: isFirst ? undefined : "none",
                      borderRadius: isFirst ? "12px 12px 0 0" : isLast ? "0 0 12px 12px" : 0,
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 2 }}>
                        <span style={{ fontSize: 11, color: typeColor, fontWeight: 700, letterSpacing: "0.05em" }}>
                          {typeLabel}
                        </span>
                        {s.paid ? (
                          <span style={{ fontSize: 10, background: "rgba(74,222,128,0.15)", color: "rgba(74,222,128,0.9)", borderRadius: 4, padding: "2px 6px", fontWeight: 700 }}>
                            PAID
                          </span>
                        ) : s.contract_type !== "nda" ? (
                          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)", borderRadius: 4, padding: "2px 6px" }}>
                            {ja ? "未払" : "unpaid"}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                          {s.signature}
                          {s.company ? <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}> · {s.company}</span> : null}
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                          {s.email || "—"}
                          {s.amount ? ` · ${s.amount}` : ""}
                          {s.sponsor_package ? ` · ${s.sponsor_package}` : ""}
                        </p>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, whiteSpace: "nowrap", paddingTop: 3 }}>
                        {s.created_at.slice(0, 10)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab === "emails" && (
            <div>
              {/* ── Email Blast ── */}
              <div style={{ marginBottom: 24, padding: "20px 22px", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 12, background: "rgba(201,169,98,0.03)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(201,169,98,0.7)", textTransform: "uppercase", marginBottom: 14 }}>
                  {ja ? "メール一斉配信" : "Email Blast"}
                  <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.2)", fontSize: 10 }}>({emailSignups.length} {ja ? "件登録" : "subscribers"})</span>
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input value={blastSubject} onChange={e => setBlastSubject(e.target.value)}
                    placeholder={ja ? "件名（日英共通）" : "Subject (shared)"}
                    style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                  <textarea value={blastBodyJa} onChange={e => setBlastBodyJa(e.target.value)}
                    placeholder={ja ? "本文（日本語）" : "Body (Japanese)"}
                    rows={4}
                    style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  <textarea value={blastBodyEn} onChange={e => setBlastBodyEn(e.target.value)}
                    placeholder="Body (English)"
                    rows={4}
                    style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input value={blastTest} onChange={e => setBlastTest(e.target.value)}
                      placeholder={ja ? "テスト送信先メール" : "Test recipient email"}
                      style={{ flex: "1 1 200px", padding: "9px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                    <button onClick={() => handleBlast(true)} disabled={blastSending || !blastSubject}
                      style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                      {ja ? "テスト送信" : "Send Test"}
                    </button>
                    <button onClick={() => { if (confirm(ja ? `${emailSignups.length}件全員に送信しますか？` : `Send to all ${emailSignups.length} subscribers?`)) handleBlast(false); }}
                      disabled={blastSending || !blastSubject || emailSignups.length === 0}
                      style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "rgba(201,169,98,0.85)", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
                      {blastSending ? "..." : ja ? `全員に送信 (${emailSignups.length})` : `Blast to all (${emailSignups.length})`}
                    </button>
                  </div>
                  {blastResult && <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 12, marginTop: 4 }}>{blastResult}</p>}
                </div>
              </div>

              {/* ── Subscriber list ── */}
              {emailSignups.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "20px 0" }}>
                  {ja ? "まだ登録はありません" : "No signups yet"}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {emailSignups.map((e, i) => (
                    <div key={e.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 18px", background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderTop: i === 0 ? undefined : "none",
                      borderRadius: i === 0 ? "12px 12px 0 0" : i === emailSignups.length - 1 ? "0 0 12px 12px" : 0,
                    }}>
                      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{e.email}</span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "2px 6px" }}>
                          {e.locale.toUpperCase()}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{e.created_at.slice(0, 10)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "meetings" && (
            meetings.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, padding: "20px 0" }}>
                {ja ? "まだ予約はありません" : "No meetings yet"}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {meetings.map((m, i) => {
                  const isFirst = i === 0, isLast = i === meetings.length - 1;
                  const typeColor = m.meeting_type === "investor" ? "rgba(201,169,98,0.85)" : "rgba(74,222,128,0.85)";
                  const typeLabel = m.meeting_type === "investor" ? (ja ? "投資家" : "Investor") : (ja ? "スポンサー" : "Sponsor");
                  return (
                    <div key={m.id} style={{
                      display: "grid", gridTemplateColumns: "auto 1fr auto",
                      gap: "8px 14px", alignItems: "start",
                      padding: "14px 18px", background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderTop: isFirst ? undefined : "none",
                      borderRadius: isFirst ? "12px 12px 0 0" : isLast ? "0 0 12px 12px" : 0,
                    }}>
                      <span style={{ fontSize: 11, color: typeColor, fontWeight: 700, letterSpacing: "0.05em", paddingTop: 2 }}>{typeLabel}</span>
                      <div>
                        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                          {m.name || "—"}
                          {m.company ? <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}> · {m.company}</span> : null}
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                          {m.email || "—"}
                          {m.date ? ` · ${m.date}` : ""}
                          {m.time_slot ? ` · ${m.time_slot}` : ""}
                        </p>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, whiteSpace: "nowrap", paddingTop: 3 }}>
                        {m.created_at.slice(0, 10)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </motion.section>

        {/* Quick links */}
        <motion.section {...fade} style={{ paddingBottom: 40 }}>
          {/* Partner Pages */}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "パートナーページ" : "Partner Pages"}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { href: "/investor/", label: ja ? "投資家デック" : "Investor Deck" },
              { href: "/sponsor/",  label: ja ? "スポンサーデック" : "Sponsor Deck" },
              { href: "/deal/",     label: ja ? "ディールサマリー" : "Deal Summary" },
              { href: "/contract/", label: ja ? "契約書" : "Contract" },
              { href: "/schedule/", label: ja ? "面談予約" : "Schedule" },
              { href: "/login/",    label: ja ? "ログイン" : "Login" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 12, letterSpacing: "0.08em",
                border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)",
                textDecoration: "none", background: "rgba(255,255,255,0.03)",
              }}>{l.label} →</Link>
            ))}
          </div>

          {/* Operations */}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "運営資料" : "Operations"}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { href: "/production/",      label: ja ? "制作計画" : "Production Plan" },
              { href: "/safety/",          label: ja ? "安全管理" : "Safety Plan" },
              { href: "/staff/",           label: ja ? "スタッフ" : "Staff Manual" },
              { href: "/budget/",          label: ja ? "収支計画" : "Budget & P&L" },
              { href: "/venue-agreement/", label: ja ? "会場契約" : "Venue Agreement" },
              { href: "/artist-contract/", label: ja ? "出演契約" : "Artist Contract" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 12, letterSpacing: "0.08em",
                border: "1px solid rgba(100,180,255,0.15)", color: "rgba(100,180,255,0.6)",
                textDecoration: "none", background: "rgba(100,180,255,0.03)",
              }}>{l.label} →</Link>
            ))}
          </div>

          {/* Public Pages */}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "一般公開ページ" : "Public Pages"}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { href: "/",        label: ja ? "トップ" : "Home" },
              { href: "/lineup/", label: ja ? "ラインナップ" : "Lineup" },
              { href: "/vip/",    label: "VIP" },
              { href: "/guide/",  label: ja ? "当日ガイド" : "Guide" },
              { href: "/info/",   label: ja ? "アクセス・FAQ" : "Info & FAQ" },
              { href: "/press/",  label: ja ? "プレスキット" : "Press Kit" },
              { href: "/privacy/",label: ja ? "プライバシー" : "Privacy" },
              { href: "/terms/",  label: ja ? "利用規約" : "Terms" },
              { href: "https://zamnahawaii.ticketblox.com", label: "Ticketblox ↗" },
            ].map(l => (
              <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 12, letterSpacing: "0.08em",
                border: "1px solid rgba(201,169,98,0.15)", color: "rgba(201,169,98,0.6)",
                textDecoration: "none", background: "rgba(201,169,98,0.03)",
              }}>{l.label} →</a>
            ))}
          </div>

          {/* NFT / Web3 */}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "NFT・Web3" : "NFT / Web3"}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { href: "/mint/",          label: ja ? "NFTミント" : "Mint Pass" },
              { href: "/vip-lounge/",    label: ja ? "VIPラウンジ" : "VIP Lounge" },
              { href: "/artist-lounge/", label: ja ? "アーティストラウンジ" : "Artist Lounge" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "9px 18px", borderRadius: 999, fontSize: 12, letterSpacing: "0.08em",
                border: "1px solid rgba(168,85,247,0.2)", color: "rgba(168,85,247,0.7)",
                textDecoration: "none", background: "rgba(168,85,247,0.03)",
              }}>{l.label} →</Link>
            ))}
          </div>
        </motion.section>

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
          {ja
            ? "ZAMNA HAWAII 2026 · 運営資料 · 社外秘"
            : "ZAMNA HAWAII 2026 · Operations · Internal Use Only"}
        </p>
      </footer>
    </main>
  );
}
