#!/usr/bin/env python3
"""Replace 8 wrong-building/location photos with correct EPS dome shots"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

# EPS dome description to inject into every prompt
DOME = (
    "EPS geodesic dome building — white/grey triangular geodesic panel exterior, "
    "diameter 6 meters, low profile sitting on Hokkaido hilltop grassland. "
    "NOT a ryokan, NOT concrete, NOT luxury hotel, NOT glass pavilion. "
    "Simple, raw, minimal. "
)

STYLE = (
    "Cinematic film photograph, Kodak Portra 800 color grading. "
    "Deep crushed blacks, warm amber-gold highlights, desaturated cool blue shadows. "
    "Fine analog film grain. Shot in Hokkaido Japan, open wilderness. "
    "No text, no logos. Feature film still quality. "
)

SHOTS = [
    ("kumaushi_a_aerial_layout",
     "Aerial drone shot looking down at two " + DOME +
     "Gravel path connects the two domes. Surrounding open grassland with patches of birch forest. "
     "Distant mountains and lake visible. Golden hour light. Perfect symmetry."),

    ("kumaushi_a_courtyard",
     "Simple outdoor gravel courtyard between two " + DOME +
     "A single pine tree, smooth stepping stones, small wooden bench. "
     "No concrete, no reflecting pool, no bonsai. Raw Hokkaido silence. "
     "Dusk light, soft amber glow from dome windows."),

    ("kumaushi_a_exterior_dusk",
     "Ground-level front view of one " + DOME +
     "Single lit entrance door with warm glow. Gravel path leads to dome. "
     "Open Hokkaido grassland in background, distant mountain silhouette. "
     "Deep dusk blue sky. Isolated, powerful."),

    ("kumaushi_a_rooftop_herbs",
     "Flat rooftop section of " + DOME +
     "Small wooden planter boxes with herbs and wildflowers. "
     "360-degree Hokkaido wilderness visible — rolling hills, no buildings. "
     "Afternoon golden light. Wind in grass. Minimal, honest."),

    ("kumaushi_a_room_sleeping",
     "Interior of small " + DOME +
     "Sleeping area: one futon laid directly on tatami mat, folded white linen. "
     "Geodesic triangular panel walls visible. Small wood stove in corner glowing. "
     "Dawn light through small triangular windows. Austere, meditative. "
     "NO shoji screens, NO calligraphy scroll, NO ryokan aesthetics."),

    ("kumaushi_b_group_training",
     "Interior of " + DOME +
     "Four people in white BJJ gi doing partner drilling on blue competition mats. "
     "Small triangular windows show Hokkaido winter landscape — snow, birch trees. "
     "Late afternoon golden geometric light patterns on mats. "
     "Low ceiling, intimate space. Sacred intensity."),

    ("kumaushi_b_water_ritual",
     "Person in white gi pouring cold water from wooden bucket over their head "
     "outdoors in a Hokkaido clearing. Early winter morning. "
     "Birch trees and open sky. Steam rising from the body. "
     "Simple wooden platform. Raw, spiritual purification. "
     "NO moss garden, NO temple, NO Kyoto architecture."),

    ("kumaushi_dojo_panorama_glass",
     "Interior wide-angle of small " + DOME +
     "Looking through the triangular geodesic windows at 270-degree Hokkaido panorama — "
     "mountains, lake, rolling hills. BJJ mats cover the floor. "
     "One person standing still, looking out. Geometric window shadows on mats. "
     "NOT a glass pavilion, NOT a large round dojo. Intimate, 6m dome."),
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
                    subprocess.run(["cwebp", "-q", "90", out_jpg, "-o", out_webp],
                                   check=True, capture_output=True)
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
    if gen(name, prompt):
        ok += 1
    else:
        fail += 1
    time.sleep(3)

print(f"\ndone: {ok} ok, {fail} fail")
