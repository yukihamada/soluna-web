#!/usr/bin/env python3
"""Generate cabin concept images using Gemini image generation."""
import os, sys, base64, json, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
os.makedirs(OUT, exist_ok=True)

prompts = {
    "hero": (
        "Photorealistic architectural visualization of a modern off-grid cabin in Hokkaido, Japan winter landscape. "
        "Small expandable container house with beautiful charred cedar (shou sugi ban) exterior cladding, "
        "galvanized steel roof, warm light glowing from large windows at dusk. "
        "Surrounded by birch trees and snow-covered ground, with a wood deck and small chimney with smoke. "
        "A Nissan Leaf EV parked beside it. Solar panels visible on roof. "
        "Dramatic sky with pink and purple tones. Cinematic wide angle. Magazine quality."
    ),
    "interior": (
        "Photorealistic interior of a minimalist Scandinavian-Japanese cabin, 37 square meters. "
        "White diatomaceous earth (珪藻土) textured walls, natural cedar plank ceiling, warm LED lighting. "
        "A compact wood-burning stove with black chimney pipe in the corner. "
        "Simple modern kitchen with wooden countertop. Large window showing snowy Hokkaido forest outside. "
        "Cozy and warm atmosphere. Wool blanket on a simple sofa. Magazine interior photography."
    ),
    "summer": (
        "Photorealistic architectural photo of a modern tiny cabin in lush green Hokkaido summer. "
        "Charred cedar cladding exterior, wood deck with two chairs. "
        "Lake (Kussharo Lake) visible in the background through birch trees. "
        "Solar panels on the flat roof. A white Nissan Leaf EV charging next to the cabin. "
        "Blue sky, wildflowers. Peaceful off-grid living. Golden hour light. Wide angle."
    ),
    "expansion": (
        "Aerial architectural rendering of two modern container cabins arranged in L-shape "
        "with a shared wooden deck courtyard between them, in a forest clearing. "
        "Charred cedar cladding, galvanized roofs with solar panels. "
        "One cabin is living space, the other is a workshop/guest house. "
        "Surrounded by birch and pine trees. Hokkaido landscape. "
        "A fire pit on the deck. Architectural model style, clean rendering."
    ),
    "system": (
        "Clean infographic illustration showing an off-grid energy system. "
        "Minimalist flat design on dark background. "
        "Shows: solar panels on roof → charge controller → EV car battery (40kWh) → house power. "
        "Also shows: well water pump, wood stove, satellite internet dish. "
        "Connected by clean white lines and green accent arrows. "
        "Modern tech diagram style. Dark theme with green (#0aff9d) accent color."
    ),
    "deck": (
        "Photorealistic photo of a person sitting on a wooden deck of a modern cabin at sunset, "
        "looking out at a caldera lake (Kussharo Lake) in Hokkaido. "
        "The cabin has charred cedar walls. A cup of coffee on a simple wooden table. "
        "Warm golden light. Smoke rising from a chimney. "
        "Feeling of peace, freedom, and off-grid simplicity. Magazine lifestyle photography."
    ),
}

for name, prompt in prompts.items():
    print(f"Generating {name}...")
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                ext = part.inline_data.mime_type.split("/")[-1]
                path = f"{OUT}/{name}.{ext}"
                with open(path, "wb") as f:
                    f.write(part.inline_data.data)
                print(f"  Saved: {path}")
                break
        else:
            print(f"  No image in response for {name}")
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(2)

print("Done!")
