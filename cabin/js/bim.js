// SOLUNA BIM Viewer — Three.js 0.160 (ES module)
// Parametric model builder for 16 plans. Loaded by /bim.html
// Layers: foundation / structure / sips / roof / openings / solar / deck / dims

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

// Scale: 1 unit = 1 mm. Camera distances are large; we'll scale geometry to meters (÷1000) for sanity.
const MM = 0.001; // mm → m

const COLORS = {
  bg:        0xf2f0eb,           // architectural drawing background
  ground:    0xe8e4d8,
  foundation:0x6e6862,
  steel:     0x1a1a1a,           // black galvanized
  cedar:     0xa9824f,           // cedar plank
  glass:     0x9bd5e8,
  glassEdge: 0x507a85,
  solar:     0x1c2a4a,
  solarFrame:0x5a6680,
  deck:      0x8a6a3e,
  sauna:     0x6b4220,
  line:      0x222222,
  dim:       0x506068,
  skylight:  0xf6e6c0,
};

const MATS = {};

function buildMaterials() {
  MATS.foundation = new THREE.MeshStandardMaterial({color: COLORS.foundation, roughness: 0.95, metalness: 0});
  MATS.steel      = new THREE.MeshStandardMaterial({color: COLORS.steel,      roughness: 0.55, metalness: 0.4});
  MATS.cedar      = new THREE.MeshStandardMaterial({color: COLORS.cedar,      roughness: 0.85, metalness: 0});
  MATS.glass      = new THREE.MeshPhysicalMaterial({color: COLORS.glass, roughness: 0.05, metalness: 0, transmission: 0.85, transparent: true, opacity: 0.55, ior: 1.45, thickness: 0.02});
  MATS.solar      = new THREE.MeshStandardMaterial({color: COLORS.solar, roughness: 0.25, metalness: 0.6});
  MATS.solarFrame = new THREE.MeshStandardMaterial({color: COLORS.solarFrame, roughness: 0.6, metalness: 0.5});
  MATS.deck       = new THREE.MeshStandardMaterial({color: COLORS.deck, roughness: 0.95, metalness: 0});
  MATS.sauna      = new THREE.MeshStandardMaterial({color: COLORS.sauna, roughness: 0.85, metalness: 0});
  MATS.skylight   = new THREE.MeshPhysicalMaterial({color: COLORS.skylight, roughness: 0.1, metalness: 0, transmission: 0.7, transparent: true, opacity: 0.5});
  MATS.lineDark   = new THREE.LineBasicMaterial({color: COLORS.line});
  MATS.lineDim    = new THREE.LineBasicMaterial({color: COLORS.dim});
}

function edge(mesh, color) {
  const e = new THREE.EdgesGeometry(mesh.geometry, 18);
  const lines = new THREE.LineSegments(e, new THREE.LineBasicMaterial({color: color ?? COLORS.line, transparent: true, opacity: 0.85}));
  lines.position.copy(mesh.position);
  lines.rotation.copy(mesh.rotation);
  lines.scale.copy(mesh.scale);
  return lines;
}

function box(w, h, d, mat) {
  const g = new THREE.BoxGeometry(w, h, d);
  return new THREE.Mesh(g, mat);
}

function group(name) {
  const g = new THREE.Group();
  g.name = name;
  return g;
}

// ========= Geometry builders =========
function buildFoundation(plan) {
  const g = group('foundation');
  const W = plan.W * MM, D = plan.D * MM;
  const slab = box(W + 0.4, 0.4, D + 0.4, MATS.foundation);
  slab.position.y = -0.2;
  g.add(slab);
  g.add(edge(slab, COLORS.line));
  // Stem walls (visible thicker base)
  if (plan.pilotis) {
    // 4 cedar columns lifting the building
    const colH = 2.4, colW = 0.3;
    const positions = [
      [-W/2 + colW/2, colH/2 - 0.0, -D/2 + colW/2],
      [ W/2 - colW/2, colH/2 - 0.0, -D/2 + colW/2],
      [-W/2 + colW/2, colH/2 - 0.0,  D/2 - colW/2],
      [ W/2 - colW/2, colH/2 - 0.0,  D/2 - colW/2],
    ];
    for (const [x, y, z] of positions) {
      const c = box(colW, colH, colW, MATS.steel);
      c.position.set(x, y, z);
      g.add(c);
      g.add(edge(c));
    }
  }
  return g;
}

function buildStructure(plan) {
  const g = group('structure');
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 : 0;

  // Floor slabs per story (cedar look)
  for (let s = 0; s < stories; s++) {
    const slab = box(W - 0.05, 0.18, D - 0.05, MATS.cedar);
    slab.position.set(0, baseY + s * storyH + 0.09, 0);
    g.add(slab);
    g.add(edge(slab));
  }
  // Top floor / ceiling slab (only show as thin band on flat roof)
  if (plan.roofType === 'flat' || plan.rooftopTerrace) {
    const top = box(W - 0.05, 0.20, D - 0.05, MATS.cedar);
    top.position.set(0, baseY + stories * storyH + 0.10, 0);
    g.add(top);
    g.add(edge(top));
  }
  return g;
}

function buildSIPs(plan) {
  const g = group('sips');
  // Dome plans: the dome IS the envelope. Skip wall construction.
  if (plan.dome) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const totalH = storyH * stories;
  const baseY = plan.pilotis ? 2.4 : 0;
  const t = 0.16; // SIPs panel thickness 160mm

  // 4 walls — black galvanized cladding (we model the panel as simple boxes)
  // South wall (front, +Z direction). Has main opening.
  const south = openingWall({W: W, H: totalH, depth: t, opening: plan.openings?.south, units: plan.openings?.units});
  south.position.set(0, baseY + totalH/2, D/2 - t/2);
  g.add(south);

  // North wall (back) — solid
  const north = box(W, totalH, t, MATS.steel);
  north.position.set(0, baseY + totalH/2, -D/2 + t/2);
  g.add(north);
  g.add(edge(north));

  // East / West walls — show small windows
  const sideOpening = {w: Math.min(0.9, D * 0.08), h: 1.2};
  const east = openingWall({W: D, H: totalH, depth: t, opening: sideOpening, count: stories, side: true});
  east.rotation.y = Math.PI / 2;
  east.position.set(W/2 - t/2, baseY + totalH/2, 0);
  g.add(east);

  const west = openingWall({W: D, H: totalH, depth: t, opening: sideOpening, count: stories, side: true});
  west.rotation.y = -Math.PI / 2;
  west.position.set(-W/2 + t/2, baseY + totalH/2, 0);
  g.add(west);

  // Inter-floor ribbon (dark band) at story breaks
  for (let s = 1; s < stories; s++) {
    const band = box(W + 0.02, 0.06, D + 0.02, MATS.steel);
    band.position.set(0, baseY + s * storyH, 0);
    band.userData.layer = 'sips';
    g.add(band);
  }

  return g;
}

// Wall with one or more openings (south facade big glass, side windows, or rental units)
function openingWall({W, H, depth, opening, count, units, side}) {
  const g = new THREE.Group();
  g.name = 'wall';

  // If this is the YIELD-style multi-unit wall, draw a grid of small windows
  if (units && units > 0) {
    // Solid wall first
    const solid = box(W, H, depth, MATS.steel);
    g.add(solid);
    g.add(edge(solid));
    const cols = 3;       // 1K×6戸 = 3 columns × 2 stories
    const rows = Math.ceil(units / cols);
    const winW = 1.5, winH = 1.6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -W/2 + (c + 0.5) * (W / cols);
        const y = -H/2 + (r + 0.5) * (H / rows);
        const win = box(winW, winH, depth + 0.01, MATS.glass);
        win.position.set(x, y, 0);
        g.add(win);
        g.add(edge(win, COLORS.glassEdge));
      }
    }
    return g;
  }

  // Simple wall + single (or per-story repeated) opening
  const op = opening || {w: 1.5, h: 1.5};
  const opW = (op.w || 1500) > 100 ? (op.w * MM) : op.w; // accept mm or m
  const opH = (op.h || 1200) > 100 ? (op.h * MM) : op.h;
  const cnt = side ? (count || 1) : 1;

  const solid = box(W, H, depth, MATS.steel);
  g.add(solid);
  g.add(edge(solid));

  if (side) {
    // small window per story, centered
    const storyH = H / cnt;
    for (let s = 0; s < cnt; s++) {
      const yc = -H/2 + (s + 0.5) * storyH;
      const win = box(opW, opH, depth + 0.01, MATS.glass);
      win.position.set(0, yc - storyH * 0.05, 0);
      g.add(win);
      g.add(edge(win, COLORS.glassEdge));
    }
  } else {
    // Big south opening on ground floor + thin ribbon on upper floors
    const winY = -H/2 + opH/2 + 0.4;   // sill 400mm
    const win = box(opW, opH, depth + 0.01, MATS.glass);
    win.position.set(0, winY, 0);
    g.add(win);
    g.add(edge(win, COLORS.glassEdge));
    if (H > opH * 1.5) {
      const ribbon = box(opW, 0.9, depth + 0.01, MATS.glass);
      ribbon.position.set(0, winY + opH/2 + 1.6, 0);
      g.add(ribbon);
      g.add(edge(ribbon, COLORS.glassEdge));
    }
  }
  return g;
}

function buildRoof(plan) {
  const g = group('roof');
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 : 0;
  const eaveY = baseY + stories * storyH;

  if (plan.dome) {
    // 2V geodesic dome — half-sphere from icosahedron (detail 1 ≈ 2V freq)
    const r = Math.max(W, D) / 2 * 0.95;
    // Build hemisphere by clipping the icosahedron at y=0
    const ico = new THREE.IcosahedronGeometry(r, 1);
    const pos = ico.attributes.position;
    // Lift any vertex below 0 up to 0 (creates a flat bottom)
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 0) pos.setY(i, 0);
    }
    pos.needsUpdate = true;
    ico.computeVertexNormals();
    const dome = new THREE.Mesh(ico, MATS.steel);
    dome.position.set(0, 0, 0);
    g.add(dome);
    g.add(edge(dome));

    // Door opening on south side (cedar door + glass)
    const doorW = 1.2, doorH = 2.0, doorD = 0.05;
    const door = box(doorW, doorH, doorD, MATS.cedar);
    door.position.set(0, doorH / 2, r * 0.92);
    g.add(door);
    g.add(edge(door));
    // Glass triangle window above
    const win = box(1.6, 0.9, doorD, MATS.glass);
    win.position.set(0, doorH + 0.5, r * 0.88);
    g.add(win);
    g.add(edge(win, COLORS.glassEdge));
    return g;
  }

  if (plan.roofType === 'flat') {
    // Parapet
    const parapet = box(W + 0.1, 0.3, D + 0.1, MATS.steel);
    parapet.position.set(0, eaveY + 0.15, 0);
    g.add(parapet);
    g.add(edge(parapet));
    if (plan.rooftopTerrace) {
      // Cedar deck on top
      const deck = box(W - 0.4, 0.06, D - 0.4, MATS.deck);
      deck.position.set(0, eaveY + 0.06, 0);
      g.add(deck);
      // Railing (thin black bars)
      const rail1 = box(W - 0.2, 0.05, 0.04, MATS.steel);
      rail1.position.set(0, eaveY + 1.1, D/2 - 0.05);
      g.add(rail1);
      const rail2 = rail1.clone();
      rail2.position.z = -D/2 + 0.05;
      g.add(rail2);
    }
    return g;
  }

  // Gable roof: two sloped planes meeting at ridge
  const pitch = plan.roofPitch || 0.25;       // rise/run
  const ridgeH = (W / 2) * pitch;
  const ridgeY = eaveY + ridgeH;

  const slope = Math.atan(pitch);
  const slopeLen = Math.sqrt((W/2)**2 + ridgeH**2);
  const tRoof = 0.18;

  // East-facing slope (positive X) — orient gable so ridge runs along Z (parallel to D)
  for (const sign of [-1, 1]) {
    const plane = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, tRoof, D + 0.4), MATS.steel);
    plane.position.set(sign * (W/4), eaveY + ridgeH/2, 0);
    plane.rotation.z = -sign * slope;
    g.add(plane);
    g.add(edge(plane));
  }

  // Gable end triangles (front/back)
  for (const zSign of [-1, 1]) {
    const shape = new THREE.Shape();
    shape.moveTo(-W/2, 0);
    shape.lineTo( W/2, 0);
    shape.lineTo( 0, ridgeH);
    shape.closePath();
    const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: 0.02, bevelEnabled: false}), MATS.steel);
    tri.rotation.x = 0;
    tri.position.set(0, eaveY, zSign * (D/2 + 0.01));
    g.add(tri);
  }

  // Skylight tower at ridge for MYTH/KOSMOS
  if (plan.openings?.skylight) {
    const skW = Math.min(2.4, W * 0.18);
    const skH = 1.8;
    const skD = Math.min(D * 0.4, 6);
    const tower = box(skW, skH, skD, MATS.steel);
    tower.position.set(0, ridgeY + skH/2 - 0.4, 0);
    g.add(tower);
    g.add(edge(tower));
    // Glass top
    const glass = box(skW - 0.2, 0.1, skD - 0.2, MATS.skylight);
    glass.position.set(0, ridgeY + skH - 0.4, 0);
    g.add(glass);
  }

  return g;
}

function buildSolar(plan) {
  const g = group('solar');
  const count = plan.openings?.solar || 0;
  if (!count) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const storyH = (plan.H || 3000) * MM;
  const stories = plan.stories || 1;
  const baseY = plan.pilotis ? 2.4 : 0;
  const eaveY = baseY + stories * storyH;
  const pitch = plan.roofPitch || 0.25;
  const ridgeH = (W / 2) * pitch;
  const slope = Math.atan(pitch);
  const slopeLen = Math.sqrt((W/2)**2 + ridgeH**2);

  // Panel: 1722 × 1134 mm (~JA solar 400W). Lay them on the SOUTH slope.
  const pW = 1.722, pH = 1.134;
  const cols = Math.max(1, Math.floor(D / (pH + 0.05)));
  const rows = Math.ceil(count / cols);

  if (plan.dome || plan.roofType === 'flat') {
    // Flat-mount on rooftop
    const startY = eaveY + 0.20;
    const totalW = cols * (pH + 0.05);
    const totalD = rows * (pW + 0.05);
    let placed = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (placed >= count) break;
        const panel = new THREE.Mesh(new THREE.BoxGeometry(pW, 0.04, pH), MATS.solar);
        const x = -totalD/2 + (r + 0.5) * (pW + 0.05);
        const z = -totalW/2 + (c + 0.5) * (pH + 0.05);
        panel.position.set(x, startY, z);
        panel.rotation.x = -0.18;     // 10° tilt
        g.add(panel);
        g.add(edge(panel, COLORS.solarFrame));
        placed++;
      }
    }
    return g;
  }

  // Gable: place on south slope (-X side mirrors). South = +X here (we made gable run along Z)
  // Actually we made ridge run along Z so south slope is one of {+X, -X}. Use +X as "south".
  let placed = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (placed >= count) break;
      const panel = new THREE.Mesh(new THREE.BoxGeometry(pW, 0.04, pH), MATS.solar);
      // Position along slope length (centered between eave and ridge)
      const along = (r + 0.5) * (pW + 0.05);
      const slopeXFromEave = along * Math.cos(slope);
      const slopeYFromEave = along * Math.sin(slope);
      const x = (W/2) - slopeXFromEave - 0.4;     // start near eave on +X side
      const y = eaveY + slopeYFromEave + 0.10;
      const z = -D/2 + (c + 0.5) * (pH + 0.05);
      panel.position.set(x, y, z);
      panel.rotation.z = slope;     // tilt match slope
      g.add(panel);
      g.add(edge(panel, COLORS.solarFrame));
      placed++;
    }
  }
  return g;
}

function buildDeck(plan) {
  const g = group('deck');
  if (!plan.deck && !['villa', 'grand', 'flat', 'duo', 'roots'].includes(plan.id)) return g;
  const W = plan.W * MM, D = plan.D * MM;
  const baseY = plan.pilotis ? 2.4 : 0;
  // Wood deck wraps south side
  const dDeck = Math.min(3.0, D * 0.25);
  const deck = box(W * 0.9, 0.10, dDeck, MATS.deck);
  deck.position.set(0, baseY - 0.05, D/2 + dDeck/2);
  g.add(deck);
  g.add(edge(deck));
  // Sauna barrel (cylinder) for MYTH
  if (plan.sauna) {
    const sauna = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 24), MATS.sauna);
    sauna.rotation.z = Math.PI / 2;
    sauna.position.set(W/2 - 1.5, baseY + 1.2, D/2 + dDeck/2 + 0.5);
    g.add(sauna);
    g.add(edge(sauna));
  }
  return g;
}

function buildDimensions(plan) {
  const g = group('dims');
  const W = plan.W * MM, D = plan.D * MM;
  const stories = plan.stories || 1;
  const totalH = stories * (plan.H || 3000) * MM + (plan.pilotis ? 2.4 : 0);

  function dimLine(p1, p2, label, offset = 0.4, axis = 'x') {
    const grp = new THREE.Group();
    const arrow = new THREE.LineBasicMaterial({color: COLORS.dim});
    const v1 = new THREE.Vector3(...p1);
    const v2 = new THREE.Vector3(...p2);
    const main = new THREE.BufferGeometry().setFromPoints([v1, v2]);
    grp.add(new THREE.Line(main, arrow));
    // Tick marks
    const tickLen = 0.15;
    const tA = new THREE.Vector3(p1[0], p1[1] - tickLen, p1[2]);
    const tB = new THREE.Vector3(p1[0], p1[1] + tickLen, p1[2]);
    const tC = new THREE.Vector3(p2[0], p2[1] - tickLen, p2[2]);
    const tD = new THREE.Vector3(p2[0], p2[1] + tickLen, p2[2]);
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([tA, tB]), arrow));
    grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([tC, tD]), arrow));
    grp.userData.label = label;
    return grp;
  }

  g.add(dimLine([-W/2, -0.6, D/2 + 0.6], [W/2, -0.6, D/2 + 0.6], `${plan.W}mm`));
  g.add(dimLine([W/2 + 0.6, -0.6, -D/2], [W/2 + 0.6, -0.6, D/2], `${plan.D}mm`));
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
    openings:   group('openings'),  // openings drawn inside SIPs walls already
    solar:      buildSolar(plan),
    deck:       buildDeck(plan),
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

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.bg ?? COLORS.bg);
  scene.fog = new THREE.Fog(opts.bg ?? COLORS.bg, 60, 240);

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({color: COLORS.ground, roughness: 1}));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.4;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(200, 200, 0x99928a, 0xc8c2b6);
  grid.position.y = -0.39;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);

  // Lights
  const hemi = new THREE.HemisphereLight(0xfff0d6, 0x88796a, 0.7);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffeacb, 1.2);
  sun.position.set(20, 30, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 100;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 120;
  controls.maxPolarAngle = Math.PI * 0.49;

  let currentRoot = null;
  let currentPlan = null;
  let currentGroups = null;

  function loadPlan(id) {
    if (currentRoot) scene.remove(currentRoot);
    const {root, plan, groups} = buildPlan(id);
    currentRoot = root;
    currentPlan = plan;
    currentGroups = groups;
    // shadow flags
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
    const W = currentPlan.W * MM, D = currentPlan.D * MM, H = (currentPlan.H || 3000) * MM * (currentPlan.stories || 1);
    const r = Math.max(W, D, H) * 1.4;
    camera.position.set(r * 0.95, r * 0.65, r * 0.95);
    controls.target.set(0, H * 0.45, 0);
    controls.update();
  }

  function setLayer(name, visible) {
    if (!currentGroups || !currentGroups[name]) return;
    currentGroups[name].visible = visible;
  }

  function setView(view) {
    if (!currentPlan) return;
    const W = currentPlan.W * MM, D = currentPlan.D * MM, H = (currentPlan.H || 3000) * MM * (currentPlan.stories || 1);
    const r = Math.max(W, D, H);
    if (view === 'iso') {
      camera.position.set(r * 0.95, r * 0.65, r * 0.95);
    } else if (view === 'front') {
      camera.position.set(0, H * 0.5, r * 1.6);
    } else if (view === 'side') {
      camera.position.set(r * 1.6, H * 0.5, 0);
    } else if (view === 'top') {
      camera.position.set(0, r * 1.8, 0.001);
    }
    controls.target.set(0, H * 0.45, 0);
    controls.update();
  }

  function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
  }
  render();

  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return {scene, camera, renderer, controls, loadPlan, setLayer, setView, fitCamera, getPlan: () => currentPlan};
}
