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
    body: `本契約は以下の当事者間で締結される。
賃借人（以下「甲」）: SOLUNA Inc.（ハワイ州法人）
会場所有者（以下「乙」）: モアナルアガーデン（Moanalua Gardens）管理者`,
  },
  {
    title: "第2条 — 使用目的",
    body: `甲は、以下のイベント開催のために乙の施設を使用する。
イベント名: ZAMNA HAWAII 2026
日程: 2026年9月3日（水）設営 〜 9月6日（日）撤収完了
本番: 9月4日（金）18:00〜03:00、9月5日（土）18:00〜03:00
想定来場者数: 2,000〜5,000名`,
  },
  {
    title: "第3条 — 使用料及び支払条件",
    body: `使用料: ＄____（税別）
支払スケジュール:
 - 契約締結時: 使用料の30%（デポジット）
 - 2026年6月1日まで: 使用料の40%
 - 2026年8月15日まで: 残額30%
デポジットは、乙の責に帰すべき事由による契約解除の場合のみ返金される。`,
  },
  {
    title: "第4条 — 使用範囲",
    body: `甲が使用可能な範囲:
 - メインイベントエリア（ステージ設営含む）
 - 駐車場（来場者・スタッフ用）
 - バックステージエリア
 - 飲食ブース設営エリア
 - ロード・イン/アウト用アクセス道路
乙は、上記エリアへの排他的アクセス権を設営日〜撤収日まで甲に付与する。`,
  },
  {
    title: "第5条 — 設備・インフラ",
    body: `乙が提供するもの:
 - 電源接続ポイント（___kVA）
 - 上水道アクセス
 - 既存トイレ施設
甲が手配するもの:
 - 追加発電機、仮設トイレ、ステージ・音響・照明機材
 - 仮設構造物の設置（乙の事前承認が必要）`,
  },
  {
    title: "第6条 — 保険・賠償",
    body: `甲は以下の保険に加入し、乙を追加被保険者として記載する。
 - 一般賠償責任保険: 最低$2,000,000
 - イベントキャンセル保険: イベント総予算相当額
甲は、甲の過失に起因する損害について乙を免責・補償する。`,
  },
  {
    title: "第7条 — 騒音・近隣対応",
    body: `甲は、ホノルル市の騒音条例を遵守する。
 - 音量制限: 会場敷地境界にて__dB(A)以下
 - 深夜（23:00以降）の延長は騒音許可を取得の上実施
 - 近隣住民への事前通知は甲の責任で行う`,
  },
  {
    title: "第8条 — 原状回復",
    body: `甲は、撤収完了日（9月6日）までに会場を原状回復する。
 - 全ての仮設構造物の撤去
 - ゴミ・廃棄物の完全撤去
 - 芝生・地面の損傷があった場合は甲の費用で修復
乙による原状回復検査に合格後、デポジットの残余があれば返金する。`,
  },
  {
    title: "第9条 — 不可抗力",
    body: `天災、疫病、政府命令等の不可抗力により本イベントが開催不能となった場合、甲乙双方は本契約を解除できる。この場合、乙は受領済み使用料からデポジット相当額を控除した残額を甲に返金する。`,
  },
  {
    title: "第10条 — 準拠法・管轄",
    body: `本契約はハワイ州法に準拠し、ホノルル郡の裁判所を専属管轄裁判所とする。`,
  },
];

const CLAUSES_EN = [
  {
    title: "Article 1 — Parties",
    body: `This Agreement is entered into between:
Lessee ("Party A"): SOLUNA Inc. (Hawaii corporation)
Venue Owner ("Party B"): Moanalua Gardens Management`,
  },
  {
    title: "Article 2 — Purpose of Use",
    body: `Party A shall use Party B's facility for the following event:
Event Name: ZAMNA HAWAII 2026
Dates: September 3, 2026 (setup) – September 6, 2026 (teardown complete)
Event: Sep 4 (Fri) 18:00–03:00, Sep 5 (Sat) 18:00–03:00
Expected Attendance: 2,000–5,000`,
  },
  {
    title: "Article 3 — Rental Fee & Payment",
    body: `Rental Fee: $____ (excl. tax)
Payment Schedule:
 - Upon signing: 30% deposit
 - By June 1, 2026: 40%
 - By August 15, 2026: Remaining 30%
Deposit is refundable only if cancellation is due to Party B's fault.`,
  },
  {
    title: "Article 4 — Scope of Use",
    body: `Party A may use the following areas:
 - Main event area (including stage installation)
 - Parking lot (guests & staff)
 - Backstage area
 - F&B booth area
 - Load-in / load-out access roads
Party B grants exclusive access to the above areas from setup through teardown.`,
  },
  {
    title: "Article 5 — Facilities & Infrastructure",
    body: `Provided by Party B:
 - Power connection points (___kVA)
 - Water supply access
 - Existing restroom facilities
Arranged by Party A:
 - Additional generators, portable restrooms, stage/sound/lighting equipment
 - Temporary structures (subject to Party B's prior approval)`,
  },
  {
    title: "Article 6 — Insurance & Indemnification",
    body: `Party A shall maintain the following insurance, naming Party B as additional insured:
 - General liability insurance: Minimum $2,000,000
 - Event cancellation insurance: Equal to total event budget
Party A shall indemnify and hold Party B harmless from damages caused by Party A's negligence.`,
  },
  {
    title: "Article 7 — Noise & Neighbor Relations",
    body: `Party A shall comply with City of Honolulu noise ordinances.
 - Sound limit: __dB(A) or below at property boundary
 - Late-night extension (past 11 PM) requires noise permit
 - Advance neighbor notification is Party A's responsibility`,
  },
  {
    title: "Article 8 — Restoration",
    body: `Party A shall restore the venue to its original condition by teardown date (Sep 6).
 - Remove all temporary structures
 - Complete waste and debris removal
 - Repair any lawn/ground damage at Party A's expense
Remaining deposit refunded after Party B's restoration inspection passes.`,
  },
  {
    title: "Article 9 — Force Majeure",
    body: `If the event becomes impossible due to force majeure (natural disaster, pandemic, government order, etc.), either party may terminate this Agreement. In such case, Party B shall refund received rental fees minus the deposit amount.`,
  },
  {
    title: "Article 10 — Governing Law & Jurisdiction",
    body: `This Agreement shall be governed by the laws of the State of Hawaii. Exclusive jurisdiction shall be the courts of Honolulu County.`,
  },
];

export default function VenueAgreementPage() {
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
          ZAMNA HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/admin" className="nav-pill">Admin</Link>
          <Link href="/contract" className="nav-pill">{ja ? "契約" : "Contract"}</Link>
          <span className="nav-pill-active">{ja ? "会場契約" : "Venue Agreement"}</span>
          <button onClick={() => downloadPDF("pdf-content", "ZAMNA-Venue-Agreement.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Venue Rental Agreement · Draft
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,8vw,3.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            {ja ? "会場使用\n契約書" : "VENUE\nAGREEMENT"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,80,80,0.7)", fontSize: 13, fontWeight: 600 }}>
            {ja ? "※ドラフト — 法務レビュー前。署名効力なし。" : "DRAFT — Pre-legal review. Not binding."}
          </p>
        </motion.div>

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

        {/* Signature Block */}
        <motion.section {...fade} style={{ marginBottom: 40, marginTop: 60 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            {[
              { ja: "甲（賃借人）", en: "Party A (Lessee)", name: "SOLUNA Inc." },
              { ja: "乙（会場所有者）", en: "Party B (Venue Owner)", name: "Moanalua Gardens" },
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
