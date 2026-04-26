#!/usr/bin/env python3
"""Generate 4 product images for SOLUNA NEURO AI CABIN BOM page using Gemini."""

import os
import base64
from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    # Try ~/.env
    env_path = os.path.expanduser("~/.env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                    API_KEY = line.strip().split("=", 1)[1].strip('"').strip("'")
                    break

assert API_KEY, "No API key found"

client = genai.Client(api_key=API_KEY)
OUT_DIR = os.path.join(os.path.dirname(__file__), "cabin", "img")
os.makedirs(OUT_DIR, exist_ok=True)

IMAGES = [
    (
        "neuro_bom_brain.jpg",
        "Photorealistic product photo of a Raspberry Pi 5 single-board computer in a sleek minimal black aluminum case with ventilation slits, sitting on a dark slate surface. A small cyan LED glows from the front. A microSD card is inserted. Clean, minimal. Single USB-C power cable connected. Studio lighting on dark background. Product photography."
    ),
    (
        "neuro_bom_sensors.jpg",
        "Photorealistic flat-lay product photo on dark slate: 2 tiny blue BME280 breakout boards (about 15mm square), 1 green MH-Z19C CO2 sensor module (gold NDIR chamber visible), 2 tiny HLK-LD2410B mmWave radar modules (small black PCBs), 1 waterproof DS18B20 temperature probe with stainless steel tip and cable, 1 small MEMS microphone module. All neatly arranged in a grid with consistent spacing. Soft directional studio lighting. Electronics product catalog style."
    ),
    (
        "neuro_bom_security.jpg",
        "Photorealistic product photo on dark surface: A SESAME smart lock (compact silver/black cylinder device that attaches to a door thumbturn), next to a small white hub device, 2 small magnetic door/window reed switch sensors (white, with adhesive backing), and 1 small MQ-2 gas/smoke sensor module on a red PCB. Clean arrangement. Product photography lighting."
    ),
    (
        "neuro_bom_power.jpg",
        "Photorealistic product photo on dark surface: A split-core CT clamp sensor (gray, opens like a clothespin around a wire), a small blue ADS1115 ADC breakout board, a blue 4-channel relay module with optocouplers (red LEDs visible), and 2 small water leak detection sensor strips (flat copper traces on PCB with wires). Clean arrangement on dark slate. Studio product photography."
    ),
]

for filename, prompt in IMAGES:
    out_path = os.path.join(OUT_DIR, filename)
    print(f"\n--- Generating: {filename} ---")
    print(f"Prompt: {prompt[:80]}...")

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        # Extract image from response
        saved = False
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                img_data = part.inline_data.data
                if isinstance(img_data, str):
                    img_data = base64.b64decode(img_data)
                with open(out_path, "wb") as f:
                    f.write(img_data)
                size_kb = os.path.getsize(out_path) / 1024
                print(f"Saved: {out_path} ({size_kb:.0f} KB)")
                saved = True
                break
        if not saved:
            print(f"WARNING: No image data in response for {filename}")
            if response.candidates[0].content.parts:
                for p in response.candidates[0].content.parts:
                    if p.text:
                        print(f"  Text: {p.text[:200]}")
    except Exception as e:
        print(f"ERROR generating {filename}: {e}")

print("\n--- Done ---")
