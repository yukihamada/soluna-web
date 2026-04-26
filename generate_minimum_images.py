#!/usr/bin/env python3
"""Generate MINIMUM HOUSE images via Gemini imagen"""
import os, base64, time
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=API_KEY)
OUT = Path("/Users/yuki/workspace/soluna-web/cabin/img")
OUT.mkdir(exist_ok=True)

IMAGES = [
    ("minimum_exterior", "Minimalist Japanese off-grid tiny house, perfect 6x6 meter square shape, black galvalume steel exterior, south-facing large triple-pane windows, steep single-slope roof with solar panels, surrounded by Hokkaido forest and snow, golden hour light, cinematic, architectural photography, dark moody tones"),
    ("minimum_interior", "Interior of minimalist off-grid tiny house in Hokkaido Japan, open plan living space, plaster walls, concrete floor, wood burning stove glowing orange, south window with forest view, warm amber light, minimal furniture, cozy atmosphere, architectural interior photography"),
    ("minimum_stove", "Cast iron wood burning stove in minimalist Japanese interior, fire visible through glass door, warm orange glow, plaster wall background, concrete floor, stack of firewood beside stove, dark moody atmosphere, close-up photography"),
    ("minimum_solar", "Solar panels on single-slope galvalume roof of small square off-grid house, Hokkaido forest background, blue sky, 5kW solar array, clean modern installation, drone aerial view"),
    ("minimum_electronics", "Custom DIY electronics circuit board with ESP32 microcontroller, CO2 sensor, temperature humidity sensors, soldering work, Rust code on laptop screen in background, maker workshop atmosphere, close-up macro photography"),
    ("minimum_winter", "Small minimalist square house in deep Hokkaido winter, heavy snow on roof, smoke from chimney, warm light glowing from large south window, surrounding snow-covered pine forest, blue twilight sky, peaceful solitary, cinematic wide shot"),
    ("minimum_loft", "Cozy sleeping loft in minimalist tiny house, low ceiling 1.4m, skylights, simple bedding, warm wood tones, natural light, minimalist Japanese aesthetic"),
]

for name, prompt in IMAGES:
    out_path = OUT / f"{name}.jpg"
    if out_path.exists():
        print(f"skip (exists): {name}")
        continue
    print(f"generating: {name}...")
    try:
        resp = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"]
            ),
        )
        for part in resp.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                data = base64.b64decode(part.inline_data.data) if isinstance(part.inline_data.data, str) else part.inline_data.data
                out_path.write_bytes(data)
                print(f"  saved: {out_path} ({len(data)//1024}KB)")
                break
        else:
            print(f"  no image in response")
        time.sleep(2)
    except Exception as e:
        print(f"  error: {e}")

print("done")
