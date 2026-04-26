#!/usr/bin/env python3
"""Generate manufacturing specification PDFs for SOLUNA MATERIALS products."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
import os

# Register Japanese font
pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
FONT = "HeiseiKakuGo-W5"

OUT_DIR = os.path.join(os.path.dirname(__file__), "pdf")
os.makedirs(OUT_DIR, exist_ok=True)

GOLD = HexColor("#C8A455")
DARK = HexColor("#1A1A1A")
GRAY = HexColor("#666666")
LIGHT = HexColor("#F5F0E8")
WHITE = HexColor("#FFFFFF")
GREEN = HexColor("#4ADE80")
RED = HexColor("#FF5050")

W, H = A4  # 595 x 842

def draw_header(c, title, subtitle):
    """Draw branded header bar."""
    c.setFillColor(DARK)
    c.rect(0, H - 80, W, 80, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont(FONT, 9)
    c.drawString(30, H - 25, "SOLUNA MATERIALS — 製造仕様書")
    c.setFillColor(WHITE)
    c.setFont(FONT, 18)
    c.drawString(30, H - 55, title)
    c.setFillColor(HexColor("#999999"))
    c.setFont(FONT, 9)
    c.drawString(30, H - 72, subtitle)
    # version
    c.setFillColor(GOLD)
    c.setFont(FONT, 8)
    c.drawRightString(W - 30, H - 25, "Rev 1.0 — 2026-04-22")
    c.drawRightString(W - 30, H - 38, "SOLUNA合同会社")

def draw_footer(c, page, product_code):
    c.setFillColor(HexColor("#CCCCCC"))
    c.setFont(FONT, 7)
    c.drawString(30, 20, f"{product_code} — SOLUNA MATERIALS 製造仕様書")
    c.drawRightString(W - 30, 20, f"Page {page}")
    c.setStrokeColor(HexColor("#DDDDDD"))
    c.line(30, 35, W - 30, 35)

def section_title(c, y, num, title):
    """Draw section heading. Returns new y."""
    c.setFillColor(GOLD)
    c.setFont(FONT, 12)
    c.drawString(30, y, f"{num}. {title}")
    c.setStrokeColor(GOLD)
    c.line(30, y - 4, W - 30, y - 4)
    return y - 22

def body_text(c, y, text, indent=30, max_width=535):
    """Draw body text with word wrap. Returns new y."""
    c.setFillColor(DARK)
    c.setFont(FONT, 9)
    # Simple char-based wrapping for Japanese
    chars_per_line = int(max_width / 9 * 2)  # rough estimate
    lines = []
    for line in text.split("\n"):
        while len(line) > chars_per_line:
            lines.append(line[:chars_per_line])
            line = line[chars_per_line:]
        lines.append(line)
    for line in lines:
        if y < 50:
            return y  # caller should handle page break
        c.drawString(indent, y, line)
        y -= 14
    return y

def bullet_list(c, y, items, indent=40):
    """Draw bullet list. Returns new y."""
    c.setFont(FONT, 9)
    for item in items:
        if y < 50:
            return y
        c.setFillColor(GOLD)
        c.drawString(indent - 10, y, "●")
        c.setFillColor(DARK)
        # wrap long items
        chars = int(490 / 9 * 2)
        text = item
        first = True
        while text:
            chunk = text[:chars]
            text = text[chars:]
            c.drawString(indent + 4, y, chunk)
            y -= 14
            first = False
        if first:
            y -= 14
    return y

def table_row(c, y, cols, widths, header=False):
    """Draw a table row. Returns new y."""
    x = 30
    if header:
        c.setFillColor(LIGHT)
        c.rect(x, y - 4, sum(widths), 18, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.setFont(FONT, 8)
    else:
        c.setFillColor(DARK)
        c.setFont(FONT, 8)
    for i, col in enumerate(cols):
        c.drawString(x + 4, y, str(col))
        x += widths[i]
    c.setStrokeColor(HexColor("#DDDDDD"))
    c.line(30, y - 5, 30 + sum(widths), y - 5)
    return y - 18

def numbered_steps(c, y, steps, indent=40):
    """Draw numbered process steps. Returns new y."""
    for i, (title, desc) in enumerate(steps, 1):
        if y < 70:
            return y
        # Number circle
        c.setFillColor(GOLD)
        c.circle(indent - 5, y + 3, 8, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(FONT, 8)
        c.drawCentredString(indent - 5, y, str(i))
        # Title
        c.setFillColor(DARK)
        c.setFont(FONT, 10)
        c.drawString(indent + 10, y, title)
        y -= 16
        # Description
        c.setFillColor(GRAY)
        c.setFont(FONT, 8)
        chars = int(480 / 8 * 2)
        text = desc
        while text:
            chunk = text[:chars]
            text = text[chars:]
            c.drawString(indent + 10, y, chunk)
            y -= 12
        y -= 6
    return y

def inspection_table(c, y, items, widths=[160, 120, 100, 155]):
    """Draw inspection checklist table."""
    y = table_row(c, y, ["検査項目", "基準値", "検査方法", "判定基準"], widths, header=True)
    for row in items:
        y = table_row(c, y, row, widths)
        if y < 50:
            return y
    return y


# ================================================================
# PRODUCT 1: 焼きカラマツパネル (Yakiita)
# ================================================================
def gen_yakiita():
    path = os.path.join(OUT_DIR, "yakiita_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-YK-001"

    # Page 1
    draw_header(c, "焼きカラマツパネル 製造仕様書", "Charred Larch Cladding Panel — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "北海道産カラマツ間伐材を用いた焼杉（しょうすぎばん）外装パネル。\nバーナー炙り＋ワイヤーブラシ＋亜麻仁油仕上げにより、30年以上メンテナンスフリーの外壁材を実現。")
    y -= 8

    y = section_title(c, y, 2, "製品仕様")
    widths = [140, 395]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    specs = [
        ["品名", "焼きカラマツパネル（焼杉仕上げ）"],
        ["樹種", "カラマツ（北海道産間伐材）"],
        ["寸法", "12mm × 105mm × 1,820mm（標準）"],
        ["重量", "約7 kg/m²"],
        ["含水率", "≤15%（人工乾燥材）"],
        ["炭化深度", "2〜3mm"],
        ["表面処理", "バーナー炙り → ワイヤーブラシ → 亜麻仁油塗布"],
        ["防火性能", "JIS A 1321 準拠（炭化層による延焼抑制）"],
        ["耐朽性", "炭化層が腐朽菌・シロアリを抑制"],
        ["耐久年数", "30年以上（無塗装メンテナンスフリー）"],
        ["施工方法", "縦張り / 横張り / 鎧張り（下見板張り）"],
        ["最小ロット", "5m²〜"],
        ["納期", "受注後2週間"],
    ]
    for row in specs:
        y = table_row(c, y, row, widths)
    y -= 12

    y = section_title(c, y, 3, "原材料")
    y = bullet_list(c, y, [
        "カラマツ板材（人工乾燥 含水率15%以下）— 北海道森林組合 or 製材所",
        "亜麻仁油（raw linseed oil）— 食品グレード可、1L/10m²",
        "ワイヤーブラシ（真鍮 or ステンレス）",
        "バーナー（プロパン or ブタン、草焼きバーナー可）",
    ])
    y -= 8

    y = section_title(c, y, 4, "必要設備")
    y = bullet_list(c, y, [
        "製材機（帯鋸 or 丸鋸）— 板材調達済みの場合不要",
        "人工乾燥窯 or 天然乾燥場（含水率15%以下まで）",
        "プロパンバーナー × 作業者数",
        "ワイヤーブラシ（電動 or 手動）",
        "作業台（1,900mm以上）",
        "消火器・防火水槽（安全対策）",
        "亜麻仁油塗布用刷毛・ウエス",
        "乾燥ラック（油乾燥24〜48時間）",
    ])

    c.showPage()

    # Page 2
    draw_header(c, "焼きカラマツパネル 製造仕様書", "Manufacturing Process & Inspection")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 5, "製造工程")
    steps = [
        ("原材料受入・検品", "カラマツ板材の含水率を測定（≤15%）。割れ・反り・節の大きさを目視検査。不良品は除外。"),
        ("寸法カット", "12mm × 105mm × 1,820mm に製材。端部を直角にカット。寸法公差 ±1mm。"),
        ("バーナー炙り", "板表面を30cm距離で15〜20秒/枚、均一に炭化。炭化深度2〜3mm。裏面は炙らない。端部まで均一に。"),
        ("冷却", "自然冷却5〜10分。完全に冷えてから次工程へ。水冷は不可（割れの原因）。"),
        ("ワイヤーブラシ", "木目方向に沿ってブラッシング。浮造り（うづくり）仕上げ。炭の粉を除去し木目を浮き上がらせる。"),
        ("亜麻仁油塗布", "刷毛で薄く均一に1回塗布。過剰塗布は拭き取る。塗布量：約100mL/m²。"),
        ("乾燥", "風通しの良い場所で24〜48時間自然乾燥。直射日光は避ける。"),
        ("最終検品", "外観検査（色ムラ・炭化ムラ・油ムラ）、寸法検査、含水率再測定。"),
        ("梱包", "10枚単位でPPバンド結束。段ボール角当て。パレット積み。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    # Page 3
    draw_header(c, "焼きカラマツパネル 製造仕様書", "Inspection & Packaging")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 6, "品質検査基準")
    inspections = [
        ["含水率", "≤15%", "含水率計", "15%超は再乾燥"],
        ["板寸法", "12×105×1820mm", "スケール", "公差±1mm以内"],
        ["炭化深度", "2〜3mm", "断面目視+ノギス", "2mm未満は再炙り"],
        ["炭化均一性", "全面均一", "目視", "未炭化部0.5cm²以上は不良"],
        ["割れ・反り", "反り≤3mm/m", "定規+隙間ゲージ", "3mm超は除外"],
        ["油膜", "均一・ベタつきなし", "触手+目視", "ベタつきは拭取り再乾燥"],
        ["節", "径20mm以下、抜け節なし", "目視", "抜け節は充填処理"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 7, "梱包・出荷仕様")
    y = bullet_list(c, y, [
        "1束＝10枚（約1.9m²）、PPバンド2本結束",
        "段ボール角当て4箇所（輸送時の角欠け防止）",
        "パレット積み：1パレット最大20束（約38m²）",
        "防水シート巻き（屋外保管対策）",
        "ラベル：製品名、ロット番号、製造日、枚数、m²数",
    ])
    y -= 12

    y = section_title(c, y, 8, "価格・発注条件")
    widths2 = [180, 180, 175]
    y = table_row(c, y, ["数量", "単価", "備考"], widths2, header=True)
    y = table_row(c, y, ["5〜9m²", "¥4,600/m²", "小口"], widths2)
    y = table_row(c, y, ["10〜29m²", "¥4,200/m²", "標準"], widths2)
    y = table_row(c, y, ["30m²〜", "¥3,800/m²", "大口割引"], widths2)
    y -= 12

    y = section_title(c, y, 9, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


# ================================================================
# PRODUCT 2: 籾殻断熱材 (Komenuka)
# ================================================================
def gen_komenuka():
    path = os.path.join(OUT_DIR, "komenuka_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-KM-002"

    draw_header(c, "籾殻断熱材 製造仕様書", "Rice Hull Insulation — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "国産米の副産物である籾殻を活用した自然素材断熱材。\nホウ酸処理により防火・防虫・防カビ性能を付与。MBV（調湿性能）1.5〜2.0で\nEPS断熱材の17倍の調湿能力。農業廃棄物の高付加価値化を実現。")
    y -= 8

    y = section_title(c, y, 2, "製品仕様")
    widths = [160, 375]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    for row in [
        ["品名", "籾殻断熱材（ホウ酸処理済）"],
        ["原料", "国産米籾殻（北海道・秋田・山形産）"],
        ["熱伝導率", "0.045〜0.055 W/mK"],
        ["断熱性能", "R-11相当/100mm（imperial）/ 約2.0 m²K/W"],
        ["MBV（調湿値）", "1.5〜2.0（EPS比17倍）"],
        ["嵩密度", "90〜110 kg/m³（充填後）"],
        ["防火処理", "ホウ酸5〜8%水溶液含浸"],
        ["含水率", "≤10%（出荷時）"],
        ["荷姿", "クラフト袋 20kg/袋（約0.2m³）"],
        ["被覆面積", "1袋≒2m²（100mm厚充填時）"],
        ["最小ロット", "5袋〜"],
        ["納期", "受注後1〜2週間"],
    ]:
        y = table_row(c, y, row, widths)
    y -= 12

    y = section_title(c, y, 3, "原材料・調達先")
    y = bullet_list(c, y, [
        "籾殻 — JAライスセンター（無料〜¥3/kg）、収穫期（9〜11月）に大量確保",
        "ホウ酸（工業用 純度99%以上）— 薬品卸業者¥200〜300/kg、小売¥500〜800/kg",
        "クラフト紙袋（20kg用、PP内袋付き）— 包材業者",
        "水（ホウ酸水溶液調合用）",
    ])

    c.showPage()

    draw_header(c, "籾殻断熱材 製造仕様書", "Manufacturing Process")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 4, "必要設備")
    y = bullet_list(c, y, [
        "乾燥機 or 天日乾燥場（ブルーシート敷き、撹拌用フォーク）",
        "振動篩（ふるい）— メッシュ#4〜#8、夾雑物除去用",
        "ホウ酸溶解タンク（200L以上、温水攪拌）",
        "スプレー装置 or 浸漬槽（ホウ酸処理用）",
        "含水率計（木材用 or 穀物用）",
        "自動計量・袋詰め機（手動可：台秤+シーラー）",
        "パレット・フォークリフト（保管・出荷用）",
    ])
    y -= 8

    y = section_title(c, y, 5, "製造工程")
    steps = [
        ("籾殻受入・一次検品", "JAライスセンター等から受入。異物（石・藁くず・土）の混入率を確認。含水率測定。受入基準：含水率≤20%、異物≤5%。"),
        ("乾燥", "天日乾燥：ブルーシート上で2〜3日（撹拌1日2回）。機械乾燥：50〜60℃で4〜6時間。目標含水率≤12%。"),
        ("篩分け（ふるいわけ）", "振動篩#4〜#8で藁片・小石・粉塵を除去。粒度を均一化。除去率：原料の5〜10%が除去される。"),
        ("ホウ酸処理", "ホウ酸5〜8%水溶液を調合（40℃温水で溶解）。スプレー噴霧 or 浸漬処理。籾殻全量に均一に行き渡らせる。処理量：溶液300mL/kg籾殻。"),
        ("二次乾燥", "ホウ酸処理後、含水率≤10%まで再乾燥。天日2〜3日 or 機械乾燥4〜6時間。乾燥不足は出荷後カビの原因。"),
        ("計量・袋詰め", "20kg単位でクラフト袋に充填。袋口をヒートシール or 縫い閉じ。ロット番号・製造日ラベル貼付。"),
        ("最終検品", "重量検査（20kg±0.5kg）、含水率再測定、外観検査（変色・異臭なし）。"),
        ("梱包・保管", "パレット積み（1パレット40袋）。屋内保管必須（雨濡れ厳禁）。防湿シート被覆。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    draw_header(c, "籾殻断熱材 製造仕様書", "Inspection & Packaging")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 6, "品質検査基準")
    inspections = [
        ["含水率", "≤10%", "穀物含水率計", "10%超は再乾燥"],
        ["嵩密度", "90〜110 kg/m³", "容器+秤", "範囲外は粒度再調整"],
        ["ホウ酸含有率", "5〜8%", "滴定法 or 試験紙", "5%未満は再処理"],
        ["異物混入", "≤1%", "目視+振動篩", "1%超は再篩"],
        ["袋重量", "20kg ±0.5kg", "台秤", "範囲外は再計量"],
        ["外観", "変色・異臭なし", "目視+嗅覚", "変色品は除外"],
        ["燃焼試験", "自己消火性", "バーナー着火10秒", "延焼する場合はホウ酸再処理"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 7, "梱包・出荷仕様")
    y = bullet_list(c, y, [
        "1袋＝20kg（クラフト紙+PP内袋）",
        "パレット積み：1パレット40袋（800kg）",
        "防湿シート被覆（屋外一時保管対策）",
        "ラベル：品名、ロット、製造日、重量、ホウ酸処理済表示",
        "全国パレット配送：¥15,000〜25,000（均一運賃）",
    ])
    y -= 12

    y = section_title(c, y, 8, "価格・発注条件")
    widths2 = [180, 180, 175]
    y = table_row(c, y, ["数量", "単価", "備考"], widths2, header=True)
    y = table_row(c, y, ["1〜4袋", "¥3,200/袋", "小口"], widths2)
    y = table_row(c, y, ["5〜19袋", "¥2,800/袋", "標準"], widths2)
    y = table_row(c, y, ["20袋〜", "¥2,400/袋", "大口"], widths2)
    y -= 12

    y = section_title(c, y, 9, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


# ================================================================
# PRODUCT 3: 杉CLTサンドパネル (Sugi CLT)
# ================================================================
def gen_sugi_clt():
    path = os.path.join(OUT_DIR, "sugi-clt_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-SC-003"

    draw_header(c, "杉CLTサンドパネル 製造仕様書", "Cedar CLT Sandwich Panel — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "国産杉CLT薄板をフェイス材、セルロースファイバーをコア断熱材とした\nサンドイッチ構造パネル。日本版SIPs（構造断熱パネル）として、\n高断熱（R-14相当）・高気密（C値≤0.5）を1枚のパネルで実現。")
    y -= 8

    y = section_title(c, y, 2, "製品仕様")
    widths = [160, 375]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    for row in [
        ["品名", "杉CLTサンドパネル"],
        ["構造", "CLT12mm + セルロース100mm + CLT12mm（3層）"],
        ["総厚", "124mm"],
        ["パネル寸法", "910 × 1,820mm（標準）、カスタム可"],
        ["重量", "約26 kg/枚（CLT×2+セルロース+枠）"],
        ["断熱性能", "R-2.5 m²K/W（100mm）→ R-14相当（imperial）"],
        ["気密性能", "C値 ≤0.5（気密テープ施工時）"],
        ["MBV（調湿値）", "1.5〜2.0（セルロースファイバー層）"],
        ["CLT規格", "JAS認証 杉CLT薄板 12mm"],
        ["コア材", "セルロースファイバー（古紙100%、ホウ酸処理）"],
        ["密度（コア）", "40〜50 kg/m³（充填後）"],
        ["最小ロット", "10枚〜"],
        ["納期", "受注後2〜3週間"],
    ]:
        y = table_row(c, y, row, widths)

    c.showPage()

    draw_header(c, "杉CLTサンドパネル 製造仕様書", "Materials & Process")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 3, "原材料")
    y = bullet_list(c, y, [
        "杉CLT薄板 12mm（JAS認証）— CLT工場（銘建工業、山佐木材等）",
        "セルロースファイバー断熱材（ホウ酸処理済）— デコスドライ等",
        "木製スペーサー枠（2×4材 or 根太材 100mm角）",
        "L字金具（枠組用、ステンレス）",
        "ビス（50mm コーススレッド、200mmピッチ）",
        "気密テープ（ブチルゴム系 50〜75mm幅）",
    ])
    y -= 8

    y = section_title(c, y, 4, "必要設備")
    y = bullet_list(c, y, [
        "パネル組立作業台（2,000 × 1,000mm以上、水平確保）",
        "丸鋸 or スライド丸鋸（CLT・枠材カット用）",
        "インパクトドライバー（ビス締め用）",
        "セルロース充填ブロワー or 手詰め道具",
        "含水率計、水平器、直角定規",
        "気密テープ施工用ローラー",
        "クランプ（枠組時の固定用）",
    ])
    y -= 8

    y = section_title(c, y, 5, "製造工程")
    steps = [
        ("材料検品・カット", "CLT薄板の含水率（≤15%）・反り・割れを検査。910×1,820mmにカット。枠材を100×38mmにカット、4辺+中間桟。"),
        ("枠組み", "L字金具で枠材を組立。直角度を確認（対角線計測、差≤2mm）。中間桟は455mmピッチ（CLTの長辺中央）。"),
        ("底面CLT固定", "枠の片面にCLT薄板をビス固定。200mmピッチ、ビス50mm。枠材全周にわたりビス固定。"),
        ("セルロース充填", "枠内にセルロースファイバーを充填。密度40〜50kg/m³になるよう圧縮充填。10〜15%過充填（沈降対策）。隙間なく均一に。"),
        ("上面CLT固定", "上面CLTを載せ、同様にビス固定（200mmピッチ）。充填材がこぼれないよう注意。"),
        ("気密テープ施工", "パネル4辺にブチルゴム気密テープ貼付。角部は重ね貼り。ローラーで圧着。テープ幅50〜75mm。"),
        ("最終検品", "寸法検査、重量検査、気密テープ密着確認、外観検査（CLT割れ・汚れ）。"),
        ("梱包", "1枚ずつPPバンド結束。角当て保護。パレット積み（5枚/パレット）。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    draw_header(c, "杉CLTサンドパネル 製造仕様書", "Inspection & Pricing")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 6, "品質検査基準")
    inspections = [
        ["パネル寸法", "910×1820×124mm", "スケール", "公差±2mm"],
        ["パネル重量", "22kg ±2kg", "台秤", "軽すぎ＝充填不足"],
        ["直角度", "対角線差≤2mm", "巻尺", "2mm超は枠再組み"],
        ["CLT含水率", "≤15%", "含水率計", "超過は使用不可"],
        ["セルロース密度", "40〜50 kg/m³", "重量/体積計算", "不足は追加充填"],
        ["気密テープ", "全周密着、剥がれなし", "目視+手触り", "浮きは再施工"],
        ["表面平滑性", "段差≤1mm", "直定規", "段差はサンディング"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 7, "価格・発注条件")
    widths2 = [180, 180, 175]
    y = table_row(c, y, ["数量", "単価", "備考"], widths2, header=True)
    y = table_row(c, y, ["≤10枚", "¥25,000/m²", "小口"], widths2)
    y = table_row(c, y, ["11〜35枚", "¥21,000/m²", "標準（26m²キャビン）"], widths2)
    y = table_row(c, y, ["36枚〜", "¥18,000/m²", "大口"], widths2)
    y -= 12

    y = section_title(c, y, 8, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


# ================================================================
# PRODUCT 4: カラマツルーバーパネル (Louver)
# ================================================================
def gen_louver():
    path = os.path.join(OUT_DIR, "louver_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-LV-004"

    draw_header(c, "カラマツルーバーパネル 製造仕様書", "Larch Louver Panel — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "北海道産カラマツ間伐材を用いた組立済ルーバーパネル。\n視線遮蔽と通風を両立する30mmピッチスラット構造。\nCNC加工による均一品質。屋外耐久3〜5年（オイル再塗装で延長）。")
    y -= 8

    y = section_title(c, y, 2, "製品仕様")
    widths = [160, 375]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    for row in [
        ["品名", "カラマツルーバーパネル"],
        ["樹種", "カラマツ（北海道産間伐材）"],
        ["スラット断面", "30mm × 60mm"],
        ["スラットピッチ", "30mm標準（20〜50mmカスタム可）"],
        ["フレーム", "アルミ押出材（シルバー/ブラック）or カラマツ材"],
        ["サイズ S", "900 × 900mm"],
        ["サイズ M", "900 × 1,800mm"],
        ["サイズ L", "1,200 × 2,400mm"],
        ["重量", "9〜12 kg/枚（サイズによる）"],
        ["表面仕上げ", "亜麻仁油2回塗り or 無塗装"],
        ["施工時間", "約30分/枚（ビス固定）"],
        ["耐候性", "オイル再塗装3〜5年サイクル"],
        ["最小ロット", "3枚〜"],
        ["納期", "在庫品2週間 / カスタム3〜4週間"],
    ]:
        y = table_row(c, y, row, widths)

    c.showPage()

    draw_header(c, "カラマツルーバーパネル 製造仕様書", "Manufacturing Process")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 3, "原材料")
    y = bullet_list(c, y, [
        "カラマツ材（人工乾燥 含水率≤15%）— 30×60mm角材",
        "フレーム材：アルミ押出材 or カラマツ角材 40×40mm",
        "ステンレスビス（M4×50mm、スラット固定用）",
        "コーナーブラケット（L字金具、ステンレス）",
        "亜麻仁油（仕上げ用）",
        "サンドペーパー（#80, #150）",
    ])
    y -= 8

    y = section_title(c, y, 4, "必要設備")
    y = bullet_list(c, y, [
        "丸鋸 or CNC（スラット長さカット）",
        "手押しカンナ or 自動カンナ（30×60mm精度出し）",
        "インパクトドライバー",
        "スペーシングジグ（30mm厚ゲージ）— 均一ピッチの要",
        "サンダー（仕上げ研磨）",
        "塗装ブース or 塗装台（油塗布・乾燥）",
        "組立治具（直角固定用）",
    ])
    y -= 8

    y = section_title(c, y, 5, "製造工程")
    steps = [
        ("製材・寸法カット", "カラマツ材を30×60mmに製材。公差±0.5mm。長さはパネル幅に合わせてカット。端部直角。"),
        ("フレーム組立", "フレーム材を指定サイズにカット。コーナーブラケットで4辺固定。対角線検査で直角度確認（差≤1mm）。"),
        ("スペーシングジグ製作", "30mm厚の木片ジグを用意。このジグをスラット間に挟むことで均一ピッチを実現。"),
        ("スラット取付", "下から順にジグを挟みながらスラットをフレームに固定。ステンレスビスでフレーム内側から斜め打ち（表面にビス頭が見えない）。"),
        ("研磨", "全体を#80→#150でサンディング。角面取り。バリ・毛羽立ち除去。"),
        ("オイル塗布", "亜麻仁油を2回塗り（1回目塗布→24時間乾燥→2回目塗布→24時間乾燥）。"),
        ("最終検品", "ピッチ均一性、ビス頭非露出、塗装ムラ、フレーム直角度を検査。"),
        ("梱包", "段ボール角当て+PPバンド結束。Mサイズ以上は木枠梱包。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    draw_header(c, "カラマツルーバーパネル 製造仕様書", "Inspection & Pricing")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 6, "品質検査基準")
    inspections = [
        ["スラット寸法", "30×60mm", "ノギス", "公差±0.5mm"],
        ["ピッチ均一性", "30mm ±2mm", "ノギス+定規", "2mm超はジグ再調整"],
        ["フレーム直角度", "対角線差≤1mm", "巻尺", "1mm超は再組立"],
        ["ビス頭", "表面非露出", "目視", "露出はカウンターシンク"],
        ["含水率", "≤15%", "含水率計", "超過は使用不可"],
        ["塗装膜", "均一・タレなし", "目視+触手", "タレは研磨再塗装"],
        ["全体反り", "≤3mm/m", "直定規", "3mm超は除外"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 7, "価格・発注条件")
    widths2 = [180, 180, 175]
    y = table_row(c, y, ["数量", "単価", "備考"], widths2, header=True)
    y = table_row(c, y, ["1〜5枚 Sサイズ", "¥10,000/m²", "小口"], widths2)
    y = table_row(c, y, ["5〜20枚 Mサイズ", "¥8,000/m²", "標準"], widths2)
    y = table_row(c, y, ["20m²〜", "¥6,000/m²", "大口"], widths2)
    y -= 12

    y = section_title(c, y, 8, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


# ================================================================
# PRODUCT 5: 竹集成パネル (Take)
# ================================================================
def gen_take():
    path = os.path.join(OUT_DIR, "take_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-TK-005"

    draw_header(c, "竹集成パネル 製造仕様書", "Bamboo Laminated Panel — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "国産孟宗竹・真竹を原料とした無接着剤熱圧縮パネル。\n竹の天然リグニンを接着成分として170℃×10MPaで圧縮。\n引張強度140MPa（OSBの2倍）、接着剤ゼロで安全・堆肥化可能。")
    y -= 8

    y = section_title(c, y, 2, "製品仕様")
    widths = [160, 375]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    for row in [
        ["品名", "竹集成パネル（無接着剤熱圧縮）"],
        ["原料竹", "孟宗竹 or 真竹（4〜5年生、国産）"],
        ["パネル寸法", "910×1,820mm or 1,220×2,440mm"],
        ["厚み", "12mm / 18mm / 24mm"],
        ["引張強度", "140 MPa（OSB比2倍）"],
        ["曲げ強度", "80 MPa"],
        ["積層構造", "クロスプライ（0°/90°/0°）"],
        ["ストランド厚", "2〜3mm（公差±0.2mm）"],
        ["圧縮条件", "170℃ × 10 MPa × 30分"],
        ["接着剤", "不使用（竹リグニン接着）"],
        ["表面処理", "研磨+撥水処理"],
        ["CO₂固定量", "12mm: 約16 kg-CO₂/m² / 24mm: 約32 kg-CO₂/m²"],
        ["最小ロット", "12/18mm：5枚〜 / 24mm：3枚〜"],
        ["納期", "受注後3〜4週間"],
    ]:
        y = table_row(c, y, row, widths)

    c.showPage()

    draw_header(c, "竹集成パネル 製造仕様書", "Manufacturing Process")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 3, "原材料")
    y = bullet_list(c, y, [
        "孟宗竹 or 真竹（4〜5年生、径10〜15cm）— 竹林整備事業者、高知・島根等",
        "撥水剤（天然ワックス系 or シリコン系）",
        "サンドペーパー（#120, #240）— 表面仕上げ用",
    ])
    y -= 8

    y = section_title(c, y, 4, "必要設備（工場専用）")
    y = bullet_list(c, y, [
        "竹割り機（4〜8分割用）",
        "節除去機 or ルーター",
        "蒸気乾燥窯（80℃、容量500kg以上）",
        "精密バンドソー（2〜3mmストランド加工、公差±0.2mm）",
        "熱圧プレス機（170℃ / 10MPa対応、910×1,820mm以上）",
        "温度・圧力制御システム（±5℃、±0.5MPa精度）",
        "パネルソー（最終カット用）",
        "ワイドベルトサンダー（表面研磨用）",
        "撥水処理ライン（スプレー or ロール塗布）",
    ])
    y -= 8

    y = section_title(c, y, 5, "製造工程")
    steps = [
        ("竹材受入・選別", "4〜5年生の孟宗竹/真竹を受入。径10〜15cm、腐朽・虫食い・割れなきことを確認。春〜初夏伐採材が最良（繊維密度最大）。"),
        ("縦割り・節除去", "竹を4〜8分割に縦割り。内部の節をルーターで除去し平坦化。外皮は残す（強度に寄与）。"),
        ("蒸気乾燥", "80℃蒸気乾燥窯で24〜36時間。目標含水率≤10%。殺虫・殺菌効果あり。乾燥不足は圧縮時の品質不良の原因。"),
        ("ストランド加工", "精密バンドソーで2〜3mm厚にスライス。厚み公差±0.2mm。この均一性が最終パネル品質を決定。"),
        ("積層（クロスプライ）", "ストランドを0°/90°/0°交互に配置。各層の繊維方向を直交させ等方性を確保。12mm=3層、18mm=5層、24mm=7層。"),
        ("熱圧縮", "170℃ × 10 MPa × 30分でホットプレス。竹のリグニンが熱により流動し、天然接着剤として機能。温度・圧力は厳密に管理（±5℃、±0.5MPa）。"),
        ("冷却・養生", "プレスから取出し後、常温で自然冷却2〜4時間。急冷は内部応力による反りの原因。"),
        ("寸法カット・研磨", "パネルソーで910×1,820mm or 1,220×2,440mmにカット。ワイドベルトサンダーで#120→#240研磨。"),
        ("撥水処理", "天然ワックス系撥水剤をスプレー or ロール塗布。乾燥後に表面撥水性を確認。"),
        ("最終検品", "寸法・厚み・重量・表面品質・曲げ強度サンプル試験を実施。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    draw_header(c, "竹集成パネル 製造仕様書", "Inspection & Pricing")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 6, "品質検査基準")
    inspections = [
        ["パネル厚", "12/18/24mm", "ノギス4点", "公差±0.3mm"],
        ["パネル寸法", "910×1820mm", "スケール", "公差±2mm"],
        ["引張強度", "≥140 MPa", "万能試験機", "サンプル抜取り試験"],
        ["曲げ強度", "≥80 MPa", "3点曲げ試験", "ロット毎1枚"],
        ["含水率", "≤10%", "含水率計", "超過は再乾燥"],
        ["層間剥離", "なし", "目視+打音", "剥離は全数不良"],
        ["反り", "≤2mm/m", "直定規+隙間ゲージ", "超過は再プレス検討"],
        ["表面粗さ", "Ra≤12μm", "粗さ計", "再研磨"],
        ["撥水性", "接触角≥90°", "水滴試験", "不足は再処理"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 7, "価格・発注条件")
    widths2 = [180, 180, 175]
    y = table_row(c, y, ["厚み・数量", "単価", "備考"], widths2, header=True)
    y = table_row(c, y, ["12mm（5枚〜）", "¥18,000/m²", "仕上げ・内装用"], widths2)
    y = table_row(c, y, ["18mm（5枚〜）", "¥22,000/m²", "構造＋仕上げ"], widths2)
    y = table_row(c, y, ["24mm（3枚〜）", "¥28,000/m²", "重構造用"], widths2)
    y = table_row(c, y, ["20m²〜", "上記の10%引", "大口割引"], widths2)
    y -= 12

    y = section_title(c, y, 8, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


def gen_roofgrid():
    path = os.path.join(OUT_DIR, "roofgrid_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-RG-006"

    draw_header(c, "ルーフグリッド 製造仕様書", "Modular Roof Grid Frame — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "北海道産カラマツ製のモジュラー屋根フレームシステム。910mm角グリッドに\nソーラーパネル・草屋根トレイ・天窓・焼き板・竹パネルを自由配置。\nフレームは100%国産材、パネルはセル単位で入替可能。")
    y -= 8

    y = section_title(c, y, 2, "フレーム仕様")
    widths = [160, 375]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    for row in [
        ["品名", "SOLUNA ルーフグリッド"],
        ["フレーム材", "北海道産カラマツ（人工乾燥 含水率≤15%）"],
        ["母屋材断面", "90mm × 90mm"],
        ["受け材断面", "45mm × 90mm"],
        ["グリッドピッチ", "910mm × 910mm（在来モジュール準拠）"],
        ["対応勾配", "2.5寸〜6寸（14°〜31°）"],
        ["耐荷重", "250 kg/m²（積雪2m相当）"],
        ["防水", "EPDM ゴムガスケット + ステンレス水切り"],
        ["接合", "ステンレスボルトM12 + 羽子板金物"],
        ["フレーム重量", "約12 kg/m²（パネル別）"],
        ["表面処理", "亜麻仁油2回塗り or 柿渋 or 無塗装"],
        ["最小構成", "2×2（4セル、約3.3m²）"],
        ["納期", "受注後2〜3週間"],
    ]:
        y = table_row(c, y, row, widths)
    y -= 8

    y = section_title(c, y, 3, "対応パネル一覧")
    widths2 = [135, 100, 100, 200]
    y = table_row(c, y, ["パネル種", "重量/セル", "単価/セル", "備考"], widths2, header=True)
    panels = [
        ["ソーラー受け金具", "10 kg", "¥3,500", "市販パネル用アルミ金具"],
        ["草屋根トレイ", "55 kg", "¥12,000", "SUSトレイ+土壌+セダム苗"],
        ["ポリカ天窓", "3 kg", "¥5,500", "中空16mm 光透過80%"],
        ["焼きカラマツ屋根", "15 kg", "¥6,800", "ルーフィング+焼き板2重"],
        ["竹集成屋根", "14 kg", "¥18,200", "18mm+撥水処理"],
    ]
    for row in panels:
        y = table_row(c, y, row, widths2)

    c.showPage()

    draw_header(c, "ルーフグリッド 製造仕様書", "Manufacturing Process & Materials")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 4, "原材料")
    y = bullet_list(c, y, [
        "カラマツ製材（90×90mm、45×90mm）— 北海道製材所",
        "EPDMゴムガスケット（幅50mm×厚5mm）— 建材卸",
        "ステンレス水切り金具（SUS304、L字型）— 板金加工",
        "ステンレスボルト M12×150mm、M8×80mm",
        "羽子板金物（在来工法用）",
        "亜麻仁油 or 柿渋（表面処理用）",
    ])
    y -= 8

    y = section_title(c, y, 5, "必要設備")
    y = bullet_list(c, y, [
        "丸鋸 or スライド丸鋸（母屋材・受け材カット用）",
        "インパクトドライバー + M12/M8ソケット",
        "水平器・墨壺・下げ振り",
        "板金折り曲げ機 or 既製水切り金具",
        "クランプ・仮締め治具",
        "高所作業用足場 or 脚立",
    ])
    y -= 8

    y = section_title(c, y, 6, "製造工程")
    steps = [
        ("材料検品・カット", "カラマツ材の含水率（≤15%）・割れ・反りを検査。母屋材90×90mm、受け材45×90mmを屋根寸法に合わせてカット。仕口加工（渡りアゴ or 羽子板ボルト穴）。"),
        ("母屋材組立", "棟木・母屋材を所定の勾配で設置。910mmピッチで墨出し。羽子板金物+M12ボルトで固定。"),
        ("受け材取付", "母屋材間に受け材を910mmピッチで渡す。上面が母屋材と面一になるよう調整。M12ボルト固定。"),
        ("EPDMガスケット施工", "フレーム上面全周にEPDMガスケットを接着。角部は45°カットで突合せ。圧着ローラーで密着。"),
        ("水切り金具設置", "グリッド交差部にステンレス水切りを設置。勾配下流から順に施工。重ね代30mm以上。"),
        ("パネル受け加工", "各セルの内周に5mm段差（パネル受け）を加工 or 受け材で形成。パネルの落とし込み深さを均一にする。"),
        ("表面処理", "フレーム全体に亜麻仁油2回塗り（24時間乾燥×2回）。屋外耐候性確保。"),
        ("最終検品", "グリッドピッチ精度（±3mm）、水平/勾配確認、ガスケット密着、金具締付トルク確認。"),
        ("梱包・出荷", "母屋材・受け材は長尺PPバンド結束。金具・ガスケットは別梱包。組立図・施工説明書同梱。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    draw_header(c, "ルーフグリッド 製造仕様書", "Inspection & Pricing")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 7, "品質検査基準")
    inspections = [
        ["カラマツ含水率", "≤15%", "含水率計", "超過は使用不可"],
        ["母屋材寸法", "90×90mm", "ノギス", "公差±1mm"],
        ["グリッドピッチ", "910mm", "巻尺", "公差±3mm"],
        ["勾配精度", "設計値±0.5°", "デジタル角度計", "再調整"],
        ["ガスケット密着", "全周密着", "目視+手触り", "浮きは再接着"],
        ["水切り重ね代", "≥30mm", "スケール", "30mm未満は再施工"],
        ["ボルト締付", "M12:80Nm M8:25Nm", "トルクレンチ", "トルク不足は増締"],
        ["散水テスト", "漏水なし", "ホース散水30分", "漏水はガスケット再施工"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 8, "価格・発注条件")
    widths3 = [180, 180, 175]
    y = table_row(c, y, ["構成", "価格", "備考"], widths3, header=True)
    y = table_row(c, y, ["2×2（4セル）", "¥85,000", "約3.3m² 小屋"], widths3)
    y = table_row(c, y, ["3×4（12セル）", "¥220,000", "約10m² キャビン"], widths3)
    y = table_row(c, y, ["4×6（24セル）", "¥400,000", "約20m² 住宅"], widths3)
    y = table_row(c, y, ["カスタム", "要見積", "任意サイズ対応"], widths3)
    y -= 8
    y = body_text(c, y, "※ パネル代別途。上記はフレーム+防水部材+金具+施工説明書のセット価格。")
    y -= 12

    y = section_title(c, y, 9, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


def gen_smartwindow():
    path = os.path.join(OUT_DIR, "smartwindow_spec.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    code = "SM-SW-007"

    draw_header(c, "スマートウィンドウ 製造仕様書", "Smart Window (PDLC) — Manufacturing Specification")
    draw_footer(c, 1, code)
    y = H - 100

    y = section_title(c, y, 1, "製品概要")
    y = body_text(c, y, "北海道産カラマツ木枠にペアガラス（Low-E+Ar）とPDLC調光フィルムを\n組み合わせたスマートウィンドウ。スイッチひとつで透明⇔すりガラスに切替。\n12V駆動でソーラー直結可能。カーテン不要のプライバシー制御。")
    y -= 8

    y = section_title(c, y, 2, "製品仕様")
    widths = [160, 375]
    y = table_row(c, y, ["項目", "仕様"], widths, header=True)
    for row in [
        ["品名", "SOLUNA スマートウィンドウ"],
        ["枠材", "国産竹集成（170℃熱圧縮、接着剤不使用）"],
        ["枠断面", "55mm × 90mm（竹の高強度で薄枠化、ガラス面積8%増）"],
        ["ガラス構成", "4mm強化+12mmAr層+4mm強化+PDLCフィルム"],
        ["調光方式", "PDLC（高分子分散型液晶）"],
        ["透過率 ON", "約85%（透明）"],
        ["透過率 OFF", "約54%（すりガラス）"],
        ["応答速度", "ON→透明0.1秒 / OFF→不透明0.3秒"],
        ["駆動電圧", "DC12V（ACアダプタ or ソーラー）"],
        ["消費電力", "約5 W/m²（ONの時のみ）"],
        ["断熱U値", "1.4 W/m²K（Low-E+Arペアガラス）"],
        ["PDLC寿命", "約10万回切替 or 10年以上"],
        ["使用温度", "-30℃〜+80℃"],
        ["サイズ S", "600×600mm ¥28,000"],
        ["サイズ M", "900×900mm ¥48,000"],
        ["サイズ L", "1200×1500mm ¥85,000"],
        ["カスタム", "最大1500×1800mm 要見積"],
        ["納期", "受注後3〜4週間"],
    ]:
        y = table_row(c, y, row, widths)

    c.showPage()

    draw_header(c, "スマートウィンドウ 製造仕様書", "Materials & Manufacturing Process")
    draw_footer(c, 2, code)
    y = H - 100

    y = section_title(c, y, 3, "原材料")
    y = bullet_list(c, y, [
        "竹集成枠材 55×90mm（170℃熱圧縮）— 竹加工工場（高知/島根）",
        "ペアガラス（Low-E+Ar充填、4+12A+4mm）— AGC/日本板硝子等",
        "PDLCフィルム（自己粘着型、厚0.4mm）— 中国/韓国製PDLC専門メーカー",
        "気密パッキン（EPDM製、窓枠用）",
        "シリコンシーラント（透明、ガラス固定用）",
        "12Vコネクタ・スイッチ・リード線",
        "亜麻仁油（木枠仕上げ用）",
    ])
    y -= 8

    y = section_title(c, y, 4, "必要設備")
    y = bullet_list(c, y, [
        "ルーター or トリマー（ガラス溝・配線溝加工用）",
        "留め切り鋸 or スライド丸鋸（45°加工）",
        "スキージー + スプレーボトル（PDLC貼合用）",
        "シリコンガン",
        "クランプ（枠組立用）",
        "テスター（通電確認用）",
    ])
    y -= 8

    y = section_title(c, y, 5, "製造工程")
    steps = [
        ("枠材加工", "カラマツ70×90mmにガラス溝（深15mm×幅22mm）をルーターで加工。四隅45°留め加工。気密パッキン溝・配線溝を同時に加工。寸法公差±0.5mm。"),
        ("枠組立", "4辺をダボ+木工ボンドで接合。クランプで固定し直角度確認（対角線差≤1mm）。乾燥4時間。"),
        ("ペアガラス受入・検品", "ガラスメーカーからペアガラスを受入。寸法・Low-Eコーティング面・Ar充填確認。端部チップ・クラックなきこと。"),
        ("PDLCフィルム貼合", "ガラス室内面をIPAで清掃→ウェット貼り（霧吹き+中性洗剤水）→スキージーで気泡除去→端子リード線を引出し。養生24時間。"),
        ("ガラス組込み", "枠のガラス溝にシリコンシーラントを充填→ペアガラスを落とし込み→押さえ縁固定→気密パッキン四周装着。"),
        ("電気配線", "PDLCリード線を枠内溝に通す→12Vコネクタ圧着→スイッチ取付→枠面に固定。防水処理。"),
        ("動作テスト", "ON/OFF各100回切替テスト。透明度均一性・応答速度・ムラなきことを確認。消費電力測定。"),
        ("仕上げ・梱包", "木枠に亜麻仁油2回塗り。乾燥後、ガラス面に保護フィルム貼付。段ボール角当て+発泡スチロール緩衝材で梱包。"),
    ]
    y = numbered_steps(c, y, steps)

    c.showPage()

    draw_header(c, "スマートウィンドウ 製造仕様書", "Inspection & Pricing")
    draw_footer(c, 3, code)
    y = H - 100

    y = section_title(c, y, 6, "品質検査基準")
    inspections = [
        ["枠寸法", "設計値", "ノギス/スケール", "公差±0.5mm"],
        ["枠直角度", "対角線差≤1mm", "巻尺", "再組立"],
        ["カラマツ含水率", "≤15%", "含水率計", "超過は使用不可"],
        ["PDLC透過率ON", "≥80%", "照度計比較", "80%未満は貼直し"],
        ["PDLC透過率OFF", "≤60%", "照度計比較", "60%超はフィルム不良"],
        ["気泡", "なし（0.5mm以上）", "目視（透過光）", "気泡は貼直し"],
        ["応答速度", "ON≤0.5秒 OFF≤1秒", "ストップウォッチ", "遅延は配線確認"],
        ["消費電力", "≤8 W/m²", "ワットメーター", "超過は接続確認"],
        ["気密パッキン", "全周密着", "目視+手触り", "浮きは再装着"],
        ["切替耐久", "100回異常なし", "連続切替テスト", "劣化は不良"],
    ]
    y = inspection_table(c, y, inspections)
    y -= 12

    y = section_title(c, y, 7, "価格・発注条件")
    widths3 = [180, 180, 175]
    y = table_row(c, y, ["サイズ", "価格", "備考"], widths3, header=True)
    y = table_row(c, y, ["S 600×600mm", "¥28,000", "浴室・トイレ"], widths3)
    y = table_row(c, y, ["M 900×900mm", "¥48,000", "居室・キャビン主窓"], widths3)
    y = table_row(c, y, ["L 1200×1500mm", "¥85,000", "ピクチャーウィンドウ"], widths3)
    y = table_row(c, y, ["カスタム", "要見積", "最大1500×1800mm"], widths3)
    y -= 12

    y = section_title(c, y, 8, "連絡先")
    y = body_text(c, y, "SOLUNA合同会社\n担当: 濱田\nメール: mail@yukihamada.jp\n電話: 090-7409-0407\nWeb: https://solun.art/materials")

    c.save()
    print(f"  ✓ {path}")


if __name__ == "__main__":
    print("Generating SOLUNA MATERIALS manufacturing spec PDFs...")
    gen_yakiita()
    gen_komenuka()
    gen_sugi_clt()
    gen_louver()
    gen_take()
    gen_roofgrid()
    gen_smartwindow()
    print("\nDone! PDFs in:", OUT_DIR)
