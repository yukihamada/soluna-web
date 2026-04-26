#!/usr/bin/env python3
"""Generate images for 4-container layout with central dojo/mat space"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Photorealistic photograph, iPhone 15 Pro quality. Natural lighting. "
        "Clean, sharp, honest photo. No cinematic color grading, no film grain. "
        "Real materials, real construction. ")

SHOTS = [
    # 全景空撮 — 4コンテナ コの字配置
    ("k4_aerial",
     "Aerial drone photo of four dark matte-black 20ft shipping containers arranged in a U-shape "
     "(open side facing south) on a flat hilltop in Hokkaido grassland. The central open area between "
     "the containers has a large white tensile membrane canopy overhead and green martial arts tatami "
     "mats laid out on the ground (Brazilian Jiu-Jitsu training area). A wooden deck extends from "
     "the containers. A barrel sauna and hot tub visible on one side. Solar panels on ground racks "
     "nearby. Vast open grassland stretching to distant mountains. Clear day. " + REAL),

    # 真ん中の道場スペース — マット
    ("k4_dojo_center",
     "Ground-level photo looking into the central courtyard of a U-shaped container compound. "
     "Four containers form the walls (dark matte black exteriors). The floor is covered with "
     "green tatami-style martial arts mats (puzzle interlocking EVA foam). A white fabric canopy "
     "overhead provides shade but allows air flow. Two people in white gis practicing Brazilian "
     "Jiu-Jitsu on the mats. Open end of the U reveals a panoramic view of Hokkaido mountains "
     "and grassland. Simple, raw, functional training space. " + REAL),

    # コンテナ寝室ユニット（アップグレード版）
    ("k4_bedroom",
     "Interior of a luxury-finished 20ft shipping container bedroom. Japanese minimalist design: "
     "light ash wood walls, low platform bed with premium white linen and indigo throw blanket. "
     "Full-width sliding glass door at the end with Hokkaido mountain panorama. Recessed warm LED "
     "lighting. Small floating desk with Eames chair. Built-in speaker. Cedar wood floor. "
     "Everything integrated, no clutter. Hotel-quality finish inside a container. " + REAL),

    # コンテナ水回り・バスユニット
    ("k4_bathroom",
     "Interior of a 20ft shipping container converted into a luxury bathroom/shower room. "
     "Walk-in rain shower with large-format gray stone tile walls. A deep Japanese-style soaking "
     "tub (oval, white composite) by a porthole window with mountain view. Matte black fixtures. "
     "Heated towel rail. Warm LED strip lighting under floating vanity. Cedar wood accents. "
     "Spa-quality finish. " + REAL),

    # コンテナキッチン・ダイニング
    ("k4_kitchen",
     "Interior of a 20ft shipping container kitchen and dining area. Open plan: compact kitchen "
     "at one end with concrete countertop, black matte faucet, two-burner induction cooktop, "
     "under-counter fridge, open shelving with ceramics and glassware. A wooden dining table for "
     "4 people by a large window with grassland view. Pendant light above table. "
     "Warm, inviting, well-designed small space. " + REAL),

    # 夜景 — 4コンテナ + 膜 ライトアップ
    ("k4_night",
     "The 4-container U-shaped compound at night on a Hokkaido hilltop. Containers glow warm amber "
     "from windows and glass doors. The central tensile membrane canopy is lit from below with "
     "warm uplights, revealing the green martial arts mats underneath. A campfire burns on the "
     "open deck beyond the U-shape. Stars visible overhead — Milky Way. Tesla Powerwall LEDs "
     "glowing on container side. Barrel sauna chimney has a faint glow. Magical, remote. " + REAL),

    # クレーン設置 — 4台目
    ("k4_crane_install",
     "Mobile crane placing the fourth and final dark shipping container into position, completing "
     "the U-shape arrangement. Three containers already in place on concrete block foundations. "
     "Workers in hard hats and safety vests. A stack of green interlocking martial arts mats "
     "sitting on a pallet nearby, ready to be laid in the center. Open Hokkaido grassland. "
     "Documentary construction photo. " + REAL),

    # 冬の道場 — 雪の中でトレーニング
    ("k4_winter_dojo",
     "The central courtyard dojo space in winter. Snow on the container roofs and on the ground "
     "around the compound. But under the membrane canopy, the green mats are clear. "
     "A person in a white gi training solo on the mats. Steam rising from the barrel hot tub "
     "nearby. Cold breath visible. The containers provide wind protection on three sides. "
     "Mountains covered in snow in the background through the open end. Raw, beautiful. " + REAL),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_webp):
        os.remove(out_webp)
    if os.path.exists(out_jpg):
        os.remove(out_jpg)
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
