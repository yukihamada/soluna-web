#!/usr/bin/env python3
"""v5: full concept shots — pool, bar, party, shisha, billiards, night"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
BASE = "White stucco shipping containers. Hokkaido Japan highland. Magazine quality. "

SHOTS = [
    ("k4_pool_infinity",
     "Sunset. Heated infinity pool made from a converted shipping container. "
     "Pool dimensions 6m × 2.4m, water temperature 38°C, steam rising slightly. "
     "The south edge is an infinity overflow — water appears to merge with the vast Hokkaido grassland "
     "and mountains beyond. The horizon stretches infinitely. "
     "White container walls flank both sides of the pool. "
     "One person floating in the pool, eyes closed, completely relaxed. "
     "Orange-gold sunset light reflects on the water surface. "
     "Adjacent: barrel sauna glowing warm on the left, cold plunge misting on the right. "
     "Photography: architectural + lifestyle, cinematic wide angle. " + BASE),

    ("k4_bar_interior",
     "Night interior. A sleek bar inside a converted shipping container. "
     "Backlit liquor shelves: Japanese whisky (Hibiki, Yamazaki), craft gin, mezcal. "
     "3 tap beer handles. Brass fixtures, concrete counter. "
     "Bartender in black, making a cocktail. Warm amber lighting. "
     "Window: looking out over the courtyard where people are gathered around shisha. "
     "Moody, intimate. Like a high-end Tokyo bar but inside a container in the Hokkaido wilderness. "
     "Photography: interior editorial, warm tones. " + BASE),

    ("k4_party_courtyard",
     "Night party mode inside the courtyard dojo. "
     "The white PTFE membrane retracted halfway — stars visible through the open section. "
     "Centre: professional billiards table (9ft Brunswick), 4 people playing. "
     "Left wall: electronic dartboard lit up, two people playing. "
     "Background: north wall showing colorful projection (abstract art). "
     "2F glass window glows purple-blue — DJ booth visible above. "
     "Sound system speakers mounted on container walls. "
     "People in stylish casual clothes, drinks in hand, shisha smoke drifting. "
     "Amber and purple mood lighting from Philips Hue strips along container edges. "
     "Energy: Tokyo underground club meets wilderness. "
     "Photography: editorial nightlife, wide angle. " + BASE),

    ("k4_shisha_rooftop",
     "Golden hour on the west wing rooftop deck. "
     "Two people reclined on deep outdoor sectional sofas, sharing a hookah/shisha. "
     "Traditional Egyptian shisha on a low table, smoke curling in the warm air. "
     "Drinks: Japanese highball glasses on the table. "
     "View beyond the parapet: vast Hokkaido grassland, mountains, golden sky. "
     "The east wing's 2-story container wall is visible — DJ booth glass window glowing. "
     "Below: the retractable membrane roof of the courtyard. "
     "Completely serene, no other humans visible for miles. "
     "Photography: lifestyle editorial, warm cinematic. " + BASE),

    ("k4_dojo_party_split",
     "Split scene, same space, two different modes. "
     "LEFT HALF: Daytime dojo mode — two people in white gi training jiu-jitsu on white EVA mats. "
     "RIGHT HALF: Night party mode — same space, billiards table out, purple DJ lighting, "
     "people dancing, sauna glowing orange in corner. "
     "The membrane roof is consistent — white PTFE cathedral above both scenes. "
     "Hokkaido light (blue sky) on left, stars on right. "
     "Concept photography showing the multi-mode nature of the space. " + BASE),

    ("k4_aerial_v2",
     "Drone aerial, 70m altitude, golden hour, looking north-northwest. "
     "12-container compound on Hokkaido hilltop. White stucco. Asymmetric U-shape. "
     "EAST (right): 2 containers end-to-end, 2 stories (5.2m) — DJ booth glass 2F visible. "
     "NORTH (back): 1 container, 2 stories — bar inside. "
     "WEST (left): 3 containers, 1 story — rooftop deck with shisha setup visible. "
     "SOUTH (foreground): 1 container converted to INFINITY POOL extending south, "
     "water glowing blue, steam wisping. "
     "COURTYARD (centre): large white PTFE membrane partially retracted, "
     "motorized rails visible. White mats visible below. Sauna + cold plunge in SW corner. "
     "Cedar deck extending from south end. "
     "Vast Hokkaido grassland, mountains, dramatic clouds. "
     "Photography: drone architectural, cinematic. " + BASE),

    ("k4_wellness_circuit",
     "Aerial-angle view of the wellness circuit area. "
     "From left to right in sequence: "
     "1) Cedar barrel sauna (round, warm amber glow), "
     "2) Dark steel cold plunge tub (misting, 10°C), "
     "3) Infinity pool (6m long, heated 38°C, steam, south-facing). "
     "White container walls frame the scene. White EVA mats around. "
     "One person mid-circuit: coming out of sauna, about to step into cold plunge. "
     "Backdrop: Hokkaido mountains and grassland through the open south end. "
     "Photography: wellness lifestyle, wide angle, natural light. " + BASE),
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
