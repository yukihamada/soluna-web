"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const TIERS = [
  {
    id: "gold",
    name: "GOLD VIP",
    price: "$1,000",
    tag_ja: "3日間通し券",
    tag_en: "2-Day Pass",
    gold: false,
    ticketblox: true,
    benefits: {
      ja: [
        "プレミアムビューイングエリア（ステージ最前列）",
        "専用VIPバー（ドリンク込み）",
        "VIP専用エントランス（待ち時間なし）",
        "ウェルカムギフト",
      ],
      en: [
        "Premium viewing area (front-of-stage)",
        "Dedicated VIP bar (drinks included)",
        "VIP express entry (no queue)",
        "Welcome gift",
      ],
    },
  },
  {
    id: "platinum",
    name: "PLATINUM VIP",
    price: "$2,000",
    tag_ja: "3日間通し券 + ラウンジ",
    tag_en: "2-Day Pass + Lounge",
    gold: true,
    ticketblox: true,
    benefits: {
      ja: [
        "Gold VIPの全特典 +",
        "VIPラウンジ（空調完備）へのアクセス",
        "テーブルサービス（ボトル1本込み）",
        "アーティスト写真撮影の機会",
        "SOLUNA限定グッズセット",
      ],
      en: [
        "All Gold VIP benefits +",
        "Air-conditioned VIP lounge access",
        "Table service (1 bottle included)",
        "Photo opportunity with artists",
        "Exclusive SOLUNA merch set",
      ],
    },
  },
  {
    id: "diamond",
    name: "DIAMOND VIP",
    price: "$3,000+",
    tag_ja: "完全カスタム（限定10名）",
    tag_en: "Fully Custom (10 spots only)",
    gold: false,
    ticketblox: false,
    benefits: {
      ja: [
        "Platinum VIPの全特典 +",
        "バックステージアクセス",
        "アーティスト・ミートアンドグリート",
        "ホテル専用送迎（Waikiki ↔ 会場）",
        "アフターパーティー招待（翌日）",
        "SOLUNA創設パートナー認定",
      ],
      en: [
        "All Platinum VIP benefits +",
        "Backstage access",
        "Artist meet & greet",
        "Private transfer (Waikiki ↔ venue)",
        "After-party invitation (next day)",
        "SOLUNA Founding Attendee recognition",
      ],
    },
  },
];

const HOTEL = {
  ja: [
    { name: "Sheraton Waikiki", dist: "会場まで専用シャトル込み", price: "~$250/泊" },
    { name: "Princess Kaiulani", dist: "Waikiki中心部", price: "~$220/泊" },
    { name: "カスタムパッケージ", dist: "ご希望に合わせてご提案", price: "要相談" },
  ],
  en: [
    { name: "Sheraton Waikiki", dist: "Shuttle to venue included", price: "~$250/night" },
    { name: "Princess Kaiulani", dist: "Central Waikiki", price: "~$220/night" },
    { name: "Custom Package", dist: "Tailored to your preferences", price: "On request" },
  ],
};

export default function VIPPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [diamondName, setDiamondName] = useState("");
  const [diamondEmail, setDiamondEmail] = useState("");
  const [diamondPhone, setDiamondPhone] = useState("");
  const [diamondMsg, setDiamondMsg] = useState("");
  const [diamondOpen, setDiamondOpen] = useState(false);
  const [diamondLoading, setDiamondLoading] = useState(false);
  const [diamondDone, setDiamondDone] = useState(false);
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  const handleDiamond = async () => {
    if (!diamondEmail || diamondLoading) return;
    setDiamondLoading(true);
    try {
      await fetch("/api/vip-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "diamond", name: diamondName, email: diamondEmail, phone: diamondPhone, message: diamondMsg, lang }),
      });
    } catch {}
    setDiamondLoading(false);
    setDiamondDone(true);
  };

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span className="nav-pill-active">VIP</span>
          <Link href="/lineup" className="nav-pill">{ja ? "ラインナップ" : "Lineup"}</Link>
          <Link href="/guide" className="nav-pill">{ja ? "当日ガイド" : "Guide"}</Link>
          <Link href="/info" className="nav-pill">{ja ? "アクセス" : "Info"}</Link>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="nav-pill">{ja ? "チケット" : "Tickets"}</a>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 80 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            VIP Experience · 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(3.2rem,12vw,6rem)", lineHeight: 0.95, marginBottom: 24, color: "#fff" }}>
            SOLUNA<br />VIP
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 18, lineHeight: 1.6 }}>
            {ja ? "ハワイで最も特別な夜を、最前列で体験する。" : "Experience the most extraordinary night in Hawaii — from the front row."}
          </p>
        </motion.div>

        {/* Tiers */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 28 }}>
            {ja ? "VIPパッケージ" : "VIP Packages"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TIERS.map(t => (
              <div key={t.id} className={t.gold ? "card-gold" : "card"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.25em", color: t.gold ? "var(--gold)" : "rgba(255,255,255,0.3)", marginBottom: 4, textTransform: "uppercase" }}>{t.name}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{ja ? t.tag_ja : t.tag_en}</p>
                  </div>
                  <span style={{ fontSize: "clamp(1.4rem,5vw,1.8rem)", fontWeight: 700, color: t.gold ? "var(--gold)" : "#fff" }}>{t.price}</span>
                </div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                  {(ja ? t.benefits.ja : t.benefits.en).map(b => (
                    <li key={b} style={{ display: "flex", gap: 10, color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.5 }}>
                      <span style={{ color: "rgba(201,169,98,0.6)", flexShrink: 0 }}>—</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {t.ticketblox ? (
                  <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "block", textAlign: "center", padding: "11px 0", borderRadius: 999,
                      fontSize: 13, letterSpacing: "0.08em", textDecoration: "none",
                      background: t.gold ? "var(--gold)" : "transparent",
                      border: t.gold ? "none" : "1px solid rgba(255,255,255,0.12)",
                      color: t.gold ? "#000" : "rgba(255,255,255,0.4)",
                      fontWeight: t.gold ? 700 : 400,
                    }}>
                    {ja ? "Ticketbloxで購入する →" : "Buy on Ticketblox →"}
                  </a>
                ) : (
                  <div>
                    {!diamondOpen && !diamondDone && (
                      <button
                        onClick={() => setDiamondOpen(true)}
                        style={{
                          width: "100%", padding: "11px 0", borderRadius: 999,
                          fontSize: 13, letterSpacing: "0.08em", cursor: "pointer",
                          border: "1px solid rgba(201,169,98,0.35)", color: "rgba(201,169,98,0.7)",
                          background: "transparent",
                        }}>
                        {ja ? "お問い合わせ（限定10名）" : "Inquire — 10 spots only"}
                      </button>
                    )}
                    {diamondDone && (
                      <p style={{ textAlign: "center", color: "rgba(201,169,98,0.8)", fontSize: 14, padding: "12px 0" }}>
                        {ja ? "受付完了。24時間以内にご連絡します。" : "Received. We'll be in touch within 24h."}
                      </p>
                    )}
                    {diamondOpen && !diamondDone && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                        {[
                          { ph: ja ? "お名前 *" : "Your Name *", val: diamondName, set: setDiamondName, type: "text" },
                          { ph: ja ? "メールアドレス *" : "Email *", val: diamondEmail, set: setDiamondEmail, type: "email" },
                          { ph: ja ? "電話番号（任意）" : "Phone (optional)", val: diamondPhone, set: setDiamondPhone, type: "tel" },
                        ].map(({ ph, val, set, type }) => (
                          <input key={ph} type={type} value={val} placeholder={ph}
                            onChange={e => set(e.target.value)}
                            style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                        ))}
                        <textarea value={diamondMsg} onChange={e => setDiamondMsg(e.target.value)}
                          placeholder={ja ? "ご要望・ご質問など（任意）" : "Message (optional)"}
                          rows={3}
                          style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                        <button onClick={handleDiamond} disabled={!diamondEmail || diamondLoading}
                          style={{ padding: "11px 0", borderRadius: 999, fontSize: 13, letterSpacing: "0.08em", cursor: diamondEmail ? "pointer" : "not-allowed", border: "none", background: "rgba(201,169,98,0.85)", color: "#000", fontWeight: 700, opacity: diamondEmail ? 1 : 0.4 }}>
                          {diamondLoading ? "..." : ja ? "送信する" : "Send Inquiry"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Hotel Bundle */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}>
            {ja ? "ホテルバンドル" : "Hotel Bundle"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 24 }}>
            {ja ? "VIPチケット + ホテルのセットでお得に。Aloha7提携ホテル。" : "VIP ticket + hotel bundle. Partnered with Aloha7."}
          </p>
          <div className="data-table">
            {(ja ? HOTEL.ja : HOTEL.en).map((h, i) => (
              <div key={h.name} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <div>
                  <p className="data-row-label" style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{h.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>{h.dist}</p>
                </div>
                <span className="data-row-value" style={{ color: "var(--gold)", fontWeight: 700 }}>{h.price}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 12 }}>
            {ja ? "* ホテルバンドルの予約はメールにてご案内します。" : "* Hotel bundle booking details will be shared by email."}
          </p>
        </motion.section>

        {/* CTA */}
        <motion.section {...fade} style={{ textAlign: "center", paddingBottom: 40 }}>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ boxShadow: "0 0 24px rgba(201,169,98,0.25)", textDecoration: "none", display: "inline-block", marginBottom: 12, marginRight: 10 }}>
            {ja ? "VIPチケットを購入する →" : "Get VIP Tickets →"}
          </a>
          <Link href="/guide" className="btn-ghost" style={{ display: "inline-block", marginBottom: 12 }}>{ja ? "当日ガイド" : "Attendee Guide"}</Link>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
            {ja ? "Day 1: Sep 4 · Day 2: Sep 5 · Oahu, Hawaii" : "Day 1: Sep 4 · Day 2: Sep 5 · Oahu, Hawaii"}
          </p>
        </motion.section>
      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
