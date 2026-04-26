#!/usr/bin/env python3
"""Generate SOLUNA NEURO hero image using Gemini image generation."""

import os
import base64
from google import genai
from google.genai import types

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY or GOOGLE_API_KEY")

client = genai.Client(api_key=API_KEY)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "cabin", "img")
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROMPT = (
    "Photorealistic architectural photograph of Villa Savoye by Le Corbusier "
    "in Poissy, France. The iconic white modernist building with pilotis "
    "(concrete columns), ribbon windows, roof garden, and ramp. Shot from the "
    "classic front-left angle showing the ground floor pilotis and upper living "
    "floor. Late afternoon golden hour light casting long shadows on the green "
    "lawn. The building is pristine white against a deep blue sky with soft "
    "clouds. Ultra high quality architectural photography, wide angle lens, "
    "slight low angle. The image captures the revolutionary 'machine for living' "
    "that changed architecture forever."
)

print("Generating image with gemini-3-pro-image-preview ...")
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=PROMPT,
    config=types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"],
    ),
)

saved = False
for part in response.candidates[0].content.parts:
    if part.inline_data is not None:
        out_path = os.path.join(OUTPUT_DIR, "neuro_hero_corbusier.jpg")
        with open(out_path, "wb") as f:
            f.write(part.inline_data.data)
        size_kb = os.path.getsize(out_path) / 1024
        print(f"Saved: {out_path} ({size_kb:.0f} KB)")
        saved = True
    elif part.text:
        print(f"Model text: {part.text}")

if not saved:
    print("ERROR: No image was returned by the model.")
    print("Full response:", response)
