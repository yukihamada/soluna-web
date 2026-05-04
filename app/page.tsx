"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PHOTOS = [
  { src: "/img/tapkop_lake_mashu_view.webp" },   // TAPKOP 屈斜路湖
  { src: "/img/kumaushi_aerial_dawn.webp" },      // KUMAUSHI 夜明け
  { src: "/img/atami_sunset_ocean.webp" },        // 熱海 サンセット
  { src: "/img/lodge_exterior_snow.webp" },       // LODGE 雪景色
  { src: "/img/nesting_night.webp" },             // NESTING 夜
  { src: "/img/village_arc_sunset.webp" },        // ビレッジ 夕暮れ
  { src: "/img/property-honolulu.webp" },         // ホノルル
  { src: "/img/pro_hawaii_hero.webp" },           // ハワイカイ
  { src: "/images/fest/golden_hour.jpg" },        // ZAMNA ゴールデンアワー
  { src: "/images/fest/crowd.jpg" },              // フェス
];

const APPS = [
  // 別荘投資
  { id: "properties",   icon: "🏡", label: "物件一覧",           url: "/properties" },
  { id: "buy",          icon: "💰", label: "購入・申込",         url: "/buy" },
  { id: "scheme",       icon: "🗺️", label: "スキーム",           url: "/scheme" },
  { id: "investor",     icon: "📊", label: "投資家向け",         url: "/investor" },
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
  // 物件
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
  // 空き家活用
  { id: "kagawa",       icon: "🎨", label: "香川 空き家",        url: "/kagawa-akiya" },
  { id: "wakayama",     icon: "🌿", label: "和歌山 空き家",      url: "/wakayama-akiya" },
  { id: "boso",         icon: "🐚", label: "房総 空き家",        url: "/boso-akiya" },
  { id: "hakuba",       icon: "⛷️", label: "白馬 空き家",        url: "/hakuba-akiya" },
  { id: "sanin",        icon: "🦌", label: "山陰 空き家",        url: "/sanin-akiya" },
  { id: "akiya",        icon: "🏚️", label: "空き家活用",         url: "/akiya" },
  { id: "workparty",    icon: "🔨", label: "Work Party",         url: "/workparty" },
  { id: "renovation",   icon: "🏗️", label: "リノベーション",     url: "/renovation" },
  // フェスティバル
  { id: "zamna",        icon: "🎪", label: "ZAMNA HAWAII",       url: "/zamna" },
  { id: "tickets",      icon: "🎫", label: "チケット",           url: "/tickets" },
  { id: "lineup",       icon: "🎤", label: "ラインナップ",       url: "/lineup" },
  { id: "schedule",     icon: "📅", label: "スケジュール",       url: "/schedule" },
  // 建築・素材
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
  // コミュニティ
  { id: "community",    icon: "💬", label: "コミュニティ",       url: "/community" },
  { id: "app",          icon: "📱", label: "メンバーアプリ",     url: "/app" },
  { id: "owners",       icon: "🔑", label: "オーナー専用",       url: "/owners" },
  { id: "guide",        icon: "📖", label: "ガイド",             url: "/guide" },
  { id: "members",      icon: "👥", label: "メンバー一覧",       url: "/members" },
  { id: "network",      icon: "🌐", label: "ネットワーク",       url: "/network" },
  { id: "song",         icon: "🎵", label: "SOLUNAソング",       url: "/song" },
  { id: "join",         icon: "✋", label: "参加する",           url: "/join" },
  // ストーリー・ブログ
  { id: "story",        icon: "📜", label: "ストーリー",         url: "/story" },
  { id: "origin",       icon: "🌱", label: "創業の話",           url: "/origin" },
  { id: "blog",         icon: "✍️", label: "ブログ",             url: "/blog" },
  { id: "blog-1",       icon: "📝", label: "ブログ 1",           url: "/blog-1" },
  { id: "blog-2",       icon: "📝", label: "ブログ 2",           url: "/blog-2" },
  { id: "blog-3",       icon: "📝", label: "ブログ 3",           url: "/blog-3" },
  { id: "blog-4",       icon: "📝", label: "ブログ 4",           url: "/blog-4" },
  { id: "blog-5",       icon: "📝", label: "ブログ 5",           url: "/blog-5" },
  { id: "blog-6",       icon: "📝", label: "ブログ 6",           url: "/blog-6" },
  { id: "blog-7",       icon: "📝", label: "ブログ 7",           url: "/blog-7" },
  { id: "blog-8",       icon: "📝", label: "ブログ 8",           url: "/blog-8" },
  { id: "blog-9",       icon: "📝", label: "ブログ 9",           url: "/blog-9" },
  { id: "place",        icon: "🗾", label: "場所について",       url: "/place" },
  { id: "founding",     icon: "🏛️", label: "創業",               url: "/founding" },
  // 情報・サポート
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
  { id: "invest", label: "別荘投資",      emoji: "🏡", ids: ["properties","buy","scheme","investor","founders","collection","homes","hold","plan","brochure","getfree","referral","gift","mint","crypto","pass"] },
  { id: "props",  label: "物件",          emoji: "🏠", ids: ["tapkop","lodge","nesting","instant","atami","kumaushi","honolulu","village","miruwa-grand","kussharo","tapkop-story","lodge-story","nesting-story","atami-story","dome-story"] },
  { id: "akiya",  label: "空き家活用",    emoji: "🌊", ids: ["kagawa","wakayama","boso","hakuba","sanin","akiya","workparty","renovation"] },
  { id: "fest",   label: "フェスティバル",emoji: "🎪", ids: ["zamna","tickets","lineup","schedule"] },
  { id: "build",  label: "建築・素材",    emoji: "🔨", ids: ["village-c","village-d","construction","blueprint","structural","sips","sips-lab","materials","kits","offgrid","design","floorplans","tower-sauna","handcraft","mycelium","sumigaki"] },
  { id: "comm",   label: "コミュニティ",  emoji: "💬", ids: ["community","app","owners","guide","members","network","song","join"] },
  { id: "about",  label: "ストーリー",    emoji: "📖", ids: ["story","origin","blog","blog-1","blog-2","blog-3","blog-4","blog-5","blog-6","blog-7","blog-8","blog-9","place","founding"] },
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
    dockIds: ["properties","buy","scheme","investor"],
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

  /* Login / Persona modals */
  .modal-bg { position:fixed; inset:0; z-index:9000; display:flex; align-items:center;
    justify-content:center; background:rgba(0,0,0,.7); backdrop-filter:blur(6px); }
  .modal-box { background:#141210; border:1px solid rgba(255,255,255,.1); border-radius:16px;
    padding:36px 32px; width:min(420px,90vw); box-shadow:0 32px 80px rgba(0,0,0,.8); }
  .modal-logo { font-size:10px; font-weight:800; letter-spacing:.22em; color:#c9a962; margin-bottom:24px; }
  .modal-title { font-size:1.3rem; font-weight:700; color:#f0ece4; margin-bottom:8px; }
  .modal-sub { font-size:12px; color:rgba(255,255,255,.4); line-height:1.7; margin-bottom:24px; }
  .modal-inp { width:100%; background:#0e0c0a; border:1px solid rgba(255,255,255,.1); color:#e0dcd4;
    padding:12px 14px; border-radius:6px; font-size:13px; outline:none; box-sizing:border-box;
    font-family:Inter,sans-serif; margin-bottom:10px; }
  .modal-inp:focus { border-color:#c9a962; }
  .modal-btn { width:100%; background:#c9a962; color:#000; font-weight:800; font-size:12px;
    letter-spacing:.1em; padding:14px; border:none; border-radius:6px; cursor:pointer; }
  .modal-btn:hover { opacity:.9; }
  .modal-msg { font-size:12px; text-align:center; min-height:18px; margin-top:8px; }
  .modal-msg.ok { color:#4CAF50; } .modal-msg.err { color:#f44336; }
  .modal-link { font-size:11px; color:rgba(255,255,255,.3); text-align:center; margin-top:14px;
    cursor:pointer; background:none; border:none; width:100%; }
  .modal-link:hover { color:rgba(255,255,255,.6); }

  .persona-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px; }
  .persona-card { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08);
    border-radius:10px; padding:18px 14px; text-align:center; cursor:pointer; transition:all .15s; }
  .persona-card:hover, .persona-card.sel { background:rgba(201,169,98,.15);
    border-color:rgba(201,169,98,.4); }
  .persona-em { font-size:2rem; display:block; margin-bottom:8px; }
  .persona-lbl { font-size:13px; font-weight:700; color:#f0ece4; display:block; margin-bottom:4px; }
  .persona-desc { font-size:10px; color:rgba(255,255,255,.4); line-height:1.5; }

  .topbar-login { font-size:11px; color:rgba(255,255,255,.5); cursor:pointer;
    padding:3px 10px; border-radius:4px; border:1px solid rgba(255,255,255,.15);
    background:transparent; font-family:Inter,sans-serif; transition:all .15s; white-space:nowrap; }
  .topbar-login:hover { background:rgba(255,255,255,.08); color:#fff; }
  .topbar-user { display:flex; align-items:center; gap:6px; cursor:pointer; }
  .topbar-avatar { width:18px; height:18px; border-radius:50%;
    background:rgba(201,169,98,.3); border:1px solid #c9a962;
    display:flex; align-items:center; justify-content:center; font-size:9px; }

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

  // Auth + Persona
  const [member, setMember]       = useState<{email:string;name?:string;member_type?:string}|null>(null);
  const [persona, setPersona]     = useState<string|null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<"email"|"otp">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCode, setLoginCode] = useState("");
  const [loginMsg, setLoginMsg]   = useState<{text:string;ok:boolean}|null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

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
        const p = localStorage.getItem("sln_persona");
        if (!p) setPersonaOpen(true);
      } else {
        setLoginMsg({ text: d.error || "コードが正しくありません", ok:false });
      }
    } catch { setLoginMsg({ text:"通信エラー", ok:false }); }
    setLoginLoading(false);
  }, [loginEmail, loginCode]);

  const logout = useCallback(() => {
    localStorage.removeItem("sln_token");
    setMember(null);
    setLoginMsg(null); setLoginStep("email"); setLoginCode(""); setLoginEmail("");
  }, []);

  const savePersona = useCallback((p: string) => {
    localStorage.setItem("sln_persona", p);
    setPersona(p); setPersonaOpen(false);
  }, []);

  // ── Init: if arrived at a deep URL, open that window ─────────────────────────
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);

    // Restore session + persona from localStorage
    const token = localStorage.getItem("sln_token");
    const savedPersona = localStorage.getItem("sln_persona");
    if (savedPersona) setPersona(savedPersona);
    if (token) {
      fetch("/api/soluna/me", { headers:{"Authorization":"Bearer "+token} })
        .then(r => r.json()).then(d => { if (d.member) setMember(d.member); })
        .catch(() => {});
    }

    const path = window.location.pathname;
    if (path !== "/") {
      const title = PAGE_TITLES[path] || path.replace("/","");
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
  const activeDockIds = (persona && PERSONA_CONFIG[persona]?.dockIds) || DEFAULT_DOCK_IDS;
  const dockApps = APPS.filter(a => activeDockIds.includes(a.id));
  const pc = persona ? PERSONA_CONFIG[persona] : null;

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
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {persona && (
              <button className="topbar-login" onClick={() => setPersonaOpen(true)}
                style={{ borderColor:"rgba(201,169,98,.3)", color:"#c9a962" }}>
                {PERSONA_CONFIG[persona]?.emoji} {PERSONA_CONFIG[persona]?.label}
              </button>
            )}
            {member ? (
              <div className="topbar-user" onClick={() => logout()}>
                <div className="topbar-avatar">{(member.name || member.email)[0].toUpperCase()}</div>
                <span style={{ fontSize:"11px", color:"rgba(255,255,255,.6)" }}>
                  {member.name || member.email.split("@")[0]}
                </span>
              </div>
            ) : (
              <button className="topbar-login" onClick={() => setLoginOpen(true)}>ログイン</button>
            )}
            <span style={{ fontSize:".72rem", color:"rgba(255,255,255,.5)",
              fontVariantNumeric:"tabular-nums" }}>{clock}</span>
          </div>
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
            {member && (
              <p style={{ fontSize:".65rem", letterSpacing:".2em", color:"#c9a962",
                marginBottom:12, fontFamily:"Inter,sans-serif" }}>
                ようこそ、{member.name || member.email.split("@")[0]} さん
              </p>
            )}
            <p style={{ fontSize:".68rem", letterSpacing:".35em",
              color:"rgba(255,255,255,.45)", marginBottom:16, fontFamily:"Inter,sans-serif" }}>
              {pc ? {
                invest: "北海道3万坪 · 熱海 · ハワイ · 780万円〜 · 年間30泊 · 登記所有",
                akiya:  "香川 · 和歌山 · 房総 · 白馬 · 空き家リノベーション",
                fest:   "OAHU HAWAII · 2026 AUTUMN · ZAMNA × SOLUNA",
                build:  "杉CLT · 籾殻断熱 · 竹SIPs · 美留和ビレッジ",
              }[persona as string] : "北海道3万坪 · 熱海 · ハワイ · 780万円〜 · 年間30泊 · 登記所有"}
            </p>
            <h1 style={{ fontFamily:"Anton,sans-serif", fontSize:"clamp(2.8rem,7vw,5rem)",
              letterSpacing:".04em", lineHeight:.95, color:"#fff",
              textShadow:"0 4px 24px rgba(0,0,0,.7)", margin:"0 0 16px" }}>
              {pc ? pc.heroLine1 : "別荘を持つ、"}<br />
              <span style={{ color:"#c9a962" }}>{pc ? pc.heroLine2 : "新しい形。"}</span>
            </h1>
            <p style={{ fontSize:".82rem", color:"rgba(255,255,255,.55)",
              lineHeight:1.7, marginBottom:28, fontFamily:"Inter,sans-serif",
              textShadow:"0 2px 8px rgba(0,0,0,.8)", whiteSpace:"pre-line" }}>
              {pc ? pc.heroDesc : "10口シェアで登記所有。780万円から、年間30泊。\n使わない期間はプロが管理・運営をサポートします。"}
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              {pc ? pc.btns.map(b => {
                const app = APPS.find(a => a.id === b.id);
                return (
                  <button key={b.id}
                    className={`hero-btn ${b.primary ? "hero-btn-primary" : "hero-btn-ghost"}`}
                    onClick={() => openWin(app?.url || "/", app?.label || b.label)}>
                    {b.label}
                  </button>
                );
              }) : (
                <>
                  <button className="hero-btn hero-btn-primary"
                    onClick={() => openWin("/properties", "物件一覧")}>物件を見る →</button>
                  <button className="hero-btn hero-btn-ghost"
                    onClick={() => openWin("/zamna", "ZAMNA HAWAII")}>🎪 ZAMNA HAWAII &apos;26</button>
                  <button className="hero-btn hero-btn-ghost"
                    onClick={() => openWin("/scheme", "スキーム")}>スキームを詳しく</button>
                </>
              )}
            </div>
            <div style={{ marginTop:16, display:"flex", gap:12, justifyContent:"center", alignItems:"center" }}>
              <p style={{ fontSize:".65rem", color:"rgba(255,255,255,.25)", fontFamily:"Inter,sans-serif" }}>
                East Ventures 出資 · 2020年創業
              </p>
              {!member && (
                <button onClick={() => setPersonaOpen(true)}
                  style={{ fontSize:".65rem", color:"rgba(201,169,98,.6)", background:"none",
                    border:"none", cursor:"pointer", fontFamily:"Inter,sans-serif",
                    textDecoration:"underline", padding:0 }}>
                  興味を設定 →
                </button>
              )}
            </div>
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

        {/* ── Login modal ── */}
        {loginOpen && (
          <div className="modal-bg" onClick={() => setLoginOpen(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-logo">⬡ SOLUNA</div>
              <div className="modal-title">{loginStep === "email" ? "ログイン" : "認証コードを入力"}</div>
              <div className="modal-sub">
                {loginStep === "email"
                  ? "メールアドレスに認証コードを送ります"
                  : `${loginEmail} に送られたコードを入力してください`}
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
              {loginMsg && (
                <div className={`modal-msg ${loginMsg.ok ? "ok" : "err"}`}>{loginMsg.text}</div>
              )}
            </div>
          </div>
        )}

        {/* ── Persona picker ── */}
        {personaOpen && (
          <div className="modal-bg" onClick={() => setPersonaOpen(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-logo">⬡ SOLUNA</div>
              <div className="modal-title">興味を教えてください</div>
              <div className="modal-sub">あなたに合ったコンテンツを表示します</div>
              <div className="persona-grid">
                {Object.entries(PERSONA_CONFIG).map(([key, p]) => (
                  <div key={key} className={`persona-card${persona===key?" sel":""}`}
                    onClick={() => savePersona(key)}>
                    <span className="persona-em">{p.emoji}</span>
                    <span className="persona-lbl">{p.label}</span>
                    <span className="persona-desc">
                      {{ invest:"別荘投資・共同所有", akiya:"空き家活用・リノベ", fest:"フェス・イベント", build:"建築・自然素材" }[key]}
                    </span>
                  </div>
                ))}
              </div>
              {persona && (
                <button className="modal-link" onClick={() => setPersonaOpen(false)}>キャンセル</button>
              )}
            </div>
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
