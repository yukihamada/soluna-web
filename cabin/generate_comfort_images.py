#!/usr/bin/env python3
"""Generate comfort & luxury add-on images for SOLUNA OFF-GRID CABIN."""
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
    ("comfort_barrel_sauna",
     "Photorealistic photo of a beautiful cedar barrel sauna in a snowy Hokkaido forest clearing. "
     "The barrel sauna glows warm orange from inside, smoke rising from chimney. "
     "White EPS dome house visible in background 10 meters away. "
     "Snow on ground, birch trees, twilight blue sky. "
     "A wooden changing bench outside the sauna. "
     "Steam rising from a small outdoor shower nearby. "
     "Cinematic wide angle, golden hour light mixing with blue twilight. Magazine quality."
    ),
    ("comfort_hot_tub",
     "Photorealistic photo of a round cedar wood-fired outdoor hot tub (dutchtub style) on a wooden deck "
     "under a crystal clear Hokkaido night sky. Milky Way galaxy visible overhead. "
     "Steam rising from the hot water. One person relaxing with eyes closed. "
     "Candles on the deck edge. White dome house glowing warmly 15 meters away. "
     "Snow all around, birch trees. A small copper firebox heats the tub. "
     "Long exposure photography style, stars sharp and bright, warm tub glow. Cinematic, editorial."
    ),
    ("comfort_rocket_stove",
     "Photorealistic interior photo of a rocket mass heater inside a modern off-grid cabin. "
     "Beautiful hand-built clay and cob rocket mass heater with a long thermal bench seat running along the wall. "
     "The bench is made of clay and natural stone, people can sit on the warm surface. "
     "Orange fire visible in the small combustion chamber. "
     "White shikkui plaster walls, larch wood floor. Very cozy, cave-like warmth. "
     "Minimal design, architectural photography quality."
    ),
    ("comfort_greenhouse",
     "Photorealistic photo of a small modern glass greenhouse (3m x 4m) attached directly to a white EPS dome house. "
     "Through the glass walls: lush green herbs, tomatoes, leafy greens growing in winter. "
     "Outside: heavy Hokkaido snowfall, birch trees. "
     "Warm green glow from LED grow lights inside the greenhouse. "
     "Wooden shelves with terracotta pots. A small bench for sitting among plants. "
     "Wide angle, dawn light, architectural photography. Cozy contrast of green and snow."
    ),
    ("comfort_pizza_oven",
     "Photorealistic photo of a beautiful stone wood-fired pizza oven built on a wooden deck outside a dome house. "
     "Fire burning inside, pizza visible through the opening. "
     "Hokkaido summer evening, golden hour light, birch forest behind. "
     "Rustic stone and clay construction, chimney. A wooden prep table beside it with flour, basil, wine. "
     "Tesla Model Y parked in background. Friends gathered around in warm light. "
     "Editorial food + architecture photography style."
    ),
    ("comfort_stargazing",
     "Photorealistic long exposure photo of a person standing on a wooden observation deck at night, "
     "looking through a large telescope at the Milky Way galaxy. "
     "Crystal clear Hokkaido sky, galaxy band clearly visible, thousands of stars. "
     "White EPS dome house glowing orange warmly 20 meters away. "
     "Snow on ground. The person wears a down jacket. A small red headlamp. "
     "Ultra long exposure, stars sharp, ground slightly blurred. Magical, ethereal. "
     "Award-winning astrophotography style."
    ),
    ("comfort_ice_bath",
     "Photorealistic photo of a wooden barrel ice bath / cold plunge tub on a snowy outdoor deck in Hokkaido winter. "
     "Crystal clear freezing cold water, ice crystals forming on the rim. "
     "A cedar barrel sauna visible in background with steam and warm glow. "
     "Snow covered birch trees. Blue winter sky. "
     "Clean Nordic wellness aesthetic. Premium spa photography style."
    ),
    ("comfort_ebike",
     "Photorealistic action photo of a person riding an electric dirt bike (KTM Freeride E-XC style) "
     "through a wide open Hokkaido wilderness meadow in summer. "
     "Golden hour, long grass, wildflowers, birch forest edge, blue sky with clouds. "
     "White dome house visible in far background. The rider wears adventure gear. "
     "Motion blur on wheels, sharp rider. Dynamic, cinematic wide angle. "
     "Adventure photography magazine quality."
    ),
    ("comfort_underground_cellar",
     "Photorealistic photo of a beautiful underground root cellar / food storage pit interior in Hokkaido. "
     "Stone and earthen walls, wooden shelves lined with jars of preserved vegetables, pickles, wine bottles, "
     "root vegetables (potatoes, carrots, onions), aged cheeses wrapped in cloth. "
     "A single Edison bulb hanging from the ceiling casting warm amber light. "
     "Temperature gauge showing 4°C. Wooden ladder descending from above. "
     "Rustic, artisanal, Japanese countryside aesthetic. Editorial food photography."
    ),
]

success = 0
for name, prompt in images:
    ok = generate(name, prompt)
    if ok:
        success += 1
    time.sleep(2)

print(f"\nDone: {success}/{len(images)} images generated")
