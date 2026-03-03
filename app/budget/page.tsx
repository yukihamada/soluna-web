"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";
import { downloadPDF } from "@/lib/pdf";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const REVENUE = [
  { ja: "GA Day 1 チケット ($120 × 2,500)", en: "GA Day 1 Tickets ($120 × 2,500)", amount: 300000 },
  { ja: "GA Day 2 チケット ($180 × 2,500)", en: "GA Day 2 Tickets ($180 × 2,500)", amount: 450000 },
  { ja: "Gold VIP ($1,000 × 100)", en: "Gold VIP ($1,000 × 100)", amount: 100000 },
  { ja: "Platinum VIP ($2,000 × 50)", en: "Platinum VIP ($2,000 × 50)", amount: 100000 },
  { ja: "Diamond VIP ($3,000 × 10)", en: "Diamond VIP ($3,000 × 10)", amount: 30000 },
  { ja: "スポンサーシップ", en: "Sponsorships", amount: 170000 },
  { ja: "飲食売上 (会場内)", en: "F&B Sales (on-site)", amount: 80000 },
  { ja: "駐車場収入", en: "Parking Revenue", amount: 12000 },
];

const EXPENSES = [
  { ja: "アーティスト出演料・渡航費", en: "Artist Fees & Travel", amount: 200000, cat: "talent" },
  { ja: "会場使用料（モアナルアガーデン）", en: "Venue Rental (Moanalua Gardens)", amount: 80000, cat: "venue" },
  { ja: "音響・照明・映像（機材+オペレーター）", en: "Sound / Lighting / Video (gear + ops)", amount: 120000, cat: "production" },
  { ja: "ステージ設営・撤収", en: "Stage Build & Teardown", amount: 60000, cat: "production" },
  { ja: "セキュリティ（外部委託）", en: "Security (outsourced)", amount: 45000, cat: "ops" },
  { ja: "シャトルバス（Roberts Hawaii）", en: "Shuttle Bus (Roberts Hawaii)", amount: 25000, cat: "ops" },
  { ja: "飲食ケータリング・バー在庫", en: "Catering & Bar Inventory", amount: 40000, cat: "ops" },
  { ja: "スタッフ人件費（80–110名 × 2日）", en: "Staff Wages (80–110 × 2 days)", amount: 35000, cat: "ops" },
  { ja: "マーケティング・広告", en: "Marketing & Ads", amount: 50000, cat: "marketing" },
  { ja: "保険（一般賠償+キャンセル）", en: "Insurance (GL + Cancellation)", amount: 20000, cat: "legal" },
  { ja: "許認可・法務", en: "Permits & Legal", amount: 15000, cat: "legal" },
  { ja: "チケットプラットフォーム手数料", en: "Ticketing Platform Fees", amount: 25000, cat: "ops" },
  { ja: "ホテル在庫確保（アーティスト+VIP）", en: "Hotel Block (Artists + VIP)", amount: 30000, cat: "ops" },
  { ja: "電源・インフラ（発電機等）", en: "Power & Infrastructure", amount: 20000, cat: "production" },
  { ja: "デザイン・サイネージ・印刷", en: "Design, Signage, Print", amount: 10000, cat: "marketing" },
  { ja: "予備費（10%）", en: "Contingency (10%)", amount: 77500, cat: "contingency" },
];

type Scenario = { label_ja: string; label_en: string; capacity: number; color: string };
const SCENARIOS: Scenario[] = [
  { label_ja: "悲観（50%）", label_en: "Worst (50%)", capacity: 0.5, color: "rgba(255,80,80,0.8)" },
  { label_ja: "基本（70%）", label_en: "Base (70%)", capacity: 0.7, color: "rgba(201,169,98,0.9)" },
  { label_ja: "楽観（90%）", label_en: "Best (90%)", capacity: 0.9, color: "rgba(74,222,128,0.9)" },
];

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

export default function BudgetPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  const totalRevenue = REVENUE.reduce((s, r) => s + r.amount, 0);
  const totalExpense = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  // Ticket-only revenue for scenarios (first 5 items)
  const ticketRevenue = REVENUE.slice(0, 5).reduce((s, r) => s + r.amount, 0);
  const nonTicketRevenue = totalRevenue - ticketRevenue;

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          ZAMNA HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/admin" className="nav-pill">Admin</Link>
          <Link href="/production" className="nav-pill">{ja ? "制作" : "Production"}</Link>
          <span className="nav-pill-active">{ja ? "収支計画" : "Budget"}</span>
          <button onClick={() => downloadPDF("pdf-content", "ZAMNA-Budget.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Budget & P&L · Confidential
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.5rem,10vw,4.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            {ja ? "収支計画書" : "BUDGET"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
        </motion.div>

        {/* KPI Summary */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {[
              { label: ja ? "総収入（Base）" : "Total Revenue (Base)", value: fmt(totalRevenue), color: "rgba(74,222,128,0.9)" },
              { label: ja ? "総支出" : "Total Expenses", value: fmt(totalExpense), color: "rgba(255,80,80,0.8)" },
              { label: ja ? "純利益（Base）" : "Net Profit (Base)", value: fmt(netProfit), color: netProfit >= 0 ? "rgba(74,222,128,0.9)" : "rgba(255,80,80,0.8)" },
              { label: ja ? "損益分岐点" : "Break-even", value: fmt(totalExpense), color: "rgba(201,169,98,0.9)" },
            ].map(k => (
              <div key={k.label} className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: k.color, marginBottom: 4 }}>{k.value}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{k.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Revenue */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "収入内訳（Base Case 70%動員）" : "Revenue Breakdown (Base 70% capacity)"}
          </h2>
          <div className="data-table">
            {REVENUE.map((r, i) => (
              <div key={r.en} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{ja ? r.ja : r.en}</span>
                <span className="data-row-value" style={{ color: "rgba(74,222,128,0.8)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(r.amount)}</span>
              </div>
            ))}
            <div className="data-row" style={{ background: "rgba(74,222,128,0.08)", fontWeight: 700 }}>
              <span className="data-row-label" style={{ color: "#fff" }}>{ja ? "収入合計" : "Total Revenue"}</span>
              <span className="data-row-value" style={{ color: "rgba(74,222,128,0.9)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(totalRevenue)}</span>
            </div>
          </div>
        </motion.section>

        {/* Expenses */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "支出内訳" : "Expense Breakdown"}
          </h2>
          <div className="data-table">
            {EXPENSES.map((e, i) => (
              <div key={e.en} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{ja ? e.ja : e.en}</span>
                <span className="data-row-value" style={{ color: "rgba(255,80,80,0.7)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(e.amount)}</span>
              </div>
            ))}
            <div className="data-row" style={{ background: "rgba(255,80,80,0.08)", fontWeight: 700 }}>
              <span className="data-row-label" style={{ color: "#fff" }}>{ja ? "支出合計" : "Total Expenses"}</span>
              <span className="data-row-value" style={{ color: "rgba(255,80,80,0.8)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(totalExpense)}</span>
            </div>
          </div>
        </motion.section>

        {/* Scenarios */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "シナリオ分析" : "Scenario Analysis"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {SCENARIOS.map(sc => {
              const scenarioTicket = Math.round(ticketRevenue * sc.capacity);
              const scenarioTotal = scenarioTicket + nonTicketRevenue;
              const scenarioNet = scenarioTotal - totalExpense;
              return (
                <div key={sc.label_en} className="card" style={{ padding: "24px 20px", borderColor: sc.color + "33" }}>
                  <p style={{ color: sc.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
                    {ja ? sc.label_ja : sc.label_en}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>{ja ? "チケット収入" : "Ticket Revenue"}</p>
                  <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>{fmt(scenarioTicket)}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>{ja ? "総収入" : "Total Revenue"}</p>
                  <p style={{ color: "#fff", fontSize: 16, fontWeight: 600, marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>{fmt(scenarioTotal)}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>{ja ? "純利益" : "Net Profit"}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: scenarioNet >= 0 ? "rgba(74,222,128,0.9)" : "rgba(255,80,80,0.9)", fontVariantNumeric: "tabular-nums" }}>
                    {scenarioNet >= 0 ? "+" : ""}{fmt(scenarioNet)}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Funding Sources */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "資金調達状況" : "Funding Status"}
          </h2>
          <div className="data-table">
            {[
              { ja: "Vakas Investment（会場・制作・スタッフ・宣伝）", en: "Vakas Investment (venue, production, staff, marketing)", amount: "$780,000", status: ja ? "確約済み" : "Committed", color: "rgba(74,222,128,0.9)" },
              { ja: "創設パートナー出資（アーティスト費用）", en: "Founding Partner Investment (artist fees)", amount: "$200,000", status: ja ? "調達中" : "Raising", color: "rgba(255,80,80,0.9)" },
              { ja: "スポンサーシップ収入", en: "Sponsorship Revenue", amount: "$170,000", status: ja ? "営業中" : "In Progress", color: "rgba(201,169,98,0.9)" },
            ].map((f, i) => (
              <div key={f.en} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label" style={{ flex: 2 }}>{ja ? f.ja : f.en}</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums", minWidth: 80, textAlign: "right" }}>{f.amount}</span>
                <span style={{ color: f.color, fontSize: 11, minWidth: 80, textAlign: "right", fontWeight: 600 }}>{f.status}</span>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
      <InnerFooter lang={lang} />
    </main>
  );
}
