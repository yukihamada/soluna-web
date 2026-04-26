#!/usr/bin/env python3
"""Generate additional extraordinary photos for 天空の道場 熊牛."""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
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
                os.system(f'cwebp -q 88 "{jpg}" -o "{webp}" -quiet')
                os.remove(jpg)
                print(f"  ✓ {webp} ({os.path.getsize(webp)//1024}KB)")
                return True
        print("  ✗ no image")
        return False
    except Exception as e:
        print(f"  ✗ {e}")
        return False

images = [
    # 1. 畳道場 × パノラマガラス壁 — 「ここでしか見られない稽古」
    ("kumaushi_dojo_panorama_glass",
     "Photorealistic architectural photograph of the interior of a circular geodesic dome jiu-jitsu dojo. "
     "One entire curved wall section has been replaced with floor-to-ceiling curved glass, "
     "revealing a breathtaking 270-degree panoramic view of Hokkaido volcanic mountains (Akan-dake) "
     "and highland plains stretching to the horizon. "
     "The tatami mat floor reflects the golden morning light coming through the glass. "
     "Two practitioners in white gi are training — one performing a guard pass against the silhouette of the mountains. "
     "The image feels sacred and impossible — a sacred martial arts space merged with nature. "
     "Cinematic, editorial, impossible beauty. Shot with 14mm ultra-wide lens."
    ),

    # 2. 夜明け前の白衣 — 一枚の白帯が霧の中に浮かぶ
    ("kumaushi_white_gi_mist",
     "Fine art photograph: a single white jiu-jitsu gi (uniform) hanging on a simple wooden peg "
     "on the exterior wall of a geodesic dome, at 4am pre-dawn in Hokkaido. "
     "Dense white morning mist surrounds everything. "
     "The gi glows faintly white in the darkness, backlit by a single amber light from inside the dome. "
     "The forest edge is barely visible. Complete silence and stillness. "
     "Minimalist, zen, deeply moving. Shot at f/2.0, 10-second exposure."
    ),

    # 3. 建設中の道場 — 構築の過程が伝説を作る
    ("kumaushi_construction_dawn",
     "Photorealistic photograph of a white geodesic EPS dome being constructed on a Hokkaido hilltop at dawn. "
     "Four workers in construction gear are assembling the dome panels. "
     "The frame is half-complete, skeleton visible against a dramatic dawn sky with pink and gold clouds. "
     "Frost on the grass. A single red tractor in the background. "
     "Tools and dome panels are spread across the hilltop. "
     "This image conveys the raw ambition of building something new from nothing. "
     "Documentary photography style, cinematic grain, Magnum Photos quality."
    ),

    # 4. 矢倉（やぐら）展望台 — 森から出る塔
    ("kumaushi_yagura_tower",
     "Dramatic wide-angle photograph of a handmade traditional Japanese wooden watchtower (yagura) "
     "rising above the birch and fir forest canopy on a Hokkaido hilltop. "
     "The tower is 12 meters tall, built from raw timber in the style of ancient Japanese signal towers. "
     "A single person stands at the top railing, silhouetted against a brilliant orange sunset. "
     "The volcanic mountain range (Akan-Mashu) is visible on the horizon. "
     "The tower looks like it grew organically from the forest. "
     "Shot from below looking up, dramatic perspective, cinematic color grade."
    ),

    # 5. 冬の稽古 — 雪の中、外で組む
    ("kumaushi_winter_outdoor_roll",
     "Epic action photograph of two jiu-jitsu practitioners rolling (sparring) on a cleared snow surface "
     "on a Hokkaido hilltop in deep winter. "
     "They wear white gi on top of snow, creating a striking visual contrast. "
     "Snow is flying around them from the movement. "
     "Temperature is −15℃ — their breath is visible as steam clouds. "
     "The dome structure is behind them, warm amber light from its windows. "
     "Mount Akan covered in snow is visible in the distant background. "
     "Shot at 1/1000s shutter speed, peak action frozen. "
     "The image feels primal, extreme, legendary. Sports Illustrated quality."
    ),

    # 6. 内部 — 天井からの眺め（神の視点）
    ("kumaushi_dojo_aerial_interior",
     "Breathtaking overhead bird's-eye view photograph looking straight down into the interior of a circular dome dojo "
     "from the apex of the dome ceiling. "
     "The entire circular floor is tatami mat. "
     "Eight jiu-jitsu practitioners are arranged in a perfect mandala pattern — "
     "four pairs sparring simultaneously, each pair oriented in a different direction. "
     "From above they form a beautiful geometric pattern on the golden-brown tatami. "
     "The dome walls curve upward to the camera. "
     "A single skylight at the apex lets in a shaft of light. "
     "The image looks like sacred architecture and martial art merged into one. "
     "Architecture + sports photography, National Geographic quality."
    ),
]

for name, prompt in images:
    success = generate(name, prompt)
    if not success:
        time.sleep(4)
        generate(name, prompt)
    time.sleep(2)

print("\nDone.")
