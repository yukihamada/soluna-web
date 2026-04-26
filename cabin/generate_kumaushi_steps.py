#!/usr/bin/env python3
"""Generate step-by-step construction images for kumaushi hybrid build"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Photorealistic documentary construction photograph. Natural daylight. "
        "Shot on Canon EOS R5 with 24-70mm f/2.8 lens. Shallow depth of field where appropriate. "
        "Real materials, real textures, real scale. No CGI, no rendering artifacts. "
        "Location: open hilltop grassland in Hokkaido Japan, distant mountains, no power lines. ")

SHOTS = [
    # Step 1: 整地・置き基礎
    ("step1_foundation",
     "Close-up of concrete block foundations being placed on cleared flat ground on a Hokkaido hilltop. "
     "Simple rectangular concrete pier blocks arranged in two parallel rows about 6 meters apart, "
     "each row the length of a 20ft shipping container (about 6m). A small excavator nearby. "
     "Workers leveling with laser level. Green grass around the cleared area. Simple, fast. " + REAL),

    # Step 2: コンテナ搬入・クレーン設置
    ("step2_container_crane",
     "A large mobile crane (blue/yellow Tadano or Liebherr) lifting a dark charcoal-painted 20ft "
     "shipping container off a flatbed trailer truck. The container is mid-air, being swung over "
     "to concrete block foundations. One container already placed on the left. Open Hokkaido hilltop "
     "grassland. Construction workers in white helmets guiding with ropes. Clear blue sky. " + REAL),

    # Step 3: コンテナ内部（完成品）
    ("step3_container_interior",
     "Interior of a beautifully finished 20ft shipping container home. This is the bedroom unit: "
     "warm wood-paneled walls (light birch plywood), low platform bed with white linen duvet, "
     "a small desk with reading lamp, full-width window at the end showing Hokkaido mountain view. "
     "LED strip lighting along ceiling edge. Built-in closet. Compact but luxurious. Already complete "
     "from factory — furniture bolted in place for transport. " + REAL),

    # Step 4: EPSドーム パネル組立
    ("step4_dome_assembly",
     "Four workers assembling a white EPS (expanded polystyrene) dome structure on a Hokkaido hilltop. "
     "The dome is about 60% complete — curved white panels being stacked and bolted together. "
     "The dome sits between two dark shipping containers visible on either side. Panels are large, "
     "lightweight, carried by hand (no crane needed). The structure is clearly a hemisphere, about "
     "6 meters diameter. Bright daylight. " + REAL),

    # Step 5: テンション膜 張り
    ("step5_membrane_stretch",
     "Workers stretching a large white PTFE tensile membrane fabric over 4 angled steel posts "
     "(V-shaped, about 4m tall) that are bolted to the top edges of two shipping containers. "
     "The membrane is being pulled taut with cables and turnbuckles. Dramatic curved shape forming. "
     "The EPS dome visible in the background between the containers. Open Hokkaido hilltop. "
     "This is the canopy that will cover the outdoor deck. " + REAL),

    # Step 6: Powerwall・太陽光設置
    ("step6_solar_powerwall",
     "Two white Tesla Powerwall 3 battery units mounted on the side of a dark shipping container. "
     "An electrician connecting thick cables. Solar panels (about 20 panels) mounted on ground-mounted "
     "racks next to the containers, angled toward south. A white Starlink satellite dish on a pole "
     "nearby. All on an open Hokkaido hilltop. Clean, modular, plug-and-play installation. " + REAL),

    # Step 7: サウナ・バレルバス設置
    ("step7_sauna_barrel",
     "A Finnish cedar barrel sauna (horizontal barrel shape, about 2.5m long, with small chimney) "
     "being rolled into position on the wooden deck under the white membrane canopy. Next to it: "
     "a round Japanese hinoki (cypress) hot tub (about 1.8m diameter) already in place, and a "
     "stainless steel ice bath. Hoses and water connections visible. The membrane canopy above "
     "diffuses daylight. Hokkaido grassland visible beyond the deck edge. " + REAL),

    # Step 8: 完成・夕暮れ
    ("step8_complete_golden",
     "The completed container+dome+membrane compound at golden hour on the Hokkaido hilltop. "
     "Two dark containers flanking a white EPS dome, connected by a dramatic white tensile membrane "
     "canopy. Under the canopy: wooden deck with barrel sauna, hot tub, dining table. "
     "Solar panels and Tesla Powerwalls visible. Warm light from container windows and dome. "
     "A couple walking on the gravel path approaching. 270-degree panorama of grassland and "
     "distant mountains. Smoke rising from dome chimney (wood stove). Perfect. " + REAL),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_webp):
        print(f"  skip {name}")
        return True
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
