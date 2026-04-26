#!/usr/bin/env python3
"""Generate upgrade/luxury feature images for kumaushi"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Photorealistic photograph, natural lighting. Clean, sharp. "
        "Real products, real installations. No artistic filters. ")

SHOTS = [
    # 床暖房マット — 道場の下に電熱式
    ("up_heated_floor",
     "Close-up of electric underfloor heating mat being installed under white martial arts mats. "
     "The orange/red electric heating cable mat is visible on a concrete surface, with white "
     "EVA puzzle mats being laid on top. A thermostat controller on the nearby white wall. "
     "This heats the dojo floor so you can train barefoot in Hokkaido winter. " + REAL),

    # スマートガラス — 透明↔すりガラス
    ("up_smart_glass",
     "Split view comparison of smart glass / electrochromic glass window on a white container. "
     "Left half shows the window in transparent mode — you can see the landscape through it. "
     "Right half shows the same window in frosted/opaque mode — privacy glass, white and milky. "
     "Black aluminum frame. Someone touching a wall switch to toggle. Modern, clean. " + REAL),

    # 白壁プロジェクター — 夜のコンテナ壁が巨大スクリーン
    ("up_projector_wall",
     "At night, a large projected image on the white stucco wall of a shipping container outdoors. "
     "A 4K projector mounted on a small bracket projects a vivid UFC fight / martial arts match "
     "onto the white wall, which acts as a huge outdoor cinema screen (about 3m wide). "
     "People sitting on the wooden deck watching. Stars visible above. Barrel sauna nearby. "
     "The white stucco makes a perfect projection surface. " + REAL),

    # TOTO Neorest — スマートトイレ
    ("up_toto_neorest",
     "A TOTO Neorest smart toilet installed in a compact but luxurious container bathroom. "
     "The toilet is sleek, white, integrated bidet. Gray stone tile floor. White walls. "
     "Small window with mountain view. The toilet lid is automatically open, blue LED night "
     "light glowing underneath. Premium Japanese toilet in the middle of nowhere. " + REAL),

    # Sonos空間オーディオ — デッキで音楽
    ("up_sonos_deck",
     "A white Sonos Era 300 speaker sitting on a wooden shelf on an outdoor deck. Behind it, "
     "the Hokkaido grassland panorama. Warm golden hour light. The speaker is playing music "
     "for people relaxing on the deck after a sauna session. Towels, water bottles nearby. "
     "Simple luxury — great sound in the wilderness. " + REAL),

    # Corten鋼アクセント壁 — 白×錆
    ("up_corten_accent",
     "One wall of a shipping container left with raw Corten steel finish (rusty orange-brown "
     "patina) while the other three walls are finished in white stucco. The contrast between "
     "the rough rust texture and smooth white plaster is striking. A black-framed window in "
     "the Corten wall. Morning light hitting the rust surface, making it glow warm orange. "
     "Beautiful material contrast. " + REAL),

    # リフレクションプール — 入口の水盤
    ("up_reflection_pool",
     "A shallow rectangular reflection pool (about 3m x 1m, only 5cm deep) at the entrance "
     "to the white container compound. Still water perfectly reflects the white stucco walls "
     "and blue sky above. Smooth concrete basin. A few smooth black river stones in the water. "
     "Wooden stepping stones crossing over it. Zen, minimal, meditative entrance. " + REAL),

    # 焼杉デッキ — 黒い木×白コンテナ
    ("up_yakisugi_deck",
     "Dark charred wood deck (yakisugi / shou sugi ban technique — Japanese burnt cedar) "
     "extending from white stucco shipping containers. The contrast of jet-black carbonized "
     "wood planks against white plastered walls is dramatic. A few outdoor chairs on the deck. "
     "Green Hokkaido grassland beyond the deck edge. Golden hour light. Beautiful material "
     "contrast — black wood, white walls, green grass. " + REAL),

    # 真鍮ハードウェア — 白×金
    ("up_brass_hardware",
     "Close-up of a brushed brass door handle on a white stucco wall. The warm gold tone of "
     "the brass contrasts beautifully with the matte white plaster. Next to it, a small brass "
     "house number plate. Simple, elegant hardware detail. Also visible: a brass towel hook "
     "and a brass light switch plate on the white wall nearby. " + REAL),

    # Tesla Wall Connector — EV充電
    ("up_tesla_charger",
     "A white Tesla Wall Connector (Gen 3, with the Tesla T logo) mounted on the white stucco "
     "wall of a container. A Tesla Model Y in white is parked next to it, charging cable "
     "plugged in. Open grassland in background. The EV charges from solar panels during the "
     "day and feeds power back to the house at night via V2H. " + REAL),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    for f in [out_jpg, out_webp]:
        if os.path.exists(f): os.remove(f)
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for p in r.candidates[0].content.parts:
                if p.inline_data and p.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(p.inline_data.data)
                    subprocess.run(["cwebp","-q","90",out_jpg,"-o",out_webp],check=True,capture_output=True)
                    os.remove(out_jpg)
                    print(f"  ✓ {name}.webp")
                    return True
            print(f"  no image, retry {attempt+1}")
        except Exception as e:
            print(f"  error: {e}")
            time.sleep(5)
    return False

ok = fail = 0
for name, prompt in SHOTS:
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(3)
print(f"\ndone: {ok} ok, {fail} fail")
