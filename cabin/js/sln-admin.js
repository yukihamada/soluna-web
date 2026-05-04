/**
 * sln-admin.js — SOLUNA admin features (index.html only)
 * Features: banner, hero editor, dock manager, mini analytics,
 *           beds24 availability, notifications, sticky notes
 */
(function(){
  var tok = localStorage.getItem('sln_token');
  if (!tok) return;

  fetch('/api/soluna/me',{headers:{Authorization:'Bearer '+tok}})
    .then(function(r){return r.ok?r.json():null;})
    .then(function(d){
      if (!d||!d.member||d.member.member_type!=='admin') return;
      initAdminFeatures();
    }).catch(function(){});

  // ── Helpers ────────────────────────────────────────────────────────────────
  function saveSetting(key,value){
    return fetch('/api/admin/site-settings',{
      method:'PATCH',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},
      body:JSON.stringify({key:key,value:value})
    });
  }

  function injectStyle(css){
    var s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  }

  function makeDraggable(el){
    var ox=0,oy=0,mx=0,my=0;
    var bar=el.querySelector('.drag-bar')||el;
    bar.style.cursor='move';
    bar.addEventListener('mousedown',function(e){
      if(e.target.tagName==='BUTTON'||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
      e.preventDefault();
      ox=e.clientX-el.offsetLeft; oy=e.clientY-el.offsetTop;
      document.addEventListener('mousemove',onMove);
      document.addEventListener('mouseup',function up(){document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',up);});
    });
    function onMove(e){
      el.style.left=(e.clientX-ox)+'px';
      el.style.top=(e.clientY-oy)+'px';
      el.style.right='auto';el.style.bottom='auto';
    }
  }

  function initAdminFeatures(){
    injectStyle([
      /* shared admin widget styles */
      '.sln-widget{position:fixed;background:rgba(10,9,7,.92);border:1px solid rgba(200,164,85,.2);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.6);backdrop-filter:blur(16px);z-index:800;font-family:-apple-system,"Helvetica Neue",sans-serif;color:#e8e0cc;}',
      '.sln-widget .drag-bar{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;gap:8px;}',
      '.sln-widget .drag-bar .wt{font-size:10px;font-weight:700;letter-spacing:.12em;color:#c8a455;}',
      '.sln-widget .close-btn{background:none;border:none;color:#555;font-size:14px;cursor:pointer;padding:0;line-height:1;}',
      '.sln-widget .close-btn:hover{color:#ccc;}',
      '.sln-wbody{padding:10px 12px;}',
      /* notification toast */
      '#sln-notif-toast{position:fixed;top:36px;right:12px;z-index:1200;display:flex;flex-direction:column;gap:6px;pointer-events:none;}',
      '.sln-toast{background:rgba(12,11,8,.95);border:1px solid rgba(200,164,85,.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#e8e0cc;min-width:220px;max-width:280px;pointer-events:all;animation:toastIn .25s ease;display:flex;align-items:flex-start;gap:8px;}',
      '.sln-toast .toast-icon{font-size:16px;flex-shrink:0;}',
      '.sln-toast .toast-txt{flex:1;}',
      '.sln-toast .toast-title{font-weight:700;font-size:11px;color:#c8a455;margin-bottom:2px;}',
      '.sln-toast .toast-msg{font-size:10px;color:#888;}',
      '@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}',
      /* banner editor */
      '#sln-banner{position:fixed;top:28px;left:0;right:0;z-index:900;background:rgba(200,164,85,.18);border-bottom:1px solid rgba(200,164,85,.3);padding:5px 16px;display:flex;align-items:center;gap:8px;font-size:12px;backdrop-filter:blur(8px);}',
      '#sln-banner .banner-txt{flex:1;color:#e8e0cc;}',
      '#sln-banner .banner-edit{background:rgba(200,164,85,.2);border:1px solid rgba(200,164,85,.4);border-radius:6px;color:#c8a455;font-size:10px;padding:2px 8px;cursor:pointer;}',
      '#sln-banner .banner-close{color:#888;font-size:14px;cursor:pointer;background:none;border:none;}',
      '#sln-banner-edit-box{position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:1100;background:#0d0c0a;border:1px solid rgba(200,164,85,.3);border-radius:12px;padding:16px;width:340px;display:flex;flex-direction:column;gap:8px;}',
      '#sln-banner-edit-box input{background:rgba(255,255,255,.05);border:1px solid #333;border-radius:8px;padding:8px 12px;color:#e8e0cc;font-size:13px;outline:none;}',
      '#sln-banner-edit-box input:focus{border-color:#c8a455;}',
      '.sln-be-row{display:flex;gap:6px;}',
      '.sln-be-btn{flex:1;padding:8px;border-radius:8px;font-size:11px;cursor:pointer;border:1px solid #333;background:transparent;color:#888;}',
      '.sln-be-btn.primary{background:#c8a455;color:#000;border-color:#c8a455;font-weight:700;}',
      /* mini stats widget */
      '#sln-stats-widget{bottom:80px;left:16px;width:180px;}',
      '.sln-stat-row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);}',
      '.sln-stat-row:last-child{border:none;}',
      '.sln-stat-lbl{font-size:10px;color:#888;}',
      '.sln-stat-val{font-size:12px;font-weight:700;color:#e8e0cc;}',
      '.sln-stat-val.up{color:#4ecb8d;}',
      /* beds24 widget */
      '#sln-avail-widget{bottom:80px;left:208px;width:220px;}',
      '.avail-prop{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11px;}',
      '.avail-prop:last-child{border:none;}',
      '.avail-prop .pname{color:#ccc;flex:1;}',
      '.avail-prop .pstatus{font-size:10px;padding:2px 6px;border-radius:4px;font-weight:600;}',
      '.avail-prop .pstatus.open{background:rgba(78,203,141,.15);color:#4ecb8d;}',
      '.avail-prop .pstatus.busy{background:rgba(230,90,90,.15);color:#e65a5a;}',
      /* sticky notes */
      '.sln-sticky{width:180px;min-height:120px;background:#2a2610;border:1px solid rgba(200,164,85,.2);border-radius:10px;display:flex;flex-direction:column;}',
      '.sln-sticky textarea{flex:1;background:transparent;border:none;resize:none;padding:8px;color:#e8e0cc;font-size:11px;line-height:1.6;outline:none;min-height:80px;}',
      '.sln-sticky-add{position:fixed;bottom:80px;right:56px;background:rgba(13,12,10,.85);border:1px solid rgba(255,255,255,.1);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:500;font-size:16px;backdrop-filter:blur(8px);}',
      '.sln-sticky-add:hover{background:rgba(200,164,85,.2);}',
      /* dock manager */
      '#sln-dock-widget{bottom:80px;left:440px;width:240px;}',
      '.dock-item-row{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:11px;cursor:grab;}',
      '.dock-item-row .di-em{width:20px;text-align:center;}',
      '.dock-item-row .di-name{flex:1;color:#ccc;}',
      '.dock-item-row .di-toggle{width:28px;height:16px;border-radius:8px;border:none;cursor:pointer;transition:background .2s;}',
      /* hero editor highlight */
      '#hero-copy.editable{cursor:text;border-bottom:1px dashed rgba(200,164,85,.4);outline:none;}',
      '#hero-copy.editable:focus{border-bottom-color:#c8a455;}',
      '#hero-edit-hint{position:fixed;top:36px;left:50%;transform:translateX(-50%);background:rgba(200,164,85,.15);border:1px solid rgba(200,164,85,.3);border-radius:20px;padding:4px 14px;font-size:10px;color:#c8a455;z-index:900;pointer-events:none;}',
    ].join(''));

    loadBanner();
    initHeroEditor();
    initStatsWidget();
    initAvailWidget();
    initNotifications();
    initStickyNotes();
    initDockManager();
    initAdminDock();
    initWeatherWidget();
  }

  // ── 1. お知らせバナー ────────────────────────────────────────────────────────
  function loadBanner(){
    fetch('/api/site-settings').then(r=>r.json()).then(function(s){
      if(s.banner && s.banner.text) showBanner(s.banner);
    });
  }

  function showBanner(b){
    var existing=document.getElementById('sln-banner');
    if(existing) existing.remove();
    if(!b||!b.text) return;
    var el=document.createElement('div'); el.id='sln-banner';
    el.innerHTML='<span class="banner-txt">📢 '+b.text+'</span>'
      +'<button class="banner-edit" onclick="window._sln_editBanner()">編集</button>'
      +'<button class="banner-close" onclick="this.closest(\'#sln-banner\').remove()">✕</button>';
    document.body.appendChild(el);
    // push content down
    var hero=document.getElementById('hero');
    if(hero) hero.style.marginTop='28px';
  }

  window._sln_editBanner=function(){
    var existing=document.getElementById('sln-banner-edit-box');
    if(existing){existing.remove();return;}
    fetch('/api/site-settings').then(r=>r.json()).then(function(s){
      var cur=(s.banner&&s.banner.text)||'';
      var box=document.createElement('div'); box.id='sln-banner-edit-box';
      box.innerHTML='<div style="font-size:11px;font-weight:700;color:#c8a455;margin-bottom:4px;">📢 お知らせバナー</div>'
        +'<input id="sln-banner-inp" placeholder="例: TAPKOP 9月まで満室です" value="'+cur+'">'
        +'<div class="sln-be-row">'
        +'<button class="sln-be-btn" onclick="document.getElementById(\'sln-banner-edit-box\').remove()">キャンセル</button>'
        +'<button class="sln-be-btn" onclick="window._sln_clearBanner()">削除</button>'
        +'<button class="sln-be-btn primary" onclick="window._sln_saveBanner()">保存</button>'
        +'</div>';
      document.body.appendChild(box);
      document.getElementById('sln-banner-inp').focus();
    });
  };

  window._sln_saveBanner=function(){
    var v=document.getElementById('sln-banner-inp').value.trim();
    saveSetting('banner',{text:v}).then(function(){
      document.getElementById('sln-banner-edit-box').remove();
      if(v) showBanner({text:v}); else {var b=document.getElementById('sln-banner');if(b)b.remove();}
    });
  };

  window._sln_clearBanner=function(){
    saveSetting('banner',{text:''}).then(function(){
      document.getElementById('sln-banner-edit-box').remove();
      var b=document.getElementById('sln-banner');if(b)b.remove();
    });
  };

  // Show edit button even when no banner
  var bannerBtn=document.createElement('div');
  bannerBtn.style.cssText='position:fixed;top:30px;left:50%;transform:translateX(-50%);z-index:910;';
  bannerBtn.innerHTML='<button style="background:rgba(200,164,85,.12);border:1px solid rgba(200,164,85,.2);border-radius:12px;color:#c8a455;font-size:10px;padding:2px 10px;cursor:pointer;" onclick="window._sln_editBanner()">📢 バナー編集</button>';
  document.body.appendChild(bannerBtn);

  // ── 2. ヒーローコピー編集 ────────────────────────────────────────────────────
  function initHeroEditor(){
    fetch('/api/site-settings').then(r=>r.json()).then(function(s){
      if(s.hero_copy){
        var el=document.getElementById('hero-copy');
        if(el) el.textContent=s.hero_copy;
      }
      if(s.hero_sub){
        var el2=document.getElementById('hero-sub');
        if(el2) el2.textContent=s.hero_sub;
      }
    });

    var hint=document.createElement('div'); hint.id='hero-edit-hint';
    hint.textContent='✏️ ヒーロー文言をクリックして編集'; hint.style.display='none';
    document.body.appendChild(hint);

    ['hero-copy','hero-sub'].forEach(function(id){
      var el=document.getElementById(id);
      if(!el) return;
      el.classList.add('editable');
      el.contentEditable='true';
      el.addEventListener('focus',function(){ hint.style.display='block'; });
      el.addEventListener('blur',function(){
        hint.style.display='none';
        var val=el.textContent.trim();
        var key=id==='hero-copy'?'hero_copy':'hero_sub';
        saveSetting(key,val);
      });
      el.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); el.blur(); } });
    });
  }

  // ── 3. ミニ分析ウィジェット ───────────────────────────────────────────────────
  function initStatsWidget(){
    var w=document.createElement('div');
    w.id='sln-stats-widget'; w.className='sln-widget';
    w.style.cssText='bottom:80px;left:16px;width:180px;';
    w.innerHTML='<div class="drag-bar"><span class="wt">📊 STATS</span>'
      +'<button class="close-btn" onclick="this.closest(\'.sln-widget\').style.display=\'none\'">✕</button></div>'
      +'<div class="sln-wbody" id="sln-stats-body"><div style="font-size:10px;color:#555">読み込み中...</div></div>';
    document.body.appendChild(w);
    makeDraggable(w);
    loadStats();
    setInterval(loadStats,60000);
  }

  function loadStats(){
    var k=localStorage.getItem('sln_admin_key')||'';
    if(!k) return;
    Promise.all([
      fetch('/api/admin/kpi?days=1',{headers:{'x-admin-key':k}}).then(r=>r.ok?r.json():null).catch(()=>null),
      fetch('/api/admin/kpi?days=7',{headers:{'x-admin-key':k}}).then(r=>r.ok?r.json():null).catch(()=>null),
    ]).then(function(rs){
      var d1=rs[0],d7=rs[1];
      var body=document.getElementById('sln-stats-body');
      if(!body) return;
      if(!d1){body.innerHTML='<div style="font-size:10px;color:#e65a5a">Admin Key未設定</div>';return;}
      body.innerHTML=[
        row('今日のPV', d1.total_views||0,''),
        row('今日の登録', d1.signups||0,'up'),
        row('7日PV', d7&&d7.total_views||0,''),
        row('会員数', d7&&d7.members||0,''),
        row('購入申込', d7&&d7.purchases||0,'up'),
      ].join('');
      function row(l,v,cls){return '<div class="sln-stat-row"><span class="sln-stat-lbl">'+l+'</span><span class="sln-stat-val '+(cls||'")>'+v+'</span></div>';}
    });
  }

  // ── 4. Beds24 空き状況ウィジェット ───────────────────────────────────────────
  var PROPS=[
    {slug:'atami',name:'WHITE HOUSE 熱海',id:243406},
    {slug:'lodge',name:'THE LODGE',id:243408},
    {slug:'nesting',name:'NESTING',id:243409},
    {slug:'instant',name:'インスタントハウス',id:322965},
  ];

  function initAvailWidget(){
    var w=document.createElement('div');
    w.id='sln-avail-widget'; w.className='sln-widget';
    w.style.cssText='bottom:80px;left:208px;width:220px;';
    w.innerHTML='<div class="drag-bar"><span class="wt">🏠 空き状況 (7日)</span>'
      +'<button class="close-btn" onclick="this.closest(\'.sln-widget\').style.display=\'none\'">✕</button></div>'
      +'<div class="sln-wbody" id="sln-avail-body"><div style="font-size:10px;color:#555">読み込み中...</div></div>';
    document.body.appendChild(w);
    makeDraggable(w);
    loadAvail();
  }

  function loadAvail(){
    var body=document.getElementById('sln-avail-body');
    if(!body) return;
    fetch('/api/soluna/availability/next').then(r=>r.ok?r.json():null).then(function(d){
      if(!d){body.innerHTML='<div style="font-size:10px;color:#555">データなし</div>';return;}
      body.innerHTML=PROPS.map(function(p){
        var info=d[p.slug]||d[p.id];
        var status=info&&info.next_available?'open':'busy';
        var label=info&&info.next_available?info.next_available:'確認中';
        return '<div class="avail-prop"><span class="pname">'+p.name+'</span>'
          +'<span class="pstatus '+status+'">'+label+'</span></div>';
      }).join('');
    }).catch(function(){
      body.innerHTML='<div style="font-size:10px;color:#555">Beds24未設定</div>';
    });
  }

  // ── 5. 問い合わせ通知 ────────────────────────────────────────────────────────
  function initNotifications(){
    var container=document.createElement('div'); container.id='sln-notif-toast';
    document.body.appendChild(container);
    var lastSeen=localStorage.getItem('sln_notif_last')||new Date(Date.now()-3600000).toISOString();
    pollNotifications(lastSeen);
    setInterval(function(){ pollNotifications(localStorage.getItem('sln_notif_last')||new Date(Date.now()-60000).toISOString()); },30000);
  }

  function pollNotifications(since){
    fetch('/api/admin/notifications?since='+encodeURIComponent(since),{headers:{Authorization:'Bearer '+tok}})
      .then(r=>r.ok?r.json():null).then(function(items){
        if(!items||!items.length) return;
        localStorage.setItem('sln_notif_last',new Date().toISOString());
        items.slice(0,3).forEach(function(item,i){
          setTimeout(function(){ showToast(item); },i*400);
        });
      }).catch(function(){});
  }

  var TYPE_ICON={'purchase':'💰','meeting':'📅','vip_inquiry':'💎','default':'🔔'};
  var TYPE_NAME={'purchase':'購入申込','meeting':'ミーティング依頼','vip_inquiry':'VIP問い合わせ'};

  function showToast(item){
    var c=document.getElementById('sln-notif-toast');
    if(!c) return;
    var icon=TYPE_ICON[item.type]||TYPE_ICON.default;
    var typeName=TYPE_NAME[item.type]||item.type;
    var el=document.createElement('div'); el.className='sln-toast';
    el.innerHTML='<div class="toast-icon">'+icon+'</div>'
      +'<div class="toast-txt"><div class="toast-title">'+typeName+'</div>'
      +'<div class="toast-msg">'+(item.title||'')+'</div></div>'
      +'<button style="background:none;border:none;color:#555;cursor:pointer;font-size:12px;" onclick="this.closest(\'.sln-toast\').remove()">✕</button>';
    c.appendChild(el);
    setTimeout(function(){ el.style.opacity='0'; el.style.transition='opacity .4s'; setTimeout(function(){ el.remove(); },400); },6000);
  }

  // ── 6. スティッキーノート ────────────────────────────────────────────────────
  var STICKY_KEY='sln_stickies';

  function initStickyNotes(){
    var saved=JSON.parse(localStorage.getItem(STICKY_KEY)||'[]');
    saved.forEach(function(s){ createSticky(s.text,s.x,s.y,s.id); });

    var addBtn=document.createElement('div'); addBtn.className='sln-sticky-add';
    addBtn.textContent='📝'; addBtn.title='メモを追加';
    addBtn.addEventListener('click',function(){ createSticky('',180,100,Date.now()); });
    document.body.appendChild(addBtn);
  }

  function createSticky(text,x,y,id){
    id=id||Date.now();
    var w=document.createElement('div'); w.className='sln-widget sln-sticky';
    w.style.cssText='left:'+x+'px;top:'+y+'px;width:180px;';
    var bar=document.createElement('div'); bar.className='drag-bar';
    bar.innerHTML='<span class="wt">📝 メモ</span><button class="close-btn">✕</button>';
    var ta=document.createElement('textarea');
    ta.value=text; ta.placeholder='メモを入力...';
    w.appendChild(bar); w.appendChild(ta);
    document.body.appendChild(w);
    makeDraggable(w);

    function save(){
      var all=JSON.parse(localStorage.getItem(STICKY_KEY)||'[]');
      var idx=all.findIndex(function(s){return s.id===id;});
      var rect=w.getBoundingClientRect();
      var entry={id:id,text:ta.value,x:parseInt(w.style.left),y:parseInt(w.style.top)};
      if(idx>=0) all[idx]=entry; else all.push(entry);
      localStorage.setItem(STICKY_KEY,JSON.stringify(all));
    }

    ta.addEventListener('input',save);
    bar.querySelector('.close-btn').addEventListener('click',function(){
      var all=JSON.parse(localStorage.getItem(STICKY_KEY)||'[]');
      localStorage.setItem(STICKY_KEY,JSON.stringify(all.filter(function(s){return s.id!==id;})));
      w.remove();
    });
  }

  // ── 7. ドックマネージャー ────────────────────────────────────────────────────
  function initDockManager(){
    var w=document.createElement('div');
    w.id='sln-dock-widget'; w.className='sln-widget';
    w.style.cssText='bottom:80px;left:440px;width:220px;display:none;';
    w.innerHTML='<div class="drag-bar"><span class="wt">⚙️ DOCK管理</span>'
      +'<button class="close-btn" onclick="this.closest(\'.sln-widget\').style.display=\'none\'">✕</button></div>'
      +'<div class="sln-wbody" id="sln-dock-body" style="max-height:240px;overflow-y:auto;"></div>'
      +'<div style="padding:6px 12px;border-top:1px solid rgba(255,255,255,.06);">'
      +'<button style="width:100%;background:#c8a455;color:#000;border:none;border-radius:6px;padding:6px;font-size:11px;font-weight:700;cursor:pointer;" onclick="window._sln_saveDock()">保存して反映</button>'
      +'</div>';
    document.body.appendChild(w);
    makeDraggable(w);

    // Add dock settings button to menubar
    var mb=document.getElementById('menubar');
    if(mb){
      var btn=document.createElement('span');
      btn.style.cssText='font-size:.7rem;color:rgba(255,255,255,.5);cursor:pointer;margin-left:4px;';
      btn.textContent='⚙️';
      btn.title='Dock管理';
      btn.addEventListener('click',function(){
        var dw=document.getElementById('sln-dock-widget');
        if(dw.style.display==='none'){renderDockManager();dw.style.display='';}
        else dw.style.display='none';
      });
      mb.appendChild(btn);
    }
  }

  function renderDockManager(){
    if(typeof APPS==='undefined') return;
    var body=document.getElementById('sln-dock-body'); if(!body) return;
    var hidden=JSON.parse(localStorage.getItem('sln_dock_hidden')||'[]');
    body.innerHTML=APPS.map(function(app){
      var isHidden=hidden.indexOf(app.id)>=0;
      return '<div class="dock-item-row" data-id="'+app.id+'">'
        +'<span class="di-em">'+app.em+'</span>'
        +'<span class="di-name">'+app.lbl+'</span>'
        +'<button class="di-toggle" style="background:'+(isHidden?'#333':'#4ecb8d')+'" onclick="window._sln_toggleDockItem(\''+app.id+'\',this)">'
        +(isHidden?'':'✓')+'</button>'
        +'</div>';
    }).join('');
  }

  window._sln_toggleDockItem=function(id,btn){
    var hidden=JSON.parse(localStorage.getItem('sln_dock_hidden')||'[]');
    var idx=hidden.indexOf(id);
    if(idx>=0){hidden.splice(idx,1);btn.style.background='#4ecb8d';btn.textContent='✓';}
    else{hidden.push(id);btn.style.background='#333';btn.textContent='';}
    localStorage.setItem('sln_dock_hidden',JSON.stringify(hidden));
  };

  window._sln_saveDock=function(){
    var hidden=JSON.parse(localStorage.getItem('sln_dock_hidden')||'[]');
    saveSetting('dock_hidden',hidden).then(function(){
      var dw=document.getElementById('sln-dock-widget');
      if(dw) dw.style.display='none';
      applyDockHidden(hidden);
    });
  };

  function applyDockHidden(hidden){
    // Hide/show dock items
    document.querySelectorAll('#dock .dock-item').forEach(function(el){
      var id=el.dataset.app;
      if(id) el.style.display=hidden.indexOf(id)>=0?'none':'';
    });
  }

  // Apply saved dock hidden on load
  fetch('/api/site-settings').then(r=>r.json()).then(function(s){
    if(s.dock_hidden) applyDockHidden(s.dock_hidden);
  }).catch(function(){});

  // ── 8. Admin専用Dockアイコン ─────────────────────────────────────────────────
  function initAdminDock(){
    var adminApps=[
      {em:'📊',lbl:'ダッシュボード',url:'/soluna-dashboard'},
      {em:'🧠',lbl:'Neuro解析',     url:'/neuro-dashboard'},
      {em:'📅',lbl:'予約分析',      url:'/booking-analytics'},
      {em:'📧',lbl:'メール管理',    url:'/email-admin'},
      {em:'🔒',lbl:'管理',          url:'/admin'},
    ];
    var dock=document.getElementById('dock-apps');
    if(!dock) return;
    var sep=document.createElement('div');
    sep.className='dock-sep'; sep.style.opacity='.4';
    dock.appendChild(sep);
    adminApps.forEach(function(a){
      var dk=document.createElement('div');
      dk.className='dkicon';
      dk.innerHTML='<span class="em">'+a.em+'</span><span class="lbl">'+a.lbl+'</span>';
      dk.title=a.lbl;
      dk.addEventListener('click',function(){
        if(typeof openWin==='function') openWin(a.url,a.lbl,a.em,null);
        else window.open(a.url,'_blank');
      });
      dock.appendChild(dk);
    });
  }

  // ── 9. 天気ウィジェット ─────────────────────────────────────────────────────
  var WMO_EMOJI={0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',51:'🌦',53:'🌧',55:'🌧',61:'🌧',63:'🌧',65:'🌧',71:'🌨',73:'❄️',75:'❄️',77:'🌨',80:'🌦',81:'🌧',82:'⛈',85:'❄️',86:'❄️',95:'⛈',96:'⛈',99:'⛈'};
  function wmoEmoji(c){return WMO_EMOJI[c]||'🌤';}

  function initWeatherWidget(){
    injectStyle([
      '#sln-weather-widget{bottom:80px;right:16px;width:158px;}',
      '.wrow{display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11px;}',
      '.wrow:last-child{border:none;}',
      '.wrow .wloc{color:#888;}',
      '.wrow .wval{color:#e8e0cc;font-weight:600;}',
    ].join(''));

    var w=document.createElement('div');
    w.id='sln-weather-widget'; w.className='sln-widget';
    w.style.cssText='bottom:80px;right:16px;width:158px;';
    w.innerHTML='<div class="drag-bar"><span class="wt">🌤 天気</span>'
      +'<button class="close-btn" onclick="this.closest(\'.sln-widget\').style.display=\'none\'">✕</button></div>'
      +'<div class="sln-wbody" id="sln-weather-body"><div style="font-size:10px;color:#555">読み込み中...</div></div>';
    document.body.appendChild(w);
    makeDraggable(w);
    loadWeather();
    setInterval(loadWeather, 1800000);
  }

  function loadWeather(){
    var LOCS=[
      {name:'弟子屈', lat:43.49, lon:144.45},
      {name:'熱海',   lat:35.08, lon:139.07},
      {name:'ホノルル',lat:21.30, lon:-157.80},
    ];
    var body=document.getElementById('sln-weather-body');
    if(!body) return;
    Promise.all(LOCS.map(function(loc){
      return fetch('https://api.open-meteo.com/v1/forecast?latitude='+loc.lat
        +'&longitude='+loc.lon+'&current=temperature_2m,weather_code&timezone=auto&forecast_days=1')
        .then(function(r){return r.json();})
        .then(function(d){return {name:loc.name,temp:Math.round(d.current.temperature_2m),code:d.current.weather_code};})
        .catch(function(){return {name:loc.name,temp:'--',code:0};});
    })).then(function(rs){
      if(!body) return;
      body.innerHTML=rs.map(function(r){
        return '<div class="wrow"><span class="wloc">'+r.name+'</span>'
          +'<span class="wval">'+wmoEmoji(r.code)+' '+r.temp+'°</span></div>';
      }).join('');
    });
  }

})();
