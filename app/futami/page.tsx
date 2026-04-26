"use client";
import React, { useState } from "react";
import Link from "next/link";

const PASS = "soluna2033";

/* ── Design tokens ── */
const C = {
  bg: "#080808",
  surface: "#0f0f0f",
  border: "rgba(255,255,255,0.07)",
  gold: "#c9a962",
  goldDim: "rgba(201,169,98,0.08)",
  goldBd: "rgba(201,169,98,0.22)",
  muted: "rgba(255,255,255,0.45)",
  purple: "#8b6ef0",
  purpleDim: "rgba(139,110,240,0.08)",
  purpleBd: "rgba(139,110,240,0.25)",
};

/* ── Idea definitions ── */
const ideas = [
  {
    num: "01",
    color: "#9b7fff",
    bg: "rgba(139,110,240,0.07)",
    bd: "rgba(139,110,240,0.22)",
    icon: "🌅",
    tag: "メディア爆発力 MAX",
    title: "Sunrise Misogi Rave",
    subtitle: "夜明け × 禊 × アンダーグラウンド",
    body: "伊勢湾の夜明け、夫婦岩を背景に120名限定のSOLUNA DJセット。参加者は前夜クリエイター村に宿泊必須。「禊」という概念をレイブ体験に変換する。",
    bullets: [
      "120名限定・¥200k〜/人（村宿泊込み）",
      "SOLUNAラインナップDJがヘッドライン",
      "日の出15分前からセットスタート、波音とビートが混ざる",
      "\"世界で唯一、神社でやるレイブ\" としてPR",
    ],
    imgs: [
      { src: "/futami-img/01_sunrise_rave.jpg", alt: "夫婦岩の前のDJセット" },
      { src: "/futami-img/01b.jpg",            alt: "夜明けのDJ" },
      { src: "/futami-img/01c.jpg",            alt: "海中に立つ参加者" },
    ],
  },
  {
    num: "02",
    color: "#c9a962",
    bg: "rgba(201,169,98,0.07)",
    bd: "rgba(201,169,98,0.22)",
    icon: "🎵",
    tag: "ブランド価値 MAX",
    title: "アーティスト・レジデンス",
    subtitle: "SOLUNAアーティストが二見浦で作品制作",
    body: "SOLUNAのラインナップアーティストを1〜4週間クリエイター村に招待。滞在中に制作した楽曲を「二見浦で生まれた作品」としてSOLUNA本番で世界初披露。",
    bullets: [
      "DJ Nobu / WhoMadeWho / Mathame などを招待",
      "制作過程をドキュメンタリー化→SNS配信",
      "\"ハワイのフェスが日本の聖地で音楽制作\" プレスリリース",
      "完成曲はFUTAMI村の作品として永久保存",
    ],
    imgs: [
      { src: "/futami-img/02_artist_residence.jpg", alt: "古民家スタジオ" },
      { src: "/futami-img/02b.jpg",                 alt: "制作中のプロデューサー" },
    ],
  },
  {
    num: "03",
    color: "#6fcf97",
    bg: "rgba(111,207,151,0.07)",
    bd: "rgba(111,207,151,0.22)",
    icon: "✨",
    tag: "世界拡散力 MAX",
    title: "ドローンショー × 夫婦岩",
    subtitle: "300機 × 伊勢湾 × 遷宮2033",
    body: "SOLUNAのドローン300機を二見浦に持ち込み、夫婦岩を中心に伊勢湾上空で光の鳥居を描く。2033年遷宮の年に「現代の神事」として世界発信。",
    bullets: [
      "FAA申請の知見がそのまま国交省申請に転用可能",
      "夫婦岩・日の出・ドローン300機の映像は世界最強コンテンツ",
      "NHK・BBCへのプレス配信で自然拡散",
      "2027/2029/2031/2033年と毎年スケールアップ",
    ],
    imgs: [
      { src: "/futami-img/03_drone_show.jpg", alt: "ドローン鳥居" },
      { src: "/futami-img/03b.jpg",           alt: "夜空のドローン群" },
    ],
  },
  {
    num: "04",
    color: "#e8a87c",
    bg: "rgba(232,168,124,0.07)",
    bd: "rgba(232,168,124,0.22)",
    icon: "🪙",
    tag: "コミュニティ強度 MAX",
    title: "トークン・クロスユーティリティ",
    subtitle: "FUTAMIトークン ↔ SOLUNAパス",
    body: "FUTAMIトークン保有者はSOLUNA HAWAIIのVIPアップグレードが可能。逆にSOLUNAパス保有者はクリエイター村の宿泊優先予約権を得る。日本の聖地 ↔ ハワイのビーチの文化的往復。",
    bullets: [
      "ENAIトークンの設計をそのまま転用（Solanaベース）",
      "保有量に応じてFUTAMI村のガバナンス投票権",
      "SOLUNAのWeb3コミュニティが二見浦ファンになる",
      "国際的な分散コミュニティが日本の地方を支える構造",
    ],
    imgs: [
      { src: "/futami-img/04_token.jpg", alt: "トークンビジュアル" },
    ],
  },
  {
    num: "05",
    color: "#e879f9",
    bg: "rgba(232,121,249,0.07)",
    bd: "rgba(232,121,249,0.22)",
    icon: "🎪",
    tag: "長期戦略 MAX",
    title: "遷宮カウントダウン・フェスシリーズ",
    subtitle: "2027→2029→2031→2033 規模拡大",
    body: "SOLUNA HAWAIIの姉妹版として二見浦に年1回のフェスを開催。クリエイター村の住民がオープニングアクトを担い、遷宮に向けて毎年規模が拡大する7年間のストーリーを作る。",
    bullets: [
      "2027: 1,000名 先行テスト",
      "2029: 3,000名 クリエイター村×フェス融合",
      "2031: 7,000名 高級ホテル開業でVIP層獲得",
      "2033: 20,000名 遷宮フィナーレ・世界発信",
    ],
    imgs: [
      { src: "/futami-img/05_festival_series.jpg", alt: "伊勢ビーチフェス" },
      { src: "/futami-img/05b.jpg",                alt: "フェスのステージ" },
    ],
  },
];

/* ── Password gate ── */
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState(false);

  function attempt() {
    if (val.trim() === PASS) { onUnlock(); }
    else { setErr(true); setVal(""); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
      {/* bg glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(139,110,240,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ textAlign: "center", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.45em", color: C.muted, marginBottom: 32, textTransform: "uppercase" }}>
          SOLUNA × FUTAMI — Confidential
        </p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.8rem,12vw,4.5rem)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, marginBottom: 16 }}>
          ACCESS<br />REQUIRED
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 40 }}>
          このページは招待制です。<br />パスワードを入力してください。
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="password"
            value={val}
            onChange={e => { setVal(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="パスワード"
            autoFocus
            style={{
              flex: 1, background: "rgba(255,255,255,0.04)",
              border: `1px solid ${err ? "rgba(255,80,80,0.5)" : C.border}`,
              borderRadius: 12, padding: "14px 18px", color: "#fff",
              fontSize: 15, outline: "none", fontFamily: "Inter,sans-serif",
              transition: "border-color 0.2s",
            }}
          />
          <button
            onClick={attempt}
            style={{ background: C.purple, border: "none", borderRadius: 12, padding: "14px 24px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Inter,sans-serif", letterSpacing: "0.04em" }}
          >
            入室
          </button>
        </div>
        {err && <p style={{ fontSize: 12, color: "rgba(255,80,80,0.8)", marginTop: 10 }}>パスワードが違います</p>}
      </div>
    </div>
  );
}

/* ── Image grid for each idea ── */
function ImgGrid({ imgs, color }: { imgs: { src: string; alt: string }[]; color: string }) {
  if (imgs.length === 1) {
    return (
      <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", marginBottom: 28 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[0].src} alt={imgs[0].alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  if (imgs.length === 2) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 28, borderRadius: 16, overflow: "hidden" }}>
        {imgs.map(img => (
          <div key={img.src} style={{ aspectRatio: "4/3", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
    );
  }
  /* 3 images */
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 8, marginBottom: 28, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ gridColumn: "1 / -1", aspectRatio: "16/7", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgs[0].src} alt={imgs[0].alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
      {imgs.slice(1).map(img => (
        <div key={img.src} style={{ aspectRatio: "4/3", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Single idea card ── */
function IdeaCard({ idea }: { idea: (typeof ideas)[0] }) {
  return (
    <article style={{ marginBottom: 40 }}>
      {/* label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: "0.25em", color: idea.color }}>
          IDEA {idea.num}
        </span>
        <div style={{ flex: 1, height: 1, background: idea.bd }} />
        <span style={{ fontSize: 10, color: idea.color, border: `1px solid ${idea.bd}`, borderRadius: 999, padding: "3px 12px", letterSpacing: "0.1em" }}>
          {idea.tag}
        </span>
      </div>

      {/* photo grid */}
      <ImgGrid imgs={idea.imgs} color={idea.color} />

      {/* text content */}
      <div style={{ background: idea.bg, border: `1px solid ${idea.bd}`, borderRadius: 20, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>{idea.icon}</span>
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#fff", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: 2 }}>
              {idea.title}
            </h2>
            <p style={{ fontSize: 12, color: idea.color, letterSpacing: "0.06em" }}>{idea.subtitle}</p>
          </div>
        </div>

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", lineHeight: 1.85, marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${idea.bd}` }}>
          {idea.body}
        </p>

        <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
          {idea.bullets.map((b, i) => (
            <li key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.52)", paddingLeft: 18, position: "relative", lineHeight: 1.55 }}>
              <span style={{ position: "absolute", left: 0, color: idea.color, fontWeight: 700 }}>→</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/* ── Main page ── */
function Content() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* fixed glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(139,110,240,0.05) 0%, transparent 55%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: `1px solid ${C.border}`, background: "rgba(8,8,8,0.9)", backdropFilter: "blur(14px)" }}>
        <Link href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: "0.25em", color: C.muted, textDecoration: "none" }}>SOLUNA FEST HAWAII</Link>
        <span style={{ fontSize: 10, color: C.purple, letterSpacing: "0.2em", border: `1px solid ${C.purpleBd}`, borderRadius: 999, padding: "4px 12px" }}>FUTAMI COLLAB — CONFIDENTIAL</span>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 100px", position: "relative", zIndex: 1 }}>

        {/* ── HERO IMAGE ── */}
        <div style={{ margin: "0 -24px 56px", position: "relative", height: "70vh", minHeight: 420, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/futami-img/hero.jpg" alt="二見浦の夜明け" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,8,0.15) 0%, rgba(8,8,8,0.0) 30%, rgba(8,8,8,0.7) 75%, rgba(8,8,8,1) 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 40px 48px" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.45em", color: "rgba(201,169,98,0.8)", textTransform: "uppercase", marginBottom: 12 }}>
              Strategic Collaboration Brief 2026
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(3rem,10vw,6rem)", color: "#fff", letterSpacing: "0.02em", lineHeight: 1, marginBottom: 12 }}>
              SOLUNA<br /><span style={{ color: C.gold }}>× 二見浦</span>
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 520, lineHeight: 1.7 }}>
              伊勢・二見浦のクリエイター村×トークンプロジェクトと、SOLUNAフェストがコラボする5つのアイデア。2033年式年遷宮を照準に、日本とハワイをつなぐ。
            </p>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 64 }}>
          {[
            { v: "7年", l: "2026→2033" },
            { v: "1,400万", l: "遷宮年の参拝者" },
            { v: "¥710億", l: "エリア創出価値" },
            { v: "IRR 18%+", l: "トークン込み試算" },
          ].map(s => (
            <div key={s.l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 20px" }}>
              <div style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 800, color: C.gold, letterSpacing: "-0.02em", marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.05em" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── IDEAS ── */}
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.4em", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>Collaboration Ideas</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,6vw,3.5rem)", color: "#fff", marginBottom: 48 }}>5つのアイデア</h2>
          {ideas.map(idea => <IdeaCard key={idea.num} idea={idea} />)}
        </div>

        {/* ── RECOMMENDATION ── */}
        <div style={{ background: C.goldDim, border: `1px solid ${C.goldBd}`, borderRadius: 24, overflow: "hidden" }}>
          <div style={{ height: 280, overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/futami-img/01_sunrise_rave.jpg" alt="推薦" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 20%, rgba(8,8,8,0.9) 100%)" }} />
            <div style={{ position: "absolute", bottom: 24, left: 32 }}>
              <span style={{ fontSize: 10, letterSpacing: "0.3em", color: C.gold, background: "rgba(8,8,8,0.7)", backdropFilter: "blur(8px)", border: `1px solid ${C.goldBd}`, borderRadius: 999, padding: "4px 14px" }}>
                RECOMMENDATION
              </span>
            </div>
          </div>
          <div style={{ padding: "32px 36px 40px" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,6vw,3rem)", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
              まず「Sunrise Misogi Rave 2027」<br />から動かす
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, marginBottom: 24 }}>
              IDEA 01（夜明けレイブ）× IDEA 02（アーティスト・レジデンス）を組み合わせて2027年に120名テスト開催。
              SOLUNAのアーティストが二見浦に1週間滞在して楽曲制作 → その曲を夫婦岩の前で世界初披露、というストーリーが最もPR効果が高い。
              費用対効果が最大で、失敗しても学習コストが低い。
              IDEA 03（ドローン）と IDEA 05（フェスシリーズ）はその成功を見てスケールさせる。
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
              {["2027 テスト開催", "2029 規模拡大", "2031 ホテル開業", "2033 遷宮フィナーレ"].map((label, i) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.gold, marginBottom: 4 }}>0{i + 1}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 56, paddingTop: 28, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 12, color: C.muted }}>SOLUNA × 二見浦 Collective — Confidential 2026</p>
          <a href="https://futami-collective.fly.dev/" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.purple, textDecoration: "none", borderBottom: `1px solid ${C.purpleBd}`, paddingBottom: 2 }}>
            二見浦 Collective 提案書 →
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Root ── */
export default function FutamiPage() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />;
  return <Content />;
}
