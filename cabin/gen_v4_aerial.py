#!/usr/bin/env python3
"""v4: new aerial with DJ booth on 2F, bigger retractable membrane, single-row walls"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
BASE = ("Architectural photography, magazine quality. White stucco RAL 9016 containers. "
        "Hokkaido Japan highland. Black aluminum frames. ")

SHOTS = [
    ("k4_aerial",
     "Drone aerial photo, golden hour, 60m altitude, 45° angle, looking NORTH. "
     "Asymmetric U-shaped compound on Hokkaido hilltop. White stucco 20ft ISO containers. "
     "LAYOUT (from above): "
     "RIGHT (east): SINGLE ROW of 2 containers, end-to-end north-south, STACKED 2 STORIES (5.2m tall). "
     "Upper floor has a DJ BOOTH visible through glass — Pioneer DJ decks, LED glow purple. "
     "BACK (north): SINGLE ROW — 1 container, 2 stories high (5.2m). Connects to east. "
     "LEFT (west): SINGLE ROW of 2 containers end-to-end, 1 story (2.6m). "
     "Open rooftop sofa deck on top of west containers. "
     "MEMBRANE (the showpiece): Large retractable PTFE white fabric, "
     "approximately 120sqm covering the entire courtyard and extending 8m south of the containers. "
     "Membrane is SLOPED — high at north/east (5.2m), low at west (2.6m), fully open south end. "
     "MOTORIZED RAILS visible at edges — the membrane is partially retracted, showing "
     "the mechanism. Stainless steel rails and motor housing at container roof level. "
     "INSIDE COURTYARD visible from drone: "
     "White EVA jiu-jitsu mats. Cedar barrel sauna (round, SW corner). "
     "Dark steel cold plunge tub next to sauna. "
     "Short-throw projector on east wall aiming at smooth north wall. "
     "Cedar deck extending 8m south under membrane. "
     "BEYOND: Vast Hokkaido grassland, mountains, dramatic golden hour clouds. "
     + BASE),

    ("k4_dj_booth",
     "Interior of 2nd floor DJ booth, east wing. "
     "Full-width floor-to-ceiling glass window looking down over the courtyard dojo. "
     "Pioneer DDJ/CDJ deck setup. Professional monitors. Mood lighting purple/amber. "
     "View below: white jiu-jitsu mats, barrel sauna glowing, cold plunge misting, "
     "projected image on north wall. "
     "Hokkaido mountain view through south-facing windows. "
     "Minimalist white stucco interior, concrete floor, black aluminum trim. "
     + BASE),

    ("k4_membrane_retract",
     "Late afternoon, the retractable PTFE membrane partially retracted. "
     "Stainless motorized rails along the container rooftop edges. "
     "The white PTFE fabric folded accordion-style at the north end. "
     "South half of courtyard fully open to blue sky and Hokkaido panorama. "
     "White jiu-jitsu mats catch afternoon light. "
     "Cedar sauna in corner. Cold plunge. "
     "2F east wall: large glass window of DJ booth visible. "
     "Dramatic contrast: high-tech motorized ceiling + rustic cedar wood + white mats. "
     + BASE),
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
