"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { downloadPDF } from "@/lib/pdf";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";

const fade = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

const HOTEL_KEY = "SOLUNA2026";

export default function HotelPlanPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [isGenerating, setIsGenerating] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLang(getSavedLang());
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("key");
    if (urlKey === HOTEL_KEY) {
      sessionStorage.setItem("hotel_auth", "1");
      setAuthed(true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (sessionStorage.getItem("hotel_auth") === "1") {
      setAuthed(true);
    }
  }, []);

  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };
  const daysLeft = Math.ceil((new Date("2026-09-04").getTime() - Date.now()) / 86400000);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === HOTEL_KEY) {
      sessionStorage.setItem("hotel_auth", "1");
      setAuthed(true);
    } else {
      setError(ja ? "パスワードが正しくありません" : "Incorrect password");
    }
  };

  if (!authed) {
    return (
      <main style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div className="atmo" />
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 10 }}>
          <button onClick={toggleLang} style={{ padding: "5px 12px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{ja ? "EN" : "JA"}</button>
        </div>
        <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p className="font-display" style={{ fontSize: 24, letterSpacing: "0.3em", color: "#fff" }}>SOLUNA FEST HAWAII</p>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginTop: 4 }}>{ja ? "ホテルパッケージ企画書 · 機密" : "Hotel Package Proposal · Confidential"}</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: "36px 32px" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>{ja ? "パスワードを入力してください" : "Enter password to view"}</p>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Password" autoFocus style={{ padding: "13px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none" }} />
              {error && <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 12 }}>{error}</p>}
              <button type="submit" style={{ padding: "13px 0", borderRadius: 999, background: "rgba(201,169,98,0.15)", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.9)", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", cursor: "pointer" }}>{ja ? "閲覧する" : "View"}</button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="pdf-content" style={{ background: "#080808", position: "relative", overflowX: "hidden" }}>
      <div className="atmo" />
      <div className="print-header">
        <p className="font-display" style={{ color: "#111", fontSize: 18, letterSpacing: "0.2em" }}>SOLUNA FEST HAWAII 2026</p>
        <p style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{ja ? "ホテルパッケージ企画書 · 令和トラベル(NEWT)向け · 機密" : "Hotel Package Proposal · For NEWT (Reiwa Travel) · Confidential"}</p>
      </div>

      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>SOLUNA FEST HAWAII</Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/investor" className="nav-pill">{ja ? "投資家" : "Investor"}</Link>
          <Link href="/sponsor" className="nav-pill">{ja ? "スポンサー" : "Sponsor"}</Link>
          <span className="nav-pill-active">{ja ? "ホテル企画" : "Hotel Plan"}</span>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{ja ? "EN" : "JA"}</button>
          <button onClick={async () => { setIsGenerating(true); await downloadPDF("pdf-content", `zamna-hawaii-hotel-plan-${lang}.pdf`); setIsGenerating(false); }} disabled={isGenerating} style={{ padding: "5px 12px", border: "1px solid rgba(201,169,98,0.35)", borderRadius: 999, fontSize: 10, cursor: isGenerating ? "default" : "pointer", background: "transparent", color: isGenerating ? "rgba(201,169,98,0.3)" : "rgba(201,169,98,0.6)" }}>{isGenerating ? "..." : "PDF ↓"}</button>
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 20px", position: "relative", zIndex: 1 }}>

        {/* ══════ HERO ══════ */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 16, textTransform: "uppercase" }}>
            {ja ? "令和トラベル（NEWT）× SOLUNA FEST HAWAII · パートナーシップ提案" : "NEWT (Reiwa Travel) × SOLUNA FEST HAWAII · Partnership Proposal"}
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,8vw,3.8rem)", lineHeight: 1.05, color: "#fff", marginBottom: 16 }}>
            {ja ? "ホテルパッケージ企画書" : "Hotel Package Proposal"}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 12 }}>
            {ja
              ? "2026年9月4-6日、ハワイ・オアフ島で開催される世界最大級のエレクトロニックミュージックフェスティバル「SOLUNA FEST HAWAII」。日本・アジアからの観光客向けホテルパッケージの共同企画・販売パートナーとしてのご提案です。"
              : "SOLUNA FEST HAWAII — one of the world's premier electronic music festivals — comes to Oahu, Hawaii on September 4-5, 2026. This is a partnership proposal for co-creating and distributing hotel packages for Japan & Asia tourists."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.25)", color: "rgba(201,169,98,0.8)", fontSize: 12 }}>Sep 4-6, 2026</span>
            <span style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{ja ? `開催まで${daysLeft}日` : `${daysLeft} days left`}</span>
            <span style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{ja ? "キャパ 9,000人/日" : "9,000/day capacity"}</span>
          </div>
        </motion.div>

        <div className="gdivider" />

        {/* ══════ なぜNEWT × SOLUNAか ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "なぜ NEWT × SOLUNA か" : "Why NEWT × SOLUNA"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "双方にとって大きなビジネスチャンスです。" : "A significant business opportunity for both sides."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
            <div className="card" style={{ padding: "20px 22px" }}>
              <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>{ja ? "NEWT にとってのメリット" : "Benefits for NEWT"}</p>
              <ul style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
                <li>{ja ? "SOLUNAグローバルDB 50万人への露出" : "Exposure to SOLUNA's 500K global database"}</li>
                <li>{ja ? "SNS 125万フォロワーでの共同プロモーション" : "Co-promotion via 1.25M social followers"}</li>
                <li>{ja ? "Labor Day は年間最大の旅行需要期" : "Labor Day = peak travel demand period"}</li>
                <li>{ja ? "音楽フェス×旅行の高単価パッケージ市場" : "High-value music festival × travel package market"}</li>
                <li>{ja ? "ハワイは日本人旅行先No.1 — 既存顧客にリーチ" : "Hawaii is #1 Japan travel destination — reach existing customers"}</li>
              </ul>
            </div>
            <div className="card-gold" style={{ padding: "20px 22px" }}>
              <p style={{ color: "rgba(201,169,98,0.9)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>{ja ? "SOLUNA にとってのメリット" : "Benefits for SOLUNA"}</p>
              <ul style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
                <li>{ja ? "NEWTの日本・アジア販売チャネル活用" : "Leverage NEWT's Japan/Asia sales channels"}</li>
                <li>{ja ? "パッケージ販売で客単価UP（チケット+ホテル+送迎）" : "Higher ARPU via bundled packages (ticket+hotel+transfer)"}</li>
                <li>{ja ? "日本市場からの安定した集客基盤" : "Stable attendance base from Japan market"}</li>
                <li>{ja ? "旅行代理店のオペレーション力を活用" : "Leverage travel agency operational expertise"}</li>
                <li>{ja ? "2027年以降の継続パートナーシップの基盤" : "Foundation for ongoing partnership from 2027"}</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 会場 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "会場: Moanalua Gardens" : "Venue: Moanalua Gardens"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 20 }}>
            {ja ? "日本人にとって特別な場所 —「この木なんの木」日立の樹がある庭園。" : "A special place for Japanese travelers — home to the famous Hitachi Tree."}
          </p>

          <div className="card-gold" style={{ padding: "22px 24px", marginBottom: 16 }}>
            <p style={{ color: "rgba(201,169,98,0.9)", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{ja ? "日本人観光客への訴求ポイント" : "Appeal to Japanese Tourists"}</p>
            <ul style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 2, paddingLeft: 16, margin: 0 }}>
              <li>{ja ? "日立のCMで40年以上親しまれた「この木なんの木」の実物がある" : "Home to the real 'Hitachi Tree' — beloved in Japanese TV commercials for 40+ years"}</li>
              <li>{ja ? "ワイキキからわずか12分 — ホテルからのアクセス抜群" : "Only 12 minutes from Waikiki — excellent hotel access"}</li>
              <li>{ja ? "チャーターバスで送迎付き — レンタカー不要" : "Charter bus included — no rental car needed"}</li>
              <li>{ja ? "自然に囲まれた会場 — ハワイの魅力を最大限体験" : "Nature-surrounded venue — maximum Hawaii experience"}</li>
            </ul>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
            {[
              { v: "9,000", l: ja ? "1日キャパ" : "Daily cap" },
              { v: "12min", l: ja ? "ワイキキから" : "From Waikiki" },
              { v: "100+年", l: ja ? "日立の樹の歴史" : "Hitachi Tree age" },
              { v: "3日間", l: ja ? "Sep 4-6" : "Sep 4-6" },
            ].map(k => (
              <div key={k.l} className="card" style={{ textAlign: "center", padding: "14px 10px" }}>
                <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{k.v}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{k.l}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ パッケージ提案 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "パッケージ構成案" : "Package Proposals"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "3つの価格帯で幅広い層をカバー。全パッケージにシャトル送迎付き。" : "Three tiers covering a wide audience. All packages include shuttle transfer."}
          </p>

          {/* Standard */}
          <div className="card" style={{ padding: "24px 22px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em", marginBottom: 4 }}>STANDARD PACKAGE</p>
                <p style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{ja ? "スタンダード" : "Standard"}</p>
              </div>
              <p style={{ color: "var(--gold)", fontSize: 24, fontWeight: 700 }}>~$800</p>
            </div>
            <div className="data-table" style={{ marginBottom: 12 }}>
              {[
                { l: ja ? "チケット" : "Ticket", v: ja ? "2-Day Pass（$250相当）" : "2-Day Pass ($250 value)" },
                { l: ja ? "ホテル" : "Hotel", v: ja ? "3泊 スタンダードホテル（ワイキキエリア）" : "3 nights standard hotel (Waikiki area)" },
                { l: ja ? "送迎" : "Transfer", v: ja ? "チャーターバス（ワイキキ↔会場）往復" : "Charter bus (Waikiki↔Venue) round trip" },
                { l: ja ? "特典" : "Extras", v: ja ? "公式ウェルカムキット + イベントガイド" : "Official welcome kit + event guide" },
              ].map((r, i) => (
                <div key={r.l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                  <span className="data-row-label">{r.l}</span>
                  <span className="data-row-value">{r.v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{ja ? "想定ターゲット: 20-30代、音楽フェス初心者、カップル" : "Target: 20-30s, festival newcomers, couples"}</p>
          </div>

          {/* Premium */}
          <div className="card-gold" style={{ padding: "24px 22px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <p style={{ color: "rgba(201,169,98,0.6)", fontSize: 10, letterSpacing: "0.15em", marginBottom: 4 }}>PREMIUM PACKAGE</p>
                <p style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{ja ? "プレミアム" : "Premium"}</p>
              </div>
              <p style={{ color: "var(--gold)", fontSize: 24, fontWeight: 700 }}>~$2,500</p>
            </div>
            <div className="data-table" style={{ marginBottom: 12 }}>
              {[
                { l: ja ? "チケット" : "Ticket", v: ja ? "VIP 2-Day Pass（$1,000相当）" : "VIP 2-Day Pass ($1,000 value)" },
                { l: ja ? "ホテル" : "Hotel", v: ja ? "3泊 シェラトンワイキキ or プリンセスカイウラニ" : "3 nights Sheraton Waikiki or Princess Kaiulani" },
                { l: ja ? "送迎" : "Transfer", v: ja ? "空港送迎 + チャーターバス（エアコン付き大型バス）" : "Airport transfer + charter bus (air-conditioned)" },
                { l: ja ? "VIP特典" : "VIP Perks", v: ja ? "専用エリア入場 + ドリンク付き + 優先入場" : "Private area + drinks included + priority entry" },
                { l: ja ? "特典" : "Extras", v: ja ? "ウェルカムレセプション + ハワイアクティビティ1回" : "Welcome reception + 1 Hawaii activity" },
              ].map((r, i) => (
                <div key={r.l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                  <span className="data-row-label">{r.l}</span>
                  <span className="data-row-value">{r.v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "rgba(201,169,98,0.5)", fontSize: 12 }}>{ja ? "想定ターゲット: 30-40代、音楽好き、ハワイリピーター" : "Target: 30-40s, music lovers, Hawaii repeat visitors"}</p>
          </div>

          {/* Diamond */}
          <div className="card" style={{ padding: "24px 22px", borderColor: "rgba(168,85,247,0.25)", background: "rgba(168,85,247,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <p style={{ color: "rgba(168,85,247,0.7)", fontSize: 10, letterSpacing: "0.15em", marginBottom: 4 }}>DIAMOND PACKAGE</p>
                <p style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{ja ? "ダイヤモンド" : "Diamond"}</p>
              </div>
              <p style={{ color: "rgba(168,85,247,0.9)", fontSize: 24, fontWeight: 700 }}>~$5,000+</p>
            </div>
            <div className="data-table" style={{ marginBottom: 12 }}>
              {[
                { l: ja ? "チケット" : "Ticket", v: ja ? "Diamond VIP 2-Day（バックステージアクセス付き）" : "Diamond VIP 2-Day (backstage access)" },
                { l: ja ? "ホテル" : "Hotel", v: ja ? "3泊 スイートルーム（5つ星ホテル）" : "3 nights suite (5-star hotel)" },
                { l: ja ? "送迎" : "Transfer", v: ja ? "空港リムジン送迎 + 専用車両で会場へ" : "Airport limo + private vehicle to venue" },
                { l: ja ? "VIP特典" : "VIP Perks", v: ja ? "バックステージ入場 + アーティストMeet & Greet" : "Backstage + artist Meet & Greet" },
                { l: ja ? "特典" : "Extras", v: ja ? "コンシェルジュ + プレミアムアクティビティ2回 + ディナー" : "Concierge + 2 premium activities + dinner" },
              ].map((r, i) => (
                <div key={r.l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                  <span className="data-row-label">{r.l}</span>
                  <span className="data-row-value">{r.v}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "rgba(168,85,247,0.5)", fontSize: 12 }}>{ja ? "想定ターゲット: 富裕層、法人接待、特別な記念日" : "Target: high-net-worth, corporate entertainment, special occasions"}</p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ ホテル確保計画 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "ホテル確保計画" : "Hotel Procurement Plan"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "Labor Day週末のホテル在庫は早期に枯渇します。今すぐ動く必要があります。" : "Labor Day weekend hotel inventory vanishes quickly. We must act now."}
          </p>

          <div className="card" style={{ padding: "20px 22px", borderColor: "rgba(255,80,80,0.2)", background: "rgba(255,80,80,0.03)", marginBottom: 16 }}>
            <p style={{ color: "rgba(255,80,80,0.8)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>{ja ? "⚠ 緊急: 在庫確保の期限" : "⚠ URGENT: Inventory Deadline"}</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.8 }}>
              {ja
                ? "Labor Day（9月第1月曜）はハワイのホテル稼働率が年間最高水準に達します。6ヶ月前（今）がブロック確保の最終タイミングです。プレスリリース前に在庫を押さえないと、価格高騰で採算が合わなくなります。"
                : "Labor Day (first Monday of September) drives Hawaii hotel occupancy to peak levels. 6 months out (now) is the last window for bulk blocks. Prices will spike after press release."}
            </p>
          </div>

          <div className="data-table" style={{ marginBottom: 16 }}>
            <div className="data-table-head">{ja ? "確保計画" : "PROCUREMENT PLAN"}</div>
            {[
              { l: ja ? "目標室数" : "Target rooms", v: ja ? "500〜1,000室" : "500-1,000 rooms" },
              { l: ja ? "目標単価" : "Target rate", v: ja ? "~$250/泊（卸値）" : "~$250/night (wholesale)" },
              { l: ja ? "宿泊期間" : "Stay period", v: ja ? "9月3日(水)〜6日(土) 3泊" : "Sep 3 (Wed) - 6 (Sat) 3 nights" },
              { l: ja ? "候補ホテル①" : "Hotel candidate 1", v: ja ? "シェラトンワイキキ" : "Sheraton Waikiki" },
              { l: ja ? "候補ホテル②" : "Hotel candidate 2", v: ja ? "プリンセスカイウラニ" : "Princess Kaiulani" },
              { l: ja ? "卸パートナー" : "Wholesale partner", v: "Aloha7" },
              { l: ja ? "仕入れ期限" : "Procurement deadline", v: ja ? "2026年4月末" : "End of April 2026" },
            ].map((r, i) => (
              <div key={r.l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{r.l}</span>
                <span className="data-row-value" style={{ fontWeight: 600 }}>{r.v}</span>
              </div>
            ))}
          </div>

          <div className="card-gold" style={{ padding: "18px 20px" }}>
            <p style={{ color: "rgba(201,169,98,0.9)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>{ja ? "令和トラベル × Aloha7 グループ" : "Reiwa Travel × Aloha7 Group"}</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.8 }}>
              {ja
                ? "【令和トラベル（NEWT）】日本最大級の海外旅行予約アプリ。日本・アジア市場へのパッケージ販売チャネルとして、チケット+ホテル+送迎のセット商品を販売。\n\n【Aloha7 Inc.】令和トラベルの完全子会社（2023年12月に株式取得・子会社化）。ハワイ現地のホテル卸・旅行業を運営。CEO: 大木優紀氏（令和トラベル執行役員CCO兼任）。シェラトンワイキキ・プリンセスカイウラニ等のホテル仕入れルートを保有。ワイキキのキオスク等にも展開し、現地での販売力あり。\n\n→ NEWT（日本・アジアからの集客）+ Aloha7（ハワイ現地のホテル仕入れ・オペレーション）の一気通貫体制で、パッケージの企画から販売・現地対応まで一社完結。"
                : "【NEWT (Reiwa Travel)】One of Japan's largest overseas travel booking apps. Distributes ticket + hotel + transfer bundled packages to Japan & Asia markets.\n\n【Aloha7 Inc.】Fully owned subsidiary of Reiwa Travel (acquired December 2023). Operates hotel wholesale & travel services in Hawaii. CEO: Yuuki Ohki (also Reiwa Travel Executive Officer / CCO). Has procurement routes for Sheraton Waikiki, Princess Kaiulani, and more. Also operates Waikiki kiosks with strong on-site sales.\n\n→ NEWT (Japan/Asia customer acquisition) + Aloha7 (Hawaii hotel procurement & local ops) = end-to-end capability from package design to sales to on-site delivery."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 送迎計画 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "送迎・交通計画" : "Transportation Plan"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "Coachellaで13.5万人を運んだシャトルシステムを参考に設計。" : "Designed after the shuttle system that moves 135,000 people at Coachella."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{ja ? "空港 → ホテル" : "Airport → Hotel"}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "VIP/Diamondパッケージ: 空港リムジン/専用車両。Standardパッケージ: 団体バス（Roberts Hawaii候補。スポンサー兼務の可能性あり）" : "VIP/Diamond: airport limo/private car. Standard: group bus (Roberts Hawaii candidate — possible sponsor deal)"}
              </p>
            </div>
            <div className="card-gold" style={{ padding: "18px 20px" }}>
              <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{ja ? "ホテル ↔ 会場（往復シャトル）" : "Hotel ↔ Venue (Shuttle)"}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "ワイキキ主要ホテルから会場まで12分。エアコン付きチャーターバスで15-20分間隔運行。VIP用パッケージ客は全員バス送迎付き — レンタカー不要で安心。近隣住民への駐車問題も解消。" : "12 minutes from Waikiki hotels. Air-conditioned charter bus every 15-20 min. All package guests get bus transfer — no rental car needed. Also solves neighborhood parking issues."}
              </p>
            </div>
            <div className="card" style={{ padding: "18px 20px" }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{ja ? "会場 → ホテル（帰り）" : "Venue → Hotel (Return)"}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7 }}>
                {ja ? "メインイベント終了(10PM)後のシャトル + アフターパーティー会場(Kala Waikiki/Anura)直行便も運行。深夜の移動を完全カバー。" : "Post-event (10PM) shuttle + direct to after-party venues (Kala Waikiki/Anura). Full coverage for late-night transport."}
              </p>
            </div>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 収益モデル ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "収益モデル" : "Revenue Model"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "パッケージ販売数に応じた収益シミュレーション。" : "Revenue simulation based on package sales volume."}
          </p>

          <div className="data-table" style={{ marginBottom: 16 }}>
            <div className="data-table-head" style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 4 }}>
              <span></span>
              <span style={{ textAlign: "center" }}>{ja ? "控えめ" : "Conservative"}</span>
              <span style={{ textAlign: "center", color: "var(--gold)" }}>{ja ? "基本" : "Base"}</span>
              <span style={{ textAlign: "center" }}>{ja ? "積極" : "Aggressive"}</span>
            </div>
            {[
              { l: ja ? "Standard販売数" : "Standard sold", v: ["100", "300", "500"] },
              { l: ja ? "Premium販売数" : "Premium sold", v: ["30", "80", "150"] },
              { l: ja ? "Diamond販売数" : "Diamond sold", v: ["5", "15", "30"] },
              { l: ja ? "合計パッケージ" : "Total packages", v: ["135", "395", "680"], bold: true },
              { l: ja ? "合計室数（3泊）" : "Total rooms (3 nights)", v: ["135室", "395室", "680室"] },
              { l: ja ? "パッケージ総売上" : "Package revenue", v: ["$145K", "$475K", "$890K"], color: "var(--gold)", bold: true },
              { l: ja ? "NEWT手数料（15%想定）" : "NEWT commission (15%)", v: ["$22K", "$71K", "$134K"], color: "rgba(74,222,128,0.9)", bold: true },
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
                ? "💡 基本シナリオで NEWT の手数料は約$71K（約1,000万円）。ホテル卸値と販売価格の差額(マークアップ)による追加収益も見込めます。手数料率は協議の上決定します。"
                : "💡 Base scenario: NEWT commission ~$71K. Additional revenue from hotel wholesale-to-retail markup. Commission rate to be agreed upon."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ ターゲット市場 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "ターゲット市場" : "Target Markets"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { flag: "🇯🇵", country: ja ? "日本" : "Japan", desc: ja ? "最大市場。NEWT主力。ハワイは日本人旅行先No.1" : "Primary market. NEWT's strength. Hawaii = #1 Japan destination", pct: "60%" },
              { flag: "🇰🇷", country: ja ? "韓国" : "Korea", desc: ja ? "K-POP文化でEDM親和性高い" : "High EDM affinity via K-pop culture", pct: "15%" },
              { flag: "🇹🇼", country: ja ? "台湾" : "Taiwan", desc: ja ? "ハワイ観光需要増加中" : "Growing Hawaii tourism demand", pct: "10%" },
              { flag: "🇸🇬", country: ja ? "シンガポール" : "Singapore", desc: ja ? "高所得層。フェス文化あり" : "High income. Festival culture", pct: "10%" },
              { flag: "🇦🇺", country: ja ? "オーストラリア" : "Australia", desc: ja ? "EDM大国。太平洋ルート" : "EDM powerhouse. Pacific route", pct: "5%" },
            ].map(m => (
              <div key={m.country} className="card" style={{ padding: "16px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 28, marginBottom: 4 }}>{m.flag}</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{m.country}</p>
                <p style={{ color: "var(--gold)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{m.pct}</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, lineHeight: 1.4 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ 他フェスとの比較 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "他フェスとの比較" : "Festival Package Comparison"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "主要フェスティバルのホテルパッケージ価格比較。" : "Hotel package pricing across major festivals."}
          </p>

          <div className="data-table" style={{ marginBottom: 16 }}>
            <div className="data-table-head" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr 0.6fr 0.8fr", gap: 4 }}>
              <span>{ja ? "フェスティバル" : "Festival"}</span>
              <span style={{ textAlign: "center" }}>{ja ? "開催地" : "Location"}</span>
              <span style={{ textAlign: "center" }}>{ja ? "ホテルパッケージ" : "Hotel Package"}</span>
              <span style={{ textAlign: "center" }}>{ja ? "日数" : "Days"}</span>
              <span style={{ textAlign: "center" }}>{ja ? "キャパ" : "Capacity"}</span>
            </div>
            {[
              { name: "SOLUNA FEST HAWAII", loc: ja ? "ハワイ・オアフ島" : "Oahu, Hawaii", price: "$800~$5,000", days: "2", cap: ja ? "9,000/日" : "9,000/day", highlight: true },
              { name: "Coachella", loc: ja ? "カリフォルニア" : "California", price: "$2,500~$10,000", days: "3", cap: "125,000", highlight: false },
              { name: "Tomorrowland", loc: ja ? "ベルギー" : "Belgium", price: "$1,800~$8,000", days: "3", cap: "70,000", highlight: false },
              { name: "Ultra Music", loc: ja ? "マイアミ" : "Miami", price: "$1,500~$6,000", days: "3", cap: "55,000", highlight: false },
              { name: "ZoukOut", loc: ja ? "シンガポール" : "Singapore", price: "$600~$3,000", days: "1", cap: "25,000", highlight: false },
            ].map((r, i) => (
              <div key={r.name} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.2fr 0.6fr 0.8fr", gap: 4, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent", borderLeft: r.highlight ? "3px solid var(--gold)" : "3px solid transparent" }}>
                <span style={{ fontSize: 12, fontWeight: r.highlight ? 700 : 400, color: r.highlight ? "var(--gold)" : "rgba(255,255,255,0.7)" }}>{r.name}</span>
                <span style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{r.loc}</span>
                <span style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: r.highlight ? "var(--gold)" : "rgba(255,255,255,0.7)" }}>{r.price}</span>
                <span style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{r.days}</span>
                <span style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{r.cap}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "16px 20px", borderColor: "rgba(201,169,98,0.2)", background: "rgba(201,169,98,0.03)" }}>
            <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 13, lineHeight: 1.8 }}>
              {ja
                ? "SOLUNAハワイは他の大型フェスと比較して、ハワイというロケーション、小規模ならではの高密度な体験、そして競争力のある価格が強みです。"
                : "SOLUNA Hawaii offers a competitive price, an unbeatable Hawaiian location, and an intimate high-density experience compared to mega-festivals."}
            </p>
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ SOLUNAグローバル実績 ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "SOLUNAグローバル実績" : "SOLUNA Global Track Record"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "世界各地で開催実績を持つSOLUNAブランドの信頼性。" : "SOLUNA's credibility through events held worldwide."}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            {[
              { flag: "🇲🇽", loc: "Tulum, Mexico", desc: ja ? "発祥の地。セノーテを活用したステージ" : "Origin venue. Cenote-based stages.", highlight: false },
              { flag: "🇦🇪", loc: "Dubai, UAE", desc: ja ? "砂漠フェス。2万人以上" : "Desert festival. 20,000+ attendees", highlight: false },
              { flag: "🇬🇷", loc: "Mykonos, Greece", desc: ja ? "地中海ラグジュアリーEDM" : "Mediterranean luxury EDM", highlight: false },
              { flag: "🇨🇴", loc: "Bogot\u00e1, Colombia", desc: ja ? "南米展開" : "South American expansion", highlight: false },
              { flag: "🇦🇷", loc: "Buenos Aires, Argentina", desc: ja ? "スタジアム規模" : "Stadium-scale events", highlight: false },
              { flag: "🇪🇬", loc: "Cairo, Egypt", desc: ja ? "ピラミッドを背景に" : "Pyramids backdrop", highlight: false },
              { flag: "🇧🇷", loc: "S\u00e3o Paulo, Brazil", desc: ja ? "中南米最大市場" : "Largest LATAM market", highlight: false },
              { flag: "🇺🇸", loc: "Hawaii, USA", desc: ja ? "NEW 2026 — 初の太平洋開催" : "NEW 2026 — First Pacific edition", highlight: true },
            ].map(e => (
              <div key={e.loc} className="card" style={{ padding: "16px 14px", textAlign: "center", borderColor: e.highlight ? "rgba(201,169,98,0.4)" : undefined, background: e.highlight ? "rgba(201,169,98,0.05)" : undefined }}>
                <p style={{ fontSize: 28, marginBottom: 4 }}>{e.flag}</p>
                <p style={{ color: e.highlight ? "var(--gold)" : "#fff", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{e.loc}</p>
                <p style={{ color: e.highlight ? "rgba(201,169,98,0.6)" : "rgba(255,255,255,0.35)", fontSize: 10, lineHeight: 1.4 }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ スケジュール ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "スケジュール" : "Timeline"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { date: ja ? "3月" : "Mar", item: ja ? "パートナーシップ合意・NDA締結" : "Partnership agreement & NDA signed", now: true },
              { date: ja ? "4月" : "Apr", item: ja ? "ホテル在庫ブロック確保（500-1,000室）" : "Hotel inventory block (500-1,000 rooms)", now: false },
              { date: ja ? "5月" : "May", item: ja ? "パッケージ構成確定・販売ページ構築" : "Package finalized & sales page built", now: false },
              { date: ja ? "5-6月" : "May-Jun", item: ja ? "ラインナップ発表 → パッケージ販売開始" : "Lineup announced → Package sales start", now: false },
              { date: ja ? "6-8月" : "Jun-Aug", item: ja ? "プロモーション展開・予約受付" : "Promotion & booking", now: false },
              { date: "Sep 3", item: ja ? "ゲスト到着・ウェルカムレセプション" : "Guest arrival & welcome reception", now: false },
              { date: "Sep 4-6", item: ja ? "🎉 SOLUNA FEST HAWAII 開催" : "🎉 SOLUNA FEST HAWAII", event: true },
              { date: "Sep 6", item: ja ? "チェックアウト・空港送迎" : "Checkout & airport transfer", now: false },
              { date: ja ? "10月" : "Oct", item: ja ? "精算・2027年計画開始" : "Settlement & 2027 planning", now: false },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderLeft: `2px solid ${s.event ? "var(--gold)" : s.now ? "rgba(255,80,80,0.6)" : "rgba(255,255,255,0.1)"}`, paddingLeft: 18, marginLeft: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.event ? "var(--gold)" : s.now ? "rgba(255,80,80,0.8)" : "rgba(255,255,255,0.15)", flexShrink: 0, marginTop: 4, marginLeft: -24 }} />
                <div>
                  <p style={{ color: s.now ? "rgba(255,80,80,0.8)" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{s.date}</p>
                  <p style={{ color: s.event ? "var(--gold)" : "#fff", fontSize: 13, fontWeight: s.event || s.now ? 700 : 400 }}>{s.item}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ FAQ ══════ */}
        <motion.section {...fade}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "よくあるご質問" : "FAQ"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "パッケージに関するよくあるご質問をまとめました。" : "Common questions about our packages."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              {
                q: ja ? "キャンセルポリシーは？" : "What's the cancellation policy?",
                a: ja
                  ? "イベント60日前まで全額返金。30日前まで50%返金。それ以降は返金不可（ただしチケットの譲渡は可能）"
                  : "Full refund 60+ days before. 50% refund 30-60 days. No refund after (ticket transfer allowed)",
              },
              {
                q: ja ? "航空券は含まれますか？" : "Are flights included?",
                a: ja
                  ? "現在のパッケージには含まれていません。今後NEWTとの連携で航空券付きフルパッケージも検討中です"
                  : "Not included in current packages. Full flight+hotel packages under discussion with NEWT",
              },
              {
                q: ja ? "子連れでも参加できますか？" : "Can I bring children?",
                a: ja
                  ? "イベントは18歳以上限定です。ホテルパッケージは家族での滞在も可能ですが、イベント会場への入場は18歳以上のみです"
                  : "Event is 18+ only. Hotel packages accommodate families but venue entry is 18+ only",
              },
              {
                q: ja ? "ビザは必要ですか？" : "Do I need a visa?",
                a: ja
                  ? "日本国籍の方はESTA（電子渡航認証）のみで90日まで滞在可能。韓国・台湾・シンガポール・オーストラリア国籍も同様です"
                  : "Japanese citizens need only ESTA (up to 90 days). Same for Korea, Taiwan, Singapore, Australia",
              },
              {
                q: ja ? "会場までの移動手段は？" : "How do I get to the venue?",
                a: ja
                  ? "全パッケージにワイキキ↔会場のチャーターバス送迎が含まれています。レンタカーは不要です"
                  : "All packages include Waikiki↔venue charter bus. No rental car needed",
              },
              {
                q: ja ? "雨天の場合は？" : "What if it rains?",
                a: ja
                  ? "イベントは雨天決行。ハワイの9月は乾季で降水確率は低いです。会場には屋根付きエリアもあります。イベントキャンセル保険に加入済み"
                  : "Event proceeds rain or shine. September in Hawaii is dry season. Covered areas available. Event cancellation insurance in place",
              },
              {
                q: ja ? "支払い方法は？" : "Payment methods?",
                a: ja
                  ? "クレジットカード（Visa/Mastercard/Amex）、銀行振込（日本円対応）。分割払いも相談可能"
                  : "Credit card (Visa/Mastercard/Amex), bank transfer (JPY supported). Installment plans available",
              },
              {
                q: ja ? "パッケージの人数変更は可能？" : "Can I change the number of guests?",
                a: ja
                  ? "予約後30日前までは人数変更可能。追加ゲストは1名あたり追加料金が発生します"
                  : "Changes allowed up to 30 days before. Additional guests incur per-person charges",
              },
            ].map((faq, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{faq.q}</span>
                  <span style={{ color: "rgba(201,169,98,0.7)", fontSize: 18, flexShrink: 0, marginLeft: 12, transition: "transform 0.3s", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                </button>
                <div style={{ maxHeight: faqOpen === i ? 200 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
                  <p style={{ padding: "0 20px 16px", color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.8, margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="gdivider" />

        {/* ══════ CTA ══════ */}
        <motion.section {...fade} style={{ textAlign: "center", paddingBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,6vw,2.8rem)", color: "#fff", marginBottom: 12 }}>
            {ja ? "まずお話ししませんか？" : "Let's Talk"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.8, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
            {ja
              ? "パッケージ構成・価格・手数料率・プロモーション計画について、30分のミーティングでご説明します。"
              : "We'll cover package design, pricing, commission rates, and promotion plans in a 30-minute meeting."}
          </p>
          <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <Link href="/schedule" className="btn-gold">{ja ? "ミーティングを予約" : "Book a Meeting"} →</Link>
            <Link href="/contract?type=nda" className="btn-ghost">{ja ? "NDAを締結" : "Sign NDA"}</Link>
          </div>
          <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/investor" className="nav-pill" style={{ border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>{ja ? "投資家ページ" : "Investor Page"} →</Link>
            <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="nav-pill" style={{ border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>Ticketblox ↗</a>
            <Link href="/guide" className="nav-pill" style={{ border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}>{ja ? "イベントガイド" : "Event Guide"} →</Link>
          </div>
        </motion.section>

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {ja ? "© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · 本資料は機密情報です" : "© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · Confidential"}
        </p>
      </footer>
    </main>
  );
}
