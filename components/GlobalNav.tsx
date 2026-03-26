"use client";
import { useState } from "react";

const gold = "#C9A962";

const NAV_ITEMS = [
  { href: "/festivals", ja: "フェス", en: "Festival" },
  { href: "/contests", ja: "コンテスト", en: "Contest" },
  { href: "/music", ja: "音楽", en: "Music" },
  { href: "/live", ja: "LIVE", en: "LIVE" },
  { href: "/community", ja: "コミュニティ", en: "Community" },
  { href: "/artist", ja: "アーティスト", en: "Artist" },
  { href: "/tickets", ja: "チケット", en: "Tickets" },
];

export default function GlobalNav({ lang = "en", onToggleLang }: { lang?: string; onToggleLang?: () => void }) {
  const [open, setOpen] = useState(false);
  const t = (ja: string, en: string) => lang === "ja" ? ja : en;

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(5,6,10,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
        <a href="/" style={{ color: gold, textDecoration: "none", fontSize: 13, letterSpacing: 5, fontWeight: 700 }}>SOLUNA</a>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 20, alignItems: "center" }} className="desktop-nav">
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 11, letterSpacing: 1, transition: "color .15s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "#fff"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.4)"}
            >{lang === "ja" ? item.ja : item.en}</a>
          ))}
          {onToggleLang && (
            <button onClick={onToggleLang} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>
              {lang === "ja" ? "EN" : "JP"}
            </button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="mobile-menu-btn" style={{ display: "none", background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 8 }}>
          {open ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu" style={{ padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13 }}>
              {lang === "ja" ? item.ja : item.en}
            </a>
          ))}
          {onToggleLang && (
            <button onClick={onToggleLang} style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>
              {lang === "ja" ? "EN" : "JP"}
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
