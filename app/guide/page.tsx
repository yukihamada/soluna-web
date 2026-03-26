"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const TIMELINE = [
  { time: "18:00", ja: "ゲート開場", en: "Gates Open", note: { ja: "ID確認・手荷物検査あり。時間に余裕を持って", en: "ID check & bag inspection. Allow extra time" } },
  { time: "19:00", ja: "1st アーティスト スタート", en: "First Artist Starts", note: null },
  { time: "20:00", ja: "メインステージ本格開幕", en: "Main Stage Heats Up", note: null },
  { time: "23:00", ja: "ヘッドライナー登場", en: "Headliner Set", note: { ja: "クライマックス。場所を早めに確保して", en: "Climax of the night. Secure your spot early" } },
  { time: "02:00", ja: "クロージングセット", en: "Closing Set", note: null },
  { time: "03:00", ja: "終演・シャトル運行開始", en: "Finale & Shuttle Departs", note: { ja: "最終シャトルは03:30発。余裕を持って", en: "Last shuttle at 03:30. Don't miss it" } },
];

const BRING = [
  { ja: "政府発行の写真付きID（パスポートまたは運転免許証）", en: "Government-issued photo ID (passport or driver's license)", must: true },
  { ja: "チケット QR コード（スクリーンショット推奨）", en: "Ticket QR code (screenshot recommended)", must: true },
  { ja: "クレジットカード / タッチ決済対応カード", en: "Credit card / contactless payment card", must: true },
  { ja: "動きやすい服装・歩きやすい靴", en: "Comfortable clothing and shoes", must: false },
  { ja: "軽めの上着（夜は涼しくなります）", en: "Light jacket (nights can get cool)", must: false },
  { ja: "耳栓（任意）", en: "Earplugs (optional)", must: false },
  { ja: "充電済みのスマートフォン", en: "Fully charged phone", must: false },
];

const BANNED = [
  { ja: "外部からの飲食物・ボトル", en: "Outside food, drinks, or bottles" },
  { ja: "大型バッグ・バックパック（小さいポーチのみ可）", en: "Large bags or backpacks (small pouches only)" },
  { ja: "カメラ（プロ用機材・脱着レンズ）", en: "Professional cameras with detachable lenses" },
  { ja: "テント・折りたたみ椅子", en: "Tents or folding chairs" },
  { ja: "花火・発煙筒・レーザーポインター", en: "Fireworks, flares, or laser pointers" },
  { ja: "薬物・危険物", en: "Drugs or dangerous items" },
];

const TRANSPORT = [
  {
    ja: "シャトルバス（推奨）",
    en: "Shuttle Bus (Recommended)",
    ja_body: "Waikiki主要ホテル発着の往復シャトルを運行予定。\n詳細・予約方法は近日公開。",
    en_body: "Round-trip shuttles from major Waikiki hotels.\nBooking details coming soon.",
    icon: "🚌",
  },
  {
    ja: "Uber / Lyft",
    en: "Uber / Lyft",
    ja_body: "会場周辺のドロップオフ/ピックアップゾーンをご利用ください。\n帰りは混雑が予想されます。早めに配車の手配を。",
    en_body: "Use designated drop-off / pick-up zones near the venue.\nExpect high demand after the event — book your ride early.",
    icon: "🚗",
  },
  {
    ja: "駐車場",
    en: "Parking",
    ja_body: "限定台数の駐車スペースを確保予定。\n詳細はイベント1週間前に公開します。",
    en_body: "Limited parking available on-site.\nDetails will be shared one week before the event.",
    icon: "🅿️",
  },
];

export default function GuidePage() {
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
          <Link href="/info" className="nav-pill">{ja ? "アクセス" : "Info"}</Link>
          <Link href="/lineup" className="nav-pill">{ja ? "ラインナップ" : "Lineup"}</Link>
          <span className="nav-pill-active">{ja ? "当日ガイド" : "Guide"}</span>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="nav-pill">
            {ja ? "チケット" : "Tickets"}
          </a>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20, textTransform: "uppercase" }}>
            {ja ? "当日ガイド · SOLUNA FEST HAWAII 2026" : "Attendee Guide · SOLUNA FEST HAWAII 2026"}
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,9vw,4.5rem)", lineHeight: 1, color: "#fff", marginBottom: 20 }}>
            {ja ? "当日を\n楽しむために" : "Your\nEvent Guide"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.8 }}>
            {ja
              ? "SOLUNA FEST HAWAII 2026 を最高の体験にするための完全ガイドです。当日の流れ・アクセス・持ち物をご確認ください。"
              : "Everything you need for the best experience at SOLUNA FEST HAWAII 2026. Day-of schedule, transport, and what to bring."}
          </p>
        </motion.div>

        {/* Date / Venue highlight */}
        <motion.div {...fade} className="card-gold" style={{ marginBottom: 40, padding: "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { l: ja ? "日程" : "Date", v: ja ? "2026年9月4日（金）〜5日（土）" : "Sep 4 (Fri) – 5 (Sat), 2026" },
              { l: ja ? "会場" : "Venue", v: ja ? "モアナルアガーデン（Moanalua Gardens）, Oahu" : "Moanalua Gardens, Oahu, HI" },
              { l: ja ? "開場時刻" : "Gates Open", v: "18:00 HST" },
              { l: ja ? "年齢制限" : "Age Limit", v: ja ? "21歳以上（ID必須）" : "21+ with valid ID" },
            ].map(({ l, v }) => (
              <div key={l}>
                <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 6 }}>{l}</p>
                <p style={{ fontSize: 13.5, color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>{v}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.section {...fade} style={{ marginBottom: 52 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", color: "rgba(201,169,98,0.9)", marginBottom: 20, letterSpacing: "0.04em" }}>
            {ja ? "当日のタイムライン" : "Day-of Timeline"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "64px 1fr",
                gap: 16, padding: "16px 20px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
              }}>
                <p style={{ fontFamily: "'Anton', serif", fontSize: 18, color: "rgba(201,169,98,0.8)", lineHeight: 1 }}>
                  {t.time}
                </p>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: t.note ? 4 : 0 }}>
                    {ja ? t.ja : t.en}
                  </p>
                  {t.note && (
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.6 }}>
                      {ja ? t.note.ja : t.note.en}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 12, letterSpacing: "0.05em" }}>
            * {ja ? "タイムラインはアーティスト決定後に更新されます" : "Timeline subject to change — updated after lineup is confirmed"}
          </p>
        </motion.section>

        {/* Transport */}
        <motion.section {...fade} style={{ marginBottom: 52 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", color: "rgba(201,169,98,0.9)", marginBottom: 20, letterSpacing: "0.04em" }}>
            {ja ? "アクセス方法" : "Getting There"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRANSPORT.map((tr) => (
              <div key={tr.en} className="card" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "36px 1fr", gap: 16 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{tr.icon}</span>
                <div>
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                    {ja ? tr.ja : tr.en}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {ja ? tr.ja_body : tr.en_body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* What to bring */}
        <motion.section {...fade} style={{ marginBottom: 52 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", color: "rgba(201,169,98,0.9)", marginBottom: 20, letterSpacing: "0.04em" }}>
            {ja ? "持ち物リスト" : "What to Bring"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BRING.map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 18px",
                background: b.must ? "rgba(201,169,98,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${b.must ? "rgba(201,169,98,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 9,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0, color: b.must ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.25)" }}>
                  {b.must ? "★" : "○"}
                </span>
                <p style={{ color: b.must ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.4 }}>
                  {ja ? b.ja : b.en}
                </p>
                {b.must && (
                  <span style={{ marginLeft: "auto", fontSize: 9, letterSpacing: "0.1em", color: "rgba(201,169,98,0.6)", flexShrink: 0, textTransform: "uppercase" }}>
                    {ja ? "必須" : "MUST"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Banned items */}
        <motion.section {...fade} style={{ marginBottom: 52 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", color: "rgba(201,169,98,0.9)", marginBottom: 20, letterSpacing: "0.04em" }}>
            {ja ? "持ち込み禁止" : "Prohibited Items"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {BANNED.map((b, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "11px 18px",
                background: "rgba(255,80,80,0.03)",
                border: "1px solid rgba(255,80,80,0.1)",
                borderRadius: 9,
              }}>
                <span style={{ fontSize: 12, color: "rgba(255,80,80,0.6)", flexShrink: 0 }}>✕</span>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5 }}>
                  {ja ? b.ja : b.en}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sustainability */}
        <motion.section {...fade} style={{ marginBottom: 52 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,3vw,1.6rem)", color: "rgba(201,169,98,0.9)", marginBottom: 20, letterSpacing: "0.04em" }}>
            {ja ? "サステナビリティ" : "Sustainability"}
          </h2>
          <div className="card-gold" style={{ padding: "24px 26px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(201,169,98,0.7)", textTransform: "uppercase", marginBottom: 14 }}>
              SOLUNA GREEN PLEDGE
            </p>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
              {ja
                ? "SOLUNAは地球環境への責任を真剣に考えるイベントブランドです。SOLUNA FEST HAWAIIでも以下のポリシーを厳守します。"
                : "SOLUNA is committed to environmental responsibility. The following green policies apply at SOLUNA FEST HAWAII."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { ja: "使い捨てプラスチック完全禁止（ボトル・ストロー・カップ）", en: "Zero single-use plastics — no bottles, straws, or disposable cups" },
                { ja: "再利用可能カップ・容器のみ使用（会場内全食飲料ブース）", en: "Reusable cups and containers at all food & beverage vendors" },
                { ja: "廃棄物の分別・リサイクルステーションを会場各所に設置", en: "Waste sorting & recycling stations throughout the venue" },
                { ja: "地元ハワイ産の食材・飲料を優先採用", en: "Local Hawaiian food & beverage vendors prioritized" },
                { ja: "カーボンオフセットプログラムへの参加（詳細近日公開）", en: "Carbon offset program participation (details coming soon)" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "rgba(201,169,98,0.6)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6 }}>{ja ? item.ja : item.en}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Questions */}
        <motion.section {...fade} style={{ marginBottom: 48 }}>
          <div className="card" style={{ padding: "24px 28px", textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
              {ja ? "ご質問は" : "Questions?"}
            </p>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
              info@solun.art
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              {ja
                ? "チケット購入後の確認、特別なアクセシビリティ対応など、お気軽にご連絡ください。"
                : "Post-purchase confirmations, accessibility needs, or any other questions — we're here to help."}
            </p>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div {...fade} style={{ textAlign: "center" }}>
          <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ textDecoration: "none", marginRight: 10 }}>
            {ja ? "チケットを取る →" : "Get Tickets →"}
          </a>
          <Link href="/info" className="btn-ghost">{ja ? "アクセス情報" : "Venue Info"}</Link>
        </motion.div>

      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
