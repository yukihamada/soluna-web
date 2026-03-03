"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

// ── ZAMNA 公式映像 — YouTube video IDs（差し替え可能）──────────────────────────
const VIDEOS = [
  { id: "KQeBtpFkEtQ", ja: "ZAMNA Tulum 2024 Aftermovie", en: "ZAMNA Tulum 2024 Aftermovie" },
  { id: "UjmIcfLLYnM", ja: "ZAMNA Dubai 2024", en: "ZAMNA Dubai 2024" },
  { id: "Dh0SljIxmrU", ja: "ZAMNA Nosara 2023", en: "ZAMNA Nosara 2023" },
];

const CLUES = [
  { ja: "Underground Electronic", en: "Underground Electronic" },
  { ja: "Tulum × Hawaii", en: "Tulum × Hawaii" },
  { ja: "Sunrise to Sunset", en: "Sunrise to Sunset" },
  { ja: "World-class DJs", en: "World-class DJs" },
  { ja: "Live Performance", en: "Live Performance" },
  { ja: "Immersive Sound Design", en: "Immersive Sound Design" },
];

const PAST = [
  { name: "Tulum, Mexico", year: "2019–2024", count: "850K+ attendees" },
  { name: "Nosara, Costa Rica", year: "2023", count: "3,000 guests" },
  { name: "Dubai", year: "2024", count: "5,000 guests" },
];

export default function LineupPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };
  const countdown = useCountdown(new Date("2026-09-04T18:00:00-10:00"));

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: lang }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          ZAMNA HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/vip" className="nav-pill">VIP</Link>
          <span className="nav-pill-active">{ja ? "ラインナップ" : "Lineup"}</span>
          <Link href="/info" className="nav-pill">{ja ? "アクセス" : "Info"}</Link>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="nav-pill">{ja ? "チケット" : "Tickets"}</a>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72, textAlign: "center" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 28, textTransform: "uppercase" }}>
            ZAMNA HAWAII 2026 · {ja ? "ラインナップ" : "Lineup"}
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(3rem,14vw,7rem)", lineHeight: 0.9, marginBottom: 32, color: "#fff", letterSpacing: "0.05em" }}>
            COMING<br />SOON
          </h1>
          <div style={{ width: 48, height: 2, background: "rgba(201,169,98,0.5)", margin: "0 auto 24px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            {ja
              ? "世界最高峰のアンダーグラウンド・エレクトロニックミュージックがハワイに上陸。ラインナップは準備中です。"
              : "The world's finest underground electronic music comes to Hawaii. The lineup is being finalized."}
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.section {...fade} style={{ marginBottom: 60, textAlign: "center" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", marginBottom: 20, textTransform: "uppercase" }}>
            {ja ? "イベント開幕まで" : "Event Starts In"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(10px,3vw,24px)" }}>
            {[
              { v: countdown.d, l: ja ? "日" : "DAYS" },
              { v: countdown.h, l: ja ? "時間" : "HRS" },
              { v: countdown.m, l: ja ? "分" : "MIN" },
              { v: countdown.s, l: ja ? "秒" : "SEC" },
            ].map(({ v, l }) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-display, serif)", fontSize: "clamp(1.8rem,7vw,3rem)",
                  fontWeight: 700, color: "#fff", minWidth: "2ch",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10, padding: "10px 16px",
                }}>
                  {String(v).padStart(2, "0")}
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, letterSpacing: "0.15em" }}>{l}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Mystery artist slots */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,1.8rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "ラインナップ" : "Lineup"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginBottom: 24, letterSpacing: "0.06em" }}>
            {ja ? "アーティスト発表近日予定 — メールで最速通知を受け取る" : "Artist announcements coming soon — sign up below for early access"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
            {[
              { tier: ja ? "ヘッドライナー" : "HEADLINER", day: "Day 1 · Sep 4", head: true },
              { tier: ja ? "ヘッドライナー" : "HEADLINER", day: "Day 2 · Sep 5", head: true },
              { tier: ja ? "メインステージ" : "MAIN STAGE", day: "Day 1", head: false },
              { tier: ja ? "メインステージ" : "MAIN STAGE", day: "Day 2", head: false },
              { tier: ja ? "サポートアクト" : "SUPPORT", day: "Day 1", head: false },
              { tier: ja ? "サポートアクト" : "SUPPORT", day: "Day 2", head: false },
              { tier: ja ? "ローカル アクト" : "LOCAL ACT", day: "Oahu", head: false },
              { tier: ja ? "ローカル アクト" : "LOCAL ACT", day: "Oahu", head: false },
            ].map((slot, i) => (
              <div key={i} className={`mystery-card${slot.head ? " mystery-card-head" : ""}`}>
                <div className="mystery-icon">?</div>
                <div className="mystery-tier">{slot.tier}</div>
                <div className="mystery-name">TBA</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>{slot.day}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Genre clues */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,1.8rem)", color: "#fff", marginBottom: 20, textAlign: "center" }}>
            {ja ? "こんな音楽が響きます" : "Expect This Sound"}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {CLUES.map(c => (
              <span key={c.en} style={{
                padding: "8px 18px", border: "1px solid rgba(201,169,98,0.25)",
                borderRadius: 999, fontSize: 12, color: "rgba(201,169,98,0.7)",
                background: "rgba(201,169,98,0.04)", letterSpacing: "0.06em",
              }}>
                {ja ? c.ja : c.en}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Past events */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,1.8rem)", color: "#fff", marginBottom: 20 }}>
            {ja ? "ZAMNAの実績" : "ZAMNA's Track Record"}
          </h2>
          <div className="data-table">
            {PAST.map((p, i) => (
              <div key={p.name} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <div>
                  <p className="data-row-label" style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{p.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>{p.year}</p>
                </div>
                <span className="data-row-value" style={{ color: "var(--gold)" }}>{p.count}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* YouTube — Past events */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,1.8rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "ZAMNAの世界を体感する" : "Feel the ZAMNA Experience"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 24, letterSpacing: "0.04em" }}>
            {ja ? "過去の公演映像 — ハワイでもこの瞬間が生まれる" : "Past event footage — this moment comes to Hawaii"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {VIDEOS.map((v) => (
              <div key={v.id}>
                <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: 12, overflow: "hidden", background: "#111" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`}
                    title={ja ? v.ja : v.en}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                  />
                </div>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 8, letterSpacing: "0.06em" }}>
                  {ja ? v.ja : v.en}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Email signup */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <div className="card-gold" style={{ textAlign: "center", padding: "32px 28px" }}>
            <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>
              {ja ? "ラインナップ発表を最初に受け取る" : "Be First to Know the Lineup"}
            </p>
            <h3 className="font-display" style={{ color: "#fff", fontSize: "clamp(1.2rem,4vw,1.6rem)", marginBottom: 20 }}>
              {ja ? "メールで通知を受け取る" : "Get Notified by Email"}
            </h3>
            {submitted ? (
              <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 15, fontWeight: 600 }}>
                {ja ? "登録完了。発表をお楽しみに！" : "You're on the list. Stay tuned!"}
              </p>
            ) : (
              <form onSubmit={handleNotify} style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <input
                  type="email" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  placeholder={ja ? "メールアドレス" : "your@email.com"}
                  style={{
                    flex: "1 1 220px", padding: "12px 18px", borderRadius: 999,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", fontSize: 14, outline: "none",
                  }}
                />
                <button type="submit" className="btn-gold" style={{ padding: "12px 24px", flexShrink: 0 }}>
                  {ja ? "通知を受け取る" : "Notify Me"}
                </button>
              </form>
            )}
          </div>
        </motion.section>

        <div style={{ textAlign: "center" }}>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ textDecoration: "none", display: "inline-block", marginRight: 10 }}>
            {ja ? "今すぐチケットを取る →" : "Get Tickets Now →"}
          </a>
          <Link href="/vip" className="btn-ghost">{ja ? "VIPを見る" : "View VIP"}</Link>
        </div>
      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
