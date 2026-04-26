/* SOLUNA language toggle — EN / JA
   Elements with data-en="..." will show English when lang=en
   Elements with data-ja="..." override the default Japanese
   Usage: <span data-en="Properties">物件一覧</span>
*/
(function(){
  var LANG_KEY = 'sln_lang';
  var lang = localStorage.getItem(LANG_KEY) || 'ja';

  function apply(l){
    lang = l;
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.setAttribute('lang', l==='en' ? 'en' : 'ja');
    document.querySelectorAll('[data-en]').forEach(function(el){
      if(l==='en'){
        if(!el._ja) el._ja = el.innerHTML;
        el.innerHTML = el.dataset.en;
      } else {
        if(el._ja) el.innerHTML = el._ja;
      }
    });
    // Update toggle button state
    document.querySelectorAll('.lang-toggle').forEach(function(btn){
      btn.setAttribute('data-lang', l);
      btn.querySelector('.lt-en').style.opacity = l==='en' ? '1' : '.35';
      btn.querySelector('.lt-ja').style.opacity = l==='ja' ? '1' : '.35';
    });
  }

  window.slunaLang = { get: function(){ return lang; }, set: apply };

  // Run on DOM ready
  function init(){
    apply(lang);
    document.querySelectorAll('.lang-toggle').forEach(function(btn){
      btn.addEventListener('click', function(){
        apply(lang==='en'?'ja':'en');
      });
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
