#!/usr/bin/env python3
"""Generate detailed container exterior/interior photos"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Photorealistic photograph. Natural lighting. Sharp focus. "
        "Looks like a real product photo from a container house manufacturer's website. "
        "Clean, professional, honest. No artistic filters. ")

SHOTS = [
    # コンテナ外装 — 全体（黒マット仕上げ）
    ("k4_ext_full",
     "A single 20ft shipping container converted into a tiny home, sitting on grass. "
     "Exterior: matte black Corten steel, with one large sliding glass door cut into the long side "
     "and one square window at the end. The glass shows warm interior. Small wooden step at the "
     "door. Clean industrial look. Simple, no decoration. Like a real product photo from a "
     "Japanese container house company (DEVOA, Container Works). Daylight. " + REAL),

    # コンテナ外装 — ドア・窓ディテール
    ("k4_ext_detail",
     "Close-up detail of a converted shipping container exterior. Focus on the sliding glass door "
     "panel (aluminum frame, double-glazed) cut into the dark steel wall. You can see the interior "
     "— warm wood walls, a bed visible inside. The original container corrugated steel surface "
     "texture is visible, painted matte black. Container corner casting and ISO locking mechanism "
     "visible at the corner. Real container, real conversion. " + REAL),

    # コンテナ内装 — 寝室全景（広角）
    ("k4_int_bedroom_wide",
     "Wide-angle interior photo of a 20ft container bedroom unit. Standing at the door looking in. "
     "Full view: light wood panel walls (birch plywood), queen bed centered at the far end with "
     "window behind it showing mountains, built-in closet on right wall, small desk on left wall, "
     "recessed ceiling LED lights. The corrugated steel ceiling is visible above the wood panels — "
     "painted white. Dark vinyl plank flooring. Everything built-in and compact. Real finished "
     "container house interior. " + REAL),

    # コンテナ内装 — キッチン全景
    ("k4_int_kitchen_wide",
     "Wide-angle interior of a 20ft container kitchen/dining unit. Compact galley kitchen on left: "
     "white laminate countertop, matte black sink, two-burner IH cooktop, under-counter fridge, "
     "open shelving above with cups and plates. Right side: a fold-down dining table for 4 with "
     "bench seating built into the wall. Window at far end. Warm pendant light. The container "
     "shell is visible — steel walls with insulation and wood panel lining. Real, functional. " + REAL),

    # コンテナ内装 — バスルーム
    ("k4_int_bath",
     "Interior of a container bathroom unit. Compact but luxurious: walk-in shower with overhead "
     "rain showerhead, gray tile walls, glass partition. A small oval soaking bathtub (white acrylic, "
     "Japanese-style deep tub) next to a porthole window. Heated towel rail on wall. Matte black "
     "fixtures throughout. Good lighting. Very clean design. The container structure is subtly "
     "visible — steel wall behind the tiles at the edges. " + REAL),

    # コンテナ4台コの字配置 — 地上からの外観
    ("k4_ext_ushape",
     "Ground-level photo of four matte-black 20ft shipping containers arranged in a U-shape on "
     "a Hokkaido hilltop. The open end faces the viewer, revealing a wooden deck and green martial "
     "arts mats in the central courtyard. A white membrane canopy is stretched above the courtyard. "
     "Each container has glass doors/windows cut in, warm light inside. The containers sit on "
     "concrete block foundations, slightly raised off the ground. Wooden steps at each door. "
     "Late afternoon sun. Real architectural photography. " + REAL),
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
