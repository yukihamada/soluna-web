/* SOLUNA Chat Widget — LUNA AIコンシェルジュ (with voice) */
(function(){
'use strict';
var KAGI='https://kagi-server.fly.dev';
var history=[];
var isOpen=false;
var isTyping=false;
var voiceOn=true;
var synth=window.speechSynthesis;
var jaVoice=null;

// 日本語音声を選ぶ（ブラウザ読み込み後に取得）
function pickVoice(){
  var voices=synth.getVoices();
  // 優先: ja-JP の高品質音声（Kyoko/O-Ren/Google 日本語など）
  var prefer=['O-Ren','Kyoko','Google 日本語','Microsoft Haruka','ja-JP'];
  for(var i=0;i<prefer.length;i++){
    var v=voices.find(function(v){return v.name.indexOf(prefer[i])!==-1||v.lang===prefer[i]});
    if(v){jaVoice=v;break;}
  }
  if(!jaVoice) jaVoice=voices.find(function(v){return v.lang.startsWith('ja')});
}
if(synth){
  pickVoice();
  synth.addEventListener('voiceschanged',pickVoice);
}

function speak(text){
  if(!voiceOn||!synth)return;
  synth.cancel();
  // マークダウン記号・URLを除去
  var clean=text
    .replace(/\*\*(.+?)\*\*/g,'$1')
    .replace(/\*(.+?)\*/g,'$1')
    .replace(/#+\s*/g,'')
    .replace(/https?:\/\/\S+/g,'')
    .replace(/[「」『』【】]/g,'')
    .replace(/\n+/g,'。')
    .trim();
  if(!clean)return;
  var utt=new SpeechSynthesisUtterance(clean);
  utt.lang='ja-JP';
  utt.rate=1.05;
  utt.pitch=1.1;
  utt.volume=0.9;
  if(jaVoice)utt.voice=jaVoice;
  // 長文は途中で止まるブラウザ対策
  utt.onend=function(){};
  synth.speak(utt);
  // Chromeのバグ対策: 15秒ごとにresume
  var keepAlive=setInterval(function(){
    if(synth.speaking)synth.resume();
    else clearInterval(keepAlive);
  },10000);
}

// Inject styles
var style=document.createElement('style');
style.textContent=`
#sc-btn{position:fixed;bottom:24px;right:24px;z-index:9000;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#c8a455,#a8803a);border:none;cursor:pointer;box-shadow:0 4px 24px rgba(200,164,85,.4);display:flex;align-items:center;justify-content:center;font-size:22px;transition:transform .2s,box-shadow .2s}
#sc-btn:hover{transform:scale(1.08);box-shadow:0 6px 32px rgba(200,164,85,.6)}
#sc-panel{position:fixed;bottom:92px;right:24px;z-index:9001;width:360px;max-width:calc(100vw - 32px);background:#0a0a0a;border:1px solid #1e1e1e;border-radius:20px;box-shadow:0 16px 64px rgba(0,0,0,.8);display:none;flex-direction:column;overflow:hidden;max-height:540px}
#sc-panel.open{display:flex}
.sc-head{background:#0d0d0d;border-bottom:1px solid #141414;padding:12px 14px;display:flex;align-items:center;gap:10px}
.sc-head-info{flex:1}
.sc-head-name{font-size:13px;font-weight:800;color:#f0ece4;letter-spacing:-.01em}
.sc-head-sub{font-size:9px;color:#555;letter-spacing:.06em;margin-top:1px}
.sc-head-dot{width:7px;height:7px;border-radius:50%;background:#9bc46d;flex-shrink:0}
.sc-head-actions{display:flex;gap:4px;align-items:center}
#sc-voice-btn{background:none;border:none;font-size:15px;cursor:pointer;padding:4px 6px;border-radius:6px;opacity:.6;transition:opacity .15s;line-height:1}
#sc-voice-btn:hover{opacity:1}
#sc-voice-btn.muted{opacity:.25}
.sc-close{background:none;border:none;color:#444;font-size:18px;cursor:pointer;padding:4px;line-height:1}
.sc-close:hover{color:#888}
#sc-msgs{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px}
.sc-msg{display:flex;gap:8px;align-items:flex-end}
.sc-msg.user{flex-direction:row-reverse}
.sc-bubble{max-width:78%;padding:9px 13px;border-radius:14px;font-size:12px;line-height:1.7;word-break:break-word;position:relative}
.sc-msg.bot .sc-bubble{background:#141414;color:#ccc;border-radius:14px 14px 14px 4px;cursor:pointer}
.sc-msg.bot .sc-bubble:hover::after{content:'🔊';position:absolute;bottom:6px;right:8px;font-size:10px;opacity:.5}
.sc-msg.user .sc-bubble{background:#c8a455;color:#050505;font-weight:600;border-radius:14px 14px 4px 14px}
.sc-avatar{width:26px;height:26px;border-radius:50%;background:#1a1a1a;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px}
.sc-avatar.speaking{animation:sc-pulse .6s ease-in-out infinite alternate}
@keyframes sc-pulse{from{box-shadow:0 0 0 0 rgba(200,164,85,0)}to{box-shadow:0 0 0 5px rgba(200,164,85,.25)}}
.sc-action{margin-top:6px}
.sc-action a{display:inline-block;font-size:10px;color:#c8a455;border:1px solid rgba(200,164,85,.3);padding:5px 12px;border-radius:20px;text-decoration:none;transition:background .15s}
.sc-action a:hover{background:rgba(200,164,85,.1)}
.sc-typing{display:flex;gap:4px;align-items:center;padding:10px 14px}
.sc-typing span{width:5px;height:5px;border-radius:50%;background:#333;animation:sc-bounce .9s infinite}
.sc-typing span:nth-child(2){animation-delay:.15s}
.sc-typing span:nth-child(3){animation-delay:.3s}
@keyframes sc-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
.sc-footer{border-top:1px solid #111;padding:10px 12px;display:flex;gap:8px;align-items:center}
#sc-input{flex:1;background:#0c0c0c;border:1px solid #1a1a1a;border-radius:10px;padding:9px 12px;color:#f0ece4;font-size:12px;outline:none;resize:none;max-height:80px;font-family:inherit}
#sc-input:focus{border-color:rgba(200,164,85,.4)}
#sc-send{background:#c8a455;border:none;border-radius:10px;width:36px;height:36px;cursor:pointer;color:#050505;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s}
#sc-send:disabled{opacity:.3;cursor:not-allowed}
.sc-quick{padding:0 12px 10px;display:flex;flex-wrap:wrap;gap:6px}
.sc-quick button{background:#0d0d0d;border:1px solid #1a1a1a;color:#666;padding:5px 10px;border-radius:20px;font-size:10px;cursor:pointer;transition:all .15s;font-family:inherit}
.sc-quick button:hover{border-color:rgba(200,164,85,.4);color:#c8a455}
`;
document.head.appendChild(style);

// Inject HTML
var container=document.createElement('div');
container.innerHTML=`
<button id="sc-btn" title="LUNAに質問する">🌙</button>
<div id="sc-panel">
  <div class="sc-head">
    <div class="sc-head-dot"></div>
    <div class="sc-head-info">
      <div class="sc-head-name">LUNA</div>
      <div class="sc-head-sub">SOLUNA AIコンシェルジュ · オンライン</div>
    </div>
    <div class="sc-head-actions">
      <button id="sc-voice-btn" title="音声オン/オフ">🔊</button>
      <button class="sc-close" id="sc-close-btn">✕</button>
    </div>
  </div>
  <div id="sc-msgs"></div>
  <div class="sc-quick" id="sc-quick">
    <button onclick="scSend('空き状況を教えて')">空き状況</button>
    <button onclick="scSend('料金を教えて')">料金・プラン</button>
    <button onclick="scSend('共同オーナーについて')">共同オーナー</button>
    <button onclick="scSend('雨の日はどうなる？')">雨天対応</button>
    <button onclick="scSend('キャンセルポリシーを教えて')">キャンセル</button>
  </div>
  <div class="sc-footer">
    <textarea id="sc-input" placeholder="LUNAに質問する..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();scSend()}"></textarea>
    <button id="sc-send" onclick="scSend()">↑</button>
  </div>
</div>`;
document.body.appendChild(container);

// アバター要素の参照（スピーキングアニメ用）
var lastBotAvatar=null;

function scToggle(){
  isOpen=!isOpen;
  document.getElementById('sc-panel').classList.toggle('open',isOpen);
  if(!isOpen){synth&&synth.cancel();}
  if(isOpen&&history.length===0){
    var greeting='こんにちは。SOLUNAのAIコンシェルジュ、LUNAです。北海道・熱海の宿泊予約や共同オーナーについて、なんでも聞いてください。';
    scAddMsg('bot',greeting);
    speak(greeting);
    document.getElementById('sc-input').focus();
  }
}

function scAddMsg(role,text,action){
  var msgs=document.getElementById('sc-msgs');
  var div=document.createElement('div');
  div.className='sc-msg '+role;
  var actionHtml='';
  if(action){
    var href=action.type==='open_calendar'?'/calendar.html':action.type==='open_call'?'/call.html':'/plans.html';
    actionHtml='<div class="sc-action"><a href="'+href+'">'+esc(action.label)+' →</a></div>';
  }
  var avatar=document.createElement('div');
  avatar.className='sc-avatar';
  avatar.textContent=role==='bot'?'🌙':'👤';

  var body=document.createElement('div');
  var bubble=document.createElement('div');
  bubble.className='sc-bubble';
  bubble.innerHTML=esc(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  // クリックで再読み上げ
  if(role==='bot'){
    bubble.title='クリックで再生';
    bubble.onclick=function(){speak(text);};
  }
  body.appendChild(bubble);
  if(actionHtml)body.insertAdjacentHTML('beforeend',actionHtml);

  div.appendChild(avatar);
  div.appendChild(body);
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;

  if(role==='bot')lastBotAvatar=avatar;
  return {div:div,avatar:avatar};
}

function scShowTyping(){
  var msgs=document.getElementById('sc-msgs');
  var div=document.createElement('div');
  div.className='sc-msg bot';div.id='sc-typing-ind';
  div.innerHTML='<div class="sc-avatar">🌙</div><div class="sc-bubble sc-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function scHideTyping(){var t=document.getElementById('sc-typing-ind');if(t)t.remove();}

function setSpeakingAnim(on){
  if(lastBotAvatar)lastBotAvatar.classList.toggle('speaking',on);
}

window.scSend=async function(preset){
  var input=document.getElementById('sc-input');
  var msg=(preset||input.value).trim();
  if(!msg||isTyping)return;
  input.value='';input.style.height='auto';
  document.getElementById('sc-quick').style.display='none';
  synth&&synth.cancel();
  scAddMsg('user',msg);
  history.push({role:'user',content:msg});
  isTyping=true;document.getElementById('sc-send').disabled=true;
  scShowTyping();
  try{
    var res=await fetch(KAGI+'/api/v1/soluna/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message:msg,history:history.slice(0,-1)})
    });
    var data=await res.json();
    scHideTyping();
    var el=scAddMsg('bot',data.reply,data.action);
    history.push({role:'assistant',content:data.reply});
    // 読み上げ + アニメ
    if(voiceOn&&synth){
      setSpeakingAnim(true);
      var utt=buildUtt(data.reply);
      utt.onend=function(){setSpeakingAnim(false);};
      utt.onerror=function(){setSpeakingAnim(false);};
      synth.cancel();
      synth.speak(utt);
    }
  }catch(e){
    scHideTyping();
    scAddMsg('bot','接続エラーが発生しました。\ninfo@enablerdao.com までお問い合わせください。');
  }finally{
    isTyping=false;document.getElementById('sc-send').disabled=false;
    document.getElementById('sc-input').focus();
  }
};

function buildUtt(text){
  var clean=text
    .replace(/\*\*(.+?)\*\*/g,'$1')
    .replace(/\*(.+?)\*/g,'$1')
    .replace(/#+\s*/g,'')
    .replace(/https?:\/\/\S+/g,'')
    .replace(/[「」『』【】]/g,'')
    .replace(/\n+/g,'。')
    .trim();
  var utt=new SpeechSynthesisUtterance(clean);
  utt.lang='ja-JP';utt.rate=1.05;utt.pitch=1.1;utt.volume=0.9;
  if(jaVoice)utt.voice=jaVoice;
  // Chrome speech bug workaround
  var keepAlive=setInterval(function(){
    if(synth.speaking)synth.resume();else clearInterval(keepAlive);
  },10000);
  utt.onend=function(){clearInterval(keepAlive);};
  return utt;
}

window.scToggle=scToggle;

// 音声トグル
document.getElementById('sc-voice-btn').addEventListener('click',function(){
  voiceOn=!voiceOn;
  this.textContent=voiceOn?'🔊':'🔇';
  this.classList.toggle('muted',!voiceOn);
  if(!voiceOn)synth&&synth.cancel();
});

document.getElementById('sc-btn').addEventListener('click',scToggle);
document.getElementById('sc-close-btn').addEventListener('click',scToggle);
document.getElementById('sc-input').addEventListener('input',function(){
  this.style.height='auto';this.style.height=Math.min(this.scrollHeight,80)+'px';
});

function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
})();
