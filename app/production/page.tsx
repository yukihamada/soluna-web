"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";
import { downloadPDF } from "@/lib/pdf";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

type Status = "confirmed" | "in_progress" | "pending";
const SL: Record<Status, { color: string; ja: string; en: string }> = {
  confirmed: { color: "rgba(74,222,128,0.9)", ja: "確定", en: "Confirmed" },
  in_progress: { color: "rgba(201,169,98,0.9)", ja: "進行中", en: "In Progress" },
  pending: { color: "rgba(255,255,255,0.35)", ja: "未定", en: "Pending" },
};

const TIMELINE_DAY1 = [
  { time: "06:00", ja: "スタッフ集合・会場セットアップ開始", en: "Staff call — venue setup begins" },
  { time: "10:00", ja: "音響・照明サウンドチェック", en: "Sound & lighting check" },
  { time: "14:00", ja: "ケータリング搬入・飲食ブース設営", en: "Catering load-in, F&B booth setup" },
  { time: "15:00", ja: "セキュリティブリーフィング", en: "Security briefing" },
  { time: "16:00", ja: "ボランティア最終ブリーフィング", en: "Volunteer final briefing" },
  { time: "17:00", ja: "ゲート開場準備完了チェック", en: "Gate readiness check" },
  { time: "18:00", ja: "開場（GA / VIP）", en: "Gates open (GA / VIP)" },
  { time: "19:00", ja: "Opening DJ セット開始", en: "Opening DJ set begins" },
  { time: "21:00", ja: "メインアクト #1", en: "Main Act #1" },
  { time: "23:00", ja: "ヘッドライナー", en: "Headliner" },
  { time: "01:00", ja: "クロージング DJ", en: "Closing DJ" },
  { time: "02:00", ja: "ラストコール / シャトル案内開始", en: "Last call / shuttle announcement" },
  { time: "03:00", ja: "完全閉場・シャトル最終便", en: "Venue closed — last shuttle" },
  { time: "03:30", ja: "撤収作業開始（Day1→Day2切替）", en: "Reset begins (Day 1 → Day 2 turnover)" },
];

const TIMELINE_DAY2 = [
  { time: "08:00", ja: "Day2 セットアップ・追加演出", en: "Day 2 setup & additional staging" },
  { time: "12:00", ja: "音響チェック（Day2アーティスト）", en: "Sound check (Day 2 artists)" },
  { time: "15:00", ja: "セキュリティ・ケータリング再確認", en: "Security & catering recheck" },
  { time: "18:00", ja: "開場", en: "Gates open" },
  { time: "19:00", ja: "Opening DJ", en: "Opening DJ" },
  { time: "21:00", ja: "メインアクト #2", en: "Main Act #2" },
  { time: "23:00", ja: "グランドヘッドライナー", en: "Grand Headliner" },
  { time: "01:30", ja: "フィナーレ（花火 / 特殊演出）", en: "Finale (fireworks / special effects)" },
  { time: "02:00", ja: "シャトル・退場案内", en: "Shuttle & exit guidance" },
  { time: "03:00", ja: "完全閉場", en: "Venue closed" },
  { time: "04:00", ja: "完全撤収開始", en: "Full teardown begins" },
];

const ZONES = [
  { ja: "メインステージ", en: "Main Stage", ja_d: "最大収容9,000人。自然背景を活かしLED演出コスト削減。日立の樹が象徴的バックドロップ", en_d: "Cap. 9,000. Natural backdrop (Hitachi tree) reduces LED costs", s: "in_progress" as Status },
  { ja: "VIPラウンジ", en: "VIP Lounge", ja_d: "専用バー、ソファ席、ステージビュー確保", en_d: "Private bar, lounge seating, stage view", s: "in_progress" as Status },
  { ja: "ダイヤモンドVIPデッキ", en: "Diamond VIP Deck", ja_d: "バックステージアクセス、専用ホスト、プレミアムF&B", en_d: "Backstage access, dedicated host, premium F&B", s: "pending" as Status },
  { ja: "飲食エリア", en: "Food & Beverage Area", ja_d: "ハワイローカルフード、ヴィーガン対応、バー×3", en_d: "Local Hawaiian cuisine, vegan options, 3 bars", s: "pending" as Status },
  { ja: "エントランスゲート", en: "Entrance Gate", ja_d: "チケットスキャン、ID確認、セキュリティチェック", en_d: "Ticket scan, ID check, security screening", s: "in_progress" as Status },
  { ja: "シャトルドロップオフ", en: "Shuttle Drop-off", ja_d: "Roberts Hawaii専用ゾーン、タクシー/ライドシェアゾーン", en_d: "Roberts Hawaii zone, taxi/rideshare zone", s: "pending" as Status },
  { ja: "メディカルテント", en: "Medical Tent", ja_d: "救急医療チーム常駐、AED設置", en_d: "On-site EMT, AED equipped", s: "pending" as Status },
  { ja: "駐車場", en: "Parking", ja_d: "限定200台、有料（$30/日）", en_d: "Limited 200 spots, $30/day", s: "pending" as Status },
];

const TECH_SPECS = [
  { ja_l: "メインPA", en_l: "Main PA", ja_v: "L-Acoustics K2 ラインアレイ（候補）", en_v: "L-Acoustics K2 line array (candidate)" },
  { ja_l: "サブウーファー", en_l: "Subwoofers", ja_v: "KS28 × 12基", en_v: "KS28 × 12 units" },
  { ja_l: "モニター", en_l: "Monitors", ja_v: "Wedge × 8 + IEM 各アーティスト", en_v: "8 wedges + IEM per artist" },
  { ja_l: "照明", en_l: "Lighting", ja_v: "Moving heads × 40, LED wash × 24, レーザー × 8", en_v: "40 movers, 24 LED wash, 8 lasers" },
  { ja_l: "映像", en_l: "Video", ja_v: "LEDウォール 12m×6m (P3.9)、サイドスクリーン ×2", en_v: "LED wall 12m×6m (P3.9), 2 side screens" },
  { ja_l: "電源", en_l: "Power", ja_v: "発電機 500kVA × 2（冗長構成）", en_v: "2× 500kVA generators (redundant)" },
  { ja_l: "ステージ", en_l: "Stage", ja_v: "16m × 12m 屋根付き、耐風速30m/s", en_v: "16m × 12m covered, rated 30m/s wind" },
  { ja_l: "通信", en_l: "Comms", ja_v: "デジタル無線（全スタッフ）、Wi-Fi 6ホットスポット", en_v: "Digital radios (all staff), Wi-Fi 6 hotspots" },
];

export default function ProductionPage() {
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
          <Link href="/admin" className="nav-pill">Admin</Link>
          <Link href="/safety" className="nav-pill">{ja ? "安全計画" : "Safety"}</Link>
          <Link href="/staff" className="nav-pill">{ja ? "スタッフ" : "Staff"}</Link>
          <span className="nav-pill-active">{ja ? "制作計画" : "Production"}</span>
          <button onClick={() => downloadPDF("pdf-content", "SOLUNA-Production-Plan.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Production Plan · Internal
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.5rem,10vw,4.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            {ja ? "制作計画" : "PRODUCTION\nPLAN"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
            {ja ? "SOLUNA FEST HAWAII 2026 — 当日運営・技術仕様" : "SOLUNA FEST HAWAII 2026 — Operations & Technical Specifications"}
          </p>
        </motion.div>

        {/* Venue Zones */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "会場ゾーン — モアナルアガーデン" : "Venue Zones — Moanalua Gardens"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ZONES.map(z => (
              <div key={z.en} className="card" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{ja ? z.ja : z.en}</p>
                  <span style={{ fontSize: 10, color: SL[z.s].color, border: `1px solid ${SL[z.s].color}`, borderRadius: 999, padding: "2px 10px" }}>
                    {ja ? SL[z.s].ja : SL[z.s].en}
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{ja ? z.ja_d : z.en_d}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Tech Specs */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "技術仕様" : "Technical Specifications"}
          </h2>
          <div className="data-table">
            {TECH_SPECS.map((t, i) => (
              <div key={t.en_l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{ja ? t.ja_l : t.en_l}</span>
                <span className="data-row-value" style={{ color: "rgba(255,255,255,0.7)", textAlign: "right" }}>
                  {ja ? t.ja_v : t.en_v}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Day 1 Timeline */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "Day 1 — 9月4日（金）タイムライン" : "Day 1 — Sep 4 (Fri) Timeline"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TIMELINE_DAY1.map((t, i) => (
              <div key={t.time + "-d1"} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < TIMELINE_DAY1.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, minWidth: 52, fontVariantNumeric: "tabular-nums" }}>{t.time}</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{ja ? t.ja : t.en}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Day 2 Timeline */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "Day 2 — 9月5日（土）タイムライン" : "Day 2 — Sep 5 (Sat) Timeline"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TIMELINE_DAY2.map((t, i) => (
              <div key={t.time + "-d2"} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < TIMELINE_DAY2.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, minWidth: 52, fontVariantNumeric: "tabular-nums" }}>{t.time}</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{ja ? t.ja : t.en}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Key Contacts */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "制作チーム連絡先" : "Production Contacts"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { ja: "プロデューサー", en: "Producer", email: "producer@solun.art" },
              { ja: "ステージマネージャー", en: "Stage Manager", email: "stage@solun.art" },
              { ja: "音響監督", en: "Sound Director", email: "sound@solun.art" },
              { ja: "セキュリティ統括", en: "Security Lead", email: "security@solun.art" },
            ].map(c => (
              <div key={c.email} className="card" style={{ padding: "16px 20px" }}>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>{ja ? c.ja : c.en}</p>
                <a href={`mailto:${c.email}`} style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none" }}>{c.email}</a>
              </div>
            ))}
          </div>
        </motion.section>

      </div>
      <InnerFooter lang={lang} />
    </main>
  );
}
