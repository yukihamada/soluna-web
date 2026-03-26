"use client";
import Link from "next/link";
import { type Lang } from "@/lib/lang";

const PUBLIC_LINKS = [
  { href: "/",        ja: "ホーム",         en: "Home" },
  { href: "/lineup",  ja: "ラインナップ",   en: "Lineup" },
  { href: "/vip",     ja: "VIP",            en: "VIP" },
  { href: "/guide",   ja: "当日ガイド",     en: "Guide" },
  { href: "/info",    ja: "アクセス・FAQ",  en: "Info" },
];
const LEGAL_LINKS = [
  { href: "/privacy", ja: "プライバシー",   en: "Privacy" },
  { href: "/terms",   ja: "利用規約",       en: "Terms" },
];
const TICKET_LINK = "https://zamnahawaii.ticketblox.com";

export default function InnerFooter({ lang }: { lang: Lang }) {
  const ja = lang === "ja";
  return (
    <footer className="inner-footer">
      <div className="inner-footer-links">
        {PUBLIC_LINKS.map(l => (
          <Link key={l.href} href={l.href} className="inner-footer-link">{ja ? l.ja : l.en}</Link>
        ))}
        <a href={TICKET_LINK} target="_blank" rel="noopener noreferrer" className="inner-footer-link" style={{ color: "rgba(201,169,98,0.4)" }}>
          {ja ? "チケット" : "Tickets"} ↗
        </a>
      </div>
      <div className="inner-footer-links" style={{ marginBottom: 20 }}>
        {LEGAL_LINKS.map(l => (
          <Link key={l.href} href={l.href} className="inner-footer-link">{ja ? l.ja : l.en}</Link>
        ))}
        <a href="mailto:info@solun.art" className="inner-footer-link">info@solun.art</a>
      </div>
      <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: "0.1em" }}>
        © 2026 SOLUNA FEST HAWAII · Powered by SOLUNA
      </p>
    </footer>
  );
}
