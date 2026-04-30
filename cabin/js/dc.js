/* SOLUNA Desktop Chrome — menubar + winbar + dock injector */
(function(){
  if(window.self!==window.top)return; // iframe内はスキップ
  var P={
    '/shopping':        {icon:'🛒',title:'資材リスト',    app:'Materials.app'},
    '/order':           {icon:'📋',title:'発注管理',       app:'Orders.app'},
    '/container-plan':  {icon:'🏗️',title:'間取りプラン',   app:'FloorPlan.app'},
    '/container-design':{icon:'✂️',title:'開口デザイン',   app:'ContainerCut.app'},
    '/desk':            {icon:'🖥️',title:'デスクトップ',   app:'Finder'},
    '/kumaushi':        {icon:'🏔️',title:'天空の道場',     app:'Property.app'},
  };
  var path=location.pathname.replace(/\.html$/,'');
  var m=P[path]||{icon:'📄',title:document.title.split('—')[0].trim(),app:'SOLUNA'};

  var DOCK=[
    {href:'/desk',            icon:'🖥️',label:'Finder'},
    {href:'/kumaushi',        icon:'🏔️',label:'道場'},
    {sep:true},
    {href:'/shopping',        icon:'🛒',label:'資材'},
    {href:'/order',           icon:'📋',label:'発注'},
    {href:'/container-plan',  icon:'🏗️',label:'間取り'},
    {href:'/container-design',icon:'✂️',label:'開口'},
  ];

  document.head.insertAdjacentHTML('beforeend','<style>'+
    'html,body{background:'+
      'radial-gradient(ellipse 120% 60% at 20% 10%,rgba(200,164,85,.05) 0%,transparent 60%),'+
      'radial-gradient(ellipse 80% 80% at 80% 90%,rgba(90,160,230,.04) 0%,transparent 60%),'+
      '#090910!important;}'+
    'html{scroll-padding-top:80px}'+
    'body{padding-top:80px!important;padding-bottom:100px!important;}'+
    /* 既存ページのtoolbar（sticky top:0）をwinbarの下に下げる */
    '.toolbar{top:74px!important;z-index:8800!important;}'+
    /* total-barをdockの上に出す */
    '.total-bar{bottom:86px!important;z-index:8800!important;}'+
    /* 既存toolbarがある場合はコンテンツのスクロール領域を拡張 */
    '.wrap,.categories{scroll-margin-top:80px}'+
    // menubar
    '.dc-mb{position:fixed;top:0;left:0;right:0;height:38px;z-index:9100;'+
      'background:rgba(10,10,16,.9);backdrop-filter:blur(24px) saturate(180%);'+
      'border-bottom:1px solid rgba(255,255,255,.06);'+
      'display:flex;align-items:center;justify-content:space-between;padding:0 18px;'+
      'font-family:-apple-system,"Helvetica Neue",sans-serif;}'+
    '.dc-mb-l{display:flex;align-items:center;gap:18px}'+
    '.dc-mb-r{display:flex;align-items:center;gap:14px}'+
    '.dc-logo{font-size:13px;font-weight:800;color:#c8a455;letter-spacing:.06em}'+
    '.dc-app{font-size:13px;font-weight:700;color:#e8e0cc}'+
    '.dc-mi{font-size:12px;color:#5a5660;text-decoration:none;background:none;border:none;font-family:inherit;cursor:pointer;transition:color .12s}'+
    '.dc-mi:hover{color:#e8e0cc}'+
    '.dc-clock{font-size:11px;color:#5a5660;font-variant-numeric:tabular-nums}'+
    // winbar
    '.dc-wb{position:fixed;top:38px;left:0;right:0;height:36px;z-index:9000;'+
      'background:rgba(20,20,28,.96);backdrop-filter:blur(12px);'+
      'border-bottom:1px solid rgba(255,255,255,.05);'+
      'display:flex;align-items:center;padding:0 14px;gap:10px;'+
      'font-family:-apple-system,"Helvetica Neue",sans-serif;}'+
    '.dc-btns{display:flex;gap:6px;flex-shrink:0}'+
    '.dc-btn{width:13px;height:13px;border-radius:50%;border:none;cursor:pointer;'+
      'position:relative;transition:filter .1s;}'+
    '.dc-btn:hover{filter:brightness(.75)}'+
    '.dc-cl{background:#ff5f57}.dc-mn{background:#febc2e}.dc-mx{background:#28c840}'+
    '.dc-btn span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;'+
      'font-size:7px;color:rgba(0,0,0,.7);opacity:0;transition:opacity .12s}'+
    '.dc-wb:hover .dc-btn span{opacity:1}'+
    '.dc-wt{flex:1;text-align:center;font-size:11px;color:rgba(255,255,255,.4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.dc-spacer{width:43px}'+
    // dock
    '.dc-dock{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);'+
      'display:flex;align-items:flex-end;gap:6px;z-index:9100;'+
      'background:rgba(12,12,20,.75);backdrop-filter:blur(30px) saturate(180%);'+
      'border:1px solid rgba(255,255,255,.1);border-radius:20px;'+
      'padding:8px 14px;box-shadow:0 8px 48px rgba(0,0,0,.65);'+
      'font-family:-apple-system,"Helvetica Neue",sans-serif;}'+
    '.dc-di{display:flex;flex-direction:column;align-items:center;gap:3px;'+
      'text-decoration:none;padding:2px 5px;background:none;border:none;color:inherit;'+
      'font-family:inherit;cursor:pointer;transition:transform .15s}'+
    '.dc-di:hover{transform:translateY(-8px)}'+
    '.dc-di:hover .dc-dicon{font-size:2rem}'+
    '.dc-dicon{font-size:1.5rem;transition:font-size .15s;line-height:1}'+
    '.dc-dl{font-size:8px;color:#5a5660;white-space:nowrap}'+
    '.dc-di.dc-cur .dc-dl::before{content:"•";color:#c8a455;margin-right:2px}'+
    '.dc-ds{width:1px;height:32px;background:rgba(255,255,255,.12);margin:0 3px;align-self:center}'+
  '</style>');

  // menubar
  var mb=document.createElement('div');mb.className='dc-mb';
  mb.innerHTML=
    '<div class="dc-mb-l">'+
      '<span class="dc-logo">◐ SOLUNA</span>'+
      '<span class="dc-app">'+m.app+'</span>'+
      '<a class="dc-mi" href="/desk">Finder</a>'+
      '<a class="dc-mi" href="/kumaushi">物件</a>'+
      '<a class="dc-mi" href="/shopping">資材</a>'+
      '<a class="dc-mi" href="/order">発注</a>'+
      '<a class="dc-mi" href="/container-plan">間取り</a>'+
    '</div>'+
    '<div class="dc-mb-r">'+
      '<span class="dc-clock" id="dc-cl"></span>'+
      '<a class="dc-mi" href="/" style="color:#4a4a50">← TOP</a>'+
    '</div>';
  document.body.insertBefore(mb,document.body.firstChild);

  // winbar
  var wb=document.createElement('div');wb.className='dc-wb';
  wb.innerHTML=
    '<div class="dc-btns">'+
      '<button class="dc-btn dc-cl" onclick="history.length>1?history.back():location.href=\'/desk\'" title="閉じる"><span>✕</span></button>'+
      '<button class="dc-btn dc-mn" onclick="window.scrollTo({top:0,behavior:\'smooth\'})" title="先頭へ"><span>−</span></button>'+
      '<button class="dc-btn dc-mx" onclick="document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()" title="全画面"><span>⤢</span></button>'+
    '</div>'+
    '<div class="dc-wt">'+m.icon+' '+m.title+'</div>'+
    '<div class="dc-spacer"></div>';
  document.body.insertBefore(wb,mb.nextSibling);

  // dock
  var dk=document.createElement('div');dk.className='dc-dock';
  var dh='';
  DOCK.forEach(function(d){
    if(d.sep){dh+='<div class="dc-ds"></div>';return;}
    var cur=path===d.href?' dc-cur':'';
    dh+='<a class="dc-di'+cur+'" href="'+d.href+'">'+
      '<span class="dc-dicon">'+d.icon+'</span>'+
      '<span class="dc-dl">'+d.label+'</span>'+
    '</a>';
  });
  dk.innerHTML=dh;
  document.body.appendChild(dk);

  // clock
  function tick(){
    var el=document.getElementById('dc-cl');if(!el)return;
    var n=new Date(),h=n.getHours().toString().padStart(2,'0'),mi=n.getMinutes().toString().padStart(2,'0');
    el.textContent=['日','月','火','水','木','金','土'][n.getDay()]+' '+h+':'+mi;
  }
  tick();setInterval(tick,10000);
})();
