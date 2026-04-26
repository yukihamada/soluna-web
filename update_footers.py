#!/usr/bin/env python3
"""全HTMLページのフッターをアコーディオン折りたたみ式に統一する"""
import os, re, glob

# ── フッター HTML ──────────────────────────────────────────
FOOTER_HTML = """<footer class="sln-footer">
  <div class="sf-brand">
    <span class="sf-logo">SOLUNA</span>
    <span class="sf-sub">北海道弟子屈 · 8棟100人ビレッジ · Enabler Inc.</span>
  </div>
  <div class="sf-grid">

    <div class="sf-col">
      <button class="sf-hd" onclick="sfToggle(this)" aria-expanded="false">
        <span>物件</span><span class="sf-ic">+</span>
      </button>
      <div class="sf-bd">
        <a href="tapkop-story">TAPKOP — 弟子屈</a>
        <a href="lodge-story">THE LODGE — 美留和</a>
        <a href="nesting-story">NESTING — 美留和</a>
        <a href="atami-story">WHITE HOUSE — 熱海</a>
        <a href="kumaushi">KUMAUSHI BASE</a>
        <a href="village">美留和ビレッジ</a>
        <a href="miruwa-grand">美留和グランド</a>
        <a href="instant">インスタントハウス</a>
        <a href="collection">全物件一覧 →</a>
      </div>
    </div>

    <div class="sf-col">
      <button class="sf-hd" onclick="sfToggle(this)" aria-expanded="false">
        <span>購入・参加</span><span class="sf-ic">+</span>
      </button>
      <div class="sf-bd">
        <a href="buy">オーナーになる</a>
        <a href="workparty">Work Party</a>
        <a href="hold">長期保有プラン</a>
        <a href="mint">NFT 口数</a>
        <a href="gift">ギフト</a>
        <a href="referral">紹介制度</a>
        <a href="getfree">無料で口数を得る</a>
        <a href="founders">Founders</a>
        <a href="pass">Season Pass</a>
        <a href="crypto">Crypto 購入</a>
      </div>
    </div>

    <div class="sf-col">
      <button class="sf-hd" onclick="sfToggle(this)" aria-expanded="false">
        <span>建築・設計</span><span class="sf-ic">+</span>
      </button>
      <div class="sf-bd">
        <a href="homes">カタログビレッジ</a>
        <a href="kits">ハードキット</a>
        <a href="floorplans">間取り集</a>
        <a href="design">デザイン</a>
        <a href="neuro">NEURO AI</a>
        <a href="offgrid">オフグリッド</a>
        <a href="sips">SIPs 断熱</a>
        <a href="construction">建築計画</a>
        <a href="blueprint">ブループリント</a>
        <a href="tower-sauna">タワーサウナ</a>
        <a href="dome-story">ドームの話</a>
      </div>
    </div>

    <div class="sf-col">
      <button class="sf-hd" onclick="sfToggle(this)" aria-expanded="false">
        <span>コミュニティ</span><span class="sf-ic">+</span>
      </button>
      <div class="sf-bd">
        <a href="community">コミュニティ</a>
        <a href="members">メンバー一覧</a>
        <a href="network">ネットワーク</a>
        <a href="owners">オーナー専用</a>
        <a href="miruwa-owners">美留和オーナー</a>
        <a href="story">ストーリー</a>
        <a href="origin">創業の話</a>
        <a href="blog">ブログ</a>
        <a href="song">SOLUNA ソング</a>
      </div>
    </div>

    <div class="sf-col">
      <button class="sf-hd" onclick="sfToggle(this)" aria-expanded="false">
        <span>情報・サポート</span><span class="sf-ic">+</span>
      </button>
      <div class="sf-bd">
        <a href="faq">よくある質問</a>
        <a href="brochure">パンフレット</a>
        <a href="management-fee">管理費</a>
        <a href="call">個別相談</a>
        <a href="contact">お問い合わせ</a>
        <a href="mailto:info@solun.art">info@solun.art</a>
        <a href="company">会社情報</a>
        <a href="tokushoho">特定商取引法</a>
        <a href="privacy">プライバシー</a>
        <a href="terms">利用規約</a>
      </div>
    </div>

  </div>
  <div class="sf-copy">
    <span>© 2025 Enabler Inc. — ★ Airbnb Super Host</span>
    <span class="sf-copy-links">
      <a href="privacy">Privacy</a>
      <a href="terms">Terms</a>
      <a href="tokushoho">特商法</a>
      <a href="contact">Contact</a>
    </span>
  </div>
</footer>
<style>
.sln-footer{background:#030303;border-top:1px solid #0d0d0d;padding:56px 24px 32px;font-family:'Helvetica Neue',-apple-system,'Noto Sans JP',sans-serif}
.sf-brand{display:flex;align-items:baseline;gap:14px;margin-bottom:40px;padding-bottom:28px;border-bottom:1px solid #0f0f0f}
.sf-logo{font-size:13px;font-weight:800;letter-spacing:.22em;color:#c8a455}
.sf-sub{font-size:10px;color:#2a2a2a;letter-spacing:.06em}
.sf-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:0;border-top:1px solid #0f0f0f;border-left:1px solid #0f0f0f}
.sf-col{border-right:1px solid #0f0f0f;border-bottom:1px solid #0f0f0f}
.sf-hd{width:100%;display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:none;border:none;cursor:pointer;color:#3a3a3a;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;font-family:inherit;transition:color .2s}
.sf-hd:hover{color:#c8a455}
.sf-hd[aria-expanded="true"]{color:#c8a455}
.sf-ic{font-size:14px;font-weight:300;line-height:1;transition:transform .25s;display:inline-block}
.sf-hd[aria-expanded="true"] .sf-ic{transform:rotate(45deg)}
.sf-bd{overflow:hidden;max-height:0;transition:max-height .35s cubic-bezier(.4,0,.2,1)}
.sf-bd a{display:block;padding:5px 18px;font-size:10.5px;color:#333;text-decoration:none;line-height:1.9;transition:color .2s}
.sf-bd a:hover{color:#c8a455}
.sf-bd a:last-child{padding-bottom:16px}
.sf-copy{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:28px;padding-top:16px;border-top:1px solid #0f0f0f;font-size:9px;color:#1e1e1e;letter-spacing:.1em}
.sf-copy-links{display:flex;gap:16px}
.sf-copy-links a{color:#2a2a2a;text-decoration:none;transition:color .2s}
.sf-copy-links a:hover{color:#c8a455}
@media(min-width:769px){
  .sf-bd{max-height:none!important;overflow:visible}
  .sf-ic{display:none}
  .sf-hd{cursor:default;pointer-events:none}
}
@media(max-width:768px){
  .sf-grid{grid-template-columns:1fr;border-left:none}
  .sf-col{border-right:none}
  .sf-brand{flex-direction:column;gap:6px}
}
</style>
<script>
function sfToggle(btn){
  var bd=btn.nextElementSibling;
  var open=btn.getAttribute('aria-expanded')==='true';
  btn.setAttribute('aria-expanded',open?'false':'true');
  bd.style.maxHeight=open?'0':bd.scrollHeight+'px';
}
</script>"""

# ── 除外ページ ─────────────────────────────────────────────
EXCLUDE = {
    '404', 'admin', 'approve', 'blank', 'cancel', 'materials-admin',
    'pay', 'slide', 'staff', 'take', 'take-sips', 'thanks', 'visitor-log',
    'app', 'agent', 'chat', 'ask', 'member', 'book', 'flow',
    'neuro-dashboard', 'neuro-portal', 'status',
}

cabin_dir = os.path.join(os.path.dirname(__file__), 'cabin')
files = sorted(glob.glob(os.path.join(cabin_dir, '*.html')))

updated = []
skipped = []

for fpath in files:
    slug = os.path.basename(fpath).replace('.html', '')
    if slug in EXCLUDE:
        skipped.append(slug)
        continue

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 旧フッター（.sln-footer または従来の<footer>）を置換
    if '<footer' in content and '</footer>' in content:
        new_content = re.sub(
            r'<footer[\s\S]*?</footer>\s*(?:<style>[\s\S]*?</style>\s*)?(?:<script>[\s\S]*?sfToggle[\s\S]*?</script>)?',
            FOOTER_HTML,
            content,
            count=1,
            flags=re.DOTALL
        )
    elif '</body>' in content:
        new_content = content.replace('</body>', FOOTER_HTML + '\n</body>', 1)
    else:
        skipped.append(slug + ' (no body)')
        continue

    if new_content != content:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated.append(slug)
    else:
        skipped.append(slug + ' (no change)')

print(f'Updated : {len(updated)}')
print(f'Skipped : {len(skipped)}')
