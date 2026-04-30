/* SOLUNA floating chat button — adds to every page */
(function () {
  if (document.getElementById('sln-chat-fab')) return;

  const style = document.createElement('style');
  style.textContent = `
    #sln-chat-fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 52px; height: 52px; border-radius: 50%;
      background: #c4903a; border: none; cursor: pointer;
      box-shadow: 0 4px 20px rgba(196,144,58,.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    #sln-chat-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(196,144,58,.55); }
    #sln-chat-fab svg { width: 22px; height: 22px; fill: #050505; }
    #sln-chat-panel {
      position: fixed; bottom: 88px; right: 24px; z-index: 9998;
      width: min(380px, calc(100vw - 32px)); height: min(520px, calc(100dvh - 100px));
      background: #060604; border: 1px solid #2a2a18; border-radius: 4px;
      display: flex; flex-direction: column;
      box-shadow: 0 8px 40px rgba(0,0,0,.7);
      transform: translateY(12px) scale(.97); opacity: 0; pointer-events: none;
      transition: transform .22s cubic-bezier(.16,1,.3,1), opacity .18s;
    }
    #sln-chat-panel.open { transform: translateY(0) scale(1); opacity: 1; pointer-events: all; }
    #scp-head {
      flex-shrink: 0; padding: 14px 16px; border-bottom: 1px solid #1a1a14;
      display: flex; align-items: center; gap: 10px;
    }
    #scp-head-logo { font-size: 10px; letter-spacing: .2em; color: #c4903a; text-transform: uppercase; }
    #scp-close { margin-left: auto; background: none; border: none; cursor: pointer; color: #5a5850; font-size: 18px; line-height: 1; padding: 2px; }
    #scp-msgs {
      flex: 1; overflow-y: auto; padding: 14px 14px 8px;
      display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth;
    }
    #scp-msgs::-webkit-scrollbar { width: 3px; }
    #scp-msgs::-webkit-scrollbar-thumb { background: #1a1a14; }
    .scp-msg { max-width: 90%; font-size: 13px; line-height: 1.7; padding: 10px 13px; border-radius: 2px; word-break: break-word; white-space: pre-wrap; }
    .scp-msg.user { align-self: flex-end; background: #1a1a10; border: 1px solid #2a2a18; color: #e8e3d2; }
    .scp-msg.ai { align-self: flex-start; background: #0d0d0a; border: 1px solid #1a1a14; color: #e8e3d2; }
    .scp-msg.ai strong { color: #c4903a; }
    .scp-typing span { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #5a5850; animation: scpblink 1s infinite; }
    .scp-typing span:nth-child(2) { animation-delay: .18s; }
    .scp-typing span:nth-child(3) { animation-delay: .36s; }
    @keyframes scpblink { 0%,80%,100%{opacity:.2;} 40%{opacity:1;} }
    #scp-sugs { flex-shrink: 0; padding: 0 12px 8px; display: flex; flex-wrap: wrap; gap: 6px; }
    .scp-sug { font-size: 11px; padding: 5px 10px; border: 1px solid #2a2a18; background: transparent; color: #7a7460; cursor: pointer; border-radius: 2px; font-family: inherit; transition: border-color .2s, color .2s; }
    .scp-sug:hover { border-color: #c4903a; color: #e8e3d2; }
    #scp-input-row { flex-shrink: 0; border-top: 1px solid #1a1a14; padding: 10px 12px; display: flex; gap: 8px; }
    #scp-inp { flex: 1; background: #0d0d0a; border: 1px solid #1a1a14; color: #e8e3d2; padding: 9px 12px; font-size: 13px; font-family: inherit; outline: none; border-radius: 2px; }
    #scp-inp::placeholder { color: #3a3a30; }
    #scp-send { background: #c4903a; border: none; color: #050505; padding: 9px 16px; cursor: pointer; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; border-radius: 2px; font-family: inherit; transition: background .2s; }
    #scp-send:hover { background: #b07828; }
    #scp-send:disabled { background: #1a1a10; color: #5a5850; cursor: default; }
    #scp-full-link { flex-shrink: 0; text-align: center; padding: 6px; border-top: 1px solid #1a1a14; }
    #scp-full-link a { font-size: 10px; color: #5a5850; text-decoration: none; letter-spacing: .05em; }
    #scp-full-link a:hover { color: #c4903a; }
  `;
  document.head.appendChild(style);

  // FAB button
  const fab = document.createElement('button');
  fab.id = 'sln-chat-fab';
  fab.setAttribute('aria-label', 'チャット');
  fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>`;
  document.body.appendChild(fab);

  // Panel
  const panel = document.createElement('div');
  panel.id = 'sln-chat-panel';
  panel.innerHTML = `
    <div id="scp-head">
      <span id="scp-head-logo">SOLUNA</span>
      <span style="font-size:11px;color:#5a5850;">AI アシスタント</span>
      <button id="scp-close" aria-label="閉じる">×</button>
    </div>
    <div id="scp-msgs">
      <div class="scp-msg ai">こんにちは。SOLUNAについて何でも聞いてください。</div>
    </div>
    <div id="scp-sugs">
      <button class="scp-sug">価格は？</button>
      <button class="scp-sug">申込み方法</button>
      <button class="scp-sug">Work Partyとは</button>
      <button class="scp-sug">ビレッジについて</button>
    </div>
    <div id="scp-input-row">
      <input id="scp-inp" type="text" placeholder="質問を入力…" autocomplete="off">
      <button id="scp-send">送信</button>
    </div>
    <div id="scp-full-link"><a href="/ask.html">全画面で開く →</a></div>
  `;
  document.body.appendChild(panel);

  const msgs = document.getElementById('scp-msgs');
  const inp = document.getElementById('scp-inp');
  const sendBtn = document.getElementById('scp-send');
  const sugsEl = document.getElementById('scp-sugs');
  let busy = false;
  let hist = [];

  function togglePanel() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) inp.focus();
  }

  fab.addEventListener('click', togglePanel);
  document.getElementById('scp-close').addEventListener('click', () => panel.classList.remove('open'));

  sugsEl.querySelectorAll('.scp-sug').forEach(btn => {
    btn.addEventListener('click', () => { sugsEl.style.display = 'none'; doSend(btn.textContent); });
  });

  inp.addEventListener('keydown', e => { if (e.key === 'Enter') doSend(inp.value.trim()); });
  sendBtn.addEventListener('click', () => doSend(inp.value.trim()));

  function addMsg(text, role, id) {
    const d = document.createElement('div');
    d.className = 'scp-msg ' + (role === 'user' ? 'user' : 'ai');
    if (id) d.id = id;
    if (role === 'typing') {
      d.innerHTML = '<span class="scp-typing"><span></span><span></span><span></span></span>';
      d.className = 'scp-msg ai';
    } else if (role === 'user') {
      d.textContent = text;
    } else {
      d.innerHTML = text.replace(/</g, '&lt;').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  // Intercept "送信しました" / form-success divs → open chat instead
  const observer = new MutationObserver(() => {
    const targets = ['form-success','cf-done','form-sent','submit-success','contact-done'];
    targets.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.style.display !== 'none' && !el.dataset.chatIntercepted) {
        el.dataset.chatIntercepted = '1';
        el.style.display = 'none';
        panel.classList.add('open');
        inp.focus();
        if (!document.getElementById('scp-intercept-msg')) {
          const notice = document.createElement('div');
          notice.id = 'scp-intercept-msg';
          notice.className = 'scp-msg ai';
          notice.textContent = 'お問い合わせをありがとうございます。こちらで直接お答えできます。何でも聞いてください。';
          msgs.appendChild(notice);
          msgs.scrollTop = msgs.scrollHeight;
        }
      }
    });
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });

  async function doSend(text) {
    if (!text || busy) return;
    busy = true;
    sugsEl.style.display = 'none';
    sendBtn.disabled = true;
    inp.value = '';
    addMsg(text, 'user');
    hist.push({ role: 'user', content: text });
    const tid = 'scp-t' + Date.now();
    addMsg('', 'typing', tid);
    try {
      const r = await fetch('/api/soluna/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: hist.slice(-6) })
      });
      const d = await r.json();
      const reply = d.reply || 'エラーが発生しました。';
      hist.push({ role: 'assistant', content: reply });
      const el = document.getElementById(tid);
      if (el) el.innerHTML = reply.replace(/</g, '&lt;').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } catch {
      const el = document.getElementById(tid);
      if (el) el.textContent = '通信エラーが発生しました。';
    } finally {
      busy = false;
      sendBtn.disabled = false;
      msgs.scrollTop = msgs.scrollHeight;
    }
  }
})();
