#!/usr/bin/env python3
"""Generate more container house images v3 for SOLUNA OFF-GRID CABIN."""
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
    ("container_bathroom",
     "Photorealistic interior photo of a luxury bathroom inside a shipping container home in Hokkaido. "
     "Exposed black steel walls contrasting with white marble tiles. "
     "A deep soaking bathtub (Japanese ofuro style) with a view window looking out to snowy birch forest. "
     "Concrete floor with underfloor heating. Matte black fixtures. "
     "Steam rising from hot water. Cedar wood elements on walls. "
     "A single candle burning on the tub edge. Warm amber light from recessed ceiling. "
     "Architectural photography, Leica quality, intimate and luxurious."
    ),
    ("container_bedroom",
     "Photorealistic interior photo of a minimalist bedroom inside a black shipping container home. "
     "Low platform bed with white linen, facing full-height glass sliding door open to snowy Hokkaido forest. "
     "Snow visible outside, warm interior glow. Exposed steel ceiling beams painted matte black. "
     "White oak hardwood floor. A single pendant light above the bed. "
     "Muji-inspired simplicity meets industrial luxury. "
     "One person sleeping peacefully, morning light. "
     "Architectural Digest photography quality. 35mm lens."
    ),
    ("container_living_fire",
     "Photorealistic interior photo of a dramatic living room inside a shipping container home at night. "
     "A large Jotul cast iron wood burning stove glowing orange in the corner, fire visible through glass door. "
     "Full floor-to-ceiling glass wall on one side showing dark Hokkaido forest with snow. "
     "Warm amber and orange light from the fire fills the room. "
     "Exposed black steel beams overhead. White lime plaster walls. "
     "Low black leather sofa facing the fire. Stack of birch wood beside the stove. "
     "A glass of whiskey on a raw wood side table. "
     "Moody, cinematic, warm vs cold contrast. Shot on Sony A7R."
    ),
    ("container_deck_summer",
     "Photorealistic photo of a beautiful wooden deck attached to a black container home in Hokkaido summer. "
     "Lush green meadow, wildflowers, birch forest in background under blue sky with clouds. "
     "Two people in casual clothes sitting in designer teak outdoor chairs with cold drinks. "
     "A long wooden outdoor dining table set for 6. String lights hanging above the deck. "
     "Container's full glass wall open, merging interior and exterior seamlessly. "
     "Warm golden hour light. A dog lying on the deck. "
     "Lifestyle photography, editorial quality, relaxed summer atmosphere."
    ),
    ("container_kitchen",
     "Photorealistic interior photo of a premium kitchen inside a shipping container home. "
     "Long galley kitchen layout running the full 12 meter length of the container. "
     "Black matte kitchen cabinets with brass handles. White Carrara marble countertop. "
     "Professional-grade matte black cooking range with copper pot hanging above. "
     "One wall is exposed raw steel, painted charcoal. "
     "Floor-to-ceiling glass at the end showing Hokkaido mountain view. "
     "Fresh vegetables, bread, and wine on the counter. "
     "Kitchen & bath magazine photography quality."
    ),
    ("container_entrance",
     "Photorealistic photo of the entrance of a premium black container home at dusk in Hokkaido. "
     "A wide wooden pivoting front door (black steel frame with cedar infill panel) open with warm light spilling out. "
     "Snow on the ground, birch trees around, just after sunset - blue hour light. "
     "A stone stepping path leading to the door. Small landscape lighting along the path. "
     "The silhouette of the black Corten steel container home against the twilight sky. "
     "Architectural editorial photography. Moody, inviting, premium."
    ),
    ("container_workspace",
     "Photorealistic interior photo of a home office / workspace inside a shipping container home in Hokkaido. "
     "A wide custom built-in desk along the full glass wall overlooking snowy forest and mountain. "
     "Two monitors, MacBook Pro, minimal setup. "
     "Exposed black steel structure overhead. "
     "White oak shelving with books, plants, and small objects. "
     "Natural light flooding in from floor-to-ceiling window. Snow outside. "
     "The perfect remote work setup in the wilderness. "
     "Interior design photography, natural light, aspirational."
    ),
    ("container_sauna_connect",
     "Photorealistic photo of a premium barrel sauna connected to a black container home by a short cedar walkway. "
     "The sauna is cylindrical cedar, glowing warm orange inside, steam rising from chimney and door crack. "
     "The container home's glass wall visible in background, warm light inside. "
     "Snow all around. A cold plunge ice bath wooden barrel beside the sauna. "
     "A person wrapped in a white towel walking from the sauna toward the ice bath. "
     "Night scene, -15°C aesthetic, dramatic light and steam. "
     "Premium wellness photography, Nordic spa aesthetic."
    ),
]

success = 0
for name, prompt in images:
    ok = generate(name, prompt)
    if ok:
        success += 1
    time.sleep(3)

print(f"\nDone: {success}/{len(images)} images generated")
