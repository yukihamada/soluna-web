// SOLUNA BIM Viewer — Three.js 0.160 (ES module)
// Parametric model builder for 16 plans. Loaded by /bim.html
// Layers: foundation / structure / sips / roof / openings / solar / deck / dims / scale

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sky } from 'three/addons/objects/Sky.js';

export const PLANS = {
  mini:     {W: 3640,  D: 2730,  H: 2400, stories: 1, roofType: 'gable', roofPitch: 0.20, openings: {south: {w: 1500, h: 1170}, solar: 2}, name: 'MEBUKI', label: '9.9m²', tag: '建築確認不要'},
  standard: {W: 5460,  D: 4550,  H: 3000, stories: 1, roofType: 'gable', roofPitch: 0.25, openings: {south: {w: 3000, h: 2200}, solar: 4}, name: 'SU', label: '24.8m²', tag: '本ガイドの標準'},
  dome:     {W: 5900,  D: 5900,  H: 2500, dome: true, openings: {south: {w: 1500, h: 1800}, solar: 4}, name: 'TAMA', label: '40m²', tag: '2Vジオデシックドーム'},
  large:    {W: 7280,  D: 5460,  H: 3000, stories: 1, roofType: 'gable', roofPitch: 0.25, openings: {south: {w: 4000, h: 2400}, solar: 6}, name: 'AN', label: '40m²', tag: 'ファミリー向け'},
  xl:       {W: 9100,  D: 7280,  H: 3500, stories: 1, roofType: 'gable', roofPitch: 0.25, openings: {south: {w: 5000, h: 2400}, solar: 8}, name: 'MUNE', label: '66m²', tag: 'ゲストハウス運営可'},
  villa:    {W: 9100,  D: 13200, H: 3200, stories: 1, roofType: 'gable', roofPitch: 0.20, openings: {south: {w: 6000, h: 2400}, solar: 12}, name: 'VILLA', label: '120m²', tag: 'リトリート平屋'},
  grand:    {W: 13650, D: 7280,  H: 3000, stories: 2, roofType: 'gable', roofPitch: 0.25, openings: {south: {w: 6000, h: 2400}, solar: 18}, name: 'GRAND', label: '200m²', tag: 'SOLUNAベース'},
  myth:     {W: 16380, D: 9100,  H: 3200, stories: 2, roofType: 'gable', roofPitch: 0.30, openings: {south: {w: 7000, h: 2400}, skylight: true, solar: 24}, name: 'MYTH', label: '300m²', tag: 'SOLUNAリトリート', deck: true, sauna: true},
  kosmos:   {W: 22000, D: 11000, H: 3200, stories: 2, roofType: 'gable', roofPitch: 0.30, openings: {south: {w: 10000, h: 2700}, skylight: true, solar: 30}, name: 'KOSMOS', label: '500m²', tag: '中規模リトリート', deck: true},
  pod:      {W: 3500,  D: 8000,  H: 3500, stories: 1, roofType: 'gable', roofPitch: 0.20, openings: {south: {w: 2500, h: 2000}}, name: 'POD', label: '25m²', tag: '都市ワンルーム'},
  stack:    {W: 5000,  D: 9000,  H: 3000, stories: 2, roofType: 'gable', roofPitch: 0.20, openings: {south: {w: 4000, h: 2400}}, name: 'STACK', label: '75m²', tag: '都市標準'},
  tower:    {W: 5000,  D: 10000, H: 3000, stories: 3, roofType: 'flat', pilotis: true, rooftopTerrace: true, openings: {south: {w: 4000, h: 2700}}, name: 'TOWER', label: '130m²', tag: '3階建て・賃貸併用'},
  flat:     {W: 12000, D: 8000,  H: 3400, stories: 1, roofType: 'gable', roofPitch: 0.20, openings: {south: {w: 4500, h: 2400}, solar: 14}, name: 'FLAT', label: '95m²', tag: '平屋ファミリー'},
  duo:      {W: 9000,  D: 11000, H: 3000, stories: 2, roofType: 'gable', roofPitch: 0.25, openings: {south: {w: 4500, h: 2200}, solar: 18}, name: 'DUO', label: '160m²', tag: '二世帯同居'},
  yield:    {W: 12000, D: 8000,  H: 3000, stories: 2, roofType: 'flat', openings: {units: 6, south: {w: 1700, h: 1800}}, name: 'YIELD', label: '180m² 1K×6戸', tag: '投資1K×6戸'},
  roots:    {W: 9000,  D: 7000,  H: 3000, stories: 1, roofType: 'gable', roofPitch: 0.20, openings: {south: {w: 4500, h: 2200}, solar: 10}, name: 'ROOTS', label: '60m²', tag: '終の住処'},
};

const MM = 0.001;            // mm → m
const FL_OFFSET = 0.40;      // GL→FL段差 400mm (北海道凍結深度対応)
const EAVE_OUT  = 0.45;      // 軒の出 450mm
const PANEL_W   = 0.910;     // SIPs 910mm モジュール
const SASH_T    = 0.045;     // サッシ枠 45mm

// ========= Color presets (5 finishes + custom) =========
export const COLOR_PRESETS = {
  black_gal: {
    label: '黒ガルバ × 杉（標準）',
    bg: 0xeeece6, ground: 0xe8e6dc,
    foundation: 0x6a625a,
    steel: 0x1c1c1c, steelDark: 0x141414,
    cedar: 0xa9824f, cedarLite: 0xc09865,
    sash: 0x2a2a2a,
    deck: 0x8a6a3e,
    sauna: 0x6b4220,
  },
  yakisugi: {
    label: '焼杉 × ベンガラ',
    bg: 0xeeece6, ground: 0xe8e6dc,
    foundation: 0x6a625a,
    steel: 0x2a1815, steelDark: 0x1a0e0c,
    cedar: 0x8b6a3e, cedarLite: 0xa68450,
    sash: 0x4a2820,
    deck: 0x6a4220,
    sauna: 0x442010,
  },
  white_cedar: {
    label: 'ホワイト × 杉',
    bg: 0xeeece6, ground: 0xe8e6dc,
    foundation: 0x9a948c,
    steel: 0xe6e2da, steelDark: 0xc9c4ba,
    cedar: 0xb8945c, cedarLite: 0xceaa70,
    sash: 0x4a4a4a,
    deck: 0x8a6a3e,
    sauna: 0x6b4220,
  },
  charcoal_hinoki: {
    label: 'チャコール × 桧',
    bg: 0xeeece6, ground: 0xe8e6dc,
    foundation: 0x4a4540,
    steel: 0x36383c, steelDark: 0x282a2e,
    cedar: 0xd8b88c, cedarLite: 0xe4c89a,
    sash: 0x1c1c1c,
    deck: 0xc09865,
    sauna: 0x8a6a3e,
  },
  natural_wood: {
    label: 'ナチュラル木造',
    bg: 0xeeece6, ground: 0xe8e6dc,
    foundation: 0x8a8278,
    steel: 0xa9824f, steelDark: 0x8a6a3e,        // outer cladding = cedar plank
    cedar: 0xc8a672, cedarLite: 0xdcc090,
    sash: 0x4a3a28,
    deck: 0x9a7848,
    sauna: 0x7a5c30,
  },
};

const COLORS = {
  ...COLOR_PRESETS.black_gal,
  glass:     0x9bd5e8,
  glassEdge: 0x507a85,
  solar:     0x142036,
  solarFr:   0x6a7588,
  line:      0x222222,
  dim:       0x506068,
  skylight:  0xf6e6c0,
  human:     0x3a3a3a,
};

// ========= Procedural textures (canvas → CanvasTexture) =========
const TEX_CACHE = {};
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function rgbHex(hex, a = 1) {
  const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff;
  return `rgba(${r},${g},${b},${a})`;
}
function shade(hex, amt) {
  const r = Math.max(0, Math.min(255, ((hex >> 16) & 0xff) + amt));
  const g = Math.max(0, Math.min(255, ((hex >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (hex & 0xff) + amt));
  return (r << 16) | (g << 8) | b;
}

function texCedar(baseColor) {
  const key = 'cedar_' + baseColor;
  if (TEX_CACHE[key]) return TEX_CACHE[key];
  const c = makeCanvas(512, 512);
  const ctx = c.getContext('2d');
  ctx.fillStyle = rgbHex(baseColor);
  ctx.fillRect(0, 0, 512, 512);
  // Wood grain — vertical streaks with subtle hue noise
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 512;
    const w = 0.5 + Math.random() * 2;
    const dark = Math.random() < 0.5 ? -25 : -10;
    ctx.fillStyle = rgbHex(shade(baseColor, dark), 0.18 + Math.random() * 0.20);
    ctx.fillRect(x, 0, w, 512);
  }
  // Plank seams (every 145 px = 145mm planks at 512px = 1m scale)
  ctx.strokeStyle = rgbHex(shade(baseColor, -50), 0.55);
  ctx.lineWidth = 1.0;
  for (let x = 145; x < 512; x += 145) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  // Subtle horizontal knots
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    const r = 4 + Math.random() * 8;
    const grad = ctx.createRadialGradient(x, y, 1, x, y, r);
    grad.addColorStop(0, rgbHex(shade(baseColor, -60), 0.5));
    grad.addColorStop(1, rgbHex(shade(baseColor, -20), 0));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  TEX_CACHE[key] = tex;
  return tex;
}

function texGalvSteel(baseColor) {
  const key = 'galv_' + baseColor;
  if (TEX_CACHE[key]) return TEX_CACHE[key];
  const c = makeCanvas(512, 512);
  const ctx = c.getContext('2d');
  ctx.fillStyle = rgbHex(baseColor);
  ctx.fillRect(0, 0, 512, 512);
  // Vertical seams (角波 standing-seam, every 64px = ~150mm)
  ctx.strokeStyle = rgbHex(shade(baseColor, -30), 0.85);
  ctx.lineWidth = 1.4;
  for (let x = 0; x < 512; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  // Subtle highlight band beside each seam (raised standing seam)
  ctx.strokeStyle = rgbHex(shade(baseColor, +18), 0.45);
  ctx.lineWidth = 0.7;
  for (let x = 6; x < 512; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  // Metallic noise
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    ctx.fillStyle = rgbHex(shade(baseColor, Math.random() < 0.5 ? +15 : -12), 0.10);
    ctx.fillRect(x, y, 1.2, 1.2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  TEX_CACHE[key] = tex;
  return tex;
}

function texConcrete() {
  const key = 'concrete';
  if (TEX_CACHE[key]) return TEX_CACHE[key];
  const c = makeCanvas(256, 256);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6f6760';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    const v = -20 + Math.random() * 40;
    ctx.fillStyle = `rgba(${110+v},${100+v},${94+v},0.30)`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  TEX_CACHE[key] = tex;
  return tex;
}

const MATS = {};
function buildMaterials() {
  // Procedural textures (per-color so preset switch refreshes)
  const cedarMap = texCedar(COLORS.cedar);
  cedarMap.repeat.set(2, 1);
  const cedarLiteMap = texCedar(COLORS.cedarLite);
  cedarLiteMap.repeat.set(2, 1);
  const galvMap = texGalvSteel(COLORS.steel);
  galvMap.repeat.set(4, 1);
  const galvDarkMap = texGalvSteel(COLORS.steelDark);
  galvDarkMap.repeat.set(4, 1);
  const concMap = texConcrete();
  concMap.repeat.set(3, 0.4);
  const deckMap = texCedar(COLORS.deck);
  deckMap.repeat.set(3, 1);
  const saunaMap = texCedar(COLORS.sauna);
  saunaMap.repeat.set(2, 1);

  MATS.foundation = new THREE.MeshStandardMaterial({color: COLORS.foundation, map: concMap, roughness: 0.95, metalness: 0});
  MATS.steel      = new THREE.MeshStandardMaterial({color: COLORS.steel, map: galvMap, roughness: 0.42, metalness: 0.55, envMapIntensity: 0.85});
  MATS.steelDark  = new THREE.MeshStandardMaterial({color: COLORS.steelDark, map: galvDarkMap, roughness: 0.38, metalness: 0.6, envMapIntensity: 0.95});
  MATS.cedar      = new THREE.MeshStandardMaterial({color: COLORS.cedar, map: cedarMap, roughness: 0.82, metalness: 0});
  MATS.cedarLite  = new THREE.MeshStandardMaterial({color: COLORS.cedarLite, map: cedarLiteMap, roughness: 0.82, metalness: 0});
  MATS.glass      = new THREE.MeshPhysicalMaterial({color: COLORS.glass, roughness: 0.02, metalness: 0, transmission: 0.92, transparent: true, opacity: 0.45, ior: 1.45, thickness: 0.012, envMapIntensity: 1.2, clearcoat: 0.4, clearcoatRoughness: 0.05});
  MATS.sash       = new THREE.MeshStandardMaterial({color: COLORS.sash, roughness: 0.42, metalness: 0.6, envMapIntensity: 0.7});
  MATS.solar      = new THREE.MeshStandardMaterial({color: COLORS.solar, roughness: 0.12, metalness: 0.75, envMapIntensity: 1.4});
  MATS.solarFr    = new THREE.MeshStandardMaterial({color: COLORS.solarFr, roughness: 0.5, metalness: 0.6, envMapIntensity: 0.8});
  MATS.deck       = new THREE.MeshStandardMaterial({color: COLORS.deck, map: deckMap, roughness: 0.88, metalness: 0});
  MATS.sauna      = new THREE.MeshStandardMaterial({color: COLORS.sauna, map: saunaMap, roughness: 0.85, metalness: 0});
  MATS.skylight   = new THREE.MeshPhysicalMaterial({color: COLORS.skylight, roughness: 0.08, metalness: 0, transmission: 0.75, transparent: true, opacity: 0.5, ior: 1.45, thickness: 0.01, envMapIntensity: 1.0});
  MATS.human      = new THREE.MeshStandardMaterial({color: COLORS.human, roughness: 0.9, metalness: 0});
}

// Apply a color preset (or partial overrides) and rebuild materials
export function applyColors(overrides) {
  Object.assign(COLORS, overrides);
  // Clear texture cache so new shades regenerate
  for (const k of Object.keys(TEX_CACHE)) delete TEX_CACHE[k];
  buildMaterials();
}

function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function group(name) { const g = new THREE.Group(); g.name = name; return g; }

// ========= 諸経費・労務費・運搬の係数 (Construction soft-cost coefficients) =========
export const COST_COEFS = {
  labor:        {label: '施工費・労務費',     pct: 0.30, note: '材料費の30%（小屋セルフビルド除く）'},
  prefab_cut:   {label: 'プレカット加工費',   pct: 0.06, note: '材料費の6%'},
  transport:    {label: '運搬費（弟子屈まで4tトラック）', pct: 0.08, note: '材料費の8%'},
  scaffolding:  {label: '足場・仮設工事',     pct: 0.04, note: '材料費の4%'},
  crane:        {label: '重機・揚重費',       pct: 0.03, note: '材料費の3%（パネル取付）'},
  insurance:    {label: '労災・建築保険',     pct: 0.015, note: '材料費の1.5%'},
  design:       {label: '設計監理 (1級建築士)', pct: 0.10, note: '材料費の10%（建築士法24条）'},
  permit:       {label: '建築確認申請',       fixed: 280000, note: '4号特例縮小後（指定確認検査機関）'},
  contingency:  {label: '予備費 (Contingency)', pct: 0.05, note: '材料費の5%'},
};

// ========= 熱性能係数 (per element thermal coefficients for UA calculation) =========
// U value = heat transmission coefficient, W/m²K
export const U_VALUES = {
  sips_wall:    {U: 0.21, label:'SIPs壁 (EPS160mm)'},
  sips_roof:    {U: 0.16, label:'SIPs屋根 (EPS200mm)'},
  window_resin: {U: 1.10, label:'樹脂サッシ トリプル'},
  door_entry:   {U: 1.40, label:'断熱玄関ドア'},
  skylight:     {U: 1.40, label:'天窓 (FIX)'},
  // floor over crawlspace / pile foundation
  slab_floor:   {U: 0.24, label:'断熱床 SIPs同等'},
};

// ========= BIM item registry (BOM tagging) =========
// Maps internal id → human-readable spec, unit price, vendor, construction phase
export const BIM_ITEMS = {
  // 1: site, 2: foundation, 3: frame, 4: envelope, 5: roof, 6: openings, 7: equipment, 8: interior
  pile_screw:        {name:'鋼管杭 Φ100×L1500',    unit:'本',   unitPrice: 4500, vendor:'第一機材',     phase:2, category:'基礎'},
  sill_steel:        {name:'鋼製土台 100×200×t6 (角パイプ)', unit:'m', unitPrice: 3800, vendor:'JFE鋼材',  phase:2, category:'基礎'},
  beam_floor:        {name:'KD杉 構造用集成材 105×180', unit:'m', unitPrice: 1850, vendor:'銘建工業',     phase:3, category:'構造'},
  slab_floor:        {name:'構造用合板 24mm + 杉フローリング', unit:'m²', unitPrice: 5500, vendor:'西垣林業', phase:3, category:'構造'},
  beam_exposed:      {name:'露し梁 KD杉 105×180',     unit:'m',   unitPrice: 1850, vendor:'銘建工業',     phase:3, category:'構造'},
  loft:              {name:'ロフト床 + 杉梯子',       unit:'式',   unitPrice: 65000, vendor:'銘建工業',    phase:3, category:'構造'},
  sips_wall:         {name:'SIPsパネル 壁用 910×1820×t160', unit:'m²', unitPrice: 11000, vendor:'鈴工 / Big Box', phase:4, category:'外皮'},
  sips_roof:         {name:'SIPsパネル 屋根用 910×1820×t200', unit:'m²', unitPrice: 14000, vendor:'鈴工 / Big Box', phase:5, category:'屋根'},
  cladding_galv:     {name:'ガルバ波板 黒 t0.35',     unit:'m²', unitPrice: 1200,  vendor:'JFE鋼板',      phase:4, category:'外皮'},
  ridge_cap:         {name:'棟板金 + 役物',           unit:'m',  unitPrice: 1800,  vendor:'JFE鋼板',      phase:5, category:'屋根'},
  verge_board:       {name:'破風板 ガルバ',           unit:'m',  unitPrice: 1200,  vendor:'JFE鋼板',      phase:5, category:'屋根'},
  gutter:            {name:'雨樋 + 縦樋 Φ60',         unit:'m',  unitPrice: 1500,  vendor:'パナソニック', phase:5, category:'屋根'},
  window_resin:      {name:'樹脂サッシ 引違 トリプルガラス', unit:'m²', unitPrice: 78000, vendor:'YKK AP', phase:6, category:'開口部'},
  door_entry:        {name:'断熱玄関ドア (杉集成材+EPS)', unit:'枚', unitPrice: 31000, vendor:'三協アルミ',phase:6, category:'開口部'},
  skylight:          {name:'天窓 (FIX固定)',          unit:'枚', unitPrice: 95000, vendor:'VELUX',        phase:5, category:'屋根'},
  pv_panel:          {name:'400W単結晶 PVパネル',     unit:'枚', unitPrice: 15000, vendor:'JA Solar',     phase:7, category:'設備'},
  battery_pack:      {name:'LiFePO4 12V 200Ah + 600Wインバーター', unit:'式', unitPrice: 58000, vendor:'CATL/EVE', phase:7, category:'設備'},
  vent_fan:          {name:'24h換気扇 Φ100',         unit:'台', unitPrice: 18000, vendor:'パナソニック', phase:7, category:'設備'},
  vent_compost:      {name:'コンポストvent + キャップ', unit:'式', unitPrice: 8500,  vendor:'盛光',         phase:7, category:'設備'},
  rainwater_tank:    {name:'雨水タンク 200L + ポンプ', unit:'式', unitPrice: 30000, vendor:'タキロン',     phase:7, category:'設備'},
  toilet_compost:    {name:'Separett Villa 9215 コンポストトイレ', unit:'台', unitPrice: 75000, vendor:'Separett', phase:7, category:'設備'},
  stove_wood:        {name:'小型鋼板薪ストーブ + 煙突一式', unit:'式', unitPrice: 48000, vendor:'時計型',  phase:7, category:'設備'},
  bed_cedar:         {name:'杉プラットフォームベッド + マットレス', unit:'台', unitPrice: 65000, vendor:'STAYLING', phase:8, category:'家具'},
  kitchen_counter:   {name:'造作キッチン (杉+SUS)',    unit:'m', unitPrice: 95000, vendor:'造作',         phase:8, category:'家具'},
  dining_set:        {name:'杉ダイニングテーブル+椅子',unit:'式', unitPrice: 80000, vendor:'造作',         phase:8, category:'家具'},
  deck_wood:         {name:'杉デッキ + 手すり',       unit:'m²', unitPrice: 8500,  vendor:'西垣林業',     phase:7, category:'設備'},
  sauna_barrel:      {name:'バレルサウナ 8人用',      unit:'台', unitPrice: 800000, vendor:'Saunum',      phase:7, category:'設備'},
  sash_frame:        {name:'アルミサッシ枠 + 役物',  unit:'m', unitPrice: 4500,  vendor:'YKK AP',         phase:6, category:'開口部'},
  steps_entry:       {name:'杉踏み板 + 鋼ストリンガー', unit:'段', unitPrice: 12000, vendor:'造作',        phase:2, category:'基礎'},
  pilotis_column:    {name:'鋼製柱 H300×300×t12',    unit:'本', unitPrice: 28000, vendor:'JFE鋼材',       phase:2, category:'基礎'},
};

function tagItem(mesh, itemId, qty) {
  if (!BIM_ITEMS[itemId]) return mesh;
  mesh.userData.bim = {
    itemId, qty,
    item: BIM_ITEMS[itemId],
    cost: qty * (BIM_ITEMS[itemId].unitPrice || 0),
  };
  return mesh;
}

function edge(mesh, color, opacity = 0.85) {
  const e = new THREE.EdgesGeometry(mesh.geometry, 18);
  const lines = new THREE.LineSegments(e, new THREE.LineBasicMaterial({color: color ?? COLORS.line, transparent: true, opacity}));
  lines.position.copy(mesh.position);
  lines.rotation.copy(mesh.rotation);
  lines.scale.copy(mesh.scale);
  return lines;
}

// thin black line as a separate mesh (for panel joints, sash divisions, etc.)
function lineSegment(start, end, color = 0x000000, opacity = 0.6) {
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...start), new THREE.Vector3(...end)]);
  return new THREE.Line(g, new THREE.LineBasicMaterial({color, transparent: true, opacity}));
}

// ========= Foundation: スクリュー杭 + 鋼製土台 (Hokkaido cold-climate standard) =========
// 凍結深度1,000mm対応 / コンクリート基礎より速施工 / 撤去可
function buildFoundation(plan) {
  const g = group('foundation');
  const W = plan.W * MM, D = plan.D * MM;
  const baseY  = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;

  // ── スクリュー杭 (helical screw piles) Φ100mm ──
  const pileR = 0.05;                        // Φ100mm pile
  const pileTopY = FL_OFFSET - 0.06;          // top of pile cap (below sill)
  const pileBotY = -1.5;                       // 1500mm below GL (well past frost depth 1000mm)
  const pileH = pileTopY - pileBotY;

  // Pile layout: 1820mm grid along perimeter + interior for spans > 3640mm
  const spacing = 1.82;
  const colsX = Math.max(2, Math.ceil(W / spacing));
  const colsZ = Math.max(2, Math.ceil(D / spacing));
  const stepX = W / (colsX);                  // edge-to-edge spacing
  const stepZ = D / (colsZ);
  const piles = [];
  // Perimeter
  for (let i = 0; i <= colsX; i++) {
    const x = -W/2 + i * stepX;
    piles.push([x, +D/2]);
    piles.push([x, -D/2]);
  }
  for (let j = 1; j < colsZ; j++) {
    const z = -D/2 + j * stepZ;
    piles.push([+W/2, z]);
    piles.push([-W/2, z]);
  }
  // Interior — every other intersection on a coarser grid for spans > 3640mm
  if (W > 3.64 && D > 3.64) {
    for (let i = 1; i < colsX; i++) {
      for (let j = 1; j < colsZ; j++) {
        if ((i + j) % 2 === 0) continue;       // checkerboard pattern
        piles.push([-W/2 + i * stepX, -D/2 + j * stepZ]);
      }
    }
  }

  for (const [x, z] of piles) {
    // Pile shaft (galvanized steel pipe) — tagged
    const pile = new THREE.Mesh(new THREE.CylinderGeometry(pileR, pileR, pileH, 12), MATS.steelDark);
    pile.position.set(x, (pileTopY + pileBotY) / 2, z);
    tagItem(pile, 'pile_screw', 1);
    g.add(pile);
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(pileR * 2.6, pileR * 2.2, 0.06, 16), MATS.steelDark);
    blade.position.set(x, pileBotY + 0.10, z);
    g.add(blade);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.18), MATS.steelDark);
    cap.position.set(x, pileTopY + 0.012, z);
    g.add(cap);
  }

  // ── 鋼製土台 (steel grade beam / sill) — H形鋼 perimeter ──
  const sillT = 0.10, sillH = 0.20;
  const sillY = pileTopY + 0.025 + sillH / 2;
  const sills = [
    {w: W + 0.10, h: sillH, d: sillT, x: 0, y: sillY, z:  D/2},
    {w: W + 0.10, h: sillH, d: sillT, x: 0, y: sillY, z: -D/2},
    {w: sillT, h: sillH, d: D - 0.10, x:  W/2, y: sillY, z: 0},
    {w: sillT, h: sillH, d: D - 0.10, x: -W/2, y: sillY, z: 0},
  ];
  let sillTotalLen = 0;
  for (const s of sills) {
    const m = box(s.w, s.h, s.d, MATS.steelDark);
    m.position.set(s.x, s.y, s.z);
    sillTotalLen += Math.max(s.w, s.d);
    tagItem(m, 'sill_steel', Math.max(s.w, s.d));
    g.add(m);
    g.add(edge(m, COLORS.line, 0.5));
  }
  if (W > 5) {
    const cross = box(sillT, sillH, D - 0.10, MATS.steelDark);
    cross.position.set(0, sillY, 0);
    tagItem(cross, 'sill_steel', D - 0.10);
    g.add(cross);
  }

  // ── Pilotis (TOWER): 4 steel columns instead of piles ──
  if (plan.pilotis) {
    const colH = 2.4, colW = 0.30;
    const inset = 0.6;
    const positions = [
      [-W/2 + inset, FL_OFFSET + colH/2, -D/2 + inset],
      [ W/2 - inset, FL_OFFSET + colH/2, -D/2 + inset],
      [-W/2 + inset, FL_OFFSET + colH/2,  D/2 - inset],
      [ W/2 - inset, FL_OFFSET + colH/2,  D/2 - inset],
    ];
    for (const [x, y, z] of positions) {
      const c = box(colW, colH, colW, MATS.steelDark);
      c.position.set(x, y, z);
      g.add(c);
      g.add(edge(c));
    }
  }

  // ── Entry steps (south side) — cedar planks on steel angle ──
  if (!plan.pilotis && !plan.dome) {
    const stepW = Math.min(W * 0.30, 1.8);
    const tread = 0.30;
    const nSteps = Math.max(2, Math.ceil(FL_OFFSET / 0.20));
    for (let i = 0; i < nSteps; i++) {
      const s = box(stepW, FL_OFFSET / nSteps, tread, MATS.cedar);
      s.position.set(0, (i + 0.5) * (FL_OFFSET / nSteps) - 0.10, D/2 + tread * (nSteps - i - 0.3));
      g.add(s);
      // Steel stringers under the cedar tread
      const strL = box(0.04, FL_OFFSET / nSteps + 0.02, tread + 0.02, MATS.steelDark);
      strL.position.set(-stepW/2 + 0.06, (i + 0.5) * (FL_OFFSET / nSteps) - 0.11, D/2 + tread * (nSteps - i - 0.3));
      g.add(strL);
      const strR = strL.clone();
      strR.position.x = stepW/2 - 0.06;
      g.add(strR);
    }
  }

  return g;
}

// ========= Structure (柱・床スラブ・梁・ロフト) =========
function buildStructure(plan) {
  const g = group('structure');
  if (plan.dome) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;

  // 床スラブ per story (cedar) — 構造合板24mm + フローリング表現
  for (let s = 0; s < stories; s++) {
    const slab = box(W - 0.06, 0.18, D - 0.06, MATS.cedar);
    slab.position.set(0, baseY + s * storyH + 0.09, 0);
    g.add(slab);
  }
  // Top slab/ceiling for flat roof or upper terrace
  if (plan.roofType === 'flat' || plan.rooftopTerrace) {
    const top = box(W - 0.06, 0.20, D - 0.06, MATS.cedar);
    top.position.set(0, baseY + stories * storyH + 0.10, 0);
    g.add(top);
  }

  // 露し梁 KD杉 105×180mm — 平屋＆ガブル屋根のみ、桁行方向に等間隔配置
  if (plan.roofType === 'gable' && stories === 1) {
    const beamN = Math.max(2, Math.ceil(W / 1.82));      // 1820mmピッチ
    const beamW = 0.105, beamH = 0.18;
    const beamY = baseY + storyH - beamH/2 - 0.05;
    for (let i = 0; i < beamN; i++) {
      const x = -W/2 + 0.4 + i * ((W - 0.8) / Math.max(1, beamN - 1));
      const beam = box(beamW, beamH, D - 0.4, MATS.cedarLite);
      beam.position.set(x, beamY, 0);
      g.add(beam);
    }
  }

  // ロフト床（屋根裏） — MEBUKI/SU/AN/MUNE のような小〜中規模平屋に追加
  if (plan.roofType === 'gable' && stories === 1 && (plan.H || 3000) <= 3500) {
    const pitch = plan.roofPitch || 0.25;
    const ridgeH = (D/2 + EAVE_OUT) * pitch;
    const loftAreaHmin = 1.4;        // ロフト床上の最低空間
    if (ridgeH > loftAreaHmin) {
      // ロフト床面積：屋根勾配で天井1.4m以上を確保できる範囲
      const loftDepthRatio = Math.max(0, (ridgeH - loftAreaHmin) / ridgeH);
      const loftD = D * 0.55 * loftDepthRatio;
      if (loftD > 1.5) {
        const loftFloor = box(W - 0.4, 0.10, loftD, MATS.cedarLite);
        const loftY = baseY + storyH - 0.05 + 0.05;
        loftFloor.position.set(0, loftY + 0.05, 0);
        g.add(loftFloor);
        g.add(edge(loftFloor, COLORS.line, 0.6));

        // ロフト梯子 (cedar ladder, 7段)
        const ladderH = storyH;
        const stepCnt = 7;
        const ladW = 0.45;
        const sideR = box(0.04, ladderH, 0.04, MATS.cedarLite);
        sideR.position.set(-W/2 + 0.5, baseY + ladderH/2, -loftD/2 + 0.05);
        g.add(sideR);
        const sideR2 = sideR.clone();
        sideR2.position.x += ladW;
        g.add(sideR2);
        for (let i = 0; i < stepCnt; i++) {
          const step = box(ladW + 0.04, 0.025, 0.06, MATS.cedarLite);
          step.position.set(-W/2 + 0.5 + ladW/2, baseY + 0.15 + i * (ladderH - 0.3) / (stepCnt - 1), -loftD/2 + 0.05);
          g.add(step);
        }
      }
    }
  }
  return g;
}

// ========= SIPs envelope (壁＋目地 910mm) =========
function buildSIPs(plan) {
  const g = group('sips');
  if (plan.dome) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const totalH = storyH * stories;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
  const t = 0.16;

  // South wall (+Z) — main opening
  const south = wallWithOpenings({W, H: totalH, t, opening: plan.openings?.south, units: plan.openings?.units, side: false});
  south.position.set(0, baseY + totalH/2, D/2 - t/2);
  tagWallArea(south, W, totalH);
  g.add(south);

  // North wall (solid)
  const north = solidWall(W, totalH, t);
  north.position.set(0, baseY + totalH/2, -D/2 + t/2);
  tagWallArea(north, W, totalH);
  g.add(north);

  // East/West (+X / -X) — small windows per story
  const sideOp = {w: 0.9, h: 1.2};
  const east = wallWithOpenings({W: D, H: totalH, t, opening: sideOp, side: true, count: stories});
  east.rotation.y = Math.PI / 2;
  east.position.set(W/2 - t/2, baseY + totalH/2, 0);
  tagWallArea(east, D, totalH);
  g.add(east);

  const west = wallWithOpenings({W: D, H: totalH, t, opening: sideOp, side: true, count: stories});
  west.rotation.y = -Math.PI / 2;
  west.position.set(-W/2 + t/2, baseY + totalH/2, 0);
  tagWallArea(west, D, totalH);
  g.add(west);

  // Inter-floor band (showing slab edge)
  for (let s = 1; s < stories; s++) {
    const band = box(W + 0.04, 0.08, D + 0.04, MATS.steelDark);
    band.position.set(0, baseY + s * storyH, 0);
    g.add(band);
  }

  return g;
}

// Helper to tag an entire wall group with its area
function tagWallArea(wallGroup, w, h) {
  const area = w * h;
  // Find the first solid mesh in the group and tag it (ignore openings/windows)
  let tagged = false;
  wallGroup.traverse(o => {
    if (tagged) return;
    if (o.isMesh && o.material === MATS.steel) {
      tagItem(o, 'sips_wall', area);
      tagged = true;
    }
  });
}

function solidWall(W, H, t) {
  const g = new THREE.Group();
  const m = box(W, H, t, MATS.steel);
  g.add(m);
  // 910mmモジュール目地
  const cols = Math.max(1, Math.round(W / PANEL_W));
  for (let c = 1; c < cols; c++) {
    const x = -W/2 + c * (W / cols);
    g.add(lineSegment([x, -H/2, t/2 + 0.001], [x, H/2, t/2 + 0.001], 0x000, 0.35));
  }
  // Horizontal joint at mid-height for 1820 stack (if H > 2.0)
  if (H > 2.0) {
    g.add(lineSegment([-W/2, -H/2 + 1.82, t/2 + 0.001], [W/2, -H/2 + 1.82, t/2 + 0.001], 0x000, 0.35));
  }
  return g;
}

function sashFrame(w, h, depth) {
  // L-shaped frame: 4 thin bars around opening
  const f = new THREE.Group();
  const top = box(w + SASH_T*2, SASH_T, depth + 0.01, MATS.sash);
  top.position.set(0, h/2 + SASH_T/2, 0); f.add(top);
  const bot = top.clone(); bot.position.y = -h/2 - SASH_T/2; f.add(bot);
  const left = box(SASH_T, h, depth + 0.01, MATS.sash);
  left.position.set(-w/2 - SASH_T/2, 0, 0); f.add(left);
  const right = left.clone(); right.position.x = w/2 + SASH_T/2; f.add(right);
  // Mullion (vertical divide for big openings)
  if (w > 2.5) {
    const mul = box(SASH_T * 0.6, h, depth + 0.01, MATS.sash);
    mul.position.set(0, 0, 0); f.add(mul);
  }
  return f;
}

function wallWithOpenings({W, H, t, opening, count, units, side}) {
  const g = new THREE.Group();

  // Multi-unit (YIELD)
  if (units && units > 0) {
    const solid = solidWall(W, H, t);
    g.add(solid);
    const cols = 3, rows = Math.ceil(units / cols);
    const winW = 1.5, winH = 1.6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -W/2 + (c + 0.5) * (W / cols);
        const y = -H/2 + (r + 0.5) * (H / rows);
        const sub = group('opening');
        const win = box(winW, winH, t + 0.005, MATS.glass);
        win.position.set(x, y, 0);
        sub.add(win);
        const fr = sashFrame(winW, winH, t);
        fr.position.set(x, y, t/2);
        sub.add(fr);
        // Door (each unit)
        const doorW = 0.85, doorH = 2.0;
        const dx = -W/2 + (c + 0.5) * (W / cols);
        const dy = -H/2 + (r + 0.5) * (H / rows) - winH/2 - 0.5 - doorH/2 + 0.4;
        // Skip doors if too crowded
        g.add(sub);
      }
    }
    return g;
  }

  // Solid wall background
  g.add(solidWall(W, H, t));

  const op = opening || {w: 1.5, h: 1.5};
  const opW = op.w > 100 ? op.w * MM : op.w;
  const opH = op.h > 100 ? op.h * MM : op.h;

  if (side) {
    // small windows per story
    const cnt = count || 1;
    const storyH = H / cnt;
    for (let s = 0; s < cnt; s++) {
      const yc = -H/2 + (s + 0.5) * storyH;
      const win = box(opW, opH, t + 0.005, MATS.glass);
      win.position.set(0, yc, 0); g.add(win);
      const fr = sashFrame(opW, opH, t);
      fr.position.set(0, yc, t/2); g.add(fr);
    }
  } else {
    // Big south opening on ground floor — sill 400mm above FL
    const sill = -H/2 + 0.40 + opH/2;
    const win = box(opW, opH, t + 0.005, MATS.glass);
    win.position.set(0, sill, 0);
    tagItem(win, 'window_resin', opW * opH);
    g.add(win);
    const fr = sashFrame(opW, opH, t);
    fr.position.set(0, sill, t/2); g.add(fr);

    // Cedar entry door (offset to left of glass)
    const doorW = 0.90, doorH = 2.05;
    const dx = -opW/2 - doorW/2 - 0.30;
    if (dx - doorW/2 > -W/2 + 0.30) {
      const dy = -H/2 + doorH/2;
      const door = box(doorW, doorH, t + 0.01, MATS.cedar);
      door.position.set(dx, dy, 0);
      tagItem(door, 'door_entry', 1);
      g.add(door);
      const dframe = sashFrame(doorW, doorH, t);
      dframe.position.set(dx, dy, t/2); g.add(dframe);
    }

    // Upper story ribbon window if multi-story
    if (H > opH * 1.5 + 1.0) {
      const ribH = 0.9;
      const ribY = sill + opH/2 + 1.4 + ribH/2;
      if (ribY + ribH/2 < H/2 - 0.3) {
        const rib = box(opW, ribH, t + 0.005, MATS.glass);
        rib.position.set(0, ribY, 0); g.add(rib);
        const rfr = sashFrame(opW, ribH, t);
        rfr.position.set(0, ribY, t/2); g.add(rfr);
      }
    }
  }
  return g;
}

// ========= Roof (gable / flat / dome) =========
// Convention: Ridge runs along W (X axis). Slopes face +Z (south) and -Z (north).
// 軒の出 EAVE_OUT 既定 450mm
function buildRoof(plan) {
  const g = group('roof');
  if (plan.dome) {
    return buildDomeRoof(plan, g);
  }
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
  const eaveY = baseY + stories * storyH;

  if (plan.roofType === 'flat') {
    // Roof slab — positioned above the structure top slab (FFL+200) to cover it
    const slab = box(W + EAVE_OUT, 0.10, D + EAVE_OUT, MATS.steel);
    slab.position.set(0, eaveY + 0.25, 0);
    g.add(slab);
    g.add(edge(slab));
    // Parapet (4 thin walls only, hollow center)
    const pH = 0.45, pT = 0.10;
    const sides = [
      {w: W + EAVE_OUT, h: pH, d: pT, x: 0, z:  D/2 + EAVE_OUT/2 - pT/2},
      {w: W + EAVE_OUT, h: pH, d: pT, x: 0, z: -D/2 - EAVE_OUT/2 + pT/2},
      {w: pT, h: pH, d: D + EAVE_OUT - pT*2, x:  W/2 + EAVE_OUT/2 - pT/2, z: 0},
      {w: pT, h: pH, d: D + EAVE_OUT - pT*2, x: -W/2 - EAVE_OUT/2 + pT/2, z: 0},
    ];
    for (const s of sides) {
      const m = box(s.w, s.h, s.d, MATS.steel);
      m.position.set(s.x, eaveY + 0.30 + pH/2, s.z);
      g.add(m);
      g.add(edge(m, COLORS.line, 0.5));
    }
    if (plan.rooftopTerrace) {
      // Cedar deck on top + simple railing
      const deck = box(W - 0.4, 0.05, D - 0.4, MATS.deck);
      deck.position.set(0, eaveY + 0.33, 0);
      g.add(deck);
      // Railing posts
      const rH = 1.10;
      for (const [x, z] of [[ W/2 - 0.3, 0], [-W/2 + 0.3, 0], [0,  D/2 - 0.3], [0, -D/2 + 0.3]]) {
        const post = box(0.05, rH, 0.05, MATS.cedar);
        post.position.set(x, eaveY + 0.30 + rH/2, z);
        g.add(post);
      }
    }
    return g;
  }

  // Gable: ridge along X. Half-depth = D/2. Pitch = rise/run.
  // Build the roof as a single ExtrudeGeometry — gable profile (with overhang + thickness) extruded along W.
  // This guarantees no gap at the ridge.
  const pitch = plan.roofPitch || 0.25;
  const run = D/2 + EAVE_OUT;
  const ridgeH = run * pitch;
  const tRoof = 0.10;        // roof slab thickness 100mm
  const roofW = W + EAVE_OUT * 2;
  const slope = Math.atan(pitch);
  const cosS = Math.cos(slope), sinS = Math.sin(slope);
  // Vertical thickness of slab when measured upright = tRoof / cos(slope)
  const tVert = tRoof / cosS;

  // Profile in the (z, y) plane, extruded along x
  // Outer top: south_eave_top (run, eaveY+tVert) → ridge_top (0, eaveY+ridgeH+tVert) → north_eave_top (-run, eaveY+tVert)
  // Inner bottom: south_eave_bot (run, eaveY) → ridge_bot (0, eaveY+ridgeH) → north_eave_bot (-run, eaveY)
  const profile = new THREE.Shape();
  profile.moveTo(-run, eaveY);
  profile.lineTo( run, eaveY);
  profile.lineTo( run, eaveY + tVert);
  profile.lineTo( 0,   eaveY + ridgeH + tVert);
  profile.lineTo(-run, eaveY + tVert);
  profile.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(profile, {
    depth: roofW, bevelEnabled: false, curveSegments: 1,
  });
  // ExtrudeGeometry extrudes along +Z by default. Profile is in XY where X=z-direction, Y=height.
  // We need profile-X to be world-Z, profile-Y to be world-Y, extrude direction to be world-X.
  // So rotate around Y by -90deg, then translate to center on X axis.
  const roof = new THREE.Mesh(roofGeo, MATS.steel);
  roof.rotation.y = -Math.PI / 2;
  roof.position.x = -roofW / 2;       // extrude goes +Z which after Y rotation is -X
  // Roof area = 2 slopes × (W × slopeLen)
  const slopeLen = Math.hypot(run, ridgeH);
  tagItem(roof, 'sips_roof', 2 * roofW * slopeLen);
  // After rotation Y by -90deg: (x_local, y_local, z_local) → (z_local, y_local, -x_local)
  // So extrude direction (z_local) maps to world +X. Good.
  // The profile X (which was world Z direction in shape) after Y rot → ... wait let me re-check.
  // Y rotation by -π/2: (x, y, z) → (-z, y, x). So profile point (z_p, y_p) at local (z_p, y_p, 0) → world (0, y_p, z_p).
  // Extrude depth direction is local +Z, after rotation → world -X. So extrusion goes from x=0 to x=-roofW.
  // Center on X by moving +roofW/2.
  roof.position.x = roofW / 2;
  g.add(roof);
  g.add(edge(roof, COLORS.line, 0.45));

  // Gable end triangles (east +X, west -X) — close the gable openings
  // Inner triangle (matches profile's inner top: eave-line + ridge)
  for (const xSign of [1, -1]) {
    const shape = new THREE.Shape();
    shape.moveTo(-D/2, 0);
    shape.lineTo( D/2, 0);
    shape.lineTo( 0, ridgeH);
    shape.closePath();
    const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: 0.02, bevelEnabled: false}), MATS.steel);
    tri.rotation.y = Math.PI / 2;
    tri.position.set(xSign * (W/2 - 0.01), eaveY, 0);
    g.add(tri);
    g.add(edge(tri, COLORS.line, 0.6));
  }

  // 雨樋 (gutter) on each eave
  for (const sign of [1, -1]) {
    const gutter = box(roofW, 0.06, 0.10, MATS.steelDark);
    gutter.position.set(0, eaveY - 0.04, sign * (D/2 + EAVE_OUT - 0.06));
    g.add(gutter);
  }

  // Skylight ridge tower (MYTH/KOSMOS)
  if (plan.openings?.skylight) {
    const skW = Math.min(2.6, W * 0.18);
    const skH = 1.8;
    const skD = Math.min(D * 0.45, 6);
    const tower = box(skW, skH, skD, MATS.steelDark);
    tower.position.set(0, eaveY + ridgeH + skH/2, 0);
    g.add(tower);
    g.add(edge(tower, 0xfff, 0.4));
    const glass = box(skW - 0.20, 0.10, skD - 0.20, MATS.skylight);
    glass.position.set(0, eaveY + ridgeH + skH, 0);
    g.add(glass);
  }

  // Chimney (薪ストーブ) — small black pipe near ridge, west side
  if (!plan.dome) {
    const chimH = ridgeH + 0.8;
    const chim = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, chimH, 16), MATS.steelDark);
    chim.position.set(W/2 - 0.6, eaveY + chimH/2, 0);
    g.add(chim);
  }

  return g;
}

function buildDomeRoof(plan, g) {
  const W = plan.W * MM, D = plan.D * MM;
  const r = Math.max(W, D) / 2 * 0.95;
  const ico = new THREE.IcosahedronGeometry(r, 1);
  const pos = ico.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) < 0) pos.setY(i, 0);
  }
  pos.needsUpdate = true;
  ico.computeVertexNormals();
  const dome = new THREE.Mesh(ico, MATS.steel);
  dome.position.set(0, FL_OFFSET, 0);
  g.add(dome);
  g.add(edge(dome, COLORS.line, 0.4));

  // Door + window opening on south
  const doorW = 1.2, doorH = 2.05;
  const door = box(doorW, doorH, 0.06, MATS.cedar);
  door.position.set(0, FL_OFFSET + doorH/2, r * 0.92);
  g.add(door);
  g.add(edge(door));
  const dfr = sashFrame(doorW, doorH, 0.06);
  dfr.position.set(0, FL_OFFSET + doorH/2, r * 0.92 + 0.04);
  g.add(dfr);

  const winW = 1.6, winH = 0.9;
  const win = box(winW, winH, 0.06, MATS.glass);
  win.position.set(0, FL_OFFSET + doorH + 0.5, r * 0.88);
  g.add(win);
  const wfr = sashFrame(winW, winH, 0.06);
  wfr.position.set(0, FL_OFFSET + doorH + 0.5, r * 0.88 + 0.04);
  g.add(wfr);
  return g;
}

// ========= Solar (南面整列配置) =========
function buildSolar(plan) {
  const g = group('solar');
  const count = plan.openings?.solar || 0;
  if (!count) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
  const eaveY = baseY + stories * storyH;
  const pitch = plan.roofPitch || 0.25;
  const run = D/2 + EAVE_OUT;
  const ridgeH = run * pitch;
  const slope = Math.atan(pitch);
  const slopeLen = Math.hypot(run, ridgeH);

  const pW = 1.722, pH = 1.134;       // 400W panel JA solar
  const gap = 0.025;                    // パネル間離隔 25mm
  const margin = 0.30;                  // 雪止め・点検通路 軒先離隔
  const ridgeMargin = 0.40;             // 棟側離隔

  if (plan.dome) {
    // Dome: ground-mount carport/PV array south of dome (avoid dome surface)
    const startY = FL_OFFSET + 1.0;
    const cols = Math.max(1, Math.min(count, 4));
    const rows = Math.ceil(count / cols);
    const totalRowW = cols * pW + (cols - 1) * gap;
    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= count) break;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.005, 0.04, pH - 0.005), MATS.solar);
        const x = -totalRowW/2 + c * (pW + gap) + pW/2;
        const z = D/2 + 1.5 + r * (pH + 0.10);
        panel.position.set(x, startY, z);
        panel.rotation.x = -0.35;        // 20° south tilt
        g.add(panel);
        g.add(edge(panel, COLORS.solarFr, 0.8));
        // Mounting post
        const post = box(0.06, 1.0, 0.06, MATS.steelDark);
        post.position.set(x, FL_OFFSET + 0.5, z);
        g.add(post);
        placed++;
      }
    }
    return g;
  }
  if (plan.roofType === 'flat') {
    // Flat-mount on rooftop (10° tilt), facing south
    const startY = eaveY + 0.30;
    const usableW = W - margin * 2;
    const usableD = D - margin * 2;
    const cols = Math.max(1, Math.floor(usableW / (pW + gap)));
    const rows = Math.ceil(count / cols);
    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= count) break;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(pW - gap, 0.04, pH - gap), MATS.solar);
        const x = -usableW/2 + (c + 0.5) * ((pW + gap));
        const z = -usableD/2 + (r + 0.5) * (pH + 0.15);
        panel.position.set(x, startY + 0.10, z);
        panel.rotation.x = -0.18;
        g.add(panel);
        g.add(edge(panel, COLORS.solarFr, 0.8));
        placed++;
      }
    }
    return g;
  }

  // Gable: south slope (+Z). Panels sit ON TOP of the roof outer surface.
  // Roof outer surface (south side): goes from (z=run, y=eaveY+tVert) to (z=0, y=eaveY+ridgeH+tVert)
  const tRoof = 0.10;                        // matches buildRoof
  const tVert = tRoof / Math.cos(slope);
  const standoff = 0.05 + 0.0225;             // 50mm bracket + half panel thickness
  const standoffY = standoff * Math.cos(slope);
  const standoffZ = standoff * Math.sin(slope);
  const usableSlope = slopeLen - margin - ridgeMargin;
  const usableW = W - margin * 2;
  const cols = Math.max(1, Math.floor(usableW / (pW + gap)));
  const totalRowW = cols * pW + (cols - 1) * gap;
  const rowsAvail = Math.max(1, Math.floor(usableSlope / (pH + gap)));
  const rows = Math.min(rowsAvail, Math.ceil(count / cols));
  let placed = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (placed >= count) break;
      const along = margin + r * (pH + gap) + pH/2;
      // Position on the OUTER roof surface, then offset by standoff perpendicular to slope
      const z = (D/2 + EAVE_OUT) - along * Math.cos(slope) - standoffZ;
      const y = eaveY + tVert + along * Math.sin(slope) + standoffY;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.005, 0.045, pH - 0.005), MATS.solar);
      const x = -totalRowW/2 + c * (pW + gap) + pW/2;
      panel.position.set(x, y, z);
      panel.rotation.x = -slope;
      tagItem(panel, 'pv_panel', 1);
      g.add(panel);
      g.add(edge(panel, COLORS.solarFr, 0.8));
      placed++;
    }
  }

  // 雪止め (snow guard) — black bar across south slope, near eave (sits on roof surface)
  const snowGuard = box(W - 0.2, 0.05, 0.05, MATS.steelDark);
  const sgAlong = margin * 0.5;
  const sgStandoff = 0.025;       // sits flush on roof
  snowGuard.position.set(
    0,
    eaveY + tVert + sgAlong * Math.sin(slope) + sgStandoff * Math.cos(slope),
    (D/2 + EAVE_OUT) - sgAlong * Math.cos(slope) - sgStandoff * Math.sin(slope),
  );
  snowGuard.rotation.x = -slope;
  g.add(snowGuard);

  return g;
}

// ========= Deck + Sauna =========
function buildDeck(plan) {
  const g = group('deck');
  if (!plan.deck && !['villa', 'grand', 'flat', 'duo', 'roots', 'large', 'xl'].includes(plan.id)) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
  const dDeck = Math.min(3.0, D * 0.25);
  const deck = box(W * 0.95, 0.10, dDeck, MATS.deck);
  deck.position.set(0, baseY - 0.05, D/2 + dDeck/2);
  tagItem(deck, 'deck_wood', W * 0.95 * dDeck);
  g.add(deck);
  g.add(edge(deck, COLORS.line, 0.4));
  // Deck joists pattern (just visible from below as edges) — skip for simplicity
  // Cedar railing (knee height 1100)
  const railH = 1.05, railT = 0.04;
  const railTop = box(W * 0.95, railT, railT, MATS.cedar);
  railTop.position.set(0, baseY + railH, D/2 + dDeck);
  g.add(railTop);
  // Posts
  const postCount = Math.max(2, Math.ceil(W / 1.5));
  for (let i = 0; i <= postCount; i++) {
    const x = -W * 0.95 / 2 + i * (W * 0.95 / postCount);
    const post = box(railT, railH, railT, MATS.cedar);
    post.position.set(x, baseY + railH/2, D/2 + dDeck);
    g.add(post);
  }

  // Sauna barrel (MYTH)
  if (plan.sauna) {
    const sauna = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 24), MATS.sauna);
    sauna.rotation.z = Math.PI / 2;
    sauna.position.set(W/2 - 1.6, baseY + 1.2, D/2 + dDeck/2 + 0.4);
    tagItem(sauna, 'sauna_barrel', 1);
    g.add(sauna);
    g.add(edge(sauna));
    // Sauna chimney
    const sChim = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 12), MATS.steelDark);
    sChim.position.set(W/2 - 1.6, baseY + 2.5, D/2 + dDeck/2 + 0.4);
    g.add(sChim);
  }
  return g;
}

// ========= Dimensions (with HTML labels) =========
function buildDimensions(plan) {
  const g = group('dims');
  const W = plan.W * MM, D = plan.D * MM;
  const stories = plan.stories || 1;
  const totalH = stories * (plan.H || 3000) * MM + (plan.pilotis ? 2.4 : 0) + FL_OFFSET;

  function dimLine(p1, p2, label) {
    const grp = new THREE.Group();
    const matLine = new THREE.LineBasicMaterial({color: COLORS.dim});
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([v1, v2]), matLine));
    // Tick marks
    const tickH = 0.18;
    const tA = v1.clone().add(new THREE.Vector3(0, tickH, 0));
    const tB = v1.clone().add(new THREE.Vector3(0, -tickH, 0));
    const tC = v2.clone().add(new THREE.Vector3(0, tickH, 0));
    const tD = v2.clone().add(new THREE.Vector3(0, -tickH, 0));
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([tA, tB]), matLine));
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([tC, tD]), matLine));

    // HTML label (CSS2DObject)
    const div = document.createElement('div');
    div.className = 'bim-dim-label';
    div.textContent = label;
    div.style.cssText = 'background:rgba(255,255,255,.92);border:1px solid #506068;color:#222;font-size:10px;padding:1px 6px;font-feature-settings:"tnum";letter-spacing:.02em;border-radius:2px;pointer-events:none;font-family:-apple-system,sans-serif';
    const labelObj = new CSS2DObject(div);
    labelObj.position.set((p1[0]+p2[0])/2, (p1[1]+p2[1])/2, (p1[2]+p2[2])/2);
    grp.add(labelObj);
    return grp;
  }

  const yLow = -0.3;
  g.add(dimLine([-W/2, yLow, D/2 + 1.2], [W/2, yLow, D/2 + 1.2], `W: ${plan.W.toLocaleString()}mm`));
  g.add(dimLine([W/2 + 1.2, yLow, -D/2], [W/2 + 1.2, yLow, D/2], `D: ${plan.D.toLocaleString()}mm`));
  g.add(dimLine([-W/2 - 1.2, FL_OFFSET, D/2 + 0.5], [-W/2 - 1.2, FL_OFFSET + (plan.H || 3000) * MM * stories, D/2 + 0.5], `H: ${((plan.H || 3000) * stories).toLocaleString()}mm`));
  return g;
}

// ========= Equipment / 設備機器 =========
// 雨水タンク 200L, コンポストトイレvent, 24h換気扇, 縦樋, 棟板金, 破風板
function buildEquipment(plan) {
  const g = group('equipment');
  if (plan.dome) return g;       // skip equipment for dome (different topology)
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
  const eaveY = baseY + stories * storyH;

  // ── 雨水タンク 200L (cylinder, near east wall, north corner) ──
  if (!plan.openings?.units && stories <= 2) {
    const tankR = 0.30, tankH = 0.95;
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(tankR, tankR, tankH, 18), MATS.cedarLite);
    tank.position.set(W/2 + tankR + 0.15, FL_OFFSET + tankH/2, -D/2 + 1.2);
    tagItem(tank, 'rainwater_tank', 1);
    g.add(tank);
    g.add(edge(tank, COLORS.line, 0.6));
    // top lid (darker)
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(tankR + 0.02, tankR + 0.02, 0.04, 18), MATS.steelDark);
    lid.position.set(W/2 + tankR + 0.15, FL_OFFSET + tankH + 0.02, -D/2 + 1.2);
    g.add(lid);
  }

  // ── コンポストトイレ排気管 (small white PVC, Φ50, on roof, north slope) ──
  if (plan.roofType !== 'flat' && !plan.openings?.units) {
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 12),
      new THREE.MeshStandardMaterial({color: 0xeae6dc, roughness: 0.7}));
    tagItem(vent, 'vent_compost', 1);
    const pitch = plan.roofPitch || 0.25;
    const along = (D/2 + EAVE_OUT) * 0.45;
    const z = -((D/2 + EAVE_OUT) - along * Math.cos(Math.atan(pitch)));
    const y = eaveY + along * Math.sin(Math.atan(pitch)) + 0.42;
    vent.position.set(-W/2 + 1.0, y, z);
    g.add(vent);
    // vent cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 12),
      new THREE.MeshStandardMaterial({color: 0x999488, roughness: 0.5}));
    cap.position.set(-W/2 + 1.0, y + 0.45, z);
    g.add(cap);
  }

  // ── 24h換気扇 (Φ100 vent grille, west wall) ──
  if (!plan.openings?.units) {
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), MATS.steelDark);
    fan.rotation.z = Math.PI / 2;
    fan.position.set(-W/2 - 0.02, baseY + storyH * 0.85, -D/2 + 0.8);
    tagItem(fan, 'vent_fan', 1);
    g.add(fan);
  }

  // ── 縦樋 (downspout) — 4 corners ──
  const dsT = 0.06;
  const corners = [
    [ W/2 + EAVE_OUT - dsT/2,  D/2 + EAVE_OUT - dsT/2],
    [-W/2 - EAVE_OUT + dsT/2,  D/2 + EAVE_OUT - dsT/2],
    [ W/2 + EAVE_OUT - dsT/2, -D/2 - EAVE_OUT + dsT/2],
    [-W/2 - EAVE_OUT + dsT/2, -D/2 - EAVE_OUT + dsT/2],
  ];
  for (const [x, z] of corners) {
    const ds = box(dsT, eaveY - FL_OFFSET, dsT, MATS.steelDark);
    ds.position.set(x, FL_OFFSET + (eaveY - FL_OFFSET) / 2, z);
    tagItem(ds, 'gutter', eaveY - FL_OFFSET);
    g.add(ds);
  }

  // ── 棟板金 (ridge cap) — gable roof only ──
  if (plan.roofType === 'gable' && !plan.dome) {
    const pitch = plan.roofPitch || 0.25;
    const run = D/2 + EAVE_OUT;
    const ridgeY = eaveY + run * pitch;
    const cap = box(W + EAVE_OUT*2, 0.10, 0.30, MATS.steelDark);
    cap.position.set(0, ridgeY + 0.05, 0);
    tagItem(cap, 'ridge_cap', W + EAVE_OUT*2);
    g.add(cap);
  }

  // ── 破風板 (verge board) along gable ends — slope from eave (low) to ridge (high) ──
  if (plan.roofType === 'gable' && !plan.dome) {
    const pitch = plan.roofPitch || 0.25;
    const run = D/2 + EAVE_OUT;
    const ridgeH = run * pitch;
    const slopeLen = Math.hypot(run, ridgeH);
    const slope = Math.atan(pitch);
    for (const xSign of [1, -1]) {
      for (const zSign of [1, -1]) {
        const verge = box(0.04, 0.18, slopeLen, MATS.steelDark);
      tagItem(verge, 'verge_board', slopeLen);
        // Center along the slope from eave (z=zSign*run, y=eaveY) to ridge (z=0, y=eaveY+ridgeH)
        verge.position.set(
          xSign * (W/2 + EAVE_OUT - 0.02),
          eaveY + ridgeH / 2,
          zSign * (run / 2)
        );
        // Rotation: for zSign=+1 (south), need +Z end at south eave (low), -Z at ridge (high)
        // Rx(+slope) makes +Z dive down, -Z rise up → correct.
        verge.rotation.x = zSign * slope;
        g.add(verge);
      }
    }
  }

  // ── 薪ストーブ煙突キャップ (chimney cap) — already have pipe in roof ──
  // Adding the rain cap on top
  if (plan.roofType === 'gable' && !plan.dome && !plan.pilotis) {
    const pitch = plan.roofPitch || 0.25;
    const ridgeY = eaveY + (D/2 + EAVE_OUT) * pitch + 0.85;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12), MATS.steelDark);
    cap.position.set(W/2 - 0.6, ridgeY, 0);
    g.add(cap);
  }

  return g;
}

// ========= Interior furniture / 内装家具 =========
// Adds furniture appropriate to plan size: bed, kitchen, table, wood stove, toilet booth
function buildInterior(plan) {
  const g = group('interior');
  if (plan.dome) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
  const FL = baseY + 0.18;          // floor finish level (top of floor slab)
  const area = W * D;

  // ── 薪ストーブ (wood stove, all build plans) ──
  if (!plan.pilotis && !plan.openings?.units) {
    const stove = box(0.50, 0.65, 0.45, MATS.steelDark);
    stove.position.set(W/2 - 0.7, FL + 0.325, 0);
    tagItem(stove, 'stove_wood', 1);
    g.add(stove);
    // Heat shield base (concrete pad)
    const pad = box(0.80, 0.04, 0.75, MATS.foundation);
    pad.position.set(W/2 - 0.7, FL + 0.02, 0);
    g.add(pad);
    // Stove door (small bright square — fire visible)
    const door = box(0.04, 0.20, 0.20, new THREE.MeshStandardMaterial({color: 0xff7a30, emissive: 0xff5510, emissiveIntensity: 0.8}));
    door.position.set(W/2 - 0.95, FL + 0.32, 0);
    g.add(door);
  }

  // ── Bed (single, all plans except YIELD which has 6 units) ──
  if (!plan.openings?.units) {
    const bedW = 1.05, bedL = 2.05, bedH = 0.38;
    const bedX = -W/2 + 0.6 + bedW/2;
    const bedZ = -D/2 + 0.5 + bedL/2;
    // Bed frame (cedar)
    const frame = box(bedW, 0.10, bedL, MATS.cedar);
    frame.position.set(bedX, FL + 0.05, bedZ);
    tagItem(frame, 'bed_cedar', 1);
    g.add(frame);
    // Mattress (white linen)
    const mattress = box(bedW - 0.04, 0.18, bedL - 0.04, new THREE.MeshStandardMaterial({color: 0xf2efea, roughness: 0.9}));
    mattress.position.set(bedX, FL + 0.10 + 0.09, bedZ);
    g.add(mattress);
    // Pillow (small)
    const pillow = box(0.45, 0.08, 0.30, new THREE.MeshStandardMaterial({color: 0xe8e3da, roughness: 0.9}));
    pillow.position.set(bedX, FL + 0.10 + 0.18 + 0.04, bedZ - bedL/2 + 0.30);
    g.add(pillow);
    // Wool blanket (dark)
    const blanket = box(bedW - 0.02, 0.06, bedL * 0.55, new THREE.MeshStandardMaterial({color: 0x4a3c2c, roughness: 0.95}));
    blanket.position.set(bedX, FL + 0.10 + 0.18 + 0.03, bedZ + bedL * 0.18);
    g.add(blanket);
  }

  // ── Kitchen counter (cedar with steel sink) ──
  if (area > 18) {
    const kchnW = Math.min(W * 0.4, 2.4);
    const kchnD = 0.65;
    const kchnH = 0.85;
    const kchnX = -W/2 + 0.4 + kchnW/2;
    const kchnZ = D/2 - 0.4 - kchnD/2;
    // Counter top (cedar)
    const counter = box(kchnW, 0.04, kchnD, MATS.cedarLite);
    counter.position.set(kchnX, FL + kchnH, kchnZ);
    tagItem(counter, 'kitchen_counter', kchnW);
    g.add(counter);
    // Cabinet body
    const cab = box(kchnW, kchnH, kchnD - 0.05, MATS.cedar);
    cab.position.set(kchnX, FL + kchnH/2, kchnZ);
    g.add(cab);
    // Sink (recessed steel)
    const sink = box(0.55, 0.04, 0.42, new THREE.MeshStandardMaterial({color: 0xc6c6c6, roughness: 0.3, metalness: 0.7}));
    sink.position.set(kchnX + 0.3, FL + kchnH + 0.005, kchnZ);
    g.add(sink);
    // Faucet (thin chrome arc)
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.30, 8), new THREE.MeshStandardMaterial({color: 0xc8c8c8, roughness: 0.2, metalness: 0.85}));
    faucet.position.set(kchnX + 0.3, FL + kchnH + 0.15, kchnZ - kchnD/2 + 0.05);
    g.add(faucet);
  }

  // ── Dining table (for area > 24m²) ──
  if (area > 24 && !plan.openings?.units) {
    const tlW = Math.min(W * 0.35, 2.2);
    const tlD = Math.min(D * 0.18, 0.95);
    const tlH = 0.74;
    // Table top (cedar)
    const top = box(tlW, 0.04, tlD, MATS.cedarLite);
    top.position.set(0, FL + tlH, 0);
    tagItem(top, 'dining_set', 1);
    g.add(top);
    // Legs (4)
    for (const lx of [-tlW/2 + 0.10, tlW/2 - 0.10]) {
      for (const lz of [-tlD/2 + 0.10, tlD/2 - 0.10]) {
        const leg = box(0.05, tlH, 0.05, MATS.cedar);
        leg.position.set(lx, FL + tlH/2, lz);
        g.add(leg);
      }
    }
    // Chairs (2-4 depending on size)
    const chairCnt = Math.min(Math.floor(tlW / 0.55), 4);
    for (let i = 0; i < chairCnt; i++) {
      const cx = -tlW/2 + (i + 0.5) * (tlW / chairCnt);
      for (const cz of [-tlD/2 - 0.45, tlD/2 + 0.45]) {
        const seat = box(0.40, 0.04, 0.40, MATS.cedar);
        seat.position.set(cx, FL + 0.45, cz);
        g.add(seat);
        // Backrest
        const back = box(0.40, 0.40, 0.04, MATS.cedar);
        back.position.set(cx, FL + 0.65, cz + (cz > 0 ? 0.18 : -0.18));
        g.add(back);
        // Legs
        for (const lx of [-0.18, 0.18]) {
          for (const lzo of [-0.18, 0.18]) {
            const leg = box(0.03, 0.45, 0.03, MATS.cedar);
            leg.position.set(cx + lx, FL + 0.225, cz + lzo);
            g.add(leg);
          }
        }
      }
    }
  }

  // ── Toilet booth (compost toilet enclosure) ──
  if (area > 14 && !plan.openings?.units) {
    const bW = 0.95, bD = 1.20, bH = 2.05;
    const bX = W/2 - 0.5 - bW/2;
    const bZ = -D/2 + 0.5 + bD/2;
    // Walls (3 sides + opening on north)
    const wt = 0.04;
    const walls = [
      {w: bW, h: bH, d: wt, x: bX, y: FL + bH/2, z: bZ + bD/2 - wt/2}, // back
      {w: wt, h: bH, d: bD, x: bX - bW/2 + wt/2, y: FL + bH/2, z: bZ}, // left
      {w: wt, h: bH, d: bD, x: bX + bW/2 - wt/2, y: FL + bH/2, z: bZ}, // right
    ];
    for (const w of walls) {
      const m = box(w.w, w.h, w.d, MATS.cedar);
      m.position.set(w.x, w.y, w.z);
      g.add(m);
    }
    // Toilet seat (Separett style)
    const toilet = box(0.40, 0.50, 0.55, new THREE.MeshStandardMaterial({color: 0xe8e3d8, roughness: 0.6}));
    toilet.position.set(bX, FL + 0.25, bZ + 0.10);
    g.add(toilet);
  }

  return g;
}

// ========= Human scale figure (180cm) =========
function buildHumanScale(plan) {
  const g = group('scale');
  const W = plan.W * MM, D = plan.D * MM;
  const baseY = plan.pilotis ? 2.4 + FL_OFFSET : 0;
  // Standing figure as cylinder body + sphere head
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 1.50, 12), MATS.human);
  body.position.set(W/2 + 1.2, baseY + 0.75, D/2 + 1.2);
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), MATS.human);
  head.position.set(W/2 + 1.2, baseY + 1.65, D/2 + 1.2);
  g.add(head);
  return g;
}

// Main builder
export function buildPlan(planId) {
  const plan = PLANS[planId];
  if (!plan) throw new Error('Unknown plan: ' + planId);
  plan.id = planId;
  buildMaterials();

  const root = group('plan_' + planId);
  const groups = {
    foundation: buildFoundation(plan),
    structure:  buildStructure(plan),
    sips:       buildSIPs(plan),
    roof:       buildRoof(plan),
    openings:   group('openings'),
    solar:      buildSolar(plan),
    deck:       buildDeck(plan),
    equipment:  buildEquipment(plan),
    interior:   buildInterior(plan),
    scale:      buildHumanScale(plan),
    dims:       buildDimensions(plan),
  };
  for (const name of Object.keys(groups)) {
    groups[name].name = name;
    root.add(groups[name]);
  }
  return {root, plan, groups};
}

// ========= Viewer =========
export function createViewer(container, opts = {}) {
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // CSS2D for dim labels
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.left = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(labelRenderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.bg ?? COLORS.bg);
  scene.fog = new THREE.Fog(opts.bg ?? COLORS.bg, 80, 320);

  // ── Sky environment (procedural sky w/ sun) for realistic reflections ──
  const sky = new Sky();
  sky.scale.setScalar(1000);
  const skyU = sky.material.uniforms;
  skyU.turbidity.value = 4;
  skyU.rayleigh.value = 1.5;
  skyU.mieCoefficient.value = 0.004;
  skyU.mieDirectionalG.value = 0.7;
  // Sun position (winter Hokkaido morning, ~10am)
  const sunPos = new THREE.Vector3();
  const phi = THREE.MathUtils.degToRad(90 - 28);     // sun elevation 28° (winter)
  const theta = THREE.MathUtils.degToRad(155);        // azimuth from south
  sunPos.setFromSphericalCoords(1, phi, theta);
  skyU.sunPosition.value.copy(sunPos);
  scene.add(sky);

  // ── PBR environment from sky ──
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(sky, 0.04).texture;
  scene.environmentIntensity = 0.6;

  // ── Ground (snow + ground texture) ──
  const groundMat = new THREE.MeshStandardMaterial({color: COLORS.ground, roughness: 1});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.30;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Snow patches (random) ──
  const snowGroup = new THREE.Group();
  snowGroup.name = 'env_snow';
  const snowMat = new THREE.MeshStandardMaterial({color: 0xf5f3ee, roughness: 1, metalness: 0});
  for (let i = 0; i < 24; i++) {
    const r = 1.5 + Math.random() * 4;
    const patch = new THREE.Mesh(new THREE.CircleGeometry(r, 16), snowMat);
    patch.rotation.x = -Math.PI / 2;
    const angle = Math.random() * Math.PI * 2;
    const dist = 12 + Math.random() * 60;
    patch.position.set(Math.cos(angle) * dist, -0.29, Math.sin(angle) * dist);
    patch.scale.set(1 + Math.random() * 0.5, 1, 0.7 + Math.random() * 0.5);
    patch.receiveShadow = true;
    snowGroup.add(patch);
  }
  scene.add(snowGroup);

  // ── Cedar trees (low-poly) — instanced cones + trunks ──
  const treeGroup = new THREE.Group();
  treeGroup.name = 'env_trees';
  const trunkMat = new THREE.MeshStandardMaterial({color: 0x4a3624, roughness: 1});
  const conifMat = new THREE.MeshStandardMaterial({color: 0x2e3f24, roughness: 0.95});
  const conifMatLite = new THREE.MeshStandardMaterial({color: 0x435a30, roughness: 0.95});
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2 + Math.random() * 0.3;
    const dist = 25 + Math.random() * 60;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const tH = 5 + Math.random() * 9;
    const tR = 0.6 + Math.random() * 0.8;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, tH * 0.25, 6), trunkMat);
    trunk.position.set(x, -0.30 + tH * 0.125, z);
    treeGroup.add(trunk);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(tR, tH, 7), Math.random() < 0.5 ? conifMat : conifMatLite);
    cone.position.set(x, -0.30 + tH * 0.5, z);
    cone.castShadow = true;
    treeGroup.add(cone);
  }
  scene.add(treeGroup);

  // Grid (0.91m =  SIPs panel module)
  const grid = new THREE.GridHelper(300, 330, 0x99928a, 0xc0baad);
  grid.position.y = -0.295;
  grid.material.transparent = true;
  grid.material.opacity = 0.20;
  scene.add(grid);

  // Lights — sun position matches sky's sun
  const hemi = new THREE.HemisphereLight(0xb8d4f0, 0xb0a99a, 0.45);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d8, 2.2);
  sun.position.copy(sunPos).multiplyScalar(50);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 200;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.05, 500);
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.08;
  orbitControls.minDistance = 3;
  orbitControls.maxDistance = 150;
  orbitControls.maxPolarAngle = Math.PI * 0.495;
  let controls = orbitControls;

  // Pointer-lock first-person walking controls (for interior mode)
  const fpControls = new PointerLockControls(camera, renderer.domElement);
  let interiorMode = false;
  const moveState = {forward: 0, right: 0, up: 0};
  const moveSpeed = 2.4;       // m/s
  let lastTime = performance.now();

  function onKey(down) {
    return (e) => {
      if (!interiorMode) return;
      const k = e.code;
      const v = down ? 1 : 0;
      if (k === 'KeyW' || k === 'ArrowUp')   moveState.forward = down ? 1 : 0;
      if (k === 'KeyS' || k === 'ArrowDown') moveState.forward = down ? -1 : 0;
      if (k === 'KeyD' || k === 'ArrowRight')moveState.right = down ? 1 : 0;
      if (k === 'KeyA' || k === 'ArrowLeft') moveState.right = down ? -1 : 0;
      if (k === 'KeyQ')                       moveState.up = down ? -1 : 0;
      if (k === 'KeyE' || k === 'Space')      moveState.up = down ? 1 : 0;
      if (k === 'Escape' && interiorMode)     setInteriorMode(false);
    };
  }
  document.addEventListener('keydown', onKey(true));
  document.addEventListener('keyup',   onKey(false));

  let currentRoot = null;
  let currentPlan = null;
  let currentGroups = null;

  function loadPlan(id) {
    if (currentRoot) {
      // Clean labels
      currentRoot.traverse(o => { if (o.element && o.element.parentNode) o.element.parentNode.removeChild(o.element); });
      scene.remove(currentRoot);
    }
    const {root, plan, groups} = buildPlan(id);
    currentRoot = root;
    currentPlan = plan;
    currentGroups = groups;
    root.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    scene.add(root);
    fitCamera();
    return {plan, groups};
  }

  function fitCamera() {
    if (!currentPlan) return;
    const W = currentPlan.W * MM, D = currentPlan.D * MM;
    const stories = currentPlan.stories || 1;
    const H = (currentPlan.H || 3000) * MM * stories + (currentPlan.pilotis ? 2.4 : 0) + FL_OFFSET;
    const pitch = currentPlan.roofPitch || 0.25;
    const ridgeH = currentPlan.dome ? Math.max(W,D)/2*0.95 : (currentPlan.roofType === 'gable' ? (D/2 + EAVE_OUT) * pitch : 0.45);
    const totalH = H + ridgeH;
    const widest = Math.max(W + EAVE_OUT*2, D + EAVE_OUT*2);
    // Fit: distance proportional to building's largest extent + height contribution
    const fov = camera.fov * Math.PI / 180;
    const dHoriz = (widest * 1.55) / (2 * Math.tan(fov / 2));
    const dVert  = (totalH * 1.45) / (2 * Math.tan(fov / 2));
    const r = Math.max(dHoriz, dVert) * 1.05;
    camera.position.set(r * 0.65, r * 0.45, r * 0.65);
    controls.target.set(0, totalH * 0.42, 0);
    controls.update();
  }

  function setLayer(name, visible) {
    if (!currentGroups || !currentGroups[name]) return;
    currentGroups[name].visible = visible;
  }

  // X-ray mode: make outer cladding (sips, roof) translucent so structure visible
  function setXray(on) {
    if (!currentGroups) return;
    const opa = on ? 0.18 : 1.0;
    for (const layerName of ['sips', 'roof']) {
      const grp = currentGroups[layerName];
      if (!grp) continue;
      grp.traverse(o => {
        if (o.isMesh && o.material) {
          if (Array.isArray(o.material)) {
            o.material.forEach(m => { m.transparent = on; m.opacity = on ? opa : 1; m.depthWrite = !on; });
          } else {
            o.material.transparent = on;
            o.material.opacity = on ? opa : 1;
            o.material.depthWrite = !on;
          }
        }
      });
    }
  }

  function setView(view) {
    if (!currentPlan) return;
    const W = currentPlan.W * MM, D = currentPlan.D * MM;
    const stories = currentPlan.stories || 1;
    const H = (currentPlan.H || 3000) * MM * stories + (currentPlan.pilotis ? 2.4 : 0) + FL_OFFSET;
    const pitch = currentPlan.roofPitch || 0.25;
    const ridgeH = currentPlan.dome ? Math.max(W,D)/2*0.95 : (currentPlan.roofType === 'gable' ? (D/2 + EAVE_OUT) * pitch : 0.45);
    const totalH = H + ridgeH;
    const widest = Math.max(W + EAVE_OUT*2, D + EAVE_OUT*2);
    const fov = camera.fov * Math.PI / 180;
    const dist = Math.max(widest * 1.55, totalH * 1.45) / (2 * Math.tan(fov / 2)) * 1.1;
    if (view === 'iso')        camera.position.set(dist * 0.65, dist * 0.45, dist * 0.65);
    else if (view === 'front') camera.position.set(0, totalH * 0.55, dist * 0.95);
    else if (view === 'side')  camera.position.set(dist * 0.95, totalH * 0.55, 0);
    else if (view === 'top')   camera.position.set(0.001, dist * 1.1, 0.001);
    controls.target.set(0, totalH * 0.42, 0);
    controls.update();
  }

  function render() {
    requestAnimationFrame(render);
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    if (interiorMode && fpControls.isLocked) {
      // WASD movement
      const front = new THREE.Vector3();
      camera.getWorldDirection(front);
      front.y = 0; front.normalize();
      const right = new THREE.Vector3().crossVectors(front, new THREE.Vector3(0, 1, 0));
      const dx = front.clone().multiplyScalar(moveState.forward * moveSpeed * dt)
        .add(right.multiplyScalar(moveState.right * moveSpeed * dt));
      camera.position.add(dx);
      camera.position.y += moveState.up * moveSpeed * dt;
    } else if (controls.update) {
      controls.update();
    }
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
  render();

  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    labelRenderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Apply color preset and rebuild current plan
  function applyPreset(presetKey) {
    const preset = COLOR_PRESETS[presetKey];
    if (!preset) return;
    applyOverrides(preset);
  }

  // Apply arbitrary color overrides (custom picker)
  function applyOverrides(overrides) {
    applyColors(overrides);
    if (overrides.ground) groundMat.color.setHex(COLORS.ground);
    if (overrides.bg) {
      scene.background = new THREE.Color(COLORS.bg);
      scene.fog = new THREE.Fog(scene.background.getHex(), 80, 320);
    }
    if (currentPlan) loadPlan(currentPlan.id);
  }

  // Toggle environment props (trees + snow)
  function setEnvironment(visible) {
    snowGroup.visible = visible;
    treeGroup.visible = visible;
  }

  // Interior walk-around mode
  function setInteriorMode(on) {
    interiorMode = on;
    if (on) {
      orbitControls.enabled = false;
      // Place camera inside building at eye height (1.6m)
      if (currentPlan) {
        const baseY = currentPlan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;
        camera.position.set(0, baseY + 1.6, currentPlan.D * MM * 0.25);
        camera.lookAt(0, baseY + 1.6, currentPlan.D * MM * -0.25);
      }
      controls = fpControls;
      fpControls.lock();
      // Make outer cladding semi-transparent so interior is visible
      setXrayInternal(true, 0.08);
    } else {
      fpControls.unlock();
      orbitControls.enabled = true;
      controls = orbitControls;
      setXrayInternal(false);
      fitCamera();
    }
  }

  // Internal x-ray (for interior mode auto)
  function setXrayInternal(on, opacity) {
    if (!currentGroups) return;
    const opa = opacity ?? 0.18;
    for (const layerName of ['sips', 'roof']) {
      const grp = currentGroups[layerName];
      if (!grp) continue;
      grp.traverse(o => {
        if (o.isMesh && o.material) {
          if (Array.isArray(o.material)) {
            o.material.forEach(m => { m.transparent = on; m.opacity = on ? opa : 1; m.depthWrite = !on; m.side = on ? THREE.DoubleSide : THREE.FrontSide; });
          } else {
            o.material.transparent = on;
            o.material.opacity = on ? opa : 1;
            o.material.depthWrite = !on;
            o.material.side = on ? THREE.DoubleSide : THREE.FrontSide;
          }
        }
      });
    }
  }

  function isInteriorMode() { return interiorMode; }

  // ── BIM Click → spec/price popup (raycaster) ──
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let onClickCallback = null;

  function onCanvasClick(ev) {
    if (interiorMode) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (!currentRoot) return;
    const hits = raycaster.intersectObjects(currentRoot.children, true);
    for (const hit of hits) {
      let obj = hit.object;
      while (obj && !obj.userData?.bim) obj = obj.parent;
      if (obj && obj.userData?.bim) {
        if (onClickCallback) onClickCallback({...obj.userData.bim, point: hit.point, mesh: obj});
        return;
      }
    }
    if (onClickCallback) onClickCallback(null);
  }
  renderer.domElement.addEventListener('click', onCanvasClick);

  function onElementClick(cb) { onClickCallback = cb; }

  // ── Quantity Takeoff (3D BOM aggregation) ──
  function takeoff() {
    if (!currentRoot) return [];
    const totals = {};
    currentRoot.traverse(o => {
      const bim = o.userData?.bim;
      if (!bim) return;
      const id = bim.itemId;
      if (!totals[id]) {
        totals[id] = {
          itemId: id, ...bim.item,
          qty: 0, cost: 0, count: 0,
        };
      }
      totals[id].qty += bim.qty;
      totals[id].cost += bim.cost;
      totals[id].count += 1;
    });
    return Object.values(totals).sort((a, b) => a.phase - b.phase || (b.cost - a.cost));
  }

  // ── 4D Construction sequence animation ──
  // Phase mapping → group visibility
  // 1: site (env), 2: foundation, 3: structure, 4: sips (envelope), 5: roof, 6: openings, 7: equipment+solar+deck, 8: interior
  const PHASES = [
    {id: 1, name: '敷地', layers: []},
    {id: 2, name: '基礎工事', layers: ['foundation']},
    {id: 3, name: '構造躯体', layers: ['structure']},
    {id: 4, name: 'SIPs外皮', layers: ['sips']},
    {id: 5, name: '屋根', layers: ['roof']},
    {id: 6, name: '開口部', layers: ['openings']},
    {id: 7, name: '設備・太陽光', layers: ['equipment', 'solar']},
    {id: 8, name: 'デッキ・外構', layers: ['deck']},
    {id: 9, name: '内装家具', layers: ['interior']},
  ];
  let currentPhase = PHASES.length;     // all visible by default

  function setPhase(phaseIdx) {
    if (!currentGroups) return;
    currentPhase = phaseIdx;
    // Hide everything visible-by-default first
    for (const layerName of ['foundation','structure','sips','roof','openings','solar','deck','equipment','interior']) {
      if (currentGroups[layerName]) currentGroups[layerName].visible = false;
    }
    // Show layers up through phaseIdx
    for (let i = 0; i < phaseIdx && i < PHASES.length; i++) {
      for (const ln of PHASES[i].layers) {
        if (currentGroups[ln]) currentGroups[ln].visible = true;
      }
    }
  }

  function playConstructionSequence(onPhaseChange, stepMs = 800) {
    return new Promise((resolve) => {
      let i = 0;
      function step() {
        setPhase(i + 1);
        if (onPhaseChange) onPhaseChange(i + 1, PHASES[i]);
        i++;
        if (i < PHASES.length) {
          setTimeout(step, stepMs);
        } else {
          resolve();
        }
      }
      step();
    });
  }

  function getPhases() { return PHASES; }

  // ── 諸経費・労務費自動計算 ──
  function softCosts() {
    const items = takeoff();
    const matTotal = items.reduce((s, r) => s + r.cost, 0);
    const breakdown = [];
    let total = matTotal;
    for (const [k, c] of Object.entries(COST_COEFS)) {
      const cost = c.pct ? matTotal * c.pct : (c.fixed || 0);
      breakdown.push({key: k, label: c.label, note: c.note, cost});
      total += cost;
    }
    return {matTotal, breakdown, grandTotal: total};
  }

  // ── UA値計算 (envelope thermal performance) ──
  function uaValue() {
    const items = takeoff();
    let totalArea = 0, sumUA = 0;
    const elements = [];
    for (const r of items) {
      const u = U_VALUES[r.itemId];
      if (!u) continue;
      // Use qty as area for elements measured in m²
      let area = r.qty;
      if (r.unit === '枚') area = area * 2.0;        // approx panel size for windows
      if (r.unit === '本' || r.unit === '式' || r.unit === '本') continue;
      totalArea += area;
      sumUA += u.U * area;
      elements.push({label: u.label, U: u.U, area, contribution: u.U * area});
    }
    const UA = totalArea > 0 ? sumUA / totalArea : 0;
    // Heat20 zoning: G3<0.20, G2<0.28, G1<0.34, ZEH<0.40, H28<0.46
    let grade = 'H28準拠';
    if (UA <= 0.20) grade = 'HEAT20 G3 (NZEB水準)';
    else if (UA <= 0.28) grade = 'HEAT20 G2 (高断熱)';
    else if (UA <= 0.34) grade = 'HEAT20 G1 (高水準)';
    else if (UA <= 0.40) grade = 'ZEH 水準';
    return {UA, totalArea, elements, grade};
  }

  // ── 年間PV発電量計算 (kWh/year) ──
  // 弟子屈の月別水平面日射量 (NEDO MONSOLA-11, MJ/m²/day)
  // 北海道道東・道北エリアの代表値
  function pvEstimate() {
    const items = takeoff();
    const pv = items.find(r => r.itemId === 'pv_panel');
    if (!pv) return null;
    const panelCount = pv.count;
    const wattPerPanel = 400;                    // 400W
    const totalKW = panelCount * wattPerPanel / 1000;
    // Hokkaido east monthly insolation (MJ/m²/day, source: NEDO 2024)
    const monthlyMJ = [9.0, 11.5, 14.5, 16.0, 17.0, 16.5, 15.5, 15.0, 13.5, 11.0, 8.5, 7.5];
    const days = [31,28,31,30,31,30,31,31,30,31,30,31];
    const tilt = (currentPlan && !currentPlan.dome && currentPlan.roofType === 'gable') ? 0.95 : 0.85; // tilt factor
    const efficiency = 0.78;                     // PCS + cable + soil
    const monthly = monthlyMJ.map((mj, i) => {
      // MJ/m²/day → kWh/m²/day → kWh per panel (1.95 m²) → totalKW
      const kWhPerKWday = mj / 3.6 * tilt * efficiency;       // PR factor
      return kWhPerKWday * totalKW * days[i];
    });
    const annualKWh = monthly.reduce((s, m) => s + m, 0);
    const tariff = 35;                           // ¥/kWh self-consumption
    return {panelCount, totalKW, monthly, annualKWh, annualValue: annualKWh * tariff, tariff};
  }

  // ── 日影アニメ: 冬至・春分・夏至の太陽軌道を時間軸で再生 ──
  function playSunCycle(season = 'winter', durationMs = 8000, onTick) {
    const seasons = {
      winter: 12,        // Dec
      spring: 3,         // Mar
      summer: 6,         // Jun
      autumn: 9,         // Sep
    };
    const month = seasons[season] || 3;
    const start = performance.now();
    const startHour = 6, endHour = 18;
    return new Promise(resolve => {
      function tick() {
        const t = (performance.now() - start) / durationMs;
        const hour = startHour + t * (endHour - startHour);
        if (t >= 1) {
          setSunPosition(12, month);
          if (onTick) onTick({hour: 12, month, done: true});
          return resolve();
        }
        const r = setSunPosition(hour, month);
        if (onTick) onTick({hour, month, elev: r.elev, azim: r.azim});
        requestAnimationFrame(tick);
      }
      tick();
    });
  }

  // ── 太陽位置を時刻・季節で更新 ──
  function setSunPosition(hour, month) {
    // Simplified: latitude 43.5 (Teshikaga), declination by month
    const lat = 43.5 * Math.PI / 180;
    const declination = 23.45 * Math.sin(2 * Math.PI * (284 + (month * 30 + 15)) / 365) * Math.PI / 180;
    const hourAngle = (hour - 12) * 15 * Math.PI / 180;
    // Sun elevation
    const elev = Math.asin(Math.sin(lat)*Math.sin(declination) + Math.cos(lat)*Math.cos(declination)*Math.cos(hourAngle));
    // Sun azimuth (from south, positive west)
    const azim = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle)*Math.sin(lat) - Math.tan(declination)*Math.cos(lat)
    );
    const sunDir = new THREE.Vector3(
      Math.sin(azim) * Math.cos(elev),
      Math.sin(elev),
      -Math.cos(azim) * Math.cos(elev)
    );
    sun.position.copy(sunDir).multiplyScalar(60);
    skyU.sunPosition.value.copy(sunDir);
    // Update environment from sky
    scene.environment = pmrem.fromScene(sky, 0.04).texture;
    // Adjust ambient/exposure based on sun height
    const dayAmount = Math.max(0, Math.sin(elev));
    sun.intensity = 0.3 + dayAmount * 1.9;
    hemi.intensity = 0.15 + dayAmount * 0.40;
    renderer.toneMappingExposure = 0.55 + dayAmount * 0.45;
    return {elev: elev * 180 / Math.PI, azim: azim * 180 / Math.PI};
  }

  return {
    scene, camera, renderer,
    get controls() { return controls; },
    loadPlan, setLayer, setView, setXray, fitCamera,
    applyPreset, applyOverrides, setEnvironment,
    setInteriorMode, isInteriorMode,
    onElementClick, takeoff, softCosts, uaValue, setPhase, playConstructionSequence, getPhases,
    setSunPosition, pvEstimate, playSunCycle,
    getPlan: () => currentPlan,
  };
}
