"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Photos ───────────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: "/images/fest/golden_hour.jpg",   caption: "Golden Hour · Hawaii" },
  { src: "/images/fest/ceremony.jpg",      caption: "Ceremony · SOLUNA" },
  { src: "/images/fest/crowd.jpg",         caption: "Crowd · SOLUNA FEST" },
  { src: "/images/fest/dj_stage.jpg",      caption: "DJ Stage · Underground" },
  { src: "/images/fest/drones.jpg",        caption: "Drone Show · Night Sky" },
  { src: "/images/fest/pianist.jpg",       caption: "Live Piano · SOLUNA" },
  { src: "/images/hero_bg.jpg",            caption: "SOLUNA" },
  { src: "/images/artist_life.jpg",        caption: "Artist Life" },
  { src: "/images/01_sunrise_rave.jpg",    caption: "Sunrise Rave" },
  { src: "/images/02_artist_residence.jpg",caption: "Artist Residence" },
  { src: "/images/03_drone_show.jpg",      caption: "Drone Show" },
];

// ── Apps ─────────────────────────────────────────────────────────────────────
const APPS = [
  // 別荘投資
  { id: "materials", icon: "🏡", label: "物件一覧",     url: "/materials" },
  { id: "buy",       icon: "💰", label: "購入・申込",   url: "/buy" },
  { id: "scheme",    icon: "🗺️", label: "スキーム",     url: "/scheme" },
  { id: "investor",  icon: "📊", label: "投資家向け",   url: "/investor" },
  { id: "tapkop",    icon: "🏔️", label: "TAPKOP",       url: "/tapkop" },
  { id: "nesting",   icon: "🪵", label: "THE NEST",     url: "/nesting" },
  // 空き家活用
  { id: "kagawa",    icon: "🌊", label: "香川 空き家",  url: "/kagawa-akiya" },
  { id: "wakayama",  icon: "🌿", label: "和歌山 空き家", url: "/wakayama-akiya" },
  // フェスティバル
  { id: "zamna",     icon: "🎪", label: "ZAMNA HAWAII", url: "/zamna" },
  { id: "tickets",   icon: "🎫", label: "チケット",     url: "/tickets" },
  { id: "lineup",    icon: "🎤", label: "ラインナップ", url: "/lineup" },
  // コミュニティ
  { id: "community", icon: "💬", label: "コミュニティ", url: "/community" },
  { id: "app",       icon: "📱", label: "アプリ",       url: "/app" },
  { id: "village",   icon: "🏘️", label: "ビレッジ",     url: "/village" },
  { id: "guide",     icon: "📖", label: "ガイド",       url: "/guide" },
  { id: "faq",       icon: "❓", label: "FAQ",          url: "/faq" },
];

const DOCK_IDS = ["materials", "buy", "zamna", "tickets", "community"];

// ── Categories (menu bar dropdowns + start menu) ──────────────────────────────
const CATEGORIES = [
  { id: "invest", label: "物件・投資",     emoji: "🏡", ids: ["materials", "buy", "scheme", "investor", "tapkop", "nesting"] },
  { id: "akiya",  label: "空き家活用",     emoji: "🌊", ids: ["kagawa", "wakayama"] },
  { id: "fest",   label: "フェスティバル", emoji: "🎪", ids: ["zamna", "tickets", "lineup"] },
  { id: "comm",   label: "コミュニティ",   emoji: "💬", ids: ["community", "app", "village", "guide", "faq"] },
];

// ── Dock groups (dividers between each group) ─────────────────────────────────
const DOCK_GROUPS = [
  ["materials", "buy"],
  ["zamna", "tickets"],
  ["community"],
];

interface Win {
  id: string;
  title: string;
  url: string;
  x: number; y: number;
  w: number; h: number;
  z: number;
  min: boolean;
}

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  body, html { overflow: hidden; margin:0; padding:0; }

  @keyframes kb1 { 0%{transform:scale(1) translate(0%,0%)}   100%{transform:scale(1.13) translate(-2%,-1.5%)} }
  @keyframes kb2 { 0%{transform:scale(1.1) translate(1.5%,1%)} 100%{transform:scale(1) translate(0%,0%)} }
  @keyframes kb3 { 0%{transform:scale(1.05) translate(-1%,1%)} 100%{transform:scale(1.12) translate(2%,-1%)} }

  @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes winPop    { from{opacity:0;transform:scale(.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes menuIn    { from{opacity:0;transform:scale(.97) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .slide {
    position:absolute; inset:0;
    background-size:cover; background-position:center;
    transition:opacity 2s ease-in-out;
    will-change:transform,opacity;
  }
  .slide-active { opacity:1; z-index:2; animation-duration:11s; animation-timing-function:ease-in-out; animation-fill-mode:both; }
  .slide-out    { opacity:0; z-index:3; }
  .slide-hidden { opacity:0; z-index:1; }

  .desk-icon {
    display:flex; flex-direction:column; align-items:center; gap:5px;
    padding:10px 8px; border-radius:12px; cursor:pointer;
    transition:background .15s, transform .15s;
  }
  .desk-icon:hover { background:rgba(255,255,255,.12); transform:scale(1.08); }
  .di-emoji { font-size:2rem; line-height:1; }
  .di-label {
    font-size:.62rem; color:rgba(255,255,255,.9); text-align:center;
    text-shadow:0 1px 4px rgba(0,0,0,1); white-space:nowrap;
    font-family:Inter,-apple-system,sans-serif;
  }

  .dock-icon {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:12px; cursor:pointer;
    transition:transform .18s; flex-shrink:0;
  }
  .dock-icon:hover { transform:scale(1.3) translateY(-10px); }
  .di-dock-em { font-size:2.4rem; filter:drop-shadow(0 3px 8px rgba(0,0,0,.7)); }
  .di-dock-lbl { font-size:.58rem; color:rgba(255,255,255,.65); font-family:Inter,sans-serif; white-space:nowrap; }

  .win { position:fixed; border-radius:12px; overflow:hidden; display:flex; flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.1);
    animation:winPop .18s ease; }
  .win-bar { height:36px; display:flex; align-items:center; padding:0 10px; gap:8px;
    background:rgba(28,28,28,.96); backdrop-filter:blur(20px);
    cursor:move; flex-shrink:0; user-select:none; }
  .win-btn { width:13px; height:13px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0; }
  .win-title { flex:1; text-align:center; font-size:.72rem; color:rgba(255,255,255,.55);
    font-family:Inter,sans-serif; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .win-body { flex:1; background:#0a0a0a; overflow:hidden; }
  .win-body iframe { width:100%; height:100%; border:none; display:block; }
  .win.minimized { height:36px !important; }
  .win.minimized .win-body { display:none; }

  .start-menu {
    position:fixed; bottom:68px; left:50%; transform:translateX(-50%);
    width:min(700px,90vw);
    background:rgba(12,12,12,.88); backdrop-filter:blur(32px) saturate(180%);
    border:1px solid rgba(255,255,255,.12); border-radius:20px;
    padding:24px; z-index:999;
    animation:menuIn .18s ease;
    box-shadow:0 32px 80px rgba(0,0,0,.7);
  }
  .start-search {
    width:100%; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
    border-radius:10px; padding:10px 14px; color:#fff; font-size:.9rem;
    outline:none; box-sizing:border-box; margin-bottom:20px;
    font-family:Inter,sans-serif;
  }
  .start-search::placeholder { color:rgba(255,255,255,.35); }
  .start-grid {
    display:grid; grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); gap:6px;
  }
  .start-item {
    display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px 8px;
    border-radius:12px; cursor:pointer; transition:background .15s;
  }
  .start-item:hover { background:rgba(201,169,98,.15); }
  .start-item-em { font-size:1.8rem; }
  .start-item-lbl { font-size:.65rem; color:rgba(255,255,255,.8); text-align:center;
    font-family:Inter,sans-serif; }

  .menu-divider { width:1px; height:32px; background:rgba(255,255,255,.15); margin:0 4px; }

  .cat-header {
    display:flex; align-items:center; gap:8px;
    font-size:.6rem; letter-spacing:.12em; color:rgba(255,255,255,.35);
    font-family:Inter,sans-serif; margin:0 0 8px; text-transform:uppercase;
  }
  .cat-header::after {
    content:''; flex:1; height:1px; background:rgba(255,255,255,.08);
  }
  .start-row {
    display:flex; flex-wrap:wrap; gap:4px; margin-bottom:18px;
  }

  .mb-menu-item {
    position:relative; display:flex; align-items:center; height:100%;
  }
  .mb-menu-btn {
    font-size:.72rem; color:rgba(255,255,255,.7); cursor:pointer;
    padding:2px 8px; border-radius:4px; transition:background .1s, color .1s;
    white-space:nowrap;
  }
  .mb-menu-btn:hover, .mb-menu-btn.open { background:rgba(255,255,255,.12); color:#fff; }
  .mb-dropdown {
    position:absolute; top:calc(100% + 4px); left:0;
    background:rgba(10,10,10,.94); backdrop-filter:blur(24px) saturate(180%);
    border:1px solid rgba(255,255,255,.1); border-radius:10px;
    padding:6px; min-width:190px; z-index:600;
    animation:menuIn .14s ease;
    box-shadow:0 16px 48px rgba(0,0,0,.8);
  }
  .mb-drop-item {
    display:flex; align-items:center; gap:10px; padding:7px 12px;
    border-radius:7px; cursor:pointer; transition:background .12s;
  }
  .mb-drop-item:hover { background:rgba(201,169,98,.15); }
  .mb-drop-icon { font-size:1.1rem; }
  .mb-drop-lbl { font-size:.78rem; color:rgba(255,255,255,.85); font-family:Inter,sans-serif; }

  .dock-sep { width:1px; height:36px; background:rgba(255,255,255,.13); margin:0 6px; }

  .mobile-card {
    display:flex; align-items:center; gap:14px; padding:14px 16px;
    background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.1);
    border-radius:14px; cursor:pointer; text-decoration:none;
    backdrop-filter:blur(12px); transition:background .15s;
  }
  .mobile-card:hover { background:rgba(201,169,98,.15); }
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [curSlide, setCurSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [wins, setWins] = useState<Win[]>([]);
  const [topZ, setTopZ] = useState(200);
  const [clock, setClock] = useState("--:--");
  const [startOpen, setStartOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<{id:string; sx:number; sy:number; ox:number; oy:number}|null>(null);
  const winOffsetRef = useRef(0);

  // Mount
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("ja-JP", {hour:"2-digit",minute:"2-digit"}));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  // Slideshow advance
  const advance = useCallback(() => {
    setCurSlide(c => {
      const next = (c + 1) % PHOTOS.length;
      // Freeze outgoing transform
      const el = slideRefs.current[c];
      if (el) {
        const frozen = getComputedStyle(el).transform;
        el.style.transform = frozen;
        el.style.animationName = "none";
        setTimeout(() => { if(el){ el.style.transform=""; el.style.animationName=""; } }, 2500);
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

  // Open window — always creates new, always adds ?frame=1 for iframe content
  const openWin = useCallback((url: string, title: string) => {
    const z = topZ + 1;
    setTopZ(z);
    const offset = (winOffsetRef.current % 8) * 30;
    winOffsetRef.current++;
    const iw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const ih = typeof window !== "undefined" ? window.innerHeight : 800;
    const ww = Math.min(980, iw - 60);
    const wh = Math.min(660, ih - 100);
    const x = 48 + offset;
    const y = 36 + offset;
    const id = `win-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frameUrl = url.startsWith("/") && !url.includes("frame=1")
      ? url + (url.includes("?") ? "&frame=1" : "?frame=1")
      : url;
    setWins(ws => [...ws, { id, title, url: frameUrl, x, y, w: ww, h: wh, z, min: false }]);
  }, [topZ]);

  // Drag
  const startDrag = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    const win = wins.find(w => w.id === id);
    if (!win) return;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: win.x, oy: win.y };
    bringToFront(id);
    e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { id, sx, sy, ox, oy } = dragRef.current;
    setWins(ws => ws.map(w => w.id === id ? { ...w, x: ox + e.clientX - sx, y: oy + e.clientY - sy } : w));
  };
  const onMouseUp = () => { dragRef.current = null; };
  const bringToFront = (id: string) => {
    const z = topZ + 1;
    setTopZ(z);
    setWins(ws => ws.map(w => w.id === id ? { ...w, z } : w));
  };
  const closeWin  = (id: string) => setWins(ws => ws.filter(w => w.id !== id));
  const toggleMin = (id: string) => setWins(ws => ws.map(w => w.id === id ? { ...w, min: !w.min } : w));

  const filteredApps = APPS.filter(a =>
    !search || a.label.includes(search) || a.id.includes(search.toLowerCase())
  );
  const kbAnims = ["kb1","kb2","kb3"];

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (mounted && isMobile) {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html: CSS}} />
        <div style={{position:"fixed",inset:0,backgroundImage:`url(${PHOTOS[0].src})`,
          backgroundSize:"cover",backgroundPosition:"center",filter:"brightness(.45)"}} />
        <div style={{position:"relative",zIndex:1,minHeight:"100vh",
          padding:"20px 16px 60px",overflowY:"auto"}}>
          <div style={{textAlign:"center",padding:"40px 0 24px"}}>
            <div style={{fontSize:"2rem",fontWeight:700,letterSpacing:".15em",
              color:"#c9a962",fontFamily:"Anton,sans-serif"}}>SOLUNA</div>
            <div style={{fontSize:".72rem",color:"rgba(255,255,255,.45)",marginTop:4}}>
              RESORT · FESTIVAL · COMMUNITY
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {APPS.map(app => (
              <a key={app.id} href={app.url} className="mobile-card">
                <span style={{fontSize:"1.8rem"}}>{app.icon}</span>
                <span style={{fontSize:".9rem",fontWeight:600,color:"#fff",
                  fontFamily:"Inter,sans-serif"}}>{app.label}</span>
              </a>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}} />
      <div
        style={{position:"fixed",inset:0,background:"#000"}}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClick={() => { if (startOpen) setStartOpen(false); setActiveMenu(null); }}
      >
        {/* ── Wallpaper slideshow ── */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0}}>
          {PHOTOS.map((photo, i) => {
            const isCur = i === curSlide;
            const isOut = i === prevSlide;
            const cls = `slide ${isCur ? "slide-active" : isOut ? "slide-out" : "slide-hidden"}`;
            return (
              <div
                key={i}
                ref={el => { slideRefs.current[i] = el; }}
                className={cls}
                style={{
                  backgroundImage: `url(${photo.src})`,
                  animationName: isCur ? kbAnims[i % 3] : undefined,
                }}
              />
            );
          })}
          {/* Overlay */}
          <div style={{position:"absolute",inset:0,zIndex:10,
            background:"linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.15) 45%,rgba(0,0,0,.6) 100%)"}} />
        </div>

        {/* ── Menu bar ── */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:28,zIndex:300,
          background:"rgba(0,0,0,.7)",backdropFilter:"blur(24px)",
          borderBottom:"1px solid rgba(255,255,255,.07)",
          display:"flex",alignItems:"center",padding:"0 16px",gap:20}}>
          <span style={{fontFamily:"Anton,sans-serif",fontSize:".8rem",
            letterSpacing:".15em",color:"#c9a962"}}>SOLUNA</span>
          {CATEGORIES.map(cat => {
            const isOpen = activeMenu === cat.id;
            const catApps = cat.ids.map(id => APPS.find(a => a.id === id)).filter(Boolean) as typeof APPS;
            return (
              <div key={cat.id} className="mb-menu-item">
                <span
                  className={`mb-menu-btn${isOpen ? " open" : ""}`}
                  onClick={e => { e.stopPropagation(); setActiveMenu(isOpen ? null : cat.id); setStartOpen(false); }}
                >
                  {cat.label} ▾
                </span>
                {isOpen && (
                  <div className="mb-dropdown" onClick={e => e.stopPropagation()}>
                    {catApps.map(app => (
                      <div key={app.id} className="mb-drop-item"
                        onClick={() => { openWin(app.url, app.label); setActiveMenu(null); }}>
                        <span className="mb-drop-icon">{app.icon}</span>
                        <span className="mb-drop-lbl">{app.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <span style={{marginLeft:"auto",fontSize:".72rem",
            color:"rgba(255,255,255,.7)",fontVariantNumeric:"tabular-nums"}}>{clock}</span>
        </div>

        {/* ── Caption ── */}
        <div style={{position:"absolute",bottom:76,left:20,zIndex:50,
          fontSize:".68rem",color:"rgba(255,255,255,.38)",
          textShadow:"0 1px 4px rgba(0,0,0,.9)",fontFamily:"Inter,sans-serif"}}>
          {PHOTOS[curSlide]?.caption}
        </div>

        {/* ── Windows ── */}
        {wins.map(win => (
          <div
            key={win.id}
            className={`win${win.min ? " minimized" : ""}`}
            style={{left:win.x, top:win.y, width:win.w,
              height: win.min ? 36 : win.h, zIndex:win.z}}
            onMouseDown={() => bringToFront(win.id)}
          >
            <div className="win-bar" onMouseDown={e => startDrag(e, win.id)}>
              <button className="win-btn" style={{background:"#ff5f57"}}
                onClick={() => closeWin(win.id)} />
              <button className="win-btn" style={{background:"#febc2e"}}
                onClick={() => toggleMin(win.id)} />
              <button className="win-btn" style={{background:"#28c840"}}
                onClick={() => {}} />
              <span className="win-title">{win.title}</span>
            </div>
            {!win.min && (
              <div className="win-body" style={{height: win.h - 36}}>
                <iframe src={win.url} title={win.title} loading="lazy" />
              </div>
            )}
          </div>
        ))}

        {/* ── Start Menu ── */}
        {startOpen && (
          <div className="start-menu" onClick={e => e.stopPropagation()}>
            <input
              className="start-search"
              placeholder="🔍 検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />

            {search ? (
              /* Search results — flat grid */
              <div className="start-grid">
                {filteredApps.map(app => (
                  <div key={app.id} className="start-item"
                    onClick={() => { openWin(app.url, app.label); setStartOpen(false); setSearch(""); }}>
                    <span className="start-item-em">{app.icon}</span>
                    <span className="start-item-lbl">{app.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Categorized view */
              <div>
                {CATEGORIES.map(cat => {
                  const catApps = cat.ids.map(id => APPS.find(a => a.id === id)).filter(Boolean) as typeof APPS;
                  return (
                    <div key={cat.label}>
                      <div className="cat-header">
                        <span>{cat.emoji}</span>{cat.label}
                      </div>
                      <div className="start-row">
                        {catApps.map(app => (
                          <div key={app.id} className="start-item"
                            onClick={() => { openWin(app.url, app.label); setStartOpen(false); }}>
                            <span className="start-item-em">{app.icon}</span>
                            <span className="start-item-lbl">{app.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Dock ── */}
        <div
          style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",
            zIndex:400,display:"flex",alignItems:"center",
            background:"rgba(0,0,0,.55)",backdropFilter:"blur(28px) saturate(180%)",
            border:"1px solid rgba(255,255,255,.13)",borderRadius:22,
            padding:"8px 14px"}}
          onClick={e => e.stopPropagation()}
        >
          {/* Start button */}
          <div className="dock-icon"
            onClick={() => { setStartOpen(s => !s); setSearch(""); }}
            style={{marginRight:4}}>
            <div style={{width:38,height:38,borderRadius:10,
              background: startOpen
                ? "linear-gradient(135deg,#c9a962,#e8c97a)"
                : "linear-gradient(135deg,rgba(201,169,98,.3),rgba(201,169,98,.15))",
              border:"1px solid rgba(201,169,98,.4)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"1.2rem",transition:"background .2s"}}>
              {startOpen ? "✕" : "⊞"}
            </div>
            <span className="di-dock-lbl" style={{color:"#c9a962"}}>メニュー</span>
          </div>

          <div className="menu-divider" />

          {/* Dock apps — grouped with separators */}
          {DOCK_GROUPS.map((groupIds, gi) => (
            <div key={gi} style={{display:"flex",alignItems:"center"}}>
              {gi > 0 && <div className="dock-sep" />}
              {groupIds.map(id => {
                const app = APPS.find(a => a.id === id);
                if (!app) return null;
                return (
                  <div key={id} className="dock-icon" onClick={() => openWin(app.url, app.label)}>
                    <span className="di-dock-em">{app.icon}</span>
                    <span className="di-dock-lbl">{app.label}</span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Minimized windows */}
          {wins.filter(w => w.min).length > 0 && (
            <>
              <div className="menu-divider" />
              {wins.filter(w => w.min).map(win => {
                const app = APPS.find(a => a.url === win.url);
                return (
                  <div key={win.id} className="dock-icon" onClick={() => toggleMin(win.id)}>
                    <span className="di-dock-em">{app?.icon ?? "🪟"}</span>
                    <span className="di-dock-lbl" style={{color:"#c9a962"}}>{app?.label ?? win.title}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
