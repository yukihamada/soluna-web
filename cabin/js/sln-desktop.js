/* SOLUNA Windows OS Shell — window manager + start menu */
(function () {
  // ── iframe内(windowコンテンツ)はシェルをスキップ ──
  if (window.self !== window.top) return;
  if (document.getElementById('sln-os')) return;

  const SKIP = ['/app.html','/admin.html','/email-admin.html',
                '/neuro-dashboard.html','/neuro-portal.html','/materials-admin.html',
                '/booking-analytics.html','/visitor-log.html','/kussharo.html'];
  if (document.body.dataset.desktopShell === 'own') return;
  if (SKIP.some(p => location.pathname.endsWith(p))) return;
  if (window.innerWidth < 600) {
    // モバイル: URLだけ修正してそのまま
    if (location.pathname.endsWith('.html') && location.pathname !== '/index.html')
      history.replaceState(null, '', location.pathname.slice(0, -5) + location.search);
    return;
  }

  // クリーンURL
  if (location.pathname.endsWith('.html') && location.pathname !== '/index.html')
    history.replaceState(null, '', location.pathname.slice(0, -5) + location.search + location.hash);

  const DOMAIN = 'https://solun.art';
  const cleanPath = location.pathname.replace(/\.html$/, '') || '/';

  // ── サイト全ページ一覧（スタートメニュー用） ──
  const ALL_PAGES = [
    // 物件
    { icon:'🏡', label:'物件一覧',      href:'/homes',          cat:'物件' },
    { icon:'📦', label:'コレクション',  href:'/collection',     cat:'物件' },
    { icon:'🌙', label:'TAPKOP',        href:'/tapkop',         cat:'物件' },
    { icon:'🏠', label:'THE LODGE',     href:'/lodge',          cat:'物件' },
    { icon:'🌿', label:'NESTING',       href:'/nesting',        cat:'物件' },
    { icon:'🌊', label:'熱海',          href:'/atami',          cat:'物件' },
    { icon:'🐻', label:'熊牛原野',      href:'/kumaushi',       cat:'物件' },
    { icon:'🏔️', label:'美留和ビレッジ',href:'/village',        cat:'物件' },
    { icon:'🦠', label:'屈斜路',        href:'/kussharo',       cat:'物件' },
    { icon:'⚡', label:'インスタント',  href:'/instant',        cat:'物件' },
    { icon:'🏖️', label:'後藤Beach',    href:'/goto-beach',     cat:'物件' },
    { icon:'⛷️', label:'白馬シャレー', href:'/hakuba-chalet',  cat:'物件' },
    { icon:'🏯', label:'白馬古民家',    href:'/hakuba-kominka', cat:'物件' },
    { icon:'🌅', label:'和歌山',        href:'/wakayama',       cat:'物件' },
    // スキーム
    { icon:'💰', label:'事業スキーム',  href:'/scheme',         cat:'スキーム' },
    { icon:'🛒', label:'購入する',      href:'/buy',            cat:'スキーム' },
    { icon:'📋', label:'プラン比較',    href:'/plans',          cat:'スキーム' },
    { icon:'🤝', label:'フォーンダー',  href:'/founding',       cat:'スキーム' },
    { icon:'👑', label:'オーナー',      href:'/owners',         cat:'スキーム' },
    // ビレッジ
    { icon:'🌿', label:'ビレッジ概要',  href:'/village',        cat:'ビレッジ' },
    { icon:'💡', label:'コンセプト',    href:'/village-concept',cat:'ビレッジ' },
    { icon:'🎨', label:'デザイン',      href:'/village-design', cat:'ビレッジ' },
    { icon:'🪵', label:'Work Party',    href:'/workparty',      cat:'ビレッジ' },
    // イベント
    { icon:'🎶', label:'ZAMNA FEST',    href:'/zamna',          cat:'イベント' },
    { icon:'🛶', label:'RAFT',          href:'/raft',           cat:'イベント' },
    { icon:'🌺', label:'RAFT Hawaii',   href:'/raft-hawaii',    cat:'イベント' },
    // ストーリー
    { icon:'📖', label:'ストーリー',    href:'/story',          cat:'ストーリー' },
    { icon:'🌲', label:'LODGE story',   href:'/lodge-story',    cat:'ストーリー' },
    { icon:'🌙', label:'TAPKOP story',  href:'/tapkop-story',   cat:'ストーリー' },
    { icon:'🌿', label:'NESTING story', href:'/nesting-story',  cat:'ストーリー' },
    { icon:'📰', label:'ブログ',        href:'/blog',           cat:'ストーリー' },
    // 建材・技術
    { icon:'🔩', label:'建材',          href:'/materials',      cat:'テック' },
    { icon:'🧱', label:'SIPSパネル',    href:'/sips',           cat:'テック' },
    { icon:'✨', label:'発光菌',        href:'/glow',           cat:'テック' },
    { icon:'🍄', label:'マイセリウム',  href:'/mycelium',       cat:'テック' },
    { icon:'🌿', label:'竹SIP',         href:'/take-sips',      cat:'テック' },
    { icon:'🏗️', label:'構造設計',     href:'/structural',     cat:'テック' },
    { icon:'📐', label:'間取り図',      href:'/floorplans',     cat:'テック' },
    { icon:'⚡', label:'オフグリッド',  href:'/offgrid',        cat:'テック' },
    // ツール・コミュニティ
    { icon:'💬', label:'AIチャット',    href:'/ask',            cat:'ツール' },
    { icon:'🌐', label:'コミュニティ',  href:'/community',      cat:'ツール' },
    { icon:'🎵', label:'チューナー',    href:'/voice',          cat:'ツール' },
    { icon:'🗺️', label:'サイトマップ', href:'/sitemap.xml',    cat:'ツール' },
    // 会社
    { icon:'🏢', label:'会社概要',      href:'/company',        cat:'会社' },
    { icon:'📞', label:'お問い合わせ',  href:'/contact',        cat:'会社' },
    { icon:'📄', label:'特商法',        href:'/tokushoho',      cat:'会社' },
    { icon:'🔒', label:'プライバシー',  href:'/privacy',        cat:'会社' },
    { icon:'📝', label:'利用規約',      href:'/terms',          cat:'会社' },
  ];

  const PINNED = ALL_PAGES.slice(0, 9);
  const PAGE_ICONS = Object.fromEntries(ALL_PAGES.map(p => [p.href.replace('/',''), p.icon]));
  const seg = cleanPath.split('/').filter(Boolean)[0] || '';
  const pageIcon = PAGE_ICONS[seg] || '🌙';
  const pageTitle = (document.title || 'SOLUNA').replace(/ [—|] SOLUNA$/,'').trim();

  // ══════════════════════════════════════════════════════
  // CSS
  // ══════════════════════════════════════════════════════
  const style = document.createElement('style');
  style.textContent = `
  html { height:100%; overflow:hidden; }
  body {
    margin:0!important; padding:0!important;
    width:100vw; height:100vh; overflow:hidden;
    background:
      radial-gradient(ellipse 65% 55% at 18% 80%, rgba(10,18,40,.95) 0%,transparent 55%),
      radial-gradient(ellipse 55% 50% at 82% 15%, rgba(32,8,52,.8) 0%,transparent 50%),
      linear-gradient(155deg, #030710 0%, #090c18 45%, #050308 100%);
  }

  /* ── Desktop icons ── */
  #sln-desk {
    position:fixed; top:8px; left:10px; z-index:8800;
    display:flex; flex-direction:column; gap:2px;
  }
  .sln-di {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    width:68px; padding:8px 4px; border-radius:6px;
    cursor:pointer; text-decoration:none; user-select:none;
    transition:background .12s;
  }
  .sln-di:hover, .sln-di:focus { background:rgba(255,255,255,.12); outline:none; }
  .sln-di-ico { font-size:28px; line-height:1; filter:drop-shadow(0 2px 8px rgba(0,0,0,.9)); }
  .sln-di-lbl {
    font-size:10px; color:#fff; text-align:center;
    text-shadow:0 1px 6px #000, 0 0 14px #000;
    font-family:'Segoe UI',-apple-system,sans-serif;
    white-space:nowrap;
  }

  /* ── Window ── */
  .sln-win {
    position:fixed;
    display:flex; flex-direction:column;
    background:#141416;
    border:1px solid rgba(255,255,255,.13);
    border-radius:8px;
    box-shadow:0 20px 70px rgba(0,0,0,.8), 0 0 0 .5px rgba(0,0,0,.5);
    overflow:hidden;
    min-width:300px; min-height:200px;
  }
  .sln-win:focus-within,
  .sln-win.focused { border-color:rgba(196,144,58,.2); box-shadow:0 24px 80px rgba(0,0,0,.85), 0 0 0 1px rgba(196,144,58,.1); }
  .sln-win.maximized {
    border-radius:0!important;
    border:none!important;
  }

  /* Window titlebar */
  .sln-win-bar {
    height:32px; flex-shrink:0;
    display:flex; align-items:center;
    background:#1c1c1e;
    border-bottom:1px solid rgba(255,255,255,.07);
    cursor:grab; user-select:none; -webkit-user-select:none;
  }
  .sln-win-bar:active { cursor:grabbing; }
  .sln-win-ico { font-size:13px; padding:0 6px 0 10px; flex-shrink:0; pointer-events:none; }
  .sln-win-title {
    flex:1; font-size:12px; color:rgba(232,227,210,.55);
    font-family:'Segoe UI',-apple-system,sans-serif;
    pointer-events:none; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  /* Win nav */
  .sln-win-nav { display:flex; gap:1px; padding:0 4px; flex-shrink:0; }
  .sln-wn {
    font-size:11px; color:rgba(232,227,210,.4);
    padding:0 7px; height:22px; line-height:22px;
    border-radius:3px; cursor:pointer; text-decoration:none;
    transition:background .1s, color .1s; white-space:nowrap;
    font-family:'Segoe UI',-apple-system,sans-serif;
  }
  .sln-wn:hover { background:rgba(255,255,255,.08); color:#e8e3d2; }
  .sln-wn.active { color:#c4903a; }
  /* Control buttons (─ □ ×) */
  .sln-win-btns { display:flex; height:32px; flex-shrink:0; }
  .sln-wbtn {
    width:46px; height:32px; border:none; background:none;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background .1s; color:rgba(232,227,210,.45);
  }
  .sln-wbtn:hover { background:rgba(255,255,255,.1); color:#e8e3d2; }
  .sln-wbtn.wclose:hover { background:#c42b1c; color:#fff; }
  .sln-wbtn:last-child { border-radius:0 8px 0 0; }
  .sln-wbtn svg { width:10px; height:10px; stroke:currentColor; fill:none; stroke-width:1.5; stroke-linecap:round; }

  /* Window content */
  .sln-win-content { flex:1; overflow:auto; }
  .sln-win-content iframe {
    width:100%; height:100%; border:none; display:block;
    background:#0a0908;
  }

  /* Resize handle */
  .sln-win-resize {
    position:absolute; bottom:0; right:0;
    width:16px; height:16px; cursor:se-resize; z-index:1;
    opacity:0; transition:opacity .2s;
  }
  .sln-win:hover .sln-win-resize { opacity:1; }
  .sln-win-resize::after {
    content:''; position:absolute; bottom:4px; right:4px;
    width:6px; height:6px;
    border-right:2px solid rgba(255,255,255,.2);
    border-bottom:2px solid rgba(255,255,255,.2);
  }

  /* ── Taskbar ── */
  #sln-taskbar {
    position:fixed; bottom:0; left:0; right:0; height:40px; z-index:9500;
    background:rgba(14,14,16,.98);
    backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px);
    border-top:1px solid rgba(255,255,255,.055);
    display:flex; align-items:center;
    font-family:'Segoe UI',-apple-system,sans-serif;
    user-select:none;
  }

  /* Start button */
  #sln-start-btn {
    width:40px; height:40px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background .12s;
  }
  #sln-start-btn:hover { background:rgba(255,255,255,.09); }
  #sln-start-btn.open { background:rgba(196,144,58,.15); }
  .sln-logo {
    display:grid; grid-template-columns:1fr 1fr; gap:2.5px; width:16px; height:16px;
  }
  .sln-logo span { background:#c4903a; border-radius:1px; transition:background .12s; }
  #sln-start-btn:hover .sln-logo span, #sln-start-btn.open .sln-logo span { background:#d4a84e; }

  /* Running apps */
  #sln-tb-apps {
    display:flex; align-items:center; height:100%; padding:0 4px; gap:2px; flex:1; overflow:hidden;
  }
  .sln-tb-chip {
    display:flex; align-items:center; gap:5px;
    height:32px; padding:0 10px;
    border-radius:4px; cursor:pointer;
    font-size:11px; color:rgba(232,227,210,.6);
    transition:background .1s; white-space:nowrap;
    max-width:150px; overflow:hidden;
    border-bottom:2px solid transparent;
    flex-shrink:0;
  }
  .sln-tb-chip:hover { background:rgba(255,255,255,.08); color:#e8e3d2; }
  .sln-tb-chip.active { background:rgba(255,255,255,.1); color:#e8e3d2; border-bottom-color:#c4903a; }
  .sln-tb-chip.minimized { opacity:.55; }
  .sln-chip-ico { font-size:14px; flex-shrink:0; }
  .sln-chip-ttl { overflow:hidden; text-overflow:ellipsis; }

  /* System tray */
  #sln-tray {
    display:flex; align-items:center; gap:2px;
    padding:0 6px; height:100%; flex-shrink:0;
    border-left:1px solid rgba(255,255,255,.05);
  }
  .sln-tray-icon {
    width:28px; height:28px; border-radius:3px;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; cursor:pointer; color:rgba(232,227,210,.4);
    transition:background .1s;
  }
  .sln-tray-icon:hover { background:rgba(255,255,255,.08); color:#e8e3d2; }
  #sln-clock {
    padding:0 8px; border-radius:3px; cursor:default;
    transition:background .1s; min-width:52px;
  }
  #sln-clock:hover { background:rgba(255,255,255,.07); }
  #sln-clock-t { display:block; font-size:12px; color:rgba(232,227,210,.7); text-align:right; font-variant-numeric:tabular-nums; }
  #sln-clock-d { display:block; font-size:10px; color:rgba(232,227,210,.35); text-align:right; }

  /* ── Start Menu ── */
  #sln-start-menu {
    position:fixed; bottom:40px; left:0; z-index:9400;
    width:560px; max-height:calc(100vh - 56px);
    background:rgba(22,22,26,.97);
    backdrop-filter:blur(40px) saturate(1.6);
    -webkit-backdrop-filter:blur(40px) saturate(1.6);
    border:1px solid rgba(255,255,255,.1);
    border-radius:10px 10px 0 0;
    box-shadow:0 -8px 40px rgba(0,0,0,.7);
    display:none; flex-direction:column;
    font-family:'Segoe UI',-apple-system,sans-serif;
    overflow:hidden;
  }
  #sln-start-menu.open { display:flex; }

  /* Search */
  #sln-sm-search-wrap {
    padding:16px 16px 12px;
    border-bottom:1px solid rgba(255,255,255,.06);
  }
  #sln-sm-search {
    width:100%; height:34px; background:rgba(255,255,255,.07);
    border:1px solid rgba(255,255,255,.1); border-radius:17px;
    color:#e8e3d2; padding:0 14px 0 36px; font-size:13px;
    font-family:inherit; outline:none; transition:border-color .15s;
  }
  #sln-sm-search:focus { border-color:rgba(196,144,58,.4); }
  #sln-sm-search-ico {
    position:absolute; left:28px; top:50%; transform:translateY(-50%);
    font-size:13px; pointer-events:none; color:rgba(232,227,210,.3);
  }
  #sln-sm-search-wrap { position:relative; }

  /* Columns */
  #sln-sm-body { display:flex; flex:1; overflow:hidden; }

  /* Left: pinned */
  #sln-sm-left {
    width:240px; flex-shrink:0; padding:14px 12px;
    border-right:1px solid rgba(255,255,255,.06);
    overflow-y:auto;
  }
  .sln-sm-sec-title {
    font-size:9px; letter-spacing:.18em; color:rgba(196,144,58,.5);
    text-transform:uppercase; margin-bottom:10px; padding:0 4px;
  }
  .sln-sm-pinned {
    display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-bottom:16px;
  }
  .sln-sm-pin {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    padding:10px 4px; border-radius:6px; cursor:pointer; text-decoration:none;
    transition:background .12s;
  }
  .sln-sm-pin:hover { background:rgba(255,255,255,.08); }
  .sln-sm-pin-ico { font-size:22px; }
  .sln-sm-pin-lbl { font-size:10px; color:rgba(232,227,210,.65); text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; }

  /* Right: all apps */
  #sln-sm-right {
    flex:1; padding:14px 10px; overflow-y:auto;
  }
  #sln-sm-all-list { display:flex; flex-direction:column; gap:1px; }
  .sln-sm-cat { font-size:9px; letter-spacing:.18em; color:rgba(196,144,58,.4); text-transform:uppercase; padding:8px 6px 4px; }
  .sln-sm-app {
    display:flex; align-items:center; gap:9px;
    padding:6px 8px; border-radius:5px; cursor:pointer; text-decoration:none;
    transition:background .12s;
  }
  .sln-sm-app:hover { background:rgba(255,255,255,.08); }
  .sln-sm-app-ico { font-size:16px; width:22px; text-align:center; flex-shrink:0; }
  .sln-sm-app-lbl { font-size:12px; color:rgba(232,227,210,.7); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* Footer */
  #sln-sm-footer {
    padding:12px 16px; border-top:1px solid rgba(255,255,255,.06);
    display:flex; align-items:center; gap:10px;
  }
  #sln-sm-user {
    flex:1; display:flex; align-items:center; gap:9px;
    cursor:pointer; padding:6px 8px; border-radius:6px; text-decoration:none;
    transition:background .12s;
  }
  #sln-sm-user:hover { background:rgba(255,255,255,.07); }
  #sln-sm-user-ava {
    width:30px; height:30px; border-radius:50%; background:rgba(196,144,58,.2);
    border:1px solid rgba(196,144,58,.3); display:flex; align-items:center;
    justify-content:center; font-size:14px; flex-shrink:0;
  }
  #sln-sm-user-info { overflow:hidden; }
  #sln-sm-user-name { font-size:12px; color:#e8e3d2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  #sln-sm-user-sub { font-size:10px; color:rgba(232,227,210,.4); white-space:nowrap; }
  .sln-sm-power {
    width:34px; height:34px; border-radius:50%; border:1px solid rgba(255,255,255,.1);
    display:flex; align-items:center; justify-content:center; cursor:pointer;
    color:rgba(232,227,210,.4); font-size:14px; transition:all .12s; flex-shrink:0;
  }
  .sln-sm-power:hover { background:rgba(196,144,58,.15); border-color:rgba(196,144,58,.3); color:#c4903a; }

  /* Search results */
  #sln-sm-search-results {
    display:none; flex-direction:column; gap:1px; padding:8px;
    overflow-y:auto;
  }
  #sln-sm-search-results.visible { display:flex; }
  #sln-sm-body.searching #sln-sm-left,
  #sln-sm-body.searching #sln-sm-right { display:none; }
  #sln-sm-body.searching #sln-sm-search-results { display:flex; width:100%; }
  `;
  document.head.appendChild(style);

  // ══════════════════════════════════════════════════════
  // Window Manager
  // ══════════════════════════════════════════════════════
  let zTop = 9200;
  const wins = {}; // { id: { el, title, icon, min } }

  function makeWindow({ id, title, icon, url, width, height, x, y }) {
    if (wins[id]) { focusWin(id); restoreWin(id); return; }

    const vw = window.innerWidth, vh = window.innerHeight - 40;
    const w = Math.min(width || 900, vw - 40);
    const h = Math.min(height || vh - 30, vh - 30);
    const lx = x != null ? x : Math.max(20, (vw - w) / 2);
    const ly = y != null ? y : Math.max(10, (vh - h) / 2);

    const win = document.createElement('div');
    win.className = 'sln-win focused';
    win.dataset.winId = id;
    win.style.cssText = `left:${lx}px;top:${ly}px;width:${w}px;height:${h}px;z-index:${++zTop}`;

    const NAV = [
      {label:'物件',href:'/homes'},{label:'スキーム',href:'/scheme'},
      {label:'ビレッジ',href:'/village'},{label:'FEST',href:'/zamna'},
    ];
    const navHtml = NAV.map(n=>`<a class="sln-wn" href="${n.href}" onclick="openPage('${n.href}');return false">${n.label}</a>`).join('');

    win.innerHTML = `
      <div class="sln-win-bar" data-win="${id}">
        <span class="sln-win-ico">${icon}</span>
        <span class="sln-win-title">${title}</span>
        <nav class="sln-win-nav">${navHtml}</nav>
        <div class="sln-win-btns">
          <button class="sln-wbtn" data-act="min" title="最小化">
            <svg viewBox="0 0 10 10"><line x1="0" y1="8" x2="10" y2="8"/></svg>
          </button>
          <button class="sln-wbtn" data-act="max" title="最大化">
            <svg viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9"/></svg>
          </button>
          <button class="sln-wbtn wclose" data-act="close" title="閉じる">
            <svg viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10"/><line x1="10" y1="0" x2="0" y2="10"/></svg>
          </button>
        </div>
      </div>
      <div class="sln-win-content">
        <iframe src="${url}" id="sln-iframe-${id}" loading="lazy" title="${title}"></iframe>
      </div>
      <div class="sln-win-resize" data-resize="${id}"></div>
    `;

    document.body.appendChild(win);
    wins[id] = { el: win, title, icon, min: false, max: false, savedRect: null };
    addToTaskbar(id, icon, title);
    setupDrag(win);
    setupResize(win, id);
    win.addEventListener('mousedown', () => focusWin(id));
    return win;
  }

  function focusWin(id) {
    if (!wins[id]) return;
    wins[id].el.style.zIndex = ++zTop;
    Object.keys(wins).forEach(k => wins[k].el.classList.toggle('focused', k === id));
    document.querySelectorAll('.sln-tb-chip').forEach(c => c.classList.toggle('active', c.dataset.winId === id));
  }

  function minWin(id) {
    if (!wins[id]) return;
    wins[id].min = !wins[id].min;
    wins[id].el.style.display = wins[id].min ? 'none' : 'flex';
    const chip = document.querySelector(`.sln-tb-chip[data-win-id="${id}"]`);
    if (chip) chip.classList.toggle('minimized', wins[id].min);
    if (!wins[id].min) focusWin(id);
  }

  function maxWin(id) {
    if (!wins[id]) return;
    const w = wins[id];
    if (!w.max) {
      w.savedRect = { l: w.el.style.left, t: w.el.style.top, w: w.el.style.width, h: w.el.style.height };
      w.el.style.cssText += `;left:0;top:0;width:100vw;height:calc(100vh - 40px);border-radius:0;`;
      w.el.classList.add('maximized');
    } else {
      const r = w.savedRect;
      w.el.style.left = r.l; w.el.style.top = r.t;
      w.el.style.width = r.w; w.el.style.height = r.h;
      w.el.classList.remove('maximized');
    }
    w.max = !w.max;
  }

  function closeWin(id) {
    if (!wins[id]) return;
    wins[id].el.remove();
    const chip = document.querySelector(`.sln-tb-chip[data-win-id="${id}"]`);
    if (chip) chip.remove();
    delete wins[id];
  }

  function restoreWin(id) {
    if (!wins[id]) return;
    if (wins[id].min) { wins[id].min = false; wins[id].el.style.display = 'flex'; }
    focusWin(id);
  }

  // ── Drag ──
  function setupDrag(win) {
    const bar = win.querySelector('.sln-win-bar');
    let dx = 0, dy = 0, dragging = false;

    bar.addEventListener('mousedown', e => {
      if (e.target.closest('.sln-wbtn') || e.target.closest('.sln-win-nav')) return;
      if (win.classList.contains('maximized')) return;
      dragging = true;
      dx = e.clientX - win.getBoundingClientRect().left;
      dy = e.clientY - win.getBoundingClientRect().top;
      e.preventDefault();
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      win.style.left = Math.max(0, e.clientX - dx) + 'px';
      win.style.top = Math.max(0, Math.min(e.clientY - dy, window.innerHeight - 80)) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (dragging) { dragging = false; document.body.style.userSelect = ''; }
    });

    bar.addEventListener('dblclick', e => {
      if (!e.target.closest('.sln-wbtn')) {
        const id = win.dataset.winId;
        if (id) maxWin(id);
      }
    });
  }

  // ── Resize ──
  function setupResize(win, id) {
    const handle = win.querySelector('.sln-win-resize');
    let resizing = false, sx, sy, sw, sh;
    handle.addEventListener('mousedown', e => {
      resizing = true; sx = e.clientX; sy = e.clientY;
      sw = win.offsetWidth; sh = win.offsetHeight;
      e.preventDefault(); e.stopPropagation();
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (!resizing) return;
      win.style.width = Math.max(320, sw + e.clientX - sx) + 'px';
      win.style.height = Math.max(200, sh + e.clientY - sy) + 'px';
    });
    document.addEventListener('mouseup', () => { if (resizing) { resizing = false; document.body.style.userSelect = ''; } });
  }

  // ── Window control buttons ──
  document.addEventListener('click', e => {
    const btn = e.target.closest('.sln-wbtn[data-act]');
    if (!btn) return;
    const bar = btn.closest('.sln-win-bar');
    const win2 = btn.closest('.sln-win');
    if (!win2) return;
    const id = win2.dataset.winId;
    const act = btn.dataset.act;
    if (act === 'min') minWin(id);
    else if (act === 'max') maxWin(id);
    else if (act === 'close') closeWin(id);
  });

  // ── Taskbar chips ──
  function addToTaskbar(id, icon, title) {
    const chip = document.createElement('div');
    chip.className = 'sln-tb-chip active';
    chip.dataset.winId = id;
    chip.innerHTML = `<span class="sln-chip-ico">${icon}</span><span class="sln-chip-ttl">${title}</span>`;
    chip.addEventListener('click', () => {
      if (wins[id]?.min) { restoreWin(id); }
      else if (wins[id]?.el.style.zIndex == zTop) { minWin(id); }
      else { focusWin(id); }
    });
    document.getElementById('sln-tb-apps').appendChild(chip);
  }

  // ── Open page in window ──
  window.openPage = function(href) {
    const page = ALL_PAGES.find(p => p.href === href) || { icon:'🌙', label: href };
    const id = 'win-' + href.replace(/\//g,'_').replace(/^_/,'');
    makeWindow({ id, title: page.label || href, icon: page.icon || '🌙', url: href });
    closeStartMenu();
  };

  // ══════════════════════════════════════════════════════
  // Build Desktop
  // ══════════════════════════════════════════════════════

  // Lock body scroll, move content into window
  const DESK_ICONS = [
    { icon:'🏡', label:'物件', href:'/homes' },
    { icon:'💰', label:'スキーム', href:'/scheme' },
    { icon:'🌿', label:'ビレッジ', href:'/village' },
    { icon:'🎶', label:'FEST', href:'/zamna' },
    { icon:'💬', label:'チャット', href:'/ask' },
  ];

  const desk = document.createElement('div');
  desk.id = 'sln-desk';
  desk.innerHTML = DESK_ICONS.map(d =>
    `<a class="sln-di" href="${d.href}" onclick="openPage('${d.href}');return false">
      <span class="sln-di-ico">${d.icon}</span>
      <span class="sln-di-lbl">${d.label}</span>
    </a>`
  ).join('');
  document.body.appendChild(desk);

  // ── Create main window with current page content ──
  const mainWin = makeWindow({
    id: 'main',
    title: pageTitle,
    icon: pageIcon,
    url: cleanPath,
    width: Math.min(960, window.innerWidth - 40),
    height: window.innerHeight - 70,
  });

  // Also load current page body content into main window iframe
  // (iframe loads url=cleanPath which re-fetches the page without the shell)

  // ── Taskbar ──
  const tb = document.createElement('div');
  tb.id = 'sln-taskbar';
  tb.innerHTML = `
    <div id="sln-start-btn" title="スタート" onclick="toggleStartMenu()">
      <div class="sln-logo"><span></span><span></span><span></span><span></span></div>
    </div>
    <div id="sln-tb-apps"></div>
    <div id="sln-tray">
      <a class="sln-tray-icon" href="/app" title="マイページ">👤</a>
      <div id="sln-clock"><span id="sln-clock-t"></span><span id="sln-clock-d"></span></div>
    </div>
  `;
  document.body.appendChild(tb);

  // Add the main window chip to taskbar
  addToTaskbar('main', pageIcon, pageTitle);

  // ══════════════════════════════════════════════════════
  // Start Menu
  // ══════════════════════════════════════════════════════
  const cats = [...new Set(ALL_PAGES.map(p => p.cat))];

  const sm = document.createElement('div');
  sm.id = 'sln-start-menu';
  sm.innerHTML = `
    <div id="sln-sm-search-wrap">
      <span id="sln-sm-search-ico">🔍</span>
      <input id="sln-sm-search" placeholder="検索..." autocomplete="off" spellcheck="false"/>
    </div>
    <div id="sln-sm-body">
      <div id="sln-sm-left">
        <div class="sln-sm-sec-title">ピン留め</div>
        <div class="sln-sm-pinned">
          ${PINNED.map(p=>`<a class="sln-sm-pin" href="${p.href}" onclick="openPage('${p.href}');return false">
            <span class="sln-sm-pin-ico">${p.icon}</span>
            <span class="sln-sm-pin-lbl">${p.label}</span>
          </a>`).join('')}
        </div>
        <div class="sln-sm-sec-title">最近使用</div>
        <div id="sln-sm-recent"></div>
      </div>
      <div id="sln-sm-right">
        <div class="sln-sm-sec-title">すべてのアプリ</div>
        <div id="sln-sm-all-list">
          ${cats.map(cat => `
            <div class="sln-sm-cat">${cat}</div>
            ${ALL_PAGES.filter(p=>p.cat===cat).map(p=>`
              <a class="sln-sm-app" href="${p.href}" onclick="openPage('${p.href}');return false">
                <span class="sln-sm-app-ico">${p.icon}</span>
                <span class="sln-sm-app-lbl">${p.label}</span>
              </a>`).join('')}
          `).join('')}
        </div>
      </div>
      <div id="sln-sm-search-results"></div>
    </div>
    <div id="sln-sm-footer">
      <a id="sln-sm-user" href="/app" onclick="openPage('/app');return false">
        <div id="sln-sm-user-ava">👤</div>
        <div id="sln-sm-user-info">
          <div id="sln-sm-user-name">ログインしてください</div>
          <div id="sln-sm-user-sub">SOLUNAメンバー</div>
        </div>
      </a>
      <div class="sln-sm-power" title="ホームに戻る" onclick="location.href='/'">⏻</div>
    </div>
  `;
  document.body.appendChild(sm);

  // ── Start menu toggle ──
  window.toggleStartMenu = function() {
    const open = sm.classList.toggle('open');
    document.getElementById('sln-start-btn').classList.toggle('open', open);
    if (open) document.getElementById('sln-sm-search').focus();
  };
  window.closeStartMenu = function() {
    sm.classList.remove('open');
    document.getElementById('sln-start-btn').classList.remove('open');
  };

  // Close on click outside
  document.addEventListener('mousedown', e => {
    if (sm.classList.contains('open') && !sm.contains(e.target) && !document.getElementById('sln-start-btn').contains(e.target))
      closeStartMenu();
  });

  // ── Search ──
  document.getElementById('sln-sm-search').addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    const body = document.getElementById('sln-sm-body');
    const results = document.getElementById('sln-sm-search-results');
    if (!q) { body.classList.remove('searching'); return; }
    body.classList.add('searching');
    const hits = ALL_PAGES.filter(p => p.label.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
    results.innerHTML = hits.length
      ? hits.map(p=>`<a class="sln-sm-app" href="${p.href}" onclick="openPage('${p.href}');return false">
          <span class="sln-sm-app-ico">${p.icon}</span>
          <span class="sln-sm-app-lbl">${p.label} <span style="color:rgba(196,144,58,.4);font-size:10px">${p.cat}</span></span>
        </a>`).join('')
      : `<div style="padding:12px;font-size:12px;color:rgba(232,227,210,.3)">見つかりません</div>`;
  });

  // ── Login status ──
  async function checkLogin() {
    const token = localStorage.getItem('sln_token');
    if (!token) return;
    try {
      const r = await fetch('/api/soluna/me', { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        const nameEl = document.getElementById('sln-sm-user-name');
        const subEl = document.getElementById('sln-sm-user-sub');
        const avaEl = document.getElementById('sln-sm-user-ava');
        if (nameEl) nameEl.textContent = d.name || d.email || 'メンバー';
        if (subEl) subEl.textContent = d.member_type === 'owner' ? 'オーナー' : 'SOLUNAメンバー';
        if (avaEl) avaEl.textContent = '✓';
        // Also update taskbar tray
        const trayUser = document.querySelector('#sln-tray .sln-tray-icon');
        if (trayUser) trayUser.title = d.name || 'ログイン中';
      }
    } catch {}
  }
  checkLogin();

  // ── Clock ──
  function tick() {
    const n = new Date();
    const t = document.getElementById('sln-clock-t');
    const d = document.getElementById('sln-clock-d');
    if (t) t.textContent = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
    if (d) d.textContent = `${n.getMonth()+1}/${n.getDate()}`;
  }
  tick(); setInterval(tick, 15000);

  // ── SEO ──
  const canonUrl = DOMAIN + cleanPath;
  const ce = document.querySelector('link[rel="canonical"]');
  if (ce) ce.href = canonUrl;
  else { const c = document.createElement('link'); c.rel='canonical'; c.href=canonUrl; document.head.appendChild(c); }
  const ou = document.querySelector('meta[property="og:url"]');
  if (ou) ou.content = canonUrl;
  if (!document.querySelector('meta[property="og:site_name"]')) {
    const m = document.createElement('meta'); m.setAttribute('property','og:site_name'); m.content='SOLUNA'; document.head.appendChild(m);
  }

  // ── Keyboard ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeStartMenu();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleStartMenu(); }
  });
})();
