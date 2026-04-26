#!/usr/bin/env python3
"""Generate high-tech dome instant house images for SOLUNA OFF-GRID CABIN page."""
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
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"]
            )
        )
        for part in resp.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                # data is raw bytes, write to JPEG then convert to webp
                jpg_path = f"{OUT}/{name}.jpg"
                webp_path = f"{OUT}/{name}.webp"
                with open(jpg_path, "wb") as f:
                    f.write(part.inline_data.data)
                # convert to webp
                os.system(f'cwebp -q 84 "{jpg_path}" -o "{webp_path}" -quiet')
                os.remove(jpg_path)
                size = os.path.getsize(webp_path) // 1024
                print(f"  ✓ saved {webp_path} ({size}KB)")
                return True
        print(f"  ✗ no image in response")
        return False
    except Exception as e:
        print(f"  ✗ error: {e}")
        return False

images = [
    ("dome_exterior_winter",
     "Photorealistic photo of a white igloo-shaped dome house (EPS polystyrene dome, 6 meters diameter) "
     "in a snowy Hokkaido Japan birch forest clearing. Tesla Model Y white SUV parked beside it. "
     "Small ground-mounted solar panels to the right. Starlink satellite dish on a pole. "
     "Warm orange glow from the circular windows. Snowfall, twilight sky, dramatic blue-purple clouds. "
     "Cinematic wide angle photo, magazine quality, architectural photography."
    ),
    ("dome_interior_projector",
     "Photorealistic interior photo of a 6-meter dome house at night. White curved EPS walls with warm texture. "
     "A 4K projector mounted on a tripod projecting a stunning mountain lake landscape image onto the curved dome ceiling. "
     "The entire ceiling glows with the projection. "
     "Cozy queen bed with forest green duvet cover. Two rattan chairs. A small olive-colored portable oil heater glowing orange. "
     "Wooden shelf with a vintage camp lantern and Bluetooth speaker. "
     "Soft smart LED lighting strips around the base of the dome walls (warm amber 2700K). "
     "Plant in the corner. Wooden floor. Blinds on circular windows. Very cozy, atmospheric, luxury glamping vibes. "
     "Shot with wide angle lens, editorial interior photography."
    ),
    ("dome_smart_control",
     "Clean tech illustration: a glowing smartphone screen showing a smart home dashboard app (KAGI app). "
     "The dashboard has cards showing: battery level 87% (Tesla V2H icon), solar generation 2.3kW (sun icon), "
     "room temperature 22°C, door locked (lock icon), lights OFF. "
     "The phone floats against a dark background with a blurred cozy cabin interior visible behind. "
     "Dark UI design with gold/amber accent colors. Japanese UI labels. "
     "Premium app design, editorial product photography style."
    ),
    ("dome_v2h_tesla",
     "Photorealistic photo of a Tesla Model Y white SUV connected to a Nichicon V2H power station unit "
     "mounted on the exterior wall of a white dome house. CHAdeMO cable connecting car to unit. "
     "Small array of 3 solar panels on ground mounts nearby. "
     "Snow on the ground, birch trees in background. Blue sky. "
     "The unit shows green LED lights indicating active power flow. "
     "Clean architectural/tech photography style, product + architecture mashup."
    ),
    ("dome_summer_deck",
     "Photorealistic photo of a white igloo EPS dome house in lush summer Hokkaido landscape. "
     "Green birch forest all around, wildflowers in foreground. A small wooden deck attached to the dome entrance. "
     "Two camp chairs on the deck, a small fire pit. Tesla Model Y parked on gravel to the side. "
     "Starlink dish on pole. Solar panels glinting in sun. "
     "Crystal clear blue sky, warm golden hour light. Peaceful, remote, off-grid luxury. "
     "Wide angle, cinematic, architectural photography."
    ),
    ("dome_cost_diagram",
     "Clean modern infographic diagram on a very dark (#030303) background. "
     "Title in white: 'コスト比較' (cost comparison). "
     "Two columns side by side with horizontal bar charts: "
     "Left column 'コンテナ輸入' (red/orange): 構造体¥315万, 輸送¥55万, クレーン¥40万, 断熱¥38万 — total bar very long. "
     "Right column '国産ドーム' (gold/amber): 構造体¥100万, 輸送¥0, 設置¥8万, 断熱¥10万 — total bar much shorter. "
     "Savings badge: ¥346万削減 in gold. "
     "Minimalist Japanese design, premium financial infographic style. Gold accent color #c8a455."
    ),
]

success = 0
for name, prompt in images:
    ok = generate(name, prompt)
    if ok:
        success += 1
    time.sleep(2)

print(f"\nDone: {success}/{len(images)} images generated")
