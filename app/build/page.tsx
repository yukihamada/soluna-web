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

const SPECS = [
  { k: "延床面積", v: "24.8 m²（7.5坪）" },
  { k: "外形寸法", v: "W 5,460 × D 4,550 × H 4,200 mm" },
  { k: "構造", v: "木造軸組 + SIPsパネル工法" },
  { k: "断熱性能", v: "UA値 0.16 W/m²K（HEAT20 G3相当）" },
  { k: "気密性能", v: "C値 0.2 cm²/m² 以下" },
  { k: "暖房方式", v: "ロケットマスヒーター（薪）" },
  { k: "電力", v: "オフグリッド太陽光 800W + 蓄電 5kWh" },
  { k: "給水", v: "雨水利用 1,000L タンク + 井戸" },
  { k: "排水", v: "コンポストトイレ（浄化槽不要）" },
  { k: "建築確認", v: "10m²以下は不要（増築規定）" },
];

const MATERIALS = [
  {
    cat: "構造材（プレカット）",
    emoji: "🪵",
    items: [
      { name: "KD杉 105×105 柱材", qty: "12本", unit: "¥1,200/本", total: 14400, note: "プレカット込み" },
      { name: "KD杉 105×210 梁材", qty: "8本", unit: "¥2,800/本", total: 22400, note: "プレカット込み" },
      { name: "KD杉 45×105 間柱", qty: "40本", unit: "¥480/本", total: 19200, note: "" },
      { name: "構造用合板 28mm 床", qty: "20枚", unit: "¥4,200/枚", total: 84000, note: "剛床" },
      { name: "野縁・垂木セット", qty: "一式", unit: "¥25,000", total: 25000, note: "" },
    ],
    total: 165000,
  },
  {
    cat: "SIPsパネル（壁・屋根）",
    emoji: "🏗️",
    items: [
      { name: "SIPsパネル 壁用 OSB+160mm+OSB", qty: "80m²", unit: "¥12,000/m²", total: 960000, note: "工場製作・配送込み" },
      { name: "SIPsパネル 屋根用 200mm", qty: "35m²", unit: "¥14,000/m²", total: 490000, note: "勾配対応" },
      { name: "スプラインジョイント材", qty: "一式", unit: "¥30,000", total: 30000, note: "" },
    ],
    total: 1480000,
    alt: "※在来工法に変更する場合：スタイロ50mm+グラスウール155mm+外張り30mm に置換可。コスト▲¥80万、工期+2週",
  },
  {
    cat: "外装",
    emoji: "🖤",
    items: [
      { name: "ガルバリウム波板 横葺き 黒", qty: "85m²", unit: "¥1,200/m²", total: 102000, note: "0.35mm" },
      { name: "タイベック シルバー 透湿防水シート", qty: "1巻 50m×1.5m", unit: "¥19,778", total: 19778, note: "" },
      { name: "縦胴縁 21×45 通気層", qty: "50本", unit: "¥380/本", total: 19000, note: "" },
      { name: "外壁コーキング", qty: "20本", unit: "¥800/本", total: 16000, note: "" },
    ],
    total: 156778,
    url: "https://www.monotaro.com/p/1339/5302/",
  },
  {
    cat: "断熱・気密",
    emoji: "🌡️",
    items: [
      { name: "スタイロフォーム 50mm（床下）", qty: "20枚", unit: "¥3,956/枚", total: 79120, note: "" },
      { name: "気密テープ 75mm×20m", qty: "10巻", unit: "¥1,403/巻", total: 14030, note: "" },
      { name: "先張り気密シート", qty: "50m²", unit: "¥600/m²", total: 30000, note: "" },
    ],
    total: 123150,
    url: "https://www.monotaro.com/p/2139/1148/",
  },
  {
    cat: "屋根",
    emoji: "🏠",
    items: [
      { name: "ガルバリウム屋根材 立平葺き", qty: "35m²", unit: "¥2,200/m²", total: 77000, note: "" },
      { name: "ルーフィング 22kg ゴムアス", qty: "2本", unit: "¥6,800/本", total: 13600, note: "" },
      { name: "棟包み・破風板", qty: "一式", unit: "¥25,000", total: 25000, note: "" },
    ],
    total: 115600,
  },
  {
    cat: "窓・開口部",
    emoji: "🪟",
    items: [
      { name: "樹脂窓 トリプルガラス 南面大窓 W1690×H1830", qty: "1枚", unit: "¥95,000", total: 95000, note: "Low-E" },
      { name: "樹脂窓 W780×H1170", qty: "4枚", unit: "¥38,000/枚", total: 152000, note: "" },
      { name: "玄関ドア 断熱型", qty: "1枚", unit: "¥68,000", total: 68000, note: "" },
      { name: "窓台・額縁材", qty: "一式", unit: "¥18,000", total: 18000, note: "" },
    ],
    total: 333000,
  },
  {
    cat: "オフグリッド電力",
    emoji: "☀️",
    items: [
      { name: "Renogy 200W 単結晶パネル × 4枚", qty: "4枚", unit: "¥25,771/枚", total: 103084, note: "" },
      { name: "EcoFlow DELTA Pro3 5kWh 蓄電", qty: "1台", unit: "¥279,800", total: 279800, note: "" },
      { name: "MPPT 充電コントローラー 60A", qty: "1台", unit: "¥18,000", total: 18000, note: "" },
      { name: "配線・ブレーカー・コンセント一式", qty: "一式", unit: "¥35,000", total: 35000, note: "" },
    ],
    total: 435884,
    url: "https://www.amazon.co.jp/Renogy-ソーラーパネル/dp/B08F3G6YML",
  },
  {
    cat: "給排水・衛生",
    emoji: "💧",
    items: [
      { name: "Nature's Head コンポストトイレ", qty: "1台", unit: "¥200,000", total: 200000, note: "浄化槽不要" },
      { name: "雨水タンク 1,000L", qty: "1基", unit: "¥35,000", total: 35000, note: "" },
      { name: "活性炭フィルター 3段", qty: "1式", unit: "¥12,000", total: 12000, note: "" },
      { name: "UV殺菌灯", qty: "1台", unit: "¥8,000", total: 8000, note: "" },
      { name: "給水ポンプ・配管一式", qty: "一式", unit: "¥25,000", total: 25000, note: "" },
    ],
    total: 280000,
  },
  {
    cat: "暖房（ロケットマスヒーター）",
    emoji: "🔥",
    items: [
      { name: "耐火レンガ SK-32（200×100×60）", qty: "200個", unit: "¥228/個", total: 45600, note: "" },
      { name: "耐火モルタル 20kg", qty: "5袋", unit: "¥748/袋", total: 3740, note: "" },
      { name: "ステンレス煙突 Φ150 直管 900mm", qty: "6本", unit: "¥6,800/本", total: 40800, note: "" },
      { name: "煙突T管・エルボ・雨押さえ", qty: "一式", unit: "¥28,000", total: 28000, note: "" },
    ],
    total: 118140,
    url: "https://www.monotaro.com/p/4085/3580/",
  },
  {
    cat: "基礎（独立コンクリート基礎）",
    emoji: "⚓",
    items: [
      { name: "生コン 0.25m³ × 6点", qty: "1.5m³", unit: "¥16,000/m³", total: 24000, note: "凍結深度1000mm" },
      { name: "型枠・鉄筋・アンカー一式", qty: "一式", unit: "¥35,000", total: 35000, note: "" },
      { name: "砕石・砂", qty: "一式", unit: "¥12,000", total: 12000, note: "" },
    ],
    total: 71000,
  },
  {
    cat: "内装・仕上げ",
    emoji: "🪵",
    items: [
      { name: "国産杉 羽目板 15mm（壁・天井）", qty: "60m²", unit: "¥2,800/m²", total: 168000, note: "" },
      { name: "フローリング 杉無垢 15mm", qty: "25m²", unit: "¥3,500/m²", total: 87500, note: "" },
      { name: "キッチン（シンプルIH）", qty: "1式", unit: "¥45,000", total: 45000, note: "" },
      { name: "造作棚・収納一式", qty: "一式", unit: "¥30,000", total: 30000, note: "" },
    ],
    total: 330500,
  },
];

const TOTAL_MATERIAL = MATERIALS.reduce((sum, cat) => sum + cat.total, 0);

const SUBSIDIES = [
  { name: "弟子屈町 移住支援補助金", amount: 1000000, note: "U・Iターン、世帯主30-49歳対象" },
  { name: "子育て世帯加算", amount: 500000, note: "子育て世帯は+50万円", cond: "子育て世帯" },
  { name: "こどもエコすまい支援事業", amount: 600000, note: "ZEH・高断熱住宅 省エネ補助" },
  { name: "北海道省エネ住宅支援", amount: 250000, note: "UA値0.2以下の新築" },
];

const PRECUT_STEPS = [
  {
    step: "01",
    title: "設計図・伏せ図の準備",
    body: "平面図・軸組図・梁伏せ図・仕口リストを用意。CADデータ（DXF/JWW）か手書きA3スキャンでも可。このページ下部からSOLUNA標準図面（DXF）をダウンロード。",
  },
  {
    step: "02",
    title: "プレカット業者に見積依頼",
    body: "下記推奨業者に図面を送付するだけで、3〜5日で見積りが届く。在庫状況により納期は発注から10〜14日。送料は北海道向け別途見積（目安¥3〜5万）。",
  },
  {
    step: "03",
    title: "仕口・金物セットで確認",
    body: "柱・梁・土台・間柱・垂木・母屋がすべてカット済み+番号付きで届く。ボルト・羽子板ボルト・コーナー金物も同時注文がスムーズ。",
  },
  {
    step: "04",
    title: "建方（棟上げ）",
    body: "レッカー不要の小規模なら4人で1日（8時間）で棟上げ可能。部材はすべて現場合わせ不要で、番号通りに組むだけ。",
  },
];

const PRECUT_VENDORS = [
  {
    name: "ヤマサン木材（北海道対応）",
    url: "https://yamasanmokuzai.co.jp",
    note: "CAD入力〜加工〜配送まで一括。弟子屈エリア実績あり",
    price: "設計費¥0、加工費は材積×¥15,000〜",
  },
  {
    name: "カネシン プレカット",
    url: "https://www.kanesin.co.jp",
    note: "金物工法対応。SE構法・KES構法向けプレカット",
    price: "見積無料、納期10〜14日",
  },
  {
    name: "モノタロウ 木材カット",
    url: "https://www.monotaro.com/g/01291754/",
    note: "小物・羽柄材の追加カット注文に最適",
    price: "1カット¥55〜",
  },
];

const TIMELINE = [
  { week: "W1", title: "基礎工事", tasks: ["地縄張り・根切り（凍結深度1,000mm）", "型枠・鉄筋組み", "生コン打設・養生（最低7日）"] },
  { week: "W2", title: "土台・床組み", tasks: ["土台据え付け・アンカー固定", "大引・根太組み", "床合板（剛床）28mm張り"] },
  { week: "W3", title: "棟上げ", tasks: ["柱・梁・母屋の建方（プレカット使用）", "仮筋交い・垂木取付", "野地板・ルーフィング仮張り"] },
  { week: "W4", title: "SIPsパネル取付", tasks: ["壁パネル建込み（クレーン不要・4人作業）", "スプライン接合・コーキング", "屋根パネル設置"] },
  { week: "W5", title: "外装仕上げ", tasks: ["タイベック張り・縦胴縁", "ガルバリウム外壁施工", "屋根：立平葺き・棟板金"] },
  { week: "W6", title: "開口部・気密処理", tasks: ["窓・玄関ドア取付", "気密テープ全周施工", "C値測定（目標0.2以下）"] },
  { week: "W7", title: "設備工事", tasks: ["ロケットマスヒーター築炉", "オフグリッド電気配線", "雨水タンク・コンポストトイレ設置"] },
  { week: "W8", title: "内装・竣工", tasks: ["杉羽目板・フローリング張り", "造作棚・キッチン設置", "最終清掃・検査・完成"] },
];

export default function BuildPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const totalSubsidy = SUBSIDIES.filter(s => !s.cond).reduce((sum, s) => sum + s.amount, 0);

  return (
    <main style={{ background: "#080808", color: "#fff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <section style={{ padding: "80px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
        <motion.div {...fade}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#c9a962", marginBottom: 16, textTransform: "uppercase" }}>
            SOLUNA BUILD GUIDE — 弟子屈タイニーハウス
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(36px, 8vw, 72px)", letterSpacing: "0.03em", lineHeight: 1, margin: "0 0 24px" }}>
            北海道タイニーハウス<br />
            <span style={{ color: "#c9a962" }}>完全建設ガイド</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 640 }}>
            弟子屈（摩周湖エリア）に24m²・高断熱オフグリッドの小屋を建てる。
            設計図・材料・プレカット発注・補助金活用まで全工程をカバー。
            材料費 <strong style={{ color: "#fff" }}>約185万円</strong>、補助金最大 <strong style={{ color: "#c9a962" }}>235万円</strong>。
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            {["設計図を見る", "材料リスト", "プレカット発注", "補助金"].map((label) => (
              <a
                key={label}
                href={`#${label}`}
                style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.3)", color: "#c9a962", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Cost Summary Bar */}
      <motion.section {...fade} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24 }}>
          {[
            { label: "材料費合計", value: `¥${(TOTAL_MATERIAL / 10000).toFixed(0)}万円`, sub: "プレカット・配送込み" },
            { label: "補助金（最大）", value: "¥235万円", sub: "移住+省エネ+子育て", gold: true },
            { label: "実質負担", value: "¥0〜▲50万", sub: "補助金フル活用時", gold: true },
            { label: "建設期間", value: "8週間", sub: "セルフビルド" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.gold ? "#c9a962" : "#fff", marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Specs */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 32, color: "#c9a962" }}>
            基本スペック
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
            {SPECS.map((s) => (
              <div key={s.k} style={{ background: "#080808", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", textAlign: "right" }}>{s.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Design Drawings */}
      <section id="設計図を見る" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 32, color: "#c9a962" }}>
            設計図
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Floor Plan */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>FLOOR PLAN — 平面図 1:50</div>
              <svg viewBox="0 0 280 260" style={{ width: "100%", background: "#0a0a0a" }}>
                {/* outer wall */}
                <rect x="20" y="20" width="240" height="200" fill="none" stroke="#c9a962" strokeWidth="4"/>
                {/* inner walls */}
                <line x1="20" y1="130" x2="180" y2="130" stroke="#888" strokeWidth="2"/>
                <line x1="180" y1="20" x2="180" y2="220" stroke="#888" strokeWidth="2"/>
                {/* door opening */}
                <line x1="20" y1="170" x2="20" y2="200" stroke="#0a0a0a" strokeWidth="6"/>
                <path d="M20 170 Q40 170 40 190" fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="3,2"/>
                {/* window south */}
                <rect x="55" y="216" width="120" height="8" fill="#4aa" opacity="0.6"/>
                {/* window east */}
                <rect x="256" y="50" width="8" height="60" fill="#4aa" opacity="0.6"/>
                <rect x="256" y="140" width="8" height="50" fill="#4aa" opacity="0.6"/>
                {/* labels */}
                <text x="100" y="80" fill="#fff" fontSize="10" textAnchor="middle">居間・ダイニング</text>
                <text x="100" y="95" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">14.8 m²</text>
                <text x="218" y="80" fill="#fff" fontSize="9" textAnchor="middle">寝室</text>
                <text x="218" y="93" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">5.2m²</text>
                <text x="218" y="165" fill="#fff" fontSize="9" textAnchor="middle">水回り</text>
                <text x="218" y="178" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">4.8m²</text>
                <text x="140" y="244" fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle">南面大窓 W1,690</text>
                <text x="140" y="254" fill="rgba(255,255,255,0.3)" fontSize="7.5" textAnchor="middle">↑ 南 / SOUTH</text>
                {/* scale */}
                <line x1="20" y1="244" x2="70" y2="244" stroke="#444" strokeWidth="1"/>
                <text x="45" y="253" fill="#555" fontSize="7" textAnchor="middle">1m</text>
                {/* stove icon */}
                <circle cx="60" cy="115" r="8" fill="rgba(255,80,40,0.2)" stroke="rgba(255,80,40,0.6)" strokeWidth="1.5"/>
                <text x="60" y="119" fill="rgba(255,80,40,0.8)" fontSize="7" textAnchor="middle">炉</text>
              </svg>
            </div>

            {/* South Elevation */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>SOUTH ELEVATION — 南立面図</div>
              <svg viewBox="0 0 280 230" style={{ width: "100%", background: "#0a0a0a" }}>
                {/* ground */}
                <line x1="10" y1="200" x2="270" y2="200" stroke="#444" strokeWidth="1.5" strokeDasharray="4,3"/>
                {/* body */}
                <rect x="30" y="70" width="220" height="130" fill="rgba(40,40,40,0.8)" stroke="#888" strokeWidth="2"/>
                {/* roof */}
                <polygon points="20,70 140,20 260,70" fill="rgba(30,30,30,0.9)" stroke="#c9a962" strokeWidth="2"/>
                {/* chimney */}
                <rect x="70" y="10" width="14" height="60" fill="rgba(60,60,60,0.9)" stroke="#888" strokeWidth="1.5"/>
                {/* south window large */}
                <rect x="55" y="110" width="130" height="80" fill="rgba(70,170,200,0.15)" stroke="#4aa" strokeWidth="2"/>
                <line x1="120" y1="110" x2="120" y2="190" stroke="#4aa" strokeWidth="1" strokeDasharray="3,2"/>
                {/* door */}
                <rect x="210" y="145" width="32" height="55" fill="rgba(60,40,20,0.4)" stroke="#888" strokeWidth="1.5"/>
                {/* dimension arrows */}
                <line x1="30" y1="208" x2="250" y2="208" stroke="#555" strokeWidth="1"/>
                <text x="140" y="220" fill="#666" fontSize="9" textAnchor="middle">5,460 mm</text>
                <line x1="260" y1="70" x2="260" y2="200" stroke="#555" strokeWidth="1"/>
                <text x="272" y="140" fill="#666" fontSize="8" textAnchor="middle" transform="rotate(90,272,140)">4,200</text>
                {/* labels */}
                <text x="120" y="156" fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="middle">南面大窓</text>
                <text x="120" y="168" fill="rgba(255,255,255,0.3)" fontSize="7.5" textAnchor="middle">W1,690×H830</text>
                <text x="77" y="7" fill="rgba(255,255,255,0.4)" fontSize="7.5" textAnchor="middle">煙突</text>
              </svg>
            </div>

            {/* Wall Section */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", gridColumn: "span 2" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>WALL SECTION — 壁断面詳細（SIPsパネル工法）</div>
              <svg viewBox="0 0 560 180" style={{ width: "100%", background: "#0a0a0a" }}>
                {/* layers from outside to inside */}
                {[
                  { x: 20, w: 18, label: "ガルバ波板", sub: "0.35mm", color: "#555" },
                  { x: 38, w: 15, label: "通気層", sub: "21mm", color: "#1a2a1a" },
                  { x: 53, w: 12, label: "タイベック", sub: "防水", color: "#2a3a2a" },
                  { x: 65, w: 22, label: "SIPsパネル", sub: "OSB12", color: "#3a2a10" },
                  { x: 87, w: 80, label: "硬質ウレタン", sub: "160mm U=0.14", color: "#1a3a4a" },
                  { x: 167, w: 22, label: "OSB12", sub: "内面", color: "#3a2a10" },
                  { x: 189, w: 20, label: "気密層", sub: "テープ", color: "#2a1a3a" },
                  { x: 209, w: 25, label: "杉羽目板", sub: "15mm", color: "#2a1a0a" },
                ].map((layer, i) => (
                  <g key={i}>
                    <rect x={layer.x} y={30} width={layer.w} height={120} fill={layer.color} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                    <text x={layer.x + layer.w / 2} y={12} fill="rgba(255,255,255,0.6)" fontSize="6.5" textAnchor="middle">{layer.label}</text>
                    <text x={layer.x + layer.w / 2} y={21} fill="rgba(255,255,255,0.35)" fontSize="5.5" textAnchor="middle">{layer.sub}</text>
                    <line x1={layer.x + layer.w / 2} y1={23} x2={layer.x + layer.w / 2} y2={30} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                  </g>
                ))}
                {/* Performance labels */}
                <text x="280" y="60" fill="#c9a962" fontSize="13" fontWeight="bold">UA値 0.16 W/m²K</text>
                <text x="280" y="78" fill="rgba(255,255,255,0.6)" fontSize="10">HEAT20 G3相当（ZEHの1.5倍断熱）</text>
                <text x="280" y="100" fill="rgba(255,255,255,0.5)" fontSize="9">C値 0.2 以下（気密測定で確認）</text>
                <text x="280" y="116" fill="rgba(255,255,255,0.5)" fontSize="9">壁厚合計: 約234mm</text>
                <text x="280" y="132" fill="rgba(255,255,255,0.5)" fontSize="9">熱橋なし（構造材が外に露出しない）</text>
                <text x="280" y="155" fill="rgba(255,80,40,0.6)" fontSize="8">外気温 -30℃ の弟子屈でも室温 18℃ 維持</text>
                <text x="280" y="168" fill="rgba(255,80,40,0.4)" fontSize="8">薪消費量: 通常工法比 1/8</text>
              </svg>
            </div>
          </div>

          <div style={{ marginTop: 20, padding: "14px 20px", background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>📐</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>DXF・JWW 図面ファイル</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                プレカット業者・建築士への提出用 CAD データは
                <a href="mailto:info@solun.art?subject=弟子屈タイニーハウス図面請求" style={{ color: "#c9a962", marginLeft: 6 }}>info@solun.art</a> へメールでご請求ください（無料）。
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Materials */}
      <section id="材料リスト" style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 60px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 8, color: "#c9a962" }}>
            材料リスト・購入先
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.7 }}>
            実際の購入先・価格を調査した一覧。MonotaRO・Amazon での現在価格を反映。
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MATERIALS.map((cat) => (
              <motion.div key={cat.cat} {...fade}
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}
              >
                <div
                  onClick={() => setActiveSection(activeSection === cat.cat ? null : cat.cat)}
                  style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{cat.cat}</div>
                      {cat.url && (
                        <a href={cat.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                          style={{ fontSize: 11, color: "#c9a962", textDecoration: "none" }}>MonotaRO / Amazon →</a>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#c9a962" }}>¥{cat.total.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{activeSection === cat.cat ? "▲ 閉じる" : "▼ 明細"}</div>
                  </div>
                </div>
                {activeSection === cat.cat && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {cat.items.map((item) => (
                      <div key={item.name} style={{ padding: "10px 20px", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#ddd" }}>{item.name}</div>
                          {item.note && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{item.note}</div>}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{item.qty} × {item.unit}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>¥{item.total.toLocaleString()}</div>
                      </div>
                    ))}
                    {cat.alt && (
                      <div style={{ padding: "10px 20px", fontSize: 11, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.02)" }}>{cat.alt}</div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div style={{ marginTop: 24, padding: "20px 24px", background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>材料費合計（プレカット・配送込み）</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>工具・仮設費（レンタル約¥15万）・外構費別途</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#c9a962" }}>¥{TOTAL_MATERIAL.toLocaleString()}</div>
          </div>
        </motion.div>
      </section>

      {/* Precut Section */}
      <section id="プレカット発注" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
          <motion.div {...fade}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 8, color: "#c9a962" }}>
              プレカット発注の流れ
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 40, lineHeight: 1.7 }}>
              構造材をすべて工場でカット済みにして届けてもらう「プレカット」を使えば、
              現場での加工作業がゼロになり、セルフビルドでも精度の高い骨組みが完成する。
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 48 }}>
              {PRECUT_STEPS.map((s) => (
                <div key={s.step} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "24px 20px" }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 36, color: "rgba(201,169,98,0.3)", marginBottom: 12, lineHeight: 1 }}>{s.step}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{s.title}</div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>推奨プレカット業者</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRECUT_VENDORS.map((v) => (
                <div key={v.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{v.note}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{v.price}</div>
                  </div>
                  <a href={v.url} target="_blank" rel="noopener"
                    style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.3)", color: "#c9a962", padding: "8px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    見積を依頼 →
                  </a>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📋 プレカット発注チェックリスト</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                {[
                  "平面図・軸組図（CADまたはA3スキャン）",
                  "梁伏せ図（スパンと荷重明記）",
                  "仕口・接合部リスト",
                  "使用樹種・乾燥区分（KD/AD）",
                  "納品先住所と搬入路の確認",
                  "金物（ホールダウン・羽子板）同時発注",
                ].map((item) => (
                  <div key={item} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#c9a962", flexShrink: 0 }}>□</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subsidies */}
      <section id="補助金" style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
        <motion.div {...fade}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 8, color: "#c9a962" }}>
            補助金・支援制度
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32, lineHeight: 1.7 }}>
            弟子屈に移住して建設する場合、複数の補助金を重複申請できる。最大 <strong style={{ color: "#c9a962" }}>235万円</strong>。
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            {SUBSIDIES.map((s) => (
              <div key={s.name} style={{ background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 12, padding: "20px" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#c9a962", marginBottom: 8 }}>¥{(s.amount / 10000).toFixed(0)}万</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{s.note}</div>
                {s.cond && <div style={{ marginTop: 8, display: "inline-block", background: "rgba(201,169,98,0.15)", padding: "2px 8px", borderRadius: 4, fontSize: 10, color: "#c9a962" }}>{s.cond}</div>}
              </div>
            ))}
          </div>
          <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.8 }}>
            <strong style={{ color: "#fff" }}>申請先：</strong>弟子屈町役場 建設課（0154-82-2111）／道庁 住宅局
            ／国交省 住宅省エネポータル。補助金の適用条件・申請タイミングは変更になる場合があります。
            事前に各窓口で確認のうえ着工してください。
          </div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
          <motion.div {...fade}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: "0.05em", marginBottom: 32, color: "#c9a962" }}>
              8週間工程表
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {TIMELINE.map((row, i) => (
                <div key={row.week} style={{ display: "grid", gridTemplateColumns: "60px 160px 1fr", gap: 16, alignItems: "start", padding: "12px 0", borderBottom: i < TIMELINE.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: "rgba(201,169,98,0.6)" }}>{row.week}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ddd", paddingTop: 2 }}>{row.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {row.tasks.map((t) => (
                      <div key={t} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", gap: 8 }}>
                        <span style={{ color: "#c9a962", flexShrink: 0 }}>·</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 100px" }}>
        <motion.div {...fade}>
          <div style={{ background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 16, padding: "48px 40px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, letterSpacing: "0.05em", marginBottom: 16 }}>
              一緒に建てませんか？
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 32, lineHeight: 1.8, maxWidth: 520, margin: "0 auto 32px" }}>
              SOLUNA の弟子屈プロジェクトに参加するメンバーには、
              図面 DXF・プレカット発注サポート・補助金申請同行を提供します。
              まずはメールで現況をお知らせください。
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="mailto:info@solun.art?subject=弟子屈タイニーハウス計画の相談"
                style={{ background: "#c9a962", color: "#080808", padding: "14px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                メールで相談する
              </a>
              <a href="https://line.me/ti/p/~@soluna" target="_blank" rel="noopener"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "14px 32px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                LINE で質問
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer nav */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px", display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← ホーム</Link>
        <Link href="/lab" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>建材 LAB</Link>
        <Link href="/village" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>美留和ビレッジ</Link>
        <Link href="/kumaushi" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>KUMAUSHI BASE</Link>
      </div>

    </main>
  );
}
