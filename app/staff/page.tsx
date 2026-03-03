"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";
import { downloadPDF } from "@/lib/pdf";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const ROLES = [
  {
    ja: "ゲートスタッフ", en: "Gate Staff",
    count: "8–10",
    ja_d: "チケットスキャン、ID確認（21歳以上）、バッグチェック補助、リストバンド装着",
    en_d: "Ticket scanning, ID verification (21+), bag check assist, wristband application",
  },
  {
    ja: "VIPホスト", en: "VIP Host",
    count: "4–6",
    ja_d: "VIP・ダイヤモンドゲストの案内、専用エリアのアクセス管理、ホスピタリティ対応",
    en_d: "VIP & Diamond guest concierge, access control, hospitality",
  },
  {
    ja: "ステージクルー", en: "Stage Crew",
    count: "6–8",
    ja_d: "ステージ転換、機材管理、アーティストのステージ入退場サポート",
    en_d: "Stage changeover, equipment management, artist stage access support",
  },
  {
    ja: "飲食スタッフ", en: "F&B Staff",
    count: "15–20",
    ja_d: "バー運営（3箇所）、フードブース、ID確認（アルコール）、在庫管理",
    en_d: "Bar operations (3 bars), food booths, alcohol ID check, inventory",
  },
  {
    ja: "セキュリティ", en: "Security",
    count: "30–40",
    ja_d: "入場管理、巡回、緊急対応、迷惑行為対処（外部委託）",
    en_d: "Access control, patrol, emergency response, misconduct handling (outsourced)",
  },
  {
    ja: "医療チーム", en: "Medical Team",
    count: "3–4",
    ja_d: "EMT（救急救命士）、看護師、メディカルテント運営",
    en_d: "EMTs, nurse, medical tent operations",
  },
  {
    ja: "シャトル/交通整理", en: "Shuttle / Traffic",
    count: "4–6",
    ja_d: "シャトルバス誘導、タクシー/ライドシェアゾーン管理、駐車場案内",
    en_d: "Shuttle guidance, rideshare zone management, parking direction",
  },
  {
    ja: "クリーンアップ/サステナビリティ", en: "Cleanup / Sustainability",
    count: "6–8",
    ja_d: "リサイクルステーション管理、ゴミ分別誘導、イベント後の完全撤収",
    en_d: "Recycling station management, waste sorting, post-event teardown",
  },
  {
    ja: "メディア/PRアテンド", en: "Media / PR Attend",
    count: "2",
    ja_d: "プレス受付、メディア誘導、SNS撮影サポート",
    en_d: "Press check-in, media guidance, social media photo support",
  },
];

const SHIFTS = [
  { time: "06:00–18:00", ja: "セットアップシフト", en: "Setup Shift", ja_d: "会場設営、音響チェック、ケータリング搬入", en_d: "Venue setup, sound check, catering load-in" },
  { time: "16:00–03:30", ja: "イベントシフト A", en: "Event Shift A", ja_d: "開場前〜終演。ゲート、VIP、飲食、セキュリティ", en_d: "Pre-open to close. Gate, VIP, F&B, security" },
  { time: "20:00–03:30", ja: "イベントシフト B", en: "Event Shift B", ja_d: "ピーク時間帯の増員。飲食、セキュリティ追加", en_d: "Peak hours reinforcement. Extra F&B, security" },
  { time: "03:00–08:00", ja: "撤収シフト", en: "Teardown Shift", ja_d: "クリーンアップ、機材撤去、ゴミ分別", en_d: "Cleanup, equipment removal, waste sorting" },
];

const CHECKLIST = {
  ja: [
    "黒のTシャツ（スタッフ用は当日支給）を着用",
    "動きやすい靴（安全靴推奨。ヒール禁止）",
    "日焼け止め・帽子（日中シフトの方）",
    "水筒（スタッフ用給水あり）",
    "携帯電話（フル充電で来場）",
    "IDカード/運転免許証（本人確認用）",
    "必要な方: 持病の薬、アレルギー情報カード",
  ],
  en: [
    "Wear black T-shirt (staff shirts provided on-site)",
    "Comfortable, closed-toe shoes (safety shoes recommended, no heels)",
    "Sunscreen & hat (for daytime shifts)",
    "Water bottle (staff hydration station available)",
    "Fully charged mobile phone",
    "Photo ID / driver's license",
    "If applicable: personal medication, allergy info card",
  ],
};

const RULES = {
  ja: [
    "勤務中のアルコール飲酒は厳禁。発覚した場合は即解雇",
    "携帯電話は休憩時間のみ使用可。勤務中はマナーモード",
    "来場者への対応は丁寧かつプロフェッショナルに",
    "問題発生時はまず無線でリーダーに報告。独断で対処しない",
    "休憩は指定エリア（バックステージ休憩室）で。会場内での喫食禁止",
    "イベント内容・アーティスト情報のSNS投稿は禁止（NDA署名済み）",
    "緊急時は安全計画に従い、来場者の誘導を最優先に行動",
  ],
  en: [
    "Zero alcohol on duty. Immediate termination if caught",
    "Mobile phones: break time only. Silent mode during shifts",
    "Treat all guests with courtesy and professionalism",
    "Report issues to your lead via radio first. Do not act alone",
    "Breaks in designated area (backstage rest room) only. No eating in venue",
    "No social media posts about event content or artists (NDA signed)",
    "In emergencies, follow safety plan. Guest evacuation is top priority",
  ],
};

export default function StaffPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  const renderList = (items: string[]) => (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, paddingLeft: 16, position: "relative" }}>
          <span style={{ position: "absolute", left: 0, color: "var(--gold)" }}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );

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
          <Link href="/safety" className="nav-pill">{ja ? "安全" : "Safety"}</Link>
          <span className="nav-pill-active">{ja ? "スタッフ" : "Staff"}</span>
          <button onClick={() => downloadPDF("pdf-content", "ZAMNA-Staff-Manual.pdf")} className="nav-pill" style={{ cursor: "pointer" }}>PDF</button>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div id="pdf-content" style={{ maxWidth: 700, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.8)", marginBottom: 24, textTransform: "uppercase" }}>
            Staff Manual · Internal
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.5rem,10vw,4.5rem)", lineHeight: 0.95, marginBottom: 20, color: "#fff" }}>
            {ja ? "スタッフ\nマニュアル" : "STAFF\nMANUAL"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>
            {ja ? "ZAMNA HAWAII 2026 — 全スタッフ・ボランティア向け運営ガイド" : "ZAMNA HAWAII 2026 — Operations Guide for All Staff & Volunteers"}
          </p>
        </motion.div>

        {/* Roles */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "役割と人員配置" : "Roles & Staffing"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ROLES.map(r => (
              <div key={r.en} className="card" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{ja ? r.ja : r.en}</p>
                  <span style={{ color: "var(--gold)", fontSize: 12, fontWeight: 700 }}>{r.count} {ja ? "名" : "ppl"}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5 }}>{ja ? r.ja_d : r.en_d}</p>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 12 }}>
            {ja ? "合計: 約80〜110名（セキュリティ含む）" : "Total: approx. 80–110 staff (incl. security)"}
          </p>
        </motion.section>

        {/* Shifts */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "シフト体制" : "Shift Schedule"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SHIFTS.map(s => (
              <div key={s.en} className="card-gold" style={{ padding: "18px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{ja ? s.ja : s.en}</p>
                  <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{s.time}</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{ja ? s.ja_d : s.en_d}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Checklist */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "持ち物チェックリスト" : "What to Bring"}
          </h2>
          <div className="card" style={{ padding: "24px 28px" }}>
            {renderList(ja ? CHECKLIST.ja : CHECKLIST.en)}
          </div>
        </motion.section>

        {/* Rules */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "行動規範" : "Code of Conduct"}
          </h2>
          <div className="card" style={{ padding: "24px 28px", borderColor: "rgba(255,80,80,0.2)" }}>
            {renderList(ja ? RULES.ja : RULES.en)}
          </div>
        </motion.section>

        {/* Radio Channels */}
        <motion.section {...fade} style={{ marginBottom: 60 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "無線チャンネル" : "Radio Channels"}
          </h2>
          <div className="data-table">
            {[
              { ch: "CH 1", ja: "統括本部（全体）", en: "Operations (All)" },
              { ch: "CH 2", ja: "セキュリティ", en: "Security" },
              { ch: "CH 3", ja: "ステージ / 音響", en: "Stage / Sound" },
              { ch: "CH 4", ja: "飲食 / ケータリング", en: "F&B / Catering" },
              { ch: "CH 5", ja: "医療 / 緊急", en: "Medical / Emergency" },
              { ch: "CH 6", ja: "シャトル / 交通", en: "Shuttle / Traffic" },
            ].map((c, i) => (
              <div key={c.ch} className="data-row" style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                <span className="data-row-label" style={{ color: "var(--gold)", fontWeight: 700 }}>{c.ch}</span>
                <span className="data-row-value" style={{ color: "rgba(255,255,255,0.7)", textAlign: "right" }}>{ja ? c.ja : c.en}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Emergency Quick Ref */}
        <motion.section {...fade} style={{ marginBottom: 40 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 24 }}>
            {ja ? "緊急時クイックリファレンス" : "Emergency Quick Reference"}
          </h2>
          <div className="card-gold" style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { ja_t: "けが人・体調不良者を発見", en_t: "Injured / ill guest found", ja_a: "→ CH5で医療チームを呼ぶ → メディカルテントへ誘導", en_a: "→ Call medical on CH5 → Guide to medical tent" },
                { ja_t: "不審者・迷惑行為", en_t: "Suspicious person / misconduct", ja_a: "→ CH2でセキュリティに報告 → 対象者から離れて待機", en_a: "→ Report to security on CH2 → Stand clear, observe" },
                { ja_t: "避難指示（放送あり）", en_t: "Evacuation order (PA announcement)", ja_a: "→ 最寄りの非常口へ来場者を誘導 → 走らず落ち着いて", en_a: "→ Guide guests to nearest exit → Stay calm, no running" },
                { ja_t: "火災・発煙", en_t: "Fire / smoke", ja_a: "→ 911通報 + CH1で統括に報告 → 来場者を避難誘導", en_a: "→ Call 911 + report on CH1 → Evacuate guests" },
              ].map(e => (
                <div key={e.en_t}>
                  <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ja ? e.ja_t : e.en_t}</p>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{ja ? e.ja_a : e.en_a}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </div>
      <InnerFooter lang={lang} />
    </main>
  );
}
