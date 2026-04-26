#!/usr/bin/env python3
"""Generate 4 SOLUNA NEURO (AI CABIN) product images using Gemini image generation."""

import os
import sys
from pathlib import Path
from google import genai
from google.genai import types

# API key
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if not api_key:
    env_path = Path.home() / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                api_key = line.split("=", 1)[1].strip().strip('"').strip("'")
                break
if not api_key:
    print("ERROR: No GEMINI_API_KEY or GOOGLE_API_KEY found")
    sys.exit(1)

client = genai.Client(api_key=api_key)
output_dir = Path("/Users/yuki/workspace/soluna-web/cabin/img")
output_dir.mkdir(parents=True, exist_ok=True)

IMAGE_SPECS = [
    (
        "neuro_hub.jpg",
        "Photorealistic product photo of a smart home hub device. A sleek matte black Raspberry Pi 5 based device in a minimal aluminum enclosure, about the size of a deck of cards, sitting on a dark wood shelf. Small cyan LED indicator light on front. Clean cable management. Single ethernet cable and USB-C power. Background: dark modern cabin interior with exposed wood beams, slightly blurred. Studio lighting. Product photography style."
    ),
    (
        "neuro_sensors.jpg",
        "Photorealistic flat-lay product photo of smart home sensor components arranged on a dark slate surface. Items: 3 small white temperature/humidity sensors (BME280 in minimal cases), 2 black mmWave radar modules (small rectangular), 1 CT clamp energy sensor, 1 SESAME smart lock (metallic), 1 small speaker (dark mesh). All items are real products, neatly arranged with consistent spacing. Soft directional lighting. Product catalog style. Minimal, clean, professional."
    ),
    (
        "neuro_installed.jpg",
        "Photorealistic interior photo of a renovated Japanese countryside house (kominka) with visible smart home technology. Dark charcoal wood walls. A small white temperature sensor mounted discreetly on a wooden beam. Warm LED strip lighting controlled by smart system, glowing amber. A sleek smart lock visible on the entrance door. Through large windows: Japanese garden with snow. The tech is subtle and integrated, not dominating the space. Evening atmosphere. Architectural interior photography."
    ),
    (
        "neuro_dashboard_real.jpg",
        "Photorealistic photo of a large monitor displaying a dark-themed smart home monitoring dashboard. The screen shows: temperature graphs, energy flow diagrams, room status grid, all in cyan and dark theme. The monitor sits on a clean desk in a modern office. Slight screen glow illuminating the dark room. The dashboard data looks real and detailed. Shot from slight angle showing screen reflection. Professional tech office photography."
    ),
]

results = {}

for filename, prompt in IMAGE_SPECS:
    print(f"\n{'='*60}")
    print(f"Generating: {filename}")
    print(f"{'='*60}")
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )

        saved = False
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                out_path = output_dir / filename
                out_path.write_bytes(part.inline_data.data)
                size_kb = len(part.inline_data.data) / 1024
                print(f"  Saved: {out_path} ({size_kb:.0f} KB)")
                results[filename] = "SUCCESS"
                saved = True
                break
            elif part.text:
                print(f"  Text response: {part.text[:200]}")

        if not saved:
            print(f"  WARNING: No image data in response")
            results[filename] = "FAILED - no image data"

    except Exception as e:
        print(f"  ERROR: {e}")
        results[filename] = f"FAILED - {e}"

print(f"\n{'='*60}")
print("SUMMARY")
print(f"{'='*60}")
for filename, status in results.items():
    print(f"  {filename}: {status}")
