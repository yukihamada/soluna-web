"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PHOTOS = [
  { src: "/img/tapkop_lake_mashu_view.webp" },
  { src: "/img/kumaushi_aerial_dawn.webp" },
  { src: "/img/atami_sunset_ocean.webp" },
  { src: "/img/lodge_exterior_snow.webp" },
  { src: "/img/nesting_night.webp" },
  { src: "/img/village_arc_sunset.webp" },
  { src: "/img/property-honolulu.webp" },
  { src: "/img/pro_hawaii_hero.webp" },
  { src: "/images/fest/golden_hour.jpg" },
  { src: "/images/fest/crowd.jpg" },
];

const APPS = [
  { id: "properties",   icon: "🏡", label: "物件一覧",           url: "/properties" },
  { id: "buy",          icon: "💰", label: "購入・申込",         url: "/buy" },
  { id: "scheme",       icon: "🗺️", label: "スキーム",           url: "/scheme" },
  { id: "founders",     icon: "🌟", label: "創業者パック",       url: "/founders" },
  { id: "collection",   icon: "🗂️", label: "コレクション",       url: "/collection" },
  { id: "homes",        icon: "🏠", label: "カタログビレッジ",   url: "/homes" },
  { id: "hold",         icon: "📈", label: "長期保有プラン",     url: "/hold" },
  { id: "plan",         icon: "📋", label: "プラン",             url: "/plan" },
  { id: "brochure",     icon: "📄", label: "パンフレット",       url: "/brochure" },
  { id: "getfree",      icon: "🎁", label: "無料で口数を得る",   url: "/getfree" },
  { id: "referral",     icon: "🤝", label: "紹介制度",           url: "/referral" },
  { id: "gift",         icon: "🎀", label: "ギフト",             url: "/gift" },
  { id: "mint",         icon: "🪙", label: "NFT 口数",           url: "/mint" },
  { id: "crypto",       icon: "₿",  label: "仮想通貨購入",       url: "/crypto" },
  { id: "pass",         icon: "🎟️", label: "シーズンパス",       url: "/pass" },
  { id: "tapkop",       icon: "🏔️", label: "TAPKOP",             url: "/tapkop" },
  { id: "lodge",        icon: "🌲", label: "THE LODGE",          url: "/lodge" },
  { id: "nesting",      icon: "🪵", label: "NESTING",            url: "/nesting" },
  { id: "instant",      icon: "🔮", label: "インスタントハウス", url: "/instant" },
  { id: "atami",        icon: "🌊", label: "WHITE HOUSE 熱海",   url: "/atami" },
  { id: "kumaushi",     icon: "⛰️", label: "KUMAUSHI BASE",      url: "/kumaushi" },
  { id: "honolulu",     icon: "🌺", label: "HONOLULU VILLA",     url: "/honolulu" },
  { id: "village",      icon: "🏘️", label: "美留和ビレッジ",     url: "/village" },
  { id: "miruwa-grand", icon: "🏯", label: "美留和グランド",     url: "/miruwa-grand" },
  { id: "kussharo",     icon: "🏊", label: "屈斜路サウナ",       url: "/kussharo" },
  { id: "tapkop-story", icon: "📸", label: "TAPKOPの話",         url: "/tapkop-story" },
  { id: "lodge-story",  icon: "📸", label: "LODGEの話",          url: "/lodge-story" },
  { id: "nesting-story",icon: "📸", label: "NESTINGの話",        url: "/nesting-story" },
  { id: "atami-story",  icon: "📸", label: "熱海の話",           url: "/atami-story" },
  { id: "dome-story",   icon: "📸", label: "ドームの話",         url: "/dome-story" },
  { id: "kagawa",       icon: "🎨", label: "香川 空き家",        url: "/kagawa-akiya" },
  { id: "wakayama",     icon: "🌿", label: "和歌山 空き家",      url: "/wakayama-akiya" },
  { id: "boso",         icon: "🐚", label: "房総 空き家",        url: "/boso-akiya" },
  { id: "hakuba",       icon: "⛷️", label: "白馬 空き家",        url: "/hakuba-akiya" },
  { id: "sanin",        icon: "🦌", label: "山陰 空き家",        url: "/sanin-akiya" },
  { id: "akiya",        icon: "🏚️", label: "空き家活用",         url: "/akiya" },
  { id: "build",        icon: "🪵", label: "タイニーハウス建設", url: "/build" },
  { id: "workparty",    icon: "🔨", label: "Work Party",         url: "/workparty" },
  { id: "renovation",   icon: "🏗️", label: "リノベーション",     url: "/renovation" },
  { id: "zamna",        icon: "🎪", label: "ZAMNA HAWAII",       url: "/zamna" },
  { id: "tickets",      icon: "🎫", label: "チケット",           url: "/tickets" },
  { id: "lineup",       icon: "🎤", label: "ラインナップ",       url: "/lineup" },
  { id: "schedule",     icon: "📅", label: "スケジュール",       url: "/schedule" },
  { id: "village-c",    icon: "🛖", label: "ビレッジ構想",       url: "/village-concept" },
  { id: "village-d",    icon: "✏️", label: "ビレッジ設計",       url: "/village-design" },
  { id: "construction", icon: "🏗️", label: "建築計画",           url: "/construction" },
  { id: "blueprint",    icon: "📐", label: "ブループリント",     url: "/blueprint" },
  { id: "structural",   icon: "🔩", label: "構造計画",           url: "/structural" },
  { id: "sips",         icon: "🧱", label: "SIPs断熱",           url: "/sips" },
  { id: "sips-lab",     icon: "🔬", label: "SIPsラボ",           url: "/sips-lab" },
  { id: "materials",    icon: "🪵", label: "建材ブランド",       url: "/materials" },
  { id: "kits",         icon: "🔧", label: "ハードキット",       url: "/kits" },
  { id: "offgrid",      icon: "⚡", label: "オフグリッド",       url: "/offgrid" },
  { id: "design",       icon: "🎨", label: "デザイン",           url: "/design" },
  { id: "floorplans",   icon: "📏", label: "間取り集",           url: "/floorplans" },
  { id: "tower-sauna",  icon: "🧖", label: "タワーサウナ",       url: "/tower-sauna" },
  { id: "handcraft",    icon: "🪚", label: "ハンドクラフト",     url: "/handcraft" },
  { id: "mycelium",     icon: "🍄", label: "菌糸壁",             url: "/mycelium" },
  { id: "sumigaki",     icon: "🖤", label: "炭焼き外壁",         url: "/sumigaki" },
  { id: "community",    icon: "💬", label: "コミュニティ",       url: "/community" },
  { id: "app",          icon: "📱", label: "メンバーアプリ",     url: "/app" },
  { id: "owners",       icon: "🔑", label: "オーナー専用",       url: "/owners" },
  { id: "guide",        icon: "📖", label: "ガイド",             url: "/guide" },
  { id: "members",      icon: "👥", label: "メンバー一覧",       url: "/members" },
  { id: "network",      icon: "🌐", label: "ネットワーク",       url: "/network" },
  { id: "song",         icon: "🎵", label: "SOLUNAソング",       url: "/song" },
  { id: "join",         icon: "✋", label: "参加する",           url: "/join" },
  { id: "story",        icon: "📜", label: "ストーリー",         url: "/story" },
  { id: "origin",       icon: "🌱", label: "創業の話",           url: "/origin" },
  { id: "blog",         icon: "✍️", label: "ブログ",             url: "/blog" },
  ...Array.from({ length: 9 }, (_, i) => ({ id: `blog-${i + 1}`, icon: "📝", label: `ブログ ${i + 1}`, url: `/blog-${i + 1}` })),
  { id: "place",        icon: "🗾", label: "場所について",       url: "/place" },
  { id: "founding",     icon: "🏛️", label: "創業",               url: "/founding" },
  { id: "faq",          icon: "❓", label: "FAQ",                url: "/faq" },
  { id: "press",        icon: "📰", label: "プレス",             url: "/press" },
  { id: "safety",       icon: "🛡️", label: "安全・注意事項",     url: "/safety" },
  { id: "contact",      icon: "📩", label: "お問い合わせ",       url: "/contact" },
  { id: "company",      icon: "🏢", label: "会社情報",           url: "/company" },
  { id: "privacy",      icon: "🔒", label: "プライバシー",       url: "/privacy" },
  { id: "terms",        icon: "📑", label: "利用規約",           url: "/terms" },
  { id: "tokushoho",    icon: "📋", label: "特定商取引法",       url: "/tokushoho" },
  { id: "login",        icon: "👤", label: "ログイン",           url: "/login" },
];

const CATEGORIES = [
  { id: "invest", label: "別荘投資",      emoji: "🏡", ids: ["properties","buy","scheme","founders","collection","homes","hold","plan","brochure","getfree","referral","gift","mint","crypto","pass"] },
  { id: "props",  label: "物件",          emoji: "🏠", ids: ["tapkop","lodge","nesting","instant","atami","kumaushi","honolulu","village","miruwa-grand","kussharo","tapkop-story","lodge-story","nesting-story","atami-story","dome-story"] },
  { id: "akiya",  label: "空き家活用",    emoji: "🌊", ids: ["kagawa","wakayama","boso","hakuba","sanin","akiya","workparty","renovation"] },
  { id: "fest",   label: "フェスティバル",emoji: "🎪", ids: ["zamna","tickets","lineup","schedule"] },
  { id: "build",  label: "建築・素材",    emoji: "🔨", ids: ["village-c","village-d","construction","blueprint","structural","sips","sips-lab","materials","kits","offgrid","design","floorplans","tower-sauna","handcraft","mycelium","sumigaki"] },
  { id: "comm",   label: "コミュニティ",  emoji: "💬", ids: ["community","app","owners","guide","members","network","song","join"] },
  { id: "about",  label: "ストーリー",    emoji: "📖", ids: ["story","origin","blog",...Array.from({length:9},(_,i)=>`blog-${i+1}`),"place","founding"] },
  { id: "info",   label: "情報・サポート",emoji: "ℹ️", ids: ["faq","press","safety","contact","company","privacy","terms","tokushoho","login"] },
];

const DEFAULT_DOCK_IDS = ["properties", "scheme", "zamna", "buy"];

const PERSONA_CONFIG: Record<string, {
  label: string; emoji: string; dockIds: string[];
  heroLine1: string; heroLine2: string; heroDesc: string;
  btns: { label: string; primary?: boolean; id: string }[];
}> = {
  invest: {
    label: "投資家", emoji: "💰",
    dockIds: ["properties","buy","scheme"],
    heroLine1: "別荘を持つ、", heroLine2: "新しい形。",
    heroDesc: "10口シェアで登記所有。780万円から、年間30泊。\n使わない期間はプロが管理・運営をサポートします。",
    btns: [{ label: "物件を見る →", primary: true, id: "properties" }, { label: "スキームを詳しく", id: "scheme" }],
  },
  akiya: {
    label: "空き家活用", emoji: "🏚️",
    dockIds: ["kagawa","wakayama","boso","workparty"],
    heroLine1: "空き家を、", heroLine2: "人が集まる場所へ。",
    heroDesc: "香川・和歌山・房総・白馬。\n全国の空き家をSOLUNAとリノベーション。",
    btns: [{ label: "空き家を探す →", primary: true, id: "kagawa" }, { label: "Work Party に参加", id: "workparty" }],
  },
  fest: {
    label: "フェス", emoji: "🎪",
    dockIds: ["zamna","tickets","lineup","schedule"],
    heroLine1: "ZAMNA HAWAII", heroLine2: "2026",
    heroDesc: "ハワイ・オアフ島。2026年秋。\nZAMNA × SOLUNA — 最高のサウンドを体験しよう。",
    btns: [{ label: "フェスを見る →", primary: true, id: "zamna" }, { label: "ラインナップ", id: "lineup" }],
  },
  build: {
    label: "建築ファン", emoji: "🔨",
    dockIds: ["village-c","sips","construction","materials"],
    heroLine1: "自然建材で、", heroLine2: "家を建てよう。",
    heroDesc: "杉CLT・籾殻断熱・竹SIPs。\nSOLUNAビレッジで建築ワークショップ参加者募集中。",
    btns: [{ label: "ビレッジ構想を見る →", primary: true, id: "village-c" }, { label: "SIPs工法を学ぶ", id: "sips" }],
  },
};

const PAGE_TITLES: Record<string, string> = Object.fromEntries(APPS.map(a => [a.url, a.label]));

interface WinMeta {
  id: string; title: string; url: string; min: boolean; max: boolean;
}

export default function Home() {
  const [curSlide, setCurSlide]   = useState(0);
  const [prevSlide, setPrevSlide] = useState<number | null>(null);
  const [winMeta, setWinMeta]     = useState<WinMeta[]>([]);
  const [clock, setClock]         = useState("--:--");
  const [menuOpen, setMenuOpen]   = useState(false);
  const [search, setSearch]       = useState("");
  const [isMobile, setIsMobile]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  const [member, setMember]       = useState<{email:string;name?:string;member_type?:string}|null>(null);
  const [persona, setPersona]     = useState<string|null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<"email"|"otp">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginMsg, setLoginMsg]   = useState<{text:string;ok:boolean}|null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [dockHidden, setDockHidden] = useState(false);
  const dockHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showDock  = () => { if (dockHideTimer.current) clearTimeout(dockHideTimer.current); setDockHidden(false); };
  const startHide = () => { dockHideTimer.current = setTimeout(() => setDockHidden(true), 2500); };

  // Imperative window management
  const winLayerRef = useRef<HTMLDivElement>(null);
  const winEls = useRef(new Map<string, { el: HTMLDivElement; savedBounds?: { x:number; y:number; w:number; h:number } }>());
  const topZRef    = useRef(100);
  const winOffset  = useRef(0);
  const slideRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const winMetaRef = useRef<WinMeta[]>([]);
  useEffect(() => { winMetaRef.current = winMeta; }, [winMeta]);

  // Single shared drag state
  const activeDrag = useRef<{
    el: HTMLDivElement; mode: "move"|"resize"; edge: string;
    startX: number; startY: number; origX: number; origY: number; origW: number; origH: number;
  } | null>(null);

  // Stable action refs so DOM event handlers always call the latest version
  const act = useRef({
    close: (_id: string) => {},
    min:   (_id: string) => {},
    max:   (_id: string) => {},
    front: (_id: string) => {},
  });

  const kbAnims = ["kb1","kb2","kb3"];

  // ── URL sync ─────────────────────────────────────────────────────────────────
  const pushUrl = useCallback((url: string, title: string) => {
    history.pushState({ winUrl: url, title }, title, url);
  }, []);
  const replaceUrl = useCallback((url: string, title: string) => {
    history.replaceState({ winUrl: url, title }, title, url);
  }, []);

  // ── Global mouse handler (single listener for all drag/resize) ───────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = activeDrag.current; if (!d) return;
      const layer = winLayerRef.current; if (!layer) return;
      const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
      if (d.mode === "move") {
        d.el.style.left = Math.max(0, Math.min(layer.offsetWidth  - 80, d.origX + dx)) + "px";
        d.el.style.top  = Math.max(28, Math.min(layer.offsetHeight - 38, d.origY + dy)) + "px";
      } else {
        let nx = d.origX, ny = d.origY, nw = d.origW, nh = d.origH;
        if (d.edge.includes("e")) nw = Math.max(320, d.origW + dx);
        if (d.edge.includes("s")) nh = Math.max(200, d.origH + dy);
        if (d.edge.includes("w")) { nw = Math.max(320, d.origW - dx); if (nw > 320) nx = d.origX + dx; }
        if (d.edge.includes("n")) { nh = Math.max(200, d.origH - dy); if (nh > 200) ny = d.origY + dy; }
        d.el.style.left   = nx + "px";
        d.el.style.top    = ny + "px";
        d.el.style.width  = nw + "px";
        d.el.style.height = nh + "px";
      }
    };
    const onUp = () => {
      if (activeDrag.current) { activeDrag.current = null; document.body.classList.remove("dragging"); }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, []);

  // ── bringToFront ─────────────────────────────────────────────────────────────
  const bringToFront = useCallback((id: string) => {
    const entry = winEls.current.get(id); if (!entry) return;
    topZRef.current++;
    entry.el.style.zIndex = String(topZRef.current);
    winEls.current.forEach((e, eid) => e.el.classList.toggle("win-active", eid === id));
  }, []);

  // ── closeWin ─────────────────────────────────────────────────────────────────
  const closeWin = useCallback((id: string) => {
    const entry = winEls.current.get(id); if (!entry) return;
    entry.el.remove();
    winEls.current.delete(id);
    setWinMeta(m => {
      const rest = m.filter(w => w.id !== id);
      if (rest.length === 0) replaceUrl("/", "SOLUNA");
      return rest;
    });
  }, [replaceUrl]);

  // ── toggleMin ────────────────────────────────────────────────────────────────
  const toggleMin = useCallback((id: string) => {
    const entry = winEls.current.get(id); if (!entry) return;
    setWinMeta(m => m.map(w => {
      if (w.id !== id) return w;
      const nowMin = !w.min;
      const body = entry.el.querySelector(".win-body") as HTMLElement | null;
      if (nowMin) {
        if (!entry.savedBounds) {
          entry.savedBounds = {
            x: parseInt(entry.el.style.left) || 0,
            y: parseInt(entry.el.style.top)  || 0,
            w: parseInt(entry.el.style.width)  || 800,
            h: parseInt(entry.el.style.height) || 560,
          };
        }
        entry.el.classList.add("minimized");
        if (body) body.style.display = "none";
      } else {
        entry.el.classList.remove("minimized");
        if (body) body.style.display = "";
        if (entry.savedBounds) entry.el.style.height = entry.savedBounds.h + "px";
        act.current.front(id);
      }
      return { ...w, min: nowMin };
    }));
  }, []);

  // ── toggleMax ────────────────────────────────────────────────────────────────
  const toggleMax = useCallback((id: string) => {
    const entry = winEls.current.get(id); if (!entry) return;
    const layer = winLayerRef.current; if (!layer) return;
    setWinMeta(m => m.map(w => {
      if (w.id !== id) return w;
      const z = entry.el.style.zIndex;
      if (!w.max) {
        entry.savedBounds = {
          x: parseInt(entry.el.style.left) || 0,
          y: parseInt(entry.el.style.top)  || 0,
          w: parseInt(entry.el.style.width)  || 800,
          h: parseInt(entry.el.style.height) || 560,
        };
        entry.el.style.cssText = `left:0px;top:28px;width:${layer.offsetWidth}px;height:${layer.offsetHeight - 28}px;z-index:${z}`;
        entry.el.classList.add("maximized");
        act.current.front(id);
        return { ...w, max: true };
      } else {
        const sb = entry.savedBounds;
        entry.el.style.cssText = sb
          ? `left:${sb.x}px;top:${sb.y}px;width:${sb.w}px;height:${sb.h}px;z-index:${z}`
          : `left:60px;top:60px;width:800px;height:560px;z-index:${z}`;
        entry.el.classList.remove("maximized");
        act.current.front(id);
        return { ...w, max: false };
      }
    }));
  }, []);

  // Sync stable action refs
  useEffect(() => {
    act.current = { close: closeWin, min: toggleMin, max: toggleMax, front: bringToFront };
  }, [closeWin, toggleMin, toggleMax, bringToFront]);

  // ── openWin (creates DOM element) ────────────────────────────────────────────
  const openWin = useCallback((url: string, title: string, fromPopstate = false) => {
    const layer = winLayerRef.current; if (!layer) return;

    const dw = window.innerWidth, dh = window.innerHeight;
    const w = Math.min(800, Math.round(dw * 0.65));
    const h = Math.min(560, Math.round(dh * 0.65));
    const off = (winOffset.current % 6) * 28;
    winOffset.current++;
    const x = Math.max(20, Math.round((dw - w) / 2 + off - 80));
    const y = Math.max(40, Math.round((dh - h) / 2 + off - 60));

    const id = `w-${Date.now()}`;
    topZRef.current++;
    const z = topZRef.current;

    const el = document.createElement("div");
    el.id = id;
    el.className = "win win-active";
    el.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${z}`;

    const frameUrl = url + (url.includes("?") ? "&embed=1" : "?embed=1");
    el.innerHTML = `
      <div class="win-bar">
        <div class="win-dots">
          <button class="win-btn" style="background:#ff5f57" title="閉じる"></button>
          <button class="win-btn" style="background:#febc2e" title="最小化"></button>
          <button class="win-btn" style="background:#28c840" title="最大化"></button>
        </div>
        <span class="win-title">${title}</span>
      </div>
      <div class="win-body">
        <iframe src="${frameUrl}" title="${title}" loading="lazy"></iframe>
      </div>
      <div class="rh rh-n"></div><div class="rh rh-s"></div>
      <div class="rh rh-e"></div><div class="rh rh-w"></div>
      <div class="rh rh-nw"></div><div class="rh rh-ne"></div>
      <div class="rh rh-sw"></div><div class="rh rh-se"></div>
    `;

    // Deactivate all other windows
    winEls.current.forEach(e => e.el.classList.remove("win-active"));

    const entry: { el: HTMLDivElement; savedBounds?: { x:number; y:number; w:number; h:number } } = { el };
    winEls.current.set(id, entry);
    layer.appendChild(el);

    // Wire buttons
    const btns = el.querySelectorAll(".win-btn");
    (btns[0] as HTMLElement).onclick = () => act.current.close(id);
    (btns[1] as HTMLElement).onclick = () => act.current.min(id);
    (btns[2] as HTMLElement).onclick = () => act.current.max(id);

    // Double-click bar → maximize
    (el.querySelector(".win-bar") as HTMLElement).addEventListener("dblclick", (e) => {
      if (!(e.target as HTMLElement).closest(".win-dots")) act.current.max(id);
    });

    // Mousedown → bring to front
    el.addEventListener("mousedown", () => act.current.front(id));

    // Drag
    const bar = el.querySelector(".win-bar") as HTMLElement;
    bar.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).closest(".win-dots")) return;
      activeDrag.current = {
        el, mode: "move", edge: "",
        startX: e.clientX, startY: e.clientY,
        origX: parseInt(el.style.left) || 0,
        origY: parseInt(el.style.top)  || 0,
        origW: parseInt(el.style.width)  || w,
        origH: parseInt(el.style.height) || h,
      };
      document.body.classList.add("dragging");
      e.preventDefault();
    });

    // Resize handles
    el.querySelectorAll(".rh").forEach(handle => {
      const cls = [...handle.classList].find(c => c.startsWith("rh-") && c.length > 3);
      const edge = cls ? cls.replace("rh-", "") : "";
      if (!edge) return;
      handle.addEventListener("mousedown", (ev: Event) => {
        const me = ev as MouseEvent;
        activeDrag.current = {
          el, mode: "resize", edge,
          startX: me.clientX, startY: me.clientY,
          origX: parseInt(el.style.left) || 0,
          origY: parseInt(el.style.top)  || 0,
          origW: parseInt(el.style.width)  || w,
          origH: parseInt(el.style.height) || h,
        };
        document.body.classList.add("dragging");
        me.preventDefault(); me.stopPropagation();
      });
    });

    setWinMeta(m => [...m, { id, title, url, min: false, max: false }]);
    if (!fromPopstate) pushUrl(url, title);
    setMenuOpen(false); setSearch("");
  }, [pushUrl]);

  // ── popstate ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.winUrl && e.state.winUrl !== "/") {
        const existing = winMetaRef.current.find(w => w.url === e.state.winUrl);
        if (!existing) openWin(e.state.winUrl, e.state.title || "", true);
      } else {
        winMetaRef.current.forEach(w => {
          const entry = winEls.current.get(w.id);
          if (entry) entry.el.remove();
          winEls.current.delete(w.id);
        });
        setWinMeta([]);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [openWin]);

  // ── Login helpers ─────────────────────────────────────────────────────────────
  const sendOtp = useCallback(async () => {
    if (!loginEmail.trim()) return;
    setLoginLoading(true); setLoginMsg(null);
    try {
      const r = await fetch("/api/soluna/otp", { method:"POST",
        headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: loginEmail.trim() }) });
      if (r.ok) { setLoginStep("otp"); setLoginMsg({ text:"認証コードを送りました", ok:true }); }
      else { setLoginMsg({ text:"送信に失敗しました", ok:false }); }
    } catch { setLoginMsg({ text:"通信エラー", ok:false }); }
    setLoginLoading(false);
  }, [loginEmail]);

  const verifyOtp = useCallback(async () => {
    if (!loginCode.trim()) return;
    setLoginLoading(true); setLoginMsg(null);
    try {
      const r = await fetch("/api/soluna/verify", { method:"POST",
        headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: loginEmail.trim(), code: loginCode.trim() }) });
      const d = await r.json();
      if (d.token) {
        localStorage.setItem("sln_token", d.token);
        const me = await fetch("/api/soluna/me", { headers:{"Authorization":"Bearer "+d.token} });
        const md = await me.json();
        if (md.member) setMember(md.member);
        setLoginOpen(false); setLoginStep("email"); setLoginCode(""); setLoginMsg(null);
        if (!localStorage.getItem("sln_persona")) setPersonaOpen(true);
      } else {
        setLoginMsg({ text: d.error || "コードが正しくありません", ok:false });
      }
    } catch { setLoginMsg({ text:"通信エラー", ok:false }); }
    setLoginLoading(false);
  }, [loginEmail, loginCode]);

  const logout = useCallback(() => {
    localStorage.removeItem("sln_token");
    setMember(null); setLoginMsg(null); setLoginStep("email"); setLoginCode(""); setLoginEmail("");
  }, []);

  const savePersona = useCallback((p: string) => {
    localStorage.setItem("sln_persona", p); setPersona(p); setPersonaOpen(false);
  }, []);

  // ── Init ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    document.body.classList.add("home-page");

    const token = localStorage.getItem("sln_token");
    const savedPersona = localStorage.getItem("sln_persona");
    if (savedPersona) setPersona(savedPersona);
    if (token) {
      fetch("/api/soluna/me", { headers:{"Authorization":"Bearer "+token} })
        .then(r => r.json()).then(d => { if (d.member) setMember(d.member); }).catch(() => {});
    }

    const path = window.location.pathname;
    if (path !== "/") {
      const title = PAGE_TITLES[path] || path.replace("/","");
      replaceUrl("/", "SOLUNA");
      setTimeout(() => openWin(path, title), 50);
    }

    return () => { window.removeEventListener("resize", onResize); document.body.classList.remove("home-page"); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Clock ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("ja-JP", { hour:"2-digit", minute:"2-digit" }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
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

  // ── Computed ──────────────────────────────────────────────────────────────────
  const filteredApps = APPS.filter(a => !search || a.label.includes(search) || a.id.includes(search.toLowerCase()));
  const activeDockIds = (persona && PERSONA_CONFIG[persona]?.dockIds) || DEFAULT_DOCK_IDS;
  const dockApps = APPS.filter(a => activeDockIds.includes(a.id));
  const pc = persona ? PERSONA_CONFIG[persona] : null;

  // ── Mobile ────────────────────────────────────────────────────────────────────
  if (mounted && isMobile) {
    return (
      <>
        <div style={{ position:"fixed", inset:0, backgroundImage:`url(${PHOTOS[0].src})`,
          backgroundSize:"cover", backgroundPosition:"center", filter:"brightness(.4)" }} />
        <div style={{ position:"relative", zIndex:1, minHeight:"100vh", padding:"20px 16px 60px", overflowY:"auto" }}>
          <div style={{ textAlign:"center", padding:"44px 0 28px" }}>
            <div style={{ fontSize:"2.2rem", fontWeight:700, letterSpacing:".15em", color:"#c9a962", fontFamily:"Anton,sans-serif" }}>SOLUNA</div>
            <div style={{ fontSize:".7rem", color:"rgba(255,255,255,.4)", marginTop:5, fontFamily:"Inter,sans-serif" }}>北海道 · 熱海 · ハワイ</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.id}>
                <div style={{ fontSize:".58rem", color:"rgba(255,255,255,.3)", letterSpacing:".12em", marginBottom:5, fontFamily:"Inter,sans-serif" }}>
                  {cat.emoji} {cat.label.toUpperCase()}
                </div>
                {cat.ids.map(id => {
                  const app = APPS.find(a => a.id === id); if (!app) return null;
                  return (
                    <a key={id} href={app.url} className="mobile-card" style={{ marginBottom:5 }}>
                      <span style={{ fontSize:"1.7rem" }}>{app.icon}</span>
                      <span style={{ fontSize:".88rem", fontWeight:600, color:"#fff", fontFamily:"Inter,sans-serif" }}>{app.label}</span>
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

  // ── Desktop ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:"fixed", inset:0, background:"#000" }}
      onClick={() => { if (menuOpen) setMenuOpen(false); }}>

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

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:28, zIndex:300,
        background:"rgba(0,0,0,.65)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,.06)",
        display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px" }}>
        <span style={{ fontFamily:"Anton,sans-serif", fontSize:".8rem", letterSpacing:".15em", color:"#c9a962" }}>⬡ SOLUNA</span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {persona && (
            <button className="topbar-login" onClick={() => setPersonaOpen(true)}
              style={{ borderColor:"rgba(201,169,98,.3)", color:"#c9a962" }}>
              {PERSONA_CONFIG[persona]?.emoji} {PERSONA_CONFIG[persona]?.label}
            </button>
          )}
          {member ? (
            <div className="topbar-user" onClick={logout}>
              <div className="topbar-avatar">{(member.name || member.email)[0].toUpperCase()}</div>
              <span style={{ fontSize:"11px", color:"rgba(255,255,255,.6)" }}>
                {member.name || member.email.split("@")[0]}
              </span>
            </div>
          ) : (
            <button className="topbar-login" onClick={() => setLoginOpen(true)}>ログイン</button>
          )}
          <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.5)", fontVariantNumeric:"tabular-nums" }}>{clock}</span>
        </div>
      </div>

      {/* Hero (only when no windows open) */}
      {mounted && winMeta.length === 0 && (
        <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%, -52%)",
          textAlign:"center", zIndex:50, animation:"heroIn .8s ease both", width:"min(640px, 90vw)" }}>
          {member && (
            <p style={{ fontSize:".65rem", letterSpacing:".2em", color:"#c9a962", marginBottom:12, fontFamily:"Inter,sans-serif" }}>
              ようこそ、{member.name || member.email.split("@")[0]} さん
            </p>
          )}
          <p style={{ fontSize:".68rem", letterSpacing:".35em", color:"rgba(255,255,255,.45)", marginBottom:16, fontFamily:"Inter,sans-serif" }}>
            {pc ? ({ invest:"北海道3万坪 · 熱海 · ハワイ · 780万円〜 · 年間30泊 · 登記所有", akiya:"香川 · 和歌山 · 房総 · 白馬 · 空き家リノベーション", fest:"OAHU HAWAII · 2026 AUTUMN · ZAMNA × SOLUNA", build:"杉CLT · 籾殻断熱 · 竹SIPs · 美留和ビレッジ" } as Record<string,string>)[persona!] : "北海道3万坪 · 熱海 · ハワイ · 780万円〜 · 年間30泊 · 登記所有"}
          </p>
          <h1 style={{ fontFamily:"Anton,sans-serif", fontSize:"clamp(2.8rem,7vw,5rem)",
            letterSpacing:".04em", lineHeight:.95, color:"#fff",
            textShadow:"0 4px 24px rgba(0,0,0,.7)", margin:"0 0 16px" }}>
            {pc ? pc.heroLine1 : "別荘を持つ、"}<br />
            <span style={{ color:"#c9a962" }}>{pc ? pc.heroLine2 : "新しい形。"}</span>
          </h1>
          <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.55)", lineHeight:1.7, marginBottom:28,
            fontFamily:"Inter,sans-serif", textShadow:"0 2px 8px rgba(0,0,0,.8)", whiteSpace:"pre-line" }}>
            {pc ? pc.heroDesc : "10口シェアで登記所有。780万円から、年間30泊。\n使わない期間はプロが管理・運営をサポートします。"}
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {pc ? pc.btns.map(b => {
              const app = APPS.find(a => a.id === b.id);
              return (
                <button key={b.id} className={`hero-btn ${b.primary ? "hero-btn-primary" : "hero-btn-ghost"}`}
                  onClick={() => openWin(app?.url || "/", app?.label || b.label)}>
                  {b.label}
                </button>
              );
            }) : (
              <>
                <button className="hero-btn hero-btn-primary" onClick={() => openWin("/properties", "物件一覧")}>物件を見る →</button>
                <button className="hero-btn hero-btn-ghost"   onClick={() => openWin("/zamna", "ZAMNA HAWAII")}>🎪 ZAMNA HAWAII &apos;26</button>
                <button className="hero-btn hero-btn-ghost"   onClick={() => openWin("/scheme", "スキーム")}>スキームを詳しく</button>
              </>
            )}
          </div>
          <div style={{ marginTop:16, display:"flex", gap:12, justifyContent:"center", alignItems:"center" }}>
            <p style={{ fontSize:".65rem", color:"rgba(255,255,255,.25)", fontFamily:"Inter,sans-serif" }}>East Ventures 出資 · 2020年創業</p>
            {!member && (
              <button onClick={() => setPersonaOpen(true)}
                style={{ fontSize:".65rem", color:"rgba(201,169,98,.6)", background:"none", border:"none",
                  cursor:"pointer", fontFamily:"Inter,sans-serif", textDecoration:"underline", padding:0 }}>
                興味を設定 →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Win layer — imperative DOM, pointer-events managed via CSS */}
      <div id="win-layer" ref={winLayerRef} />

      {/* All-apps panel */}
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
          ) : CATEGORIES.map(cat => {
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
          })}
        </div>
      )}

      {/* Login modal */}
      {loginOpen && (
        <div className="modal-bg" onClick={() => setLoginOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-logo">⬡ SOLUNA</div>
            <div className="modal-title">{loginStep === "email" ? "ログイン" : "認証コードを入力"}</div>
            <div className="modal-sub">
              {loginStep === "email" ? "メールアドレスに認証コードを送ります" : `${loginEmail} に送られたコードを入力してください`}
            </div>
            {loginStep === "email" ? (
              <>
                <input className="modal-inp" type="email" placeholder="your@email.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendOtp()} autoFocus />
                <button className="modal-btn" onClick={sendOtp} disabled={loginLoading}>
                  {loginLoading ? "送信中…" : "コードを送る →"}
                </button>
              </>
            ) : (
              <>
                <input className="modal-inp" type="text" placeholder="123456"
                  value={loginCode} onChange={e => setLoginCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && verifyOtp()} autoFocus maxLength={6} />
                <button className="modal-btn" onClick={verifyOtp} disabled={loginLoading}>
                  {loginLoading ? "確認中…" : "ログイン →"}
                </button>
                <button className="modal-link" onClick={() => { setLoginStep("email"); setLoginMsg(null); }}>
                  ← メールアドレスを変更
                </button>
              </>
            )}
            {loginMsg && <div className={`modal-msg ${loginMsg.ok ? "ok" : "err"}`}>{loginMsg.text}</div>}
          </div>
        </div>
      )}

      {/* Persona picker */}
      {personaOpen && (
        <div className="modal-bg" onClick={() => setPersonaOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-logo">⬡ SOLUNA</div>
            <div className="modal-title">興味を教えてください</div>
            <div className="modal-sub">あなたに合ったコンテンツを表示します</div>
            <div className="persona-grid">
              {Object.entries(PERSONA_CONFIG).map(([key, p]) => (
                <div key={key} className={`persona-card${persona===key?" sel":""}`} onClick={() => savePersona(key)}>
                  <span className="persona-em">{p.emoji}</span>
                  <span className="persona-lbl">{p.label}</span>
                  <span className="persona-desc">
                    {({ invest:"別荘投資・共同所有", akiya:"空き家活用・リノベ", fest:"フェス・イベント", build:"建築・自然素材" } as Record<string,string>)[key]}
                  </span>
                </div>
              ))}
            </div>
            {persona && <button className="modal-link" onClick={() => setPersonaOpen(false)}>キャンセル</button>}
          </div>
        </div>
      )}

      {/* Dock hover trigger */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:dockHidden ? 12 : 80,
        zIndex:399, pointerEvents:"all" }} onMouseEnter={showDock} onMouseLeave={startHide} />
      {dockHidden && (
        <div style={{ position:"absolute", bottom:3, left:"50%", transform:"translateX(-50%)",
          width:64, height:4, borderRadius:2, background:"rgba(255,255,255,.18)", zIndex:401, pointerEvents:"none" }} />
      )}

      {/* Dock */}
      <div style={{ position:"absolute", bottom:8, left:"50%",
        transform: dockHidden ? "translateX(-50%) translateY(calc(100% + 16px))" : "translateX(-50%)",
        transition:"transform .3s cubic-bezier(.4,0,.2,1)", zIndex:400,
        display:"flex", alignItems:"center",
        background:"rgba(0,0,0,.5)", backdropFilter:"blur(28px) saturate(180%)",
        border:"1px solid rgba(255,255,255,.11)", borderRadius:22, padding:"6px 12px" }}
        onClick={e => e.stopPropagation()} onMouseEnter={showDock} onMouseLeave={startHide}>

        {dockApps.map(app => {
          const isActive = winMeta.some(w => w.url === app.url && !w.min);
          return (
            <div key={app.id} className="dock-icon" onClick={() => openWin(app.url, app.label)}>
              <span className="di-em">{app.icon}</span>
              <span className="di-lbl">{app.label}</span>
              {isActive && <div className="menu-dot" />}
              <span className="win-tooltip">{app.label}</span>
            </div>
          );
        })}

        {winMeta.filter(w => w.min).map(win => {
          const app = APPS.find(a => a.url === win.url);
          return (
            <div key={win.id} className="dock-icon" onClick={() => toggleMin(win.id)}>
              <span className="di-em">{app?.icon ?? "🪟"}</span>
              <span className="di-lbl" style={{ color:"#c9a962" }}>{app?.label ?? win.title}</span>
              <div className="menu-dot" />
            </div>
          );
        })}

        <div className="dock-sep" />

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
  );
}
