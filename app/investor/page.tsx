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

export default function InvestorPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  const daysLeft = Math.ceil((new Date("2026-09-04").getTime() - Date.now()) / 86400000);

  return (
    <main id="pdf-content" style={{ background: "#080808", position: "relative", overflowX: "hidden" }}>
      <div className="atmo" />
      <div className="print-header">
        <p className="font-display" style={{ color: "#111", fontSize: 18, letterSpacing: "0.2em" }}>ZAMNA HAWAII 2026</p>
        <p style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{ja ? "投資家資料 · 機密" : "Investor Deck · Confidential"}</p>
      </div>

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>ZAMNA HAWAII</Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span className="nav-pill-active">{ja ? "投資家" : "Investor"}</span>
          <Link href="/deal" className="nav-pill">{ja ? "ディール" : "Deal"}</Link>
          <Link href="/contract" className="nav-pill">{ja ? "契約" : "Contract"}</Link>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{ja ? "EN" : "JA"}</button>
          <button onClick={async () => { setIsGenerating(true); await downloadPDF("pdf-content", `zamna-hawaii-2026-investor-${lang}.pdf`); setIsGenerating(false); }} disabled={isGenerating} style={{ padding: "5px 12px", border: "1px solid rgba(201,169,98,0.35)", borderRadius: 999, fontSize: 10, cursor: isGenerating ? "default" : "pointer", background: "transparent", color: isGenerating ? "rgba(201,169,98,0.3)" : "rgba(201,169,98,0.6)" }}>{isGenerating ? "..." : "PDF ↓"}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 20px", position: "relative", zIndex: 1 }}>

        {/* ══════ HERO ══════ */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20, textTransform: "uppercase" }}>Founding Partner · Confidential · 2026</p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,9vw,4.5rem)", lineHeight: 1, color: "#fff", marginBottom: 16 }}>ZAMNA HAWAII</h1>
          <p style={{ fontSize: "clamp(1.2rem,4vw,1.8rem)", color: "var(--gold)", fontWeight: 700, marginBottom: 20 }}>
            {ja ? "創設パートナー募集 — $200,000" : "Founding Partner — $200,000"}
          </p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 12 }}>
            {ja
              ? "世界最大級のアンダーグラウンド・エレクトロニックミュージックフェスティバル「ZAMNA」が、2026年9月、ハワイ・オアフ島に初上陸。その創設パートナーとして参加しませんか？"
              : "ZAMNA — one of the world's premier underground electronic music festivals — lands in Oahu, Hawaii for the first time in September 2026. Join as a founding partner."}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            {ja ? `開催まであと${daysLeft}日 · 2026年9月4-5日 · オアフ島` : `${daysLeft} days to event · Sep 4-5, 2026 · Oahu, HI`}
          </p>
        </motion.div>

        <div className="gdivider" />

        {/* ══════ ZAMNAとは ══════ */}
        <motion.section {...fade} style={{ marginBottom: 0 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "ZAMNAとは？" : "What is ZAMNA?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "数字が信頼性を証明します。" : "The numbers speak for themselves."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
            {[
              { v: "850,000+", l: ja ? "累計来場者数" : "Total attendees", c: "var(--gold)" },
              { v: "1.25M", l: ja ? "SNSフォロワー" : "Social followers", c: "#fff" },
              { v: "8", l: ja ? "開催国" : "Countries", c: "#fff" },
              { v: "2014〜", l: ja ? "創設年" : "Founded", c: "rgba(201,169,98,0.7)" },
            ].map(k => (
              <div key={k.l} className="card" style={{ textAlign: "center", padding: "18px 14px" }}>
                <p className="font-display" style={{ color: k.c, fontSize: "clamp(1.2rem,4vw,1.6rem)", marginBottom: 4 }}>{k.v}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{k.l}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "20px 22px", marginBottom: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8 }}>
              {ja
                ? "ZAMNAはスペイン・トゥルム（メキシコ）を拠点に、アルゼンチン、ブラジル、コロンビア、エジプト、ギリシャ、ドバイなど世界各地で開催されてきた実績あるフェスティバルブランドです。自然の中で行われる圧倒的な演出と、世界トップクラスのDJラインナップが特徴です。"
                : "ZAMNA is an established festival brand based in Tulum, Mexico, with events across Argentina, Brazil, Colombia, Egypt, Greece, Dubai, and more. Known for stunning natural venues and world-class DJ lineups."}
            </p>
          </div>

          <div className="card" style={{ padding: "20px 22px" }}>
            <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 8 }}>{ja ? "ハワイ開催の強み" : "WHY HAWAII"}</p>
            <ul style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 2, paddingLeft: 18 }}>
              <li>{ja ? "北米・アジア両方からアクセスしやすい太平洋の中心" : "Pacific hub — accessible from both North America and Asia"}</li>
              <li>{ja ? "Labor Day週末（9月4-5日）= 米国全土から集客可能" : "Labor Day weekend (Sep 4-5) = nationwide US draw"}</li>
              <li>{ja ? "ハワイには大規模EDMフェスが存在しない = 市場空白" : "No major EDM festival exists in Hawaii = untapped market"}</li>
              <li>{ja ? "日本・韓国・オーストラリアからの観光需要が高い" : "Strong tourism demand from Japan, Korea, Australia"}</li>
            </ul>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 会場 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "会場: Moanalua Gardens" : "Venue: Moanalua Gardens"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "オアフ島の歴史ある庭園。日立のCMで世界的に有名な「この木なんの木」の場所。" : "Historic gardens in Oahu. Home to the world-famous Hitachi Tree."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { v: "9,000", l: ja ? "1日あたりキャパ" : "Daily capacity" },
              { v: "$4K/$8K", l: ja ? "レンタル（非公演/公演日）" : "Rental (non-show/show)" },
              { v: "100%", l: ja ? "F&B収益確保" : "F&B revenue kept" },
              { v: "12min", l: ja ? "ワイキキから車" : "From Waikiki" },
            ].map(k => (
              <div key={k.l} className="card" style={{ textAlign: "center", padding: "14px 10px" }}>
                <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{k.v}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{k.l}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "16px 20px" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.8 }}>
              {ja
                ? "会場オーナーJP Damonは長期的なEDMイベント開発に全面的に賛同。自然の景観を活かしたステージ設計でLED演出コストを削減。30台のフードトラック + 20の物販ブースで「Hawaiian Japanese Market」を展開予定。"
                : "Owner JP Damon fully supports long-term EDM development. Natural scenery reduces LED costs. 30 food trucks + 20 merch vendors as 'Hawaiian Japanese Market'."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 投資条件 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "投資条件" : "Investment Terms"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "シンプルな3ステップです。" : "Three simple steps."}
          </p>

          {/* Step 1 */}
          <div className="card-gold" style={{ marginBottom: 8 }}>
            <p style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 6 }}>STEP 1</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{ja ? "$200,000（約3,000万円）を出資" : "Invest $200,000"}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
              {ja ? "全額がアーティスト出演料に充当されます。専用エスクロー口座で管理。他の用途には一切使いません。" : "100% goes to artist booking fees. Held in a dedicated escrow account. Used for nothing else."}
            </p>
          </div>
          <div style={{ textAlign: "center", padding: "4px 0", color: "rgba(201,169,98,0.4)", fontSize: 18 }}>↓</div>

          {/* Step 2 */}
          <div className="card" style={{ marginBottom: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 6 }}>STEP 2</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{ja ? "チケットが売れる" : "Tickets sell"}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
              {ja ? "チケットはTicketbloxで販売中。既にヨーロッパからの購入あり。GA $120〜$180 / VIP $1,000〜。" : "Tickets live on Ticketblox. European purchases already confirmed. GA $120-$180 / VIP $1,000+."}
            </p>
          </div>
          <div style={{ textAlign: "center", padding: "4px 0", color: "rgba(201,169,98,0.4)", fontSize: 18 }}>↓</div>

          {/* Step 3 */}
          <div className="card" style={{ borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.04)" }}>
            <p style={{ color: "rgba(74,222,128,0.7)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 6 }}>STEP 3</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{ja ? "最優先で全額返済 + リターン" : "First-out repayment + return"}</p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7 }}>
              {ja ? "他の費用より先に、あなたへの$200,000全額返済が最優先。さらにリターンが上乗せされます。" : "Your $200,000 is repaid before any other costs. Plus you receive additional returns on top."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ リターン ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "リターンはいくら？" : "What's the Return?"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "3つの選択肢から選べます。" : "Choose from 3 options."}
          </p>

          {/* Return options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <div className="card-gold" style={{ padding: "22px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <p style={{ color: "var(--gold)", fontWeight: 700, fontSize: 15 }}>{ja ? "プランA: 固定利息" : "Plan A: Fixed Interest"}</p>
                <span style={{ background: "rgba(201,169,98,0.15)", color: "var(--gold)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{ja ? "安定型" : "STABLE"}</span>
              </div>
              <p style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>10〜15% / {ja ? "年" : "year"}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "投資額に対して年10〜15%の利息。$200,000 × 15% = 年$30,000（約450万円）。リスクを最小限に抑えたい方向け。" : "$200,000 × 15% = $30,000/year. Best for those who want predictable, low-risk returns."}
              </p>
            </div>

            <div className="card" style={{ padding: "22px 22px", borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <p style={{ color: "rgba(74,222,128,0.9)", fontWeight: 700, fontSize: 15 }}>{ja ? "プランB: 収益シェア" : "Plan B: Revenue Share"}</p>
                <span style={{ background: "rgba(74,222,128,0.1)", color: "rgba(74,222,128,0.9)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{ja ? "高リターン型" : "HIGH RETURN"}</span>
              </div>
              <p style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{ja ? "余剰収益の" : ""}20%</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "全額返済後の余剰収益から20%を受け取る。イベントが盛況なほど大きなリターン。基本シナリオで+$166,000（元本と合わせて$366,000回収）。" : "Receive 20% of surplus after full repayment. The more successful the event, the bigger your return. Base case: +$166,000 (total $366,000 back)."}
              </p>
            </div>

            <div className="card" style={{ padding: "22px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{ja ? "プランC: スポンサー権 + 次回優先" : "Plan C: Sponsorship + Priority"}</p>
                <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{ja ? "ブランド型" : "BRAND"}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "全額返済に加え、会場でのブランド露出（ステージ看板・VIPエリア冠名など）と、2027年開催への優先参加権を付与。法人・ブランドオーナー向け。" : "Full repayment plus on-site brand exposure (stage signage, VIP area naming) and first-right to invest in ZAMNA HAWAII 2027. For companies and brand owners."}
              </p>
            </div>
          </div>

          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" }}>
            {ja ? "※ どのプランでも元本$200,000の最優先返済は保証されます。プランは相談の上決定します。" : "* Full $200,000 first-out repayment guaranteed on all plans. Terms decided together."}
          </p>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 収益シミュレーション ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "収益シミュレーション" : "Revenue Scenarios"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "3つのシナリオで試算。最悪のケースでも返済可能。" : "Three scenarios. Repayment possible even in the worst case."}
          </p>

          <div className="data-table" style={{ marginBottom: 16 }}>
            <div className="data-table-head" style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 4 }}>
              <span></span>
              <span style={{ textAlign: "center" }}>{ja ? "最悪" : "Worst"}</span>
              <span style={{ textAlign: "center", color: "var(--gold)" }}>{ja ? "基本" : "Base"}</span>
              <span style={{ textAlign: "center" }}>{ja ? "最高" : "Best"}</span>
            </div>
            {[
              { l: ja ? "チケット販売率" : "Ticket sell-through", v: ["50%", "70%", "100%"] },
              { l: ja ? "1日あたり来場者" : "Daily attendance", v: ["~4,500", "~6,300", "~9,000"] },
              { l: ja ? "GA + VIP チケット収益" : "GA + VIP ticket revenue", v: ["$550K", "$1.03M", "$2.04M"] },
              { l: ja ? "スポンサー + F&B収益" : "Sponsor + F&B revenue", v: ["$100K", "$250K", "$500K"] },
              { l: ja ? "総収益" : "Total revenue", v: ["$650K", "$1.28M", "$2.54M"], bold: true },
              { l: ja ? "制作・運営コスト" : "Production & ops costs", v: ["$530K", "$530K", "$530K"] },
              { l: ja ? "ZAMNA手数料（ブッキング15%+利益7%）" : "ZAMNA fees (15% booking + 7% profit)", v: ["$42K", "$65K", "$120K"] },
              { l: ja ? "総コスト" : "Total costs", v: ["$572K", "$595K", "$650K"] },
              { l: ja ? "純利益" : "Net profit", v: ["$78K", "$685K", "$1.89M"], color: "rgba(74,222,128,0.9)" },
              { l: ja ? "あなたへの返済" : "Your repayment", v: ["✓ $200K", "✓ $200K", "✓ $200K"], color: "rgba(74,222,128,0.9)" },
              { l: ja ? "追加リターン（B案20%）" : "Extra return (Plan B 20%)", v: ["+$0*", "+$97K", "+$338K"], color: "var(--gold)", bold: true },
              { l: ja ? "合計回収額" : "Total received", v: ["$200K*", "$297K", "$538K"], color: "var(--gold)", bold: true },
            ].map((row, i) => (
              <div key={row.l} style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 4, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{row.l}</span>
                {row.v.map((val, vi) => (
                  <span key={vi} style={{ textAlign: "center", fontSize: 12, fontWeight: row.bold ? 700 : 400, color: row.color || (vi === 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)") }}>{val}</span>
                ))}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "16px 20px", borderColor: "rgba(74,222,128,0.15)", background: "rgba(74,222,128,0.03)" }}>
            <p style={{ color: "rgba(74,222,128,0.8)", fontSize: 13, lineHeight: 1.8 }}>
              {ja
                ? "💡 最悪のケース（チケット50%）でも、総収益$650Kに対しコスト$572K（ZAMNA手数料含む）で黒字。元本$200Kの返済は確保されます。*追加リターンは余剰次第。基本ケースではプランBで合計$297K回収。"
                : "💡 Even worst case (50% tickets), revenue $650K vs costs $572K (incl. ZAMNA fees) = profitable. $200K principal repayment secured. *Extra return depends on surplus. Base case with Plan B: $297K total."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ チケット・ホテルプラン ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "チケット & ホテルプラン" : "Ticket & Hotel Plans"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "複数の価格帯で幅広い層を獲得。ホテルパッケージで客単価を最大化。" : "Multiple tiers capture a wide audience. Hotel packages maximize per-customer revenue."}
          </p>

          {/* Ticket tiers */}
          <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 10 }}>{ja ? "チケット価格" : "TICKET PRICING"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 24 }}>
            {[
              { tier: "GA Day 1", price: "$120", desc: ja ? "9月4日（木）一般入場" : "Sep 4 (Thu) general admission" },
              { tier: "GA Day 2", price: "$180", desc: ja ? "9月5日（金）一般入場" : "Sep 5 (Fri) general admission" },
              { tier: "2-Day Pass", price: "$250", desc: ja ? "両日通し券（割引）" : "Both days (discounted)" },
              { tier: "VIP", price: "$1,000+", desc: ja ? "専用エリア・ドリンク付" : "Private area + drinks", gold: true },
              { tier: "Diamond VIP", price: "$3,000+", desc: ja ? "バックステージ・ホテル込" : "Backstage + hotel", gold: true },
              { tier: ja ? "テーブル席" : "Table", price: "$10K–$25K", desc: ja ? "5〜10名グループ" : "5-10 person group", gold: true },
            ].map(t => (
              <div key={t.tier} className={t.gold ? "card-gold" : "card"} style={{ padding: "14px 14px", textAlign: "center" }}>
                <p style={{ color: t.gold ? "var(--gold)" : "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.1em", marginBottom: 4 }}>{t.tier}</p>
                <p style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t.price}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Hotel packages */}
          <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 10 }}>{ja ? "ホテルパッケージ（検討中）" : "HOTEL PACKAGES (Under Development)"}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{ja ? "スタンダードパッケージ" : "Standard Package"}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "2-Day Pass + ホテル3泊（ワイキキエリア）+ 会場シャトル。日本・アジアからの観光客向け。NEWT × Aloha7（小寺 優紀氏）が販売チャネル。候補ホテル: シェラトンワイキキ、プリンセスカイウラニ。" : "2-Day Pass + 3-night hotel (Waikiki area) + venue shuttle. For Japan/Asia tourists. Sales via NEWT × Aloha7 (Ohki). Hotels: Sheraton Waikiki, Princess Kaiulani."}
              </p>
            </div>
            <div className="card-gold" style={{ padding: "18px 20px" }}>
              <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{ja ? "VIPパッケージ" : "VIP Package"}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "VIP 2-Day Pass + 高級ホテル3泊 + 空港送迎 + 島内アクティビティ。目標 500〜1,000室 @約$250/泊で仮押さえ予定。Labor Day前にホテル在庫は枯渇するため、早期確保が必須。" : "VIP 2-Day Pass + luxury hotel 3 nights + airport transfer + island activities. Target: 500-1,000 rooms @ ~$250/night. Labor Day inventory will vanish — early blocking essential."}
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: "16px 20px", borderColor: "rgba(100,180,255,0.15)", background: "rgba(100,180,255,0.03)" }}>
            <p style={{ color: "rgba(100,180,255,0.8)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{ja ? "💡 旅行代理店パートナーシップの可能性" : "💡 Travel Agency Partnership Opportunity"}</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
              {ja
                ? "ホテルパッケージの販売チャネルとして旅行代理店との提携を積極的に検討中です。日本・アジア市場向けのパッケージツアー造成、航空券+ホテル+チケットのセット販売など、旅行業のノウハウを活かせる大きな機会があります。"
                : "We are actively seeking travel agency partners for hotel package distribution. Package tour creation for Japan/Asia markets, bundled flights + hotel + tickets — a significant opportunity to leverage travel industry expertise."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ リスクと対策 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "リスクと対策" : "Risks & Mitigation"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "全てのリスクに対策があります。" : "Every risk has a mitigation plan."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { q: ja ? "チケットが売れなかったら？" : "What if tickets don't sell?", a: ja ? "50%しか売れなくても収益$650Kで返済可能。さらにZAMNAのグローバルDB（50万人）とSNS（125万フォロワー）を活用した集客を実施。" : "Even at 50%, revenue is $650K — sufficient for repayment. ZAMNA's global DB (500K) and social (1.25M followers) drive sales.", risk: "low" },
              { q: ja ? "イベントが中止になったら？" : "What if the event is cancelled?", a: ja ? "イベントキャンセル保険に加入。保険金から最優先で返済。天候・自然災害・パンデミック等をカバー。" : "Event cancellation insurance covers weather, natural disasters, pandemics. You're repaid first from insurance proceeds.", risk: "mid" },
              { q: ja ? "お金が他の用途に使われない？" : "What if funds are misused?", a: ja ? "全額を専用エスクロー口座で管理。アーティスト出演料以外には使用不可。口座の動きは報告します。" : "All funds held in dedicated escrow. Only used for artist fees. Account activity reported to you.", risk: "low" },
              { q: ja ? "会場の許可が取れなかったら？" : "What if venue permits are denied?", a: ja ? "市議会メンバーとの1:1ミーティングを既にアレンジ中。ステージ照明業者のKuhio Lewisが市議会メンバーでもあり、承認ルートを確保済み。" : "1:1 council meetings already being arranged. Stage vendor Kuhio Lewis is also a council member, securing approval route.", risk: "low" },
            ].map(r => (
              <div key={r.q} className="card" style={{ padding: "18px 20px", borderColor: r.risk === "low" ? "rgba(74,222,128,0.15)" : "rgba(250,204,21,0.15)", background: r.risk === "low" ? "rgba(74,222,128,0.03)" : "rgba(250,204,21,0.03)" }}>
                <p style={{ color: r.risk === "low" ? "rgba(74,222,128,0.8)" : "rgba(250,204,21,0.8)", fontSize: 10, letterSpacing: "0.15em", marginBottom: 6 }}>{r.risk === "low" ? (ja ? "低リスク" : "LOW RISK") : (ja ? "中リスク" : "MEDIUM RISK")}</p>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{r.q}</p>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>{r.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ チーム ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "運営チーム" : "Team"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "経験豊富なチームが運営します。" : "An experienced team runs the show."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "🎧", name: "Sean Tsai", role: ja ? "現地統括・プロダクション" : "Local Lead / Production", desc: ja ? "ハワイのイベント業界に精通。現地の政治・ビジネスネットワークを保有。Baby Zamnaイベント実施済み。" : "Deep connections in Hawaii's event scene. Local political & business network. Baby Zamna events executed." },
              { icon: "🏛", name: "Sid", role: ja ? "会場選定・行政ルート" : "Venue / Gov Relations", desc: ja ? "大規模イベントプロデューサー。Coachellaレベルのオペレーション経験。市議会承認ルートを主導。" : "Large-scale event producer. Coachella-level ops experience. Leading city council approval route." },
              { icon: "💼", name: "Dr. Vakas Sial", role: ja ? "投資・財務・アーティスト関係" : "Investment / Finance / Artist Relations", desc: ja ? "医師・起業家。San Diego Hair & Skin Institute創設者。Vegas Music Conference投資関係ディレクター、San Diego Music & Technology Conference CEO経験。" : "Physician & entrepreneur. Founded San Diego Hair & Skin Institute. Former Investment Relations Director at Vegas Music Conference, CEO of San Diego Music & Tech Conference." },
              { icon: "📋", name: "Keyanna", role: ja ? "オペレーション・連絡調整" : "Operations / Coordination", desc: ja ? "チーム全体の調整役。チケット販売管理、パートナー連絡、予算管理を統括。" : "Team coordination hub. Manages ticket sales tracking, partner communications, and budget." },
              { icon: "⚡", name: "Yuki", role: ja ? "テクノロジー・サイト" : "Technology / Website", desc: ja ? "管理ダッシュボード・パートナーポータル・契約システムを構築。solun.artで本番稼働中。" : "Built admin dashboard, partner portal, and contract system. Live at solun.art." },
              { icon: "🌍", name: "JC / Enzo / Victor (ZAMNA)", role: ja ? "ZAMNAライセンス・タレントブッキング" : "ZAMNA License / Talent Booking", desc: ja ? "ZAMNAブランド本部。グローバルアーティストネットワークを活用したブッキングを担当。3/29にアーティストオプション提示予定。" : "ZAMNA HQ. Leveraging global artist network for bookings. Artist options to be presented 3/29." },
            ].map(m => (
              <div key={m.name} className="card" style={{ padding: "16px 18px", display: "flex", gap: 14, alignItems: "start" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{m.icon}</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{m.name} <span style={{ color: "rgba(201,169,98,0.6)", fontWeight: 400, fontSize: 12 }}>— {m.role}</span></p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.7 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ タイムライン ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "スケジュール" : "Timeline"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "今がちょうど投資の最適タイミングです。" : "Now is the optimal time to invest."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { date: ja ? "2026年2月" : "Feb 2026", item: ja ? "チケット販売開始（Ticketblox）" : "Ticket sales launched (Ticketblox)", done: true },
              { date: ja ? "3月" : "Mar", item: ja ? "会場LOI送付・市議会承認着手" : "Venue LOI sent · City council process begins", done: true },
              { date: ja ? "3月末" : "Late Mar", item: ja ? "⚠ 投資金入金・ZAMNAライセンス締結" : "⚠ Investment funded · ZAMNA license signed", now: true },
              { date: ja ? "3/29" : "Mar 29", item: ja ? "ZAMNAからアーティストオプション提示" : "ZAMNA presents artist options", now: true },
              { date: ja ? "4〜5月" : "Apr-May", item: ja ? "ヘッドライナー確定・ラインナップ発表" : "Headliner confirmed · Lineup announced", done: false },
              { date: ja ? "5〜6月" : "May-Jun", item: ja ? "スポンサー確定・ホテルパッケージ販売" : "Sponsors confirmed · Hotel packages on sale", done: false },
              { date: ja ? "7〜8月" : "Jul-Aug", item: ja ? "スタッフ採用・リハーサル" : "Staff hired · Rehearsals", done: false },
              { date: "Sep 4-5", item: ja ? "🎉 ZAMNA HAWAII 開催！" : "🎉 ZAMNA HAWAII!", done: false, event: true },
              { date: ja ? "9月末" : "Late Sep", item: ja ? "💰 投資家への最優先返済実行" : "💰 Investor first-out repayment", done: false },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderLeft: `2px solid ${s.event ? "var(--gold)" : s.now ? "rgba(255,80,80,0.6)" : s.done ? "rgba(74,222,128,0.5)" : "rgba(255,255,255,0.1)"}`, paddingLeft: 18, marginLeft: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.event ? "var(--gold)" : s.now ? "rgba(255,80,80,0.8)" : s.done ? "rgba(74,222,128,0.7)" : "rgba(255,255,255,0.15)", flexShrink: 0, marginTop: 4, marginLeft: -24 }} />
                <div>
                  <p style={{ color: s.now ? "rgba(255,80,80,0.8)" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{s.date}</p>
                  <p style={{ color: s.event ? "var(--gold)" : "#fff", fontSize: 13, fontWeight: s.event || s.now ? 700 : 400 }}>{s.item}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 参考資料 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "参考資料・関連リンク" : "Reference Materials"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 20 }}>
            {ja ? "詳細はこちらからご確認いただけます。" : "Review details via the links below."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            {[
              { icon: "📊", href: "/deal", label: ja ? "ディールサマリー" : "Deal Summary", desc: ja ? "お金の流れ・収益シミュレーション" : "Money flow & revenue scenarios" },
              { icon: "🎟", href: "https://zamnahawaii.ticketblox.com", label: ja ? "チケット販売ページ" : "Ticket Sales", desc: ja ? "Ticketbloxで販売中" : "Live on Ticketblox", ext: true },
              { icon: "🤝", href: "/sponsor", label: ja ? "スポンサーデック" : "Sponsor Deck", desc: ja ? "スポンサー向け資料" : "For sponsors" },
              { icon: "📋", href: "/contract", label: ja ? "契約書・NDA" : "Contract / NDA", desc: ja ? "オンラインで署名可能" : "Sign online" },
              { icon: "🌴", href: "https://www.moanaluagardens.com/", label: ja ? "会場: Moanalua Gardens" : "Venue: Moanalua Gardens", desc: ja ? "会場公式サイト" : "Official venue site", ext: true },
              { icon: "📅", href: "/schedule", label: ja ? "面談予約" : "Schedule a Meeting", desc: ja ? "30分の説明会を予約" : "Book a 30-min call" },
              { icon: "📖", href: "/guide", label: ja ? "当日ガイド" : "Event Guide", desc: ja ? "タイムライン・アクセス・持ち物" : "Timeline, transport, packing" },
              { icon: "ℹ️", href: "/info", label: ja ? "アクセス・FAQ" : "Info & FAQ", desc: ja ? "よくある質問" : "Frequently asked questions" },
            ].map(r => (
              <a key={r.href} href={r.href} target={r.ext ? "_blank" : undefined} rel="noopener noreferrer" style={{ display: "flex", alignItems: "start", gap: 12, padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, textDecoration: "none", transition: "border-color 0.2s" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{r.label}{r.ext ? " ↗" : ""}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 次のステップ ══════ */}
        <motion.section {...fade} style={{ textAlign: "center", paddingBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,6vw,2.8rem)", color: "#fff", marginBottom: 12 }}>
            {ja ? "まず30分、話を聞いてください" : "Give us 30 minutes"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.8, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            {ja ? "難しい話はありません。気になることは何でも聞いてください。NDAを結んでいただければ、詳細な財務資料もお見せできます。" : "No complicated stuff. Ask anything. Sign an NDA and we'll share detailed financials."}
          </p>

          <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link href="/contract?type=nda" className="btn-gold">{ja ? "まずNDAを結ぶ" : "Sign NDA First"} →</Link>
            <Link href="/contract?type=investment" className="btn-ghost">{ja ? "投資契約を結ぶ" : "Sign Investment Contract"}</Link>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/deal" className="nav-pill" style={{ border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>{ja ? "ディールサマリー" : "Deal Summary"} →</Link>
            <Link href="/sponsor" className="nav-pill" style={{ border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>{ja ? "スポンサーデック" : "Sponsor Deck"} →</Link>
          </div>
        </motion.section>

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {ja ? "© 2026 ZAMNA HAWAII · Powered by SOLUNA · 本資料は機密情報です" : "© 2026 ZAMNA HAWAII · Powered by SOLUNA · Confidential"}
        </p>
      </footer>
    </main>
  );
}
