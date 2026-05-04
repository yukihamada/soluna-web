"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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
  // 別荘投資
  { id: "properties", icon: "🏡", label: "物件一覧",         url: "/properties" },
  { id: "buy",        icon: "💰", label: "購入・申込",       url: "/buy" },
  { id: "scheme",     icon: "🗺️", label: "スキーム",         url: "/scheme" },
  { id: "investor",   icon: "📊", label: "投資家向け",       url: "/investor" },
  // 物件
  { id: "tapkop",     icon: "🏔️", label: "TAPKOP",           url: "/tapkop" },
  { id: "lodge",      icon: "🌲", label: "THE LODGE",        url: "/lodge" },
  { id: "nesting",    icon: "🪵", label: "NESTING",          url: "/nesting" },
  { id: "instant",    icon: "🔮", label: "インスタントハウス", url: "/instant" },
  { id: "atami",      icon: "🌊", label: "WHITE HOUSE 熱海", url: "/atami" },
  { id: "kumaushi",   icon: "⛰️", label: "KUMAUSHI BASE",    url: "/kumaushi" },
  { id: "honolulu",   icon: "🌺", label: "HONOLULU VILLA",   url: "/honolulu" },
  { id: "village",    icon: "🏘️", label: "美留和ビレッジ",   url: "/village" },
  // 空き家
  { id: "kagawa",     icon: "🎨", label: "香川 空き家",      url: "/kagawa-akiya" },
  { id: "wakayama",   icon: "🌿", label: "和歌山 空き家",    url: "/wakayama-akiya" },
  // フェス
  { id: "zamna",      icon: "🎪", label: "ZAMNA HAWAII",     url: "/zamna" },
  { id: "tickets",    icon: "🎫", label: "チケット",         url: "/tickets" },
  { id: "lineup",     icon: "🎤", label: "ラインナップ",     url: "/lineup" },
  // コミュニティ
  { id: "community",  icon: "💬", label: "コミュニティ",     url: "/community" },
  { id: "app",        icon: "📱", label: "メンバーアプリ",   url: "/app" },
  { id: "guide",      icon: "📖", label: "ガイド",           url: "/guide" },
  { id: "faq",        icon: "❓", label: "FAQ",              url: "/faq" },
  { id: "login",      icon: "👤", label: "ログイン",         url: "/login" },
];

const CATEGORIES = [
  { id: "invest", label: "別荘投資",    emoji: "🏡", ids: ["properties","buy","scheme","investor"] },
  { id: "props",  label: "物件",        emoji: "🏠", ids: ["tapkop","lodge","nesting","instant","atami","kumaushi","honolulu","village"] },
  { id: "akiya",  label: "空き家活用",  emoji: "🌊", ids: ["kagawa","wakayama"] },
  { id: "fest",   label: "フェスティバル", emoji: "🎪", ids: ["zamna","tickets","lineup"] },
  { id: "comm",   label: "コミュニティ", emoji: "💬", ids: ["community","app","guide","faq","login"] },
];

const DOCK_IDS = ["properties", "zamna", "community"];

const PAGE_TITLES: Record<string, string> = Object.fromEntries(APPS.map(a => [a.url, a.label]));

interface Win {
  id: string; title: string; url: string;
  x: number; y: number; w: number; h: number; z: number; min: boolean;
}

const CSS = `
  body, html { overflow:hidden; margin:0; padding:0; }

  @keyframes kb1 { 0%{transform:scale(1) translate(0,0)} 100%{transform:scale(1.12) translate(-2%,-1.5%)} }
  @keyframes kb2 { 0%{transform:scale(1.1) translate(1.5%,1%)} 100%{transform:scale(1) translate(0,0)} }
  @keyframes kb3 { 0%{transform:scale(1.05) translate(-1%,1%)} 100%{transform:scale(1.11) translate(2%,-1%)} }
  @keyframes winPop { from{opacity:0;transform:scale(.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes menuIn { from{opacity:0;transform:scale(.97) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes heroIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .slide { position:absolute; inset:0; background-size:cover; background-position:center;
    transition:opacity 2.4s ease-in-out; will-change:transform,opacity; }
  .slide-active { opacity:1; z-index:2; animation-duration:12s; animation-timing-function:ease-in-out; animation-fill-mode:both; }
  .slide-out    { opacity:0; z-index:3; }
  .slide-hidden { opacity:0; z-index:1; }

  .dock-icon { display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:12px; cursor:pointer;
    transition:transform .18s; flex-shrink:0; position:relative; }
  .dock-icon:hover { transform:scale(1.28) translateY(-8px); }
  .di-em  { font-size:2.2rem; filter:drop-shadow(0 3px 8px rgba(0,0,0,.7)); }
  .di-lbl { font-size:.58rem; color:rgba(255,255,255,.6); font-family:Inter,sans-serif; white-space:nowrap; }

  .win { position:fixed; border-radius:12px; overflow:hidden; display:flex; flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.1);
    animation:winPop .18s ease; }
  .win-bar { height:36px; display:flex; align-items:center; padding:0 10px; gap:8px;
    background:rgba(28,28,28,.96); backdrop-filter:blur(20px);
    cursor:move; flex-shrink:0; user-select:none; }
  .win-btn { width:13px; height:13px; border-radius:50%; border:none; cursor:pointer; flex-shrink:0; }
  .win-title { flex:1; text-align:center; font-size:.72rem; color:rgba(255,255,255,.5);
    font-family:Inter,sans-serif; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .win-body { flex:1; background:#0a0a0a; overflow:hidden; }
  .win-body iframe { width:100%; height:100%; border:none; display:block; }
  .win.minimized { height:36px !important; }
  .win.minimized .win-body { display:none; }

  .menu-panel {
    position:fixed; bottom:76px; left:50%; transform:translateX(-50%);
    width:min(680px,90vw); max-height:calc(100vh - 120px); overflow-y:auto;
    background:rgba(10,10,10,.94); backdrop-filter:blur(32px) saturate(180%);
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
    padding:10px 8px; border-radius:10px; cursor:pointer; transition:background .12s; width:80px; }
  .app-item:hover { background:rgba(201,169,98,.14); }
  .app-em  { font-size:1.7rem; }
  .app-lbl { font-size:.58rem; color:rgba(255,255,255,.8); text-align:center;
    font-family:Inter,sans-serif; line-height:1.3; }

  .hero-btn {
    padding:11px 24px; border-radius:3px; font-size:.75rem; font-weight:700;
    letter-spacing:.15em; cursor:pointer; transition:opacity .15s, transform .12s;
    border:none; font-family:Inter,sans-serif; white-space:nowrap;
  }
  .hero-btn:hover { opacity:.88; transform:translateY(-1px); }
  .hero-btn-primary { background:#c9a962; color:#000; }
  .hero-btn-ghost   { background:transparent; color:rgba(255,255,255,.8);
    border:1px solid rgba(255,255,255,.25); }

  .dock-sep { width:1px; height:34px; background:rgba(255,255,255,.12); margin:0 4px; }
  .menu-dot { width:4px; height:4px; border-radius:50%; background:#c9a962;
    position:absolute; bottom:1px; left:50%; transform:translateX(-50%); }

  .mobile-card { display:flex; align-items:center; gap:14px; padding:14px 16px;
    background:rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.1); border-radius:14px;
    cursor:pointer; text-decoration:none; backdrop-filter:blur(12px); transition:background .15s; }
  .mobile-card:hover { background:rgba(201,169,98,.15); }

  .win-tooltip { position:absolute; bottom:52px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,.85); color:#fff; font-size:10px; font-weight:600;
    padding:4px 8px; border-radius:5px; white-space:nowrap; pointer-events:none;
    border:1px solid rgba(255,255,255,.1); opacity:0; transition:opacity .1s; }
  .dock-icon:hover .win-tooltip { opacity:1; }
`;

export default function Home() {
  const [curSlide, setCurSlide]   = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [wins, setWins]           = useState<Win[]>([]);
  const [topZ, setTopZ]           = useState(200);
  const [clock, setClock]         = useState("--:--");
  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState("");
  const [isMobile, setIsMobile]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  const slideRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef    = useRef<{ id:string; sx:number; sy:number; ox:number; oy:number } | null>(null);
  const winOffset  = useRef(0);
  const winsRef    = useRef<Win[]>([]);
  const kbAnims    = ["kb1","kb2","kb3"];

  // keep ref in sync for use inside event listeners
  useEffect(() => { winsRef.current = wins; }, [wins]);

  // ── URL sync helpers ─────────────────────────────────────────────────────────
  const pushUrl = useCallback((url: string, title: string) => {
    history.pushState({ winUrl: url, title }, title, url);
  }, []);

  const replaceUrl = useCallback((url: string, title: string) => {
    history.replaceState({ winUrl: url, title }, title, url);
  }, []);

  // ── Open window (with URL update) ────────────────────────────────────────────
  const openWin = useCallback((url: string, title: string, fromPopstate = false) => {
    const z = topZ + 1; setTopZ(z);
    const off = (winOffset.current % 6) * 28; winOffset.current++;
    const iw = window.innerWidth, ih = window.innerHeight;
    const ww = Math.min(1020, iw - 40), wh = Math.min(700, ih - 80);
    const frameUrl = url + (url.includes("?") ? "&frame=1" : "?frame=1");
    const id = `w-${Date.now()}`;
    setWins(ws => [...ws, { id, title, url: frameUrl, x: 40 + off, y: 28 + off, w: ww, h: wh, z, min: false }]);
    if (!fromPopstate) pushUrl(url, title);
    setMenuOpen(false); setSearch("");
  }, [topZ, pushUrl]);

  // ── Bring to front (URL = that window's content) ─────────────────────────────
  const bringToFront = useCallback((id: string) => {
    setTopZ(z => {
      const newZ = z + 1;
      setWins(ws => {
        const updated = ws.map(w => w.id === id ? { ...w, z: newZ } : w);
        const win = updated.find(w => w.id === id);
        if (win) {
          const cleanUrl = win.url.replace("?frame=1","").replace("&frame=1","");
          replaceUrl(cleanUrl, win.title);
        }
        return updated;
      });
      return newZ;
    });
  }, [replaceUrl]);

  // ── Close window ─────────────────────────────────────────────────────────────
  const closeWin = useCallback((id: string) => {
    setWins(ws => {
      const remaining = ws.filter(w => w.id !== id);
      if (remaining.length === 0) {
        replaceUrl("/", "SOLUNA");
      } else {
        const top = remaining.reduce((a, b) => a.z > b.z ? a : b);
        const url = top.url.replace("?frame=1","").replace("&frame=1","");
        replaceUrl(url, top.title);
      }
      return remaining;
    });
  }, [replaceUrl]);

  const toggleMin = (id: string) =>
    setWins(ws => ws.map(w => w.id === id ? { ...w, min: !w.min } : w));

  // ── popstate (back/forward) ──────────────────────────────────────────────────
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.winUrl && e.state.winUrl !== "/") {
        // check if window already open
        const existing = winsRef.current.find(w =>
          w.url.replace("?frame=1","").replace("&frame=1","") === e.state.winUrl
        );
        if (!existing) openWin(e.state.winUrl, e.state.title || "", true);
      } else {
        setWins([]);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [openWin]);

  // ── Init: if arrived at a deep URL, open that window ─────────────────────────
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);

    const path = window.location.pathname;
    if (path !== "/") {
      const title = PAGE_TITLES[path] || path.replace("/","");
      // replace current state then open (no double pushState)
      replaceUrl("/", "SOLUNA");
      openWin(path, title);
    }

    return () => window.removeEventListener("resize", r);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Clock ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("ja-JP", { hour:"2-digit", minute:"2-digit" }));
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  // ── Wallpaper slideshow ───────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setCurSlide(c => {
      const next = (c + 1) % PHOTOS.length;
      const el = slideRefs.current[c];
      if (el) {
        const frozen = getComputedStyle(el).transform;
        el.style.transform = frozen; el.style.animationName = "none";
        setTimeout(() => { if (el) { el.style.transform = ""; el.style.animationName = ""; } }, 2500);
      }
      setPrevSlide(c); setTimeout(() => setPrevSlide(null), 2500);
      return next;
    });
  }, []);
  useEffect(() => { const t = setInterval(advance, 9000); return () => clearInterval(t); }, [advance]);

  // ── Drag ─────────────────────────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent, id: string) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    const w = wins.find(w => w.id === id); if (!w) return;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: w.x, oy: w.y };
    bringToFront(id); e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const { id, sx, sy, ox, oy } = dragRef.current;
    setWins(ws => ws.map(w => w.id === id ? { ...w, x: ox + e.clientX - sx, y: oy + e.clientY - sy } : w));
  };

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
              fontFamily:"Inter,sans-serif" }}>北海道 · 熱海 · ハワイ</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <div style={{ fontSize:".58rem", color:"rgba(255,255,255,.3)", letterSpacing:".12em",
                  marginBottom:5, fontFamily:"Inter,sans-serif" }}>
                  {cat.emoji} {cat.label.toUpperCase()}
                </div>
                {cat.ids.map(id => {
                  const app = APPS.find(a => a.id === id); if (!app) return null;
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
        onMouseMove={onMouseMove}
        onMouseUp={() => { dragRef.current = null; }}
        onClick={() => { if (menuOpen) setMenuOpen(false); }}
      >
        {/* Wallpaper */}
        <div style={{ position:"absolute", inset:0, overflow:"hidden", zIndex:0 }}>
          {PHOTOS.map((p, i) => {
            const isCur = i === curSlide, isOut = i === prevSlide;
            return (
              <div key={i} ref={el => { slideRefs.current[i] = el; }}
                className={`slide ${isCur ? "slide-active" : isOut ? "slide-out" : "slide-hidden"}`}
                style={{ backgroundImage:`url(${p.src})`, animationName: isCur ? kbAnims[i % 3] : undefined }} />
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

        {/* ── Hero (hidden when windows are open) ── */}
        {mounted && wins.length === 0 && (
          <div style={{
            position:"absolute", left:"50%", top:"50%",
            transform:"translate(-50%, -52%)",
            textAlign:"center", zIndex:50,
            animation:"heroIn .8s ease both",
            width:"min(640px, 90vw)",
          }}>
            <p style={{ fontSize:".68rem", letterSpacing:".35em",
              color:"rgba(255,255,255,.45)", marginBottom:16, fontFamily:"Inter,sans-serif" }}>
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
              <button className="hero-btn hero-btn-primary"
                onClick={() => openWin("/properties", "物件一覧")}>物件を見る →</button>
              <button className="hero-btn hero-btn-ghost"
                onClick={() => openWin("/zamna", "ZAMNA HAWAII")}>🎪 ZAMNA HAWAII &apos;26</button>
              <button className="hero-btn hero-btn-ghost"
                onClick={() => openWin("/scheme", "スキーム")}>スキームを詳しく</button>
            </div>
            <p style={{ marginTop:18, fontSize:".65rem",
              color:"rgba(255,255,255,.25)", fontFamily:"Inter,sans-serif" }}>
              East Ventures 出資 · 2020年創業
            </p>
          </div>
        )}

        {/* ── Windows ── */}
        {wins.map(win => (
          <div key={win.id}
            className={`win${win.min ? " minimized" : ""}`}
            style={{ left:win.x, top:win.y, width:win.w, height:win.min ? 36 : win.h, zIndex:win.z }}
            onMouseDown={() => bringToFront(win.id)}
          >
            <div className="win-bar" onMouseDown={e => startDrag(e, win.id)}>
              <button className="win-btn" style={{ background:"#ff5f57" }} onClick={() => closeWin(win.id)} />
              <button className="win-btn" style={{ background:"#febc2e" }} onClick={() => toggleMin(win.id)} />
              <button className="win-btn" style={{ background:"#28c840" }} />
              <span className="win-title">{win.title}</span>
            </div>
            {!win.min && (
              <div className="win-body" style={{ height: win.h - 36 }}>
                <iframe src={win.url} title={win.title} loading="lazy" />
              </div>
            )}
          </div>
        ))}

        {/* ── All-apps panel ── */}
        {menuOpen && (
          <div className="menu-panel" onClick={e => e.stopPropagation()}>
            <input className="menu-search" placeholder="🔍 検索..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            {search ? (
              <div className="app-row">
                {filteredApps.map(app => (
                  <div key={app.id} className="app-item" onClick={() => openWin(app.url, app.label)}>
                    <span className="app-em">{app.icon}</span>
                    <span className="app-lbl">{app.label}</span>
                  </div>
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
                        <div key={app.id} className="app-item" onClick={() => openWin(app.url, app.label)}>
                          <span className="app-em">{app.icon}</span>
                          <span className="app-lbl">{app.label}</span>
                        </div>
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
          {dockApps.map(app => {
            const isActive = wins.some(w =>
              w.url.replace("?frame=1","").replace("&frame=1","") === app.url && !w.min
            );
            return (
              <div key={app.id} className="dock-icon" onClick={() => openWin(app.url, app.label)}>
                <span className="di-em">{app.icon}</span>
                <span className="di-lbl">{app.label}</span>
                {isActive && <div className="menu-dot" />}
                <span className="win-tooltip">{app.label}</span>
              </div>
            );
          })}

          {/* minimized windows */}
          {wins.filter(w => w.min).map(win => {
            const app = APPS.find(a => win.url.includes(a.url));
            return (
              <div key={win.id} className="dock-icon" onClick={() => toggleMin(win.id)}>
                <span className="di-em">{app?.icon ?? "🪟"}</span>
                <span className="di-lbl" style={{ color:"#c9a962" }}>{app?.label ?? win.title}</span>
                <div className="menu-dot" />
              </div>
            );
          })}

          <div className="dock-sep" />

          {/* All-apps button */}
          <div className="dock-icon" onClick={() => { setMenuOpen(s => !s); setSearch(""); }}>
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
