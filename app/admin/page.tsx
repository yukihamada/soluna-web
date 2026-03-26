"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
      { ja: "創設パートナー $200,000 調達",               en: "Founding partner $200K raise",                status: "urgent",     note: { ja: "⚠ 3/29にZAMNAがアーティストオプション提示。$200Kを口座に必要。Vakasは「LOI確認+他者の入金確認後に追加投資する」と明言。JCにproof of fundsを求められる可能性大", en: "⚠ ZAMNA presents artist options 3/29. Need $200K in account. Vakas: 'will invest more once I see LOI + others contributing'. JC may request proof of funds" } },
      { ja: "エスクロー口座の開設",                       en: "Open dedicated escrow account",               status: "in_progress",note: { ja: "Sean: 銀行口座準備済みと報告。デポジット用に即座に入金が必要", en: "Sean reported bank account ready. Need immediate deposit for artist bookings" } },
      { ja: "イベントキャンセル保険の締結",               en: "Event cancellation insurance",                status: "in_progress",note: { ja: "ハワイのイベント保険会社リスト入手済み（Vakas作成）。市議会向けにも必要", en: "Hawaii event insurance company list obtained (by Vakas). Also needed for city council" } },
      { ja: "チケット売上収益の入金管理（Ticketblox）",   en: "Ticket revenue tracking via Ticketblox",      status: "urgent",     note: { ja: "⚠ David排除決定。消費者に~12%課金しDavidが手数料を取っていた事が発覚。契約再発行・Davidのアクセス/メール削除・AnupにNDA要求。114枚分のコミッションはDavidに支払い、以後カット", en: "⚠ David removed. He was charging ~12% to consumers and taking commission. Reissue contract, remove David's access/email, require NDA from Anup. Pay David commission on 114 tickets sold, then cut off" } },
      { ja: "David排除・Ticketblox契約再発行",           en: "Remove David, reissue Ticketblox contract",   status: "urgent",     note: { ja: "⚠ Sean/Keyannaのみアクセス権限。Anupに新契約+NDA依頼。Davidのメール削除確認必須", en: "⚠ Only Sean/Keyanna have access. Request new contract + NDA from Anup. Must confirm David's email removed" } },
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
      { ja: "詳細収支予算（P&L）の確定",                 en: "Finalize detailed P&L budget",                status: "in_progress",note: { ja: "✅ Sid が1日分の予算を7時間かけて完成。2日目で制作費50%分散、3日目で33%。VIPテーブル($10K/$25K)の詳細設計とアルコール管理($100K+仕入れ必要)の追加が必要。ZAMNA手数料(ブッキング15%+利益7%)の反映も", en: "✅ Sid completed 1-day budget (7 hours). Day 2 spreads production 50%, Day 3 to 33%. Need VIP table ($10K/$25K) details + alcohol management ($100K+ inventory). ZAMNA fees (15% booking + 7% profit) to add" } },
      { ja: "Proof of Funds（残高証明）の準備",           en: "Proof of Funds documentation",                status: "urgent",     note: { ja: "⚠ JC/エージェンシーが口座残高証明を求める可能性。$200Kを口座に入れるか、会社の資金証明を用意。3/29のアーティストオプション提示前に必須", en: "⚠ JC/agencies may request proof of funds. Need $200K in account or company fund certification. Required before 3/29 artist options" } },
      { ja: "経費承認フローの確立",                      en: "Expense approval workflow",                   status: "pending",    note: { ja: "全メンバーがレシートを提出し、全員の承認後に支出。Seanの善意を利用されないよう相互チェック", en: "All members submit receipts, approved by all before spending. Cross-check to prevent exploitation of Sean's generosity" } },
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
      { ja: "投資契約書ドラフトの弁護士レビュー",        en: "Investment contract attorney review",         status: "urgent",     note: { ja: "Vakas の署名済み投資レターをSeanが送付予定", en: "Sean to send Vakas signed investment letter" } },
      { ja: "スポンサー契約書の整備",                    en: "Sponsor contracts finalized",                 status: "in_progress" },
      { ja: "ZAMNA ブランドライセンス契約の締結（JC ZAMNA）",en: "ZAMNA brand license signed with JC ZAMNA", status: "urgent",     note: { ja: "⚠ 3月末期限。ブッキング手数料15%+利益7%の条件。2日目・3日目をZAMNAライセンス外で開催する場合の条件も要確認", en: "⚠ March deadline. Booking fee 15% + profit 7%. Also clarify terms if Day 2-3 held outside ZAMNA license" } },
      { ja: "アーティスト出演契約テンプレートの準備",    en: "Artist performance contract template",        status: "pending" },
      { ja: "会場利用契約の法務レビュー",                en: "Venue contract legal review",                 status: "in_progress",note: { ja: "JP DamonがLOIを会社名変更のみで承認。3/18署名予定。独占契約の条項を含めるべき", en: "JP Damon approved LOI with company name change only. Signing 3/18. Should include exclusivity clause" } },
      { ja: "Taylor/Electric Palms 提携契約",           en: "Taylor/Electric Palms partnership contract",  status: "pending",    note: { ja: "Davidの教訓: 見積価格の裏取り必須。アーティスト価格を独立検証してからMOU締結", en: "Lesson from David: must verify quoted prices independently before signing MOU" } },
      { ja: "個人情報保護ポリシー・利用規約の整備",      en: "Privacy policy & terms of service",           status: "done",       note: { ja: "solun.art/privacy および /terms で公開済み", en: "Live at solun.art/privacy and /terms" } },
    ],
  },

  // ── 4. 会場・制作 ─────────────────────────────────────────────
  {
    ja: "会場・制作",
    en: "Venue & Production",
    tasks: [
      { ja: "Moanalua Gardens (JP Damon) 会場契約の締結",              en: "Moanalua Gardens (JP Damon) venue contract signed",          status: "in_progress", note: { ja: "✅ JP DamonがLOIレビュー中。会社名変更のみで署名予定(3/18)。前向きに進行中！3/18にHI Japan Fair + 計測ローラーで現地計測。独占契約獲得できれば島のトップポジション確保", en: "✅ JP Damon reviewing LOI — only company name changes needed, signing expected 3/18. Very positive! On-site measurement 3/18 with HI Japan Fair + roller. Exclusivity = top position on island" } },
      { ja: "ハワイ州イベント営業許可の取得",            en: "Hawaii state special event permit",           status: "in_progress" },
      { ja: "アルコール提供ライセンス（Liquor License）",en: "Liquor license for the event",                status: "pending" },
      { ja: "ステージ設計・レイアウト確定",              en: "Stage design & venue layout finalized",       status: "in_progress",note: { ja: "ZAMNAスタイル多段バックステージ設計。ステージ高4ft、VIP 2ft、GA地面レベル。左右+背後3段のテーブル配置。Hawaii Stage & Lightingの技術ディレクターと共同設計中", en: "ZAMNA-style tiered backstage. Stage 4ft, VIP 2ft, GA ground level. Side + 3-tier behind tables. Co-designing with Hawaii Stage & Lighting technical director" } },
      { ja: "Hawaii Stage & Lighting との打ち合わせ・契約",en: "Hawaii Stage & Lighting meeting & contract",  status: "in_progress", note: { ja: "制作パートナー。機材倉庫視察済み。技術ディレクターとフットプリント設計中。Bruno Mars機材所有。Kuhioが市議会メンバーでもある", en: "Production partner. Warehouse visited. Designing footprint with tech director. Owns Bruno Mars gear. Kuhio also on city council" } },
      { ja: "会場フットプリント計測（3/18）",            en: "Venue footprint measurement (3/18)",          status: "in_progress",note: { ja: "3/18にHI Japan Fair担当者+計測ローラーで現地計測。JP Damonと会合。フードベンダーエリア配置も確定", en: "3/18 on-site with HI Japan Fair rep + measuring roller. Meeting JP Damon. Food vendor area layout to be finalized" } },
      { ja: "2日目・3日目の開催検討",                    en: "Day 2-3 event planning",                      status: "pending",    note: { ja: "ZAMNAライセンスが1日のみの場合、土日はTaylor/Electric Palmsと別名義で共催。2日目で制作費50%分散、3日目で33%", en: "If ZAMNA license is 1 day only, Sat/Sun collab with Taylor/Electric Palms under different name. Day 2: 50% production split, Day 3: 33%" } },
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
      { ja: "弁護士を通した法的整理（過去イベント問題の対処）",en: "Legal cleanup via attorney (past event issues)", status: "urgent", note: { ja: "過去のMarleyイベント(2025/2/15-16)で近隣苦情。住宅街駐車・水道管影響。Sidがコミュニティレター作成中", en: "Past Marley event (2025/2/15-16) caused complaints. Residential parking & water issues. Sid drafting community letter" } },
      { ja: "市議会・行政ルートでの承認工作",                  en: "City council & political route approval",       status: "in_progress", note: { ja: "Kuhioが議会メンバーとの1:1ミーティングをアレンジ中。Sidが各メンバーと個別面談予定。5月の公聴会に向け準備", en: "Kuhio arranging 1:1 meetings with council members for Sid. Preparing for May public hearing" } },
      { ja: "近隣住民への事前説明・合意取得（署名50名）",      en: "Neighbor consent (50 signatures needed)",       status: "in_progress", note: { ja: "⚠ JP Damonに苦情者14名リスト依頼(3/18)。クッキー持参で訪問開始予定。Marleyイベントの問題点を説明し、シャトル・駐車・騒音対策を提示。地域チャリティへの寄付も提案。Alan/Sean/Sidで3者通話予定", en: "⚠ Asking JP Damon for list of 14 complainers (3/18). Plan cookie delivery visits. Explain Marley issues fixed: shuttles, parking, noise. Propose charity donations. Alan/Sean/Sid 3-way call planned" } },
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
      { ja: "ヘッドライナー交渉・契約",                  en: "Headliner negotiation & contract",            status: "urgent",     note: { ja: "⚠ ZAMNAが3アーティストパッケージ$250K提示(Above&Beyond, Chris Lake, Galantis候補)。CamelFat不可。3/29にオプション提示。シカゴラインナップからの移動も検討中。ZAMNA手数料: ブッキング15% + 利益7%", en: "⚠ ZAMNA offered 3-artist package ~$250K (Above&Beyond, Chris Lake, Galantis candidates). CamelFat can't. Options on 3/29. Also exploring Chicago lineup flyovers. ZAMNA fees: 15% booking + 7% profit" } },
      { ja: "サポートアクト 3〜5組の確定",               en: "Supporting acts (3–5) confirmed",             status: "in_progress",note: { ja: "チームにシカゴラインナップからトップ4-5 DJ選定を依頼済み。シカゴ→ハワイ移動で土日月に配置検討", en: "Team asked to pick top 4-5 DJs from Chicago lineup. Considering Sat/Sun/Mon scheduling via Chicago→Hawaii route" } },
      { ja: "Taylor/Electric Palms パートナーシップ検討", en: "Taylor/Electric Palms partnership evaluation", status: "in_progress",note: { ja: "⚠ 島で最も有力なEDMプロモーター。LA面談済み。$100K以下のアーティスト確保可能と主張。ただしDavidの教訓から価格の裏取りが必須。ZAMNAライセンス外の土日開催で協業の可能性", en: "⚠ Most prominent EDM promoter on island. Met in LA. Claims artists under $100K. Must verify pricing (learned from David). Potential Sat/Sun collab outside ZAMNA license" } },
      { ja: "ローカル DJ / アーティストの選定（ハワイ）",en: "Local Hawaii DJ / artist selection",          status: "in_progress",note: { ja: "Sean のローカルチームが活動中。Baby Zamnaイベント実施済み", en: "Sean's local team active. Baby Zamna event executed" } },
      { ja: "全アーティストの出演ライダー確認",          en: "All artist riders confirmed",                 status: "pending" },
      { ja: "外国人アーティストのビザ申請（O-1 / P-1）", en: "Artist visa applications (O-1 / P-1)",        status: "urgent",     note: { ja: "⚠ 申請〜取得に3〜6ヶ月。9月開催まで6ヶ月。今すぐ着手しないと間に合わない", en: "⚠ 3–6 months lead time. 6 months to event. Must start NOW or risk missing deadline" } },
      { ja: "フライト・ホテル comp rooms の手配",        en: "Artist comp flights & hotel rooms",           status: "in_progress",note: { ja: "航空会社・ホテルにスポンサー型comp交渉中（Sean）", en: "Negotiating comp rooms via sponsor deals (Sean)" } },
      { ja: "バックステージライダー・ケータリング手配",  en: "Backstage catering & rider fulfillment",      status: "pending",    note: { ja: "専属シェフ+フードベンダーからのフードチケット提供。海外アーティストにハワイアン料理体験", en: "Dedicated chef + food tickets from vendors. Give international artists Hawaiian food experience" } },
      { ja: "シカゴラインナップからのアーティスト移動",  en: "Chicago lineup → Hawaii artist routing",      status: "in_progress",note: { ja: "シカゴ公演後ハワイへ直行。土日月に配置。コスト効率の良いルーティング", en: "Direct from Chicago shows to Hawaii. Schedule for Sat/Sun/Mon. Cost-efficient routing" } },
      { ja: "ZAMNA vs Taylor アーティスト価格比較",       en: "ZAMNA vs Taylor artist price comparison",     status: "in_progress",note: { ja: "ZAMNAのブッキング手数料15%+利益7% vs Taylorの$100K以下アーティスト。独立検証必須", en: "ZAMNA booking 15% + profit 7% vs Taylor's sub-$100K artists. Independent verification required" } },
      { ja: "2-3日間タイムテーブルの確定",               en: "2-3 day timetable finalized",                 status: "pending",    note: { ja: "Day1=ZAMNA(Sep4) / Day2-3=Taylor協業の可能性(Sep5-6)。3PM-10PM+アフターパーティー", en: "Day1=ZAMNA(Sep4) / Day2-3=Taylor collab(Sep5-6). 3PM-10PM + after party" } },
    ],
  },

  // ── 6. チケット・販売 ─────────────────────────────────────────
  {
    ja: "チケット・販売",
    en: "Tickets & Sales",
    tasks: [
      { ja: "チケット販売プラットフォーム：Ticketblox",  en: "Ticket platform: Ticketblox — LIVE",          status: "done",       note: { ja: "zamnahawaii.ticketblox.com で公開済み（2026/02/08〜）", en: "zamnahawaii.ticketblox.com live since Feb 8, 2026" } },
      { ja: "チケット価格の確定",                        en: "Ticket pricing confirmed",                    status: "done",       note: { ja: "GA Day1 $120 / Day2 $180 / VIP $1,000〜", en: "GA Day1 $120 / Day2 $180 / VIP $1,000+" } },
      { ja: "目標販売枚数：GA 5,000〜8,000枚",           en: "Sales target: 5,000–8,000 GA tickets",        status: "in_progress",note: { ja: "欧州からの購入あり。Keyannaが週次レポート生成中（Genspark AI活用）", en: "Sales from Europe confirmed. Keyanna generating weekly reports (via Genspark AI)" } },
      { ja: "ホテル付きパッケージの販売構造の決定",      en: "Hotel package sales structure decision",      status: "urgent",     note: { ja: "Aloha7（大木優紀氏）が提案中。GA売切後にパッケージのみ残す戦略", en: "Aloha7 (Ohki) proposal: pivot to hotel package after GA sells out" } },
      { ja: "VIP パッケージ詳細の設計",                  en: "VIP package details designed",                status: "pending",    note: { ja: "バックステージアクセス＋ホテル＋$3,000前後を想定", en: "Backstage access + hotel, ~$3,000 target" } },
      { ja: "日本・アジア向け販売チャネルの確立",        en: "Japan & Asia sales channel (NEWT / Aloha7)",  status: "in_progress",note: { ja: "NEWT（Shino）× Aloha7（大木優紀氏）で4枚/室パッケージ案あり", en: "NEWT × Aloha7: 4 tickets per room package proposal active" } },
      { ja: "当日キャッシュレス決済システム（RFIDリストバンド）",en: "On-site cashless payment (RFID wristbands)",status: "in_progress",note: { ja: "Coachella方式のRFIDバンド採用予定。Ticketbloxが対応可能。Sidにもソースあり", en: "Coachella-style RFID wristbands. Ticketblox can set up. Sid also has a source" } },
      { ja: "入場 QR コードシステムの構築",              en: "QR code check-in system",                     status: "in_progress",note: { ja: "Ticketblox QRと連携。入場スキャン・VIPアクセス管理", en: "Integrated with Ticketblox QR. Entry scan & VIP access control" } },
      { ja: "転売防止・本人確認ポリシーの策定",          en: "Anti-scalping / ID verification policy",      status: "pending" },
      { ja: "VIPテーブル販売構造の確定",                 en: "VIP table package structure finalized",       status: "in_progress",note: { ja: "$25Kテーブル: 12-15 VIPチケット+$4-5Kアルコール+専属ウェイトスタッフ4名。$10Kテーブル: 6 VIPチケット+$3Kアルコール+$1K場所代。ZAMNAスタイル多段バックステージ(ステージ左右+背後3段)。Ticketbloxでテーブル選択・決済対応可能", en: "$25K table: 12-15 VIP tix + $4-5K alcohol + 4 dedicated staff. $10K table: 6 VIP tix + $3K alcohol + $1K real estate. ZAMNA-style tiered backstage (sides + 3 levels behind). Ticketblox can handle table selection & payment" } },
      { ja: "アルコール仕入れ・管理体制の構築",           en: "Alcohol procurement & management setup",      status: "pending",    note: { ja: "$100K+の仕入れが必要。外部委託で85/15%分配想定。Dougの推薦(コリナウェディング/フォーシーズン担当業者)。2-3日開催なら不人気銘柄を翌日カット可能", en: "$100K+ procurement needed. Outsource at 85/15% split. Doug's referral (Kolina wedding/Four Seasons vendor). Multi-day: cut unpopular brands next day" } },
      { ja: "ローカル店舗でのハードチケット販売（20店舗）",en: "Hard ticket sales at 20 local shops",        status: "pending",    note: { ja: "Locals-only手数料なし。店舗に$1-$2/枚コミッション。ポスター掲示。候補: Harley Davidson、レコード店、ABC Store、7-Eleven", en: "Locals-only, no service fee. $1-$2/ticket commission. Poster display. Candidates: Harley Davidson, record shops, ABC Store, 7-Eleven" } },
    ],
  },

  // ── 7. マーケティング・PR ─────────────────────────────────────
  {
    ja: "マーケティング・PR",
    en: "Marketing & PR",
    tasks: [
      { ja: "ブランドビジュアル・キービジュアルの確定",  en: "Brand visual & key artwork finalized",        status: "in_progress",note: { ja: "グラフィックデザイナー必要。Steph候補。Electric Palmsチームも検討中。会社カラー: 黄+黒", en: "Graphic designer needed. Steph candidate. Electric Palms team also being considered. Brand colors: yellow + black" } },
      { ja: "SNS ハワイローカルチームによる運用開始",    en: "SNS managed by Sean's local Hawaii team",     status: "done",       note: { ja: "ローカルパートナー(Centered, Lindy On, AudioFile等)全員ラインナップ待ち。確定後にポップアップ撮影・動画・マーチ・ブランディング展開開始。TMR(レゲエDB10万人)はEDM向きではないが補助チャネルとして活用", en: "Local partners (Centered, Lindy On, AudioFile etc) all waiting for lineup. Post-confirmation: popup shoots, videos, merch, branding. TMR (100K reggae DB) as supplementary channel" } },
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
      { ja: "ホテルパッケージ販売方針の決定",            en: "Hotel package sales policy decision",         status: "urgent",     note: { ja: "⚠ 会場変更でNEWT/Shino(小寺Yuki)に再アプローチ必要。日立の樹の会場で日本人観光客に訴求力大。VIP用チャーターバス(ワイキキ↔会場12分)をパッケージに含める。日本・シンガポール・台湾・韓国向け", en: "⚠ Must re-approach NEWT/Shino (Ohki Yuki) after venue change. Hitachi tree venue = strong appeal for Japanese tourists. Include charter bus (Waikiki↔venue 12min) in packages. Target: Japan, Singapore, Taiwan, Korea" } },
      { ja: "Aloha7（大木 優紀）とホテル卸契約",        en: "Hotel wholesale deal with Aloha7 (Ohki)",     status: "in_progress",note: { ja: "Aloha7はシェラトンワイキキ／プリンセスカイウラニを候補として提案中", en: "Aloha7 proposing Sheraton Waikiki / Princess Kaiulani" } },
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
      { ja: "アフターパーティー会場の確定",              en: "After-party venue confirmed",                 status: "in_progress",note: { ja: "候補: Kala Waikiki (5PM-2AM, Tropic Bamba/Jack) + Anura (12AM-dawn, Miko担当)。ハワイPD運営のアフターアワーズ会場も候補", en: "Candidates: Kala Waikiki (5PM-2AM, Tropic Bamba/Jack) + Anura (12AM-dawn, Miko contact). HPD-operated after-hours venue also candidate" } },
      { ja: "内部コミュニケーション体制の一元化",        en: "Unified internal communications",             status: "urgent",     note: { ja: "⚠ Sid: カレンダー同期に苦労(Coachella6グループ+ZAMNA)。WhatsApp中心に統一を試みるが、深夜のSean/Sid/Vakas間テキストがグループに共有されない問題。全員のカレンダー統合が急務", en: "⚠ Sid struggling to sync calendars (Coachella 6 groups + ZAMNA). Trying to centralize on WhatsApp but late-night Sean/Sid/Vakas texts not shared with group. Calendar integration urgent" } },
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
      { ja: "救護・医療チームの手配",                    en: "On-site medical team arranged",               status: "pending",    note: { ja: "EMT 4名 + 救護テント2箇所（メインステージ横・VIPエリア内）", en: "4 EMTs + 2 medical tents (main stage side + VIP area)" } },
      { ja: "ファーストエイドステーションの設置計画",    en: "First aid station setup plan",                status: "pending" },
      { ja: "緊急時対応マニュアルの作成",                en: "Emergency response manual created",           status: "pending",    note: { ja: "避難経路・集合場所・連絡フロー・天候中止基準を含む", en: "Include evacuation routes, assembly points, comms flow, weather cancellation criteria" } },
      { ja: "消防署・警察との事前協議",                  en: "Pre-event coordination with fire dept & police",status: "pending",  note: { ja: "HPD Manny・Dougとの連携。会場確定後に詳細協議", en: "Coordinate with HPD Manny & Doug. Detailed planning after venue confirmed" } },
      { ja: "危険物・薬物対策ポリシーの策定",            en: "Drugs & contraband policy defined",           status: "pending" },
      { ja: "熱中症・暑さ対策（9月ハワイ）",             en: "Heat stroke prevention (Sept Hawaii)",        status: "pending",    note: { ja: "ミスト扇風機・無料給水ステーション・日陰エリアの確保。9月のハワイは30°C超", en: "Mist fans, free hydration stations, shade areas. Hawaii in Sept exceeds 30°C / 86°F" } },
    ],
  },

  // ── 13. テクノロジー・デジタル ────────────────────────────────
  {
    ja: "テクノロジー・デジタル",
    en: "Technology & Digital",
    tasks: [
      { ja: "公式サイトの本番化（solun.art）",           en: "Official site live (solun.art)",              status: "done",       note: { ja: "Zig/WASM (Fermyon Spin) に移行完了。バイナリ82KB・コールドスタート~1ms・Docker 129MB。soluna-web.fly.dev で稼働中", en: "Migrated to Zig/WASM (Fermyon Spin). Binary 82KB, ~1ms cold start, Docker 129MB. Running on soluna-web.fly.dev" } },
      { ja: "パートナーポータルの整備",                  en: "Partner portal complete",                     status: "done",       note: { ja: "NDA / 投資 / スポンサー契約・DB保存対応済。Stripe決済・Resendメール連携稼働中", en: "NDA / investment / sponsor + DB storage live. Stripe payments & Resend email integration active" } },
      { ja: "solun.art カスタムドメインの DNS 設定",     en: "solun.art custom domain DNS setup",           status: "done",       note: { ja: "Fly.io証明書発行済み。solun.art で本番稼働中", en: "Fly.io cert issued. Production live at solun.art" } },
      { ja: "メール配信システムの構築",                  en: "Email marketing system setup",                status: "done",       note: { ja: "管理画面からメール一斉送信可能（/admin → メール登録タブ）。Resend API統合済み", en: "Blast emails from admin panel (Emails tab). Resend API integrated" } },
      { ja: "来場者向け Web ガイド / アプリの制作",      en: "Attendee web guide / app",                    status: "done",       note: { ja: "solun.art/guide で公開済み（タイムライン・アクセス・持ち物）", en: "Live at solun.art/guide — timeline, transport, packing list" } },
      { ja: "ライブ配信 / ストリーミングの検討",         en: "Live stream / broadcasting plan",             status: "pending",    note: { ja: "YouTube Live / Twitch での2日間配信を検討。アフタームービー制作と連携", en: "Considering YouTube Live / Twitch for 2-day broadcast. Coordinate with after-movie team" } },
      { ja: "当日チェックインアプリ（QR対応）",          en: "Day-of check-in app (QR support)",            status: "in_progress",note: { ja: "Ticketblox QRコードとの連携。入場ゲート用タブレットUI開発中", en: "Integration with Ticketblox QR codes. Developing tablet UI for entry gates" } },
    ],
  },

  // ── 14. フード＆ビバレッジ ────────────────────────────────────
  {
    ja: "フード＆ビバレッジ",
    en: "Food & Beverage",
    tasks: [
      { ja: "F&Bベンダー統括（OC Japan Fair + HI Japan Fair）", en: "F&B lead (OC Japan Fair + HI Japan Fair)",   status: "done",       note: { ja: "50食ベンダー+20-30物販=計80ベンダー。各ベンダーが自社SNSでイベント宣伝。アーティスト用フードチケット提供。VIPテーブル用ケータリング協力も検討中", en: "50 food + 20-30 arts/crafts = 80 vendors total. Each vendor promotes event via their own social media. Artist food tickets. VIP table catering collaboration under discussion" } },
      { ja: "F&Bベンダーの選定・契約",                   en: "F&B vendor selection & contracts",            status: "in_progress",note: { ja: "F&B収益100%自社。ベンダー料$1,000 + 収益の1/3（要最終確認）。'Hawaiian Japanese Market'コンセプト", en: "100% F&B revenue. Vendor fee $1,000 + 1/3 revenue (needs final confirmation). 'Hawaiian Japanese Market' concept" } },
      { ja: "ドリンクメニュー・バー配置の設計",          en: "Drink menu & bar layout design",              status: "in_progress",note: { ja: "Beatboxスポンサー候補（Sid がオーナーと知り合い）+ Maui Brewing Company。若者向け+地元ブランドの組み合わせ", en: "Beatbox sponsor candidate (Sid knows owner) + Maui Brewing Company. Youth + local brand combo" } },
      { ja: "VIP専用ケータリング・メニューの設計",       en: "VIP exclusive catering & menu",               status: "pending",    note: { ja: "Allen Arato (Mai Tai's) と連携。VIPラウンジ専用バー", en: "Coordinate with Allen Arato (Mai Tai's). VIP lounge private bar" } },
      { ja: "フードトラック・屋台の手配（30台目標）",    en: "Food truck arrangements (30 target)",         status: "in_progress",note: { ja: "Gabeが統括。3/18に会場で計測・配置確認。ハワイアンプレートランチ・ポケ・アサイーボウル等", en: "Gabe leading. 3/18 on-site measurement & layout. Hawaiian plate lunch, poke, acai bowls, etc." } },
      { ja: "物販ブース（20ブース目標）",                en: "Merch vendor booths (20 target)",             status: "pending",    note: { ja: "Gabeが統括。Hawaiian Japanese Market コンセプト", en: "Gabe leading. Hawaiian Japanese Market concept" } },
      { ja: "酒類提供ライセンス（Liquor License）",      en: "Liquor license secured",                      status: "pending" },
    ],
  },

  // ── 15. サステナビリティ ──────────────────────────────────────
  {
    ja: "サステナビリティ",
    en: "Sustainability",
    tasks: [
      { ja: "環境方針・グリーン宣言の策定",              en: "Environmental policy & green pledge",         status: "done",       note: { ja: "サイト掲載済み（/guide — ZAMNA GREEN PLEDGE）", en: "Published on site (/guide — ZAMNA GREEN PLEDGE)" } },
      { ja: "使い捨てプラスチックゼロの実施計画",        en: "Single-use plastic-free plan",                status: "in_progress",note: { ja: "方針掲載済み・現地運営チームと詳細詰め中", en: "Policy published — coordinating with on-site ops team" } },
      { ja: "カーボンオフセット計画",                    en: "Carbon offset program",                       status: "pending",    note: { ja: "航空・発電機・輸送のCO2を算出し、ハワイの森林保全プロジェクトに投資", en: "Calculate CO2 from flights, generators, transport. Invest in Hawaii forest conservation" } },
      { ja: "地域コミュニティ・環境保護への貢献策",      en: "Local community & environmental contribution", status: "pending",   note: { ja: "Moanalua Gardens 近隣住民への還元策。地元学校・NPOとの連携", en: "Give-back plan for Moanalua Gardens neighbors. Partner with local schools & NPOs" } },
      { ja: "リユーザブルカップ・ZAMNA限定グッズ",       en: "Reusable cups & ZAMNA merch",                 status: "pending",    note: { ja: "デポジット制カップ＋限定デザインで物販収益も獲得", en: "Deposit-based cups + limited edition design for merch revenue" } },
    ],
  },

  // ── 16. イベント後 ────────────────────────────────────────────
  {
    ja: "イベント後（アフターケア）",
    en: "Post-Event",
    tasks: [
      { ja: "投資家への返済・報告（チケット売上 First-out）",en: "Investor repayment (ticket revenue First-out)",status: "pending",    note: { ja: "イベント後2週間以内に$200K全額返済+選択したリターンプラン(A:固定10-15%/B:余剰20%/C:スポンサー権)の支払い", en: "Full $200K repayment within 2 weeks + selected return plan (A:10-15% fixed / B:20% surplus / C:sponsor rights)" } },
      { ja: "スポンサー向け効果レポートの送付",          en: "Sponsor post-event impact report",            status: "pending",    note: { ja: "来場者数・SNS露出・ブランドリフト調査結果を含む", en: "Include attendance, social impressions, brand lift survey results" } },
      { ja: "アフタームービーの公開",                    en: "After-movie release",                         status: "pending",    note: { ja: "Rare Day / Keppra チームに依頼。イベント後2週間以内にティザー公開", en: "Coordinate with Rare Day / Keppra. Release teaser within 2 weeks post-event" } },
      { ja: "来場者アンケートの実施・集計",              en: "Attendee survey & analysis",                  status: "pending" },
      { ja: "収支最終報告・精算",                        en: "Final financial report & settlement",         status: "pending" },
      { ja: "ZAMNA HAWAII 2027 の検討開始",              en: "ZAMNA HAWAII 2027 planning begins",           status: "pending",    note: { ja: "初年度実績をもとに2027年計画を10月開始目標", en: "Based on year-1 results, start 2027 planning by October" } },
    ],
  },
];

const KPI = [
  { value: "Sep 4–5, 2026", label: { ja: "開催日（Labor Day週末）", en: "Event dates (Labor Day wknd)" } },
  { value: `${Math.ceil((new Date("2026-09-04").getTime() - Date.now()) / 86400000)}d`, label: { ja: "開催まで残り", en: "Days until event" } },
  { value: "9,000/day",     label: { ja: "想定来場者数（/日）",     en: "Expected attendance (per day)" } },
  { value: "$200,000",      label: { ja: "調達目標",               en: "Fundraise target" } },
  { value: "VIP $1,000+",   label: { ja: "VIPチケット最低価格",    en: "VIP ticket starting price" } },
  { value: "+850,000",      label: { ja: "ZAMNAグローバル来場実績", en: "ZAMNA global attendance" } },
  { value: "1.25M",         label: { ja: "ZAMNAグローバルSNS",     en: "ZAMNA global social followers" } },
  { value: "82KB",          label: { ja: "サイトバイナリサイズ",    en: "Site binary size (WASM)" } },
];

// ── Team ──────────────────────────────────────────────────────────────────────
type TeamMember = { name: string; ja_role: string; en_role: string; status: "active" | "tbd"; img?: string };
const TEAM: TeamMember[] = [
  { name: "Sean Tsai",    ja_role: "現地統括 / プロダクション",  en_role: "Local Lead / Production",    status: "active", img: "https://ui-avatars.com/api/?name=Sean+Tsai&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
  { name: "Sid",          ja_role: "会場選定 / 行政ルート",      en_role: "Venue / Gov Relations",      status: "active", img: "https://ui-avatars.com/api/?name=S&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
  { name: "Dr. Vakas Sial",ja_role: "出資 / 財務 / アーティスト関係",  en_role: "Investment / Finance / Artist Relations",  status: "active", img: "https://ui-avatars.com/api/?name=V+S&background=1a1a2e&color=c9a962&size=128&bold=true&format=svg" },
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
  { name: "Moanalua Gardens", contact: "JP Damon", type_ja: "会場オーナー", type_en: "Venue Owner", status: "in_progress", notes_ja: "⚠ 3月第1週のフォローアップ期限到来。LOI送付・地域住民への寄付でグッドウィル構築を今週中に", notes_en: "⚠ March wk1 follow-up deadline NOW. Send LOI + community donation for goodwill THIS WEEK", who: "Sean/Sid", link: "https://www.moanaluagardens.com/" },
  { name: "Hawaii Stage & Lighting", contact: "Kuhio Lewis", type_ja: "ステージ/照明/政治", type_en: "Stage / Lighting / Political", status: "in_progress", notes_ja: "Bruno Mars機材所有。Roy Tokujoの甥。市議会メンバーでもある。Kuhioが市議会メンバーとの1:1ミーティングをSidにアレンジ中。制作も進行中", notes_en: "Owns Bruno Mars gear. Roy Tokujo's nephew. Also on city council. Kuhio arranging 1:1 council meetings for Sid. Production in motion", phone: "8083892006", who: "Sid", link: "https://www.hawaii-stage.com/" },
  { name: "Hawaii Tourism", contact: "Roy Tokujo", type_ja: "観光連携", type_en: "Tourism", status: "pending", notes_ja: "ハワイ観光の創設者。最長記録のルアウ", notes_en: "Founder of Hawaii Tourism. Longest running luau", phone: "8082262727", who: "" },
  { name: "Centered", contact: "Miko / Sound Sexy", type_ja: "プロモーター", type_en: "Promoter", status: "outreach", notes_ja: "木曜19時以降に通話を移動", notes_en: "Move call to after 7 PM Thursday", who: "" },
  { name: "Lit & Beyond", contact: "Gilly / Tropic Bamba", type_ja: "プロモーター", type_en: "Promoter", status: "outreach", notes_ja: "", notes_en: "", phone: "8084605056", who: "" },
  { name: "Lit & Beyond", contact: "Jean Jauque", type_ja: "プロモーター", type_en: "Promoter", status: "pending", notes_ja: "", notes_en: "", who: "" },
  { name: "Audiophile", contact: "Lee Anderson", type_ja: "プロモーター(競合)", type_en: "Promoter (Competitor)", status: "in_progress", notes_ja: "島のトップEDM。情報共有に慎重。レンタル費用未確定", notes_en: "Top EDM on island. Tight on sharing info. Figuring out rent", phone: "8087816522", who: "" },
  { name: "Audiophile", contact: "Brandon", type_ja: "音響技術", type_en: "Stage Tech / Sound", status: "pending", notes_ja: "", notes_en: "", email: "brandon@wearemetta.com", phone: "8082940427", who: "" },
  { name: "TMR / Reggae Festival", contact: "Ray Jr.", type_ja: "島内パートナー", type_en: "Island Partner", status: "pending", notes_ja: "連絡する", notes_en: "To reach out", phone: "8089541077", who: "" },
  { name: "Electric Palms", contact: "Taylor", type_ja: "パートナー/デザイン", type_en: "Partner / Design", status: "in_progress", notes_ja: "NDA送付済み (seafoamgreen@me.com)。チームのデザイナーリソース活用を検討中", notes_en: "NDA sent (seafoamgreen@me.com). Considering their designer resources", email: "seafoamgreen@me.com", who: "Sean/Keyanna" },
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
  { name: "Vibelab", contact: "Jovan", type_ja: "マーケティング", type_en: "Marketing / Promo", status: "in_progress", notes_ja: "2/17ミーティング済み。ラインナップ発表後にプッシュ強化希望。SNS広告予算の見積もり依頼中", notes_en: "Meeting done 2/17. Wants more aggressive push once lineup announced. Requesting ad budget estimate", who: "" },
  { name: "令和トラベル (NEWT)", contact: "Shino", type_ja: "旅行販売", type_en: "Travel / Packages", status: "in_progress", notes_ja: "日本最大級の海外旅行予約アプリ。Aloha7はNEWTの完全子会社。ホテル付きパッケージ販売の窓口", notes_en: "One of Japan's largest travel apps. Aloha7 is NEWT's fully owned subsidiary. Hotel package sales gateway", who: "Yuki" },
  { name: "Aloha7 (令和トラベル子会社)", contact: "大木 優紀 (Yuuki Ohki)", type_ja: "ホテル卸(NEWT子会社)", type_en: "Hotel Wholesale (NEWT subsidiary)", status: "in_progress", notes_ja: "令和トラベル完全子会社(2023年12月取得)。CEO大木優紀=令和トラベル執行役員CCO兼任。シェラトンワイキキ/プリンセスカイウラニ候補。今月中に在庫確保が必須", notes_en: "Fully owned by Reiwa Travel (acquired Dec 2023). CEO Yuuki Ohki = Reiwa Travel CCO. Proposing Sheraton Waikiki / Princess Kaiulani. Must block inventory this month", who: "Sean/Yuki" },
  { name: "Gabe", contact: "Gabe", type_ja: "F&B統括", type_en: "F&B Operations Lead", status: "confirmed", notes_ja: "フードトラック30台+物販20ブースを統括。アーティスト専用シェフ手配。スタッフ用フード無料チケット付き。3/18会場計測予定", notes_en: "Overseeing 30 food trucks + 20 merch vendors. Artist compound chef. Free food tickets for staff. 3/18 on-site measurement", who: "Sean" },
  { name: "Ticketblox", contact: "Anup", type_ja: "チケット販売", type_en: "Ticket Platform", status: "confirmed", notes_ja: "zamnahawaii.ticketblox.comで稼働中。3/17戦略ミーティング実施。キャッシュレスリストバンド・RFIDも対応可能。Peterもサポート", notes_en: "zamnahawaii.ticketblox.com live. Strategy meeting held 3/17. Cashless wristbands & RFID capable. Peter also supporting", who: "Keyanna/Sid/Vakas" },
  { name: "Sydney / Project P", contact: "Sydney & Lucas", type_ja: "ピックルボール・レイブ", type_en: "Pickleball Rave", status: "outreach", notes_ja: "プレイベントまたはフェスティバル内でのコラボ案。ハワイにはピックルボール+車好きが多い。Vakas作成のmonetizationプラン・投資デックあり", notes_en: "Pre-event or in-festival collab proposal. Hawaii has strong pickleball + car community. Vakas created monetization plan & investor deck", who: "Keyanna/Vakas" },
  { name: "Beatbox", contact: "TBD", type_ja: "飲料スポンサー候補", type_en: "Beverage Sponsor Candidate", status: "outreach", notes_ja: "Sidがオーナーと知り合い。Insomniacイベントで人気。ハワイではまだ少ないがMaui Brewingと組み合わせ可能", notes_en: "Sid knows the owner. Popular at Insomniac events. Limited in Hawaii but pairs well with Maui Brewing", who: "Sid/Vakas" },
  { name: "Maui Brewing Company", contact: "TBD", type_ja: "飲料スポンサー候補", type_en: "Beverage Sponsor Candidate", status: "pending", notes_ja: "島で確立されたブランド。Beatboxと組み合わせ案（若者向け+地元ビール）", notes_en: "Established island brand. Combo with Beatbox proposed (youth + local beer)", who: "Keyanna" },
  { name: "Kala Waikiki", contact: "Tropic Bamba / Jack", type_ja: "アフターパーティー会場候補", type_en: "After-party Venue Candidate", status: "outreach", notes_ja: "5PM-2AM。毎週金曜+月1土曜。先週リブランド。9月までに変更の可能性あり", notes_en: "5PM-2AM. Every Fri + 1x monthly Sat. Just rebranded last week. May change by September", who: "Keyanna" },
  { name: "Anura", contact: "Miko", type_ja: "アフターパーティー会場候補", type_en: "After-party Venue Candidate", status: "outreach", notes_ja: "12AM-dawn。Mikoが窓口", notes_en: "12AM-dawn. Miko is the connect", who: "Keyanna" },
];

// ── Venue Pros / Cons ─────────────────────────────────────────────────────────
// ── Shared Resources ─────────────────────────────────────────────────────────
type SharedResource = { ja: string; en: string; url: string; icon: string; cat_ja: string; cat_en: string };
const SHARED_RESOURCES: SharedResource[] = [
  { ja: "Google Drive（全チーム共有）",           en: "Google Drive (Team Shared)",           url: "https://drive.google.com/drive/folders/0AFx6F488-MxQUk9PVA",         icon: "📁", cat_ja: "ファイル", cat_en: "Files" },
  { ja: "ブランドアセット（ロゴ等）",             en: "Brand Assets (Logos, etc.)",            url: "https://drive.google.com/drive/folders/1KX3TtzxH54HKG-PA1OdIiUVpJpIopkO1", icon: "🎨", cat_ja: "ファイル", cat_en: "Files" },
  { ja: "NDAフォルダ",                            en: "NDA Folder",                            url: "https://drive.google.com/drive/folders/1sIrSdttBaB4Wj5dH_luEHpGyjwHeYOSj", icon: "📝", cat_ja: "法務", cat_en: "Legal" },
  { ja: "パートナー連絡先リスト",                 en: "Partner Contact List",                  url: "https://docs.google.com/spreadsheets/d/1vcUVIE7CX4Lvb_MJphHPy2ZJ8_Z3RZv_A3vwZ3ybUsA/edit?gid=1147233400#gid=1147233400", icon: "📊", cat_ja: "スプレッドシート", cat_en: "Spreadsheet" },
  { ja: "予算シート（Sean版）",                   en: "Budget Sheet (Sean's)",                 url: "https://docs.google.com/spreadsheets/u/0/d/1_vLUBivkOgRvoAPwC6WoBYRH-GrZgmd7iz2IgFbXi7U/htmlview", icon: "💰", cat_ja: "スプレッドシート", cat_en: "Spreadsheet" },
  { ja: "予算シート（Keyanna版 - 会場変更対応）", en: "Budget Sheet (Keyanna's - venue update)",url: "https://docs.google.com/spreadsheets/d/14dODhSUwvNEWEjj6ePb6-9Lpsrz3G8Y0nmlnhX8VwRg/edit?gid=386591027#gid=386591027", icon: "💰", cat_ja: "スプレッドシート", cat_en: "Spreadsheet" },
  { ja: "チケット販売レポート",                   en: "Ticket Sales Report",                   url: "https://docs.google.com/document/d/1faSbZ_lYJ8yTA3XN9BDceSxVFFhkALB_w84rgrS6VCE/edit?tab=t.0#heading=h.vp7knecr13u5", icon: "📈", cat_ja: "レポート", cat_en: "Report" },
  { ja: "チームミーティング (毎週月曜)",          en: "Team Meeting (Weekly Monday)",           url: "https://meet.google.com/mqf-rmdm-nkc",                              icon: "📹", cat_ja: "ミーティング", cat_en: "Meeting" },
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
  { ja: "ベンダー料体系の確定が必要（$1,000 + 収益1/3 の整合性）", en: "Vendor fee structure needs finalization ($1,000 fee + 1/3 revenue consistency)" },
];

// ── Gantt ─────────────────────────────────────────────────────────────────
const G_START = new Date("2026-01-01").getTime();
const G_END   = new Date("2026-11-01").getTime();
const G_TOTAL = G_END - G_START;
const dp = (s: string) => Math.min(100, Math.max(0, (new Date(s).getTime() - G_START) / G_TOTAL * 100));
const GM = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"];

type GStatus = Status | "event";
const GANTT: { ja: string; en: string; start: string; end: string; s: GStatus }[] = [
  { ja: "出資金 $200K 調達",         en: "Investment Raise $200K",  start: "2026-02-01", end: "2026-04-15", s: "urgent" },
  { ja: "ZAMNAライセンス締結",       en: "ZAMNA Brand License",     start: "2026-02-01", end: "2026-03-31", s: "urgent" },
  { ja: "会場契約 (Moanalua Gardens)", en: "Venue Contract",          start: "2026-02-01", end: "2026-03-31", s: "urgent" },
  { ja: "ホテル在庫確保 500室",      en: "Hotel Block (500 rooms)", start: "2026-02-15", end: "2026-04-15", s: "urgent" },
  { ja: "チケット販売 (Ticketblox)", en: "Ticket Sales Live",       start: "2026-02-08", end: "2026-09-05", s: "done" },
  { ja: "サイト Zig/WASM 移行",      en: "Site Zig/WASM Migration", start: "2026-02-20", end: "2026-03-05", s: "done" },
  { ja: "イベント許可申請",          en: "Event Permits",           start: "2026-02-15", end: "2026-05-31", s: "in_progress" },
  { ja: "会場承認 (行政・近隣)",     en: "Venue Approval (City)",    start: "2026-03-01", end: "2026-04-30", s: "urgent" },
  { ja: "ヘッドライナー契約",        en: "Headliner Booking",       start: "2026-03-01", end: "2026-04-30", s: "urgent" },
  { ja: "アーティストビザ申請",      en: "Artist Visa (O-1/P-1)",   start: "2026-03-01", end: "2026-07-31", s: "urgent" },
  { ja: "ZAMNA アーティストオプション", en: "ZAMNA Artist Options",   start: "2026-03-29", end: "2026-04-15", s: "urgent" },
  { ja: "近隣住民署名50名",          en: "Neighbor Signatures (50)",start: "2026-03-15", end: "2026-04-30", s: "in_progress" },
  { ja: "市議会1:1ミーティング",     en: "City Council 1:1 Meetings",start: "2026-03-17", end: "2026-05-15", s: "in_progress" },
  { ja: "F&B・物販ブース計画",       en: "F&B & Vendor Planning",   start: "2026-03-17", end: "2026-06-30", s: "in_progress" },
  { ja: "Sydney コラボ / Pre-Event", en: "Sydney Collab / Pre-Event",start: "2026-03-15", end: "2026-05-31", s: "in_progress" },
  { ja: "スポンサー契約 ($100K+)",   en: "Sponsor Deals ($100K+)",  start: "2026-03-01", end: "2026-06-30", s: "in_progress" },
  { ja: "アフターパーティー会場確定", en: "After-party Venue",       start: "2026-03-15", end: "2026-05-31", s: "in_progress" },
  { ja: "音響・照明業者契約",        en: "Production Vendors",      start: "2026-04-01", end: "2026-06-30", s: "pending" },
  { ja: "プレス・広告展開",          en: "Press & Ad Campaign",     start: "2026-04-01", end: "2026-08-31", s: "pending" },
  { ja: "ラインナップ発表",          en: "Lineup Announcement",     start: "2026-05-01", end: "2026-05-31", s: "pending" },
  { ja: "スタッフ採用 (30-50名)",    en: "Staff Hiring",            start: "2026-06-01", end: "2026-08-15", s: "pending" },
  { ja: "リハーサル・最終確認",      en: "Rehearsal & Final Check", start: "2026-08-25", end: "2026-09-03", s: "pending" },
  { ja: "David排除・Ticketblox再契約",en: "Remove David / Recontract",start: "2026-03-17", end: "2026-03-24", s: "urgent" },
  { ja: "Taylor due diligence",     en: "Taylor Due Diligence",    start: "2026-03-17", end: "2026-04-15", s: "in_progress" },
  { ja: "VIPテーブル・アルコール設計",en: "VIP Table & Alcohol Plan", start: "2026-03-17", end: "2026-05-31", s: "in_progress" },
  { ja: "NEWT/Shino ホテル再交渉",  en: "NEWT/Shino Hotel Renegotiation",start: "2026-03-18", end: "2026-04-30", s: "urgent" },
  { ja: "近隣訪問（苦情者14名）",   en: "Neighbor Visits (14 complainers)",start: "2026-03-18", end: "2026-04-15", s: "in_progress" },
  { ja: "Proof of Funds 準備",      en: "Proof of Funds Ready",    start: "2026-03-17", end: "2026-03-28", s: "urgent" },
  { ja: "会場LOI署名",              en: "Venue LOI Signed",         start: "2026-03-18", end: "2026-03-22", s: "in_progress" },
  { ja: "Coachella (Sid出張)",      en: "Coachella (Sid away)",     start: "2026-03-29", end: "2026-04-07", s: "pending" },
  { ja: "2日目・3日目検討 (Taylor)", en: "Day 2-3 Planning (Taylor)",start: "2026-04-01", end: "2026-05-31", s: "pending" },
  { ja: "ステージ・バックステージ設計",en: "Stage & Backstage Design",start: "2026-04-01", end: "2026-06-30", s: "pending" },
  { ja: "シャトルバス手配",          en: "Shuttle Bus Arrangement",  start: "2026-04-15", end: "2026-07-31", s: "pending" },
  { ja: "アルコール仕入れ ($100K+)",en: "Alcohol Procurement ($100K+)",start: "2026-06-01", end: "2026-08-15", s: "pending" },
  { ja: "アフタームービー制作",     en: "After-movie Production",   start: "2026-09-06", end: "2026-09-30", s: "pending" },
  { ja: "投資家返済",               en: "Investor Repayment",       start: "2026-09-15", end: "2026-10-15", s: "pending" },
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

type FeedbackItem = {
  id: number;
  page: string;
  member: string | null;
  category: string;
  message: string;
  created_at: string;
};

const FB_CATEGORIES = [
  { value: "general",    ja: "全般",       en: "General" },
  { value: "task",       ja: "タスク",     en: "Task" },
  { value: "venue",      ja: "会場",       en: "Venue" },
  { value: "artist",     ja: "アーティスト", en: "Artist" },
  { value: "sponsor",    ja: "スポンサー",  en: "Sponsor" },
  { value: "tech",       ja: "テック",     en: "Tech" },
  { value: "idea",       ja: "アイデア",   en: "Idea" },
  { value: "bug",        ja: "バグ報告",   en: "Bug Report" },
];

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
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [fbMessage, setFbMessage] = useState("");
  const [fbCategory, setFbCategory] = useState("general");
  const [fbSending, setFbSending] = useState(false);
  const [fbSent, setFbSent] = useState(false);
  const [fbPage, setFbPage] = useState("admin");
  // Partners from DB
  const [dbPartners, setDbPartners] = useState<(Partner & { id?: number })[] | null>(null);
  const [editPartner, setEditPartner] = useState<(Partner & { id?: number }) | null>(null);
  // Tab navigation
  type Tab = "dashboard" | "tasks" | "partners" | "budget" | "timeline" | "docs" | "comms";
  const [activeMainTab, setActiveMainTab] = useState<Tab>("dashboard");
  // Activity Feed
  type ActivityItem = { id: number; member: string; action_type: string; title: string; description: string | null; category: string | null; created_at: string };
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [actTitle, setActTitle] = useState("");
  const [actDesc, setActDesc] = useState("");
  const [actType, setActType] = useState("update");
  const [actCategory, setActCategory] = useState("");
  const [actSending, setActSending] = useState(false);
  // Task Comments
  type TaskComment = { id: number; task_key: string; member: string; message: string; created_at: string };
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [openCommentKey, setOpenCommentKey] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  // Budget Tracker
  type BudgetItem = { id: number; category: string; item_ja: string; item_en: string; amount: number; currency: string; type: string; status: string; notes: string | null; updated_by: string | null; updated_at: string; created_at: string };
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ category: "", item_ja: "", item_en: "", amount: 0, type: "expense" as string, status: "estimate", notes: "" });
  const [editBudgetId, setEditBudgetId] = useState<number | null>(null);
  // Agent chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string; sql_results?: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
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
    // Handle ?tab= parameter
    const tabParam = params.get("tab");
    if (tabParam && ["dashboard","tasks","partners","budget","timeline","docs","comms"].includes(tabParam)) {
      setActiveMainTab(tabParam as Tab);
    }
    if (urlKey === "LIFEISART") {
      sessionStorage.setItem("admin_auth", "1");
      setAuthed(true);
      // Keep tab and hash for deep linking, remove key from URL
      const cleanParams = new URLSearchParams();
      if (tabParam) cleanParams.set("tab", tabParam);
      const cleanUrl = window.location.pathname + (cleanParams.toString() ? `?${cleanParams}` : "") + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
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
    // Load feedback
    fetch("/api/feedback", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setFeedbackList).catch(() => {});
    // Load task comments
    fetch("/api/task-comments", { headers }).then(r => r.ok ? r.json() : []).then(setTaskComments).catch(() => {});
    // Load activity feed
    fetch("/api/activity?limit=50", { headers }).then(r => r.ok ? r.json() : []).then(data => {
      setActivities(data);
      // Auto-scroll to hash target after data loads
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith("#activity-")) {
          const el = document.getElementById(hash.slice(1));
          if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.style.outline = "2px solid rgba(201,169,98,0.6)"; el.style.outlineOffset = "4px"; setTimeout(() => { el.style.outline = "none"; }, 3000); }
        }
      }, 500);
    }).catch(() => {});
    // Load budget items
    fetch("/api/budget", { headers }).then(r => r.ok ? r.json() : []).then(setBudgetItems).catch(() => {});
    // Load partners from DB (seed if empty)
    fetch("/api/partners", { headers })
      .then(r => r.ok ? r.json() : [])
      .then(async (rows: (Partner & { id: number })[]) => {
        if (rows.length > 0) {
          setDbPartners(rows);
        } else {
          // Seed from hardcoded data
          for (const p of PARTNERS) {
            await fetch("/api/partners", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
              body: JSON.stringify(p),
            }).catch(() => {});
          }
          // Re-fetch
          const r2 = await fetch("/api/partners", { headers });
          if (r2.ok) setDbPartners(await r2.json());
        }
      }).catch(() => {});
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

  const sendFeedback = async () => {
    if (!fbMessage.trim()) return;
    setFbSending(true);
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify({ page: fbPage, member, category: fbCategory, message: fbMessage.trim() }),
      });
      if (r.ok) {
        const d = await r.json();
        setFeedbackList(prev => [{ id: d.id, page: fbPage, member, category: fbCategory, message: fbMessage.trim(), created_at: new Date().toISOString().replace("T", " ").slice(0, 19) }, ...prev]);
        setFbMessage("");
        setFbSent(true);
        setTimeout(() => setFbSent(false), 2000);
      }
    } catch { /* ignore */ }
    setFbSending(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const r = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });
      const d = await r.json();
      if (d.response) {
        // Unescape \\n to real newlines
        const text = d.response.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        setChatMessages(prev => [...prev, { role: "assistant", content: text, sql_results: d.sql_results }]);
      } else if (d.error) {
        setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${d.error}` }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Network error" }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const savePartner = async (p: Partner & { id?: number }) => {
    const headers = { "Content-Type": "application/json", "x-admin-key": "LIFEISART" };
    if (p.id) {
      await fetch(`/api/partners/${p.id}`, { method: "PUT", headers, body: JSON.stringify(p) });
    } else {
      const r = await fetch("/api/partners", { method: "POST", headers, body: JSON.stringify(p) });
      const d = await r.json();
      p.id = d.id;
    }
    // Refresh
    const r = await fetch("/api/partners", { headers: { "x-admin-key": "LIFEISART" } });
    if (r.ok) setDbPartners(await r.json());
    setEditPartner(null);
  };

  const deletePartner = async (id: number) => {
    await fetch(`/api/partners/${id}`, { method: "DELETE", headers: { "x-admin-key": "LIFEISART" } });
    setDbPartners(prev => prev?.filter(p => p.id !== id) ?? null);
  };

  // ── Task Comment handlers ──
  const postComment = async (taskKey: string) => {
    if (!commentInput.trim() || !member) return;
    setCommentSending(true);
    try {
      const r = await fetch("/api/task-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify({ task_key: taskKey, member, message: commentInput.trim() }),
      });
      if (r.ok) {
        const d = await r.json();
        setTaskComments(prev => [{ id: d.id, task_key: taskKey, member: member!, message: commentInput.trim(), created_at: new Date().toISOString().replace("T", " ").slice(0, 19) }, ...prev]);
        setCommentInput("");
      }
    } catch { /* ignore */ }
    setCommentSending(false);
  };

  const deleteComment = async (id: number) => {
    await fetch(`/api/task-comments/${id}`, { method: "DELETE", headers: { "x-admin-key": "LIFEISART" } });
    setTaskComments(prev => prev.filter(c => c.id !== id));
  };

  const getComments = (taskKey: string) => taskComments.filter(c => c.task_key === taskKey);

  // ── Activity Feed handlers ──
  const postActivity = async () => {
    if (!actTitle.trim() || !member) return;
    setActSending(true);
    try {
      const r = await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": "LIFEISART" },
        body: JSON.stringify({ member, action_type: actType, title: actTitle.trim(), description: actDesc.trim() || null, category: actCategory || null }),
      });
      if (r.ok) {
        const d = await r.json();
        setActivities(prev => [{ id: d.id, member: member!, action_type: actType, title: actTitle.trim(), description: actDesc.trim() || null, category: actCategory || null, created_at: new Date().toISOString().replace("T", " ").slice(0, 19) }, ...prev]);
        setActTitle(""); setActDesc(""); setActCategory("");
      }
    } catch { /* ignore */ }
    setActSending(false);
  };

  const deleteActivity = async (id: number) => {
    await fetch(`/api/activity/${id}`, { method: "DELETE", headers: { "x-admin-key": "LIFEISART" } });
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // ── Budget handlers ──
  const saveBudgetItem = async () => {
    if (!budgetForm.category || !budgetForm.item_ja) return;
    const headers = { "Content-Type": "application/json", "x-admin-key": "LIFEISART" };
    const payload = { ...budgetForm, updated_by: member };
    if (editBudgetId) {
      await fetch(`/api/budget/${editBudgetId}`, { method: "PUT", headers, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/budget", { method: "POST", headers, body: JSON.stringify(payload) });
    }
    const r = await fetch("/api/budget", { headers: { "x-admin-key": "LIFEISART" } });
    if (r.ok) setBudgetItems(await r.json());
    setShowBudgetForm(false); setEditBudgetId(null);
    setBudgetForm({ category: "", item_ja: "", item_en: "", amount: 0, type: "expense", status: "estimate", notes: "" });
  };

  const deleteBudgetItem = async (id: number) => {
    await fetch(`/api/budget/${id}`, { method: "DELETE", headers: { "x-admin-key": "LIFEISART" } });
    setBudgetItems(prev => prev.filter(b => b.id !== id));
  };

  const ACT_TYPES: Record<string, { label: string; icon: string }> = {
    update: { label: "Update", icon: "📝" },
    decision: { label: "Decision", icon: "✅" },
    meeting: { label: "Meeting", icon: "📹" },
    milestone: { label: "Milestone", icon: "🏁" },
    blocker: { label: "Blocker", icon: "🚨" },
    finance: { label: "Finance", icon: "💰" },
  };

  const BUDGET_CATS = ["Venue", "Production", "Artists", "Marketing", "F&B", "Staffing", "Logistics", "Insurance", "Legal", "Technology", "Hotel", "Sponsor", "Other"];

  // Persona definitions
  const PERSONA: Record<string, { icon: string; focus: string[]; urgentSections: number[]; defaultTab: Tab; kpiKeys: number[] }> = {
    "Sean Tsai":     { icon: "🎧", focus: ["production", "venue", "marketing", "team"],    urgentSections: [3, 4, 9, 10], defaultTab: "dashboard", kpiKeys: [0,1,2] },
    "Sid":           { icon: "🏛", focus: ["venue", "finance", "legal", "artist"],          urgentSections: [0, 2, 3, 4, 5], defaultTab: "dashboard", kpiKeys: [0,1,3,4] },
    "Dr. Vakas Sial":{ icon: "💼", focus: ["finance", "artist", "sponsor", "ticket"],       urgentSections: [0, 1, 5, 7],  defaultTab: "budget",    kpiKeys: [1,3,4,5] },
    "Keyanna":       { icon: "📋", focus: ["team", "ticket", "marketing", "production"],    urgentSections: [5, 6, 9],     defaultTab: "dashboard", kpiKeys: [0,1,2] },
    "Yuki":          { icon: "⚡", focus: ["tech", "ticket", "finance"],                     urgentSections: [12, 5],       defaultTab: "dashboard", kpiKeys: [0,1,7] },
  };
  const persona = member ? PERSONA[member] || null : null;

  // Task counts per section
  const sectionUrgentCounts = SECTIONS.map((s, sIdx) =>
    s.tasks.filter((_, tIdx) => getEffectiveStatus(sIdx, tIdx, s.tasks[tIdx].status) === "urgent").length
  );

  // TAB definitions
  const TABS: { key: Tab; ja: string; en: string; icon: string }[] = [
    { key: "dashboard", ja: "ダッシュボード", en: "Dashboard", icon: "📊" },
    { key: "tasks",     ja: "タスク",         en: "Tasks",     icon: "✅" },
    { key: "partners",  ja: "パートナー",     en: "Partners",  icon: "🤝" },
    { key: "budget",    ja: "予算",           en: "Budget",    icon: "💰" },
    { key: "timeline",  ja: "タイムライン",   en: "Timeline",  icon: "📅" },
    { key: "docs",      ja: "資料",           en: "Docs",      icon: "📁" },
    { key: "comms",     ja: "メール・契約",   en: "Comms",     icon: "📨" },
  ];

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
    <main style={{ background: "#080808", position: "relative", overflowX: "hidden", maxWidth: "100vw" }}>
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
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", gap: 4, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0, overflow: "hidden" }}>
            <a href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textDecoration: "none", flexShrink: 0 }}>ZAMNA</a>
            {member && (
              <button onClick={() => setShowMemberModal(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "rgba(201,169,98,0.08)", color: "rgba(201,169,98,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                <span>{persona?.icon || "👤"}</span>{member.split(" ")[0]}
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
            <span style={{ color: "rgba(74,222,128,0.7)", fontSize: 10, fontWeight: 600 }}>{doneCnt}/{totalCnt}</span>
            {urgentCnt > 0 && <span style={{ color: "rgba(255,80,80,0.8)", fontSize: 10 }}>⚠{urgentCnt}</span>}
            <button onClick={() => setLang(l => l === "ja" ? "en" : "ja")} style={{ padding: "3px 6px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 9, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.35)" }}>{ja ? "EN" : "JA"}</button>
            <button onClick={() => { sessionStorage.removeItem("admin_auth"); setAuthed(false); }} style={{ padding: "3px 6px", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 999, fontSize: 9, cursor: "pointer", background: "transparent", color: "rgba(255,80,80,0.5)" }}>{ja ? "退出" : "Exit"}</button>
          </div>
        </div>
        {/* Tab bar - horizontal scroll on mobile */}
        <div style={{ display: "flex", gap: 0, overflowX: "auto", padding: "0 8px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveMainTab(t.key)} style={{
              padding: "8px 10px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: "transparent", fontSize: 11, fontWeight: activeMainTab === t.key ? 700 : 400,
              color: activeMainTab === t.key ? "rgba(201,169,98,0.95)" : "rgba(255,255,255,0.35)",
              borderBottom: activeMainTab === t.key ? "2px solid rgba(201,169,98,0.8)" : "2px solid transparent",
              transition: "all 0.15s", flexShrink: 0,
            }}>
              <span style={{ marginRight: 3 }}>{t.icon}</span>{t[lang === "ja" ? "ja" : "en"]}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 14px", position: "relative", zIndex: 1, overflowX: "hidden" }}>

        {/* ═══════ DASHBOARD TAB ═══════ */}
        {activeMainTab === "dashboard" && <>
          {/* Persona greeting */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: 6 }}>
              {persona?.icon} {member ? (ja ? `${member} のダッシュボード` : `${member}'s Dashboard`) : (ja ? "ZAMNA HAWAII 運営" : "ZAMNA HAWAII Ops")}
            </h1>
            {/* View history */}
            {viewHistory.length > 0 && (
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>
                {viewHistory.map((v, i) => (
                  <span key={v.member}>{i > 0 && " · "}<span style={{ color: "rgba(201,169,98,0.5)" }}>{v.member}</span> {timeAgo(v.last_viewed, ja)}</span>
                ))}
              </p>
            )}
          </motion.div>

          {/* Progress + KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
            <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 22, fontWeight: 700 }}>{Math.round(doneCnt / totalCnt * 100)}%</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{ja ? "完了率" : "Done"}</p>
            </div>
            <div style={{ background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.12)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 22, fontWeight: 700 }}>{urgentCnt}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{ja ? "要対応" : "Urgent"}</p>
            </div>
            <div style={{ background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.12)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 22, fontWeight: 700 }}>{`${Math.ceil((new Date("2026-09-04").getTime() - Date.now()) / 86400000)}`}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{ja ? "残り日数" : "Days left"}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>9K</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{ja ? "目標/日" : "Target/day"}</p>
            </div>
          </div>

          {/* My Urgent Tasks - filtered by persona */}
          {(() => {
            const myUrgent: { sIdx: number; tIdx: number; task: Task }[] = [];
            SECTIONS.forEach((s, sIdx) => {
              s.tasks.forEach((t, tIdx) => {
                const st = getEffectiveStatus(sIdx, tIdx, t.status);
                if (st === "urgent") myUrgent.push({ sIdx, tIdx, task: t });
              });
            });
            if (myUrgent.length === 0) return null;
            return (
              <motion.div {...fade} style={{ marginBottom: 24 }}>
                <h3 style={{ color: "rgba(255,80,80,0.9)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
                  ⚠ {ja ? "要対応タスク" : "URGENT TASKS"} ({myUrgent.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {myUrgent.slice(0, 8).map(({ sIdx, tIdx, task }) => {
                    const cc = getComments(`${sIdx}:${tIdx}`).length;
                    return (
                    <div key={`${sIdx}:${tIdx}`} style={{ display: "flex", alignItems: "start", gap: 10, padding: "10px 14px", background: "rgba(255,80,80,0.04)", border: "1px solid rgba(255,80,80,0.12)", borderRadius: 10 }}>
                      <button onClick={() => cycleStatus(sIdx, tIdx, "urgent")} style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,80,80,0.9)", border: "none", cursor: "pointer", marginTop: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{ja ? task.ja : task.en}</p>
                        {task.note && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>{ja ? task.note.ja : task.note.en}</p>}
                      </div>
                      {cc > 0 && <span style={{ color: "rgba(201,169,98,0.6)", fontSize: 10, flexShrink: 0 }}>💬{cc}</span>}
                      <button onClick={() => { setActiveMainTab("tasks"); setOpenCommentKey(`${sIdx}:${tIdx}`); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 10, flexShrink: 0 }}>{ja ? "詳細→" : "View→"}</button>
                    </div>
                    );
                  })}
                  {myUrgent.length > 8 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", padding: 4 }}>+{myUrgent.length - 8} more</p>}
                </div>
              </motion.div>
            );
          })()}

        {/* Activity feed on dashboard */}
        <motion.section {...fade} style={{ marginBottom: 24 }}>
          <h3 style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            {ja ? "最近のアクティビティ" : "Recent Activity"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
            {activities.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8 }}>
                <span style={{ fontSize: 12 }}>{ACT_TYPES[a.action_type]?.icon || "📝"}</span>
                <span style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{a.member}</span>
                <span style={{ color: "#fff", fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, flexShrink: 0 }}>{timeAgo(a.created_at, ja)}</span>
              </div>
            ))}
            {activities.length === 0 && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, padding: 12, textAlign: "center" }}>{ja ? "アクティビティなし" : "No activity yet"}</p>}
          </div>
          {activities.length > 0 && <button onClick={() => setActiveMainTab("tasks")} style={{ background: "none", border: "none", color: "rgba(201,169,98,0.6)", fontSize: 11, cursor: "pointer", padding: 0 }}>{ja ? "すべて見る →" : "View all →"}</button>}
        </motion.section>

        {/* Team on dashboard */}
        <motion.section {...fade} style={{ marginBottom: 24 }}>
          <h3 style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>{ja ? "チーム" : "Team"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
            {TEAM.map(m => (
              <div key={m.name} style={{ background: m.name === member ? "rgba(201,169,98,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${m.name === member ? "rgba(201,169,98,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{PERSONA[m.name]?.icon || "👤"}</span>
                <div>
                  <p style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{m.name}</p>
                  <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 10 }}>{ja ? m.ja_role : m.en_role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Shared Resources on dashboard */}
        <motion.section {...fade} style={{ marginBottom: 24 }}>
          <h3 style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>{ja ? "クイックリンク" : "Quick Links"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
            {SHARED_RESOURCES.map(r => (
              <a key={r.url} href={r.url} target={r.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, textDecoration: "none" }}>
                <span style={{ fontSize: 14 }}>{r.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>{ja ? r.ja : r.en}</span>
              </a>
            ))}
          </div>
        </motion.section>
        </>}

        {/* ═══════ TASKS TAB ═══════ */}
        {activeMainTab === "tasks" && <>

        {/* Activity Feed (full) */}
        <motion.section {...fade} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16, letterSpacing: "0.06em" }}>
            {ja ? "アクティビティ" : "Activity Feed"}
          </h2>

          {/* Post form */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {Object.entries(ACT_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => setActType(k)} style={{ padding: "4px 12px", borderRadius: 999, border: `1px solid ${actType === k ? "rgba(201,169,98,0.5)" : "rgba(255,255,255,0.1)"}`, background: actType === k ? "rgba(201,169,98,0.15)" : "transparent", color: actType === k ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <input value={actTitle} onChange={e => setActTitle(e.target.value)} placeholder={ja ? "何があった？（タイトル）" : "What happened? (title)"} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
            <textarea value={actDesc} onChange={e => setActDesc(e.target.value)} placeholder={ja ? "詳細（任意）" : "Details (optional)"} rows={2} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, marginBottom: 8, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={actCategory} onChange={e => setActCategory(e.target.value)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                <option value="">{ja ? "カテゴリ" : "Category"}</option>
                <option value="venue">{ja ? "会場" : "Venue"}</option>
                <option value="artist">{ja ? "アーティスト" : "Artist"}</option>
                <option value="finance">{ja ? "資金" : "Finance"}</option>
                <option value="ticket">{ja ? "チケット" : "Ticket"}</option>
                <option value="sponsor">{ja ? "スポンサー" : "Sponsor"}</option>
                <option value="legal">{ja ? "法務" : "Legal"}</option>
                <option value="production">{ja ? "制作" : "Production"}</option>
                <option value="marketing">{ja ? "マーケ" : "Marketing"}</option>
                <option value="team">{ja ? "チーム" : "Team"}</option>
              </select>
              <div style={{ flex: 1 }} />
              <button onClick={postActivity} disabled={actSending || !actTitle.trim()} style={{ padding: "8px 20px", borderRadius: 999, background: actTitle.trim() ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.1)", color: actTitle.trim() ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 12, border: "none", cursor: actTitle.trim() ? "pointer" : "default" }}>
                {actSending ? "..." : (ja ? "投稿" : "Post")}
              </button>
            </div>
          </div>

          {/* Feed list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activities.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: 20 }}>{ja ? "まだ投稿がありません" : "No activity yet"}</p>}
            {activities.map(a => (
              <div key={a.id} id={`activity-${a.id}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{ACT_TYPES[a.action_type]?.icon || "📝"}</span>
                  <span style={{ color: "rgba(201,169,98,0.8)", fontSize: 12, fontWeight: 600 }}>{a.member}</span>
                  {a.category && <span style={{ background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 999, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a.category}</span>}
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginLeft: "auto" }}>{timeAgo(a.created_at, ja)}</span>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/admin?tab=tasks#activity-${a.id}`); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 10, padding: "0 4px" }} title={ja ? "リンクをコピー" : "Copy link"}>🔗</button>
                  {a.member === member && <button onClick={() => deleteActivity(a.id)} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.5)", cursor: "pointer", fontSize: 12, padding: "0 4px" }}>x</button>}
                </div>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{a.title}</p>
                {a.description && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 4, whiteSpace: "pre-line" }}>{a.description}</p>}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Task sections */}
        {SECTIONS.map((section, sIdx) => (
          <motion.section key={sIdx} {...fade} style={{ marginBottom: 24 }}>
            <h3 style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
              {ja ? section.ja : section.en}
              {sectionUrgentCounts[sIdx] > 0 && <span style={{ color: "rgba(255,80,80,0.8)", marginLeft: 8, fontSize: 11 }}>⚠{sectionUrgentCounts[sIdx]}</span>}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {section.tasks.map((task, tIdx) => {
                const st = getEffectiveStatus(sIdx, tIdx, task.status);
                const stInfo = STATUS_LABEL[st];
                const taskKey = `${sIdx}:${tIdx}`;
                const comments = getComments(taskKey);
                const isOpen = openCommentKey === taskKey;
                return (
                  <div key={tIdx} style={{ borderRadius: 8, overflow: "hidden" }}>
                    {/* Task row */}
                    <div style={{ display: "flex", alignItems: "start", gap: 10, padding: "8px 12px", background: st === "urgent" ? "rgba(255,80,80,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${st === "urgent" ? "rgba(255,80,80,0.1)" : "rgba(255,255,255,0.05)"}`, borderRadius: isOpen ? "8px 8px 0 0" : 8 }}>
                      <button onClick={() => cycleStatus(sIdx, tIdx, st)} style={{ width: 10, height: 10, borderRadius: "50%", background: stInfo.color, border: "none", cursor: "pointer", marginTop: 4, flexShrink: 0 }} title="Click to change status" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: st === "done" ? "rgba(255,255,255,0.35)" : "#fff", fontSize: 12, textDecoration: st === "done" ? "line-through" : "none" }}>{ja ? task.ja : task.en}</p>
                        {task.note && st !== "done" && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 }}>{ja ? task.note.ja : task.note.en}</p>}
                      </div>
                      <button onClick={() => { setOpenCommentKey(isOpen ? null : taskKey); setCommentInput(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: comments.length > 0 ? "rgba(201,169,98,0.7)" : "rgba(255,255,255,0.2)", fontSize: 11, flexShrink: 0, display: "flex", alignItems: "center", gap: 3 }}>
                        💬{comments.length > 0 && <span style={{ fontWeight: 700 }}>{comments.length}</span>}
                      </button>
                      <span style={{ color: stInfo.color, fontSize: 9, fontWeight: 600, flexShrink: 0, letterSpacing: "0.05em" }}>{ja ? STATUS_LABEL[st].ja : STATUS_LABEL[st].en}</span>
                    </div>
                    {/* Comments panel */}
                    {isOpen && (
                      <div style={{ background: "rgba(255,255,255,0.015)", borderLeft: "1px solid rgba(201,169,98,0.15)", borderRight: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", borderRadius: "0 0 8px 8px", padding: "10px 12px" }}>
                        {/* Existing comments */}
                        {comments.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                            {comments.map(c => (
                              <div key={c.id} style={{ display: "flex", alignItems: "start", gap: 8 }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>{PERSONA[c.member]?.icon || "👤"}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                    <span style={{ color: "rgba(201,169,98,0.8)", fontSize: 11, fontWeight: 600 }}>{c.member}</span>
                                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 9 }}>{timeAgo(c.created_at, ja)}</span>
                                  </div>
                                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{c.message}</p>
                                </div>
                                {c.member === member && (
                                  <button onClick={() => deleteComment(c.id)} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.4)", cursor: "pointer", fontSize: 10, padding: "0 2px", flexShrink: 0 }}>×</button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {/* New comment input */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 14, flexShrink: 0 }}>{persona?.icon || "👤"}</span>
                          <input
                            value={commentInput}
                            onChange={e => setCommentInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(taskKey); } }}
                            placeholder={ja ? "コメントを追加..." : "Add a comment..."}
                            style={{ flex: 1, padding: "7px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#fff", fontSize: 12, outline: "none" }}
                          />
                          <button
                            onClick={() => postComment(taskKey)}
                            disabled={commentSending || !commentInput.trim()}
                            style={{ padding: "6px 14px", borderRadius: 999, background: commentInput.trim() ? "rgba(201,169,98,0.8)" : "rgba(255,255,255,0.06)", color: commentInput.trim() ? "#000" : "rgba(255,255,255,0.2)", fontWeight: 700, fontSize: 11, border: "none", cursor: commentInput.trim() ? "pointer" : "default" }}
                          >{commentSending ? "..." : "↑"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}

        {/* Feedback */}
        <motion.section {...fade} style={{ marginBottom: 24 }}>
          <h3 style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>{ja ? "フィードバック" : "Feedback"}</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select value={fbCategory} onChange={e => setFbCategory(e.target.value)} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
              {FB_CATEGORIES.map(c => <option key={c.value} value={c.value}>{ja ? c.ja : c.en}</option>)}
            </select>
            <input value={fbMessage} onChange={e => setFbMessage(e.target.value)} placeholder={ja ? "メモ・フィードバック" : "Notes / feedback"} style={{ flex: 1, padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, outline: "none" }} onKeyDown={e => { if (e.key === "Enter") sendFeedback(); }} />
            <button onClick={sendFeedback} disabled={fbSending || !fbMessage.trim()} style={{ padding: "8px 16px", borderRadius: 999, background: fbMessage.trim() ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.08)", color: fbMessage.trim() ? "#000" : "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 11, border: "none", cursor: fbMessage.trim() ? "pointer" : "default" }}>{fbSent ? "✓" : (ja ? "送信" : "Send")}</button>
          </div>
          {feedbackList.slice(0, 10).map(f => (
            <div key={f.id} style={{ padding: "6px 10px", borderLeft: `2px solid ${f.category === "bug" ? "rgba(255,80,80,0.6)" : "rgba(201,169,98,0.3)"}`, marginBottom: 4 }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}><span style={{ color: "rgba(201,169,98,0.6)", fontWeight: 600 }}>{f.member}</span> · {f.category} · {timeAgo(f.created_at, ja)}</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{f.message}</p>
            </div>
          ))}
        </motion.section>
        </>}

        {/* ═══════ BUDGET TAB ═══════ */}
        {activeMainTab === "budget" && <>
        <motion.section {...fade} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", letterSpacing: "0.06em" }}>
              {ja ? "予算トラッカー" : "Budget Tracker"}
            </h2>
            <button onClick={() => { setShowBudgetForm(!showBudgetForm); setEditBudgetId(null); setBudgetForm({ category: "", item_ja: "", item_en: "", amount: 0, type: "expense", status: "estimate", notes: "" }); }} style={{ padding: "6px 16px", borderRadius: 999, background: "rgba(201,169,98,0.15)", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.9)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {showBudgetForm ? (ja ? "閉じる" : "Close") : (ja ? "+ 項目追加" : "+ Add Item")}
            </button>
          </div>

          {/* Summary cards */}
          {budgetItems.length > 0 && (() => {
            const income = budgetItems.filter(b => b.type === "income").reduce((s, b) => s + b.amount, 0);
            const expense = budgetItems.filter(b => b.type === "expense").reduce((s, b) => s + b.amount, 0);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8, marginBottom: 16 }}>
                <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 11, marginBottom: 4 }}>{ja ? "収入" : "Income"}</p>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>${income.toLocaleString()}</p>
                </div>
                <div style={{ background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 11, marginBottom: 4 }}>{ja ? "支出" : "Expense"}</p>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>${expense.toLocaleString()}</p>
                </div>
                <div style={{ background: `rgba(${income - expense >= 0 ? "74,222,128" : "255,80,80"},0.06)`, border: `1px solid rgba(${income - expense >= 0 ? "74,222,128" : "255,80,80"},0.15)`, borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ color: `rgba(${income - expense >= 0 ? "74,222,128" : "255,80,80"},0.8)`, fontSize: 11, marginBottom: 4 }}>{ja ? "差引" : "Net"}</p>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>${(income - expense).toLocaleString()}</p>
                </div>
              </div>
            );
          })()}

          {/* Add/Edit form */}
          {showBudgetForm && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
                <select value={budgetForm.category} onChange={e => setBudgetForm(f => ({ ...f, category: e.target.value }))} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13 }}>
                  <option value="">{ja ? "カテゴリ選択" : "Select Category"}</option>
                  {BUDGET_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={budgetForm.type} onChange={e => setBudgetForm(f => ({ ...f, type: e.target.value }))} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13 }}>
                  <option value="expense">{ja ? "支出" : "Expense"}</option>
                  <option value="income">{ja ? "収入" : "Income"}</option>
                </select>
              </div>
              <input value={budgetForm.item_ja} onChange={e => setBudgetForm(f => ({ ...f, item_ja: e.target.value }))} placeholder={ja ? "項目名" : "Item name"} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 8, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 8 }}>
                <input type="number" value={budgetForm.amount || ""} onChange={e => setBudgetForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} placeholder="$0" style={{ padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }} />
                <select value={budgetForm.status} onChange={e => setBudgetForm(f => ({ ...f, status: e.target.value }))} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13 }}>
                  <option value="estimate">{ja ? "見積もり" : "Estimate"}</option>
                  <option value="quoted">{ja ? "見積取得済" : "Quoted"}</option>
                  <option value="confirmed">{ja ? "確定" : "Confirmed"}</option>
                  <option value="paid">{ja ? "支払済" : "Paid"}</option>
                </select>
              </div>
              <input value={budgetForm.notes} onChange={e => setBudgetForm(f => ({ ...f, notes: e.target.value }))} placeholder={ja ? "備考" : "Notes"} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, marginBottom: 10, outline: "none", boxSizing: "border-box" }} />
              <button onClick={saveBudgetItem} disabled={!budgetForm.category || !budgetForm.item_ja} style={{ padding: "8px 24px", borderRadius: 999, background: "rgba(201,169,98,0.9)", color: "#000", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer" }}>
                {editBudgetId ? (ja ? "更新" : "Update") : (ja ? "追加" : "Add")}
              </button>
            </div>
          )}

          {/* Budget table by category */}
          {budgetItems.length > 0 && (() => {
            const grouped = budgetItems.reduce<Record<string, BudgetItem[]>>((acc, b) => { (acc[b.category] = acc[b.category] || []).push(b); return acc; }, {});
            return Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase" }}>{cat}</p>
                {items.map(b => (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ color: b.type === "income" ? "rgba(74,222,128,0.8)" : "rgba(255,80,80,0.7)", fontSize: 12, width: 14, textAlign: "center" }}>{b.type === "income" ? "+" : "-"}</span>
                    <span style={{ color: "#fff", fontSize: 13, flex: 1 }}>{ja ? b.item_ja : b.item_en}</span>
                    <span style={{ color: b.type === "income" ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600 }}>${b.amount.toLocaleString()}</span>
                    <span style={{ background: b.status === "paid" ? "rgba(74,222,128,0.15)" : b.status === "confirmed" ? "rgba(201,169,98,0.15)" : "rgba(255,255,255,0.06)", color: b.status === "paid" ? "rgba(74,222,128,0.8)" : b.status === "confirmed" ? "rgba(201,169,98,0.8)" : "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: 999, fontSize: 10 }}>{b.status}</span>
                    <button onClick={() => { setEditBudgetId(b.id); setBudgetForm({ category: b.category, item_ja: b.item_ja, item_en: b.item_en, amount: b.amount, type: b.type, status: b.status, notes: b.notes || "" }); setShowBudgetForm(true); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 11 }}>edit</button>
                    <button onClick={() => deleteBudgetItem(b.id)} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.4)", cursor: "pointer", fontSize: 11 }}>x</button>
                  </div>
                ))}
              </div>
            ));
          })()}

          {budgetItems.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: 20 }}>{ja ? "予算項目を追加してください" : "Add budget items to get started"}</p>}
        </motion.section>

        </>}

        {/* ═══════ PARTNERS TAB ═══════ */}
        {activeMainTab === "partners" && <>
        {/* ── Venue Assessment ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 4, letterSpacing: "0.06em" }}>
            {ja ? "会場評価 — Moanalua Gardens (JP Damon)" : "Venue Assessment — Moanalua Gardens (JP Damon)"}
          </h2>
          <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 11, letterSpacing: "0.15em", marginBottom: 4 }}>
            {ja ? "#1 候補 — Sid 推薦 · ⚠ 3月末までに契約締結目標" : "#1 CHOICE — Recommended by Sid · ⚠ Target: Contract by end of March"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 16, lineHeight: 1.6 }}>
            {ja
              ? "レンタル: 非公演日$4K / 公演日$8K · キャパ: 9,000人/日（拡張可） · F&B: 100%自社 · 営業時間案: 15:00-22:00 + アフターパーティー"
              : "Rental: $4K non-show / $8K show · Capacity: 9,000/day (expandable) · F&B: 100% kept · Hours: 3PM-10PM + after party"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 10 }}>
            <div style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 12, padding: "14px 16px" }}>
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

        {/* ── Partner CRM (DB-backed) ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", letterSpacing: "0.06em" }}>
              {ja ? "パートナー・連絡先" : "Partner CRM"}
            </h2>
            <button onClick={() => setEditPartner({ name: "", contact: "", type_ja: "", type_en: "", status: "pending", notes_ja: "", notes_en: "", who: "" })}
              style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(201,169,98,0.12)", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.9)", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>
              + {ja ? "追加" : "Add"}
            </button>
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
            {ja ? `${(dbPartners ?? PARTNERS).length}件 — DBに保存` : `${(dbPartners ?? PARTNERS).length} partners — stored in DB`}
          </p>

          {/* Edit modal */}
          {editPartner && (
            <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
              onClick={e => { if (e.target === e.currentTarget) setEditPartner(null); }}>
              <div style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "24px 18px", maxWidth: 480, width: "calc(100% - 32px)", maxHeight: "85vh", overflowY: "auto", margin: "0 16px" }}>
                <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  {editPartner.id ? (ja ? "パートナー編集" : "Edit Partner") : (ja ? "パートナー追加" : "Add Partner")}
                </h3>
                {([
                  ["contact", ja ? "連絡先名 *" : "Contact *"],
                  ["name", ja ? "組織名" : "Organization"],
                  ["type_ja", "Type (JA)"],
                  ["type_en", "Type (EN)"],
                  ["notes_ja", "Notes (JA)"],
                  ["notes_en", "Notes (EN)"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["who", ja ? "担当" : "Assigned To"],
                  ["instagram", "Instagram"],
                  ["link", "Link / URL"],
                ] as [string, string][]).map(([key, label]) => (
                  <div key={key} style={{ marginBottom: 8 }}>
                    <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.08em" }}>{label}</label>
                    {key.startsWith("notes") ? (
                      <textarea value={(editPartner as unknown as Record<string, string>)[key] || ""} onChange={e => setEditPartner(prev => prev ? { ...prev, [key]: e.target.value } : null)} rows={2}
                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                    ) : (
                      <input value={(editPartner as unknown as Record<string, string>)[key] || ""} onChange={e => setEditPartner(prev => prev ? { ...prev, [key]: e.target.value } : null)}
                        style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                    )}
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.08em" }}>Status</label>
                  <select value={editPartner.status} onChange={e => setEditPartner(prev => prev ? { ...prev, status: e.target.value as PartnerStatus } : null)}
                    style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}>
                    {(["confirmed", "in_progress", "outreach", "pending"] as PartnerStatus[]).map(s => (
                      <option key={s} value={s} style={{ background: "#111" }}>{ja ? PS[s].ja : PS[s].en}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  {editPartner.id && (
                    <button onClick={() => { if (confirm(ja ? "削除しますか？" : "Delete?")) { deletePartner(editPartner.id!); setEditPartner(null); } }}
                      style={{ padding: "8px 16px", borderRadius: 999, background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", color: "rgba(255,80,80,0.8)", fontSize: 12, cursor: "pointer", marginRight: "auto" }}>
                      {ja ? "削除" : "Delete"}
                    </button>
                  )}
                  <button onClick={() => setEditPartner(null)}
                    style={{ padding: "8px 16px", borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
                    {ja ? "キャンセル" : "Cancel"}
                  </button>
                  <button onClick={() => editPartner.contact && savePartner(editPartner)}
                    style={{ padding: "8px 20px", borderRadius: 999, background: "rgba(201,169,98,0.15)", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.9)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    {ja ? "保存" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(dbPartners ?? PARTNERS).map((p, i) => {
              const s = PS[p.status as PartnerStatus] ?? PS.pending;
              return (
                <div key={(p as Partner & { id?: number }).id ?? i}
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}
                  onClick={() => setEditPartner({ ...p })}>
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
                    {p.email && <a href={`mailto:${p.email}`} onClick={e => e.stopPropagation()} style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, textDecoration: "none" }}>{p.email}</a>}
                    {p.phone && <a href={`tel:${p.phone}`} onClick={e => e.stopPropagation()} style={{ color: "rgba(100,180,255,0.7)", fontSize: 11, textDecoration: "none" }}>{p.phone}</a>}
                    {p.instagram && <span style={{ color: "rgba(168,85,247,0.7)", fontSize: 11 }}>@{p.instagram}</span>}
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "rgba(74,222,128,0.7)", fontSize: 11, textDecoration: "none" }}>{p.link.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        </>}

        {/* ═══════ TIMELINE TAB ═══════ */}
        {activeMainTab === "timeline" && <>
        {/* ── Gantt ── */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 16, letterSpacing: "0.06em" }}>
            {ja ? "プロジェクトタイムライン" : "Project Timeline"}
          </h2>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as never, maxWidth: "100%", position: "relative" }}>
            <div style={{ minWidth: 480, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 12px 12px" }}>
              {(() => {
                const LW = typeof window !== "undefined" && window.innerWidth < 480 ? 90 : 150;
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
        </>}

        {/* ═══════ DOCS TAB ═══════ */}
        {activeMainTab === "docs" && <>

        {/* Quick links: Partner, Operations, Public, NFT */}
        <motion.section {...fade} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 12 }}>{ja ? "パートナーページ" : "Partner Pages"}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { href: "/investor/", label: ja ? "投資家デック" : "Investor Deck" },
              { href: "/sponsor/",  label: ja ? "スポンサーデック" : "Sponsor Deck" },
              { href: "/deal/",     label: ja ? "ディールサマリー" : "Deal Summary" },
              { href: "/contract/", label: ja ? "契約書" : "Contract" },
              { href: "/schedule/", label: ja ? "面談予約" : "Schedule" },
            ].map(l => <a key={l.href} href={l.href} style={{ padding: "9px 18px", borderRadius: 999, fontSize: 12, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", textDecoration: "none", background: "rgba(255,255,255,0.03)" }}>{l.label} →</a>)}
          </div>

          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 12 }}>{ja ? "運営資料" : "Operations"}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { href: "/production/",      label: ja ? "制作計画" : "Production Plan" },
              { href: "/safety/",          label: ja ? "安全管理" : "Safety Plan" },
              { href: "/staff/",           label: ja ? "スタッフ" : "Staff Manual" },
              { href: "/budget/",          label: ja ? "収支計画" : "Budget & P&L" },
              { href: "/venue-agreement/", label: ja ? "会場契約" : "Venue Agreement" },
              { href: "/artist-contract/", label: ja ? "出演契約" : "Artist Contract" },
            ].map(l => <a key={l.href} href={l.href} style={{ padding: "9px 18px", borderRadius: 999, fontSize: 12, border: "1px solid rgba(100,180,255,0.15)", color: "rgba(100,180,255,0.6)", textDecoration: "none", background: "rgba(100,180,255,0.03)" }}>{l.label} →</a>)}
          </div>

          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 12 }}>{ja ? "公開ページ" : "Public Pages"}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { href: "/", label: ja ? "トップ" : "Home" },
              { href: "/lineup/", label: ja ? "ラインナップ" : "Lineup" },
              { href: "/vip/", label: "VIP" },
              { href: "/guide/", label: ja ? "当日ガイド" : "Guide" },
              { href: "/info/", label: ja ? "アクセス・FAQ" : "Info" },
              { href: "/press/", label: ja ? "プレスキット" : "Press Kit" },
              { href: "https://zamnahawaii.ticketblox.com", label: "Ticketblox ↗" },
            ].map(l => <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ padding: "9px 18px", borderRadius: 999, fontSize: 12, border: "1px solid rgba(201,169,98,0.15)", color: "rgba(201,169,98,0.6)", textDecoration: "none", background: "rgba(201,169,98,0.03)" }}>{l.label} →</a>)}
          </div>

          {/* Shared Resources */}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 12 }}>{ja ? "共有リソース" : "Shared Resources"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginBottom: 24 }}>
            {SHARED_RESOURCES.map(r => (
              <a key={r.url} href={r.url} target={r.url.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textDecoration: "none" }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{ja ? r.ja : r.en}</p>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{ja ? r.cat_ja : r.cat_en}</p>
                </div>
              </a>
            ))}
          </div>

          {/* NFT */}
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 12 }}>{ja ? "NFT・Web3" : "NFT / Web3"}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { href: "/mint/", label: ja ? "NFTミント" : "Mint Pass" },
              { href: "/vip-lounge/", label: ja ? "VIPラウンジ" : "VIP Lounge" },
              { href: "/artist-lounge/", label: ja ? "アーティストラウンジ" : "Artist Lounge" },
            ].map(l => <a key={l.href} href={l.href} style={{ padding: "9px 18px", borderRadius: 999, fontSize: 12, border: "1px solid rgba(168,85,247,0.2)", color: "rgba(168,85,247,0.7)", textDecoration: "none", background: "rgba(168,85,247,0.03)" }}>{l.label} →</a>)}
          </div>
        </motion.section>
        </>}

        {/* ═══════ COMMS TAB ═══════ */}
        {activeMainTab === "comms" && <>
        {/* OLD Feedback section - now just a placeholder header */}
        <motion.section {...fade} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,4vw,1.8rem)", color: "#fff", marginBottom: 6, letterSpacing: "0.06em" }}>
            {ja ? "フィードバック" : "Feedback"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
            {ja ? "各セクションへのコメント・提案・バグ報告" : "Comments, suggestions & bug reports for any section"}
          </p>

          {/* Submit form */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 20px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {/* Page selector */}
              <select value={fbPage} onChange={e => setFbPage(e.target.value)}
                style={{ padding: "7px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 12, outline: "none", cursor: "pointer" }}>
                <option value="admin" style={{ background: "#111" }}>{ja ? "管理画面全般" : "Admin (General)"}</option>
                {SECTIONS.map((s, i) => (
                  <option key={i} value={`section:${i}`} style={{ background: "#111" }}>{ja ? s.ja : s.en}</option>
                ))}
                <option value="venue" style={{ background: "#111" }}>{ja ? "会場評価" : "Venue Assessment"}</option>
                <option value="partners" style={{ background: "#111" }}>{ja ? "パートナーCRM" : "Partner CRM"}</option>
                <option value="timeline" style={{ background: "#111" }}>{ja ? "タイムライン" : "Timeline"}</option>
                <option value="site" style={{ background: "#111" }}>{ja ? "公式サイト" : "Public Site"}</option>
              </select>
              {/* Category */}
              <select value={fbCategory} onChange={e => setFbCategory(e.target.value)}
                style={{ padding: "7px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 12, outline: "none", cursor: "pointer" }}>
                {FB_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} style={{ background: "#111" }}>{ja ? c.ja : c.en}</option>
                ))}
              </select>
            </div>
            <textarea
              value={fbMessage}
              onChange={e => setFbMessage(e.target.value)}
              placeholder={ja ? "フィードバックを入力..." : "Write your feedback..."}
              rows={3}
              style={{
                width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
                color: "#fff", fontSize: 13, outline: "none", resize: "vertical",
                fontFamily: "Inter, sans-serif", lineHeight: 1.6, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              {member && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{ja ? `送信者: ${member}` : `From: ${member}`}</span>}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
                {fbSent && <span style={{ color: "rgba(74,222,128,0.8)", fontSize: 12, fontWeight: 600 }}>{ja ? "送信しました!" : "Sent!"}</span>}
                <button
                  onClick={sendFeedback}
                  disabled={fbSending || !fbMessage.trim()}
                  style={{
                    padding: "8px 20px", borderRadius: 999,
                    background: fbMessage.trim() ? "rgba(201,169,98,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${fbMessage.trim() ? "rgba(201,169,98,0.3)" : "rgba(255,255,255,0.06)"}`,
                    color: fbMessage.trim() ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.2)",
                    fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", cursor: fbMessage.trim() ? "pointer" : "default",
                    opacity: fbSending ? 0.5 : 1,
                  }}>
                  {fbSending ? "..." : ja ? "送信" : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback list */}
          {feedbackList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {feedbackList.slice(0, 20).map((fb, i) => {
                const catObj = FB_CATEGORIES.find(c => c.value === fb.category);
                const catLabel = catObj ? (ja ? catObj.ja : catObj.en) : fb.category;
                const catColor =
                  fb.category === "bug" ? "rgba(255,80,80,0.7)" :
                  fb.category === "idea" ? "rgba(168,85,247,0.7)" :
                  fb.category === "task" ? "rgba(201,169,98,0.7)" :
                  fb.category === "venue" ? "rgba(74,222,128,0.7)" :
                  "rgba(255,255,255,0.35)";
                const isFirst = i === 0;
                const isLast = i === Math.min(feedbackList.length, 20) - 1;
                return (
                  <div key={fb.id} style={{
                    padding: "12px 16px",
                    background: fb.category === "bug" ? "rgba(255,80,80,0.03)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${fb.category === "bug" ? "rgba(255,80,80,0.15)" : "rgba(255,255,255,0.07)"}`,
                    borderTop: isFirst ? undefined : "none",
                    borderRadius: isFirst ? "12px 12px 0 0" : isLast ? "0 0 12px 12px" : 0,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {fb.member && <span style={{ color: "rgba(201,169,98,0.7)", fontSize: 12, fontWeight: 600 }}>{fb.member}</span>}
                        <span style={{ fontSize: 9, color: catColor, border: `1px solid ${catColor}`, borderRadius: 999, padding: "1px 7px", letterSpacing: "0.06em" }}>{catLabel}</span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "1px 7px" }}>{fb.page}</span>
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{timeAgo(fb.created_at, ja)}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{fb.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Contract submissions + Email signups */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          {/* Tab header */}
          <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none" } as React.CSSProperties}>
            {([
              { key: "contracts", ja: `契約 (${submissions.length})`, en: `Contracts (${submissions.length})` },
              { key: "emails",    ja: `メール (${emailSignups.length})`, en: `Emails (${emailSignups.length})` },
              { key: "meetings",  ja: `MTG (${meetings.length})`, en: `Meetings (${meetings.length})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "8px 12px", background: "transparent", border: "none",
                  borderBottom: activeTab === tab.key ? "2px solid var(--gold, #c9a962)" : "2px solid transparent",
                  color: activeTab === tab.key ? "var(--gold, #c9a962)" : "rgba(255,255,255,0.3)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
                  marginBottom: -1, whiteSpace: "nowrap", flexShrink: 0,
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

        </>}

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
          {ja
            ? "ZAMNA HAWAII 2026 · 運営資料 · 社外秘"
            : "ZAMNA HAWAII 2026 · Operations · Internal Use Only"}
        </p>
      </footer>

      {/* ── Agent Chat Widget ── */}
      <button onClick={() => setChatOpen(o => !o)}
        style={{
          position: "fixed", bottom: 16, right: 12, zIndex: 200,
          width: 44, height: 44, borderRadius: "50%",
          background: chatOpen ? "rgba(255,80,80,0.8)" : "rgba(201,169,98,0.85)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#000", fontWeight: 700, transition: "background 0.2s",
        }}>
        {chatOpen ? "×" : "AI"}
      </button>

      {chatOpen && (
        <div style={{
          position: "fixed", bottom: 72, right: 8, left: 8, zIndex: 200,
          maxWidth: 380, marginLeft: "auto",
          height: "min(480px, calc(100vh - 120px))",
          background: "#0a0a0a", border: "1px solid rgba(201,169,98,0.2)",
          borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
            <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 10, letterSpacing: "0.2em", marginBottom: 2 }}>ZAMNA AI AGENT</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              {ja ? "DB照会・更新・フェス運営サポート" : "Query DB, update data, festival ops support"}
            </p>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "rgba(201,169,98,0.5)", fontSize: 28, marginBottom: 8 }}>AI</p>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, lineHeight: 1.6 }}>
                  {ja ? "パートナー情報の照会、DB更新、\nフェス運営の質問に答えます" : "Query partners, update DB,\nanswer festival ops questions"}
                </p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: 14,
                  background: msg.role === "user" ? "rgba(201,169,98,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${msg.role === "user" ? "rgba(201,169,98,0.25)" : "rgba(255,255,255,0.08)"}`,
                }}>
                  <p style={{ color: msg.role === "user" ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </p>
                </div>
                {msg.sql_results && msg.sql_results !== "[]" && (
                  <p style={{ color: "rgba(74,222,128,0.5)", fontSize: 10, marginTop: 4, fontFamily: "monospace" }}>
                    SQL {ja ? "実行済み" : "executed"}
                  </p>
                )}
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 13 }}>
                  {ja ? "考え中..." : "Thinking..."}
                </p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0, display: "flex", gap: 8 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder={ja ? "メッセージを入力..." : "Type a message..."}
              style={{
                flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                color: "#fff", fontSize: 13, outline: "none", fontFamily: "Inter, sans-serif",
              }}
            />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
              style={{
                padding: "10px 16px", borderRadius: 10,
                background: chatInput.trim() ? "rgba(201,169,98,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${chatInput.trim() ? "rgba(201,169,98,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: chatInput.trim() ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.2)",
                fontWeight: 700, fontSize: 13, cursor: chatInput.trim() ? "pointer" : "default",
              }}>
              ↑
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
