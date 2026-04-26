#!/usr/bin/env python3
"""Regenerate key images: white stucco containers + white mats"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Photorealistic photograph, iPhone 15 Pro quality. Natural lighting. "
        "Clean, sharp, honest photo. No cinematic filters. Real materials. ")

SHOTS = [
    # 空撮 — 白漆喰コンテナ + 白マット
    ("k4_aerial",
     "Aerial drone photo of four white stucco-finished 20ft shipping containers arranged in a "
     "U-shape on a flat hilltop in Hokkaido green grassland. The containers have smooth white "
     "plastered/stucco exterior walls (like Mediterranean houses). The central courtyard has "
     "WHITE martial arts mats laid out. A white tensile membrane canopy overhead. A cedar barrel "
     "sauna and wooden hot tub on one side. Solar panels on ground racks nearby. Vast green "
     "grassland stretching to distant mountains. Clear blue sky. Beautiful, clean. " + REAL),

    # 道場 — 白マット + 白コンテナ壁
    ("k4_dojo_center",
     "Ground-level photo looking into the central courtyard of a U-shaped compound. White stucco "
     "walls of containers on three sides. The floor is covered with WHITE martial arts mats "
     "(clean white EVA puzzle mats). A light-colored fabric canopy above. Two people in white gis "
     "practicing Brazilian Jiu-Jitsu on the white mats. The open end shows panoramic Hokkaido "
     "mountains and grassland. Bright, clean, minimal. The white walls and white mats create a "
     "serene dojo atmosphere. " + REAL),

    # 外装全体 — 白漆喰仕上げコンテナ
    ("k4_ext_full",
     "A single 20ft shipping container converted into a tiny home, sitting on green grass. "
     "Exterior finished in smooth WHITE STUCCO (plastered finish, like a Greek island house). "
     "One large sliding glass door with black aluminum frame. One square window. Small wooden "
     "step at door. Clean, minimal, elegant. The stucco completely hides the corrugated steel. "
     "Looks like a modern Mediterranean micro-villa. Daylight. " + REAL),

    # 外装ディテール — 漆喰テクスチャ
    ("k4_ext_detail",
     "Close-up detail photo of white stucco wall texture on a converted shipping container. "
     "You can see the smooth hand-applied plaster finish (lime stucco, slightly textured like "
     "traditional Japanese shikkui). A black-framed glass sliding door is partially visible. "
     "The container corner casting is also plastered over but the geometric shape is visible. "
     "Warm sunlight casting soft shadows on the white surface. Beautiful craftsmanship. " + REAL),

    # コの字外観 — 白漆喰 夕暮れ
    ("k4_ext_ushape",
     "Ground-level photo of four white stucco shipping containers arranged in a U-shape on a "
     "Hokkaido hilltop at golden hour. White plastered walls glowing warm in sunset light. "
     "Glass doors and windows showing warm interior. White membrane canopy over central courtyard "
     "where white mats are visible. Wooden deck extending outward. Simple, beautiful. "
     "Like a small Greek monastery dropped on a Hokkaido hilltop. " + REAL),

    # 夜景 — 白コンテナ ライトアップ
    ("k4_night",
     "The white stucco container compound at night on a Hokkaido hilltop. White walls softly "
     "illuminated by warm uplights. Glass doors glowing amber from interior. The central courtyard "
     "with white mats is lit by string lights along the membrane canopy. A campfire burning on "
     "the open deck. Stars and Milky Way visible overhead. The white surfaces reflect the warm "
     "light beautifully. Serene. " + REAL),

    # クレーン設置 — 白コンテナ
    ("k4_crane_install",
     "Mobile crane lifting a WHITE STUCCO-FINISHED 20ft shipping container off a flatbed truck. "
     "The container has smooth white plastered exterior. Three white containers already placed "
     "in position forming a U-shape. Workers in helmets guiding. A pallet of white martial arts "
     "mats nearby. Open Hokkaido grassland. Documentary construction photo. " + REAL),

    # 冬 — 白コンテナ + 雪
    ("k4_winter_dojo",
     "The white stucco container compound in Hokkaido winter. Snow on container roofs and ground. "
     "The white containers blend beautifully with the snow. Under the membrane canopy, the white "
     "mats are clear of snow. A person in white gi training on the white mats. Steam rising from "
     "the barrel hot tub nearby. The white-on-white aesthetic is stunning. Mountains with snow "
     "in background. " + REAL),
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
