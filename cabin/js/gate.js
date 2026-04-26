/**
 * SOLUNA partial gate — shows N public sections freely,
 * blurs the rest with an inline OTP login card.
 * Reads sln_token from localStorage; cookie is set by /api/soluna/verify.
 */
(function () {
  var PAGE_CONFIG = {
    // Manufacturing design specs
    "manufacturing/sekkei":         { pub: 2, sel: ".section" },
    "manufacturing/cluster":        { pub: 2, sel: ".section" },
    "manufacturing/cluster-living": { pub: 2, sel: ".section" },
    "manufacturing/kumanoki":       { pub: 2, sel: ".section" },
    "manufacturing/mycelium-lab":   { pub: 2, sel: ".section" },
    "manufacturing/3d-mold":        { pub: 1, sel: ".section" },
    "manufacturing/myco-furniture": { pub: 2, sel: ".section" },
    "manufacturing/house":          { pub: 2, sel: ".section" },
    // Design / project pages
    "design":                       { pub: 2, sel: ".section" },
    "plan":                         { pub: 2, sel: "section" },
    "management-fee":               { pub: 1, sel: "section.fee-section" },
  };

  var key = location.pathname.replace(/^\//, "").replace(/\.html$/, "");
  var cfg = PAGE_CONFIG[key];
  if (!cfg) return;

  var CSS = [
    ".sln-gate-blur{filter:blur(5px);pointer-events:none;user-select:none;opacity:.35;transition:all .4s}",
    "#sln-gate-card{background:#0e0c0a;border:1px solid #2a2520;border-radius:8px;padding:36px 32px;margin:48px auto;max-width:440px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}",
    "#sln-gate-card .gc-logo{font-size:9px;font-weight:800;letter-spacing:.28em;color:#c8a455;margin-bottom:20px}",
    "#sln-gate-card .gc-h{font-size:18px;font-weight:900;color:#f0ece4;margin-bottom:6px}",
    "#sln-gate-card .gc-sub{font-size:12px;color:#666;margin-bottom:24px;line-height:1.7}",
    "#sln-gate-card label{display:block;font-size:8px;letter-spacing:.16em;color:#555;margin-bottom:5px;text-transform:uppercase}",
    "#sln-gate-card input{width:100%;background:#0a0908;border:1px solid #2a2520;color:#c8c0b0;padding:11px 13px;border-radius:4px;font-size:13px;outline:none;margin-bottom:10px;font-family:inherit;box-sizing:border-box}",
    "#sln-gate-card input:focus{border-color:#c8a455}",
    "#sln-gate-card .gc-btn{width:100%;background:#c8a455;color:#0a0908;font-weight:800;font-size:11px;letter-spacing:.12em;padding:13px;border:none;border-radius:4px;cursor:pointer}",
    "#sln-gate-card .gc-btn:hover{background:#d4b068}",
    "#sln-gate-card .gc-msg{margin-top:12px;font-size:12px;min-height:18px;text-align:center}",
    "#sln-gate-card .gc-ok{color:#4a9a5a}#sln-gate-card .gc-err{color:#c0392b}",
    "#sln-gate-card .gc-back{font-size:11px;color:#555;background:none;border:none;text-decoration:underline;cursor:pointer;display:block;text-align:center;margin-top:10px}",
    "#sln-gate-card #gc-s2{display:none}",
    "#sln-gate-card .gc-divider{margin:24px 0;border:none;border-top:1px solid #1e1c18}",
    "#sln-gate-card .gc-note{font-size:10px;color:#3a3028;text-align:center;line-height:1.6}",
  ].join("");

  function injectCSS() {
    if (document.getElementById("sln-gate-css")) return;
    var s = document.createElement("style");
    s.id = "sln-gate-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function buildCard() {
    var d = document.createElement("div");
    d.id = "sln-gate-card";
    d.innerHTML = [
      '<div class="gc-logo">SOLUNA</div>',
      '<h3 class="gc-h">メンバー限定コンテンツ</h3>',
      '<p class="gc-sub">この先はSOLUNAメンバー限定の詳細仕様です。<br>メールアドレスでログインすると続きをご覧になれます。</p>',
      '<div id="gc-s1">',
        '<label>メールアドレス</label>',
        '<input type="email" id="gc-email" placeholder="your@email.com" autocomplete="email">',
        '<button class="gc-btn" id="gc-send">コードを送信</button>',
        '<div class="gc-msg" id="gc-m1"></div>',
      '</div>',
      '<div id="gc-s2">',
        '<label>確認コード（6桁）</label>',
        '<input type="text" id="gc-code" placeholder="000000" maxlength="6" inputmode="numeric">',
        '<button class="gc-btn" id="gc-verify">ログインして続きを読む</button>',
        '<button class="gc-back" id="gc-back">← メールを変更</button>',
        '<div class="gc-msg" id="gc-m2"></div>',
      '</div>',
      '<hr class="gc-divider">',
      '<p class="gc-note">SOLUNAオーナー・会員の方はメールアドレスを入力してください。<br>コードはメールにて5分以内に届きます。</p>',
    ].join("");
    return d;
  }

  function reveal(sections, card) {
    sections.forEach(function (el) { el.classList.remove("sln-gate-blur"); });
    if (card && card.parentNode) card.parentNode.removeChild(card);
  }

  function applyGate(toGate) {
    injectCSS();
    toGate.forEach(function (el) { el.classList.add("sln-gate-blur"); });

    var card = buildCard();
    toGate[0].parentNode.insertBefore(card, toGate[0]);

    // Wire up events
    var emailEl = document.getElementById("gc-email");
    var codeEl  = document.getElementById("gc-code");
    var m1 = document.getElementById("gc-m1");
    var m2 = document.getElementById("gc-m2");
    var s1 = document.getElementById("gc-s1");
    var s2 = document.getElementById("gc-s2");

    function setMsg(el, txt, cls) {
      el.textContent = txt;
      el.className = "gc-msg" + (cls ? " " + cls : "");
    }

    document.getElementById("gc-send").addEventListener("click", function () {
      var email = emailEl.value.trim();
      if (!email) { setMsg(m1, "メールアドレスを入力してください", "gc-err"); return; }
      setMsg(m1, "送信中...", "");
      fetch("/api/soluna/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.error) { setMsg(m1, d.error, "gc-err"); }
        else { s1.style.display = "none"; s2.style.display = ""; setMsg(m2, "", ""); }
      }).catch(function () { setMsg(m1, "エラーが発生しました", "gc-err"); });
    });

    document.getElementById("gc-verify").addEventListener("click", function () {
      var email = emailEl.value.trim();
      var code  = codeEl.value.trim();
      if (!code) { setMsg(m2, "コードを入力してください", "gc-err"); return; }
      setMsg(m2, "確認中...", "");
      fetch("/api/soluna/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, code: code }),
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d.error) { setMsg(m2, d.error, "gc-err"); return; }
        localStorage.setItem("sln_token", d.token);
        setMsg(m2, "ログインしました。コンテンツを表示しています...", "gc-ok");
        setTimeout(function () { reveal(toGate, card); }, 500);
      }).catch(function () { setMsg(m2, "エラーが発生しました", "gc-err"); });
    });

    document.getElementById("gc-back").addEventListener("click", function () {
      s2.style.display = "none"; s1.style.display = ""; setMsg(m1, "", "");
    });

    emailEl.addEventListener("keypress", function (e) { if (e.key === "Enter") document.getElementById("gc-send").click(); });
    codeEl.addEventListener("keypress",  function (e) { if (e.key === "Enter") document.getElementById("gc-verify").click(); });
  }

  function run() {
    var all = Array.from(document.querySelectorAll(cfg.sel));
    var toGate = all.slice(cfg.pub);
    if (!toGate.length) return;

    var token = localStorage.getItem("sln_token");
    if (token) {
      // Verify silently; only gate if token is invalid
      fetch("/api/soluna/me", { headers: { Authorization: "Bearer " + token } })
        .then(function (r) { if (!r.ok) applyGate(toGate); })
        .catch(function () { applyGate(toGate); });
    } else {
      applyGate(toGate);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
