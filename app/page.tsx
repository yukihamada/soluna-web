"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const PHOTOS = [
  { src: "/images/fest/golden_hour.jpg" },
  { src: "/images/fest/ceremony.jpg" },
  { src: "/images/fest/crowd.jpg" },
  { src: "/images/fest/dj_stage.jpg" },
  { src: "/images/fest/drones.jpg" },
  { src: "/images/hero_bg.jpg" },
  { src: "/images/artist_life.jpg" },
  { src: "/images/01_sunrise_rave.jpg" },
];

const APPS = [
  { id: "properties", icon: "🏡", label: "物件一覧",      url: "/properties" },
  { id: "buy",        icon: "💰", label: "購入・申込",    url: "/buy" },
  { id: "scheme",     icon: "🗺️", label: "スキーム",      url: "/scheme" },
  { id: "investor",   icon: "📊", label: "投資家向け",    url: "/investor" },
  { id: "tapkop",     icon: "🏔️", label: "TAPKOP",        url: "/tapkop" },
  { id: "nesting",    icon: "🪵", label: "THE NEST",      url: "/nesting" },
  { id: "kagawa",     icon: "🌊", label: "香川 空き家",   url: "/kagawa-akiya" },
  { id: "wakayama",   icon: "🌿", label: "和歌山 空き家", url: "/wakayama-akiya" },
  { id: "zamna",      icon: "🎪", label: "ZAMNA HAWAII",  url: "/zamna" },
  { id: "tickets",    icon: "🎫", label: "チケット",      url: "/tickets" },
  { id: "lineup",     icon: "🎤", label: "ラインナップ",  url: "/lineup" },
  { id: "community",  icon: "💬", label: "コミュニティ",  url: "/community" },
  { id: "app",        icon: "📱", label: "アプリ",        url: "/app" },
  { id: "village",    icon: "🏘️", label: "ビレッジ",      url: "/village" },
  { id: "guide",      icon: "📖", label: "ガイド",        url: "/guide" },
  { id: "faq",        icon: "❓", label: "FAQ",           url: "/faq" },
];

const CATEGORIES = [
  { id: "invest", label: "別荘投資",       emoji: "🏡", ids: ["properties","buy","scheme","investor","tapkop","nesting"] },
  { id: "akiya",  label: "空き家活用",     emoji: "🌊", ids: ["kagawa","wakayama"] },
  { id: "fest",   label: "フェスティバル", emoji: "🎪", ids: ["zamna","tickets","lineup"] },
  { id: "comm",   label: "コミュニティ",   emoji: "💬", ids: ["community","app","village","guide","faq"] },
];

const DOCK_IDS = ["properties", "zamna", "community"];

const CSS = `
  body, html { overflow:hidden; margin:0; padding:0; }

  @keyframes kb1 { 0%{transform:scale(1) translate(0,0)} 100%{transform:scale(1.12) translate(-2%,-1.5%)} }
  @keyframes kb2 { 0%{transform:scale(1.1) translate(1.5%,1%)} 100%{transform:scale(1) translate(0,0)} }
  @keyframes kb3 { 0%{transform:scale(1.05) translate(-1%,1%)} 100%{transform:scale(1.11) translate(2%,-1%)} }
  @keyframes menuIn { from{opacity:0;transform:scale(.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes heroIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .slide { position:absolute; inset:0; background-size:cover; background-position:center;
    transition:opacity 2.4s ease-in-out; will-change:transform,opacity; }
  .slide-active { opacity:1; z-index:2; animation-duration:12s; animation-timing-function:ease-in-out; animation-fill-mode:both; }
  .slide-out    { opacity:0; z-index:3; }
  .slide-hidden { opacity:0; z-index:1; }

  .dock-icon { display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:12px;
    transition:transform .18s; flex-shrink:0; text-decoration:none; }
  .dock-icon:hover { transform:scale(1.28) translateY(-8px); }
  .di-em  { font-size:2.2rem; filter:drop-shadow(0 3px 8px rgba(0,0,0,.7)); }
  .di-lbl { font-size:.58rem; color:rgba(255,255,255,.6); font-family:Inter,sans-serif; white-space:nowrap; }

  .menu-panel {
    position:fixed; bottom:76px; left:50%; transform:translateX(-50%);
    width:min(640px,88vw);
    background:rgba(10,10,10,.92); backdrop-filter:blur(32px) saturate(180%);
    border:1px solid rgba(255,255,255,.1); border-radius:18px;
    padding:20px; z-index:999; animation:menuIn .16s ease;
    box-shadow:0 24px 64px rgba(0,0,0,.75);
  }
  .menu-search {
    width:100%; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1);
    border-radius:9px; padding:9px 14px; color:#fff; font-size:.85rem;
    outline:none; box-sizing:border-box; margin-bottom:18px; font-family:Inter,sans-serif;
  }
  .menu-search::placeholder { color:rgba(255,255,255,.3); }
  .cat-hd {
    display:flex; align-items:center; gap:7px;
    font-size:.58rem; letter-spacing:.14em; color:rgba(255,255,255,.3);
    font-family:Inter,sans-serif; margin:0 0 7px; text-transform:uppercase;
  }
  .cat-hd::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.07); }
  .app-row { display:flex; flex-wrap:wrap; gap:2px; margin-bottom:14px; }
  .app-item { display:flex; flex-direction:column; align-items:center; gap:5px;
    padding:10px 8px; border-radius:10px; transition:background .12s; width:76px;
    text-decoration:none; }
  .app-item:hover { background:rgba(201,169,98,.14); }
  .app-em  { font-size:1.7rem; }
  .app-lbl { font-size:.6rem; color:rgba(255,255,255,.8); text-align:center;
    font-family:Inter,sans-serif; line-height:1.3; }

  .hero-btn {
    padding:11px 24px; border-radius:3px; font-size:.75rem; font-weight:700;
    letter-spacing:.15em; transition:opacity .15s, transform .12s;
    font-family:Inter,sans-serif; white-space:nowrap; text-decoration:none; display:inline-block;
  }
  .hero-btn:hover { opacity:.88; transform:translateY(-1px); }
  .hero-btn-primary { background:#c9a962; color:#000; }
  .hero-btn-ghost   { background:transparent; color:rgba(255,255,255,.8);
    border:1px solid rgba(255,255,255,.25); }

  .dock-sep { width:1px; height:34px; background:rgba(255,255,255,.12); margin:0 4px; }

  .mobile-card { display:flex; align-items:center; gap:14px; padding:14px 16px;
    background:rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.1); border-radius:14px;
    text-decoration:none; backdrop-filter:blur(12px); transition:background .15s; }
  .mobile-card:hover { background:rgba(201,169,98,.15); }
`;

export default function Home() {
  const [curSlide, setCurSlide]   = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [clock, setClock]         = useState("--:--");
  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState("");
  const [isMobile, setIsMobile]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const kbAnims   = ["kb1","kb2","kb3"];

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("ja-JP", { hour:"2-digit", minute:"2-digit" }));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  const advance = useCallback(() => {
    setCurSlide(c => {
      const next = (c + 1) % PHOTOS.length;
      const el = slideRefs.current[c];
      if (el) {
        const frozen = getComputedStyle(el).transform;
        el.style.transform = frozen; el.style.animationName = "none";
        setTimeout(() => { if (el) { el.style.transform = ""; el.style.animationName = ""; } }, 2500);
      }
      setPrevSlide(c);
      setTimeout(() => setPrevSlide(null), 2500);
      return next;
    });
  }, []);

  useEffect(() => {
    const t = setInterval(advance, 9000);
    return () => clearInterval(t);
  }, [advance]);

  const filteredApps = APPS.filter(a =>
    !search || a.label.includes(search) || a.id.includes(search.toLowerCase())
  );
  const dockApps = APPS.filter(a => DOCK_IDS.includes(a.id));

  // ── Mobile ──────────────────────────────────────────────────────────────────
  if (mounted && isMobile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div style={{ position:"fixed", inset:0, backgroundImage:`url(${PHOTOS[0].src})`,
          backgroundSize:"cover", backgroundPosition:"center", filter:"brightness(.4)" }} />
        <div style={{ position:"relative", zIndex:1, minHeight:"100vh",
          padding:"20px 16px 60px", overflowY:"auto" }}>
          <div style={{ textAlign:"center", padding:"44px 0 28px" }}>
            <div style={{ fontSize:"2.2rem", fontWeight:700, letterSpacing:".15em",
              color:"#c9a962", fontFamily:"Anton,sans-serif" }}>SOLUNA</div>
            <div style={{ fontSize:".7rem", color:"rgba(255,255,255,.4)", marginTop:5,
              fontFamily:"Inter,sans-serif" }}>
              北海道 · 熱海 · ハワイ
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <div style={{ fontSize:".58rem", color:"rgba(255,255,255,.3)", letterSpacing:".12em",
                  marginBottom:5, fontFamily:"Inter,sans-serif" }}>
                  {cat.emoji} {cat.label.toUpperCase()}
                </div>
                {cat.ids.map(id => {
                  const app = APPS.find(a => a.id === id);
                  if (!app) return null;
                  return (
                    <a key={id} href={app.url} className="mobile-card" style={{ marginBottom:5 }}>
                      <span style={{ fontSize:"1.7rem" }}>{app.icon}</span>
                      <span style={{ fontSize:".88rem", fontWeight:600, color:"#fff",
                        fontFamily:"Inter,sans-serif" }}>{app.label}</span>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── Desktop ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        style={{ position:"fixed", inset:0, background:"#000" }}
        onClick={() => { if (menuOpen) setMenuOpen(false); }}
      >
        {/* Wallpaper */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0 }}>
          {PHOTOS.map((p, i) => {
            const isCur = i === curSlide, isOut = i === prevSlide;
            return (
              <div key={i} ref={el => { slideRefs.current[i] = el; }}
                className={`slide ${isCur ? "slide-active" : isOut ? "slide-out" : "slide-hidden"}`}
                style={{ backgroundImage:`url(${p.src})`,
                  animationName: isCur ? kbAnims[i % 3] : undefined }} />
            );
          })}
          <div style={{ position:"absolute", inset:0, zIndex:10,
            background:"linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.1) 40%,rgba(0,0,0,.65) 100%)" }} />
        </div>

        {/* ── Top bar ── */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:28, zIndex:300,
          background:"rgba(0,0,0,.65)", backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,.06)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 16px" }}>
          <span style={{ fontFamily:"Anton,sans-serif", fontSize:".8rem",
            letterSpacing:".15em", color:"#c9a962" }}>⬡ SOLUNA</span>
          <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.5)",
            fontVariantNumeric:"tabular-nums" }}>{clock}</span>
        </div>

        {/* ── Hero ── */}
        {mounted && (
          <div style={{
            position:"absolute", left:"50%", top:"50%",
            transform:"translate(-50%, -52%)",
            textAlign:"center", zIndex:50,
            animation:"heroIn .8s ease both",
            width:"min(640px, 90vw)",
          }}>
            <p style={{ fontSize:".68rem", letterSpacing:".35em",
              color:"rgba(255,255,255,.45)", marginBottom:16,
              fontFamily:"Inter,sans-serif" }}>
              北海道3万坪 · 熱海 · ハワイ · 780万円〜 · 年間30泊 · 登記所有
            </p>
            <h1 style={{ fontFamily:"Anton,sans-serif", fontSize:"clamp(2.8rem,7vw,5rem)",
              letterSpacing:".04em", lineHeight:.95, color:"#fff",
              textShadow:"0 4px 24px rgba(0,0,0,.7)", margin:"0 0 16px" }}>
              別荘コストを、<br />
              <span style={{ color:"#c9a962" }}>10分の1に。</span>
            </h1>
            <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.55)",
              lineHeight:1.7, marginBottom:28, fontFamily:"Inter,sans-serif",
              textShadow:"0 2px 8px rgba(0,0,0,.8)" }}>
              10口シェアで登記所有。780万円から、年間30泊。<br />
              使わない日はプロが運営して収益化。
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <Link href="/properties" className="hero-btn hero-btn-primary">
                物件を見る →
              </Link>
              <Link href="/zamna" className="hero-btn hero-btn-ghost">
                🎪 ZAMNA HAWAII &apos;26
              </Link>
              <Link href="/scheme" className="hero-btn hero-btn-ghost">
                スキームを詳しく
              </Link>
            </div>
            <p style={{ marginTop:18, fontSize:".65rem",
              color:"rgba(255,255,255,.25)", fontFamily:"Inter,sans-serif" }}>
              East Ventures 出資 · 2020年創業
            </p>
          </div>
        )}

        {/* ── All-apps panel ── */}
        {menuOpen && (
          <div className="menu-panel" onClick={e => e.stopPropagation()}>
            <input className="menu-search" placeholder="🔍 検索..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            {search ? (
              <div className="app-row">
                {filteredApps.map(app => (
                  <Link key={app.id} href={app.url} className="app-item">
                    <span className="app-em">{app.icon}</span>
                    <span className="app-lbl">{app.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              CATEGORIES.map(cat => {
                const catApps = cat.ids.map(id => APPS.find(a => a.id === id)).filter(Boolean) as typeof APPS;
                return (
                  <div key={cat.id}>
                    <div className="cat-hd"><span>{cat.emoji}</span>{cat.label}</div>
                    <div className="app-row">
                      {catApps.map(app => (
                        <Link key={app.id} href={app.url} className="app-item">
                          <span className="app-em">{app.icon}</span>
                          <span className="app-lbl">{app.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Dock ── */}
        <div
          style={{ position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)",
            zIndex:400, display:"flex", alignItems:"center",
            background:"rgba(0,0,0,.5)", backdropFilter:"blur(28px) saturate(180%)",
            border:"1px solid rgba(255,255,255,.11)", borderRadius:22,
            padding:"6px 12px" }}
          onClick={e => e.stopPropagation()}
        >
          {dockApps.map(app => (
            <Link key={app.id} href={app.url} className="dock-icon">
              <span className="di-em">{app.icon}</span>
              <span className="di-lbl">{app.label}</span>
            </Link>
          ))}

          <div className="dock-sep" />

          {/* All-apps button */}
          <div className="dock-icon" style={{ cursor:"pointer" }}
            onClick={() => { setMenuOpen(s => !s); setSearch(""); }}>
            <div style={{ width:36, height:36, borderRadius:9,
              background: menuOpen ? "rgba(201,169,98,.3)" : "rgba(255,255,255,.08)",
              border:`1px solid ${menuOpen ? "rgba(201,169,98,.5)" : "rgba(255,255,255,.1)"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"1.1rem", transition:"all .18s" }}>
              {menuOpen ? "✕" : "⊞"}
            </div>
            <span className="di-lbl" style={{ color: menuOpen ? "#c9a962" : undefined }}>すべて</span>
          </div>
        </div>

      </div>
    </>
  );
}
