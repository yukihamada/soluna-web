// SOLUNA BIM Viewer — Three.js 0.160 (ES module)
// Parametric model builder for 16 plans. Loaded by /bim.html
// Layers: foundation / structure / sips / roof / openings / solar / deck / dims / scale

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

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

const COLORS = {
  bg:        0xeeece6,
  ground:    0xd8d2c2,
  groundSnow:0xe8e6dc,
  foundation:0x6a625a,
  steel:     0x1c1c1c,        // 黒ガルバ
  steelDark: 0x141414,
  cedar:     0xa9824f,
  cedarLite: 0xc09865,
  glass:     0x9bd5e8,
  glassEdge: 0x507a85,
  sash:      0x2a2a2a,        // アルミサッシ
  solar:     0x142036,
  solarFr:   0x6a7588,
  deck:      0x8a6a3e,
  sauna:     0x6b4220,
  line:      0x222222,
  dim:       0x506068,
  skylight:  0xf6e6c0,
  human:     0x3a3a3a,
};

const MATS = {};
function buildMaterials() {
  MATS.foundation = new THREE.MeshStandardMaterial({color: COLORS.foundation, roughness: 0.95, metalness: 0});
  MATS.steel      = new THREE.MeshStandardMaterial({color: COLORS.steel,      roughness: 0.45, metalness: 0.45});
  MATS.steelDark  = new THREE.MeshStandardMaterial({color: COLORS.steelDark,  roughness: 0.4,  metalness: 0.5});
  MATS.cedar      = new THREE.MeshStandardMaterial({color: COLORS.cedar,      roughness: 0.85, metalness: 0});
  MATS.cedarLite  = new THREE.MeshStandardMaterial({color: COLORS.cedarLite,  roughness: 0.85, metalness: 0});
  MATS.glass      = new THREE.MeshPhysicalMaterial({color: COLORS.glass, roughness: 0.05, metalness: 0, transmission: 0.85, transparent: true, opacity: 0.5, ior: 1.45, thickness: 0.02});
  MATS.sash       = new THREE.MeshStandardMaterial({color: COLORS.sash, roughness: 0.5, metalness: 0.55});
  MATS.solar      = new THREE.MeshStandardMaterial({color: COLORS.solar, roughness: 0.18, metalness: 0.7});
  MATS.solarFr    = new THREE.MeshStandardMaterial({color: COLORS.solarFr, roughness: 0.55, metalness: 0.5});
  MATS.deck       = new THREE.MeshStandardMaterial({color: COLORS.deck, roughness: 0.9, metalness: 0});
  MATS.sauna      = new THREE.MeshStandardMaterial({color: COLORS.sauna, roughness: 0.85, metalness: 0});
  MATS.skylight   = new THREE.MeshPhysicalMaterial({color: COLORS.skylight, roughness: 0.1, metalness: 0, transmission: 0.7, transparent: true, opacity: 0.5});
  MATS.human      = new THREE.MeshStandardMaterial({color: COLORS.human, roughness: 0.9, metalness: 0});
}

function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function group(name) { const g = new THREE.Group(); g.name = name; return g; }

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

// ========= Foundation (布基礎風 + 凍結深度 + GL→FL段差) =========
function buildFoundation(plan) {
  const g = group('foundation');
  const W = plan.W * MM, D = plan.D * MM;
  const stripT = 0.18;     // 布基礎厚 180mm
  const stripH = FL_OFFSET + 0.20;   // 立ち上がり全体 GL+150mm を表現
  const slabH  = 0.12;
  const baseY  = plan.pilotis ? 2.4 + FL_OFFSET : FL_OFFSET;

  // ベタ基礎スラブ (foundation slab)
  const slab = box(W + 0.10, slabH, D + 0.10, MATS.foundation);
  slab.position.y = -slabH / 2;
  g.add(slab);

  // 立ち上がり (stem walls / 布基礎 perimeter)
  const stems = [
    {w: W + stripT*2, d: stripT, x: 0, z:  D/2 + stripT/2},
    {w: W + stripT*2, d: stripT, x: 0, z: -D/2 - stripT/2},
    {w: stripT, d: D + stripT*2, x:  W/2 + stripT/2, z: 0},
    {w: stripT, d: D + stripT*2, x: -W/2 - stripT/2, z: 0},
  ];
  for (const s of stems) {
    const m = box(s.w, stripH, s.d, MATS.foundation);
    m.position.set(s.x, stripH/2 - 0.10, s.z);
    g.add(m);
  }

  // Pilotis: 4 cedar columns lifting the building (TOWER)
  if (plan.pilotis) {
    const colH = 2.4, colW = 0.35;
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

  // Steps up to entry (south side)
  if (!plan.pilotis && !plan.dome) {
    const stepW = Math.min(W * 0.25, 1.6);
    const tread = 0.30;
    const nSteps = Math.max(1, Math.ceil(FL_OFFSET / 0.20));
    for (let i = 0; i < nSteps; i++) {
      const s = box(stepW, FL_OFFSET / nSteps, tread, MATS.foundation);
      s.position.set(0, (i + 0.5) * (FL_OFFSET / nSteps) - 0.10, D/2 + tread * (nSteps - i - 0.5));
      g.add(s);
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
  g.add(south);

  // North wall (solid)
  const north = solidWall(W, totalH, t);
  north.position.set(0, baseY + totalH/2, -D/2 + t/2);
  g.add(north);

  // East/West (+X / -X) — small windows per story
  const sideOp = {w: 0.9, h: 1.2};
  const east = wallWithOpenings({W: D, H: totalH, t, opening: sideOp, side: true, count: stories});
  east.rotation.y = Math.PI / 2;
  east.position.set(W/2 - t/2, baseY + totalH/2, 0);
  g.add(east);

  const west = wallWithOpenings({W: D, H: totalH, t, opening: sideOp, side: true, count: stories});
  west.rotation.y = -Math.PI / 2;
  west.position.set(-W/2 + t/2, baseY + totalH/2, 0);
  g.add(west);

  // Inter-floor band (showing slab edge)
  for (let s = 1; s < stories; s++) {
    const band = box(W + 0.04, 0.08, D + 0.04, MATS.steelDark);
    band.position.set(0, baseY + s * storyH, 0);
    g.add(band);
  }

  return g;
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
    win.position.set(0, sill, 0); g.add(win);
    const fr = sashFrame(opW, opH, t);
    fr.position.set(0, sill, t/2); g.add(fr);

    // Cedar entry door (offset to left of glass)
    const doorW = 0.90, doorH = 2.05;
    const dx = -opW/2 - doorW/2 - 0.30;
    if (dx - doorW/2 > -W/2 + 0.30) {
      const dy = -H/2 + doorH/2;
      const door = box(doorW, doorH, t + 0.01, MATS.cedar);
      door.position.set(dx, dy, 0); g.add(door);
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
  const pitch = plan.roofPitch || 0.25;
  const run = D/2 + EAVE_OUT;
  const ridgeH = run * pitch;
  const slope = Math.atan(pitch);
  const slopeLen = Math.hypot(run, ridgeH);
  const tRoof = 0.20;
  const roofW = W + EAVE_OUT * 2;

  // Two slope planes (south +Z, north -Z)
  for (const sign of [1, -1]) {
    const plane = new THREE.Mesh(
      new THREE.BoxGeometry(roofW, tRoof, slopeLen),
      sign === 1 ? MATS.steel : MATS.steelDark
    );
    plane.position.set(0, eaveY + ridgeH/2, sign * (run / 2));
    plane.rotation.x = -sign * slope;
    g.add(plane);
    g.add(edge(plane, COLORS.line, 0.55));
  }

  // Gable end triangles (east +X, west -X)
  for (const xSign of [1, -1]) {
    const shape = new THREE.Shape();
    shape.moveTo(-D/2, 0);
    shape.lineTo( D/2, 0);
    shape.lineTo( 0, ridgeH);
    shape.closePath();
    const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: 0.02, bevelEnabled: false}), MATS.steel);
    tri.rotation.y = Math.PI / 2;
    tri.position.set(xSign * (W/2), eaveY, 0);
    g.add(tri);
    g.add(edge(tri, COLORS.line, 0.7));
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

  // Gable: south slope (+Z). Place panels in landscape orientation, in rows from eave to ridge.
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
      const z = (D/2 + EAVE_OUT) - along * Math.cos(slope);
      const y = eaveY + along * Math.sin(slope);
      const panel = new THREE.Mesh(new THREE.BoxGeometry(pW - 0.005, 0.045, pH - 0.005), MATS.solar);
      const x = -totalRowW/2 + c * (pW + gap) + pW/2;
      panel.position.set(x, y + 0.05, z);
      panel.rotation.x = -slope;
      g.add(panel);
      g.add(edge(panel, COLORS.solarFr, 0.8));
      placed++;
    }
  }

  // 雪止め (snow guard) — black bar across south slope, near eave
  const snowGuard = box(W - 0.2, 0.04, 0.06, MATS.steelDark);
  const sgAlong = margin * 0.5;
  snowGuard.position.set(0, eaveY + sgAlong * Math.sin(slope) + 0.05, (D/2 + EAVE_OUT) - sgAlong * Math.cos(slope));
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
    g.add(ds);
  }

  // ── 棟板金 (ridge cap) — gable roof only ──
  if (plan.roofType === 'gable' && !plan.dome) {
    const pitch = plan.roofPitch || 0.25;
    const run = D/2 + EAVE_OUT;
    const ridgeY = eaveY + run * pitch;
    const cap = box(W + EAVE_OUT*2, 0.10, 0.30, MATS.steelDark);
    cap.position.set(0, ridgeY + 0.05, 0);
    g.add(cap);
  }

  // ── 破風板 (verge board) along gable ends ──
  if (plan.roofType === 'gable' && !plan.dome) {
    const pitch = plan.roofPitch || 0.25;
    const run = D/2 + EAVE_OUT;
    const slopeLen = Math.hypot(run, run * pitch);
    const slope = Math.atan(pitch);
    for (const xSign of [1, -1]) {
      for (const zSign of [1, -1]) {
        const verge = box(0.10, 0.18, slopeLen, MATS.steelDark);
        verge.position.set(xSign * (W/2 + EAVE_OUT - 0.05), eaveY + run * pitch / 2, zSign * (run / 2));
        verge.rotation.x = -zSign * slope;
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
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
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
  scene.fog = new THREE.Fog(opts.bg ?? COLORS.bg, 60, 280);

  // Ground (snow texture)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({color: COLORS.groundSnow, roughness: 1}));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.30;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid (0.91m =  SIPs panel module)
  const grid = new THREE.GridHelper(300, 330, 0x99928a, 0xc0baad);
  grid.position.y = -0.295;
  grid.material.transparent = true;
  grid.material.opacity = 0.32;
  scene.add(grid);

  // Lights — set sun for ~10am winter Hokkaido (low angle, south)
  const hemi = new THREE.HemisphereLight(0xfff0d6, 0x88796a, 0.62);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffeacb, 1.35);
  sun.position.set(8, 28, 18);   // light from south-east
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI * 0.495;

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
    controls.update();
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

  return {scene, camera, renderer, controls, loadPlan, setLayer, setView, setXray, fitCamera, getPlan: () => currentPlan};
}
