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
// W = overall width, D = overall depth (south is +Z, north is -Z)
// wingD = depth of east/west wings, backD = depth of north (back) wing
// modW = SIPs module width (default 6m, container-like)
// modH = floor-to-floor height (default 2.7m, container-like)
// stories = vertical stack count
export const PLANS = {
  dojo_s: {
    W: 18000, D: 14000, wingD: 4000, backD: 4000, modW: 6000, modH: 2700,
    sideStories: 2, backStories: 2,
    name: 'DOJO S',
    label: '120㎡ + 中庭60㎡',
    tag: '弟子屈の道場・小規模リトリート',
    sail: true,
  },
  dojo_m: {
    W: 24000, D: 18000, wingD: 5000, backD: 5000, modW: 6000, modH: 2700,
    sideStories: 2, backStories: 3,
    name: 'DOJO M',
    label: '230㎡ + 中庭120㎡',
    tag: '中規模リトリート / 道場',
    sail: true,
  },
  dojo_l: {
    W: 32000, D: 24000, wingD: 6000, backD: 6000, modW: 6000, modH: 2700,
    sideStories: 3, backStories: 3,
    name: 'DOJO L',
    label: '430㎡ + 中庭240㎡',
    tag: '本格 道場 / 合宿施設',
    sail: true,
  },
  dojo_xl: {
    W: 40000, D: 30000, wingD: 6000, backD: 7200, modW: 6000, modH: 2700,
    sideStories: 3, backStories: 4,
    name: 'DOJO XL',
    label: '720㎡ + 中庭420㎡',
    tag: '大型カンファレンス / リゾート',
    sail: true,
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
function buildWing(g, {x, z, w, d, stories, modH, withRoofDeck, label}) {
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

  // Window openings — facing the courtyard side (passed via `windowSide`: 'south'/'north'/'east'/'west' relative to wing)
  // For our U layout, courtyard side depends on wing orientation; handled by caller via two windows per face.

  // Roof
  if (withRoofDeck) {
    // Flat roof + parapet + cedar deck
    const slab = box(w + 0.20, 0.10, d + 0.20, MATS.dark);
    slab.position.set(x, baseY + totalH + 0.05, z);
    g.add(slab);
    // Parapet
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
    // Cedar deck on top
    const deck = box(w - 0.30, 0.05, d - 0.30, MATS.deck);
    deck.position.set(x, baseY + totalH + 0.13, z);
    g.add(deck);
    // Lounge seating (low blocks)
    const cushMat = new THREE.MeshStandardMaterial({color: 0xd0c8b8, roughness: 0.85});
    for (let cx = -0.5; cx <= 0.5; cx += 1.0) {
      const cushion = box(1.6, 0.32, 0.7, cushMat);
      cushion.position.set(x + cx * (w/2 - 1.5), baseY + totalH + 0.3, z + (cx > 0 ? -0.6 : 0.6));
      g.add(cushion);
    }
    // Planters (cedar)
    for (let pz = -1; pz <= 1; pz += 2) {
      const planter = box(0.4, 0.4, 0.4, MATS.cedar);
      planter.position.set(x - w/2 + 0.6, baseY + totalH + 0.32, z + pz * (d/2 - 0.7));
      g.add(planter);
    }
    // Glass railing
    const glassR = box(w - 0.30, 1.0, 0.012, MATS.glass);
    glassR.position.set(x, baseY + totalH + 0.6, z + d/2 + 0.03);
    g.add(glassR);
    // String lights (warm dots along railing)
    const lightMat = new THREE.MeshStandardMaterial({color: 0xfff2c0, emissive: 0xffe098, emissiveIntensity: 1.4});
    for (let lx = -w/2 + 0.5; lx < w/2; lx += 0.6) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), lightMat);
      bulb.position.set(x + lx, baseY + totalH + 1.05, z + d/2 + 0.03);
      g.add(bulb);
    }
  } else {
    // Mono-pitch low roof with parapet (still flat-looking cap on top)
    const slab = box(w + 0.20, 0.10, d + 0.20, MATS.dark);
    slab.position.set(x, baseY + totalH + 0.05, z);
    g.add(slab);
    g.add(edge(slab, COLORS.line, 0.45));
  }
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

  // Anchor poles at south corners
  for (const c of [corners[2], corners[3]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, c.y, 12), MATS.dark);
    pole.position.set(c.x, c.y / 2, c.z);
    g.add(pole);
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

// ── Courtyard wooden deck ──
function buildCourtyard(g, plan) {
  const W = plan.W * MM, D = plan.D * MM;
  const wingD = plan.wingD * MM, backD = plan.backD * MM;
  const cyW = W - 2 * wingD;
  const cyD = D - backD;
  const cyZ = -D/2 + backD + cyD/2;
  const baseY = FL_OFFSET;

  // Cedar deck (raised platform)
  const deck = box(cyW - 0.2, 0.10, cyD - 0.2, MATS.deck);
  deck.position.set(0, baseY - 0.05, cyZ);
  g.add(deck);
  g.add(edge(deck, COLORS.line, 0.4));

  // White stage area (concrete plaza near south end)
  const stage = box(cyW * 0.4, 0.04, cyD * 0.35,
    new THREE.MeshStandardMaterial({color: 0xeeebe0, roughness: 0.9}));
  stage.position.set(0, baseY + 0.02, cyZ + cyD * 0.1);
  g.add(stage);

  // Foundation under entire footprint
  const foot = box(W + 0.1, 0.1, D + 0.1, MATS.foundation);
  foot.position.set(0, -0.30, 0);
  g.add(foot);
}

// ── Build all wings + courtyard + sail ──
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
  // West wing
  buildWing(wingsG, {x: wingX_W, z: 0, w: wingD, d: wingLen, stories: sideStories, modH, withRoofDeck: true});
  // East wing
  buildWing(wingsG, {x: wingX_E, z: 0, w: wingD, d: wingLen, stories: sideStories, modH, withRoofDeck: true});
  // North (back) wing — between east/west wings
  const backW = W - 2 * wingD;
  const backX = 0;
  const backZ = -D/2 + backD/2;
  buildWing(wingsG, {x: backX, z: backZ, w: backW, d: backD, stories: backStories, modH, withRoofDeck: false});
  root.add(wingsG);

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

  // Courtyard deck + plaza
  const cyG = group('courtyard');
  buildCourtyard(cyG, plan);
  root.add(cyG);

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
      // Quick BOM stub
      if (!currentPlan) return [];
      const p = currentPlan;
      const sideArea = (p.wingD * MM) * (p.D * MM) * p.sideStories * 2;
      const backArea = ((p.W - 2 * p.wingD) * MM) * (p.backD * MM) * p.backStories;
      const totalArea = sideArea + backArea;
      const cyArea = (p.W - 2 * p.wingD) * MM * (p.D - p.backD) * MM;
      return [
        {itemId: 'sips_module', name: 'SIPs モジュール (910mm × 6×2.7m unit)', qty: Math.ceil(totalArea / 16.2), unit: '個', unitPrice: 380000, cost: Math.ceil(totalArea / 16.2) * 380000},
        {itemId: 'foundation', name: 'スクリュー杭基礎 + 床スラブ', qty: 1, unit: '式', unitPrice: 2400000, cost: 2400000},
        {itemId: 'sail', name: 'PVCコーティング帆布 + テンション金物', qty: 1, unit: '式', unitPrice: 1800000, cost: 1800000},
        {itemId: 'courtyard_deck', name: '中庭杉デッキ + 石舞台', qty: cyArea, unit: 'm²', unitPrice: 14000, cost: cyArea * 14000},
        {itemId: 'roof_deck', name: '屋上デッキ + ガラス手すり + ストリングライト', qty: 2, unit: '棟', unitPrice: 1200000, cost: 2400000},
        {itemId: 'windows', name: '黒枠FIX/引違サッシ (大型ペアガラス)', qty: Math.ceil(totalArea / 8), unit: '枚', unitPrice: 95000, cost: Math.ceil(totalArea / 8) * 95000},
      ];
    },
    softCosts: function() {
      const items = this.takeoff();
      const matTotal = items.reduce((s, r) => s + r.cost, 0);
      const breakdown = [
        {key: 'labor', label: '施工費 (北海道道東)', cost: matTotal * 0.50, note: '材料の50%'},
        {key: 'transport', label: '運搬・揚重', cost: matTotal * 0.10, note: '材料の10%'},
        {key: 'design', label: '設計監理', cost: matTotal * 0.10, note: '建築士法 24条'},
        {key: 'permit', label: '建築確認申請', cost: 480000, note: '指定確認検査機関'},
        {key: 'septic', label: '合併浄化槽 7人槽', cost: 1800000, note: '弟子屈下水未接続'},
        {key: 'electric', label: '電力引込・分電盤', cost: 480000, note: '北電引込'},
        {key: 'contingency', label: '予備費 (Contingency)', cost: matTotal * 0.08, note: '材料の8%'},
      ];
      const total = matTotal + breakdown.reduce((s, r) => s + r.cost, 0);
      return {matTotal, breakdown, grandTotal: total};
    },
  };
}
