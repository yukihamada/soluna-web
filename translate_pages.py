#!/usr/bin/env python3
"""
Add EN/JA language toggle to all SOLUNA pages.
- Adds data-en="..." attributes to elements with Japanese text
- Adds lang.js + toggle button to gnav
- Uses Claude Haiku for translation
"""
import os, re, glob, json, time, sys
import anthropic
from bs4 import BeautifulSoup, NavigableString, Comment

client = anthropic.Anthropic()
CABIN = os.path.join(os.path.dirname(__file__), 'cabin')

SKIP_SLUGS = {
    '404','admin','approve','blank','cancel','materials-admin',
    'pay','slide','staff','take','take-sips','thanks','visitor-log',
    'app','agent','chat','ask','member','book','flow',
    'neuro-dashboard','neuro-portal','status','lang',
}

HAS_JA = re.compile(r'[　-鿿＀-￯]')

TOGGLE_HTML = '''<button class="lang-toggle" aria-label="Language" title="Switch language" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:3px;padding:5px 10px;opacity:.8;transition:opacity .2s">
        <span class="lt-en" style="font-size:9px;font-weight:700;letter-spacing:.08em;color:#c8a455;transition:opacity .2s">EN</span>
        <span style="font-size:9px;color:#3a3a3a">/</span>
        <span class="lt-ja" style="font-size:9px;font-weight:700;letter-spacing:.08em;color:#c8a455;transition:opacity .2s">JA</span>
      </button>'''


def is_translatable(text):
    return bool(text and HAS_JA.search(text) and len(text.strip()) > 1)


def collect_texts(soup):
    """Collect unique Japanese text strings from visible elements."""
    texts = set()
    skip_tags = {'script','style','code','pre','noscript','template'}

    for el in soup.find_all(True):
        if el.name in skip_tags:
            continue
        if 'data-en' in el.attrs:
            continue
        # Leaf-like: element whose direct text (not children's) is Japanese
        direct_text = ''.join(
            str(c) for c in el.children
            if isinstance(c, NavigableString) and not isinstance(c, Comment)
        ).strip()
        if is_translatable(direct_text):
            texts.add(direct_text)

    # Also collect attribute values
    for el in soup.find_all(True, attrs={'placeholder': HAS_JA.pattern}):
        t = el.get('placeholder','')
        if is_translatable(t): texts.add(t)
    for el in soup.find_all(True, attrs={'alt': True}):
        t = el.get('alt','')
        if is_translatable(t): texts.add(t)
    for el in soup.find_all('meta', attrs={'content': True}):
        t = el.get('content','')
        if is_translatable(t): texts.add(t)
    title_tag = soup.find('title')
    if title_tag and is_translatable(title_tag.string or ''):
        texts.add(title_tag.string.strip())

    return list(texts)


def translate_batch(texts, slug=''):
    """Translate texts via Claude Haiku. Returns {ja: en} dict."""
    if not texts:
        return {}

    system = """You are a professional translator for SOLUNA, a luxury Japanese resort brand.
Translate Japanese to natural, elegant English. Return ONLY valid JSON:
{"translations": [{"ja": "original", "en": "english"}]}

Rules:
- Luxury brand tone — sophisticated, not casual
- Keep: SOLUNA, TAPKOP, THE LODGE, NESTING, WHITE HOUSE, KUMAUSHI BASE, Enabler Inc.
- Locations in English: 北海道弟子屈→"Teshikaga, Hokkaido", 阿寒摩周→"Akan-Mashu", 熱海→"Atami", ハワイ→"Hawaii"
- UI: 購入→Purchase, 物件→Properties, オーナーになる→Become an Owner, よくある質問→FAQ
- Keep prices/numbers/symbols unchanged
- If already English, omit from output"""

    user = f"Translate these strings (page: {slug}):\n{json.dumps(texts, ensure_ascii=False, indent=2)}"

    try:
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=4096,
            system=system,
            messages=[{"role":"user","content":user}]
        )
        raw = resp.content[0].text
        m = re.search(r'\{[\s\S]*\}', raw)
        if not m:
            return {}
        data = json.loads(m.group())
        return {item['ja']: item['en'] for item in data.get('translations', [])
                if 'ja' in item and 'en' in item and item['ja'] != item['en']}
    except Exception as e:
        print(f"\n  ⚠ API error: {e}")
        return {}


def inject_translations(soup, translations):
    """Add data-en attributes to elements."""
    skip_tags = {'script','style','code','pre','noscript','template'}
    count = 0

    for el in soup.find_all(True):
        if el.name in skip_tags:
            continue
        if 'data-en' in el.attrs:
            continue

        direct_text = ''.join(
            str(c) for c in el.children
            if isinstance(c, NavigableString) and not isinstance(c, Comment)
        ).strip()

        if direct_text and direct_text in translations:
            en = translations[direct_text]
            if en and en != direct_text:
                el['data-en'] = en
                count += 1

    # Attributes
    for el in soup.find_all(True):
        if el.get('placeholder','') in translations:
            el['data-en-placeholder'] = translations[el['placeholder']]
            count += 1
        if el.get('alt','') in translations:
            el['data-en-alt'] = translations[el['alt']]
            count += 1

    # Meta description
    for el in soup.find_all('meta', attrs={'name': 'description'}):
        t = el.get('content','')
        if t in translations:
            el['data-en-content'] = translations[t]
            count += 1

    # Title
    title_tag = soup.find('title')
    if title_tag and (title_tag.string or '').strip() in translations:
        en_title = translations[title_tag.string.strip()]
        title_tag['data-en'] = en_title
        count += 1

    return count


def add_infrastructure(html):
    """Add lang.js script tag and toggle button to gnav."""
    changed = False

    # Add lang.js before </body>
    if 'lang.js' not in html:
        html = html.replace('</body>', '<script src="/lang.js"></script>\n</body>', 1)
        changed = True

    # Add toggle button into gnav (before gnav-ham)
    if 'lang-toggle' not in html and 'gnav-ham' in html:
        html = re.sub(
            r'(<div[^>]+gnav-ham[^>]*>)',
            TOGGLE_HTML + '\n  \\1',
            html, count=1
        )
        changed = True

    return html, changed


def process_file(fpath):
    slug = os.path.basename(fpath).replace('.html','')
    if slug in SKIP_SLUGS:
        return 'skip'

    with open(fpath, 'r', encoding='utf-8') as f:
        original = f.read()

    # Add infrastructure regardless
    html, infra_changed = add_infrastructure(original)

    # Only translate if Japanese text exists
    if not HAS_JA.search(html):
        if infra_changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(html)
        return 'infra-only'

    # Parse with BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    texts = collect_texts(soup)
    if not texts:
        if infra_changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(html)
        return 'no-texts'

    # Translate in batches of 40
    translations = {}
    for i in range(0, len(texts), 40):
        batch = texts[i:i+40]
        t = translate_batch(batch, slug)
        translations.update(t)
        if i + 40 < len(texts):
            time.sleep(0.5)

    if not translations:
        return 'no-trans'

    count = inject_translations(soup, translations)

    final_html = str(soup)
    # Re-apply infrastructure (soup stringify may not preserve it)
    final_html, _ = add_infrastructure(final_html)

    if final_html != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(final_html)
        return f'✓ {count} attrs'
    return 'unchanged'


def main():
    files = sorted(glob.glob(os.path.join(CABIN, '*.html')))

    # Filter to specific slugs if given as args
    if len(sys.argv) > 1:
        targets = set(sys.argv[1:])
        files = [f for f in files if os.path.basename(f).replace('.html','') in targets]

    total = len(files)
    print(f"Translating {total} files...\n")

    ok, skipped, errors = 0, 0, 0
    for i, fpath in enumerate(files):
        slug = os.path.basename(fpath).replace('.html','')
        print(f"[{i+1:3}/{total}] {slug:<30}", end='', flush=True)
        try:
            result = process_file(fpath)
            print(result)
            if result == 'skip':
                skipped += 1
            else:
                ok += 1
        except Exception as e:
            print(f'ERROR: {e}')
            errors += 1

    print(f"\nDone — ✓{ok}  skip:{skipped}  err:{errors}")


if __name__ == '__main__':
    main()
