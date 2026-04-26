#!/usr/bin/env python3
"""Regenerate 4 inconsistent kumaushi photos"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = (
    "Cinematic film photograph, Kodak Portra 800 color grading. "
    "Deep crushed blacks, warm amber-gold highlights, desaturated cool blue shadows. "
    "Fine analog film grain. Sacred, silent, extreme atmosphere. "
    "Wide angle lens 16-24mm. Shot in Hokkaido Japan, open wilderness, no town, no city. "
    "Feels like a still from a feature film. No text, no logos. "
    "National Geographic / Wallpaper magazine editorial quality. "
)

SHOTS = [
    ("kumaushi_c_fireflies_night",
     "Two white EPS geodesic dome buildings in open Hokkaido grassland at night. "
     "Dozens of fireflies — soft yellow-green glowing dots — floating low in the dark meadow around the domes. "
     "Warm amber light glows from dome windows. Stars visible above open sky. "
     "NO barns, NO chapel, NO wood siding buildings. Geodesic dome shape only. Magical, remote, wilderness."),

    ("kumaushi_c_waterfall_stream",
     "Clear mountain stream rushing over grey rocks in Hokkaido open landscape. "
     "White birch trees and sparse low shrubs on riverbank. Open sky visible above. "
     "Bright summer light, cold clear water, wide river valley. "
     "NO dense tropical jungle, NO ferns, NO dark forest canopy. Open, bright, northern Japan feel."),

    ("kumaushi_c_ice_formation",
     "Wooden outdoor ice bath tub packed with large chunks of natural ice in a snowy Hokkaido winter setting. "
     "Nobody in the tub — just the ice and cold water. Steam from nearby sauna visible in background. "
     "Pine trees and snow. Pre-dawn blue light. "
     "NOT a hot spring. Cold ice bath only. Raw, extreme, Nordic atmosphere."),

    ("kumaushi_c_rooftop_yoga",
     "Solo figure doing warrior yoga pose on flat rooftop of EPS dome building. "
     "360-degree view of infinite Hokkaido wilderness — rolling grassland hills, distant mountains, NO town, NO river valley, NO buildings. "
     "Dawn golden light. Total isolation. Only grass and mountains to the horizon. "
     "The rooftop is simple flat surface, no railing visible. Freedom and raw power."),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL,
                contents=STYLE + prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"])
            )
            for p in r.candidates[0].content.parts:
                if p.inline_data and p.inline_data.data:
                    with open(out_jpg, "wb") as f:
                        f.write(p.inline_data.data)
                    subprocess.run(["cwebp", "-q", "90", out_jpg, "-o", out_webp], check=True, capture_output=True)
                    os.remove(out_jpg)
                    print(f"  ✓ {name}.webp")
                    return True
            print(f"  no image, retry {attempt+1}")
        except Exception as e:
            print(f"  error: {e}")
            time.sleep(5)
    return False

for name, prompt in SHOTS:
    gen(name, prompt)
    time.sleep(3)
print("done")
