#!/usr/bin/env python3
"""v3b: remaining images — projector, ext, night, winter, crane"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
BASE = ("Architectural photography, magazine quality. White stucco RAL 9016 containers. "
        "Hokkaido Japan highland. Black aluminum frames. ")

SHOTS = [
    ("k4_projector",
     "Dusk inside the compound courtyard. The smooth white stucco north wall (5.2m tall, 12m wide) "
     "is lit by a 4K short-throw projector beam showing cinematic mountain landscape. "
     "The projection is 4m wide × 2.5m tall on the wall. Courtyard dim, projection main light source. "
     "White EVA mats glow blue-white. Sloped white PTFE membrane above, cathedral light. "
     "Open south end shows first stars. Cedar barrel sauna glows orange in SW corner. "
     "Cold plunge tub dark, misting. Two people sit on mats watching the projection. " + BASE),

    ("k4_ext_ushape",
     "Eye-level from south at golden hour looking into U-shape. "
     "LEFT (east): 2-story 5.2m white wall, glass sliding doors. "
     "RIGHT (west): single-story 2.6m, rooftop sofa deck visible above parapet. "
     "MEMBRANE: dramatically sloped white PTFE — high at north/east (5.2m), angled down to west (2.6m), "
     "completely open south. Snow would slide off the open end. "
     "Inside glimpse: white mats, barrel sauna orange-glowing in corner. "
     "Hokkaido mountains at golden hour. Cedar deck foreground. " + BASE),

    ("k4_night",
     "Night, Milky Way overhead. Compound from south: "
     "East 2-story wall amber windows. West 1-story rooftop string lights. "
     "Sloped membrane glows softly from inside — projector light and sauna orange. "
     "Inside: barrel sauna orange, cold plunge misting, north wall projection visible. "
     "Stars. Absolute silence. " + BASE),

    ("k4_winter_dojo",
     "Hokkaido deep winter. Snow on container rooftops. "
     "The sloped membrane: snow slides off the open south end (pile of snow on cedar deck). "
     "Inside under membrane: warm, barrel sauna steaming, cold plunge with snow on rim, "
     "person in white gi training on white mats. "
     "Blue-grey dusk, snowflakes falling. " + BASE),

    ("k4_crane_install",
     "Construction: crane placing final upper container on east wall. "
     "East and north 2-story walls already white stucco. West wing single-story placed. "
     "Inside courtyard empty, concrete foundation pads visible for sauna and cold plunge positions. "
     "Workers with helmets. Hokkaido morning light. " + BASE),

    ("k4_rooftop_deck",
     "Rooftop terrace on west wing single-story containers at sunset. "
     "White stucco parapet. Deep outdoor sectional sofa linen cushions. "
     "VIEW: east-south over inner courtyard — sloped membrane, 2-story east wall rising. "
     "Beyond: infinite Hokkaido grassland horizon sunset. "
     "String lights. Person with wine glass. " + BASE),
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
