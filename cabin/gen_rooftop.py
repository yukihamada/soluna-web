#!/usr/bin/env python3
"""New design: asymmetric U-shape, west wing single-story with rooftop sofa deck"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

BASE = ("Architectural photography, magazine quality. "
        "White stucco RAL 9016 lime-plastered 20ft ISO shipping containers. "
        "Black anodized aluminum thermal-break frames. Hokkaido Japan highland. ")

SHOTS = [
    # Hero aerial — 非対称 U字 + 西ウィング屋根デッキ
    ("k4_aerial",
     "Drone aerial photo, golden hour, 55m altitude, 40° angle looking north. "
     "Ten white stucco 20ft containers in asymmetric U-shape on Hokkaido hilltop: "
     "NORTH WALL: 2 containers wide × 2 stories high (full height ~5.2m). "
     "EAST WALL: 2 containers long × 2 stories high (full height ~5.2m). "
     "WEST WALL: 2 containers long × 1 story only (~2.6m) — the FLAT ROOF of this low wing "
     "is a ROOFTOP TERRACE with outdoor sofas, low coffee tables, string lights, potted plants. "
     "The rooftop deck overlooks BOTH the inner courtyard AND the Hokkaido panorama to the west. "
     "Central courtyard: white EVA mats, PTFE tensile membrane spanning from north wall top "
     "down to east wall top (sloped, not flat — leaves west/south open). "
     "Open south end, cedar deck extending outward. "
     "Barrel sauna and hot tub outside east side. Solar panels nearby. "
     "Vast green grassland, distant mountains, dramatic clouds. "
     + BASE),

    # 正面 — 南から全体
    ("k4_ext_ushape",
     "Eye-level wide shot from south looking into the asymmetric U-shape. "
     "LEFT (east): tall 2-story white stucco wall, large sliding glass doors ground floor, "
     "small windows upper floor. "
     "RIGHT (west): single-story white stucco containers (~2.6m high), "
     "on their flat roof: outdoor lounge area visible — "
     "weatherproof outdoor sofas (white and natural linen), low teak coffee table, string lights, "
     "succulent plants in concrete pots. A person relaxing on the rooftop sofa. "
     "BACK (north): 2-story white wall connecting east and west wings. "
     "Central courtyard: white mats, membrane canopy. "
     "Open south: panoramic Hokkaido grassland. "
     + BASE),

    # ルーフデッキ — 西ウィング屋根
    ("k4_rooftop_deck",
     "The rooftop terrace on top of the single-story west wing containers. "
     "Low white stucco parapet around the flat roof deck. "
     "Deep outdoor sectional sofa (linen/ecru fabric, weatherproof) arranged facing the view. "
     "Low teak coffee table with a bottle of whisky and two glasses. "
     "String lights strung from iron posts. Concrete planters with ornamental grasses. "
     "VIEW: looking south/west over infinite Hokkaido grassland, distant mountains, sunset sky. "
     "The 2-story east wall visible to the right, the inner courtyard below to the right. "
     "Cinematic golden hour. A couple relaxing with wine glasses. "
     + BASE),

    # ルーフデッキ 夜
    ("k4_rooftop_night",
     "Night on the rooftop deck of the west wing. "
     "String lights glowing warm. Outdoor sectional sofa, people lying on it watching the sky. "
     "The Milky Way stretching overhead — Hokkaido has zero light pollution. "
     "The inner courtyard lit below — dojo mats visible, campfire. "
     "The 2-story east wall with amber windows rising to the right. "
     "Perfect silence. Stars reflecting on a small reflection pool on the deck edge. "
     + BASE),

    # 中庭 — 斜め膜から見た非対称空間
    ("k4_dojo_center",
     "Inside the central courtyard dojo, looking toward the open south. "
     "LEFT: 2-story east wall with sliding glass doors (open). "
     "RIGHT: single-story west wall — through its doorways you can see the exterior. "
     "Above the west containers: the rooftop deck parapet visible at ~2.6m. "
     "Overhead: sloped PTFE membrane going from high (east/north wall top at 5.2m) "
     "down to lower (connecting to west wall top at 2.6m) — natural sloped form. "
     "White EVA mats floor to floor. Morning light flooding in from open south. "
     "Two people in white gi training. Breathtaking space. "
     + BASE),

    # 冬
    ("k4_winter_dojo",
     "Deep Hokkaido winter. Snow on rooftops. "
     "The asymmetric compound: tall east wing (2-story, snow on upper containers), "
     "short west wing (1-story, snow on rooftop — sofas covered in white covers). "
     "Under the membrane: white mats clear of snow, person training. "
     "Steam from hot tub. Blue-grey twilight. Snowflakes. "
     + BASE),

    # 外装全体
    ("k4_ext_full",
     "View of the west wing from the south-west. "
     "Single-story white stucco containers (2.6m tall). "
     "The flat rooftop: outdoor sofa visible above parapet. "
     "An external black steel staircase rising to the rooftop on the outer wall. "
     "Sliding glass door at ground level leading to container interior. "
     "Cedar deck at base. Hokkaido grassland backdrop. "
     + BASE),

    # クレーン
    ("k4_crane_install",
     "Construction photo: mobile crane positioning the final container. "
     "East wing: 4 containers placed (2 long × 2 high). "
     "West wing: 2 single-story containers already placed. "
     "North wall: 4 containers (2 wide × 2 high). "
     "The asymmetric height difference clearly visible. Workers guiding. "
     "Hokkaido morning light. "
     + BASE),

    # 寝室 interior (上層)
    ("k4_int_bedroom_wide",
     "Upper floor bedroom in east wing container. "
     "White plastered walls. King bed with white linen facing the window. "
     "Window looks DOWN into the inner courtyard AND west across to the rooftop sofa deck below. "
     "Exceptional dual view: dojo action below-left, Hokkaido panorama beyond. "
     "Morning light. Minimalist. " + BASE),
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
