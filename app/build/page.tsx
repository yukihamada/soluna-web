"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
  viewport: { once: true },
};

const MATERIALS = [
  { cat: "SIPsパネル（壁・屋根）", emoji: "🏗️", total: 1480000, color: "#c9a962",
    alt: "在来工法に変更でコスト▲¥80万、工期+2週",
    url: null,
    items: [
      { name: "SIPsパネル 壁用 OSB+160mm硬質ウレタン+OSB", qty: "80 m²", unit: "¥12,000/m²", total: 960000, note: "工場製作・配送込み" },
      { name: "SIPsパネル 屋根用 200mm", qty: "35 m²", unit: "¥14,000/m²", total: 490000, note: "勾配対応" },
      { name: "スプラインジョイント材", qty: "一式", unit: "¥30,000", total: 30000, note: "" },
    ],
  },
  { cat: "オフグリッド電力", emoji: "☀️", total: 435884, color: "#f0c040",
    url: "https://www.amazon.co.jp/s?k=Renogy+ソーラーパネル",
    items: [
      { name: "Renogy 200W 単結晶パネル", qty: "4枚", unit: "¥25,771/枚", total: 103084, note: "" },
      { name: "EcoFlow DELTA Pro3 5kWh 蓄電池", qty: "1台", unit: "¥279,800", total: 279800, note: "" },
      { name: "MPPT 充電コントローラー 60A", qty: "1台", unit: "¥18,000", total: 18000, note: "" },
      { name: "配線・ブレーカー・コンセント一式", qty: "一式", unit: "¥35,000", total: 35000, note: "" },
    ],
  },
  { cat: "窓・開口部", emoji: "🪟", total: 333000, color: "#4ab8d0",
    url: null,
    items: [
      { name: "樹脂窓 トリプルガラス 南面大窓 W1690×H1830", qty: "1枚", unit: "¥95,000", total: 95000, note: "Low-E" },
      { name: "樹脂窓 W780×H1170", qty: "4枚", unit: "¥38,000/枚", total: 152000, note: "" },
      { name: "玄関ドア 断熱型", qty: "1枚", unit: "¥68,000", total: 68000, note: "" },
      { name: "窓台・額縁材", qty: "一式", unit: "¥18,000", total: 18000, note: "" },
    ],
  },
  { cat: "内装・仕上げ", emoji: "🪵", total: 330500, color: "#a0785a",
    url: null,
    items: [
      { name: "国産杉 羽目板 15mm（壁・天井）", qty: "60 m²", unit: "¥2,800/m²", total: 168000, note: "" },
      { name: "フローリング 杉無垢 15mm", qty: "25 m²", unit: "¥3,500/m²", total: 87500, note: "" },
      { name: "キッチン（シンプルIH）", qty: "1式", unit: "¥45,000", total: 45000, note: "" },
      { name: "造作棚・収納一式", qty: "一式", unit: "¥30,000", total: 30000, note: "" },
    ],
  },
  { cat: "給排水・衛生", emoji: "💧", total: 280000, color: "#5ab8a0",
    url: null,
    items: [
      { name: "Nature's Head コンポストトイレ", qty: "1台", unit: "¥200,000", total: 200000, note: "浄化槽不要・節約¥180万" },
      { name: "雨水タンク 1,000L", qty: "1基", unit: "¥35,000", total: 35000, note: "" },
      { name: "活性炭フィルター 3段 + UV殺菌", qty: "1式", unit: "¥20,000", total: 20000, note: "" },
      { name: "給水ポンプ・配管一式", qty: "一式", unit: "¥25,000", total: 25000, note: "" },
    ],
  },
  { cat: "外装", emoji: "🖤", total: 156778, color: "#888",
    url: "https://www.monotaro.com/p/1339/5302/",
    items: [
      { name: "ガルバリウム波板 横葺き 黒 0.35mm", qty: "85 m²", unit: "¥1,200/m²", total: 102000, note: "" },
      { name: "タイベック シルバー 透湿防水シート", qty: "1巻", unit: "¥19,778", total: 19778, note: "" },
      { name: "縦胴縁 21×45 通気層", qty: "50本", unit: "¥380/本", total: 19000, note: "" },
      { name: "外壁コーキング", qty: "20本", unit: "¥800/本", total: 16000, note: "" },
    ],
  },
  { cat: "構造材（プレカット）", emoji: "📐", total: 165000, color: "#b08060",
    url: null,
    items: [
      { name: "KD杉 105×105 柱材", qty: "12本", unit: "¥1,200/本", total: 14400, note: "プレカット込み" },
      { name: "KD杉 105×210 梁材", qty: "8本", unit: "¥2,800/本", total: 22400, note: "プレカット込み" },
      { name: "KD杉 45×105 間柱", qty: "40本", unit: "¥480/本", total: 19200, note: "" },
      { name: "構造用合板 28mm 床（剛床）", qty: "20枚", unit: "¥4,200/枚", total: 84000, note: "" },
      { name: "野縁・垂木セット", qty: "一式", unit: "¥25,000", total: 25000, note: "" },
    ],
  },
  { cat: "暖房（ロケットマスヒーター）", emoji: "🔥", total: 118140, color: "#e06030",
    url: "https://www.monotaro.com/p/4085/3580/",
    items: [
      { name: "耐火レンガ SK-32（200×100×60）", qty: "200個", unit: "¥228/個", total: 45600, note: "" },
      { name: "耐火モルタル 20kg", qty: "5袋", unit: "¥748/袋", total: 3740, note: "" },
      { name: "ステンレス煙突 Φ150 直管 900mm", qty: "6本", unit: "¥6,800/本", total: 40800, note: "" },
      { name: "煙突T管・エルボ・雨押さえ", qty: "一式", unit: "¥28,000", total: 28000, note: "" },
    ],
  },
  { cat: "断熱・気密", emoji: "🌡️", total: 123150, color: "#7080e0",
    url: "https://www.monotaro.com/p/2139/1148/",
    items: [
      { name: "スタイロフォーム 50mm（床下）", qty: "20枚", unit: "¥3,956/枚", total: 79120, note: "" },
      { name: "気密テープ 75mm×20m", qty: "10巻", unit: "¥1,403/巻", total: 14030, note: "" },
      { name: "先張り気密シート", qty: "50 m²", unit: "¥600/m²", total: 30000, note: "" },
    ],
  },
  { cat: "屋根", emoji: "🏠", total: 115600, color: "#606880",
    url: null,
    items: [
      { name: "ガルバリウム屋根材 立平葺き", qty: "35 m²", unit: "¥2,200/m²", total: 77000, note: "" },
      { name: "ルーフィング 22kg ゴムアス", qty: "2本", unit: "¥6,800/本", total: 13600, note: "" },
      { name: "棟包み・破風板", qty: "一式", unit: "¥25,000", total: 25000, note: "" },
    ],
  },
  { cat: "基礎（独立コンクリート）", emoji: "⚓", total: 71000, color: "#606060",
    url: null,
    items: [
      { name: "生コン（凍結深度1,000mm対応）", qty: "1.5 m³", unit: "¥16,000/m³", total: 24000, note: "" },
      { name: "型枠・鉄筋・アンカー一式", qty: "一式", unit: "¥35,000", total: 35000, note: "" },
      { name: "砕石・砂", qty: "一式", unit: "¥12,000", total: 12000, note: "" },
    ],
  },
];

const TOTAL = MATERIALS.reduce((s, m) => s + m.total, 0);

const BUILD_STEPS = [
  {
    week: "W1",
    phase: "基礎工事",
    icon: "⚓",
    color: "#606060",
    difficulty: "★★★☆☆",
    people: "2〜3人",
    cost: 71000,
    desc: "地面を掘り、コンクリート独立基礎を6点打つ。弟子屈の凍結深度は1,000mm（地面から1m下）まで掘る必要がある。レンタルミニユンボ（¥15,000/日）があると楽。",
    tools: ["ミニユンボ（レンタル）", "型枠板", "鉄筋・アンカーボルト", "生コン"],
    tips: "打設後は最低7日養生。凍結前に完了させること。",
    svg: (
      <svg viewBox="0 0 200 120" style={{ width: "100%" }}>
        <rect x="10" y="80" width="180" height="8" fill="#444" rx="2"/>
        <rect x="30" y="40" width="28" height="42" fill="#606060" stroke="#888" strokeWidth="1.5" rx="2"/>
        <rect x="86" y="40" width="28" height="42" fill="#606060" stroke="#888" strokeWidth="1.5" rx="2"/>
        <rect x="142" y="40" width="28" height="42" fill="#606060" stroke="#888" strokeWidth="1.5" rx="2"/>
        <line x1="44" y1="40" x2="44" y2="18" stroke="#c9a962" strokeWidth="1.5" strokeDasharray="3,2"/>
        <line x1="100" y1="40" x2="100" y2="18" stroke="#c9a962" strokeWidth="1.5" strokeDasharray="3,2"/>
        <line x1="156" y1="40" x2="156" y2="18" stroke="#c9a962" strokeWidth="1.5" strokeDasharray="3,2"/>
        <text x="100" y="12" fill="#c9a962" fontSize="7" textAnchor="middle">凍結深度 1,000mm</text>
        <text x="44" y="64" fill="#ddd" fontSize="7" textAnchor="middle">基礎</text>
        <text x="100" y="64" fill="#ddd" fontSize="7" textAnchor="middle">基礎</text>
        <text x="156" y="64" fill="#ddd" fontSize="7" textAnchor="middle">基礎</text>
        <text x="100" y="108" fill="#666" fontSize="6" textAnchor="middle">独立基礎 6点（アンカーボルト付き）</text>
      </svg>
    ),
  },
  {
    week: "W2",
    phase: "土台・床組み",
    icon: "🪵",
    color: "#a0785a",
    difficulty: "★★☆☆☆",
    people: "2人",
    cost: 165000,
    desc: "プレカット済みの土台・大引・根太を基礎の上に組む。番号が振ってあるので図面通りに並べるだけ。最後に28mm構造用合板を剛床として張る。",
    tools: ["インパクトドライバー", "丸ノコ", "水平器", "墨出し器"],
    tips: "土台は防腐処理済み材を使うこと。レベル出しをしっかりやれば後が楽。",
    svg: (
      <svg viewBox="0 0 200 120" style={{ width: "100%" }}>
        <rect x="15" y="75" width="170" height="10" fill="#a0785a" stroke="#c9a962" strokeWidth="1.5" rx="2"/>
        {[30,65,100,135,165].map(x => (
          <rect key={x} x={x-8} y="55" width="16" height="22" fill="#8a6448" stroke="#888" strokeWidth="1" rx="1"/>
        ))}
        <rect x="15" y="45" width="170" height="12" fill="#606060" opacity="0.5" stroke="#888" strokeWidth="1" rx="2"/>
        <text x="100" y="40" fill="#888" fontSize="7" textAnchor="middle">構造用合板 28mm（剛床）</text>
        <text x="100" y="105" fill="#c9a962" fontSize="7" textAnchor="middle">土台 + 大引 + 床合板</text>
        {[30,65,100,135,165].map((x,i) => (
          <rect key={i} x={x-3} y="85" width="6" height="12" fill="#c9a962" opacity="0.6"/>
        ))}
        <text x="100" y="114" fill="#555" fontSize="6" textAnchor="middle">アンカーボルトで基礎に固定</text>
      </svg>
    ),
  },
  {
    week: "W3",
    phase: "棟上げ",
    icon: "🏗️",
    color: "#c9a962",
    difficulty: "★★★★☆",
    people: "4人（1日）",
    cost: 0,
    desc: "プレカット材で柱・梁・母屋を一気に組み立てる。4人いれば8時間で棟上げ完了。クレーンは不要。仮筋交いで倒れないよう固定してから次工程へ。",
    tools: ["インパクトドライバー", "ハンマー", "仮筋交い材", "水準器"],
    tips: "当日は人手が一番大事。近隣に声がけを。プレカットなので「番号通りに組む」だけ。",
    svg: (
      <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
        <rect x="20" y="90" width="160" height="8" fill="#a0785a" rx="1"/>
        {[30,100,170].map(x => (
          <line key={x} x1={x} y1="90" x2={x} y2="30" stroke="#c9a962" strokeWidth="4"/>
        ))}
        <line x1="30" y1="50" x2="170" y2="50" stroke="#8a6448" strokeWidth="3"/>
        <line x1="30" y1="30" x2="100" y2="12" stroke="#c9a962" strokeWidth="3"/>
        <line x1="170" y1="30" x2="100" y2="12" stroke="#c9a962" strokeWidth="3"/>
        <line x1="30" y1="30" x2="170" y2="30" stroke="#8a6448" strokeWidth="3"/>
        <line x1="30" y1="90" x2="170" y2="30" stroke="#666" strokeWidth="1.5" strokeDasharray="3,2"/>
        <text x="100" y="8" fill="#c9a962" fontSize="8" textAnchor="middle">棟木</text>
        <text x="100" y="118" fill="#ddd" fontSize="7" textAnchor="middle">棟上げ完了（1日）</text>
        <text x="100" y="128" fill="#555" fontSize="6" textAnchor="middle">4人・レッカー不要</text>
      </svg>
    ),
  },
  {
    week: "W4",
    phase: "SIPsパネル取付",
    icon: "🏗️",
    color: "#7080e0",
    difficulty: "★★★☆☆",
    people: "4人",
    cost: 1480000,
    desc: "工場製作のSIPsパネルを壁・屋根に建て込む。スプラインで繋いでコーキングするだけ。断熱と構造を同時に完成させる最速の工法。1枚の重さは30〜50kg。",
    tools: ["インパクトドライバー", "コーキングガン", "スプライン材", "クランプ"],
    tips: "パネルの向きと番号を事前に確認。継ぎ目の気密処理が断熱性能を左右する。",
    svg: (
      <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
        <rect x="20" y="40" width="20" height="80" fill="#3a2a10" stroke="#888" strokeWidth="1"/>
        <rect x="40" y="40" width="60" height="80" fill="#1a3a4a" stroke="#7080e0" strokeWidth="2"/>
        <rect x="100" y="40" width="60" height="80" fill="#1a3a4a" stroke="#7080e0" strokeWidth="2"/>
        <rect x="160" y="40" width="20" height="80" fill="#3a2a10" stroke="#888" strokeWidth="1"/>
        <text x="70" y="82" fill="#7080e0" fontSize="7" textAnchor="middle">SIPsパネル</text>
        <text x="70" y="92" fill="rgba(255,255,255,0.4)" fontSize="6" textAnchor="middle">OSB+160mm+OSB</text>
        <text x="130" y="82" fill="#7080e0" fontSize="7" textAnchor="middle">SIPsパネル</text>
        <text x="100" y="16" fill="#ddd" fontSize="8" textAnchor="middle">断熱 + 構造が同時完成</text>
        <line x1="100" y1="40" x2="100" y2="120" stroke="#c9a962" strokeWidth="1.5" strokeDasharray="2,2"/>
        <text x="100" y="128" fill="#555" fontSize="6" textAnchor="middle">スプライン接合 → コーキングで気密</text>
      </svg>
    ),
  },
  {
    week: "W5",
    phase: "外装仕上げ",
    icon: "🖤",
    color: "#888",
    difficulty: "★★★☆☆",
    people: "2人",
    cost: 156778 + 115600,
    desc: "タイベック→縦胴縁（通気層）→黒ガルバリウム波板の順に外壁を張る。屋根は立平葺き。外から見た姿がほぼ完成する週。",
    tools: ["電動丸ノコ", "タッカー", "コーキングガン", "脚立・安全帯"],
    tips: "通気層（21mm）は必ず確保。省くと冬に結露で木材が腐る。",
    svg: (
      <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
        <polygon points="20,55 100,15 180,55" fill="#333" stroke="#888" strokeWidth="2"/>
        <rect x="20" y="55" width="160" height="70" fill="#222" stroke="#888" strokeWidth="2"/>
        {[55,70,85,100,115,130,145,160,175].map(x => (
          <line key={x} x1={x} y1="55" x2={x-10} y2="125" stroke="#555" strokeWidth="1"/>
        ))}
        <rect x="70" y="80" width="40" height="45" fill="rgba(70,170,200,0.2)" stroke="#4aa" strokeWidth="1.5"/>
        <rect x="145" y="90" width="25" height="35" fill="rgba(100,60,20,0.3)" stroke="#888" strokeWidth="1.5"/>
        <text x="100" y="10" fill="#888" fontSize="8" textAnchor="middle">黒ガルバリウム 外装完成</text>
        <text x="100" y="128" fill="#555" fontSize="6" textAnchor="middle">屋根：立平葺き / 壁：縦ハゼ</text>
      </svg>
    ),
  },
  {
    week: "W6",
    phase: "窓・気密処理",
    icon: "🪟",
    color: "#4ab8d0",
    difficulty: "★★☆☆☆",
    people: "2人",
    cost: 333000 + 123150,
    desc: "樹脂トリプルガラス窓と断熱玄関ドアを取り付け、全ての開口部・接合部に気密テープを施工。この週の終わりに気密測定（C値）を行いC値0.2以下を確認する。",
    tools: ["気密テープ", "コーキングガン", "気密測定機（レンタル¥30,000）"],
    tips: "気密測定は後戻りができないタイミング。測定でC値0.5以上なら漏れ箇所を探して修正。",
    svg: (
      <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
        <rect x="30" y="20" width="140" height="95" fill="#222" stroke="#555" strokeWidth="2"/>
        <rect x="55" y="35" width="80" height="60" fill="rgba(70,170,200,0.15)" stroke="#4ab8d0" strokeWidth="2.5"/>
        <line x1="95" y1="35" x2="95" y2="95" stroke="#4ab8d0" strokeWidth="1.5"/>
        <line x1="55" y1="65" x2="135" y2="65" stroke="#4ab8d0" strokeWidth="1.5"/>
        <rect x="32" y="22" width="136" height="3" fill="#c9a962" opacity="0.6"/>
        <rect x="32" y="112" width="136" height="3" fill="#c9a962" opacity="0.6"/>
        <rect x="30" y="22" width="3" height="90" fill="#c9a962" opacity="0.6"/>
        <rect x="167" y="22" width="3" height="90" fill="#c9a962" opacity="0.6"/>
        <text x="95" y="108" fill="rgba(255,255,255,0.6)" fontSize="7" textAnchor="middle">樹脂トリプルガラス</text>
        <text x="100" y="125" fill="#c9a962" fontSize="7" textAnchor="middle">気密テープで全周処理 → C値測定</text>
      </svg>
    ),
  },
  {
    week: "W7",
    phase: "設備工事",
    icon: "🔥",
    color: "#e06030",
    difficulty: "★★★★☆",
    people: "2〜3人",
    cost: 435884 + 280000 + 118140,
    desc: "ロケットマスヒーター築炉（2日）、オフグリッド太陽光の配線、雨水タンクとコンポストトイレ設置。設備が揃う週。工務店の電気工事士資格が必要な部分は委託（約¥5万）。",
    tools: ["耐火レンガ・モルタル", "ソーラー配線工具", "配管工具"],
    tips: "ロケットマスヒーターは耐火レンガ200個を積む本格工事。YouTubeで施工動画を必ず予習。",
    svg: (
      <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
        <rect x="20" y="60" width="40" height="50" fill="#3a1a10" stroke="#e06030" strokeWidth="2" rx="3"/>
        <rect x="28" y="68" width="24" height="20" fill="#e06030" opacity="0.3" rx="2"/>
        <line x1="40" y1="60" x2="40" y2="15" stroke="#888" strokeWidth="5"/>
        <circle cx="40" cy="14" r="4" fill="#e06030" opacity="0.8"/>
        <text x="40" y="122" fill="#e06030" fontSize="6.5" textAnchor="middle">薪ストーブ</text>
        <rect x="110" y="20" width="35" height="22" fill="#1a3a4a" stroke="#f0c040" strokeWidth="1.5" rx="2"/>
        <line x1="115" y1="42" x2="115" y2="75" stroke="#f0c040" strokeWidth="1.5"/>
        <rect x="100" y="75" width="55" height="35" fill="#1a2a1a" stroke="#5ab8a0" strokeWidth="1.5" rx="3"/>
        <text x="127" y="16" fill="#f0c040" fontSize="6.5" textAnchor="middle">ソーラーパネル</text>
        <text x="127" y="100" fill="#5ab8a0" fontSize="6.5" textAnchor="middle">蓄電池</text>
        <circle cx="80" cy="80" r="18" fill="none" stroke="#5ab8a0" strokeWidth="1.5"/>
        <text x="80" y="83" fill="#5ab8a0" fontSize="6" textAnchor="middle">雨水タンク</text>
        <text x="100" y="128" fill="#555" fontSize="6" textAnchor="middle">薪炉 + オフグリッド電力 + 雨水</text>
      </svg>
    ),
  },
  {
    week: "W8",
    phase: "内装・竣工",
    icon: "✨",
    color: "#a0785a",
    difficulty: "★★☆☆☆",
    people: "2人",
    cost: 330500,
    desc: "杉の羽目板と無垢フローリングを張って、造作棚・キッチンを設置。最後に清掃・検査で完成。この週で初めて「家」になる実感が出る。",
    tools: ["フィニッシュネイラー", "丸ノコ", "カンナ", "ニス・塗料"],
    tips: "杉無垢は水に濡れるとシミになる。フローリング張り前に床暖房の要否を決めておくこと。",
    svg: (
      <svg viewBox="0 0 200 130" style={{ width: "100%" }}>
        <rect x="15" y="90" width="170" height="14" fill="#8a6448" rx="2"/>
        {[20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170].map(x => (
          <rect key={x} x={x} y="90" width="9" height="14" fill="#a0785a" stroke="#6a4428" strokeWidth="0.5" rx="1"/>
        ))}
        {[20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170].map(x => (
          <rect key={x} x={x} y="30" width="9" height="60" fill="#8a6448" stroke="#6a4428" strokeWidth="0.5" rx="1"/>
        ))}
        <rect x="15" y="30" width="170" height="3" fill="#a0785a" rx="1"/>
        <rect x="60" y="50" width="40" height="40" fill="rgba(70,170,200,0.2)" stroke="#4aa" strokeWidth="1.5"/>
        <text x="100" y="20" fill="#a0785a" fontSize="8" textAnchor="middle">杉無垢 + 羽目板</text>
        <text x="100" y="115" fill="#c9a962" fontSize="8" textAnchor="middle">✨ 完成 ✨</text>
        <text x="100" y="128" fill="#555" fontSize="6" textAnchor="middle">8週間でタイニーハウス完成</text>
      </svg>
    ),
  },
];

const COST_ROUTES = [
  { name: "セルフビルド\n（本ガイド）", cost: TOTAL, sub: "補助金前", highlight: true },
  { name: "セルフビルド\n補助金フル活用", cost: Math.max(0, TOTAL - 2350000), sub: "実質負担", highlight: false, gold: true },
  { name: "工務店に\nフル依頼", cost: 7500000, sub: "施工費込み", highlight: false },
  { name: "コンテナ\n改造", cost: 2800000, sub: "20ftコンテナ+改装", highlight: false },
];

const SUBSIDIES = [
  { name: "弟子屈町 移住支援", amount: 1000000, icon: "🏘️", cond: "U・Iターン 世帯主30-49歳" },
  { name: "子育て世帯加算", amount: 500000, icon: "👨‍👩‍👧", cond: "子育て世帯のみ" },
  { name: "こどもエコすまい", amount: 600000, icon: "♻️", cond: "ZEH・高断熱住宅" },
  { name: "北海道省エネ支援", amount: 250000, icon: "❄️", cond: "UA値0.2以下の新築" },
];

export default function BuildPage() {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);

  const maxCost = Math.max(...MATERIALS.map(m => m.total));

  return (
    <main style={{ background: "#080808", color: "#fff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <section style={{ padding: "80px 24px 48px", maxWidth: 960, margin: "0 auto" }}>
        <motion.div {...fade}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a962", marginBottom: 14, textTransform: "uppercase" }}>
            SOLUNA BUILD GUIDE — 弟子屈タイニーハウス
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(36px, 8vw, 68px)", letterSpacing: "0.03em", lineHeight: 1, margin: "0 0 20px" }}>
            北海道タイニーハウス<br />
            <span style={{ color: "#c9a962" }}>完全建設ガイド</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 600 }}>
            弟子屈（摩周湖エリア）に24m²・超断熱オフグリッドの小屋を建てる全工程。
            材料費 <strong style={{ color: "#fff" }}>約¥{(TOTAL/10000).toFixed(0)}万円</strong> →
            補助金最大 <strong style={{ color: "#c9a962" }}>¥235万円</strong> で実質 <strong style={{ color: "#c9a962" }}>ほぼ¥0</strong>。
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
            {[
              { label: "コスト内訳", href: "#cost" },
              { label: "どう作るか", href: "#how" },
              { label: "設計図", href: "#drawings" },
              { label: "材料一覧", href: "#materials" },
              { label: "プレカット発注", href: "#precut" },
              { label: "補助金", href: "#subsidy" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.25)", color: "#c9a962", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ======= コスト内訳 ======= */}
      <section id="cost" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>
          <motion.div {...fade}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 4, color: "#c9a962" }}>コスト内訳</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>カテゴリ別の材料費。クリックで明細を開く。</p>

            {/* Bar chart */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
              {MATERIALS.slice().sort((a,b) => b.total - a.total).map(m => (
                <div key={m.cat}
                  onClick={() => { setOpenCat(openCat === m.cat ? null : m.cat); document.getElementById("materials")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{m.emoji}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", width: 190, flexShrink: 0 }}>{m.cat}</span>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 18, position: "relative", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(m.total / maxCost) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        style={{ height: "100%", background: m.color, opacity: 0.7, borderRadius: 4 }}
                      />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: m.color, width: 90, textAlign: "right", flexShrink: 0 }}>
                      ¥{(m.total/10000).toFixed(1)}万
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total + routes comparison */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 12, padding: "24px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>材料費合計（プレカット・配送込み）</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#c9a962" }}>¥{TOTAL.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>工具・仮設レンタル ¥15万 別途</div>
              </div>
              <div style={{ background: "rgba(90,184,160,0.08)", border: "1px solid rgba(90,184,160,0.25)", borderRadius: 12, padding: "24px" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>補助金フル活用後（子育て世帯）</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#5ab8a0" }}>実質 ¥0〜</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>移住¥100万+こどもエコ¥60万+道¥25万+子育て¥50万</div>
              </div>
            </div>

            {/* Routes */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>他の建て方との比較</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {COST_ROUTES.map(r => (
                  <div key={r.name} style={{ background: r.gold ? "rgba(90,184,160,0.08)" : r.highlight ? "rgba(201,169,98,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${r.gold ? "rgba(90,184,160,0.3)" : r.highlight ? "rgba(201,169,98,0.25)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6, whiteSpace: "pre-line" }}>{r.name}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: r.gold ? "#5ab8a0" : r.highlight ? "#c9a962" : "rgba(255,255,255,0.7)" }}>
                      {r.cost === 0 ? "¥0〜" : `¥${(r.cost/10000).toFixed(0)}万`}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{r.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======= どう作るか（工程） ======= */}
      <section id="how" style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 4, color: "#c9a962" }}>どう作るか</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>8週間の工程。各ステップをクリックすると詳細・工具・コツが展開する。</p>

          {/* Week timeline bar */}
          <div style={{ display: "flex", gap: 2, marginBottom: 32, overflowX: "auto", paddingBottom: 8 }}>
            {BUILD_STEPS.map((step, i) => (
              <div key={i} onClick={() => setOpenStep(openStep === i ? null : i)}
                style={{ flex: 1, minWidth: 80, cursor: "pointer", background: openStep === i ? `${step.color}22` : "rgba(255,255,255,0.03)", border: `1px solid ${openStep === i ? step.color : "rgba(255,255,255,0.06)"}`, borderRadius: 8, padding: "10px 8px", textAlign: "center", transition: "all 0.2s" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{step.icon}</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, color: step.color }}>{step.week}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2, lineHeight: 1.3 }}>{step.phase}</div>
                {step.cost > 0 && (
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>¥{(step.cost/10000).toFixed(0)}万</div>
                )}
              </div>
            ))}
          </div>

          {/* Step detail cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {BUILD_STEPS.map((step, i) => (
              <motion.div key={i} {...fade}
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${openStep === i ? step.color : "rgba(255,255,255,0.06)"}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Header */}
                <div onClick={() => setOpenStep(openStep === i ? null : i)}
                  style={{ padding: "18px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, color: `${step.color}66`, lineHeight: 1, flexShrink: 0 }}>{step.week}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 18 }}>{step.icon}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{step.phase}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>難易度 {step.difficulty}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>👥 {step.people}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {step.cost > 0 && <div style={{ fontSize: 15, fontWeight: 700, color: step.color }}>¥{(step.cost/10000).toFixed(0)}万</div>}
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{openStep === i ? "▲" : "▼"} 詳細</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {openStep === i && (
                  <div style={{ borderTop: `1px solid ${step.color}33`, display: "grid", gridTemplateColumns: "1fr 180px", gap: 0 }}>
                    <div style={{ padding: "20px 24px" }}>
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: step.color, letterSpacing: "0.1em", marginBottom: 8 }}>必要な工具・材料</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {step.tools.map(t => (
                            <span key={t} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 20, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ background: `${step.color}11`, border: `1px solid ${step.color}33`, borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, color: step.color, marginBottom: 4 }}>💡 コツ</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{step.tips}</div>
                      </div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {step.svg}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ======= 設計図 ======= */}
      <section id="drawings" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>
          <motion.div {...fade}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 4, color: "#c9a962" }}>設計図</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>平面図・立面図・壁断面。DXF/JWW はメールで請求可（無料）。</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Floor Plan */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>FLOOR PLAN — 平面図 1:50</div>
                <svg viewBox="0 0 280 260" style={{ width: "100%", background: "#0a0a0a" }}>
                  <rect x="20" y="20" width="240" height="200" fill="none" stroke="#c9a962" strokeWidth="3.5"/>
                  <line x1="20" y1="130" x2="180" y2="130" stroke="#888" strokeWidth="2"/>
                  <line x1="180" y1="20" x2="180" y2="220" stroke="#888" strokeWidth="2"/>
                  <line x1="20" y1="170" x2="20" y2="200" stroke="#0a0a0a" strokeWidth="6"/>
                  <path d="M20 170 Q42 170 42 192" fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="3,2"/>
                  <rect x="55" y="216" width="120" height="7" fill="#4ab8d0" opacity="0.7"/>
                  <rect x="255" y="50" width="7" height="55" fill="#4ab8d0" opacity="0.7"/>
                  <rect x="255" y="145" width="7" height="45" fill="#4ab8d0" opacity="0.7"/>
                  <text x="95" y="76" fill="#fff" fontSize="10" textAnchor="middle">居間・ダイニング</text>
                  <text x="95" y="90" fill="rgba(255,255,255,0.35)" fontSize="8" textAnchor="middle">14.8 m²</text>
                  <text x="215" y="75" fill="#fff" fontSize="9" textAnchor="middle">寝室</text>
                  <text x="215" y="88" fill="rgba(255,255,255,0.35)" fontSize="8" textAnchor="middle">5.2 m²</text>
                  <text x="215" y="168" fill="#fff" fontSize="9" textAnchor="middle">水回り</text>
                  <text x="215" y="181" fill="rgba(255,255,255,0.35)" fontSize="8" textAnchor="middle">4.8 m²</text>
                  <text x="115" y="245" fill="rgba(255,255,255,0.45)" fontSize="8" textAnchor="middle">南面大窓 W1,690</text>
                  <text x="115" y="255" fill="rgba(255,255,255,0.25)" fontSize="7" textAnchor="middle">↑ 南 / SOUTH</text>
                  <line x1="20" y1="243" x2="70" y2="243" stroke="#444" strokeWidth="1"/>
                  <text x="45" y="252" fill="#555" fontSize="7" textAnchor="middle">1m</text>
                  <circle cx="58" cy="115" r="8" fill="rgba(224,96,48,0.2)" stroke="rgba(224,96,48,0.6)" strokeWidth="1.5"/>
                  <text x="58" y="119" fill="rgba(224,96,48,0.9)" fontSize="7" textAnchor="middle">炉</text>
                </svg>
              </div>

              {/* Elevation */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>SOUTH ELEVATION — 南立面図</div>
                <svg viewBox="0 0 280 230" style={{ width: "100%", background: "#0a0a0a" }}>
                  <line x1="10" y1="200" x2="270" y2="200" stroke="#444" strokeWidth="1.5" strokeDasharray="4,3"/>
                  <rect x="30" y="70" width="220" height="130" fill="rgba(35,35,35,0.9)" stroke="#888" strokeWidth="2"/>
                  <polygon points="20,70 140,18 260,70" fill="rgba(28,28,28,0.95)" stroke="#c9a962" strokeWidth="2"/>
                  <rect x="68" y="8" width="14" height="62" fill="rgba(55,55,55,0.9)" stroke="#888" strokeWidth="1.5"/>
                  <rect x="52" y="108" width="134" height="82" fill="rgba(70,184,208,0.12)" stroke="#4ab8d0" strokeWidth="2"/>
                  <line x1="119" y1="108" x2="119" y2="190" stroke="#4ab8d0" strokeWidth="1" strokeDasharray="3,2"/>
                  <rect x="208" y="143" width="34" height="57" fill="rgba(60,40,20,0.4)" stroke="#888" strokeWidth="1.5"/>
                  <line x1="30" y1="208" x2="250" y2="208" stroke="#555" strokeWidth="1"/>
                  <text x="140" y="220" fill="#666" fontSize="9" textAnchor="middle">5,460 mm</text>
                  <text x="116" y="156" fill="rgba(255,255,255,0.55)" fontSize="9" textAnchor="middle">南面大窓</text>
                  <text x="75" y="6" fill="rgba(255,255,255,0.35)" fontSize="7" textAnchor="middle">煙突</text>
                </svg>
              </div>

              {/* Wall Section full width */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", gridColumn: "span 2" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>WALL SECTION — 壁断面詳細（SIPsパネル工法）</div>
                <svg viewBox="0 0 560 175" style={{ width: "100%", background: "#0a0a0a" }}>
                  {[
                    { x: 20, w: 18, label: "ガルバ波板", sub: "0.35mm", color: "#555" },
                    { x: 38, w: 14, label: "通気層", sub: "21mm", color: "#1a2a1a" },
                    { x: 52, w: 12, label: "タイベック", sub: "防水", color: "#2a3a2a" },
                    { x: 64, w: 20, label: "SIPsパネル", sub: "OSB12", color: "#3a2a10" },
                    { x: 84, w: 82, label: "硬質ウレタン断熱", sub: "160mm / U値0.14", color: "#1a3a4a" },
                    { x: 166, w: 20, label: "OSB12", sub: "内面", color: "#3a2a10" },
                    { x: 186, w: 18, label: "気密層", sub: "テープ", color: "#2a1a3a" },
                    { x: 204, w: 24, label: "杉羽目板", sub: "15mm", color: "#2a1a0a" },
                  ].map((layer, i) => (
                    <g key={i}>
                      <rect x={layer.x} y={28} width={layer.w} height={118} fill={layer.color} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
                      <text x={layer.x + layer.w / 2} y={11} fill="rgba(255,255,255,0.55)" fontSize="6" textAnchor="middle">{layer.label}</text>
                      <text x={layer.x + layer.w / 2} y={20} fill="rgba(255,255,255,0.3)" fontSize="5" textAnchor="middle">{layer.sub}</text>
                      <line x1={layer.x + layer.w/2} y1={22} x2={layer.x + layer.w/2} y2={28} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
                    </g>
                  ))}
                  <text x="285" y="55" fill="#c9a962" fontSize="14" fontWeight="bold">UA値 0.16 W/m²K</text>
                  <text x="285" y="74" fill="rgba(255,255,255,0.6)" fontSize="10">HEAT20 G3相当（ZEHの1.5倍断熱）</text>
                  <text x="285" y="93" fill="rgba(255,255,255,0.5)" fontSize="9">気密 C値 0.2 以下（気密測定確認）</text>
                  <text x="285" y="110" fill="rgba(255,255,255,0.5)" fontSize="9">壁厚 約234mm / 熱橋ゼロ構造</text>
                  <text x="285" y="130" fill="rgba(224,96,48,0.7)" fontSize="9">外気 -30℃ の弟子屈でも室温18℃維持</text>
                  <text x="285" y="147" fill="rgba(224,96,48,0.5)" fontSize="9">薪消費量：通常工法比 1/8</text>
                </svg>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: "12px 18px", background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>📐</span>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                プレカット業者・建築士への提出用 DXF / JWW データは
                <a href="mailto:info@solun.art?subject=弟子屈タイニーハウス図面請求" style={{ color: "#c9a962", marginLeft: 6, fontWeight: 600 }}>info@solun.art</a> へメールで無料請求できます。
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======= 材料一覧 ======= */}
      <section id="materials" style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 4, color: "#c9a962" }}>材料一覧・購入先</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>MonotaRO・Amazon の実価格を反映。行をクリックで明細展開。</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MATERIALS.map(m => (
              <div key={m.cat} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${openCat === m.cat ? m.color : "rgba(255,255,255,0.06)"}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
                <div onClick={() => setOpenCat(openCat === m.cat ? null : m.cat)}
                  style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <span style={{ fontSize: 20 }}>{m.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.cat}</div>
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                        style={{ fontSize: 10, color: "#c9a962", textDecoration: "none" }}>MonotaRO / Amazon で購入 →</a>
                    )}
                  </div>
                  {/* mini bar */}
                  <div style={{ width: 80, background: "rgba(255,255,255,0.06)", borderRadius: 3, height: 6 }}>
                    <div style={{ width: `${(m.total/maxCost)*100}%`, height: "100%", background: m.color, borderRadius: 3 }}/>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: m.color, width: 80, textAlign: "right" }}>¥{m.total.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", width: 40, textAlign: "right" }}>{openCat === m.cat ? "▲" : "▼"}</div>
                </div>
                {openCat === m.cat && (
                  <div style={{ borderTop: `1px solid ${m.color}22` }}>
                    {m.items.map(item => (
                      <div key={item.name} style={{ padding: "9px 20px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#ccc" }}>{item.name}</div>
                          {item.note && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{item.note}</div>}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{item.qty} × {item.unit}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>¥{item.total.toLocaleString()}</div>
                      </div>
                    ))}
                    {m.alt && (
                      <div style={{ padding: "8px 20px", fontSize: 11, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.02)" }}>💡 {m.alt}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "18px 24px", background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>材料費合計（プレカット・配送込み）</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>工具・仮設費（レンタル約¥15万）・外構費 別途</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#c9a962" }}>¥{TOTAL.toLocaleString()}</div>
          </div>
        </motion.div>
      </section>

      {/* ======= プレカット ======= */}
      <section id="precut" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>
          <motion.div {...fade}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 4, color: "#c9a962" }}>プレカット発注</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 36 }}>構造材を工場で全カット済みで届けてもらう。現場加工ゼロ・番号通りに組むだけ。</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
              {[
                { step: "01", title: "図面を準備", body: "平面図・軸組図・梁伏せ図をCAD（DXF/JWW）または手書きA3スキャンで用意。SOLUNA標準図面はメールで無料請求可。" },
                { step: "02", title: "業者に見積依頼", body: "下記業者に図面を送付。3〜5日で見積が届く。納期は発注から10〜14日。北海道送料は別途¥3〜5万。" },
                { step: "03", title: "金物も同時発注", body: "柱・梁・土台・間柱・垂木すべてがカット済み+番号付き。ホールダウン・羽子板ボルトも同時発注が便利。" },
                { step: "04", title: "棟上げ（1日）", body: "4人で8時間で棟上げ完了。レッカー不要。番号通りに組むだけなので特別なスキル不要。" },
              ].map(s => (
                <div key={s.step} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, color: "rgba(201,169,98,0.3)", marginBottom: 10, lineHeight: 1 }}>{s.step}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "ヤマサン木材（北海道対応）", url: "https://yamasanmokuzai.co.jp", note: "CAD入力〜加工〜配送まで一括。弟子屈エリア実績あり", price: "加工費 材積×¥15,000〜" },
                { name: "カネシン プレカット", url: "https://www.kanesin.co.jp", note: "金物工法対応。SE構法・KES構法向けプレカット", price: "見積無料・納期10〜14日" },
                { name: "モノタロウ 木材カット", url: "https://www.monotaro.com/g/01291754/", note: "小物・羽柄材の追加カット注文に最適", price: "1カット¥55〜" },
              ].map(v => (
                <div key={v.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{v.note}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{v.price}</div>
                  </div>
                  <a href={v.url} target="_blank" rel="noopener"
                    style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.3)", color: "#c9a962", padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    見積依頼 →
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======= 補助金 ======= */}
      <section id="subsidy" style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 4, color: "#c9a962" }}>補助金・支援制度</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>重複申請OK。最大 <strong style={{ color: "#c9a962" }}>¥235万円</strong>。材料費を超える可能性あり。</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
            {SUBSIDIES.map(s => (
              <div key={s.name} style={{ background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 12, padding: "18px" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#c9a962", marginBottom: 6 }}>¥{(s.amount/10000).toFixed(0)}万</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{s.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{s.cond}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 20px", background: "rgba(90,184,160,0.06)", border: "1px solid rgba(90,184,160,0.2)", borderRadius: 10, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#5ab8a0", marginBottom: 4 }}>子育て世帯がフル申請すると…</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>弟子屈移住¥100万 + こどもエコすまい¥60万 + 北海道省エネ¥25万 + 子育て加算¥50万 = <strong style={{ color: "#5ab8a0" }}>合計¥235万</strong></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>材料費¥{(TOTAL/10000).toFixed(0)}万 − 補助¥235万 = 実質 <strong style={{ color: "#5ab8a0" }}>¥{Math.max(0, Math.round((TOTAL - 2350000)/10000))}万</strong></div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#5ab8a0", textAlign: "center" }}>
              {TOTAL <= 2350000 ? "¥0" : `¥${Math.round((TOTAL - 2350000)/10000)}万`}
            </div>
          </div>

          <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
            申請先：弟子屈町役場 建設課（0154-82-2111）／北海道庁 住宅局／国交省 住宅省エネポータル。
            条件・申請タイミングは変更の場合あり。事前確認のうえ着工すること。
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "56px 24px 80px" }}>
          <motion.div {...fade}>
            <div style={{ background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 16, padding: "44px 36px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, letterSpacing: "0.05em", marginBottom: 14 }}>一緒に建てませんか？</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 28px" }}>
                図面 DXF・プレカット発注サポート・補助金申請同行を提供します。
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="mailto:info@solun.art?subject=弟子屈タイニーハウス建設の相談"
                  style={{ background: "#c9a962", color: "#080808", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  メールで相談する
                </a>
                <a href="https://line.me/ti/p/~@soluna" target="_blank" rel="noopener"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                  LINE で質問
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px", display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ホーム</Link>
        <Link href="/lab" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>建材 LAB</Link>
        <Link href="/village" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>美留和ビレッジ</Link>
        <Link href="/kumaushi" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>KUMAUSHI BASE</Link>
      </div>

    </main>
  );
}
