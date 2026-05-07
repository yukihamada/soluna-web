// SOLUNA DOJO Viewer — U-shape multi-volume SIPs building (container-style stacks)
// Three.js 0.160 (ES module). Loaded by /dojo.html
// 3 wings (West/East/North) form a U around a south-facing courtyard with sail canopy.
// Built with SIPs panels (not containers) but visually echo container module proportions.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// ── PLANS — U-shape DOJO with module-based SIPs stacks ──
// 法規対応:
//  - 木造SIPsの安全高さ上限: 3階(地上11m以下)。4階以上は鉄骨ハイブリッドフレーム必要
//  - 各棟に階段室必須・2方向避難 (居室→階段歩行距離≦50m)
//  - 北棟中央にエレベーター塔 (3階以上)
export const PLANS = {
  dojo_s: {
    W: 18000, D: 14000, wingD: 4000, backD: 4000, modW: 6000, modH: 2700,
    sideStories: 2, backStories: 2,
    name: 'DOJO S',
    label: '120㎡ + 中庭60㎡',
    tag: '弟子屈の道場・小規模リトリート',
    sail: true, hasElevator: false,
  },
  dojo_m: {
    W: 24000, D: 18000, wingD: 5000, backD: 5000, modW: 6000, modH: 3300,
    sideStories: 1, backStories: 1,
    name: 'DOJO M',
    label: '250㎡ + 中庭120㎡ (平屋)',
    tag: '平屋ワンフロア / 道場・リトリート',
    sail: true, hasElevator: false,
  },
  dojo_l: {
    W: 32000, D: 24000, wingD: 6000, backD: 6000, modW: 6000, modH: 2700,
    sideStories: 3, backStories: 3,
    name: 'DOJO L',
    label: '430㎡ + 中庭240㎡',
    tag: '本格 道場 / 合宿施設',
    sail: true, hasElevator: true,
  },
  // XL は 3階上限に変更 (法規対応・SIPs+鉄骨ハイブリッド)
  dojo_xl: {
    W: 40000, D: 30000, wingD: 6000, backD: 7200, modW: 6000, modH: 2700,
    sideStories: 3, backStories: 3,         // ← 4階 → 3階 (法規対応)
    name: 'DOJO XL',
    label: '600㎡ + 中庭420㎡',
    tag: '大型カンファレンス / リゾート',
    sail: true, hasElevator: true,
  },
};

const MM = 0.001;
const FL_OFFSET = 0.40;        // GL→FL 400mm (frost depth)
const EAVE_OUT  = 0.70;
const PANEL_W   = 0.910;       // SIPs module
const SASH_T    = 0.045;

// ── Colors / materials ──
const COLORS = {
  bg: 0xeeece6, ground: 0xe8e6dc,
  foundation: 0x6a625a,
  steel: 0xfafaf6,           // white SIPs cladding (container-style)
  steelDark: 0x1c1c1c,       // black sash frames
  sash: 0x202020,
  cedar: 0x9c8260,
  cedarLite: 0xb89968,
  glass: 0xc8d4dc,
  human: 0xd4caa8,
  line: 0x5a5a5a,
  dim: 0x707070,
  sailFabric: 0xf6f3ec,
};

const TEX_CACHE = {};
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// White corrugated module facade — emulates container ribs without being container
function texModule() {
  if (TEX_CACHE.module) return TEX_CACHE.module;
  const c = makeCanvas(512, 512);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fafaf6';
  ctx.fillRect(0, 0, 512, 512);
  // Vertical ribs every ~30px (180mm) — corrugation
  for (let x = 0; x < 512; x += 12) {
    ctx.fillStyle = `rgba(${180+Math.sin(x*0.13)*30},${180+Math.sin(x*0.13)*30},${175+Math.sin(x*0.13)*30},0.18)`;
    ctx.fillRect(x, 0, 6, 512);
  }
  // Module seam (every 256px = 6m at scale)
  ctx.strokeStyle = 'rgba(60,60,60,0.7)';
  ctx.lineWidth = 1.4;
  for (let x = 0; x < 512; x += 256) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  // Horizontal floor seam every 230px = 2.7m
  for (let y = 0; y < 512; y += 230) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }
  // Subtle weathering
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(180,178,172,${0.15+Math.random()*0.1})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  TEX_CACHE.module = tex;
  return tex;
}

function texCedarDeck() {
  if (TEX_CACHE.deck) return TEX_CACHE.deck;
  const c = makeCanvas(512, 512);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9c8260';
  ctx.fillRect(0, 0, 512, 512);
  // Plank seams (every 145px = 145mm)
  ctx.strokeStyle = 'rgba(40,28,18,0.6)';
  ctx.lineWidth = 1.2;
  for (let x = 145; x < 512; x += 145) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  // Grain
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(${70+Math.random()*40},${50+Math.random()*30},${30+Math.random()*20},0.2)`;
    ctx.fillRect(Math.random() * 512, 0, 0.5 + Math.random() * 1.5, 512);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  TEX_CACHE.deck = tex;
  return tex;
}

const MATS = {};
function buildMaterials() {
  const moduleMap = texModule();
  moduleMap.repeat.set(1, 1);
  const deckMap = texCedarDeck();
  deckMap.repeat.set(4, 4);

  MATS.foundation = new THREE.MeshStandardMaterial({color: COLORS.foundation, roughness: 0.95});
  MATS.module = new THREE.MeshStandardMaterial({
    color: COLORS.steel, map: moduleMap.clone(), roughness: 0.55, metalness: 0.15,
    envMapIntensity: 0.95,
  });
  MATS.module.map.repeat.set(2, 1);
  MATS.module.map.wrapS = MATS.module.map.wrapT = THREE.RepeatWrapping;
  MATS.dark = new THREE.MeshStandardMaterial({color: COLORS.steelDark, roughness: 0.5, metalness: 0.4});
  MATS.sash = new THREE.MeshStandardMaterial({color: COLORS.sash, roughness: 0.4, metalness: 0.6});
  MATS.glass = new THREE.MeshPhysicalMaterial({
    color: COLORS.glass, roughness: 0.04, metalness: 0,
    transmission: 0.92, transparent: true, opacity: 0.55,
    ior: 1.5, thickness: 0.018, envMapIntensity: 1.5,
    clearcoat: 0.7, clearcoatRoughness: 0.04,
  });
  MATS.cedar = new THREE.MeshStandardMaterial({color: COLORS.cedar, roughness: 0.85});
  MATS.cedarLite = new THREE.MeshStandardMaterial({color: COLORS.cedarLite, roughness: 0.85});
  MATS.deck = new THREE.MeshStandardMaterial({color: COLORS.cedar, map: deckMap, roughness: 0.88});
  MATS.sail = new THREE.MeshStandardMaterial({
    color: COLORS.sailFabric, roughness: 0.85, metalness: 0,
    side: THREE.DoubleSide, transparent: true, opacity: 0.92,
  });
  MATS.human = new THREE.MeshStandardMaterial({color: COLORS.human, roughness: 0.9});
}

function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function group(name) { const g = new THREE.Group(); g.name = name; return g; }
function edge(mesh, color = 0x4a4a4a, opacity = 0.45) {
  const e = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({color, transparent: true, opacity}),
  );
  e.position.copy(mesh.position);
  e.rotation.copy(mesh.rotation);
  e.scale.copy(mesh.scale);
  return e;
}

// ── Build a single wing (rectangular SIPs stack) with module grid + window openings ──
function buildWing(g, {x, z, w, d, stories, modH, withRoofDeck, monoRoof, label}) {
  const baseY = FL_OFFSET;
  const totalH = stories * modH;
  // Body
  const body = box(w, totalH, d, MATS.module);
  body.position.set(x, baseY + totalH/2, z);
  g.add(body);
  g.add(edge(body, COLORS.line, 0.55));

  // Floor lines (visual seams between stacked modules)
  for (let s = 1; s < stories; s++) {
    const seam = box(w + 0.04, 0.04, d + 0.04, MATS.dark);
    seam.position.set(x, baseY + s * modH, z);
    g.add(seam);
  }

  // Vertical module seams every modW (default 6m)
  const modW = 6;
  const segCnt = Math.max(1, Math.round(w / modW));
  for (let i = 1; i < segCnt; i++) {
    const sx = x - w/2 + i * (w / segCnt);
    const seam = box(0.04, totalH, d + 0.04, MATS.dark);
    seam.position.set(sx, baseY + totalH/2, z);
    g.add(seam);
  }

  // 通し柱 (continuous columns) at module corners — 3階以上は構造重要
  if (stories >= 3) {
    const colMat = new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.4, metalness: 0.6});
    // 4 corners + intermediate at module seams
    const xs = [-w/2 + 0.05, w/2 - 0.05];
    const zs = [-d/2 + 0.05, d/2 - 0.05];
    // Add intermediate corners along longer dimension
    for (let i = 1; i < segCnt; i++) {
      xs.push(-w/2 + i * (w / segCnt));
    }
    xs.forEach(cx => zs.forEach(cz => {
      const col = box(0.12, totalH, 0.12, colMat);
      col.position.set(x + cx, baseY + totalH/2, z + cz);
      g.add(col);
    }));
  }

  // Roof — 北海道の積雪対応 mono-pitch (1m積雪で平屋根は崩壊リスク)
  if (monoRoof) {
    // Mono-pitch roof: 北側 (背面) を高く、開放側を低く (snow shed)
    const pitch = 0.18;       // 10°
    const dropH = d * pitch;
    const tRoof = 0.10;
    const roofW = w + 0.40;
    const slope = Math.atan(pitch);
    const cosS = Math.cos(slope);
    const tVert = tRoof / cosS;
    const profile = new THREE.Shape();
    const south = d/2 + 0.20;
    const north = -d/2 - 0.20;
    profile.moveTo(north, dropH);
    profile.lineTo(south, 0);
    profile.lineTo(south, tVert);
    profile.lineTo(north, dropH + tVert);
    profile.closePath();
    const roofGeo = new THREE.ExtrudeGeometry(profile, {depth: roofW, bevelEnabled: false});
    const roof = new THREE.Mesh(roofGeo, MATS.dark);
    roof.rotation.y = -Math.PI / 2;
    roof.position.set(x + roofW/2, baseY + totalH, z);
    g.add(roof);
    g.add(edge(roof, COLORS.line, 0.4));
    // 雪止め (snow guard) — 緩勾配3段
    for (let i = 0; i < 3; i++) {
      const along = 0.5 + i * (Math.hypot(d + 0.4, dropH) / 4);
      const sg = box(w - 0.4, 0.04, 0.04, MATS.dark);
      sg.position.set(x, baseY + totalH + tVert + along * Math.sin(slope) - 0.02,
                     z + d/2 + 0.20 - along * cosS);
      sg.rotation.x = -slope;
      g.add(sg);
    }
  } else if (withRoofDeck) {
    // 屋上テラス + パラペット (低層棟は緩勾配mono不可なら屋上利用)
    const slab = box(w + 0.20, 0.10, d + 0.20, MATS.dark);
    slab.position.set(x, baseY + totalH + 0.05, z);
    g.add(slab);
    const pH = 0.40, pT = 0.08;
    const sides = [
      {w: w + 0.20, h: pH, d: pT, x: x, z: z + d/2 + 0.10 - pT/2},
      {w: w + 0.20, h: pH, d: pT, x: x, z: z - d/2 - 0.10 + pT/2},
      {w: pT, h: pH, d: d + 0.20 - pT*2, x: x + w/2 + 0.10 - pT/2, z: z},
      {w: pT, h: pH, d: d + 0.20 - pT*2, x: x - w/2 - 0.10 + pT/2, z: z},
    ];
    for (const s of sides) {
      const m = box(s.w, s.h, s.d, MATS.module);
      m.position.set(s.x, baseY + totalH + 0.10 + pH/2, s.z);
      g.add(m);
    }
    const deck = box(w - 0.30, 0.05, d - 0.30, MATS.deck);
    deck.position.set(x, baseY + totalH + 0.13, z);
    g.add(deck);
    const cushMat = new THREE.MeshStandardMaterial({color: 0xd0c8b8, roughness: 0.85});
    for (let cx = -0.5; cx <= 0.5; cx += 1.0) {
      const cushion = box(1.6, 0.32, 0.7, cushMat);
      cushion.position.set(x + cx * (w/2 - 1.5), baseY + totalH + 0.3, z + (cx > 0 ? -0.6 : 0.6));
      g.add(cushion);
    }
    for (let pz = -1; pz <= 1; pz += 2) {
      const planter = box(0.4, 0.4, 0.4, MATS.cedar);
      planter.position.set(x - w/2 + 0.6, baseY + totalH + 0.32, z + pz * (d/2 - 0.7));
      g.add(planter);
    }
    // Glass railing (中庭側のみ — 落雪対策で外周はパラペット高く)
    const glassR = box(w - 0.30, 1.0, 0.012, MATS.glass);
    glassR.position.set(x, baseY + totalH + 0.6, z + d/2 + 0.03);
    g.add(glassR);
    const lightMat = new THREE.MeshStandardMaterial({color: 0xfff2c0, emissive: 0xffe098, emissiveIntensity: 1.4});
    for (let lx = -w/2 + 0.5; lx < w/2; lx += 0.6) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), lightMat);
      bulb.position.set(x + lx, baseY + totalH + 1.05, z + d/2 + 0.03);
      g.add(bulb);
    }
    // 折り畳みオーニング (winter cover) — 屋上ソファの上に半分だけ
    const awningMat = new THREE.MeshStandardMaterial({color: 0x4a4a4a, roughness: 0.85, side: THREE.DoubleSide});
    const awning = box(w - 0.5, 0.04, d * 0.5, awningMat);
    awning.position.set(x, baseY + totalH + 1.6, z - d/4);
    g.add(awning);
    // 支柱
    for (const cz of [-d/4 + d/4, -d/4 - d/4]) {
      const post = box(0.05, 1.6, 0.05, MATS.dark);
      post.position.set(x - w/2 + 0.4, baseY + totalH + 0.8, z + cz);
      g.add(post);
    }
  } else {
    // Default flat (北棟向け mono-pitch なし用): パラペット付き flat
    const slab = box(w + 0.20, 0.10, d + 0.20, MATS.dark);
    slab.position.set(x, baseY + totalH + 0.05, z);
    g.add(slab);
    g.add(edge(slab, COLORS.line, 0.45));
  }
}

// ── 階段塔 (stair tower) ──
// 法規: 木造階段は不燃化処理、踊場必須。階段室は耐火区画で囲う
function buildStairTower(g, {x, z, w, d, stories, modH, exterior}) {
  const baseY = FL_OFFSET;
  const totalH = stories * modH;
  const matWall = exterior ? MATS.dark : MATS.module;
  // 階段室の外壁
  if (!exterior) {
    const shaft = box(w, totalH, d, matWall);
    shaft.position.set(x, baseY + totalH/2, z);
    g.add(shaft);
    g.add(edge(shaft, COLORS.line, 0.5));
  }
  // 階段の踏み板 (visual: 折返し階段)
  const stepW = w * 0.45, stepD = 0.28, stepH = modH / 14;       // 14段で1階分
  for (let s = 0; s < stories; s++) {
    const flightY = baseY + s * modH;
    // 上り (前半: x方向)
    for (let i = 0; i < 7; i++) {
      const tread = box(stepW, 0.04, stepD, MATS.cedar);
      tread.position.set(x - w/4, flightY + (i + 1) * stepH, z - d/2 + 0.5 + i * stepD);
      g.add(tread);
    }
    // 踊場
    const landing = box(w - 0.2, 0.06, d * 0.4, MATS.cedar);
    landing.position.set(x, flightY + 7 * stepH, z + 0.2);
    g.add(landing);
    // 下り (後半: 反対方向)
    for (let i = 0; i < 7; i++) {
      const tread = box(stepW, 0.04, stepD, MATS.cedar);
      tread.position.set(x + w/4, flightY + (i + 8) * stepH, z + 0.5 - i * stepD);
      g.add(tread);
    }
  }
  // 手すり (両側)
  const railMat = MATS.dark;
  for (const xs of [-w/4, w/4]) {
    const rail = box(0.04, 1.0, d - 0.4, railMat);
    rail.position.set(x + xs - (xs<0?stepW/2:-stepW/2)*0.5, baseY + totalH/2, z);
    g.add(rail);
  }
}

// ── エレベーター塔 (elevator shaft) ──
function buildElevator(g, {x, z, stories, modH}) {
  const baseY = FL_OFFSET;
  const totalH = stories * modH + 1.5;     // 機械室分+1.5m
  const carW = 1.6, carD = 1.8;
  const shaft = box(carW, totalH, carD, MATS.dark);
  shaft.position.set(x, baseY + totalH/2, z);
  g.add(shaft);
  g.add(edge(shaft, COLORS.line, 0.6));
  // EV 表示マーク
  const door = box(0.9, 2.0, 0.04, new THREE.MeshStandardMaterial({color: 0xc0c0c0, roughness: 0.4, metalness: 0.7}));
  door.position.set(x, baseY + 1.0, z + carD/2 + 0.025);
  g.add(door);
  // 機械室屋根
  const cap = box(carW + 0.2, 0.10, carD + 0.2, MATS.dark);
  cap.position.set(x, baseY + totalH + 0.05, z);
  g.add(cap);
}

// ── Add window cutouts (visual: dark box recessed) on a face ──
function addWindows(g, {x, z, w, d, stories, modH, side}) {
  // side: 'south'/'north'/'east'/'west' world direction the window faces
  const baseY = FL_OFFSET;
  const winW = 1.2, winH = 1.6;
  const sillH = 0.85;        // window sill above floor
  const innerOffset = 0.04;
  // 2 windows per module per story (W ≈ 6m / 2 = 3m spacing)
  const segCnt = Math.max(2, Math.round(w / 1.5));
  let placedFront = 0, placedSide = 0;
  for (let s = 0; s < stories; s++) {
    for (let i = 0; i < segCnt; i++) {
      const t = (i + 0.5) / segCnt - 0.5;             // -0.5..0.5
      let wx = 0, wz = 0, ry = 0, len = w;
      if (side === 'south') { wx = x + t * (w - 0.6); wz = z + d/2 + innerOffset; ry = 0; len = w; }
      else if (side === 'north') { wx = x + t * (w - 0.6); wz = z - d/2 - innerOffset; ry = 0; len = w; }
      else if (side === 'east')  { wx = x + d/2 + innerOffset; wz = z + t * (w - 0.6); ry = Math.PI/2; len = w; }
      else if (side === 'west')  { wx = x - d/2 - innerOffset; wz = z + t * (w - 0.6); ry = Math.PI/2; len = w; }
      const win = box(winW, winH, 0.04, MATS.glass);
      win.position.set(wx, baseY + s * modH + sillH + winH/2, wz);
      win.rotation.y = ry;
      g.add(win);
      // Black sash frame (thick, prominent)
      const fT = 0.08;
      const fO = 0.05;
      const top = box(winW + fO*2, fT, 0.06, MATS.sash);
      const bot = top.clone();
      const lft = box(fT, winH + fO*2, 0.06, MATS.sash);
      const rgt = lft.clone();
      [
        [top, 0, sillH + winH + fO/2],
        [bot, 0, sillH - fO/2],
        [lft, -winW/2 - fO/2, sillH + winH/2],
        [rgt,  winW/2 + fO/2, sillH + winH/2],
      ].forEach(([m, dx, dy]) => {
        m.position.set(wx + dx * (Math.cos(ry)), baseY + s * modH + dy, wz + dx * (-Math.sin(ry)));
        m.rotation.y = ry;
        g.add(m);
      });
      // Mullion (vertical center divider)
      const mul = box(0.04, winH, 0.04, MATS.sash);
      mul.position.set(wx, baseY + s * modH + sillH + winH/2, wz);
      mul.rotation.y = ry;
      g.add(mul);
    }
  }
}

// ── Sail canopy over the courtyard (tensioned fabric between corners) ──
function buildSail(g, plan, baseY) {
  const W = plan.W * MM, D = plan.D * MM;
  const wingD = plan.wingD * MM, backD = plan.backD * MM;
  // Anchor points (4 corners of the courtyard at high altitude)
  const sideH = baseY + plan.sideStories * plan.modH * MM + 0.5;
  const backH = baseY + plan.backStories * plan.modH * MM + 0.5;
  // Courtyard corners (inner edges of wings)
  const xLeft  = -W/2 + wingD;        // inner edge of west wing
  const xRight =  W/2 - wingD;        // inner edge of east wing
  const zNorth = -D/2 + backD;        // inner edge of back wing
  const zSouth =  D/2 - 0.2;          // open south end (slight inset)

  // 1 large triangular sail (sweeping from back-left high → south-right low → south-left low)
  // Use a quadrilateral patch as a tensioned membrane (subdivided plane that bends slightly)
  const seg = 8;
  const corners = [
    new THREE.Vector3(xLeft,  backH,           zNorth - 0.3),
    new THREE.Vector3(xRight, backH,           zNorth - 0.3),
    new THREE.Vector3(xRight, sideH - 0.5,     zSouth),
    new THREE.Vector3(xLeft,  sideH - 0.5,     zSouth),
  ];
  const geom = new THREE.PlaneGeometry(1, 1, seg, seg);
  // Map UV (u,v ∈ [0,1]) to bilinear interpolation between the 4 corners + slight catenary sag
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) + 0.5);     // 0..1 left-right
    const v = (pos.getY(i) + 0.5);     // 0..1 north-south
    // Bilinear corners: TL=corners[0], TR=corners[1], BR=corners[2], BL=corners[3]
    const top    = corners[0].clone().lerp(corners[1], u);
    const bottom = corners[3].clone().lerp(corners[2], u);
    const p = top.lerp(bottom, v);
    // Catenary sag (pull center down)
    const sag = -0.6 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    pos.setXYZ(i, p.x, p.y + sag, p.z);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  const sail = new THREE.Mesh(geom, MATS.sail);
  g.add(sail);

  // 南側アンカー — 風荷重対応 Φ150鋼管 + コンクリート墓石 (deadman)
  // 風速30m/s で 帆面に揚力 + 引張荷重 = 数十kN → 細いポールでは絶対不可
  for (const c of [corners[2], corners[3]]) {
    // メインポール Φ150 鋼管
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, c.y, 16), MATS.dark);
    pole.position.set(c.x, c.y / 2, c.z);
    g.add(pole);
    // ベース (コンクリ墓石 1m × 1m × 0.6m, 鉄筋アンカー埋設)
    const baseFoot = box(1.0, 0.6, 1.0,
      new THREE.MeshStandardMaterial({color: 0x6a625a, roughness: 0.95}));
    baseFoot.position.set(c.x, -0.05, c.z);
    g.add(baseFoot);
    g.add(edge(baseFoot, COLORS.line, 0.4));
    // 支線 (テンションロープ) — 北方向に控え
    const guy = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, Math.hypot(2, c.y), 6),
      new THREE.MeshStandardMaterial({color: 0x444444, roughness: 0.7, metalness: 0.5}),
    );
    const angle = Math.atan2(c.y, 2);
    guy.position.set(c.x, c.y / 2, c.z - 1);
    guy.rotation.x = Math.PI/2 - angle;
    g.add(guy);
    // 支線ベース (もう一つの墓石)
    const guyBase = box(0.6, 0.4, 0.6,
      new THREE.MeshStandardMaterial({color: 0x6a625a, roughness: 0.95}));
    guyBase.position.set(c.x, -0.10, c.z - 2);
    g.add(guyBase);
  }
  // String lights along sail edges
  const lightMat = new THREE.MeshStandardMaterial({color: 0xfff2c0, emissive: 0xffe098, emissiveIntensity: 1.5});
  for (let t = 0; t <= 1.001; t += 0.05) {
    const p = corners[3].clone().lerp(corners[0], t);     // west edge
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), lightMat);
    bulb.position.copy(p);
    g.add(bulb);
    const p2 = corners[2].clone().lerp(corners[1], t);    // east edge
    const bulb2 = bulb.clone();
    bulb2.position.copy(p2);
    g.add(bulb2);
  }
}

// ── Courtyard: 杉デッキ + 道場マット + 石舞台 + 用途ゾーニング ──
function buildCourtyard(g, plan) {
  const W = plan.W * MM, D = plan.D * MM;
  const wingD = plan.wingD * MM, backD = plan.backD * MM;
  const cyW = W - 2 * wingD;
  const cyD = D - backD;
  const cyZ = -D/2 + backD + cyD/2;
  const baseY = FL_OFFSET;

  // 杉デッキ (外周ゾーン: 縁側として使用)
  const deck = box(cyW - 0.2, 0.10, cyD - 0.2, MATS.deck);
  deck.position.set(0, baseY - 0.05, cyZ);
  g.add(deck);
  g.add(edge(deck, COLORS.line, 0.4));

  // 道場マット (青色タタミ風) — 中央 28.8㎡ (旧 dojo-story 仕様)
  const matW = Math.min(cyW * 0.6, 7.2);
  const matD = Math.min(cyD * 0.4, 4.0);
  const matMat = new THREE.MeshStandardMaterial({color: 0x2a4a78, roughness: 0.92});
  const tatami = box(matW, 0.05, matD, matMat);
  tatami.position.set(0, baseY + 0.01, cyZ + 0.5);
  g.add(tatami);
  // マットの目地 (1.8m × 0.9m パネルで分割)
  const matPanelW = 1.8, matPanelD = 0.9;
  const matCols = Math.floor(matW / matPanelW);
  const matRows = Math.floor(matD / matPanelD);
  for (let i = 1; i < matCols; i++) {
    const seam = box(0.02, 0.06, matD, MATS.dark);
    seam.position.set(-matW/2 + i * matPanelW, baseY + 0.04, cyZ + 0.5);
    g.add(seam);
  }
  for (let j = 1; j < matRows; j++) {
    const seam = box(matW, 0.06, 0.02, MATS.dark);
    seam.position.set(0, baseY + 0.04, cyZ + 0.5 - matD/2 + j * matPanelD);
    g.add(seam);
  }

  // 石舞台 (ステージ) — マットの北側 (北棟前)
  const stage = box(cyW * 0.35, 0.04, cyD * 0.20,
    new THREE.MeshStandardMaterial({color: 0xeeebe0, roughness: 0.9}));
  stage.position.set(0, baseY + 0.02, cyZ - cyD * 0.30);
  g.add(stage);

  // ── 基礎: 布基礎 + ベタ基礎 (4階建てSIPsスタックの荷重対応) ──
  // ベタ基礎 (slab on grade) under entire footprint
  const matFootMat = new THREE.MeshStandardMaterial({color: 0x6a625a, roughness: 0.95});
  const slab = box(W + 0.5, 0.30, D + 0.5, matFootMat);
  slab.position.set(0, -0.35, 0);
  g.add(slab);
  // 布基礎 (perimeter strip footing) — 各棟の下に
  const stripH = 0.85, stripT = 0.30;
  const wingX_W = -W/2 + wingD/2;
  const wingX_E =  W/2 - wingD/2;
  const backZ = -D/2 + backD/2;
  // 西棟下
  const wStrip = [
    {x: wingX_W, z: 0, w: wingD + 0.10, d: stripT},
    {x: wingX_W, z: D/2 - stripT/2 - 0.05, w: wingD + 0.10, d: stripT},
    {x: wingX_W, z: -D/2 + stripT/2 + 0.05, w: wingD + 0.10, d: stripT},
    {x: wingX_W - wingD/2 + stripT/2, z: 0, w: stripT, d: D - 0.1},
  ];
  for (const s of [...wStrip,
    ...wStrip.map(w => ({...w, x: w.x === wingX_W ? wingX_E : (W - 2 * wingD)/2 + wingD/2 + (w.x - wingX_W)})),
  ]) {
    const sf = box(s.w, stripH, s.d, matFootMat);
    sf.position.set(s.x, -0.30 + stripH/2, s.z);
    g.add(sf);
  }
  // 北棟下
  const backW = W - 2 * wingD;
  const nStrip = [
    {x: 0, z: backZ + backD/2 - stripT/2, w: backW + 0.1, d: stripT},
    {x: 0, z: backZ - backD/2 + stripT/2, w: backW + 0.1, d: stripT},
  ];
  for (const s of nStrip) {
    const sf = box(s.w, stripH, s.d, matFootMat);
    sf.position.set(s.x, -0.30 + stripH/2, s.z);
    g.add(sf);
  }
}

// ── エントランス・玄関ポーチ (北棟中央 中庭側) ──
function buildEntrance(g, plan) {
  const baseY = FL_OFFSET;
  const W = plan.W * MM, D = plan.D * MM;
  const wingD = plan.wingD * MM, backD = plan.backD * MM;
  const backZ = -D/2 + backD/2;
  // 玄関キャノピー (Cantilever 大屋根) — 棟高さに合わせて配置
  const canopyW = 4.5;
  const canopyD = 2.5;
  const backStories = plan.backStories || 1;
  // 平屋なら棟最上部 - 0.4m (室内2.4m高さ)、2階以上なら2階分
  const canopyY = baseY + Math.min(backStories, 2) * plan.modH * MM
                 + (backStories === 1 ? -0.30 : 0.30);
  const canopyMat = new THREE.MeshStandardMaterial({color: 0x1c1c1c, roughness: 0.5, metalness: 0.4});
  const canopy = box(canopyW, 0.12, canopyD, canopyMat);
  canopy.position.set(0, canopyY, backZ + backD/2 + canopyD/2);
  g.add(canopy);
  g.add(edge(canopy, COLORS.line, 0.5));
  // Cantilever brackets
  for (const xs of [-canopyW/2 + 0.30, canopyW/2 - 0.30]) {
    const arm = box(0.10, 0.20, canopyD - 0.20, canopyMat);
    arm.position.set(xs, canopyY - 0.16, backZ + backD/2 + canopyD/2);
    g.add(arm);
  }
  // 玄関ドア (ガラスダブル両開き、黒枠)
  const doorMat = MATS.glass;
  const door = box(2.4, 2.4, 0.05, doorMat);
  door.position.set(0, baseY + 1.2, backZ + backD/2 + 0.06);
  g.add(door);
  // ドアフレーム
  const fT = 0.10;
  const top = box(2.6, fT, 0.08, MATS.dark);
  top.position.set(0, baseY + 2.4 + fT/2, backZ + backD/2 + 0.06);
  g.add(top);
  for (const fx of [-1.2 - fT/2, 1.2 + fT/2]) {
    const fr = box(fT, 2.5, 0.08, MATS.dark);
    fr.position.set(fx, baseY + 1.25, backZ + backD/2 + 0.06);
    g.add(fr);
  }
  // 中央マリオン
  const mul = box(0.06, 2.4, 0.08, MATS.dark);
  mul.position.set(0, baseY + 1.2, backZ + backD/2 + 0.07);
  g.add(mul);
  // 玄関ステップ (石)
  const stepMat = new THREE.MeshStandardMaterial({color: 0xc8c4b8, roughness: 0.8});
  for (let i = 0; i < 3; i++) {
    const step = box(3.0 - i * 0.4, 0.10, 0.30, stepMat);
    step.position.set(0, -0.15 + i * 0.10, backZ + backD/2 + 0.30 + i * 0.30);
    g.add(step);
  }
  // 玄関スポット照明 (キャノピー下)
  const spotMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c8, emissive: 0xffd070, emissiveIntensity: 1.6,
  });
  for (const sx of [-1.0, 1.0]) {
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12), spotMat);
    sp.position.set(sx, canopyY - 0.10, backZ + backD/2 + canopyD - 0.30);
    g.add(sp);
  }
}

// ── 駐車場 + アプローチ動線 (合宿施設なら最低15台) ──
function buildParking(g, plan) {
  const W = plan.W * MM, D = plan.D * MM;
  const carCnt = plan.id === 'dojo_xl' ? 20 : plan.id === 'dojo_l' ? 15 : 8;
  // 駐車場は西側に配置 (アプローチ南から、駐車エリア北へ)
  const parkX = -W/2 - 12;
  const parkZ = -D/2 + 4;
  const parkMat = new THREE.MeshStandardMaterial({color: 0x4a4a48, roughness: 0.95});
  const parkW = 9, parkDtotal = (carCnt / 2) * 5.2;
  const park = box(parkW, 0.04, parkDtotal, parkMat);
  park.position.set(parkX, -0.30, parkZ + parkDtotal/2);
  g.add(park);
  // 駐車区画ライン (白)
  const lineMat = new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.9});
  for (let i = 0; i <= Math.ceil(carCnt / 2); i++) {
    const ln = box(parkW, 0.045, 0.08, lineMat);
    ln.position.set(parkX, -0.29, parkZ + i * 5.2);
    g.add(ln);
  }
  // アプローチパス (砂利)
  const pathMat = new THREE.MeshStandardMaterial({color: 0xb8a890, roughness: 1});
  const path = box(3.5, 0.04, 18, pathMat);
  path.position.set(-W/2 - 6, -0.30, 4);
  g.add(path);
  // アプローチサイン
  const signMat = new THREE.MeshStandardMaterial({color: 0x222222, roughness: 0.5});
  const sign = box(0.08, 1.8, 0.40, signMat);
  sign.position.set(parkX + 4, 0.6, parkZ - 1);
  g.add(sign);
  const signTop = box(0.4, 0.5, 0.08, MATS.module);
  signTop.position.set(parkX + 4, 1.6, parkZ - 1);
  g.add(signTop);
}

// ── Build all wings + courtyard + sail + stairs + elevator + entrance + parking ──
function buildDojo(plan) {
  const root = group('root');
  const baseY = FL_OFFSET;
  const W = plan.W * MM, D = plan.D * MM;
  const wingD = plan.wingD * MM, backD = plan.backD * MM;
  const modH = plan.modH * MM;
  const sideStories = plan.sideStories || 2;
  const backStories = plan.backStories || 3;

  // Wings
  const wingsG = group('wings');
  const wingLen = D;       // east/west wings span full N-S
  const wingX_W = -W/2 + wingD/2;
  const wingX_E =  W/2 - wingD/2;
  // West wing — mono roof for snow shed (寒冷地対応)
  buildWing(wingsG, {x: wingX_W, z: 0, w: wingD, d: wingLen,
    stories: sideStories, modH, withRoofDeck: false, monoRoof: true});
  // East wing — same
  buildWing(wingsG, {x: wingX_E, z: 0, w: wingD, d: wingLen,
    stories: sideStories, modH, withRoofDeck: false, monoRoof: true});
  // North (back) wing — 中庭側を低くした mono roof
  const backW = W - 2 * wingD;
  const backX = 0;
  const backZ = -D/2 + backD/2;
  buildWing(wingsG, {x: backX, z: backZ, w: backW, d: backD,
    stories: backStories, modH, withRoofDeck: false, monoRoof: true});
  root.add(wingsG);

  // ── 階段塔 (stair towers) — 平屋 (1階) なら不要 ──
  const stairsG = group('stairs');
  if (sideStories >= 2) {
    buildStairTower(stairsG, {
      x: wingX_W, z: -wingLen/2 + 1.5, w: wingD * 0.7, d: 2.8,
      stories: sideStories, modH,
    });
    buildStairTower(stairsG, {
      x: wingX_E, z: -wingLen/2 + 1.5, w: wingD * 0.7, d: 2.8,
      stories: sideStories, modH,
    });
  }
  if (backStories >= 2) {
    // 北棟 階段A (西寄り)
    buildStairTower(stairsG, {
      x: backX - backW/4, z: backZ, w: 2.4, d: backD * 0.5,
      stories: backStories, modH,
    });
    // 北棟 階段B (東寄り — 2方向避難)
    buildStairTower(stairsG, {
      x: backX + backW/4, z: backZ, w: 2.4, d: backD * 0.5,
      stories: backStories, modH,
    });
  }
  // 中庭側 屋外避難階段 (側棟・北棟の合流点 — 国基準 2方向避難用)
  // 北棟外部に金属階段 (中庭側へ降りる)
  if (backStories >= 3) {
    const extX = -backW/4;        // 北棟西側のすぐ外
    const extZ = backZ + backD/2 + 1.0;
    const stepCnt = backStories * 14;
    const stepRiseTotal = backStories * modH;
    const stepRun = 0.28;
    for (let i = 0; i < stepCnt; i++) {
      const flight = Math.floor(i / 14);
      const inFlight = i % 14;
      const tread = box(1.2, 0.04, stepRun, MATS.dark);
      // ジグザグ折返し
      const dir = flight % 2 === 0 ? 1 : -1;
      tread.position.set(
        extX + dir * (inFlight - 6.5) * stepRun,
        baseY + (flight * modH) + (inFlight + 1) * (modH / 14),
        extZ + flight * 1.2,
      );
      stairsG.add(tread);
    }
    // 鉄骨フレーム
    const frameMat = MATS.dark;
    for (let f = 0; f <= backStories; f++) {
      const post = box(0.08, modH, 0.08, frameMat);
      post.position.set(extX, baseY + f * modH, extZ + f * 1.2);
      stairsG.add(post);
    }
  }
  root.add(stairsG);

  // ── エレベーター塔 (3階以上) ──
  if (plan.hasElevator) {
    const elG = group('elevator');
    buildElevator(elG, {
      x: backX, z: backZ + backD/2 - 1.2,    // 北棟中央南面 (中庭側エントランス近く)
      stories: backStories, modH,
    });
    root.add(elG);
  }

  // Windows (courtyard-facing primarily, plus exterior)
  const winsG = group('windows');
  // West wing courtyard-facing (east side of west wing)
  addWindows(winsG, {x: wingX_W, z: 0, w: wingLen, d: wingD, stories: sideStories, modH, side: 'east'});
  // West wing exterior (west side)
  addWindows(winsG, {x: wingX_W, z: 0, w: wingLen, d: wingD, stories: sideStories, modH, side: 'west'});
  // East wing courtyard-facing (west side)
  addWindows(winsG, {x: wingX_E, z: 0, w: wingLen, d: wingD, stories: sideStories, modH, side: 'west'});
  // East wing exterior (east side)
  addWindows(winsG, {x: wingX_E, z: 0, w: wingLen, d: wingD, stories: sideStories, modH, side: 'east'});
  // North wing courtyard-facing (south side)
  addWindows(winsG, {x: backX, z: backZ, w: backW, d: backD, stories: backStories, modH, side: 'south'});
  // North wing exterior (north side)
  addWindows(winsG, {x: backX, z: backZ, w: backW, d: backD, stories: backStories, modH, side: 'north'});
  root.add(winsG);

  // Courtyard deck + 道場マット + 石舞台 + 布基礎/ベタ基礎
  const cyG = group('courtyard');
  buildCourtyard(cyG, plan);
  root.add(cyG);

  // エントランス・玄関 (北棟中央 中庭側)
  const entG = group('entrance');
  buildEntrance(entG, plan);
  root.add(entG);

  // 駐車場 + アプローチ
  const parkG = group('parking');
  buildParking(parkG, plan);
  root.add(parkG);

  // Sail canopy
  if (plan.sail) {
    const sailG = group('sail');
    buildSail(sailG, plan, baseY);
    root.add(sailG);
  }

  // Human scale (180cm) for reference
  const humanG = group('scale');
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 1.5, 12), MATS.human);
  body.position.set(W/2 + 1.5, baseY + 0.75, D/2 + 1.5);
  humanG.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), MATS.human);
  head.position.set(W/2 + 1.5, baseY + 1.65, D/2 + 1.5);
  humanG.add(head);
  root.add(humanG);

  // Ground
  const groundG = group('ground');
  const grassMat = new THREE.MeshStandardMaterial({color: 0x88a070, roughness: 1});
  const grassPlane = new THREE.Mesh(new THREE.PlaneGeometry(W * 4, D * 4), grassMat);
  grassPlane.rotation.x = -Math.PI / 2;
  grassPlane.position.y = -0.32;
  grassPlane.receiveShadow = true;
  groundG.add(grassPlane);
  root.add(groundG);

  return root;
}

// ── Viewer factory ──
export function createViewer(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.bg);

  buildMaterials();

  const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 500);
  camera.position.set(28, 20, 28);

  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Sky
  const sky = new Sky();
  sky.scale.setScalar(450);
  scene.add(sky);
  const sun = new THREE.Vector3();
  const phi = THREE.MathUtils.degToRad(90 - 50);
  const theta = THREE.MathUtils.degToRad(180);
  sun.setFromSphericalCoords(1, phi, theta);
  sky.material.uniforms.sunPosition.value.copy(sun);
  sky.material.uniforms.turbidity.value = 8;
  sky.material.uniforms.rayleigh.value = 1.5;

  // PMREM env
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Lights
  const hemi = new THREE.HemisphereLight(0xb8d4f0, 0xb0a99a, 0.55);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(0xfff2d8, 2.4);
  sunLight.position.set(20, 35, 25);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 200;
  sunLight.shadow.camera.left = -60; sunLight.shadow.camera.right = 60;
  sunLight.shadow.camera.top = 60;   sunLight.shadow.camera.bottom = -60;
  sunLight.shadow.bias = -0.0002;
  scene.add(sunLight);

  // Grid (subtle)
  const grid = new THREE.GridHelper(80, 80, 0xcccccc, 0xeeeeee);
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  grid.position.y = -0.31;
  scene.add(grid);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 120;
  controls.target.set(0, 3, 0);

  let currentRoot = null;
  let currentPlan = null;

  function loadPlan(id) {
    if (currentRoot) scene.remove(currentRoot);
    const plan = PLANS[id];
    if (!plan) return;
    plan.id = id;
    currentPlan = plan;
    currentRoot = buildDojo(plan);
    scene.add(currentRoot);
    fitCamera();
  }

  function fitCamera() {
    if (!currentPlan) return;
    const W = currentPlan.W * MM, D = currentPlan.D * MM;
    const widest = Math.max(W, D) * 1.6;
    const r = widest * 0.9;
    camera.position.set(r * 0.85, r * 0.55, r * 0.85);
    controls.target.set(0, 4, 0);
    controls.update();
  }

  function setView(view) {
    if (!currentPlan) return;
    const W = currentPlan.W * MM, D = currentPlan.D * MM;
    const r = Math.max(W, D) * 1.4;
    if (view === 'iso')   camera.position.set(r * 0.7, r * 0.5, r * 0.7);
    if (view === 'front') camera.position.set(0, r * 0.3, r * 1.1);    // South view (where opening is)
    if (view === 'side')  camera.position.set(r * 1.1, r * 0.3, 0);
    if (view === 'top')   camera.position.set(0, r * 1.5, 0.001);
    controls.target.set(0, 4, 0);
    controls.update();
  }

  function setLayer(name, visible) {
    if (!currentRoot) return;
    const obj = currentRoot.getObjectByName(name);
    if (obj) obj.visible = visible;
  }

  // Render loop
  function loop() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  // Resize
  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Public API
  return {
    get scene() { return scene; },
    get camera() { return camera; },
    get renderer() { return renderer; },
    loadPlan, setView, setLayer, fitCamera,
    getPlan: () => currentPlan,
    takeoff: () => {
      if (!currentPlan) return [];
      const p = currentPlan;
      const sideArea = (p.wingD * MM) * (p.D * MM) * p.sideStories * 2;
      const backArea = ((p.W - 2 * p.wingD) * MM) * (p.backD * MM) * p.backStories;
      const totalArea = sideArea + backArea;
      const cyArea = (p.W - 2 * p.wingD) * MM * (p.D - p.backD) * MM;
      const stairCnt = p.backStories >= 3 ? 5 : 4;          // 4 inner + 1 outer evac
      const isHighRise = p.backStories >= 3 || p.sideStories >= 3;
      const items = [
        {itemId: 'sips_module', name: 'SIPs モジュール (壁厚160 + 屋根200mm 大臣認定)',
          qty: Math.ceil(totalArea / 16.2), unit: '個', unitPrice: 480000, cost: Math.ceil(totalArea / 16.2) * 480000},
      ];
      if (isHighRise) {
        items.push({itemId: 'steel_frame', name: '鉄骨ハイブリッドフレーム (3階以上 SIPs補強 H-300×150)',
          qty: totalArea, unit: 'm²', unitPrice: 18000, cost: totalArea * 18000});
      }
      items.push(
        {itemId: 'foundation_slab', name: 'ベタ基礎 (RC150 + 配筋 D13@200)',
          qty: (p.W * MM) * (p.D * MM), unit: 'm²', unitPrice: 28000, cost: (p.W * MM) * (p.D * MM) * 28000},
        {itemId: 'foundation_strip', name: '布基礎 (深さ1m 凍結深度対応 RC)',
          qty: 2 * ((p.W * MM) + (p.D * MM)) + (p.W - 2 * p.wingD) * MM * 2, unit: 'm', unitPrice: 38000,
          cost: (2 * ((p.W * MM) + (p.D * MM)) + (p.W - 2 * p.wingD) * MM * 2) * 38000},
        {itemId: 'fire_resistive', name: '準耐火構造 (1時間) 石膏ボード+ロックウール 法27条対応',
          qty: totalArea, unit: 'm²', unitPrice: 8500, cost: totalArea * 8500},
        {itemId: 'stairs', name: `階段塔 ${stairCnt}箇所 (杉踏板 + 不燃化処理 + 手摺)`,
          qty: stairCnt, unit: '基', unitPrice: 1200000, cost: stairCnt * 1200000},
        {itemId: 'evac_stair', name: '屋外避難階段 (鉄骨製 + 集成材踏板, ジグザグ折返)',
          qty: p.backStories >= 3 ? 1 : 0, unit: '基', unitPrice: 2400000, cost: p.backStories >= 3 ? 2400000 : 0},
      );
      if (p.hasElevator) {
        items.push({itemId: 'elevator', name: `エレベーター (車椅子対応 9人乗 ${p.backStories}停 三菱・日立)`,
          qty: 1, unit: '基', unitPrice: 8500000 + (p.backStories - 2) * 1200000,
          cost: 8500000 + (p.backStories - 2) * 1200000});
      }
      items.push(
        {itemId: 'sail', name: 'PVCコーティング帆布 + Φ150鋼管+コンクリ墓石アンカー (風荷重60kN対応)',
          qty: 1, unit: '式', unitPrice: 4800000, cost: 4800000},
        {itemId: 'courtyard_deck', name: '中庭杉デッキ + 道場マット28㎡ + 石舞台',
          qty: cyArea, unit: 'm²', unitPrice: 16000, cost: cyArea * 16000},
        {itemId: 'roof_mono', name: '片屋根 SIPs t200 + ガルバリウム立平 + 雪止め3段',
          qty: totalArea / Math.max(p.sideStories, p.backStories), unit: 'm²',
          unitPrice: 24000, cost: (totalArea / Math.max(p.sideStories, p.backStories)) * 24000},
        {itemId: 'windows_lg', name: '黒枠ペアサッシ (大型FIX/引違 LIXIL TW)',
          qty: Math.ceil(totalArea / 5), unit: '枚', unitPrice: 145000, cost: Math.ceil(totalArea / 5) * 145000},
        {itemId: 'entrance', name: '玄関ポーチ (キャノピー + 自動ガラスドア + スポット照明 + 石ステップ)',
          qty: 1, unit: '式', unitPrice: 1800000, cost: 1800000},
        {itemId: 'parking', name: `駐車場 ${p.id === 'dojo_xl' ? 20 : p.id === 'dojo_l' ? 15 : 8}台 + 砕石舗装 + 区画ライン`,
          qty: 1, unit: '式', unitPrice: 850000, cost: 850000},
        {itemId: 'mep', name: '機械設備 (HRV第一種換気 + 床暖 + エコキュート + 給排水)',
          qty: totalArea, unit: 'm²', unitPrice: 28000, cost: totalArea * 28000},
        {itemId: 'fire_alarm', name: '自動火災報知設備 + 排煙設備 + 非常照明 (令126)',
          qty: 1, unit: '式', unitPrice: 2400000 + (totalArea > 500 ? 800000 : 0),
          cost: 2400000 + (totalArea > 500 ? 800000 : 0)},
      );
      return items;
    },
    softCosts: function() {
      const items = this.takeoff();
      const p = currentPlan;
      const matTotal = items.reduce((s, r) => s + r.cost, 0);
      const isHighRise = p.backStories >= 3 || p.sideStories >= 3;
      const totalArea = items.find(i => i.itemId === 'fire_resistive')?.qty || 200;
      const breakdown = [
        {key: 'labor', label: '施工費 (北海道道東 遠隔地割増)', cost: matTotal * 0.55, note: '材料の55% (3階以上は揚重費追加)'},
        {key: 'transport', label: '運搬・大型クレーン揚重', cost: matTotal * 0.12, note: '材料の12% (SIPs搬入+25t車)'},
        {key: 'scaffold', label: '足場・仮設工事 (3階以上 + 落下防止網)', cost: matTotal * 0.06, note: '材料の6%'},
        {key: 'design', label: '設計監理 (1級建築士事務所)', cost: matTotal * 0.10, note: '建築士法 24条'},
        {key: 'structural', label: '構造設計 (1級構造設計士)', cost: 1800000 + (isHighRise ? 1200000 : 0),
          note: '木鉄ハイブリッド・許容応力度計算'},
        {key: 'permit', label: '建築確認申請 (中間検査含)', cost: 680000, note: '指定確認検査機関 / 4号特例外'},
        {key: 'fire_consult', label: '消防法 防火対象物届出 + 消防同意', cost: 380000, note: 'スプリンクラー・誘導灯協議'},
        {key: 'septic', label: '合併浄化槽 (人槽 = 利用人数による)', cost: totalArea > 500 ? 4200000 : 2800000,
          note: '弟子屈下水未接続 / 合宿用'},
        {key: 'electric', label: '電力引込・キュービクル (高圧3相)', cost: isHighRise ? 1200000 : 480000,
          note: '北電 / 50kVA以上は高圧'},
        {key: 'contingency', label: '予備費 (寒冷地+特殊建築物 不確実性)', cost: matTotal * 0.10, note: '材料の10%'},
      ];
      const total = matTotal + breakdown.reduce((s, r) => s + r.cost, 0);
      return {matTotal, breakdown, grandTotal: total};
    },
  };
}
