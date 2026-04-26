#!/usr/bin/env python3
"""Generate extraordinary photos for 天空の道場 熊牛 — Kumaushi Sky Dojo pages."""
import os, base64, time
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
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"]
            )
        )
        for part in resp.candidates[0].content.parts:
            if part.inline_data and part.inline_data.data:
                jpg_path = f"{OUT}/{name}.jpg"
                webp_path = f"{OUT}/{name}.webp"
                with open(jpg_path, "wb") as f:
                    f.write(part.inline_data.data)
                os.system(f'cwebp -q 88 "{jpg_path}" -o "{webp_path}" -quiet')
                os.remove(jpg_path)
                size = os.path.getsize(webp_path) // 1024
                print(f"  ✓ {webp_path} ({size}KB)")
                return True
        print(f"  ✗ no image")
        return False
    except Exception as e:
        print(f"  ✗ {e}")
        return False

images = [
    ("kumaushi_aerial_dawn",
     "Epic aerial drone photograph at golden hour dawn over a dramatic Hokkaido highland landscape. "
     "A single geodesic dome structure (6 meters, pure white polystyrene) sits on a forested hilltop "
     "emerging from a sea of morning mist that fills the valleys below. "
     "The dome glows with warm amber interior light visible through its porthole windows. "
     "Vast Hokkaido plains stretch to the horizon, the caldera lake of Mashu barely visible in the distance. "
     "The sun rises in brilliant orange-gold, casting long shadows across the frost-covered grassland. "
     "Breathtaking, cinematic, National Geographic quality, f/11, ultra sharp, epic scale."
    ),

    ("kumaushi_dojo_tatami",
     "Photorealistic interior photograph of a stunning circular jiu-jitsu dojo inside a 6-meter geodesic dome. "
     "The entire floor is covered in premium Japanese tatami mats arranged in a perfect circle. "
     "Morning sunlight streams through circular porthole windows creating dramatic light beams through dust motes. "
     "The curved white dome walls are clean and minimalist. "
     "One person in a white gi (jiu-jitsu uniform) sits in seiza meditation facing the light. "
     "A minimalist wooden torii-gate style frame marks the entrance. "
     "Hanging from the apex of the dome: a single antique-style paper lantern. "
     "The light is ethereal, sacred, cinematic. Shot with 16mm wide angle, editorial quality."
    ),

    ("kumaushi_forest_approach",
     "Cinematic photograph of a narrow dirt path winding through ancient Hokkaido birch and fir forest. "
     "Early morning blue hour light, ground mist drifting at knee height. "
     "The trees are massive, their silver-white trunks glowing. "
     "The path curves upward toward a hilltop where a faint golden light is barely visible — a distant dome structure. "
     "Shot from ground level looking up the path, extreme depth of field. "
     "The forest is completely silent, sacred, primordial. "
     "A single wooden handmade sign at the path entrance reads '道場' in brushstroke kanji. "
     "Moody, mysterious, awakening. Cinema quality, anamorphic lens flare."
    ),

    ("kumaushi_training_sunset",
     "Dramatic wide angle photograph of two jiu-jitsu practitioners (one in white gi, one in black gi) "
     "sparring outdoors on a raised wooden deck platform on a Hokkaido hilltop. "
     "The sun is setting in extraordinary vivid orange-purple-crimson behind the distant volcanic mountain silhouette "
     "(Mount Akan or Meakan). "
     "The two figures are captured mid-movement, one executing a beautiful hip escape, the other posting. "
     "Sweeping 360-degree panoramic view of the highland plateau visible below. "
     "The scene has the quality of a sacred ritual. Shot looking into the sunset. "
     "Photo is cinematic, magazine cover quality, golden ratio composition."
    ),

    ("kumaushi_winter_stars",
     "Long-exposure night photography of a geodesic dome house on a snowy Hokkaido hilltop under an impossibly "
     "brilliant Milky Way galaxy. "
     "The dome's circular windows glow warm amber-orange from within. "
     "The entire sky is filled with thousands of stars — the Milky Way core rises directly above the dome. "
     "Fresh snow covers the ground, reflecting the starlight in blue-white hues. "
     "The birch trees at the edges of the clearing are frosted white. "
     "No other light pollution. Sacred silence. "
     "30-second exposure, f/2.8, ISO 3200, astrophotography quality. "
     "The most beautiful night sky photo imaginable."
    ),

    ("kumaushi_spring_panorama",
     "Ultra-wide panoramic photograph from a hilltop in Teshikaga, Hokkaido, looking south-east toward the "
     "Akan volcanic mountain range in spring. "
     "In the foreground: the curved roof of a white geodesic dome jiu-jitsu dojo structure. "
     "The highland pasture shows remnant snow patches in late April. "
     "Meakan-dake volcano (1,499m) and its perfect cone shape is visible on the left horizon, "
     "Oakan-dake (1,370m) on the right. "
     "The sky is dramatic: deep blue with towering cumulus clouds. "
     "A lone Japanese white crane (tancho) flies across the foreground. "
     "Epic, aspirational, world-class landscape photography. Shot at 24mm, f/8, HDR."
    ),

    ("kumaushi_fire_circle",
     "Atmospheric night photograph of six jiu-jitsu practitioners sitting in a perfect circle "
     "around a large outdoor fire pit on a Hokkaido hilltop under the stars. "
     "Each person sits in seiza or cross-legged on wooden meditation stools. "
     "They all wear gi (jiu-jitsu uniforms) but have removed their belts — equals around the fire. "
     "Their faces are illuminated by the firelight — deep in thought, post-training, tribe. "
     "The fire burns intensely in the center. Sparks drift upward into the star-filled sky. "
     "The dome structure is barely visible in the darkness behind them. "
     "Sacred, ritualistic, ancient. Shot at f/1.8, ISO 6400. Cinematic grain."
    ),

    ("kumaushi_dojo_moonlight",
     "Extraordinary night photograph of the interior of a circular jiu-jitsu dojo at midnight. "
     "Moonlight streams through the skylight porthole at the apex of the dome ceiling, "
     "casting a perfect circle of silver-blue light on the tatami mat floor. "
     "The rest of the interior is in deep shadow — just the moonlit circle on the tatami. "
     "One gi (judogi/bjj gi) hangs on a wooden peg on the curved wall — the only object in the room. "
     "The composition is pure, architectural, meditative. "
     "Shot with ultra-wide 12mm lens. Fine art photography quality. "
     "The image looks like a Zen painting come to life."
    ),
]

for name, prompt in images:
    success = generate(name, prompt)
    if not success:
        time.sleep(3)
        print(f"  retrying {name}...")
        generate(name, prompt)
    time.sleep(2)

print("\nDone. Upload with:")
print("  fly deploy --remote-only -a soluna-teshikaga")
