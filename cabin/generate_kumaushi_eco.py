#!/usr/bin/env python3
"""Generate eco-system images for kumaushi zero-infrastructure plan"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Photorealistic photograph, natural lighting. Clean, sharp. "
        "Real products, real installations. No artistic filters. ")

SHOTS = [
    # 雨水収集 — コンテナ屋根+膜から集水
    ("eco_rainwater",
     "Rainwater harvesting system on a white container building. A large stainless steel "
     "water tank (1000L IBC tote) sits beside the container. Gutters along the container roof "
     "feed into the tank through a first-flush diverter. A simple carbon filter attached. "
     "Clear tubing visible. Green Hokkaido grassland background. Simple, functional, real. " + REAL),

    # コンポストトイレ
    ("eco_compost_toilet",
     "A modern composting toilet installed in a small bathroom. The toilet is a sleek white "
     "unit (like Separett Villa or Nature's Head brand). Clean, minimal design — NOT an "
     "outhouse. White tiled walls. Small exhaust fan vent pipe going up. A bag of wood "
     "shavings/sawdust next to it. Looks like a normal modern bathroom. No smell, no stigma. " + REAL),

    # ロケットマスヒーター
    ("eco_rocket_heater",
     "A rocket mass heater inside a room. A short metal combustion chamber (J-tube design) "
     "feeds into a long thermal mass bench made of cob/clay/brick along the wall. The bench "
     "is smooth, plastered white. A small fire visible in the feed tube. A kettle on top. "
     "This heater burns small twigs and sticks, uses 90 percent less wood than a regular stove, "
     "and the thermal mass stays warm for 12 hours. Cozy, efficient. " + REAL),

    # 葦のグレイウォーター浄化
    ("eco_reed_bed",
     "A small constructed wetland / reed bed water treatment system outdoors. A shallow "
     "rectangular basin (about 2m x 4m) lined with gravel, planted with tall reeds and "
     "cattails. Gray water from a pipe enters one end, clean water exits the other end into "
     "a small garden. Natural, beautiful, functional. Green plants, flowing water. "
     "Hokkaido landscape in background. " + REAL),

    # ソーラーサーマル — お湯を太陽で沸かす
    ("eco_solar_thermal",
     "Simple solar thermal water heating tubes mounted on a white container roof. Black "
     "vacuum tube solar collectors (about 20 tubes) in a rack, connected with insulated "
     "copper pipes to a hot water tank. Blue sky. This heats the barrel hot tub and shower "
     "water using only sunlight. No electricity needed for hot water. Clean installation. " + REAL),

    # コンテナ屋上菜園
    ("eco_rooftop_garden",
     "A small vegetable garden growing on top of a white shipping container roof. Shallow "
     "raised beds (about 15cm deep) with herbs, lettuce, tomatoes, and small vegetables. "
     "Lightweight soil mix. A drip irrigation line from the rainwater tank. Person picking "
     "herbs. Hokkaido mountains in background. Food growing on the roof of your house. " + REAL),
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
