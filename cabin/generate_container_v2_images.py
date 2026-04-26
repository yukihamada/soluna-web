#!/usr/bin/env python3
"""Generate premium container house images v2 for SOLUNA OFF-GRID CABIN."""
import os, time
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
                os.system(f'cwebp -q 85 "{jpg}" -o "{webp}" -quiet')
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
    ("container_premium_exterior",
     "Photorealistic architectural photo of a stunning premium black steel shipping container home "
     "on a snowy Hokkaido hilltop at golden hour. "
     "Two 40ft containers stacked and offset creating an L-shaped luxury home. "
     "Full-height floor-to-ceiling glass walls on the south face, warm amber light glowing inside. "
     "A large wooden rooftop terrace deck on top of the lower container with outdoor furniture and a fire pit. "
     "Snow-covered ground, birch forest, dramatic wide open sky, mountains in far background. "
     "Matte black Corten steel exterior, cedar wood cladding accents. "
     "A Tesla Model Y parked beside. "
     "Cinematic wide angle, architectural magazine quality, warm vs cool contrast. Award winning."
    ),
    ("container_rooftop_deck",
     "Photorealistic photo of a luxury rooftop deck on top of a black shipping container home in Hokkaido. "
     "Stunning 360 degree panoramic view of vast Hokkaido wilderness — rolling hills, birch forests, distant mountains. "
     "A couple sitting on designer outdoor furniture (Kettal style) with wine glasses at sunset. "
     "Warm composite decking, outdoor gas heater glowing orange, string lights along the perimeter. "
     "Hot tub in corner of the deck, steam rising. Cedar privacy screens on edges. "
     "Dramatic orange and purple sunset sky. The container edges visible below giving an industrial luxury feel. "
     "Editorial lifestyle photography, Canon R5 quality."
    ),
    ("container_interior_luxury",
     "Photorealistic interior photo of an ultra-premium shipping container home interior in Hokkaido. "
     "Open plan living space: exposed raw steel ceiling and beams, wide plank white oak floor, "
     "white lime plaster walls contrasting with industrial elements. "
     "Full height glass sliding door opens to snowy birch forest — inside warm, outside winter cold. "
     "A custom built-in kitchen with marble counter and matte black fixtures, hidden under-counter lighting. "
     "A Jotul wood burning stove in the corner with glass door, fire burning orange. "
     "Mid-century modern furniture: leather Eames lounge chair, low Muji-style sofa. "
     "Concrete accent wall. Pendant lights. Books on built-in shelf. "
     "Architectural Digest quality, warm film grain, shot on Leica."
    ),
    ("container_night_stars",
     "Photorealistic long exposure night photo of a premium black container house on Hokkaido hilltop. "
     "Milky Way galaxy arching dramatically overhead in crystal clear dark sky. "
     "Warm amber light flooding out of floor-to-ceiling glass walls onto snow. "
     "A silhouette of one person standing on the rooftop deck looking at the stars, backlit. "
     "The Milky Way core clearly visible, thousands of stars sharp. "
     "Snow on ground reflects the warm house light. "
     "Forest silhouettes in background. "
     "Ultra long exposure astrophotography, 20 seconds, wide angle 14mm, f/1.8, award winning."
    ),
    ("container_twin_aerial",
     "Photorealistic aerial drone photo looking down at two premium black container houses "
     "arranged in a V-shape on a snow-covered Hokkaido hilltop. "
     "Between them: a shared outdoor wooden deck with a barrel sauna, fire pit, and cedar hot tub. "
     "Each container has a full glass south wall glowing warm. "
     "Wide open Hokkaido wilderness all around — birch forests, rolling snow fields, mountains. "
     "One Tesla Model Y on a gravel path. "
     "Morning light from the east casting long shadows on snow. "
     "DJI Mavic 3 Pro aerial photography style, golden hour, cinematic teal and orange color grade."
    ),
]

success = 0
for name, prompt in images:
    ok = generate(name, prompt)
    if ok:
        success += 1
    time.sleep(3)

print(f"\nDone: {success}/{len(images)} images generated")
