#!/usr/bin/env python3
import os, base64, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

def generate(name, prompt):
    print(f"Generating {name}...")
    try:
        resp = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"])
        )
        for part in resp.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                jpg = f"{OUT}/{name}.jpg"
                webp = f"{OUT}/{name}.webp"
                with open(jpg, "wb") as f:
                    f.write(part.inline_data.data)
                os.system(f'cwebp -q 84 "{jpg}" -o "{webp}" -quiet')
                os.remove(jpg)
                size = os.path.getsize(webp) // 1024
                print(f"  ✓ {webp} ({size}KB)")
                return True
        print("  ✗ no image")
        return False
    except Exception as e:
        print(f"  ✗ {e}")
        return False

images = [
    ("container_exterior_winter",
     "Photorealistic architectural photo of a modern 40-foot expandable container house in Hokkaido Japan winter. "
     "Dark charcoal steel exterior with industrial aesthetic. The container is fully expanded showing wide living space. "
     "Large floor-to-ceiling windows with warm interior glow. Flat roof with solar panels. "
     "Tesla Model Y white SUV parked beside it. Snow on the ground, birch trees behind. "
     "Starlink dish visible on roof. Industrial-luxury aesthetic. Dusk lighting, dramatic sky. "
     "Wide angle, cinematic, architectural photography magazine quality."
    ),
    ("container_interior",
     "Photorealistic interior photo of a modern 40-foot expandable container house, 37 square meters. "
     "Industrial-chic interior with exposed steel frame painted matte black. "
     "White shikkui plaster walls contrasting with the steel structure. "
     "Larch wood plank flooring (warm honey color). Cast iron wood-burning stove in corner with black chimney. "
     "Large panoramic window showing snowy Hokkaido forest. "
     "Minimal Scandinavian-Japanese furniture. Warm LED lighting. "
     "Smart speaker and Philips Hue bulbs visible. Very cozy, editorial interior photography."
    ),
    ("container_summer",
     "Photorealistic photo of a modern expandable container house in lush Hokkaido summer. "
     "Charcoal steel container with wooden deck extending from the expanded side. "
     "Two architect chairs and a fire pit on deck. Tesla Model Y in background. "
     "Solar panels on flat roof. Birch forest, wildflowers, blue sky. "
     "Wide angle, golden hour, cinematic quality."
    ),
]

for name, prompt in images:
    generate(name, prompt)
    time.sleep(2)

print("Done")
