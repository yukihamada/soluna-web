#!/usr/bin/env python3
import os, base64, time
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=API_KEY)
OUT = Path("/Users/yuki/workspace/soluna-web/cabin/img")
OUT.mkdir(exist_ok=True)

IMAGES = [
    # SMALL
    ("small_exterior", "Ultra-tiny minimalist cabin, 3x6 meter rectangle, single person dwelling, black galvalume steel, one large south window, small solar panel, deep Hokkaido forest, cinematic architectural photography, moody dark tones"),
    ("small_interior", "Interior of ultra-tiny 18sqm off-grid cabin, everything in one room, loft bed ladder, compact wood stove, single south-facing window with forest view, warm amber light, cozy minimal Japanese design"),
    # LARGE
    ("large_exterior", "Large minimalist family house, 9x9 meter square, black galvalume steel exterior, wide south-facing glass facade, large solar array on single-slope roof, Hokkaido forest setting, golden hour, cinematic architectural photography"),
    ("large_interior", "Interior of large minimalist Japanese off-grid family home, open plan 81sqm, high ceiling 3m, large south windows, central wood burning stove, plaster walls, concrete floor, family dining area, warm tones"),
    # VENTY
    ("venty_electronics", "Custom-built ventilation control system, multiple microcontrollers ESP32 and Raspberry Pi on desk, CO2 sensors, humidity sensors, circuit boards, Rust code on laptop, maker lab atmosphere, blue LED glow, dark background, close-up"),
    ("venty_dashboard", "Smart home monitoring dashboard on wall-mounted screen, showing real-time CO2 levels 420ppm, temperature 22C, humidity 45%, airflow graphs, Grafana dark theme, minimalist Japanese interior, ambient lighting"),
    ("venty_exterior", "Minimalist 6x6 square house with custom ventilation pipes visible on exterior, black galvalume, Hokkaido forest, air intake and exhaust grilles, technical but beautiful, architectural photography"),
]

for name, prompt in IMAGES:
    out_path = OUT / f"{name}.jpg"
    if out_path.exists():
        print(f"skip: {name}")
        continue
    print(f"generating: {name}...")
    try:
        resp = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]),
        )
        for part in resp.candidates[0].content.parts:
            if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                data = base64.b64decode(part.inline_data.data) if isinstance(part.inline_data.data, str) else part.inline_data.data
                out_path.write_bytes(data)
                print(f"  saved {len(data)//1024}KB")
                break
        else:
            print(f"  no image")
        time.sleep(2)
    except Exception as e:
        print(f"  error: {e}")
print("done")
