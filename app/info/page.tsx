"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const BASICS = [
  { ja_l: "日程", en_l: "Date", ja_v: "2026年9月4日（金）〜5日（土）", en_v: "September 4 (Fri) – 5 (Sat), 2026" },
  { ja_l: "会場", en_l: "Venue", ja_v: "モアナルアガーデン（Moanalua Gardens）, オアフ島", en_v: "Moanalua Gardens, Oahu, HI" },
  { ja_l: "開場", en_l: "Gates Open", ja_v: "18:00 HST", en_v: "6:00 PM HST" },
  { ja_l: "チケット", en_l: "Tickets", ja_v: "Day 1: $120 / Day 2: $180 / VIP: $1,000+", en_v: "Day 1: $120 / Day 2: $180 / VIP: $1,000+" },
  { ja_l: "年齢制限", en_l: "Age Limit", ja_v: "21歳以上（ID必須）", en_v: "21+ (valid ID required)" },
  { ja_l: "シャトル", en_l: "Shuttle", ja_v: "Waikiki発着 往復シャトルあり（詳細近日公開）", en_v: "Round-trip shuttle from Waikiki (details TBA)" },
];

const FAQ = [
  {
    ja_q: "会場の場所はいつ教えてもらえますか？",
    en_q: "When will the exact venue location be revealed?",
    ja_a: "チケット購入者には、イベント1週間前にメールにて正確な場所をお知らせします。",
    en_a: "Ticket holders will receive the exact location by email one week before the event.",
  },
  {
    ja_q: "Waikikiからどうやって行きますか？",
    en_q: "How do I get there from Waikiki?",
    ja_a: "Roberts HawaiiのシャトルバスがWaikikiの主要ホテルから往復します。詳細は近日公開予定です。Uber/Lyftも利用可能です。",
    en_a: "Roberts Hawaii will operate round-trip shuttles from major Waikiki hotels. Details coming soon. Uber/Lyft are also available.",
  },
  {
    ja_q: "VIPチケットとGAチケットの違いは？",
    en_q: "What's the difference between VIP and GA tickets?",
    ja_a: "GAはゼネラルアドミッション（一般入場）です。VIPはプレミアムビューイングエリア、専用バー、優先入場などの特典が含まれます。",
    en_a: "GA is general admission. VIP includes premium viewing area, dedicated bar, express entry, and more.",
  },
  {
    ja_q: "何を持っていけばいいですか？",
    en_q: "What should I bring?",
    ja_a: "写真付き身分証明書（パスポートまたは運転免許証）、チケット（QRコード）、動きやすい服装。テントやラージバッグは持ち込み不可です。",
    en_a: "Photo ID (passport or driver's license), ticket (QR code), comfortable clothing. Tents and large bags are not permitted.",
  },
  {
    ja_q: "再入場はできますか？",
    en_q: "Is re-entry allowed?",
    ja_a: "会場を一度退場した場合、再入場はできません。",
    en_a: "Re-entry is not permitted once you exit the venue.",
  },
  {
    ja_q: "飲食物の持ち込みは？",
    en_q: "Can I bring food or drinks?",
    ja_a: "外部からの飲食物の持ち込みはできません。会場内に飲食ブースがあります。ZAMNAはサステナブルなイベントを目指し、使い捨てプラスチック不使用です。",
    en_a: "Outside food and beverages are not permitted. Food and drink vendors will be available inside. ZAMNA is committed to sustainability — single-use plastics are banned.",
  },
  {
    ja_q: "雨天時はどうなりますか？",
    en_q: "What happens if it rains?",
    ja_a: "野外イベントですが、小雨程度では開催します。中止・延期の場合は公式SNSとメールにてお知らせします。",
    en_a: "This is an outdoor event and will proceed in light rain. Cancellation or postponement will be announced via official SNS and email.",
  },
  {
    ja_q: "ホテルはどこがおすすめですか？",
    en_q: "Which hotel do you recommend?",
    ja_a: "Waikikiのホテルが最寄りです。Aloha7提携のホテルパッケージ（VIPチケット込み）も準備中です。",
    en_a: "Hotels in Waikiki are most convenient. Hotel bundles with VIP tickets (via Aloha7) are coming soon.",
  },
];

const CONTACT_ITEMS = [
  { ja: "チケット・一般", en: "Tickets & General", email: "info@solun.art" },
  { ja: "VIPパッケージ", en: "VIP Packages", email: "vip@solun.art" },
  { ja: "スポンサー", en: "Sponsorship", email: "sponsor@solun.art" },
  { ja: "投資・パートナー", en: "Investment & Partners", email: "invest@solun.art" },
];

export default function InfoPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

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
          <Link href="/lineup" className="nav-pill">{ja ? "ラインナップ" : "Lineup"}</Link>
          <Link href="/guide" className="nav-pill">{ja ? "当日ガイド" : "Guide"}</Link>
          <span className="nav-pill-active">{ja ? "アクセス" : "Info"}</span>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="nav-pill">{ja ? "チケット" : "Tickets"}</a>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Event Info · 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(3rem,12vw,5.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            ZAMNA<br />HAWAII
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
            {ja ? "イベント情報・アクセス・よくある質問" : "Event Info · Getting There · FAQ"}
          </p>
        </motion.div>

        {/* Basics */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "基本情報" : "Event Basics"}
          </h2>
          <div className="data-table">
            {BASICS.map((b, i) => (
              <div key={b.ja_l} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label">{ja ? b.ja_l : b.en_l}</span>
                <span className="data-row-value" style={{ color: "rgba(255,255,255,0.7)", textAlign: "right" }}>
                  {ja ? b.ja_v : b.en_v}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Getting There */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "アクセス" : "Getting There"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card-gold">
              <p style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase" }}>
                {ja ? "シャトルバス（推奨）" : "Shuttle Bus (Recommended)"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
                {ja
                  ? "Roberts Hawaiiが運行するWaikiki発着の往復シャトルバス。主要ホテルから乗車可能。"
                  : "Roberts Hawaii operates round-trip shuttles from Waikiki. Multiple hotel pick-up points."}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                {ja ? "詳細・予約は近日公開" : "Details & booking coming soon"}
              </p>
            </div>
            <div className="card">
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase" }}>
                {ja ? "タクシー / ライドシェア" : "Taxi / Rideshare"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>
                {ja
                  ? "Uber・Lyftが利用可能。会場には指定のドロップオフエリアがあります。"
                  : "Uber and Lyft are available. A designated drop-off area will be provided at the venue."}
              </p>
            </div>
            <div className="card">
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase" }}>
                {ja ? "お車でお越しの方" : "By Car"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.6 }}>
                {ja
                  ? "限定台数の駐車スペースあり（有料）。詳細はチケット購入後にお知らせします。"
                  : "Limited paid parking is available. Details will be sent after ticket purchase."}
              </p>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            FAQ
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {FAQ.map((f, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderTop: i === 0 ? undefined : "none",
                  borderRadius: i === 0 ? "12px 12px 0 0" : i === FAQ.length - 1 ? "0 0 12px 12px" : 0,
                  background: openFaq === i ? "rgba(255,255,255,0.03)" : "transparent",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", textAlign: "left", padding: "16px 20px",
                    background: "transparent", border: "none", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  }}
                >
                  <span style={{ color: openFaq === i ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
                    {ja ? f.ja_q : f.en_q}
                  </span>
                  <span style={{ color: "rgba(201,169,98,0.6)", fontSize: 18, flexShrink: 0 }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <p style={{ padding: "0 20px 16px", color: "rgba(255,255,255,0.5)", fontSize: 13.5, lineHeight: 1.7 }}>
                    {ja ? f.ja_a : f.en_a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "お問い合わせ" : "Contact"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {CONTACT_ITEMS.map(c => (
              <a key={c.email} href={`mailto:${c.email}`} style={{
                textDecoration: "none", padding: "18px 20px",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                background: "rgba(255,255,255,0.02)", display: "block",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,169,98,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>{ja ? c.ja : c.en}</p>
                <p style={{ color: "var(--gold)", fontSize: 13 }}>{c.email}</p>
              </a>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section {...fade} style={{ textAlign: "center", paddingBottom: 40 }}>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ textDecoration: "none", display: "inline-block", marginRight: 10 }}>
            {ja ? "チケットを購入する →" : "Get Tickets →"}
          </a>
          <Link href="/guide" className="btn-ghost" style={{ marginRight: 10 }}>{ja ? "当日ガイド" : "Attendee Guide"}</Link>
          <Link href="/vip" className="btn-ghost">VIP →</Link>
        </motion.section>
      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
