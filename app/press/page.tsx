"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";
import { downloadPDF } from "@/lib/pdf";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const KEY_FACTS = [
  { ja_l: "イベント名", en_l: "Event Name", v: "SOLUNA FEST HAWAII 2026" },
  { ja_l: "日程", en_l: "Dates", ja_v: "2026年9月4日（金）〜5日（土）", en_v: "September 4 (Fri) – 5 (Sat), 2026" },
  { ja_l: "会場", en_l: "Venue", ja_v: "モアナルアガーデン（Moanalua Gardens）, オアフ島", en_v: "Moanalua Gardens, Oahu, HI" },
  { ja_l: "ジャンル", en_l: "Genre", ja_v: "アンダーグラウンド・エレクトロニック", en_v: "Underground Electronic Music" },
  { ja_l: "想定来場者数", en_l: "Expected Attendance", ja_v: "最大9,000人/日", en_v: "Up to 9,000 per day" },
  { ja_l: "ターゲット層", en_l: "Target Audience", ja_v: "22〜45歳、平均年収$120K+", en_v: "Ages 22–45, avg income $120K+" },
  { ja_l: "開催時間", en_l: "Hours", ja_v: "18:00〜03:00 HST（両日）", en_v: "6:00 PM – 3:00 AM HST (both days)" },
  { ja_l: "チケット", en_l: "Tickets", ja_v: "GA $120〜 / VIP $1,000〜", en_v: "GA from $120 / VIP from $1,000" },
  { ja_l: "主催", en_l: "Organizer", v: "SOLUNA Inc." },
  { ja_l: "公式サイト", en_l: "Website", v: "https://solun.art" },
];

const ABOUT_JA = `SOLUNA FEST HAWAIIは、メキシコ・トゥルムで生まれた世界最高峰のアンダーグラウンド・エレクトロニック・ミュージックフェスティバル「SOLUNA」の、初のアメリカ本土開催です。

オアフ島のモアナルアガーデン（JP Damon Estate）を舞台に、日立の樹で知られる圧倒的な自然景観と最先端のサウンド・照明演出が融合する3日間のイミーシブ体験を提供します。Waikikiから車15分という抜群のアクセスも魅力です。

SOLUNAはこれまでにトゥルム、ドバイ、コスタリカ・ノサラなどで開催され、累計85万人以上の来場者を動員。アジア太平洋地域からの集客も見込み、日本・韓国・オーストラリアからの来場者が全体の約25%を占める見込みです。`;

const ABOUT_EN = `SOLUNA FEST HAWAII marks the first-ever United States edition of SOLUNA — the world's most premium underground electronic music festival, born in Tulum, Mexico.

Set against the stunning backdrop of Moanalua Gardens (JP Damon Estate) on Oahu — home to the iconic Hitachi tree — the two-day immersive experience blends Hawaii's natural beauty with cutting-edge sound and lighting production. Just 15 minutes from Waikiki, the venue offers unparalleled accessibility for international guests.

SOLUNA has previously been held in Tulum, Dubai, and Nosara (Costa Rica), drawing over 850,000 cumulative attendees worldwide. The Hawaii edition is expected to attract a significant Asia-Pacific audience, with approximately 25% of attendees from Japan, Korea, and Australia.`;

const BRAND_GUIDELINES = {
  ja: [
    "「SOLUNA FEST HAWAII」はすべて大文字で表記してください",
    "ロゴの周囲には最低でもロゴの高さの50%のクリアスペースを確保してください",
    "ブランドカラー: ゴールド #C9A962 / ブラック #080808 / ホワイト #FFFFFF",
    "ロゴの変形・色変更は禁止です。提供されたアセットをそのまま使用してください",
    "「Powered by SOLUNA」のクレジットを必ず付記してください",
  ],
  en: [
    "Always write \"SOLUNA FEST HAWAII\" in all caps",
    "Maintain clear space of at least 50% of logo height around the logo",
    "Brand colors: Gold #C9A962 / Black #080808 / White #FFFFFF",
    "Do not distort, recolor, or modify the logo. Use provided assets only",
    "Always include \"Powered by SOLUNA\" credit",
  ],
};

const HISTORY = [
  { year: "2019", event: "SOLUNA Tulum", ja_d: "初開催。トゥルムのセノーテで開催", en_d: "Inaugural edition at Tulum cenote" },
  { year: "2022", event: "SOLUNA Dubai", ja_d: "中東初進出。砂漠の特設会場", en_d: "Middle East debut. Desert venue" },
  { year: "2023", event: "SOLUNA Nosara", ja_d: "コスタリカ開催", en_d: "Costa Rica edition" },
  { year: "2024", event: "SOLUNA Tulum / Dubai", ja_d: "過去最大規模で両拠点開催", en_d: "Largest editions at both venues" },
  { year: "2026", event: "SOLUNA FEST HAWAII", ja_d: "初の米国開催。オアフ島モアナルアガーデン", en_d: "First US edition. Moanalua Gardens, Oahu" },
];

export default function PressPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/info" className="nav-pill">Info</Link>
          <Link href="/sponsor" className="nav-pill">{ja ? "スポンサー" : "Sponsor"}</Link>
          <span className="nav-pill-active">{ja ? "プレスキット" : "Press Kit"}</span>
          <button onClick={() => downloadPDF("pdf-content", "SOLUNA-Press-Kit.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Press Kit · 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.5rem,10vw,5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            PRESS<br />KIT
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7 }}>
            {ja ? "メディア関係者向け公式資料" : "Official media resources"}
          </p>
        </motion.div>

        {/* Key Facts */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "基本情報" : "Key Facts"}
          </h2>
          <div className="data-table">
            {KEY_FACTS.map((f, i) => (
              <div key={f.ja_l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{ja ? f.ja_l : f.en_l}</span>
                <span className="data-row-value" style={{ color: "rgba(255,255,255,0.7)", textAlign: "right" }}>
                  {f.v ?? (ja ? f.ja_v : f.en_v)}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* About */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "イベント概要" : "About the Event"}
          </h2>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {ja ? ABOUT_JA : ABOUT_EN}
          </div>
        </motion.section>

        {/* History */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "SOLUNAの歩み" : "SOLUNA History"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {HISTORY.map((h, i) => (
              <div key={h.year + h.event} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: i < HISTORY.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, minWidth: 48 }}>{h.year}</span>
                <div>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{h.event}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{ja ? h.ja_d : h.en_d}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Audience Demographics */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "来場者プロフィール" : "Audience Demographics"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[
              { label: ja ? "米国" : "USA", value: "55%" },
              { label: ja ? "日本" : "Japan", value: "25%" },
              { label: ja ? "アジア他" : "Other Asia", value: "12%" },
              { label: ja ? "その他" : "Other", value: "8%" },
            ].map(d => (
              <div key={d.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>{d.value}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{d.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Brand Guidelines */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "ブランドガイドライン" : "Brand Guidelines"}
          </h2>
          <div className="card-gold" style={{ padding: "24px 28px" }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {(ja ? BRAND_GUIDELINES.ja : BRAND_GUIDELINES.en).map((g, i) => (
                <li key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, paddingLeft: 20, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: "var(--gold)" }}>{i + 1}.</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            {[
              { label: "Gold", color: "#C9A962" },
              { label: "Black", color: "#080808" },
              { label: "White", color: "#FFFFFF" },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color, border: "1px solid rgba(255,255,255,0.15)" }} />
                <div>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>{c.label}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{c.color}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Media Contact */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "メディアお問い合わせ" : "Media Contact"}
          </h2>
          <div className="card-gold" style={{ padding: "28px" }}>
            <p style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>
              {ja ? "広報担当" : "Press & Communications"}
            </p>
            <p style={{ color: "#fff", fontSize: 15, marginBottom: 8 }}>SOLUNA Inc. — PR Team</p>
            <a href="mailto:press@solun.art" style={{ color: "var(--gold)", fontSize: 14, textDecoration: "none" }}>press@solun.art</a>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 16, lineHeight: 1.6 }}>
              {ja
                ? "取材申請、ロゴ・写真素材のリクエスト、インタビュー調整などお気軽にお問い合わせください。"
                : "For interview requests, high-resolution assets, and press accreditation, please reach out."}
            </p>
          </div>
        </motion.section>

        {/* Boilerplate */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "定型文（掲載用）" : "Boilerplate"}
          </h2>
          <div className="card" style={{ padding: "24px 28px" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.8, fontStyle: "italic" }}>
              {ja
                ? "SOLUNA FEST HAWAIIは、世界最高峰のアンダーグラウンド・エレクトロニック・ミュージックフェスティバル「SOLUNA」の初の米国開催です。2026年9月4〜5日、オアフ島モアナルアガーデンにて開催。SOLUNAがプロデュース。詳細: solun.art"
                : "SOLUNA FEST HAWAII is the first-ever US edition of SOLUNA, the world's most premium underground electronic music festival. September 4–6, 2026 at Moanalua Gardens, Oahu. Produced by SOLUNA. More info: solun.art"}
            </p>
          </div>
        </motion.section>

      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
