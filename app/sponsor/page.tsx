"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { downloadPDF } from "@/lib/pdf";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const PKG = [
  {
    tier: "PRESENTING PARTNER",
    contractId: "presenting",
    usd: "$100,000+",
    jpy: "約1,500万円〜 / approx. ¥15M+",
    gold: true,
    bullets: {
      ja: ["イベント名に御社名が入る（例：〇〇 presents ZAMNA HAWAII）", "全会場・全宣材に御社ロゴ", "VIPチケット30枚 + バックステージ5枚", "公式SNS（50万フォロワー）で御社フィーチャー"],
      en: ["Your name in the event title (e.g. ○○ presents ZAMNA HAWAII)", "Logo everywhere: venue, all marketing materials", "30 VIP tickets + 5 backstage passes", "Featured on official social (500K followers)"],
    },
  },
  {
    tier: "ARTIST STAGE PARTNER",
    contractId: "artist",
    usd: "$50,000",
    jpy: "約750万円 / approx. ¥7.5M",
    gold: false,
    bullets: {
      ja: ["ステージに御社名がつく（例：〇〇 STAGE）", "ステージ横に大型バナー", "VIPチケット15枚", "SNS2回メンション"],
      en: ["Your name on a stage (e.g. ○○ STAGE)", "Large banner at the stage", "15 VIP tickets", "2 social media mentions"],
    },
  },
  {
    tier: "VIP LOUNGE PARTNER",
    contractId: "vip",
    usd: "$20,000",
    jpy: "約300万円 / approx. ¥3M",
    gold: false,
    bullets: {
      ja: ["VIPラウンジに御社名（例：〇〇 VIP LOUNGE）", "バーカウンターのブランディング", "VIPチケット10枚", "SNS1回メンション"],
      en: ["Your name on the VIP lounge", "Branded bar counter", "10 VIP tickets", "1 social media mention"],
    },
  },
  {
    tier: "CUSTOM",
    contractId: "custom",
    usd: { ja: "ご予算に合わせて", en: "Any budget" },
    jpy: "",
    gold: false,
    bullets: {
      ja: ["ドリンクスポンサー、アートスポンサー、配信スポンサーなど、ご要望に応じて設計します"],
      en: ["Drink sponsor, art sponsor, streaming sponsor — designed around your needs"],
    },
  },
];

const OCCUPATIONS = [
  { l: { ja: "クリエイター", en: "Creatives" }, v: "23%" },
  { l: { ja: "テック", en: "Tech" }, v: "19%" },
  { l: { ja: "エンタメ", en: "Entertainment" }, v: "17%" },
  { l: { ja: "金融", en: "Finance" }, v: "12%" },
];

export default function SponsorPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  return (
    <main id="pdf-content" style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      {/* Print header */}
      <div className="print-header px-0">
        <p className="font-display text-2xl tracking-wider" style={{ color: "#111" }}>ZAMNA HAWAII 2026</p>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          {ja ? "スポンサーシップ資料 · 機密" : "Sponsorship Deck · Confidential"}
        </p>
      </div>

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link href="/" className="font-display text-sm tracking-widest" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textDecoration: "none" }}>
          ZAMNA HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span className="nav-pill-active">{ja ? "スポンサー" : "Sponsor"}</span>
          <Link href="/investor" className="nav-pill">{ja ? "投資家" : "Investor"}</Link>
          <Link href="/deal" className="nav-pill">{ja ? "ディール" : "Deal"}</Link>
          <Link href="/contract" className="nav-pill">{ja ? "契約" : "Contract"}</Link>
          <button
            onClick={toggleLang}
            style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}
          >{ja ? "EN" : "JA"}</button>
          <button
            onClick={async () => { setIsGenerating(true); await downloadPDF("pdf-content", `zamna-hawaii-2026-sponsor-${lang}.pdf`); setIsGenerating(false); }}
            disabled={isGenerating}
            style={{ padding: "5px 12px", border: "1px solid rgba(201,169,98,0.35)", borderRadius: 999, fontSize: 10, letterSpacing: "0.08em", cursor: isGenerating ? "default" : "pointer", background: "transparent", color: isGenerating ? "rgba(201,169,98,0.3)" : "rgba(201,169,98,0.6)", transition: "color 0.2s" }}
          >{isGenerating ? (ja ? "生成中…" : "Building…") : "PDF ↓"}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 100 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            スポンサーシップ資料 · Confidential · 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(3.8rem,14vw,7.5rem)", lineHeight: 0.95, marginBottom: 28, color: "#fff" }}>
            ZAMNA<br />HAWAII<br />2026
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 22 }} />
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 22, lineHeight: 1.5, marginBottom: 12 }}>
            {ja ? "あなたのブランドを、ハワイで輝かせる" : "Make Your Brand Shine in Hawaii"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 15, lineHeight: 1.7 }}>
            {ja
              ? "世界最高峰の音楽フェスが、2026年9月4日にオアフ島で開催されます。"
              : "The world's top music festival comes to Oahu on September 4, 2026."}
          </p>
        </motion.div>

        {/* SECTION 1: What is ZAMNA? */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", marginBottom: 28, color: "#fff" }}>
            {ja ? "ZAMNA HAWAIIって何？" : "What is ZAMNA HAWAII?"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
            {[
              { v: ja ? "2,000〜5,000人" : "2,000–5,000 guests", l: ja ? "来場者数" : "Guests" },
              { v: "$120,000+", l: ja ? "平均世帯年収" : "Avg. income" },
              { v: ja ? "世界No.1" : "World's #1", l: ja ? "トゥルム発の音楽フェス" : "Festival from Tulum" },
            ].map(m => (
              <div className="kpi" key={m.l}><div className="kpi-value">{m.v}</div><div className="kpi-label">{m.l}</div></div>
            ))}
          </div>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.85, marginBottom: 24 }}>
            {ja
              ? "Zamnaはメキシコ・トゥルムで生まれた、世界で最も洗練された音楽フェスです。今回が初めての米国進出。ハワイ・オアフ島の絶景のなかで、最高のアーティストと3,000人以上の富裕層ゲストが集まります。"
              : "Zamna is the world's most premium music festival, born in Tulum, Mexico. This is its first-ever US event. World-class artists and 3,000+ affluent guests gather amid Oahu's breathtaking scenery."}
          </p>

          <div className="data-table">
            {[
              [ja ? "日程" : "Date", "2026年9月4日 / September 4, 2026"],
              [ja ? "会場" : "Venue", "Moanalua Gardens（モアナルアガーデン）· オアフ島 / Oahu"],
              [ja ? "来場者" : "Guests", ja ? "2,000〜5,000人" : "2,000–5,000"],
              [ja ? "客層" : "Audience", ja ? "22〜45歳・平均年収$120K+" : "Age 22–45, avg income $120K+"],
              [ja ? "音楽" : "Music", ja ? "アンダーグラウンド・エレクトロニック" : "Underground Electronic"],
              [ja ? "主催" : "Organizer", "SOLUNA × Zamna"],
            ].map(([l, v], i) => (
              <div className="data-row" key={l} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{l}</span>
                <span className="data-row-value">{v}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* SECTION 2: Packages */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", marginBottom: 28, color: "#fff" }}>
            {ja ? "スポンサーになると何が得られる？" : "What Do You Get?"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {PKG.map((pkg) => {
              const price = typeof pkg.usd === "string" ? pkg.usd : pkg.usd[lang];
              return (
                <div className={pkg.gold ? "card-gold" : "card"} key={pkg.tier}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                    <div>
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{pkg.tier}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", fontWeight: 700, color: pkg.gold ? "var(--gold)" : "#fff" }}>{price}</p>
                      {pkg.jpy && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{pkg.jpy}</p>}
                    </div>
                  </div>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                    {pkg.bullets[lang].map((b) => (
                      <li key={b} style={{ display: "flex", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.6 }}>
                        <span style={{ color: "rgba(201,169,98,0.6)", flexShrink: 0 }}>—</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/contract?type=sponsor&package=${pkg.contractId}`}
                    style={{
                      display: "block", textAlign: "center", padding: "10px 0", borderRadius: 999,
                      fontSize: 12, letterSpacing: "0.1em", textDecoration: "none",
                      border: pkg.gold ? "none" : "1px solid rgba(255,255,255,0.12)",
                      background: pkg.gold ? "var(--gold)" : "transparent",
                      color: pkg.gold ? "#000" : "rgba(255,255,255,0.35)",
                      fontWeight: pkg.gold ? 700 : 400,
                    }}
                  >{ja ? "今すぐ契約する" : "Sign Contract"} →</Link>
                </div>
              );
            })}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* SECTION 3: Audience */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", marginBottom: 20, color: "#fff" }}>
            {ja ? "どんな人が来るの？" : "Who Attends?"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
            {OCCUPATIONS.map(o => (
              <div key={o.v} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5 }}>{o.l[lang]}</span>
                <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 16 }}>{o.v}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            {[
              { flag: "🇺🇸", label: "USA", pct: "55%" },
              { flag: "🇯🇵", label: "Japan", pct: "25%" },
              { flag: "🌏", label: ja ? "その他アジア" : "Other Asia", pct: "12%" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{r.flag}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, flex: 1 }}>{r.label}</span>
                <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 16 }}>{r.pct}</span>
              </div>
            ))}
          </div>

          <blockquote className="bq">
            {ja
              ? "参加者は単なる音楽ファンではなく、ライフスタイルをキュレーションする富裕層です。"
              : "Attendees aren't just music fans — they're affluent lifestyle curators."}
          </blockquote>
        </motion.section>

        <div className="gdivider" />

        {/* SECTION 4: CTA */}
        <motion.section {...fade} style={{ textAlign: "center", paddingBottom: 32 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,8vw,3.2rem)", color: "#fff", marginBottom: 14 }}>
            {ja ? "枠は限られています" : "Slots are limited"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.8, maxWidth: 420, margin: "0 auto 32px" }}>
            {ja
              ? "ラインナップ発表前にご契約いただくと、より有利な条件でご参加いただけます。"
              : "Signing before the lineup announcement gives you the best terms."}
          </p>
          <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contract?type=sponsor" className="btn-gold" style={{ boxShadow: "0 0 24px rgba(201,169,98,0.25)" }}>
              {ja ? "今すぐ契約する" : "Sign Contract Now"} →
            </Link>
            <Link href="/investor" className="btn-ghost">
              {ja ? "投資家資料を見る" : "View Investor Deck"} →
            </Link>
          </div>
        </motion.section>

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {ja
            ? "© 2026 ZAMNA HAWAII · Powered by SOLUNA · 本資料は機密情報です · 無断転用禁止"
            : "© 2026 ZAMNA HAWAII · Powered by SOLUNA · Confidential · All rights reserved"}
        </p>
      </footer>
    </main>
  );
}
