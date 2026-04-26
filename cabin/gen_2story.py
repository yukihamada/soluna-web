#!/usr/bin/env python3
"""2-story stacked container compound — premium image generation"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

BASE = ("Architectural photography, magazine quality, sharp, high dynamic range. "
        "White stucco-finished (lime plaster, RAL 9016) 20ft ISO shipping containers. "
        "2-story stacked configuration. Black anodized aluminum window frames. "
        "Hokkaido Japan highland setting, vast grassland, distant mountains. ")

SHOTS = [
    # Hero aerial — 2段積みコの字
    ("k4_aerial",
     "Aerial drone photo at golden hour, 50m altitude 40° angle. "
     "Twelve white stucco 20ft ISO shipping containers arranged in a U-shape (open south). "
     "TWO STORIES HIGH — ground floor containers plus identical containers stacked on top, "
     "creating 5.2m tall walls. The three walls (north, east, west) each formed by "
     "4 containers (2 wide × 2 high). Central open courtyard between the walls: "
     "white EVA puzzle mats on the ground, a translucent PTFE tensile membrane stretched "
     "flat across the top between the container roofs, like a skylight. "
     "Open south end with panoramic view of Hokkaido grassland and mountains. "
     "Cedar barrel sauna visible outside, solar panel array nearby. "
     "Golden light, dramatic clouds. " + BASE),

    # 正面外観 — 南から見たコの字
    ("k4_ext_ushape",
     "Eye-level view from south looking into the U-shape compound. "
     "Twelve white stucco containers form a perfect U: north wall (back) 2 containers wide × 2 high, "
     "east and west walls each 2 containers long × 2 high. Total height 5.2m. "
     "Ground floor: large sliding glass doors on courtyard-facing walls. "
     "Upper floor: smaller windows looking over the courtyard and landscape. "
     "Translucent tensile membrane roof visible spanning between upper container edges. "
     "Central courtyard: white EVA mats, rocket mass heater at far end wall. "
     "Open south framing infinite Hokkaido grassland horizon. Cedar deck in foreground. "
     "Golden hour, warm light flooding into courtyard. " + BASE),

    # 中庭道場 — 内側から
    ("k4_dojo_center",
     "Standing inside the central courtyard, looking north. "
     "White stucco container walls rise 5.2m on three sides. "
     "Ground floor has large sliding glass doors open to courtyard. "
     "Upper floor has square windows at 3m height. "
     "Translucent PTFE membrane overhead spans the full courtyard — "
     "diffused natural light, cathedral-like quality. "
     "Floor: pristine white EVA puzzle mats edge to edge. "
     "North wall: 4K short-throw projector screen mounted high, "
     "compact rocket mass heater at base. "
     "Two people in white gi practice BJJ on white mats. "
     "Breathtaking. " + BASE),

    # 夜景 — 2段積み白く光る
    ("k4_night",
     "Night photography, long exposure, Milky Way overhead. "
     "The 2-story white container compound glows like a lantern on Hokkaido hilltop. "
     "Upper floor windows: warm amber room light. "
     "Ground floor sliding doors: warm glow from interior. "
     "Courtyard: visible from open south end — string lights along membrane edges, "
     "campfire burning on white mats, orange glow rising. "
     "White stucco walls luminous in warm uplighting. "
     "Stars and Milky Way fill the sky. Magical, cinematic. " + BASE),

    # 冬 — 雪と2段積み
    ("k4_winter_dojo",
     "Heavy snowfall, Hokkaido winter. "
     "The 2-story white container compound: snow on upper container rooftops "
     "but the tensile membrane courtyard roof holds a gentle curve of snow. "
     "White stucco walls indistinguishable from snow — stunning white-on-white. "
     "Under the membrane: white mats clear of snow, warm amber interior light visible. "
     "A lone figure in white gi training on mats. Steam from barrel hot tub outside. "
     "Blue-grey twilight. Snowflakes. Absolute silence. The most beautiful dojo. " + BASE),

    # クレーン設置 — 2段目を積む
    ("k4_crane_install",
     "Construction documentary photo. Mobile crane lifting a white stucco 20ft container "
     "onto the top of an existing ground-floor container. "
     "Ground floor: 6 white containers already placed in U-shape. "
     "The crane is placing the 7th container (upper floor, east wall). "
     "Workers with hard hats guide it into position. "
     "ISO twist locks visible at the corners. "
     "Hokkaido grassland setting. Late afternoon light. Historic moment. " + BASE),

    # 外装 — 2段の壁面
    ("k4_ext_full",
     "Close frontal view of one corner of the compound: ground floor and upper floor containers "
     "stacked precisely, corner castings locked. "
     "The stucco finish covers both levels continuously — seamless. "
     "Upper level: one square window. Ground level: sliding glass door plus window. "
     "A steel external staircase (black powder-coated) rises along the corner to upper floor. "
     "Cedar wood accents at doors. Grass at base. Deep blue Hokkaido sky. " + BASE),

    # 内装 — 上段ベッドルーム
    ("k4_int_bedroom_wide",
     "Interior of upper-floor container bedroom. "
     "White plastered walls and ceiling. Airweave king mattress on low platform. "
     "Wide window looking DOWN onto the inner courtyard (white mats, training happening below) "
     "AND out to the Hokkaido grassland beyond the open south end. "
     "Dual view: down into dojo, out to mountains. Extraordinary. "
     "Morning light. Minimalist. " + BASE),

    # 内装 — バスルーム
    ("k4_int_bath",
     "Ground-floor bathroom container interior. "
     "Stone-look tile floor, floor drain, freestanding soaking tub. "
     "Round porthole window (400mm diameter) with view of grassland. "
     "Rain shower in corner, stainless fixtures. White plaster walls. "
     "Spa quality. Warm neutral light. " + BASE),

    # 内装 — キッチン
    ("k4_int_kitchen_wide",
     "Ground-floor kitchen/dining container. "
     "White Silestone counter, IH range, Balmuda appliances. "
     "Large sliding door opens to courtyard — cooking while watching training. "
     "Counter-height window at 1000mm (looking onto courtyard). "
     "Wood dining table 4-seat. White walls. Late afternoon light. " + BASE),

    # サウナ外観
    ("winter_sauna",
     "Cedar barrel sauna and barrel hot tub outside the compound in Hokkaido snow. "
     "The 2-story white compound visible in background, glowing warmly. "
     "Steam rising from hot tub into cold winter air. "
     "Snow on cedar sauna roof. Outdoor changing bench. "
     "Dramatic blue-grey dusk. " + BASE),
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
                    with open(out_jpg, "wb") as f:
                        f.write(part.inline_data.data)
                    subprocess.run(["cwebp", "-q", "92", out_jpg, "-o", out_webp],
                                   check=True, capture_output=True)
                    os.remove(out_jpg)
                    kb = os.path.getsize(out_webp) // 1024
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
