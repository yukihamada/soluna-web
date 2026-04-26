#!/usr/bin/env python3
"""Generate village/resort concept images."""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

prompts = {
    "village_aerial": (
        "Aerial architectural rendering of a small eco-village resort in a Hokkaido birch forest clearing. "
        "5-6 dark charred cedar tiny cabins scattered organically among trees, connected by wooden boardwalks. "
        "A central fire pit gathering area. One tower sauna structure. Solar panels on roofs. "
        "A small outdoor stage/amphitheater made of wood. Kussharo Lake visible in the background. "
        "Summer golden hour. Architectural masterplan rendering style. Beautiful and aspirational."
    ),
    "music_stage": (
        "A small intimate outdoor music stage in a Hokkaido forest clearing at sunset. "
        "Simple wooden stage with string lights overhead. About 50 people sitting on wooden benches and blankets. "
        "Acoustic musician performing. Birch trees surrounding the venue. Warm orange and purple sky. "
        "Cozy festival atmosphere. Bonfire nearby. Modern dark cabins visible in the background. "
        "Magazine lifestyle photography quality."
    ),
    "sauna_tower": (
        "A striking modern tower sauna building in a Hokkaido forest. "
        "Charred cedar cladding, tall narrow structure about 8 meters high with large windows. "
        "Steam visible. A cold plunge pool nearby made of natural stone. "
        "Birch trees and snow on the ground. Dramatic architecture. "
        "Scandinavian-Japanese fusion design. Architectural photography."
    ),
    "village_night": (
        "A cluster of modern tiny cabins at night in a Hokkaido forest. "
        "Warm light glowing from windows. String lights connecting the cabins along wooden paths. "
        "A central bonfire with people sitting around it. Stars visible above. "
        "Cozy, magical atmosphere. Dark charred wood exteriors. "
        "Long exposure photography style. Magazine quality."
    ),
}

for name, prompt in prompts.items():
    print(f"Generating {name}...")
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                ext = part.inline_data.mime_type.split("/")[-1]
                with open(f"{OUT}/{name}.{ext}", "wb") as f:
                    f.write(part.inline_data.data)
                print(f"  Saved: {OUT}/{name}.{ext}")
                break
        else:
            print(f"  No image for {name}")
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(2)

print("Done!")
