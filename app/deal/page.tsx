"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { downloadPDF } from "@/lib/pdf";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

export default function DealPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  return (
    <main id="pdf-content" style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      {/* Print header */}
      <div className="print-header">
        <p className="font-display" style={{ color: "#111", fontSize: 18, letterSpacing: "0.1em" }}>
          SOLUNA FEST HAWAII 2026 · {ja ? "ディールサマリー · 機密" : "Deal Summary · Confidential"}
        </p>
      </div>

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link href="/" className="font-display text-sm" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textDecoration: "none" }}>
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/sponsor" className="nav-pill">{ja ? "スポンサー" : "Sponsor"}</Link>
          <Link href="/investor" className="nav-pill">{ja ? "投資家" : "Investor"}</Link>
          <span className="nav-pill-active">{ja ? "ディール" : "Deal"}</span>
          <Link href="/contract" className="nav-pill">{ja ? "契約" : "Contract"}</Link>
          <button onClick={toggleLang}
            style={{
              marginLeft: 8, padding: "5px 10px",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999,
              fontSize: 10, letterSpacing: "0.08em", cursor: "pointer",
              background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600,
            }}
          >{ja ? "EN" : "JA"}</button>
          <button
            onClick={async () => { setIsGenerating(true); await downloadPDF("pdf-content", `zamna-hawaii-2026-deal-${lang}.pdf`); setIsGenerating(false); }}
            disabled={isGenerating}
            style={{
              padding: "5px 12px", border: "1px solid rgba(201,169,98,0.35)", borderRadius: 999,
              fontSize: 10, letterSpacing: "0.08em", cursor: isGenerating ? "default" : "pointer",
              background: "transparent", color: isGenerating ? "rgba(201,169,98,0.3)" : "rgba(201,169,98,0.6)",
              transition: "color 0.2s",
            }}
          >{isGenerating ? (ja ? "生成中…" : "Building…") : "PDF ↓"}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}
          style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20, textTransform: "uppercase" }}>
            SOLUNA FEST HAWAII 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.8rem,10vw,5.5rem)", lineHeight: 1, marginBottom: 20, color: "#fff" }}>
            {ja ? "ディールの全体像" : "The Deal, Simply Explained"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 18 }} />
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8 }}>
            {ja
              ? "難しい言葉は使いません。1ページで全部わかります。"
              : "No jargon. Everything you need to know on one page."}
          </p>
        </motion.div>

        {/* ── Section 1: この話を3行で ── */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", marginBottom: 20, color: "#fff" }}>
            {ja ? "この話を3行で" : "The Deal in 3 Lines"}
          </h2>

          <div className="card-gold" style={{ padding: "28px 28px", marginBottom: 20 }}>
            {[
              {
                n: "1",
                ja: <><strong style={{ color: "var(--gold)" }}>$200,000（約3,000万円）</strong> の創設パートナーとして参加する</>,
                en: <>Join as a <strong style={{ color: "var(--gold)" }}>$200,000 founding partner</strong></>,
              },
              {
                n: "2",
                ja: <>チケット収益が$200,000になった時点で、<strong style={{ color: "rgba(74,222,128,0.9)" }}>まず最初に全額お返しします</strong></>,
                en: <>Once ticket revenue hits $200,000, we <strong style={{ color: "rgba(74,222,128,0.9)" }}>pay you back first — in full</strong></>,
              },
              {
                n: "3",
                ja: <><strong style={{ color: "#fff" }}>さらに、利息か収益の一部をプラスでお渡しします</strong></>,
                en: <><strong style={{ color: "#fff" }}>Plus, you receive interest or a share of profits on top</strong></>,
              },
            ].map((item) => (
              <div key={item.n} style={{ display: "flex", gap: 18, marginBottom: 20 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(201,169,98,0.15)", border: "1px solid rgba(201,169,98,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--gold)", fontSize: 14, fontWeight: 700,
                }}>{item.n}</div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.7, paddingTop: 4 }}>
                  {ja ? item.ja : item.en}
                </p>
              </div>
            ))}
          </div>

          {/* 4 big number cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {[
              { value: "$200,000", label: ja ? "お借りしたい金額" : "Amount needed", color: "var(--gold)" },
              { value: "First", label: ja ? "返済の順番（最優先）" : "Repayment priority", color: "#fff" },
              { value: "$550,000+", label: ja ? "最低収益見込み" : "Min. expected revenue", color: "rgba(74,222,128,0.9)" },
              { value: "Sep 4, 2026", label: ja ? "イベント当日" : "Event date", color: "#fff" },
            ].map((card) => (
              <div key={card.label} className="card" style={{ padding: "22px 20px" }}>
                <p className="kpi-value" style={{ color: card.color, fontSize: "clamp(1.4rem,5vw,2.2rem)", marginBottom: 6 }}>
                  {card.value}
                </p>
                <p className="kpi-label">{card.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ── Section 2: お金の動き ── */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", marginBottom: 20, color: "#fff" }}>
            {ja ? "お金の動き" : "Follow the Money"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Box A */}
            <div className="card" style={{ padding: "20px 22px", opacity: 0.7, borderRadius: "14px 14px 0 0", borderBottom: "none" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {ja
                  ? "Vakas Investmentが約$780,000（約1.2億円）を出資済み"
                  : "Vakas Investment has already committed ~$780,000 (~¥117M)"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.65 }}>
                {ja
                  ? "会場・設備・スタッフ・宣伝費がすべてカバー済み"
                  : "Venue, production, staff, marketing — all covered"}
              </p>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: "center", padding: "8px 0", background: "rgba(255,255,255,0.02)", color: "rgba(201,169,98,0.6)", fontSize: 22, border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderBottom: "none" }}>
              ＋
            </div>

            {/* Box B */}
            <div className="card-gold" style={{ padding: "22px 24px", borderRadius: 0 }}>
              <p style={{ color: "var(--gold)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                {ja ? "あなたが$200,000を出す" : "You invest $200,000"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.65 }}>
                {ja
                  ? "この資金だけがまだ足りていません。100%アーティストの出演料に使います。"
                  : "This is the only missing piece. 100% goes to artist fees."}
              </p>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: "center", padding: "8px 0", background: "rgba(255,255,255,0.02)", color: "rgba(201,169,98,0.6)", fontSize: 22, border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderBottom: "none" }}>
              ↓
            </div>

            {/* Box C */}
            <div className="card" style={{ padding: "20px 22px", borderRadius: 0, background: "rgba(74,222,128,0.05)", borderColor: "rgba(74,222,128,0.2)" }}>
              <p style={{ color: "rgba(74,222,128,0.9)", fontSize: 14, fontWeight: 600 }}>
                {ja
                  ? "チケット収益 → まずあなたへ全額返済"
                  : "Ticket revenue → You get paid back first"}
              </p>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: "center", padding: "8px 0", background: "rgba(255,255,255,0.02)", color: "rgba(201,169,98,0.6)", fontSize: 22, border: "1px solid rgba(255,255,255,0.06)", borderTop: "none", borderBottom: "none" }}>
              ↓
            </div>

            {/* Box D */}
            <div className="card" style={{ padding: "20px 22px", borderRadius: "0 0 14px 14px", borderTop: "none" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                {ja
                  ? "余剰収益は追加リターンとして分配"
                  : "Surplus distributed as additional return"}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ── Section 3: いくら戻ってくるの？ ── */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", marginBottom: 20, color: "#fff" }}>
            {ja ? "いくら戻ってくるの？" : "What's My Return?"}
          </h2>

          <div className="data-table" style={{ marginBottom: 16 }}>
            {/* Header */}
            <div className="data-row" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="data-row-label" style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}></span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, flex: 1 }}>
                {[
                  ja ? "最悪の場合" : "Worst Case",
                  ja ? "普通の場合" : "Base Case",
                  ja ? "最高の場合" : "Best Case",
                ].map((h) => (
                  <span key={h} style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", fontWeight: 600 }}>{h}</span>
                ))}
              </div>
            </div>

            {/* Rows */}
            {[
              {
                label: ja ? "来場者" : "Attendance",
                vals: ["~1,500人", "~3,000人", "~5,000人"],
                color: "rgba(255,255,255,0.6)",
              },
              {
                label: ja ? "チケット収益" : "Revenue",
                vals: ["$550K", "$1.03M", "$2.04M"],
                color: "rgba(255,255,255,0.8)",
              },
              {
                label: ja ? "あなたへの返済" : "Repaid to you",
                vals: ["✓ $200K", "✓ $200K", "✓ $200K"],
                color: "rgba(74,222,128,0.9)",
              },
              {
                label: ja ? "追加リターン例（B案）" : "Extra return (Option B)",
                vals: ["+$70K", "+$166K", "+$368K"],
                color: "var(--gold)",
                gold: true,
              },
            ].map((row, i) => (
              <div key={row.label} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label" style={{ fontSize: 13 }}>{row.label}</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, flex: 1 }}>
                  {row.vals.map((v, vi) => (
                    <span key={vi} style={{
                      textAlign: "center", fontSize: 13,
                      fontWeight: row.gold ? 700 : 500,
                      color: row.color,
                    }}>{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "16px 20px" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.75 }}>
              {ja
                ? "最悪のケースでも、チケット50%しか売れなくても、返済できる収益は確保されます。"
                : "Even in the worst case — only 50% of tickets sold — revenue is sufficient for repayment."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ── Section 4: 次のステップ ── */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", marginBottom: 20, color: "#fff" }}>
            {ja ? "次のステップ" : "Next Steps"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 24 }}>
            {[
              {
                n: "1",
                ja_t: "NDA（秘密保持契約）を結ぶ",
                en_t: "Sign NDA",
                ja_d: "詳細な資料をお送りします",
                en_d: "We share full details",
              },
              {
                n: "2",
                ja_t: "詳細を確認する",
                en_t: "Review details",
                ja_d: "財務資料・契約書ドラフトをご確認いただけます",
                en_d: "Review financials and draft contract",
              },
              {
                n: "3",
                ja_t: "条件を決める",
                en_t: "Agree on terms",
                ja_d: "利息か収益分配か、ご希望に合わせて設計します",
                en_d: "Choose interest or revenue share",
              },
              {
                n: "4",
                ja_t: "契約書にサイン",
                en_t: "Sign contract",
                ja_d: "日本語・英語両方の契約書を用意します",
                en_d: "Available in both Japanese and English",
              },
              {
                n: "5",
                ja_t: "$200,000を送金",
                en_t: "Transfer funds",
                ja_d: "専用口座に振り込み後、アーティストブッキング開始",
                en_d: "Artist booking starts immediately",
              },
            ].map((step, i) => (
              <div key={step.n} style={{
                display: "flex", gap: 16,
                border: "1px solid rgba(255,255,255,0.07)",
                borderTop: i > 0 ? "none" : undefined,
                borderRadius: i === 0 ? "14px 14px 0 0" : i === 4 ? "0 0 14px 14px" : 0,
                padding: "16px 20px",
                background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(201,169,98,0.12)", border: "1px solid rgba(201,169,98,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--gold)", fontSize: 12, fontWeight: 700,
                }}>{step.n}</div>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
                    {ja ? step.ja_t : step.en_t}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.65 }}>
                    {ja ? step.ja_d : step.en_d}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact card */}
          <div className="card-gold" style={{ padding: "28px 28px", textAlign: "center" }}>
            <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 14 }}>
              {ja ? "まず話を聞いてみたい方へ" : "Ready to learn more?"}
            </p>
            <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/contract?type=nda" className="btn-gold">
                {ja ? "まずNDAを結ぶ" : "Sign NDA First"} →
              </Link>
              <Link href="/contract?type=investment" className="btn-ghost">
                {ja ? "投資契約を結ぶ" : "Sign Investment Contract"} →
              </Link>
            </div>
          </div>
        </motion.section>

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {ja
            ? "© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · 機密情報 · 無断転用禁止"
            : "© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · Confidential · All rights reserved"}
        </p>
      </footer>
    </main>
  );
}
