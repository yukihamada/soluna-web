"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";
import { downloadPDF } from "@/lib/pdf";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const CLAUSES_JA = [
  {
    title: "第1条 — 当事者",
    body: `主催者（以下「甲」）: SOLUNA Inc.
アーティスト/エージェント（以下「乙」）: _______________
マネジメント会社: _______________`,
  },
  {
    title: "第2条 — 出演概要",
    body: `イベント名: SOLUNA FEST HAWAII 2026
会場: モアナルアガーデン（Moanalua Gardens）, オアフ島, ハワイ州
出演日時: 2026年9月____日 ____:____ 〜 ____:____（HST）
セット時間: ____分
ジャンル: アンダーグラウンド・エレクトロニック`,
  },
  {
    title: "第3条 — 出演料",
    body: `出演料: $________（税込 / 全額パフォーマンスフィー）
支払スケジュール:
 - 契約締結後14日以内: 出演料の50%（デポジット）
 - 出演日の7日前まで: 残額50%
支払方法: 銀行振込（乙指定口座）
通貨: 米ドル（USD）`,
  },
  {
    title: "第4条 — 渡航・宿泊",
    body: `甲が負担するもの:
 - 往復航空券（ビジネスクラス / エコノミー: ___________）
   出発地: _______________
 - ホテル宿泊: ____泊（チェックイン: 9月___日 / チェックアウト: 9月___日）
   ホテル: Waikiki周辺（甲が手配）
 - 空港 ↔ ホテル ↔ 会場の送迎
乙が負担するもの:
 - パスポート取得・更新費用
 - 個人的な支出`,
  },
  {
    title: "第5条 — テクニカルライダー",
    body: `乙は、契約締結後30日以内にテクニカルライダーを甲に提出する。
甲は合理的な範囲でライダーの要件を満たすよう努力する。

甲が標準提供するもの:
 - Pioneer CDJ-3000 × 4 + DJM-V10（または同等品）
 - モニタースピーカー × 2（ステージ上）
 - IEM（インイヤーモニター）対応
 - ステージ照明は甲の照明デザインに準拠

追加機材の要望がある場合、甲乙協議の上、費用負担を決定する。`,
  },
  {
    title: "第6条 — ビザサポート",
    body: `外国籍アーティストの場合、甲は以下のビザ取得を支援する。
 - O-1ビザ（卓越した能力を持つ個人）またはP-1ビザ（国際的に認知されたアーティスト）
 - 甲はスポンサーレター、イベント招待状、契約書コピーを提供
 - ビザ申請費用: 甲が負担 / 乙が負担（該当するものに○）
 - 申請は遅くとも2026年5月1日までに開始すること（3〜6ヶ月のリードタイムが必要）

注意: ビザが発給されなかった場合、甲はデポジットを全額返金し、本契約は解除される。`,
  },
  {
    title: "第7条 — キャンセルポリシー",
    body: `甲によるキャンセル:
 - 出演90日前まで: デポジット全額返金
 - 出演90日〜30日前: デポジットの50%返金
 - 出演30日以内: 返金なし（出演料全額支払い義務）

乙によるキャンセル:
 - 出演90日前まで: デポジット全額返還
 - 出演90日〜30日前: デポジットの50%返還 + 代替アーティスト手配への協力
 - 出演30日以内: デポジット全額返還 + 甲の追加費用の合理的補填

不可抗力: 天災・疫病・政府命令等の場合、双方無責で契約解除。デポジット全額返金。`,
  },
  {
    title: "第8条 — 録音・配信",
    body: `甲は、以下の目的で乙の出演を録音・録画・配信する権利を有する:
 - イベントのプロモーション映像（SNS、ウェブサイト）
 - ライブストリーミング（乙の事前書面承認が必要）
 - アーカイブ映像（公開は乙の事前承認が必要）

乙は、自身のSNSでのイベント告知・セット写真の投稿を許可される。
ただし、フルセットの録音・録画の無断公開は禁止。`,
  },
  {
    title: "第9条 — 独占条項",
    body: `乙は、出演日の前後____日間、オアフ島内（半径50km以内）で他のイベントに出演しないことに同意する。
（期間: ____日前 〜 ____日後）`,
  },
  {
    title: "第10条 — 機密保持",
    body: `両当事者は、本契約の内容（出演料を含む）を第三者に開示しない。
ただし、法律上の義務がある場合、税務・法務アドバイザーへの開示は除く。
乙は、甲の事前承認なくイベントの出演を公表しない（ラインナップ発表前）。`,
  },
  {
    title: "第11条 — 準拠法・管轄",
    body: `本契約はハワイ州法に準拠し、ホノルル郡の裁判所を専属管轄裁判所とする。`,
  },
];

const CLAUSES_EN = [
  {
    title: "Article 1 — Parties",
    body: `Promoter ("Party A"): SOLUNA Inc.
Artist / Agent ("Party B"): _______________
Management: _______________`,
  },
  {
    title: "Article 2 — Performance Details",
    body: `Event: SOLUNA FEST HAWAII 2026
Venue: Moanalua Gardens, Oahu, Hawaii
Performance Date & Time: September ___, 2026, ___:___ – ___:___ (HST)
Set Length: ___ minutes
Genre: Underground Electronic`,
  },
  {
    title: "Article 3 — Fee",
    body: `Performance Fee: $________ (all-inclusive)
Payment Schedule:
 - Within 14 days of signing: 50% deposit
 - 7 days before performance: Remaining 50%
Payment Method: Wire transfer (to Party B's designated account)
Currency: USD`,
  },
  {
    title: "Article 4 — Travel & Accommodation",
    body: `Party A provides:
 - Round-trip airfare (Business / Economy: ___________)
   Departure city: _______________
 - Hotel: ___ nights (Check-in: Sep ___ / Check-out: Sep ___)
   Hotel: Waikiki area (arranged by Party A)
 - Airport ↔ Hotel ↔ Venue transfers
Party B provides:
 - Passport acquisition / renewal costs
 - Personal expenses`,
  },
  {
    title: "Article 5 — Technical Rider",
    body: `Party B shall submit a technical rider within 30 days of signing.
Party A will make reasonable efforts to fulfill rider requirements.

Standard provision by Party A:
 - Pioneer CDJ-3000 × 4 + DJM-V10 (or equivalent)
 - 2 monitor speakers (on stage)
 - IEM (in-ear monitor) capability
 - Stage lighting per Party A's lighting design

Additional equipment requests to be discussed and cost-shared as agreed.`,
  },
  {
    title: "Article 6 — Visa Support",
    body: `For non-US artists, Party A will assist with visa procurement:
 - O-1 visa (extraordinary ability) or P-1 visa (internationally recognized artist)
 - Party A provides: sponsor letter, event invitation, contract copy
 - Visa application fees: Borne by Party A / Party B (circle one)
 - Application must begin by May 1, 2026 (3–6 month lead time required)

Note: If visa is denied, Party A refunds deposit in full and this Agreement is terminated.`,
  },
  {
    title: "Article 7 — Cancellation Policy",
    body: `Cancellation by Party A:
 - 90+ days before: Full deposit refund
 - 90–30 days before: 50% deposit refund
 - Within 30 days: No refund (full fee obligation)

Cancellation by Party B:
 - 90+ days before: Full deposit return
 - 90–30 days before: 50% deposit return + assist in replacement artist sourcing
 - Within 30 days: Full deposit return + reasonable reimbursement of Party A's additional costs

Force Majeure: Natural disaster, pandemic, government order — both parties released. Full deposit refund.`,
  },
  {
    title: "Article 8 — Recording & Streaming",
    body: `Party A has the right to record, film, and stream Party B's performance for:
 - Promotional content (social media, website)
 - Live streaming (requires Party B's prior written consent)
 - Archive footage (public release requires Party B's prior approval)

Party B may post event announcements and set photos on their own social media.
Unauthorized publication of full set recordings is prohibited.`,
  },
  {
    title: "Article 9 — Exclusivity Clause",
    body: `Party B agrees not to perform at any other event within Oahu (50km radius) for ___ days before and ___ days after the performance date.`,
  },
  {
    title: "Article 10 — Confidentiality",
    body: `Both parties shall not disclose the terms of this Agreement (including fees) to third parties.
Exception: Disclosures required by law or to tax/legal advisors.
Party B shall not publicly announce participation before Party A's official lineup announcement.`,
  },
  {
    title: "Article 11 — Governing Law & Jurisdiction",
    body: `This Agreement shall be governed by the laws of the State of Hawaii. Exclusive jurisdiction: courts of Honolulu County.`,
  },
];

const RIDER_STANDARD = [
  { ja: "Pioneer CDJ-3000 × 4", en: "Pioneer CDJ-3000 × 4" },
  { ja: "Pioneer DJM-V10 ミキサー", en: "Pioneer DJM-V10 Mixer" },
  { ja: "モニタースピーカー × 2（ステージ上）", en: "Monitor Speakers × 2 (on stage)" },
  { ja: "IEM対応（Sennheiser EW 300 G4）", en: "IEM support (Sennheiser EW 300 G4)" },
  { ja: "DJ用テーブル（安定した台）", en: "DJ table (stable surface)" },
  { ja: "ステージ照明（メインライティングに統合）", en: "Stage lighting (integrated with main design)" },
  { ja: "AC電源 × 4口（ステージ上）", en: "AC power × 4 outlets (on stage)" },
  { ja: "ミネラルウォーター、タオル（バックステージ）", en: "Water, towels (backstage)" },
];

export default function ArtistContractPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };
  const clauses = ja ? CLAUSES_JA : CLAUSES_EN;

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/admin" className="nav-pill">Admin</Link>
          <Link href="/contract" className="nav-pill">{ja ? "契約" : "Contract"}</Link>
          <span className="nav-pill-active">{ja ? "アーティスト契約" : "Artist Contract"}</span>
          <button onClick={() => downloadPDF("pdf-content", "SOLUNA-Artist-Contract.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Artist Performance Agreement · Template
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,8vw,3.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            {ja ? "アーティスト\n出演契約書" : "ARTIST\nCONTRACT"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,80,80,0.7)", fontSize: 13, fontWeight: 600 }}>
            {ja ? "※テンプレート — 法務レビュー前。各アーティストごとにカスタマイズが必要。" : "TEMPLATE — Pre-legal review. Must be customized per artist."}
          </p>
        </motion.div>

        {/* Contract Clauses */}
        {clauses.map((c, i) => (
          <motion.section key={i} {...fade} style={{ marginBottom: 40 }}>
            <h3 style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700, marginBottom: 12, letterSpacing: "0.05em" }}>
              {c.title}
            </h3>
            <div className="card" style={{ padding: "20px 24px" }}>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {c.body}
              </p>
            </div>
          </motion.section>
        ))}

        {/* Standard Technical Rider */}
        <motion.section {...fade} style={{ marginBottom: 60, marginTop: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "別紙: 標準テクニカルライダー" : "Appendix: Standard Technical Rider"}
          </h2>
          <div className="card-gold" style={{ padding: "24px 28px" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {RIDER_STANDARD.map((r, i) => (
                <li key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, paddingLeft: 16, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--gold)" }}>•</span>
                  {ja ? r.ja : r.en}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Signature Block */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            {[
              { ja: "甲（主催者）", en: "Party A (Promoter)", name: "SOLUNA Inc." },
              { ja: "乙（アーティスト/代理人）", en: "Party B (Artist / Agent)", name: "_______________" },
            ].map(p => (
              <div key={p.en}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
                  {ja ? p.ja : p.en}
                </p>
                <p style={{ color: "#fff", fontSize: 14, marginBottom: 24 }}>{p.name}</p>
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.2)", marginBottom: 8, height: 40 }} />
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{ja ? "署名 / 日付" : "Signature / Date"}</p>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
      <InnerFooter lang={lang} />
    </main>
  );
}
