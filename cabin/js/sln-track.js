// SOLUNA KPI event tracker — include once per page, call sln.track(event, data)
(function(){
  var SID = (function(){
    var k='_sln_sid', v=sessionStorage.getItem(k);
    if(!v){v=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem(k,v);}
    return v;
  })();
  var PAGE = location.pathname;

  window.sln = {
    track: function(event, data){
      try {
        var body = JSON.stringify({e:event, p:PAGE, s:SID, m:localStorage.getItem('soluna_email')||undefined, d:data||undefined});
        if(navigator.sendBeacon){ navigator.sendBeacon('/api/track', body); }
        else { fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true}).catch(function(){}); }
      } catch(e){}
    }
  };

  // Auto-track [data-track] clicks
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-sln-track]');
    if(el) sln.track(el.getAttribute('data-sln-track'), {label: el.textContent.trim().slice(0,40)});
  }, true);
})();
