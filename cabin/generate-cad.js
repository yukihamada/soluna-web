#!/usr/bin/env node
/**
 * SOLUNA BUILD — CAD/BIM Generator
 * Generates DXF (JW-CAD互換) + IFC 2x3 (BIM) for all plans
 * Usage: node generate-cad.js
 * Output: cabin/cad/*.dxf  cabin/cad/*.ifc
 */
'use strict';
const fs   = require('fs');
const path = require('path');

/* ── load plan data ─────────────────────────────────────────────────────── */
let src = fs.readFileSync(path.join(__dirname, 'build-data.js'), 'utf8');
src = src.replace(/window\./g, 'global.');
eval(src);
const plans = global.BUILD_PLANS;

const outDir = path.join(__dirname, 'cad');
fs.mkdirSync(outDir, { recursive: true });

/* ── helpers ────────────────────────────────────────────────────────────── */
function parseWD(plan) {
  const m = (plan.dims || '').match(/W\s*([\d,]+)\s*×\s*D\s*([\d,]+)/);
  const w = m ? parseInt(m[1].replace(/,/g,'')) : Math.round(Math.sqrt(plan.area)*1000);
  const d = m ? parseInt(m[2].replace(/,/g,'')) : Math.round(Math.sqrt(plan.area)*1000);
  const floors = (plan.dims||'').includes('2階建て') ? 2 : 1;
  const stH = floors === 2 ? 3600 : 3200; // mm per storey
  return { w, d, floors, stH };
}

/* ── room layout definitions (pct = [x1,y1,x2,y2] as fraction of w,d) ── */
const LAYOUTS = {
  mini:     [ {n:'居室+ロフト',    p:[0,0.35,1,1]},
              {n:'玄関+水回り',    p:[0,0,1,0.35]} ],
  standard: [ {n:'LDK',           p:[0,0.38,1,1]},
              {n:'寝室',          p:[0,0,0.56,0.38]},
              {n:'水回り+玄関',   p:[0.56,0,1,0.38]} ],
  dome:     'circle',
  large:    [ {n:'LDK',           p:[0,0.45,1,1]},
              {n:'主寝室',        p:[0,0.22,0.5,0.45]},
              {n:'寝室2',         p:[0.5,0.22,1,0.45]},
              {n:'水回り',        p:[0,0,1,0.22]} ],
  xl:       [ {n:'LDK+玄関',      p:[0,0.4,1,1]},
              {n:'主寝室',        p:[0,0.22,0.38,0.4]},
              {n:'子供室1',       p:[0.38,0.22,0.68,0.4]},
              {n:'子供室2+書斎',  p:[0.68,0.22,1,0.4]},
              {n:'水回り×2',      p:[0,0,1,0.22]} ],
  villa:    [ {n:'食堂・ホール 60m²',     p:[0,0.5,1,1]},
              {n:'水回り・更衣室 30m²',   p:[0,0,0.5,0.5]},
              {n:'厨房 20m²',             p:[0.5,0.167,1,0.5]},
              {n:'スタッフ室 10m²',       p:[0.5,0,1,0.167]} ],
  grand:    [ {n:'食堂・ホール',  p:[0,0.45,1,1]},
              {n:'厨房',          p:[0.45,0,1,0.45]},
              {n:'水回り（男女）',p:[0,0,0.45,0.45]} ],
  myth:     [ {n:'大ホール+スパ', p:[0,0.45,1,1]},
              {n:'設備・厨房',    p:[0.5,0.2,1,0.45]},
              {n:'水回り×6',      p:[0,0.2,0.5,0.45]},
              {n:'サウナ+温浴',   p:[0,0,1,0.2]} ],
};

const LAYOUTS_2F = {
  xl:    [{n:'主寝室',p:[0,0.5,0.4,1]},{n:'子供室1',p:[0.4,0.5,0.7,1]},{n:'子供室2+書斎',p:[0.7,0.5,1,1]},{n:'バスルーム',p:[0,0,1,0.5]}],
  grand: Array.from({length:10},(_,i)=>({n:`個室${i+1}号`,p:[i*0.1,0,i*0.1+0.1,1]})),
  myth:  [...Array.from({length:7},(_,i)=>({n:`個室${i+1}号`,p:[i*0.143,0,i*0.143+0.143,0.6]})),
           ...Array.from({length:7},(_,i)=>({n:`個室${i+8}号`,p:[i*0.143,0.6,i*0.143+0.143,1]}))],
};

/* ════════════════════════════════════════════════════════════════════════════
   DXF GENERATOR
   ════════════════════════════════════════════════════════════════════════════ */
class DXF {
  constructor() { this.entities=[]; }

  _e(t,f){ this.entities.push({t,f}); }

  line(x1,y1,x2,y2,ly='WALL'){
    this._e('LINE',{8:ly,10:+x1,20:+y1,30:0,11:+x2,21:+y2,31:0});
  }
  rect(x1,y1,x2,y2,ly='WALL'){
    this.line(x1,y1,x2,y1,ly); this.line(x2,y1,x2,y2,ly);
    this.line(x2,y2,x1,y2,ly); this.line(x1,y2,x1,y1,ly);
  }
  text(x,y,s,h=250,ly='TEXT'){
    this._e('TEXT',{8:ly,10:+x,20:+y,30:0,40:h,1:s,72:1,11:+x,21:+y+h*0.5,31:0});
  }
  circle(cx,cy,r,ly='WALL'){
    this._e('CIRCLE',{8:ly,10:+cx,20:+cy,30:0,40:+r});
  }
  dimH(x1,x2,y,off,ly='DIM'){
    const yo=y+off; const mid=(x1+x2)/2;
    this.line(x1,y,x1,yo,ly); this.line(x2,y,x2,yo,ly);
    this.line(x1,yo,x2,yo,ly);
    this.text(mid, yo+100, Math.abs(Math.round(x2-x1))+'mm', 180, ly);
  }
  dimV(y1,y2,x,off,ly='DIM'){
    const xo=x+off; const mid=(y1+y2)/2;
    this.line(x,y1,xo,y1,ly); this.line(x,y2,xo,y2,ly);
    this.line(xo,y1,xo,y2,ly);
    this.text(xo+100, mid, Math.abs(Math.round(y2-y1))+'mm', 180, ly);
  }

  toString(){
    const layers=['0','WALL','ROOM','GRID','TEXT','DIM','DECK','STRUCT','DOME'];
    const colors= [ 7,  2,    3,     8,     7,    4,    3,     6,       5];
    let s='0\nSECTION\n2\nHEADER\n';
    s+='9\n$ACADVER\n1\nAC1015\n';
    s+='9\n$INSUNITS\n70\n4\n';   // 4 = mm
    s+='9\n$LUNITS\n70\n4\n';
    s+='9\n$MEASUREMENT\n70\n1\n'; // metric
    s+='0\nENDSEC\n';
    s+='0\nSECTION\n2\nTABLES\n';
    s+='0\nTABLE\n2\nLAYER\n70\n'+layers.length+'\n';
    layers.forEach((l,i)=>{ s+=`0\nLAYER\n2\n${l}\n70\n0\n62\n${colors[i]}\n6\nContinuous\n`; });
    s+='0\nENDTABLE\n0\nENDSEC\n';
    s+='0\nSECTION\n2\nENTITIES\n';
    for(const e of this.entities){
      s+='0\n'+e.t+'\n';
      for(const[k,v] of Object.entries(e.f))
        s+=k+'\n'+(typeof v==='number'?v.toFixed(4):v)+'\n';
    }
    s+='0\nENDSEC\n0\nEOF\n';
    return s;
  }
}

function generateDXF(plan) {
  const dxf = new DXF();
  const {w,d,floors,stH} = parseWD(plan);
  const M = 910; // module

  // Grid
  for(let x=0;x<=w;x+=M) dxf.line(x,0,x,d,'GRID');
  for(let y=0;y<=d;y+=M) dxf.line(0,y,w,y,'GRID');

  // Wall thickness (SIPs 160mm outer)
  const T=160;
  dxf.rect(-T,-T,w+T,d+T,'STRUCT');
  dxf.rect(0,0,w,d,'WALL');

  // Rooms — 1F
  const layout = LAYOUTS[plan.id];
  if(layout === 'circle'){
    const r=Math.sqrt(plan.area*1e6/Math.PI);
    dxf.circle(w/2,d/2,r,'DOME');
    dxf.text(w/2-600,d/2+200,'円形居室 '+plan.area+'m²',350,'TEXT');
    dxf.circle(w/2,d/2,r-T,'DOME');
  } else {
    for(const rm of layout){
      const rx1=Math.round(rm.p[0]*w), ry1=Math.round(rm.p[1]*d);
      const rx2=Math.round(rm.p[2]*w), ry2=Math.round(rm.p[3]*d);
      dxf.rect(rx1,ry1,rx2,ry2,'ROOM');
      const rmA=((rx2-rx1)*(ry2-ry1)/1e6).toFixed(1);
      dxf.text(rx1+(rx2-rx1)/2-200, ry1+(ry2-ry1)/2+120, rm.n, 230,'TEXT');
      dxf.text(rx1+(rx2-rx1)/2-100, ry1+(ry2-ry1)/2-80, rmA+'m²', 200,'TEXT');
    }
  }

  // Deck to the right
  const deckW=Math.round(w*0.3);
  dxf.rect(w,0,w+deckW,d,'DECK');
  dxf.text(w+deckW/2-200, d/2, 'デッキ', 230,'TEXT');

  // Dimensions
  dxf.dimH(0,w,0,-700,'DIM');
  dxf.dimV(0,d,0,-700,'DIM');

  // 2F note
  if(floors===2){
    const ly2=LAYOUTS_2F[plan.id];
    const y2base = d+1800;
    dxf.text(0, y2base+400, '[ 2F LAYOUT ]', 300,'TEXT');
    dxf.rect(0,y2base-20,w,y2base-20+d,'WALL');
    if(ly2) for(const rm of ly2){
      const rx1=Math.round(rm.p[0]*w), ry1=y2base+Math.round(rm.p[1]*d);
      const rx2=Math.round(rm.p[2]*w), ry2=y2base+Math.round(rm.p[3]*d);
      dxf.rect(rx1,ry1,rx2,ry2,'ROOM');
      dxf.text(rx1+(rx2-rx1)/2-100,ry1+(ry2-ry1)/2,rm.n,180,'TEXT');
    }
  }

  // Title block
  const ty = (floors===2 ? d*2+2400 : d) + 1200;
  dxf.line(0,ty-100,w+deckW+200,ty-100,'STRUCT');
  dxf.text(0, ty+600, 'SOLUNA BUILD — '+plan.name, 450,'TEXT');
  dxf.text(0, ty+280, plan.dims, 300,'TEXT');
  dxf.text(0, ty+50,  '床面積:'+plan.area+'m²　工期:'+plan.weeks+'週　材料費:¥'+Math.round(plan.totalMat/10000)+'万', 240,'TEXT');
  dxf.text(0, ty-150, '910mmモジュール / SIPs断熱 / 単位:mm / 縮尺1:50', 220,'TEXT');

  // North arrow
  dxf.text(w+deckW+400, d/2+200, '↑', 500,'TEXT');
  dxf.text(w+deckW+400, d/2-100, 'N', 300,'TEXT');

  return dxf.toString();
}

/* ════════════════════════════════════════════════════════════════════════════
   IFC 2x3 GENERATOR
   ════════════════════════════════════════════════════════════════════════════ */
function ifcGuid(){
  const C='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
  let g='';
  for(let i=0;i<22;i++) g+=C[Math.floor(Math.random()*64)];
  return "'"+g+"'";
}
function ifcStr(s){ return `'${String(s).replace(/'/g,"''")}'`; }
function ifcRef(id){ return '#'+id; }
function ifcList(ids){ return '('+ids.map(i=>'#'+i).join(',')+')';}

class IFCBuilder {
  constructor(){ this._n=0; this._lines=[]; }
  id(){ return ++this._n; }
  e(id,type,...args){
    this._lines.push(`#${id}=${type}(${args.join(',')});`);
    return id;
  }
  toString(){
    const today=new Date().toISOString().slice(0,10);
    return [
      'ISO-10303-21;',
      'HEADER;',
      `FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');`,
      `FILE_NAME('SOLUNA.ifc','${today}T00:00:00',$,$,'SOLUNA BUILD CAD v1.0','','');`,
      `FILE_SCHEMA(('IFC2X3'));`,
      'ENDSEC;',
      'DATA;',
      ...this._lines,
      'ENDSEC;',
      'END-ISO-10303-21;',
    ].join('\n');
  }
}

function generateIFC(plan){
  const ifc = new IFCBuilder();
  const {w,d,floors,stH} = parseWD(plan);
  const T=160, SLAB=200;
  const today=new Date().toISOString().slice(0,10);

  /* ── basic entities ── */
  // Axes / points
  const pt=(x,y,z)=>ifc.e(ifc.id(),'IFCCARTESIANPOINT',`(${x}.,${y}.,${z}.)`);
  const pt2=(x,y)=>ifc.e(ifc.id(),'IFCCARTESIANPOINT',`(${x}.,${y}.)`);
  const dir=(x,y,z)=>ifc.e(ifc.id(),'IFCDIRECTION',`(${x}.,${y}.,${z}.)`);
  const ax3=(o,z,x)=>ifc.e(ifc.id(),'IFCAXIS2PLACEMENT3D',ifcRef(o),ifcRef(z),ifcRef(x));
  const ax2D=()=>{
    const o=pt2(0,0), x=ifc.e(ifc.id(),'IFCDIRECTION','(1.,0.)');
    return ifc.e(ifc.id(),'IFCAXIS2PLACEMENT2D',ifcRef(o),ifcRef(x));
  };
  const lp=(ax)=>ifc.e(ifc.id(),'IFCLOCALPLACEMENT','$',ifcRef(ax));
  const lpr=(rel,ax)=>ifc.e(ifc.id(),'IFCLOCALPLACEMENT',ifcRef(rel),ifcRef(ax));

  // World
  const wO=pt(0,0,0); const wZ=dir(0,0,1); const wX=dir(1,0,0);
  const wAx=ax3(wO,wZ,wX);

  /* ── units ── */
  const uLen  = ifc.e(ifc.id(),'IFCSIUNIT','*','.LENGTHUNIT.','.MILLI.','.METRE.');
  const uArea = ifc.e(ifc.id(),'IFCSIUNIT','*','.AREAUNIT.','$','.SQUARE_METRE.');
  const uVol  = ifc.e(ifc.id(),'IFCSIUNIT','*','.VOLUMEUNIT.','$','.CUBIC_METRE.');
  const uAng  = ifc.e(ifc.id(),'IFCSIUNIT','*','.PLANEANGLEUNIT.','$','.RADIAN.');
  const units = ifc.e(ifc.id(),'IFCUNITASSIGNMENT',ifcList([uLen,uArea,uVol,uAng]));

  /* ── geometry context ── */
  const gCtx = ifc.e(ifc.id(),'IFCGEOMETRICREPRESENTATIONCONTEXT','$',ifcStr('Model'),'3','1.E-05',ifcRef(wAx),'$');

  /* ── owner history ── */
  const org    = ifc.e(ifc.id(),'IFCORGANIZATION','$',ifcStr('Enabler Inc.'),'$','$','$');
  const person = ifc.e(ifc.id(),'IFCPERSON','$',ifcStr('Hamada'),'$','$','$','$','$','$');
  const pOrg   = ifc.e(ifc.id(),'IFCPERSONANDORGANIZATION',ifcRef(person),ifcRef(org),'$');
  const appOrg = ifc.e(ifc.id(),'IFCORGANIZATION','$',ifcStr('SOLUNA CAD'),'$','$','$');
  const app    = ifc.e(ifc.id(),'IFCAPPLICATION',ifcRef(appOrg),ifcStr('1.0'),ifcStr('SOLUNA BUILD CAD'),ifcStr('SOLUNA-CAD'));
  const own    = ifc.e(ifc.id(),'IFCOWNERHISTORY',ifcRef(pOrg),ifcRef(app),'$','.NOCHANGE.','$','$','$','0');

  /* ── project ── */
  const proj   = ifc.e(ifc.id(),'IFCPROJECT',ifcGuid(),ifcRef(own),ifcStr('SOLUNA BUILD '+plan.name),'$','$','$','$',ifcList([units]),ifcRef(gCtx));
  const siteAx = ax3(pt(0,0,0),wZ,wX);
  const siteLP = lp(siteAx);
  const site   = ifc.e(ifc.id(),'IFCSITE',ifcGuid(),ifcRef(own),ifcStr('Site'),'$','$','$',ifcRef(siteLP),'$','.ELEMENT.','$','$','$','$','$');
  const bldgAx = ax3(pt(0,0,0),wZ,wX);
  const bldgLP = lpr(siteLP,bldgAx);
  const bldg   = ifc.e(ifc.id(),'IFCBUILDING',ifcGuid(),ifcRef(own),ifcStr(plan.name),ifcStr(plan.tag||''),'$','$',ifcRef(bldgLP),'$','.ELEMENT.','$','$','$');

  /* ── helper: extrude rectangle ── */
  function extrudeRect(W,D,H){
    const ax2 = ax2D();
    const prof = ifc.e(ifc.id(),'IFCRECTANGLEPROFILEDEF','.AREA.','$',ifcRef(ax2),`${W}.`,`${D}.`);
    const pAx  = ax3(pt(0,0,0),wZ,wX);
    const ext  = ifc.e(ifc.id(),'IFCEXTRUDEDAREASOLID',ifcRef(prof),ifcRef(pAx),ifcRef(wZ),`${H}.`);
    return ext;
  }

  function makeShape(extId){
    const rep  = ifc.e(ifc.id(),'IFCSHAPEREPRESENTATION',ifcRef(gCtx),ifcStr('Body'),ifcStr('SweptSolid'),`(${ifcRef(extId)})`);
    const pds  = ifc.e(ifc.id(),'IFCPRODUCTDEFINITIONSHAPE','$','$',`(${ifcRef(rep)})`);
    return pds;
  }

  /* ── build storeys + elements ── */
  const storeyIds=[];
  const allElems=[];

  for(let fl=0;fl<floors;fl++){
    const z=fl*stH;
    const stAx = ax3(pt(0,0,z),wZ,wX);
    const stLP = lpr(bldgLP,stAx);
    const stor = ifc.e(ifc.id(),'IFCBUILDINGSTOREY',ifcGuid(),ifcRef(own),ifcStr(fl===0?'1F':'2F'),'$','$','$',ifcRef(stLP),'$','.ELEMENT.',`${z}.`);
    storeyIds.push({id:stor,lp:stLP});

    const flElems=[];

    /* perimeter walls */
    function addWall(x1,y1,lx,ly,len,label){
      const wAx2=ax3(pt(x1,y1,0),wZ,dir(lx,ly,0));
      const wLP =lpr(stLP,wAx2);
      const ext =extrudeRect(len,T,stH);
      const pds =makeShape(ext);
      const wall=ifc.e(ifc.id(),'IFCWALLSTANDARDCASE',ifcGuid(),ifcRef(own),ifcStr(label),'$','$','$',ifcRef(wLP),ifcRef(pds));
      flElems.push(wall);
    }
    addWall(0,0,   1,0,w, 'South Wall');
    addWall(w,0,   0,1,d, 'East Wall');
    addWall(0,d,   1,0,w, 'North Wall');
    addWall(0,0,   0,1,d, 'West Wall');

    /* floor slab */
    const flAx = ax3(pt(0,0,0),wZ,wX);
    const flLP  = lpr(stLP,flAx);
    const flExt = extrudeRect(w,d,SLAB);
    const flPds = makeShape(flExt);
    const slab  = ifc.e(ifc.id(),'IFCSLAB',ifcGuid(),ifcRef(own),ifcStr('Floor Slab'),'$','$','$',ifcRef(flLP),ifcRef(flPds),'.FLOOR.');
    flElems.push(slab);

    /* roof slab (top floor only) */
    if(fl===floors-1){
      const rfAx = ax3(pt(0,0,stH),wZ,wX);
      const rfLP  = lpr(stLP,rfAx);
      const rfExt = extrudeRect(w,d,SLAB);
      const rfPds = makeShape(rfExt);
      const roof  = ifc.e(ifc.id(),'IFCSLAB',ifcGuid(),ifcRef(own),ifcStr('Roof Slab'),'$','$','$',ifcRef(rfLP),ifcRef(rfPds),'.ROOF.');
      flElems.push(roof);
    }

    /* spaces */
    const layout = fl===0 ? LAYOUTS[plan.id] : (LAYOUTS_2F[plan.id]||[]);
    if(layout && layout!=='circle'){
      for(const rm of layout){
        const rx=Math.round(rm.p[0]*w), ry=Math.round(rm.p[1]*d);
        const rw=Math.round((rm.p[2]-rm.p[0])*w), rd=Math.round((rm.p[3]-rm.p[1])*d);
        if(rw<1||rd<1) continue;
        const spAx = ax3(pt(rx,ry,0),wZ,wX);
        const spLP  = lpr(stLP,spAx);
        const spExt = extrudeRect(rw,rd,stH-50);
        const spPds = makeShape(spExt);
        const rA    = (rw*rd/1e6).toFixed(2);
        const sp = ifc.e(ifc.id(),'IFCSPACE',ifcGuid(),ifcRef(own),ifcStr(rm.n),'$','$','$',ifcRef(spLP),ifcRef(spPds),'.ELEMENT.',`${rA}`);
        flElems.push(sp);
      }
    } else if(layout==='circle'){
      const r=Math.round(Math.sqrt(plan.area*1e6/Math.PI));
      const spAx = ax3(pt(w/2-r,d/2-r,0),wZ,wX);
      const spLP  = lpr(stLP,spAx);
      const spExt = extrudeRect(r*2,r*2,stH-50);
      const spPds = makeShape(spExt);
      const sp=ifc.e(ifc.id(),'IFCSPACE',ifcGuid(),ifcRef(own),ifcStr('円形居室 '+plan.area+'m²'),'$','$','$',ifcRef(spLP),ifcRef(spPds),'.ELEMENT.',`${plan.area}`);
      flElems.push(sp);
    }

    allElems.push({storeyId:stor,elems:flElems});
  }

  /* ── relationships ── */
  ifc.e(ifc.id(),'IFCRELAGGREGATES',ifcGuid(),ifcRef(own),ifcStr('Project-Site'),'$',ifcRef(proj),ifcList([site]));
  ifc.e(ifc.id(),'IFCRELAGGREGATES',ifcGuid(),ifcRef(own),ifcStr('Site-Building'),'$',ifcRef(site),ifcList([bldg]));
  ifc.e(ifc.id(),'IFCRELAGGREGATES',ifcGuid(),ifcRef(own),ifcStr('Building-Storeys'),'$',ifcRef(bldg),ifcList(storeyIds.map(s=>s.id)));

  for(const {storeyId,elems} of allElems){
    if(elems.length)
      ifc.e(ifc.id(),'IFCRELCONTAINEDINSPATIALSTRUCTURE',ifcGuid(),ifcRef(own),'$','$',ifcRef(storeyId),ifcList(elems));
  }

  /* ── property set: SIPs spec ── */
  const propIds=[];
  const pset_prop=(nm,val)=>{
    const p=ifc.e(ifc.id(),'IFCPROPERTYSINGLEVALUE',ifcStr(nm),'$',`IFCLABEL(${ifcStr(val)})`,'$');
    propIds.push(p);
  };
  pset_prop('断熱工法','SIPsパネル工法');
  pset_prop('壁断熱',  'SIPs 160mm / UA値≤0.28W/m²K');
  pset_prop('屋根断熱','SIPs 200mm');
  pset_prop('モジュール','910mm');
  pset_prop('暖房',     plan.specs?.find(s=>s.k==='暖房')?.v||'ロケットマスヒーター');
  pset_prop('電力',     plan.specs?.find(s=>s.k==='電力')?.v||'オフグリッド');
  pset_prop('材料費',   '¥'+Math.round(plan.totalMat/10000)+'万');
  pset_prop('工期',     plan.weeks+'週間');
  const pset=ifc.e(ifc.id(),'IFCPROPERTYSET',ifcGuid(),ifcRef(own),ifcStr('Pset_SolunaSpec'),'$',ifcList(propIds));

  // attach pset to building
  ifc.e(ifc.id(),'IFCRELDEFINESBYPROPERTIES',ifcGuid(),ifcRef(own),'$','$',ifcList([bldg]),ifcRef(pset));

  return ifc.toString();
}

/* ── main ─────────────────────────────────────────────────────────────────── */
let cntDXF=0, cntIFC=0;
for(const plan of plans){
  const base = `SOLUNA_${plan.name}_${plan.area}m2`;

  const dxf = generateDXF(plan);
  fs.writeFileSync(path.join(outDir, base+'.dxf'), dxf, 'utf8');
  cntDXF++;

  const ifc = generateIFC(plan);
  fs.writeFileSync(path.join(outDir, base+'.ifc'), ifc, 'utf8');
  cntIFC++;

  const kb = (s)=>(s.length/1024).toFixed(1)+'KB';
  console.log(`  ${plan.name.padEnd(6)} ${plan.area}m²  DXF ${kb(dxf)}  IFC ${kb(ifc)}`);
}
console.log(`\n✓ ${cntDXF} DXF (JW-CAD互換) + ${cntIFC} IFC (BIM) → ${outDir}/`);
