#!/usr/bin/env python3
"""v3: sauna+cold plunge inside courtyard, projector on north wall, sloped membrane"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

BASE = ("Architectural photography, magazine quality. "
        "White stucco RAL 9016 lime-plastered 20ft ISO shipping containers. "
        "Black anodized aluminum frames. Hokkaido Japan highland. ")

SHOTS = [
    # Hero aerial — スロープ膜 + 中庭サウナ水風呂
    ("k4_aerial",
     "Drone aerial photo, golden hour, 60m altitude, 45° angle. "
     "Ten white stucco 20ft containers in asymmetric U-shape on Hokkaido hilltop. "
     "EAST WALL: 2 containers long × 2 stories high (5.2m). "
     "NORTH WALL (back): 2 containers wide × 2 stories high (5.2m). "
     "WEST WALL: 2 containers long × 1 story (2.6m) — rooftop sofa deck on top. "
     "MEMBRANE ROOF: white PTFE fabric, SLOPED — high edge at north/east wall top (5.2m), "
     "low edge at west wall top (2.6m), completely open at south end — "
     "snow slides off southward naturally. "
     "INSIDE COURTYARD (visible from above): "
     "white EVA mats in the main center area, "
     "a cedar barrel sauna (round, ~2m diameter) in the south-west corner, "
     "a cold plunge tub (dark steel, rectangular, 1.2m×2m) right next to the sauna, "
     "a short-throw projector mounted on east wall pointing at the smooth north wall. "
     "Cedar deck extending south. Vast Hokkaido grassland, mountains, dramatic clouds. "
     + BASE),

    # 中庭 — サウナ・水風呂・プロジェクター全部見える
    ("k4_dojo_center",
     "Inside the central courtyard dojo, wide angle looking north. "
     "FLOOR: pristine white EVA puzzle mats across most of the floor. "
     "SOUTH-WEST CORNER: cedar barrel sauna (round, warm cedar wood, glass door glowing orange). "
     "Next to it: dark matte steel rectangular cold plunge tub (水風呂), "
     "mist rising from the chilled water surface. "
     "NORTH WALL: smooth white stucco — a 4K short-throw projector beam projects "
     "a dramatic image onto the wall (mountains or martial arts film). "
     "Projector mounted high on east wall bracket. "
     "MEMBRANE OVERHEAD: white PTFE fabric dramatically sloped — "
     "high at the north (5.2m) dropping to the open south end, "
     "cathedral-like perspective, diffused light. "
     "EAST WALL (right): 2-story, glass sliding doors at ground level open. "
     "WEST WALL (left): single story, doorway open. "
     "A person in white gi training on the mats. "
     "Breathtaking multi-purpose space. "
     + BASE),

    # サウナ・水風呂 クローズアップ
    ("k4_sauna_coldplunge",
     "Close-up view inside the courtyard: the sauna and cold plunge corner. "
     "Cedar barrel sauna (diameter ~2m, round, natural cedar wood aging silver-gold). "
     "Small round window with warm amber glow inside. Steam wisping from the door gap. "
     "Right next to it: a rectangular cold plunge tub in dark matte corten steel. "
     "The cold water surface has slight mist, temperature 10°C. "
     "White stucco west container wall behind. "
     "White EVA mats in foreground. The sloped white membrane overhead. "
     "A person emerging from the sauna, about to step into the cold plunge. "
     "Powerful contrast: hot cedar + cold steel. "
     + BASE),

    # プロジェクター映写 — 北壁スクリーン
    ("k4_projector",
     "Dusk/night inside the courtyard dojo. "
     "The smooth white stucco north wall (5.2m tall, 12m wide) "
     "is lit by a 4K short-throw projector — showing a cinematic landscape of mountains. "
     "The projected image covers most of the north wall (roughly 4m wide × 2.5m tall). "
     "The courtyard is dim — the projection is the main light source. "
     "White EVA mats glow blue-white from the projection. "
     "The sloped white membrane above catches scattered light, cathedral effect. "
     "The open south end shows stars beginning to appear over the Hokkaido grassland. "
     "Two people sit on mats watching the projected image. Magical. "
     + BASE),

    # 外観 — 斜めタープ側面
    ("k4_ext_ushape",
     "Eye-level view from south looking into the asymmetric U-shape at golden hour. "
     "LEFT (east): 2-story wall (5.2m). Ground floor: large sliding glass door. Upper: windows. "
     "RIGHT (west): single-story (2.6m), rooftop sofa deck visible above. "
     "OVERHEAD: the sloped white PTFE membrane clearly angled — "
     "high at the back (north/east, 5.2m), sloping down to 2.6m at the west, "
     "completely open at the south end. The membrane geometry is dramatic and beautiful. "
     "INSIDE: glimpse of white mats, the barrel sauna and cold plunge visible in left corner. "
     "The north wall: projector screen white wall. "
     "Cedar deck in foreground. Hokkaido mountains at golden hour. "
     + BASE),

    # ルーフデッキ — 夕暮れ
    ("k4_rooftop_deck",
     "The rooftop terrace on the single-story west wing at sunset. "
     "Low parapet walls (white stucco). Deep outdoor sectional sofa, linen cushions. "
     "View: looking east-south over the inner courtyard (the sloped membrane visible below, "
     "the 2-story east wall rising beyond), and beyond: infinite Hokkaido grassland horizon. "
     "A person lying on the sofa with a glass of wine, watching the sunset. "
     "String lights coming on as dusk falls. "
     + BASE),

    # 夜景 全体
    ("k4_night",
     "Night photography, Milky Way overhead. "
     "The compound from the south: "
     "East wall 2-story, amber windows. West wall 1-story, rooftop deck lit with string lights. "
     "The sloped membrane overhead — lit from inside by projection and sauna glow. "
     "Inside courtyard: the barrel sauna glows orange-warm, "
     "the cold plunge dark and misting, "
     "the north wall showing projected mountain image. "
     "Stars and Milky Way. "
     + BASE),

    # 冬
    ("k4_winter_dojo",
     "Hokkaido winter. Snow on all roof surfaces. "
     "The SLOPED membrane: snow slides down and falls off the open south end "
     "(visible accumulation of snow on the cedar deck below). "
     "Inside: warm, training continues. "
     "The barrel sauna steaming, cold plunge with snow rim. "
     "White mats under the membrane. "
     "Blue-grey dusk light, snowflakes. "
     + BASE),

    # クレーン設置
    ("k4_crane_install",
     "Construction: crane placing the final upper-floor container on the east wall. "
     "East and north walls complete (2-story white stucco). "
     "West wing: 2 single-story containers placed (rooftop deck future area). "
     "Workers guiding container with tag ropes. Inside courtyard: empty but foundations visible. "
     "Hokkaido grassland morning. "
     + BASE),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_jpg): os.remove(out_jpg)
    print(f"→ {name}", flush=True)
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for part in r.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(part.inline_data.data)
                    subprocess.run(["cwebp","-q","92",out_jpg,"-o",out_webp],
                                   check=True,capture_output=True)
                    os.remove(out_jpg)
                    kb = os.path.getsize(out_webp)//1024
                    print(f"  ✓ {name}.webp {kb}KB", flush=True)
                    return True
            print(f"  no image (attempt {attempt+1})", flush=True)
        except Exception as e:
            print(f"  error: {e}", flush=True)
            time.sleep(8)
    return False

ok = fail = 0
for name, prompt in SHOTS:
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(4)
print(f"\nDone: {ok} ok, {fail} fail")
