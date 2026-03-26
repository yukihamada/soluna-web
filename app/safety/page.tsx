"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";
import { downloadPDF } from "@/lib/pdf";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const EMERGENCY_CONTACTS = [
  { ja: "イベント統括本部", en: "Event Operations Center", phone: "TBD", ja_d: "会場内全体の指揮系統", en_d: "Central command for all on-site ops" },
  { ja: "救急医療チーム", en: "Medical Team", phone: "TBD", ja_d: "メディカルテント常駐（EMT/看護師）", en_d: "On-site EMT / nurse at medical tent" },
  { ja: "セキュリティ統括", en: "Security Lead", phone: "TBD", ja_d: "入退場管理・不審者対応", en_d: "Access control & incident response" },
  { ja: "警察（HPD）", en: "Honolulu Police (HPD)", phone: "911", ja_d: "緊急時", en_d: "Emergency" },
  { ja: "消防（HFD）", en: "Honolulu Fire Dept", phone: "911", ja_d: "火災・危険物", en_d: "Fire / hazmat" },
  { ja: "最寄り病院", en: "Nearest Hospital", phone: "TBD", ja_d: "救急搬送先", en_d: "Emergency transport destination" },
];

const MEDICAL_PLAN = {
  ja: [
    "EMT（救急救命士）2名 + 看護師1名が常駐（各日）",
    "AED（自動体外式除細動器）× 3台（メディカルテント、VIPエリア、ゲート付近）",
    "メディカルテントに救急車1台を待機（即搬送可能）",
    "熱中症対策: 無料給水ステーション × 5箇所、ミスト扇風機",
    "アレルギー・持病申告システム（チケット購入時に任意登録）",
    "応急処置キット各ゾーンに配備",
  ],
  en: [
    "2 EMTs + 1 nurse on-site per day",
    "3 AEDs: medical tent, VIP area, entrance gate",
    "1 ambulance on standby at medical tent (rapid transport)",
    "Heat protocol: 5 free hydration stations, misting fans",
    "Optional allergy / medical condition registration at ticket purchase",
    "First aid kits at every zone",
  ],
};

const EVAC_PLAN = {
  ja: [
    "避難経路は会場内に3箇所（北口・南口・駐車場側）の非常口を設置",
    "各非常口にはLED誘導灯と蓄光テープで視認性を確保",
    "避難指示はPA（場内放送）+ スタッフの無線連携で一斉伝達",
    "避難集合場所: 駐車場北側エリア（会場から100m以上離れた安全地帯）",
    "全スタッフは避難誘導の訓練を事前に受講（イベント前日リハーサル）",
    "車椅子利用者・障がい者用の避難補助要員を各ゾーンに配置",
  ],
  en: [
    "3 emergency exits: North gate, South gate, Parking lot side",
    "LED exit signs + photoluminescent tape at all exits",
    "Evacuation announced via PA system + staff radio relay",
    "Assembly point: North parking area (100m+ from venue)",
    "All staff trained in evacuation procedures (rehearsal day before event)",
    "Accessibility evacuation assistants assigned to each zone",
  ],
};

const WEATHER_PLAN = {
  ja: [
    "小雨: イベント続行。滑り止めマットを通路に追加配備",
    "強風（30m/s超）: ステージ上部の装飾物を撤去。状況により中断判断",
    "雷雨: 即座にイベント中断。来場者を屋根付きエリア（VIPラウンジ・飲食エリア）に誘導",
    "津波警報: イベント中止。高台への避難誘導を開始",
    "判断権限: プロデューサー + セキュリティ統括の合議制",
    "気象情報: National Weather Service (NWS) のアラートを常時監視",
  ],
  en: [
    "Light rain: Event continues. Anti-slip mats added to walkways",
    "High wind (>30m/s): Remove stage overhead decor. May pause event",
    "Thunderstorm: Immediate event pause. Direct guests to covered areas (VIP lounge, F&B)",
    "Tsunami warning: Event cancelled. Begin uphill evacuation",
    "Decision authority: Producer + Security Lead (joint decision)",
    "Weather monitoring: Continuous NWS alert tracking",
  ],
};

const SECURITY_PLAN = {
  ja: [
    "入場時: 全来場者にバッグチェック + 金属探知機スキャン",
    "セキュリティスタッフ: 30〜40名（GA:来場者比 1:100）",
    "VIPエリア: 専用セキュリティ × 4名",
    "バックステージ: IDバッジ + フェイスチェックによるアクセス制御",
    "監視カメラ: 会場内8箇所、入口・駐車場含む",
    "アルコール管理: ID確認厳格化（21歳未満禁止）、リストバンド方式",
    "迷惑行為・ハラスメント対応: 即退場 + 警察通報の2段階措置",
    "持ち込み禁止物: 大型バッグ、プロ用カメラ、花火、違法薬物、武器",
  ],
  en: [
    "Entry: Bag check + metal detector scan for all attendees",
    "Security staff: 30–40 personnel (1:100 ratio to GA)",
    "VIP area: 4 dedicated security",
    "Backstage: ID badge + face check access control",
    "CCTV: 8 cameras covering venue, entrance, parking",
    "Alcohol: Strict ID enforcement (21+ only), wristband system",
    "Harassment / misconduct: Immediate ejection + police report (2-step)",
    "Prohibited items: Large bags, pro cameras, fireworks, drugs, weapons",
  ],
};

export default function SafetyPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  const renderList = (items: string[]) => (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, paddingLeft: 16, position: "relative" }}>
          <span style={{ position: "absolute", left: 0, color: "var(--gold)" }}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/admin" className="nav-pill">Admin</Link>
          <Link href="/production" className="nav-pill">{ja ? "制作" : "Production"}</Link>
          <Link href="/staff" className="nav-pill">{ja ? "スタッフ" : "Staff"}</Link>
          <span className="nav-pill-active">{ja ? "安全計画" : "Safety"}</span>
          <button onClick={() => downloadPDF("pdf-content", "SOLUNA-Safety-Plan.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Safety & Emergency Plan · Internal
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.5rem,10vw,4.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            {ja ? "安全管理\n計画" : "SAFETY\nPLAN"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
            {ja ? "モアナルアガーデン — 緊急時対応・医療・避難・気象計画" : "Moanalua Gardens — Emergency Response, Medical, Evacuation & Weather Plans"}
          </p>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "緊急連絡先" : "Emergency Contacts"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EMERGENCY_CONTACTS.map(c => (
              <div key={c.en} className="card" style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ja ? c.ja : c.en}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{ja ? c.ja_d : c.en_d}</p>
                </div>
                <span style={{ color: "var(--gold)", fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{c.phone}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Medical */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "医療体制" : "Medical Plan"}
          </h2>
          <div className="card-gold" style={{ padding: "24px 28px" }}>
            {renderList(ja ? MEDICAL_PLAN.ja : MEDICAL_PLAN.en)}
          </div>
        </motion.section>

        {/* Security */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "セキュリティ計画" : "Security Plan"}
          </h2>
          <div className="card" style={{ padding: "24px 28px" }}>
            {renderList(ja ? SECURITY_PLAN.ja : SECURITY_PLAN.en)}
          </div>
        </motion.section>

        {/* Evacuation */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "避難計画" : "Evacuation Plan"}
          </h2>
          <div className="card" style={{ padding: "24px 28px" }}>
            {renderList(ja ? EVAC_PLAN.ja : EVAC_PLAN.en)}
          </div>
        </motion.section>

        {/* Weather */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "気象対応計画" : "Weather Contingency"}
          </h2>
          <div className="card" style={{ padding: "24px 28px" }}>
            {renderList(ja ? WEATHER_PLAN.ja : WEATHER_PLAN.en)}
          </div>
        </motion.section>

        {/* Compliance */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "法令遵守・許認可" : "Compliance & Permits"}
          </h2>
          <div className="data-table">
            {[
              { ja_l: "イベント営業許可", en_l: "Special Event Permit", ja_v: "ホノルル市申請中", en_v: "City of Honolulu — applied" },
              { ja_l: "酒類提供ライセンス", en_l: "Liquor License", ja_v: "申請予定", en_v: "To be applied" },
              { ja_l: "騒音許可", en_l: "Noise Permit", ja_v: "申請予定（23時以降の延長）", en_v: "To be applied (extension past 11 PM)" },
              { ja_l: "消防検査", en_l: "Fire Inspection", ja_v: "イベント前に実施", en_v: "Pre-event inspection scheduled" },
              { ja_l: "一般賠償保険", en_l: "General Liability Insurance", ja_v: "$2M カバレッジ（予定）", en_v: "$2M coverage (planned)" },
              { ja_l: "イベントキャンセル保険", en_l: "Event Cancellation Insurance", ja_v: "検討中", en_v: "Under review" },
            ].map((r, i) => (
              <div key={r.en_l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{ja ? r.ja_l : r.en_l}</span>
                <span className="data-row-value" style={{ color: "rgba(255,255,255,0.7)", textAlign: "right" }}>{ja ? r.ja_v : r.en_v}</span>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
      <InnerFooter lang={lang} />
    </main>
  );
}
