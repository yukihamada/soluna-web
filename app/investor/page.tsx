"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { downloadPDF } from "@/lib/pdf";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
  viewport: { once: true },
};

export default function InvestorPage() {
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
        <p className="font-display" style={{ color: "#111", fontSize: 18, letterSpacing: "0.2em" }}>ZAMNA HAWAII 2026</p>
        <p style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
          {ja ? "投資家資料 · 機密" : "Investor Deck · Confidential"}
        </p>
      </div>

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          ZAMNA HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/sponsor" className="nav-pill">{ja ? "スポンサー" : "Sponsor"}</Link>
          <span className="nav-pill-active">{ja ? "投資家" : "Investor"}</span>
          <Link href="/deal" className="nav-pill">{ja ? "ディール" : "Deal"}</Link>
          <Link href="/contract" className="nav-pill">{ja ? "契約" : "Contract"}</Link>
          <button onClick={toggleLang}
            style={{
              marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999, fontSize: 10, letterSpacing: "0.08em", cursor: "pointer",
              background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600,
            }}
          >
            {ja ? "EN" : "JA"}
          </button>
          <button
            onClick={async () => { setIsGenerating(true); await downloadPDF("pdf-content", `zamna-hawaii-2026-investor-${lang}.pdf`); setIsGenerating(false); }}
            disabled={isGenerating}
            style={{
              padding: "5px 12px", border: "1px solid rgba(201,169,98,0.35)",
              borderRadius: 999, fontSize: 10, letterSpacing: "0.08em", cursor: isGenerating ? "default" : "pointer",
              background: "transparent", color: isGenerating ? "rgba(201,169,98,0.3)" : "rgba(201,169,98,0.6)",
              transition: "color 0.2s",
            }}
          >
            {isGenerating ? (ja ? "生成中…" : "Building…") : "PDF ↓"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 80 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 24, textTransform: "uppercase" }}>
            Investor · Confidential · 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.8rem,11vw,5.5rem)", lineHeight: 1, color: "#fff", marginBottom: 16 }}>
            ZAMNA HAWAII 2026
          </h1>
          <p className="font-display" style={{ fontSize: "clamp(1.6rem,6vw,2.8rem)", color: "var(--gold)", marginBottom: 20 }}>
            {ja ? "創設パートナー $200,000" : "Founding Partner · $200,000"}
          </p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 16 }}>
            {ja
              ? "チケットが売れたら、まず最初に全額お返しします。"
              : "When tickets sell, you get paid back first — in full."}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            {ja ? "2026年9月4日 · ハワイ · オアフ島" : "Sep 4, 2026 · Oahu, Hawaii"}
          </p>
        </motion.div>

        <div className="gdivider" />

        {/* ── SECTION 1: How It Works ── */}
        <motion.section {...fade} style={{ marginBottom: 0 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "お金の流れ" : "How It Works"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 28 }}>
            {ja ? "3つのステップで完結します。" : "Three simple steps."}
          </p>

          {/* Step 1 */}
          <div className="card-gold" style={{ marginBottom: 12 }}>
            <p style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Step 1</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {ja ? "あなたが $200,000 を出す" : "You invest $200,000"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7 }}>
              {ja
                ? "約3,000万円。アーティストの出演料に使います。他には使いません。"
                : "~¥30M. Used for artist booking fees. Nothing else."}
            </p>
          </div>

          <div style={{ textAlign: "center", padding: "8px 0", color: "rgba(255,255,255,0.2)", fontSize: 20 }}>↓</div>

          {/* Step 2 */}
          <div className="card" style={{ marginBottom: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Step 2</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {ja ? "チケットが売れていく" : "Tickets sell"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
              {ja
                ? "チケット収益が $200,000 に達した瞬間、あなたへの返済が始まります。"
                : "The moment ticket revenue hits $200,000, your repayment begins."}
            </p>
          </div>

          <div style={{ textAlign: "center", padding: "8px 0", color: "rgba(255,255,255,0.2)", fontSize: 20 }}>↓</div>

          {/* Step 3 */}
          <div className="card" style={{ borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.04)" }}>
            <p style={{ color: "rgba(74,222,128,0.7)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Step 3</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
              {ja ? "あなたに最初に返済される" : "You get paid back first"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
              {ja
                ? "他の費用より先に、あなたへの全額返済が最優先です。"
                : "Before any other costs, your full repayment takes priority."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ── SECTION 2: Returns ── */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "どのくらい儲かるの？" : "What's the Return?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 28 }}>
            {ja ? "基本シナリオ（目標70%達成）での試算です。" : "Based on the base scenario (70% of target)."}
          </p>

          {/* Two KPI boxes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 12 }}>
                {ja ? "返ってくるお金（最低限）" : "Minimum Return"}
              </p>
              <p className="kpi-value" style={{ fontSize: "2rem" }}>$200,000</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8 }}>
                {ja ? "出した分はそのまま戻ります" : "Your full investment returned"}
              </p>
            </div>
            <div className="card-gold" style={{ textAlign: "center" }}>
              <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, marginBottom: 12 }}>
                {ja ? "追加で受け取れる分（交渉次第）" : "Additional Return (negotiable)"}
              </p>
              <p className="kpi-value" style={{ fontSize: "2rem", color: "var(--gold)" }}>+$166,000</p>
              <p style={{ color: "rgba(201,169,98,0.5)", fontSize: 12, marginTop: 8 }}>
                {ja ? "余剰収益の20%分配の場合" : "20% of surplus, base scenario"}
              </p>
            </div>
          </div>

          {/* 3 return options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {[
              {
                label: "A",
                ja: "固定利息 10〜15%",
                en: "Fixed interest 10–15%",
                sub_ja: "毎年決まった利息を受け取る方法",
                sub_en: "Receive a fixed annual interest rate",
              },
              {
                label: "B",
                ja: "収益の20%をシェア",
                en: "20% revenue share",
                sub_ja: "イベントが盛況なほど多く受け取れる方法",
                sub_en: "The more successful the event, the more you earn",
              },
              {
                label: "C",
                ja: "スポンサー権 + 次回優先",
                en: "Sponsorship rights + next event priority",
                sub_ja: "ブランド露出と次回イベントへの優先参加権",
                sub_en: "Brand exposure plus first-right on the next event",
              },
            ].map((opt) => (
              <div key={opt.label} className="card" style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 16, flexShrink: 0, minWidth: 20 }}>{opt.label}</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                    {ja ? opt.ja : opt.en}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, lineHeight: 1.6 }}>
                    {ja ? opt.sub_ja : opt.sub_en}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" }}>
            {ja ? "どれを選ぶかは、話し合いで決めます。" : "We'll decide together which works best for you."}
          </p>
        </motion.section>

        <div className="gdivider" />

        {/* ── SECTION 3: Risks ── */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "リスクについて正直に" : "Honest About Risks"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 28 }}>
            {ja ? "隠すことはありません。全部お伝えします。" : "No hiding. Here's everything."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Risk 1 — green */}
            <div className="card" style={{ borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.04)" }}>
              <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                {ja ? "低リスク" : "Low Risk"}
              </p>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                {ja ? "チケットが50%しか売れなかったら？" : "What if only 50% of tickets sell?"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>
                {ja
                  ? "それでも収益は約$550,000。あなたへの$200,000返済は十分可能です。"
                  : "Revenue still ~$550,000. Your $200K is fully repayable."}
              </p>
            </div>

            {/* Risk 2 — yellow */}
            <div className="card" style={{ borderColor: "rgba(250,204,21,0.2)", background: "rgba(250,204,21,0.03)" }}>
              <p style={{ color: "rgba(250,204,21,0.7)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                {ja ? "中リスク" : "Medium Risk"}
              </p>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                {ja ? "イベントが中止になったら？" : "What if the event is cancelled?"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>
                {ja
                  ? "イベント保険に加入します。保険金から優先的に返済します。"
                  : "We carry event cancellation insurance. Repayment from insurance proceeds first."}
              </p>
            </div>

            {/* Risk 3 — green */}
            <div className="card" style={{ borderColor: "rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.04)" }}>
              <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                {ja ? "低リスク" : "Low Risk"}
              </p>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                {ja ? "他の費用に使われる心配は？" : "Will funds be used for other things?"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>
                {ja
                  ? "資金は専用口座で管理します。アーティスト費以外には使いません。"
                  : "Held in a dedicated escrow account. Artist fees only."}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ── SECTION 4: CTA ── */}
        <motion.section {...fade} style={{ textAlign: "center", paddingBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,7vw,3rem)", color: "#fff", marginBottom: 16 }}>
            {ja ? "まず30分、話を聞いてください" : "Give us 30 minutes"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.75, marginBottom: 36, maxWidth: 460, margin: "0 auto 36px" }}>
            {ja
              ? "難しい話はありません。わかるまで何でも聞いてください。"
              : "No complicated stuff. Ask anything until you understand."}
          </p>
          <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contract?type=investment" className="btn-gold">
              {ja ? "今すぐ投資契約を結ぶ" : "Sign Investment Contract"} →
            </Link>
            <Link href="/deal" className="btn-ghost">
              {ja ? "ディールサマリーを見る" : "View Deal Summary"}
            </Link>
          </div>
        </motion.section>

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {ja
            ? "© 2026 ZAMNA HAWAII · Powered by SOLUNA · 本資料は機密情報です"
            : "© 2026 ZAMNA HAWAII · Powered by SOLUNA · Confidential"}
        </p>
      </footer>
    </main>
  );
}
