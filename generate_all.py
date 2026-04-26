#!/usr/bin/env python3
"""Generate all interior before/after + new properties with varied materials."""

import os, sys, base64
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    env = Path.home() / ".env"
    for line in env.read_text().splitlines():
        if "API_KEY" in line and "=" in line:
            API_KEY = line.split("=",1)[1].strip().strip('"').strip("'")
            break

client = genai.Client(api_key=API_KEY)
IMG = Path("/Users/yuki/workspace/soluna-web/cabin/img")

def gen_text(prompt, out):
    if (IMG / out).exists():
        print(f"  skip {out} (exists)")
        return
    print(f"  gen {out}...", end=" ", flush=True)
    r = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[prompt],
        config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]),
    )
    for p in r.candidates[0].content.parts:
        if p.inline_data and p.inline_data.mime_type.startswith("image/"):
            d = p.inline_data.data
            if isinstance(d, str): d = base64.b64decode(d)
            (IMG / out).write_bytes(d)
            print(f"✓ {len(d)//1024}KB")
            return
    print("✗ no image")

def gen_from(before_file, prompt, out):
    if (IMG / out).exists():
        print(f"  skip {out} (exists)")
        return
    src = IMG / before_file
    if not src.exists():
        print(f"  ✗ before missing: {before_file}")
        return
    print(f"  reno {before_file}→{out}...", end=" ", flush=True)
    mime = "image/jpeg" if before_file.endswith(".jpg") else "image/webp"
    r = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[types.Part.from_bytes(data=src.read_bytes(), mime_type=mime), prompt],
        config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]),
    )
    for p in r.candidates[0].content.parts:
        if p.inline_data and p.inline_data.mime_type.startswith("image/"):
            d = p.inline_data.data
            if isinstance(d, str): d = base64.b64decode(d)
            (IMG / out).write_bytes(d)
            print(f"✓ {len(d)//1024}KB")
            return
    print("✗ no image")

# ═══════════════════════════════════════════════════════════════
# INTERIOR BEFORE — realistic listing-style interior photos
# ═══════════════════════════════════════════════════════════════

print("\n══ INTERIOR BEFORE ══")

# Wakayama existing
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "1952 old fishing village house interior in Kainan Wakayama. "
    "Dim narrow room: dark wooden floor with worn tatami border, "
    "old ceiling boards yellowed by age, single fluorescent ceiling light, "
    "peeling wallpaper, sliding shoji screen partly broken, "
    "old kitchen visible behind — cracked tiles, rusted sink, gas stove from 1980s. "
    "Typical unflattering Japanese listing photo, wide-angle slightly distorted, "
    "overexposed window on one side.",
    "wakayama_kainan_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "1961 two-story house interior in Tanabe Wakayama. "
    "Old tatami room 8-mat: faded tatami, low wooden table, "
    "old dark wooden furniture chest (tansu), "
    "ceiling boards with water stain, tokonoma (alcove) with crumbling plaster, "
    "sliding fusuma door to next room, "
    "single bare bulb light fixture. Slightly gloomy, overcast window light. "
    "Standard Japanese real estate listing interior photo.",
    "wakayama_tanabe_furuo_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "1971 large coastal house interior in Yura-cho Hidaka Wakayama. "
    "Large living room with old vinyl floor tiles, "
    "1970s-style brown interior, low Japanese ceiling with fluorescent panel, "
    "old Japanese kitchen counter with wood-veneer cabinets and retro tiles, "
    "sliding glass door to overgrown back garden, "
    "dusty venetian blinds. Standard listing photo, wide angle.",
    "wakayama_hidaka_yura_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "1975 mountain farmhouse interior in Ryujin Tanabe Wakayama. "
    "Large earthen-floor entrance (doma) with old farm tools hanging on wall, "
    "leading to raised wooden floor room with exposed wooden beams overhead, "
    "sooty ceiling from old hearth (irori) in floor, "
    "cracked plaster walls, small window, mountain light. "
    "Very rustic, authentic old Japanese farmhouse interior. Listing photo style.",
    "wakayama_ryujin_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "1968 concrete house interior in Shingu Wakayama. "
    "Dated living room: terrazzo floor with worn carpet, "
    "low concrete ceiling with cracks, "
    "old printed wallpaper, metal frame windows with faded curtains, "
    "1970s-style kitchen area with old tile countertop. "
    "Overcast light, slightly dim. Standard Japanese listing photo.",
    "wakayama_shingu_int_before.jpg"
)

# Teshikaga/Hokkaido existing
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "Old small house interior in Teshikaga town center, Hokkaido. "
    "Small tatami room with faded tatami, "
    "old wooden window frames with condensation stains, "
    "low ceiling boards, single electric heater in corner, "
    "shoji screen with torn paper, old chest of drawers. "
    "Cold winter light, typical Hokkaido old house feel. Listing photo style.",
    "teshikaga_92_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "Large old house interior in Kawayu Onsen area, Teshikaga Hokkaido. "
    "Spacious dated living room: old vinyl floor, "
    "wood-burning stove in center (rusty, unused), "
    "old plywood paneling on walls, "
    "1980s-style ceiling with acoustic tiles, "
    "large aluminum window frames with condensation, view of birch trees outside. "
    "Gloomy winter light. Japanese listing photo style.",
    "teshikaga_68_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "Large old property interior in Kawayu Onsen, Teshikaga Hokkaido. "
    "Wide hallway leading to multiple rooms, "
    "old tatami rooms with worn surfaces, "
    "wooden ceiling boards darkened by age, "
    "old Japanese oil heater, faded wallpaper, "
    "condensation on windows. Former ryokan/inn feel. Listing photo.",
    "teshikaga_94_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "Small house interior in Kumaushi area, Teshikaga Hokkaido. "
    "Cozy but dated: old tatami room 6-mat, "
    "wooden ceiling with exposed insulation at edges, "
    "old freestanding oil heater, dusty curtains, "
    "view to birch trees through old aluminum window. "
    "Autumn light. Hokkaido rural house feel. Listing photo style.",
    "teshikaga_95_int_before.jpg"
)
gen_text(
    "Photorealistic Japanese real estate listing photo, INTERIOR. "
    "Old house interior in Kawayu Onsen 4-chome, Teshikaga Hokkaido. "
    "Small tatami room, worn tatami, "
    "old wooden sliding doors, faded fusuma, "
    "single ceiling fluorescent light, "
    "old oil stain on floor near heater, "
    "snowy view through small aluminum window. Listing photo.",
    "teshikaga_98_int_before.jpg"
)

# ═══════════════════════════════════════════════════════════════
# INTERIOR AFTER — with varied materials (no yakisugi overuse)
# ═══════════════════════════════════════════════════════════════

print("\n══ INTERIOR AFTER (varied materials) ══")

gen_from("wakayama_kainan_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same room layout, same windows. "
    "Material: 白漆喰 (white shikkui lime plaster) walls, smooth matte finish. "
    "Old tatami removed → polished Hinoki cypress wood floor. "
    "Exposed wooden ceiling beams painted white. "
    "Paper shoji screens in Japanese traditional lattice (kumiko) pattern. "
    "Low platform bed with white linen, single washi lamp. "
    "Ocean glimmer visible through window. Luxury boutique hotel feel. "
    "Photorealistic interior architecture photo.",
    "wakayama_kainan_int_after.jpg"
)
gen_from("wakayama_tanabe_furuo_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same room shape. "
    "Material: 土壁 (tsuchikabe earth/clay wall) texture, warm ochre. "
    "New smooth clay plaster walls, polished concrete floor with underfloor heating. "
    "Exposed dark wooden beams cleaned and oiled. "
    "Tokonoma (alcove) preserved and highlighted with LED strip. "
    "Low Japanese platform bed, handmade ceramic lamp, single ikebana. "
    "Warm ochre and dark timber palette. Photorealistic luxury interior.",
    "wakayama_tanabe_furuo_int_after.jpg"
)
gen_from("wakayama_hidaka_yura_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same room volume, same window position. "
    "Material: 自然石 (natural stone) feature wall, pale travertine texture. "
    "Old floor replaced with wide-plank pale oak boards. "
    "Open plan kitchen: stone counter with matte black fixtures. "
    "High ceiling with new exposed rafters. "
    "Floor-to-ceiling sliding glass panel to redesigned garden. "
    "Coastal palette: pale stone, bleached oak, white linen. "
    "Photorealistic luxury interior photo.",
    "wakayama_hidaka_yura_int_after.jpg"
)
gen_from("wakayama_ryujin_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same doma earthen floor entrance and beam structure. "
    "Material: 磨き漆喰 (polished shikkui) and natural exposed stone floor. "
    "Doma earthen floor polished to smooth dark finish. "
    "Irori (sunken hearth) restored and modernized with iron grill frame. "
    "Exposed cedar beams overhead cleaned and oiled. "
    "Shoji screens replaced with washi+steel frame modern version. "
    "Onsen soaking tub (hinoki wood) visible through glass partition. "
    "Steam, warm lighting, mountain spa atmosphere. Photorealistic.",
    "wakayama_ryujin_int_after.jpg"
)
gen_from("wakayama_shingu_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same concrete structure, same window positions. "
    "Material: コールテン鋼 (corten weathering steel) accent panel on feature wall. "
    "Polished concrete floor with radiant heat. "
    "Corten steel + white wall contrast. "
    "Matte black minimal kitchen with stone counter. "
    "Skylight added (new cutout in ceiling), dramatic top lighting. "
    "Kumano forest visible through new large window. "
    "Industrial-Japanese fusion. Photorealistic interior architecture.",
    "wakayama_shingu_int_after.jpg"
)

gen_from("teshikaga_92_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same compact room. "
    "Material: 北欧風白ペイント (Scandinavian white painted wood). "
    "White painted pine tongue-and-groove wall paneling. "
    "Pale birch plywood ceiling. Light oak floor. "
    "Built-in window seat with white cushion overlooking birch trees. "
    "Minimal Scandinavian furniture: one low pine bed, linen curtains. "
    "Cast iron wood stove in corner with black flue. "
    "Clean Nordic hygge aesthetic. Photorealistic interior.",
    "teshikaga_92_int_after.jpg"
)
gen_from("teshikaga_68_int_before.jpg",
    "BEFORE→AFTER interior renovation. Same large room volume. "
    "Material: ログ (log) + 玉石 (river stone). "
    "Large round river stones form one entire feature wall. "
    "Exposed log ceiling beams. Wide plank dark pine floor. "
    "Central cast iron fireplace on stone hearth. "
    "Two leather club chairs facing fire. Sheepskin rugs. "
    "Panoramic new window looking at birch grove. "
    "Private onsen rotenburo visible outside. "
    "Rustic luxury lodge feel. Photorealistic.",
    "teshikaga_68_int_after.jpg"
)
gen_from("teshikaga_94_int_before.jpg",
    "BEFORE→AFTER interior renovation. Large former ryokan space. "
    "Material: ガルバリウム+ヒノキ (galvalume steel + hinoki cypress). "
    "Industrial galvalume corrugated ceiling (dark). "
    "Hinoki cypress plank walls, pale golden tone. "
    "Polished concrete floor. "
    "Double-height central living space with mezzanine. "
    "Large cast iron bathtub on raised platform, visible behind glass. "
    "Floor-to-ceiling glazing to snow garden. "
    "Contemporary onsen resort aesthetic. Photorealistic.",
    "teshikaga_94_int_after.jpg"
)
gen_from("teshikaga_95_int_before.jpg",
    "BEFORE→AFTER interior renovation. Cozy compact room. "
    "Material: フィンランドパイン (Finnish pine sauna style). "
    "Walls: untreated Finnish pine boards, honey-gold color. "
    "Ceiling: same pine planks with beeswax finish. "
    "Floor: concrete with electric underfloor heat. "
    "Built-in pine sleeping loft above. "
    "Small Finnish barrel sauna visible through glass door. "
    "Large window: Hokkaido birch forest in autumn colors. "
    "Hygge/sauna culture atmosphere. Photorealistic.",
    "teshikaga_95_int_after.jpg"
)
gen_from("teshikaga_98_int_before.jpg",
    "BEFORE→AFTER interior renovation. Small cozy room. "
    "Material: スレート (slate) + 白塗り杉 (white-painted cedar). "
    "Dark slate tile floor. White painted cedar wall boards. "
    "Low wood-burning stove, single armchair, sheepskin blanket. "
    "Handmade ceramic pendant light above. "
    "Wide triple-glazed window: snowy Hokkaido scene with birch trees. "
    "Very intimate, cabin-in-the-woods atmosphere. Photorealistic luxury.",
    "teshikaga_98_int_after.jpg"
)

# ═══════════════════════════════════════════════════════════════
# NEW PROPERTIES — Wakayama × 5 more
# ═══════════════════════════════════════════════════════════════

print("\n══ NEW WAKAYAMA PROPERTIES ══")

NEW_WA = [
    {
        "id": "hongu",
        "label": "田辺市本宮町 · ¥250万 · 築1969年 · 5DK · 熊野本宮大社 車5分",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1969 farmhouse in Hongu area, Tanabe city Wakayama, deep Kumano forest. "
            "Single-story L-shaped wooden house, old corrugated iron roof (dark green). "
            "Weathered wooden rain shutters, concrete entrance step, "
            "moss-covered stone lantern in front, overgrown cedar hedge. "
            "Misty forested mountain backdrop. Standard listing photo, smartphone."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1969 farmhouse interior, Kumano Hongu area. "
            "Large 10-mat tatami room with tokonoma and deep wooden alcove. "
            "Tall ceiling with dark exposed beams. Walls: grey plaster with cracks. "
            "Old Buddhist altar (butsudan) visible, "
            "sliding fusuma screens, aged tatami. "
            "Dim natural light through shoji. Authentic kominka feel."
        ),
        "ext_after_material": (
            "Material: 白漆喰×杉格子 (white shikkui plaster + cedar lattice screen). "
            "White lime plaster exterior replacing old boards. "
            "New cedar lattice privacy screen (sugi-goshi) at entrance. "
            "Corrugated iron roof replaced with dark Galvalume. "
            "Stone path redesigned with river pebbles. "
            "Single large lantern at gate. Kumano forest backdrop kept. "
            "Sacred, serene aesthetic near World Heritage site."
        ),
        "int_after_material": (
            "Material: 土壁×輪島塗 (earth wall + Wajima lacquer accents). "
            "Clay plaster walls, warm terracotta tone. "
            "Tokonoma preserved, highlighted with concealed LED. "
            "Exposed beams cleaned and darkened with shou sugi style (light char). "
            "Handwoven grass floor (igusa) in sleeping area. "
            "Low Japanese lacquer table, single hanging paper lamp. "
            "Reverent, Kumano pilgrimage lodge atmosphere."
        ),
    },
    {
        "id": "kushimoto",
        "label": "串本町 · ¥80万 · 築1963年 · 4DK · 本州最南端・海近",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1963 house near ocean in Kushimoto, Wakayama (southernmost point of Honshu). "
            "Single-story white concrete block house, flat roof, "
            "old aluminum windows with sea-salt corrosion, "
            "rusted iron gate, cracked concrete wall, "
            "palm tree and subtropical plants in tiny front yard. "
            "Bright Pacific Ocean visible in background. Listing photo."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1963 concrete house interior in Kushimoto, ocean area. "
            "Terrazzo floor, concrete ceiling with cracks. "
            "Old blue/white ceramic tiles on kitchen wall. "
            "Metal-frame windows with faded sea-green curtains. "
            "Small room with bright Pacific light flooding in. Listing photo."
        ),
        "ext_after_material": (
            "Material: 海岸石×ガラス (coastal stone + glass). "
            "Exterior clad in stacked natural stone from local shore. "
            "Large floor-to-ceiling glass wall added facing the Pacific. "
            "Infinity-style terrace/pool edge at front. "
            "White rendered walls at sides. Tropical plantings (agave, palm). "
            "Bright Pacific light, same coastal location. "
            "Mediterranean-Japanese fusion resort look."
        ),
        "int_after_material": (
            "Material: 珊瑚石×漆喰 (coral stone + lime plaster). "
            "White lime plaster walls with embedded coral stone accents. "
            "Pale terrazzo floor polished to mirror finish. "
            "Open plan: kitchen with white stone counter, "
            "living area with white canvas sofa. "
            "Floor-to-ceiling glass wall: Pacific Ocean panorama. "
            "Natural shell, rope, driftwood decor. "
            "Tropical-Japanese coastal minimal aesthetic."
        ),
    },
    {
        "id": "yuasa",
        "label": "湯浅町 · ¥60万 · 築1910年 · 3DK · 醤油醸造の町・重伝建地区",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1910 old machiya (townhouse) in Yuasa town, Wakayama (historic soy sauce brewing town, 重要伝統的建造物群保存地区). "
            "Narrow 2-story wooden machiya: dark wood lattice facade, "
            "old clay tile roof, wooden folding shutters (koshi), "
            "worn stone step entrance on narrow historic alley. "
            "Neighboring old machiya on both sides. Overcast morning."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1910 machiya interior in Yuasa Wakayama. "
            "Long narrow tori-niwa (earthen floor passage), "
            "dark wooden columns, old soy sauce brewing tools hanging on wall, "
            "leading to dim tatami rooms. "
            "Very dark, narrow, authentic old townhouse feel. "
            "Cracked earth floor, old smell of soy sauce."
        ),
        "ext_after_material": (
            "Material: 古レンガ×木格子 (old brick + wooden lattice). "
            "Historic facade preserved: dark wood lattice restored with precision. "
            "Old bricks added as accent at base of building. "
            "Warm amber lighting in lattice gaps at night. "
            "Same narrow alley, neighboring machiya unchanged. "
            "Historic preservation + luxury boutique feel. "
            "Photorealistic evening light."
        ),
        "int_after_material": (
            "Material: 古材×ガラス床 (reclaimed timber + glass floor panel). "
            "Tori-niwa earthen passage polished, old soy barrels as decorative elements. "
            "Glass floor panel reveals old cellar below. "
            "Dark reclaimed timber columns cleaned. "
            "Tatami room: raised platform with tatami border, modern futon setup. "
            "Soy sauce maker tools displayed as art. "
            "History-as-design aesthetic. Photorealistic."
        ),
    },
    {
        "id": "koya",
        "label": "伊都郡高野町 · ¥120万 · 築1935年 · 4DK · 高野山エリア",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1935 old house near Koyasan (Mt. Koya), Wakayama. "
            "Old wooden temple-quarter style house, steep cedar tile roof (sekitsugi), "
            "weathered wooden walls, moss on north side, "
            "stone garden with old pine tree and moss-covered lanterns. "
            "Mountain cedar forest behind. Foggy sacred mountain atmosphere."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1935 house near Koyasan interior. "
            "Wide engawa (veranda) with dark worn wood looking to garden. "
            "Buddhist altar room: dark wooden paneling, ceiling with cracks. "
            "Old tatami rooms connected by sliding fusuma. "
            "Dim sacred atmosphere. Smells of incense."
        ),
        "ext_after_material": (
            "Material: 自然石×苔 (natural stone + moss garden). "
            "Walls: natural granite stone cladding, dry-stacked. "
            "Roof: dark cedar shingles preserved/restored. "
            "Moss garden at entrance, stone lanterns, raked gravel. "
            "New wood-framed glass entrance wall, deep overhang. "
            "Sacred mountain atmosphere preserved. "
            "Temple-adjacent luxury retreat aesthetic."
        ),
        "int_after_material": (
            "Material: 石畳×朱漆 (stone floor + vermillion lacquer accents). "
            "Engawa preserved, dark polished wood. "
            "Stone tile floor inside, heated. "
            "Vermillion lacquer painted sliding screens (fusuma) as accent. "
            "Low meditation altar with candle and incense. "
            "Garden view through preserved engawa. "
            "Sacred, contemplative luxury retreat interior."
        ),
    },
    {
        "id": "nachi_ura",
        "label": "東牟婁郡那智勝浦町 · ¥75万 · 築1971年 · 3LDK · 温泉地・勝浦漁港近",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1971 house in Nachikatsuura town near Katsuura hot spring resort and fishing port, Wakayama. "
            "Two-story concrete and block mixed construction, "
            "old ceramic tile cladding (1970s brown/beige), "
            "aluminum balcony railing on 2F, "
            "small parking space, "
            "hotel and ryokan visible in background (onsen area). "
            "Bright Pacific coastal light."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1971 house interior in Nachikatsuura hot spring area. "
            "Old bathroom: pink ceramic tiles, old Japanese style deep bathtub (ofuro), "
            "rusty fixtures, frosted glass window. "
            "Hot spring piping visible (old iron pipe from town supply). "
            "Typical dated onsen town house feel."
        ),
        "ext_after_material": (
            "Material: タイル×木ルーバー (tile + wood louver screen). "
            "Old ceramic tiles replaced with modern matte grey large tiles. "
            "Vertical cedar louver screen (wood slats) on 2F balcony for privacy. "
            "New black aluminum window frames. "
            "Rooftop rotenburo terrace visible at top. "
            "Steam rising from private onsen. "
            "Pacific/onsen town backdrop. Photorealistic."
        ),
        "int_after_material": (
            "Material: 那智石×檜 (Nachi black stone + hinoki cypress). "
            "Bathroom: famous Nachi black stone tiles on walls and floor. "
            "Deep hinoki cypress ofuro tub with copper faucet. "
            "Steam rising. Single candle. "
            "Ocean view through small opaque glass window ajar. "
            "Private onsen: the ultimate Nachikatsuura stay experience."
        ),
    },
]

for p in NEW_WA:
    print(f"\n  ─ {p['id']} ─")
    gen_text(p["ext_before"], f"wakayama_{p['id']}_before.jpg")
    gen_text(p["int_before"], f"wakayama_{p['id']}_int_before.jpg")
    gen_text(
        f"Photorealistic architectural AFTER photo: renovation of {p['label']}. "
        f"{p['ext_after_material']} Same building shape, same location. "
        "Photorealistic luxury boutique hotel exterior photography.",
        f"wakayama_{p['id']}_after.jpg"
    )
    gen_text(
        f"Photorealistic luxury interior AFTER photo: renovation of {p['label']}. "
        f"{p['int_after_material']} "
        "Photorealistic interior architecture photography.",
        f"wakayama_{p['id']}_int_after.jpg"
    )

# ═══════════════════════════════════════════════════════════════
# NEW PROPERTIES — Hokkaido × 5 more
# ═══════════════════════════════════════════════════════════════

print("\n══ NEW HOKKAIDO PROPERTIES ══")

NEW_HK = [
    {
        "id": "shibecha",
        "label": "標茶町 · ¥50万 · 築1978年 · 4DK · 釧路湿原国立公園隣接",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1978 farmhouse in Shibecha town, Hokkaido (adjacent to Kushiro Marshland National Park). "
            "Single-story wooden house with dark green corrugated iron roof, "
            "old horizontal white siding boards, "
            "small wooden entrance porch, "
            "large farm field visible behind, "
            "reed marshland in far distance. "
            "Flat Hokkaido landscape. Early spring, some snow patches. Listing photo."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1978 Hokkaido farmhouse interior in Shibecha. "
            "Old Japanese-style living room: faded tatami, "
            "oil heater in corner (rusty, old model), "
            "single fluorescent tube on ceiling, "
            "plywood wall panels yellowing with age, "
            "window with white curtains facing farm field. "
            "Plain, dated, functional Hokkaido farm house feel."
        ),
        "ext_after_material": (
            "Material: 北欧ブラック×大窓 (Nordic black painted wood + oversized windows). "
            "Black painted cedar siding replacing old white boards. "
            "Large triple-glazed windows cut facing the marshland panorama. "
            "Low-pitched black Galvalume roof. "
            "Wooden deck extending to grass. "
            "Kushiro marsh reed field visible in distance. "
            "Nordic-Hokkaido minimal aesthetic. Photorealistic."
        ),
        "int_after_material": (
            "Material: 白樺合板×コンクリート (birch plywood + concrete). "
            "Pale birch plywood wall paneling (Finnish style). "
            "Polished concrete floor with underfloor heating. "
            "Large window: panoramic Hokkaido wetland/marsh view. "
            "Freestanding black cast iron wood stove. "
            "Two Eames-style plywood chairs. Linen curtains. "
            "Natural light flooded Nordic interior. Photorealistic."
        ),
    },
    {
        "id": "akan",
        "label": "釧路市阿寒町 · ¥100万 · 築1982年 · 3LDK · 阿寒湖近・アイヌ文化",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1982 house in Akan area near Akan Lake, Kushiro Hokkaido. "
            "Single-story beige stucco house, dark green metal roof, "
            "old small windows, snow piled on roof, "
            "large spruce and birch trees surrounding, "
            "Akan lake barely visible through trees in background. "
            "Winter, snowy, overcast."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1982 house interior near Akan Lake, Hokkaido. "
            "Dated kitchen-living combo: old wood-veneer cabinets, "
            "brown vinyl floor, "
            "single aluminum window with view to snow-covered spruce trees, "
            "old AC unit, plain ceiling. "
            "Typical 1980s Hokkaido house."
        ),
        "ext_after_material": (
            "Material: ログ×石 (log + natural stone). "
            "Log cabin exterior: round horizontal logs, rich honey-brown. "
            "Natural stone chimney stack rising from roof. "
            "Timber frame covered porch with wooden rocking chairs. "
            "Spruce forest remains, Akan lake visible through clearing. "
            "Winter: smoke from chimney, warm interior light. "
            "Traditional Hokkaido lodge aesthetic."
        ),
        "int_after_material": (
            "Material: ログ×アイヌ文様 (log + Ainu pattern textile). "
            "Log walls inside, warm honey-amber tone. "
            "Central stone fireplace with crackling fire. "
            "Ainu pattern (geometric) woven textiles as wall art and cushions. "
            "Wooden dining table handmade from local elm. "
            "View to Akan lake through picture window: steam from volcanic lake. "
            "Warm, authentic Hokkaido-Ainu cultural lodge."
        ),
    },
    {
        "id": "nakashibetsu",
        "label": "中標津町 · ¥150万 · 築1976年 · 4LDK · 牧草地・知床近",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1976 farmhouse in Nakashibetsu town, eastern Hokkaido (dairy farming area near Shiretoko). "
            "Two-story wooden farmhouse with old corrugated tin roof, "
            "faded white/cream horizontal siding, "
            "small windows, concrete barn/outbuilding visible, "
            "vast flat green/yellow farmland behind, "
            "wind turbine far in distance. "
            "Wide open Hokkaido sky. Listing photo."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1976 farmhouse interior in Nakashibetsu, Hokkaido. "
            "Old tatami room 8-mat: worn tatami, "
            "wooden window frame with condensation, "
            "large oil furnace (stone oil heater), "
            "cream colored walls with cracks, "
            "view of farmland through window. Typical Hokkaido farm house."
        ),
        "ext_after_material": (
            "Material: コールテン鋼×松 (corten weathering steel + local pine). "
            "Corten steel panels: rich rust-orange, weathered patina. "
            "Local pine timber frame porch and trim. "
            "Large picture windows. Low-pitched steel roof. "
            "Vast green Hokkaido farmland and sky backdrop. "
            "Shiretoko mountains faintly visible far horizon. "
            "Dramatic rust-orange against green/blue Hokkaido landscape."
        ),
        "int_after_material": (
            "Material: 鉄×アメリカンウォールナット (iron + American walnut). "
            "Dark walnut wide-plank floor. "
            "Raw steel (matte black) window frames and staircase rail. "
            "White plaster walls. "
            "Industrial-farmhouse: open plan kitchen with steel island. "
            "Long walnut dining table for 8. "
            "Panoramic window: Hokkaido prairie and big sky. "
            "Scandinavian-industrial farmhouse aesthetic."
        ),
    },
    {
        "id": "kushiro",
        "label": "釧路市 · ¥80万 · 築1968年 · 3DK · 釧路湿原・霧の街",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1968 house in Kushiro city, Hokkaido (foggy port city, Kushiro Marshland nearby). "
            "Old single-story concrete house, "
            "flat roof, deteriorating stucco exterior, "
            "old small aluminum windows, "
            "moss growing on north wall, "
            "foggy Kushiro atmosphere, grey sky. Listing photo."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1968 house interior in Kushiro, Hokkaido. "
            "Old bathroom: pale blue tiles, old Japanese style bath (ofuro), "
            "frosted glass block window. "
            "Or: small living room with faded vinyl floor, "
            "oil heater, old aluminum windows with condensation, "
            "grey foggy light from outside."
        ),
        "ext_after_material": (
            "Material: ガルバリウム×デッキ材 (galvalume + hardwood deck). "
            "Galvalume standing seam cladding: dark silver/charcoal. "
            "Wide elevated hardwood deck (ipe wood) extending front. "
            "New aluminum windows with deep reveals. "
            "Fog-filtered light. Kushiro marsh vista visible. "
            "Sleek, minimal, fog-poetic aesthetic."
        ),
        "int_after_material": (
            "Material: ベイヒバ×磨き床 (Alaska yellow cedar + polished concrete). "
            "Alaska yellow cedar (ベイヒバ) wall paneling: pale, aromatic. "
            "Polished concrete floor. "
            "Minimal Japanese minimalism: one low sofa, one pendant lamp. "
            "Large window: Kushiro marsh view in fog. "
            "Poets and writers atmosphere. Contemplative."
        ),
    },
    {
        "id": "rausu",
        "label": "目梨郡羅臼町 · ¥200万 · 築1985年 · 4DK · 知床世界遺産・流氷",
        "ext_before": (
            "Photorealistic Japanese real estate listing photo, EXTERIOR. "
            "1985 house in Rausu town, Shiretoko Peninsula, Hokkaido (UNESCO World Heritage). "
            "Single-story wooden house with dark red metal roof, "
            "old pale blue horizontal siding, "
            "mountains of Shiretoko visible behind, "
            "fishing boats visible in small harbor in distance. "
            "Early spring, sea ice (ryuhyo) visible on ocean. Listing photo."
        ),
        "int_before": (
            "Photorealistic Japanese real estate listing photo, INTERIOR. "
            "1985 house interior in Rausu, Shiretoko Hokkaido. "
            "Old tatami room with worn tatami, "
            "dark wooden window frame, "
            "heavy curtains against cold, "
            "old oil heater, faded fusuma door. "
            "View to Shiretoko mountains through old window. "
            "Rugged, cold, isolated fishing village atmosphere."
        ),
        "ext_after_material": (
            "Material: 流木×ガラス (driftwood texture + glass). "
            "Exterior: rough-sawn cedar with driftwood-grey weathered oil finish. "
            "Oversized floor-to-ceiling glass window facing Shiretoko ocean. "
            "Timber frame canopy at entrance. "
            "Natural stone path. No fence — wild Hokkaido nature. "
            "Sea ice (drift ice) visible on ocean in early spring. "
            "Wild, dramatic World Heritage landscape backdrop."
        ),
        "int_after_material": (
            "Material: 蝦夷松×鹿皮 (Ezo spruce + deer hide). "
            "Ezo spruce (local Hokkaido spruce) rough-sawn wall planks. "
            "Deer hide draped over wooden armchair. "
            "Central cast iron stove with glass front, crackling fire. "
            "Floor: wide dark pine planks. "
            "One large window: Shiretoko sea with drift ice floating. "
            "Raw, elemental, World Heritage wilderness lodge."
        ),
    },
]

for p in NEW_HK:
    print(f"\n  ─ {p['id']} ─")
    gen_text(p["ext_before"], f"hokkaido_{p['id']}_before.jpg")
    gen_text(p["int_before"], f"hokkaido_{p['id']}_int_before.jpg")
    gen_text(
        f"Photorealistic architectural AFTER renovation photo: {p['label']}. "
        f"{p['ext_after_material']} Same building, same Hokkaido location. "
        "Photorealistic luxury lodge/cabin exterior photography.",
        f"hokkaido_{p['id']}_after.jpg"
    )
    gen_text(
        f"Photorealistic luxury interior AFTER renovation: {p['label']}. "
        f"{p['int_after_material']} "
        "Photorealistic interior architecture photography.",
        f"hokkaido_{p['id']}_int_after.jpg"
    )

print("\n\n✅ All images done.")
