#!/usr/bin/env python3
"""v5 vehicles: snowmobile, snow bike, harley, ferrari, EV"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
BASE = "White stucco shipping container compound. Hokkaido Japan. Magazine quality photography. "

SHOTS = [
    ("k4_snowmobile",
     "Action photography. Deep Hokkaido winter. Two snowmobiles racing across a vast snow-covered "
     "highland plateau, powder snow spraying behind them. "
     "Background: the white container compound visible on the hilltop, smoke from the barrel sauna. "
     "Mountains in distance. Blue-white winter sky. Motion blur on the snowmobiles. "
     "Riders in colorful snowmobile suits, helmets. "
     "Photography: high speed action, dynamic angle, cinematic. " + BASE),

    ("k4_snow_bike",
     "Hokkaido winter dusk. A snow bike (motorcycle converted for snow, fat studded tires) "
     "parked dramatically on a snow-covered hill, engine running, exhaust steam visible. "
     "White container compound in background, warm lights glowing. "
     "Mountains and purple winter sky. "
     "The bike is matte black, aggressive stance. Rider in black gear standing beside it. "
     "Photography: automotive editorial, moody, cinematic. " + BASE),

    ("k4_harley",
     "Golden hour, Hokkaido summer. A Harley-Davidson (matte black, touring model) "
     "parked on the cedar deck in front of the white container compound. "
     "The motorcycle gleams in the warm light. "
     "White stucco container walls behind, sliding glass doors open, "
     "glimpse of the courtyard inside. "
     "Vast Hokkaido grassland and mountains beyond. "
     "Photography: automotive editorial, golden light, wide. " + BASE),

    ("k4_supercar",
     "Sunset. A red Ferrari (modern, sleek, prancing horse badge visible) "
     "parked in front of the white container compound on the gravel approach. "
     "The white stucco walls catch the last sunlight. "
     "The contrast: Italian supercar + industrial white containers + infinite Hokkaido grassland. "
     "No other cars. No buildings for miles. Just the Ferrari and the containers and the mountains. "
     "Photography: automotive magazine cover, dramatic angle, golden hour. " + BASE),

    ("k4_ev_tesla",
     "Morning. A white Tesla Model S (or similar sleek EV) "
     "plugged into a wall charger mounted on the white container exterior. "
     "Solar panels visible on container rooftop. "
     "The EV and the solar panels: completely off-grid charging. "
     "Hokkaido morning mist over the grassland beyond. "
     "Photography: automotive + architecture, clean, editorial. " + BASE),

    ("k4_garage_vehicles",
     "Wide angle. The container compound vehicle area. "
     "SUMMER scene: Harley-Davidson + Ferrari + Tesla all parked side by side "
     "on the gravel forecourt. "
     "White container walls behind them. "
     "INSET (top right): same spot in winter — snowmobiles instead. "
     "Photography: automotive editorial, wide establishing shot. " + BASE),

    ("k4_snowmobile_action",
     "Aerial drone view. Multiple snowmobiles making tracks in fresh deep powder snow "
     "across the vast Hokkaido highland plateau. "
     "The white container compound visible as a small structure on the hilltop. "
     "The scale is epic: tiny machines against infinite white landscape. "
     "Morning light, long blue shadows. "
     "Photography: drone aerial, wide, epic landscape. " + BASE),
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
