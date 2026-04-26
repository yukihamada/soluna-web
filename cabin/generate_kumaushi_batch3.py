#!/usr/bin/env python3
"""Batch 3 — 16 new shots for 天空の道場 熊牛 · scenes not yet covered"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = (
    "Cinematic film photograph, Kodak Portra 800 color grading. "
    "Deep crushed blacks, warm amber-gold highlights, desaturated cool blue shadows. "
    "Fine analog film grain. Sacred, silent, extreme atmosphere. "
    "Wide angle lens 16-24mm. Shot in Hokkaido Japan. "
    "Feels like a still from a feature film. No text, no logos. "
    "National Geographic / Wallpaper magazine editorial quality. "
)

SHOTS = [
    ("kumaushi_c_dawn_breakfast",
     "Sparse minimalist Japanese breakfast table at dawn inside a dome — miso soup, rice, pickles in simple ceramic bowls. "
     "Soft morning light through panoramic glass. Mount Akan visible through window. Silence."),

    ("kumaushi_c_bjj_groundwork",
     "Two people in white gi doing Brazilian jiu-jitsu groundwork on tatami mats inside a dome building. "
     "Late afternoon golden light streams through large glass panels. Focused, silent, intense."),

    ("kumaushi_c_snow_dome_night",
     "Two white EPS dome buildings under deep winter night sky in Hokkaido wilderness. "
     "Warm amber glow from small windows. Snowdrifts around base. Milky Way visible above."),

    ("kumaushi_c_horses_meadow",
     "Wild Hokkaido horses grazing in vast grassland with distant mountain silhouette at golden hour. "
     "Fence line leads to horizon. Amber light. Sense of infinite freedom."),

    ("kumaushi_c_sauna_exterior_snow",
     "Barrel sauna in deep winter snow, door slightly open with steam escaping. "
     "Pine forest backdrop. Pre-dawn blue hour light. Solitary, powerful, silent."),

    ("kumaushi_c_waterfall_stream",
     "Mountain stream rushing over mossy rocks in Hokkaido forest, dappled summer light. "
     "Crystal clear water, lush green ferns. Person crouching at water's edge."),

    ("kumaushi_c_dome_cherry_spring",
     "EPS dome building in spring with wild flowers and distant Hokkaido mountains. "
     "Clear blue sky, green grass, a single cherry tree blooming nearby. Peaceful."),

    ("kumaushi_c_meditation_mat",
     "Solo figure in meditation seated on rolled BJJ mat on rooftop at sunrise. "
     "Panoramic Hokkaido wilderness. Golden light. Absolute stillness."),

    ("kumaushi_c_wood_stove_close",
     "Close-up of cast iron wood stove with fire visible through glass door inside dome interior. "
     "Warm orange flames, subtle shadows, dark wood walls, white plaster ceiling."),

    ("kumaushi_c_ice_formation",
     "Natural ice bath tub with thick ice formation, surrounded by snow and pine trees. "
     "Blue-grey morning light. Steam rising. Extreme cold. Nordic atmosphere."),

    ("kumaushi_c_tea_tools_close",
     "Extreme close-up of traditional Japanese tea ceremony tools — chasen whisk, chawan bowl, matcha powder. "
     "Tatami mat surface. Window light. Silence. Ceremony of presence."),

    ("kumaushi_c_fireflies_night",
     "Fireflies glowing in dark Hokkaido meadow at night near dome building. "
     "Hundreds of soft yellow-green lights floating in darkness. Magical, otherworldly."),

    ("kumaushi_c_dome_interior_winter",
     "Interior of dome building in winter — tatami mats, wood stove fire, frost on windows. "
     "Two people reading, candlelight, snow visible outside. Cozy, primordial warmth."),

    ("kumaushi_c_hokkaido_sunset_wide",
     "Epic wide panoramic sunset over Hokkaido wilderness — blazing orange and purple sky. "
     "Rolling hills, no buildings, solitary tree silhouette, EPS dome tiny on horizon."),

    ("kumaushi_c_belt_ceremony",
     "BJJ belt promotion ceremony on tatami inside dome — instructor holding belt up, student bowing. "
     "Golden afternoon light. Serious, emotional, sacred moment."),

    ("kumaushi_c_rooftop_yoga",
     "Solo figure doing yoga warrior pose on rooftop with 270 degree Hokkaido panorama view. "
     "Dawn light, mountain silhouettes, minimal architecture. Freedom and strength."),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_webp):
        print(f"  skip {name} (exists)")
        return True
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL,
                contents=STYLE + prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"])
            )
            for p in r.candidates[0].content.parts:
                if p.inline_data and p.inline_data.data:
                    with open(out_jpg, "wb") as f:
                        f.write(p.inline_data.data)
                    subprocess.run(["cwebp", "-q", "90", out_jpg, "-o", out_webp], check=True, capture_output=True)
                    os.remove(out_jpg)
                    print(f"  ✓ saved {name}.webp")
                    return True
            print(f"  no image in response, retry {attempt+1}")
        except Exception as e:
            print(f"  error attempt {attempt+1}: {e}")
            time.sleep(5)
    return False

if __name__ == "__main__":
    ok = fail = 0
    for name, prompt in SHOTS:
        if gen(name, prompt):
            ok += 1
        else:
            fail += 1
        time.sleep(3)
    print(f"\ndone: {ok} ok, {fail} fail")
