// SOLUNA MATERIALS — Shared Navigation v2
(function(){

// ── HTML ──
const NAV_HTML = `
<nav class="sn" id="sn">
  <div class="sn-bar">
    <a href="/" class="sn-logo">SOLUNA</a>
    <div class="sn-center" id="sn-center">
      <a href="/materials" class="sn-link">建材<span class="sn-count">14</span></a>
      <div class="sn-dd">
        <a class="sn-link sn-trig">構造<span class="sn-arr">&#9662;</span></a>
        <div class="sn-panel sn-panel-left">
          <div class="sn-grid">
            <a href="/hybrid-sips" class="sn-item"><img src="/img/sugi-clt-hero.jpg" class="sn-img"><div><strong>ハイブリッドSIPs</strong><span>杉×竹 工数半分</span></div><span class="sn-badge">推奨</span></a>
            <a href="/sugi-clt" class="sn-item"><img src="/img/sugi-clt-hero.jpg" class="sn-img"><div><strong>杉CLTサンド</strong><span>¥21,000/m²</span></div></a>
            <a href="/take-sips" class="sn-item"><img src="/img/take-hero.jpg" class="sn-img"><div><strong>竹SIPs</strong><span>強度4.7倍</span></div></a>
            <a href="/roofgrid" class="sn-item"><img src="/img/roofgrid-hero.jpg" class="sn-img"><div><strong>ルーフグリッド</strong><span>モジュラー屋根</span></div></a>
            <a href="/smartwindow" class="sn-item"><img src="/img/smartwindow-hero.jpg" class="sn-img"><div><strong>スマートウィンドウ</strong><span>PDLC調光 竹枠</span></div></a>
            <a href="/komenuka" class="sn-item"><img src="/img/komenuka_hero.jpg" class="sn-img"><div><strong>籾殻断熱材</strong><span>MBV 1.7 廃材活用</span></div></a>
          </div>
        </div>
      </div>
      <div class="sn-dd">
        <a class="sn-link sn-trig">仕上げ<span class="sn-arr">&#9662;</span></a>
        <div class="sn-panel sn-panel-right">
          <div class="sn-grid">
            <a href="/yakiita" class="sn-item"><img src="/img/yakiita_hero.jpg" class="sn-img"><div><strong>焼きカラマツ</strong><span>外壁 30年耐久</span></div></a>
            <a href="/louver" class="sn-item"><img src="/img/louver-hero.jpg" class="sn-img"><div><strong>ルーバー</strong><span>目隠し+通風</span></div></a>
            <a href="/hinoki-deck" class="sn-item"><img src="/img/hinoki-deck-hero.jpg" class="sn-img"><div><strong>檜デッキ</strong><span>天然防腐 防蟻</span></div></a>
            <a href="/shikkui" class="sn-item"><img src="/img/shikkui-hero.jpg" class="sn-img"><div><strong>漆喰</strong><span>内壁 防火 抗菌</span></div></a>
            <a href="/keisodo" class="sn-item"><img src="/img/keisodo-hero.jpg" class="sn-img"><div><strong>珪藻土</strong><span>結露対策 MBV3.0+</span></div></a>
            <a href="/take" class="sn-item"><img src="/img/take-hero.jpg" class="sn-img"><div><strong>竹集成パネル</strong><span>床/構造 OSB2倍</span></div></a>
            <a href="/igusa" class="sn-item"><img src="/img/igusa-hero.jpg" class="sn-img"><div><strong>い草畳</strong><span>910mm角モジュール</span></div></a>
            <a href="/kakishibu" class="sn-item"><img src="/img/kakishibu-hero.jpg" class="sn-img"><div><strong>柿渋塗料</strong><span>天然防腐 全木部</span></div></a>
          </div>
        </div>
      </div>
      <div class="sn-sep"></div>
      <a href="/builder" class="sn-link sn-hl">ビルダー</a>
      <a href="/blueprint" class="sn-link">設計図</a>
      <a href="/offgrid-cabin" class="sn-link">オフグリッド</a>
      <a href="/village-materials" class="sn-link">施工事例</a>
      <a href="/renovation" class="sn-link">リノベーション</a>
      <a href="/floorplans" class="sn-link">間取り</a>
      <a href="/sips-lab" class="sn-link">SIPsラボ</a>
    </div>
    <a href="/contact" class="sn-cta">相談する</a>
    <div class="sn-ham" id="sn-ham"><span></span><span></span><span></span></div>
  </div>
</nav>
<div class="sn-mob" id="sn-mob">
  <div class="sn-mob-in">
    <div class="sn-mob-sec sn-mob-top">
      <a href="/materials" class="sn-mob-a sn-mob-big">建材一覧 <span class="sn-count">14</span></a>
      <a href="/builder" class="sn-mob-a sn-mob-big">キャビンビルダー</a>
      <a href="/blueprint" class="sn-mob-a sn-mob-big">設計図</a>
      <a href="/offgrid-cabin" class="sn-mob-a sn-mob-big">オフグリッド仕様</a>
      <a href="/village-materials" class="sn-mob-a sn-mob-big">施工事例</a>
      <a href="/renovation" class="sn-mob-a sn-mob-big">リノベーション</a>
      <a href="/floorplans" class="sn-mob-a sn-mob-big">間取りプラン</a>
      <a href="/sips-lab" class="sn-mob-a sn-mob-big">SIPsラボ</a>
    </div>
    <div class="sn-mob-sec">
      <div class="sn-mob-cat">構造パネル</div>
      <a href="/hybrid-sips" class="sn-mob-a"><img src="/img/sugi-clt-hero.jpg" class="sn-mob-img">ハイブリッドSIPs <span class="sn-badge">推奨</span></a>
      <a href="/sugi-clt" class="sn-mob-a"><img src="/img/sugi-clt-hero.jpg" class="sn-mob-img">杉CLTサンド</a>
      <a href="/take-sips" class="sn-mob-a"><img src="/img/take-hero.jpg" class="sn-mob-img">竹SIPs</a>
    </div>
    <div class="sn-mob-sec">
      <div class="sn-mob-cat">屋根・窓・断熱</div>
      <a href="/roofgrid" class="sn-mob-a"><img src="/img/roofgrid-hero.jpg" class="sn-mob-img">ルーフグリッド</a>
      <a href="/smartwindow" class="sn-mob-a"><img src="/img/smartwindow-hero.jpg" class="sn-mob-img">スマートウィンドウ</a>
      <a href="/komenuka" class="sn-mob-a"><img src="/img/komenuka_hero.jpg" class="sn-mob-img">籾殻断熱材</a>
    </div>
    <div class="sn-mob-sec">
      <div class="sn-mob-cat">外装・内装・素材</div>
      <a href="/yakiita" class="sn-mob-a"><img src="/img/yakiita_hero.jpg" class="sn-mob-img">焼きカラマツ</a>
      <a href="/louver" class="sn-mob-a"><img src="/img/louver-hero.jpg" class="sn-mob-img">ルーバー</a>
      <a href="/hinoki-deck" class="sn-mob-a"><img src="/img/hinoki-deck-hero.jpg" class="sn-mob-img">檜デッキ</a>
      <a href="/shikkui" class="sn-mob-a"><img src="/img/shikkui-hero.jpg" class="sn-mob-img">漆喰</a>
      <a href="/keisodo" class="sn-mob-a"><img src="/img/keisodo-hero.jpg" class="sn-mob-img">珪藻土</a>
      <a href="/take" class="sn-mob-a"><img src="/img/take-hero.jpg" class="sn-mob-img">竹集成パネル</a>
      <a href="/igusa" class="sn-mob-a"><img src="/img/igusa-hero.jpg" class="sn-mob-img">い草畳パネル</a>
      <a href="/kakishibu" class="sn-mob-a"><img src="/img/kakishibu-hero.jpg" class="sn-mob-img">柿渋塗料</a>
    </div>
    <div class="sn-mob-sec">
      <div class="sn-mob-cat">設計・工法</div>
      <a href="/structural" class="sn-mob-a">構造計算書</a>
      <a href="/sips" class="sn-mob-a">SIPs工法</a>
      <a href="/sips-diy" class="sn-mob-a">DIYガイド</a>
    </div>
    <div class="sn-mob-sec" style="border:none">
      <a href="/contact" class="sn-mob-a" style="color:#c8a455;font-weight:700">相談する →</a>
    </div>
  </div>
</div>`;

// ── CSS ──
const NAV_CSS = `<style id="sn-css">
.sn{position:fixed;top:0;left:0;right:0;z-index:9999}
.sn-bar{display:flex;align-items:center;padding:0 20px;height:48px;background:rgba(4,4,4,.96);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.04)}
.sn-logo{font-size:11px;font-weight:800;letter-spacing:.22em;color:#c8a455;margin-right:24px;flex-shrink:0}
.sn-center{display:flex;align-items:center;flex:1;gap:0;min-width:0}
.sn-link{color:#555;font-size:11px;padding:15px 10px;transition:color .15s;cursor:pointer;white-space:nowrap;position:relative}
.sn-link:hover,.sn-link.active{color:#c8a455}
.sn-link.active::after{content:'';position:absolute;bottom:0;left:10px;right:10px;height:2px;background:#c8a455;border-radius:1px}
.sn-hl{color:#999!important;font-weight:600}
.sn-hl:hover{color:#c8a455!important}
.sn-arr{font-size:7px;margin-left:3px;opacity:.4}
.sn-count{font-size:8px;background:rgba(200,164,85,.15);color:#c8a455;padding:1px 5px;border-radius:100px;margin-left:4px;font-weight:700}
.sn-sep{width:1px;height:16px;background:rgba(255,255,255,.06);margin:0 4px;flex-shrink:0}
.sn-cta{font-size:10px;color:#c8a455;font-weight:700;border:1px solid rgba(200,164,85,.3);padding:6px 14px;border-radius:100px;transition:all .2s;white-space:nowrap;flex-shrink:0;margin-left:12px}
.sn-cta:hover{background:#c8a455;color:#040404}
.sn-badge{font-size:7px;color:#c8a455;font-weight:700;background:rgba(200,164,85,.12);padding:2px 5px;border-radius:100px;margin-left:4px;vertical-align:middle}

/* Dropdown */
.sn-dd{position:relative}
.sn-panel{position:absolute;top:100%;opacity:0;visibility:hidden;transition:opacity .2s,transform .2s;padding-top:6px;transform:translateY(-4px)}
.sn-dd:hover .sn-panel{opacity:1;visibility:visible;transform:translateY(0)}
.sn-panel-left{left:0}
.sn-panel-right{right:0}
.sn-grid{background:rgba(8,8,8,.98);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:2px;min-width:380px;box-shadow:0 16px 48px rgba(0,0,0,.6)}
.sn-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;transition:background .15s;font-size:11px;color:#888}
.sn-item:hover{background:rgba(200,164,85,.06);color:#f0ece4}
.sn-item strong{display:block;font-size:11px;color:#ccc;font-weight:600;margin-bottom:1px}
.sn-item:hover strong{color:#f0ece4}
.sn-item span{font-size:9px;color:#444}
.sn-item:hover span{color:#888}
.sn-img{width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0;filter:brightness(.7);transition:filter .15s}
.sn-item:hover .sn-img{filter:brightness(1)}

/* Hamburger */
.sn-ham{display:none;cursor:pointer;padding:6px;width:28px;height:24px;position:relative;margin-left:12px}
.sn-ham span{position:absolute;width:18px;height:1.5px;background:#888;transition:all .3s;left:5px}
.sn-ham span:nth-child(1){top:4px}.sn-ham span:nth-child(2){top:11px}.sn-ham span:nth-child(3){top:18px}
.sn-ham.open span:nth-child(1){transform:rotate(45deg);top:11px;background:#c8a455}
.sn-ham.open span:nth-child(2){opacity:0}
.sn-ham.open span:nth-child(3){transform:rotate(-45deg);top:11px;background:#c8a455}

/* Mobile */
.sn-mob{position:fixed;top:48px;left:0;right:0;bottom:0;background:rgba(4,4,4,.99);backdrop-filter:blur(24px);z-index:9998;overflow-y:auto;-webkit-overflow-scrolling:touch;transform:translateX(100%);transition:transform .3s ease}
.sn-mob.open{transform:translateX(0)}
.sn-mob-in{padding:12px 20px 120px}
.sn-mob-sec{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.sn-mob-top{padding-top:8px}
.sn-mob-cat{font-size:9px;letter-spacing:.16em;color:#333;font-weight:700;text-transform:uppercase;margin-bottom:8px}
.sn-mob-a{display:flex;align-items:center;gap:10px;padding:9px 0;font-size:14px;color:#666;transition:color .1s}
.sn-mob-a:hover,.sn-mob-a:active,.sn-mob-a.active{color:#f0ece4}
.sn-mob-big{font-size:17px;font-weight:700;color:#ddd;padding:10px 0}
.sn-mob-img{width:32px;height:32px;border-radius:6px;object-fit:cover;flex-shrink:0;filter:brightness(.6)}
.sn-mob-a:hover .sn-mob-img,.sn-mob-a.active .sn-mob-img{filter:brightness(1)}

@media(max-width:900px){.sn-center{display:none}.sn-cta{display:none}.sn-ham{display:block}}
@media(min-width:901px){.sn-mob{display:none!important}}
@media(max-width:1060px) and (min-width:901px){.sn-link{padding:15px 7px;font-size:10px}}
</style>`;

// ── Init ──
const old = document.querySelector('.gnav');
if(old) old.remove();
const old2 = document.querySelector('.snav');
if(old2) old2.remove();
const oldMob = document.querySelector('.snav-mobile');
if(oldMob) oldMob.remove();
const oldCss = document.getElementById('snav-css');
if(oldCss) oldCss.remove();

document.head.insertAdjacentHTML('beforeend', NAV_CSS);
document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

// Hamburger
document.getElementById('sn-ham').addEventListener('click', function(){
  this.classList.toggle('open');
  document.getElementById('sn-mob').classList.toggle('open');
  document.body.style.overflow = this.classList.contains('open') ? 'hidden' : '';
});

// Close mobile on link click
document.querySelectorAll('.sn-mob-a,.sn-mob-big').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('sn-ham').classList.remove('open');
    document.getElementById('sn-mob').classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Highlight current page
const p = location.pathname.replace(/\.html$/,'').replace(/\/$/,'') || '/';
document.querySelectorAll('.sn-item,.sn-mob-a,.sn-link[href]').forEach(a => {
  const h = (a.getAttribute('href')||'').replace(/\.html$/,'');
  if(h && h === p) {
    a.classList.add('active');
    // Also highlight parent dropdown trigger
    const dd = a.closest('.sn-dd');
    if(dd) { const trig = dd.querySelector('.sn-trig'); if(trig) trig.classList.add('active'); }
  }
});
})();
