#!/usr/bin/env python3
"""Generate photos for kumaushi hybrid concept: Container + EPS Dome + Membrane"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = ("Cinematic film photograph, Kodak Portra 800 color grading. "
         "Deep crushed blacks, warm amber-gold highlights, desaturated cool blue shadows. "
         "Fine analog film grain. Feels like a still from a feature film. No text, no logos. "
         "National Geographic / Wallpaper magazine editorial quality. "
         "Location: remote hilltop in Hokkaido, Japan. 270-degree panorama. No power lines, no other buildings. ")

SHOTS = [
    # 全景・外観
    ("kumaushi_hybrid_aerial",
     "Aerial drone shot of a unique architectural compound on an open Hokkaido hilltop. "
     "Two dark-painted 20ft shipping containers placed parallel 6 meters apart, with a white "
     "EPS dome (6m diameter, stucco finish) sitting between them. A dramatic tensile membrane "
     "canopy stretches from the containers outward, supported by 4 steel posts, creating a large "
     "covered outdoor deck area. A barrel sauna and round wooden hot tub sit under the membrane. "
     "Solar panels and Tesla Powerwall visible. Gravel paths. Vast Hokkaido grassland stretching "
     "to distant mountains. Golden hour. " + STYLE),

    # ドーム内部 — 道場
    ("kumaushi_hybrid_dome_dojo",
     "Interior of a beautiful white stucco EPS dome, 6 meters diameter. Warm wood floor with "
     "tatami martial arts mats laid out. A cast iron wood stove burns in center with chimney "
     "going up through dome top. 4K projector casting ambient light on curved dome ceiling. "
     "One round window showing Hokkaido grassland outside. Minimal, meditative. A person in "
     "white gi sitting in meditation. Warm amber firelight. " + STYLE),

    # コンテナ寝室
    ("kumaushi_hybrid_container_bedroom",
     "Interior of a converted 20ft shipping container bedroom. Industrial-chic: exposed corrugated "
     "steel ceiling painted matte black, warm wood paneling on walls. Low platform bed with white "
     "linen and wool blanket. Full-width window at end showing panoramic Hokkaido mountain view. "
     "Philips Hue warm light. Minimal nightstand. Incredibly cozy despite industrial shell. " + STYLE),

    # 膜屋根下のデッキ — サウナエリア
    ("kumaushi_hybrid_membrane_deck",
     "Large covered outdoor deck under a dramatic white tensile membrane canopy supported by "
     "4 angled steel posts. Under it: a Finnish barrel sauna (cedar, with small chimney), a round "
     "Japanese hinoki hot tub with steam rising, and an ice bath. Wooden deck floor. The membrane "
     "is translucent, diffusing daylight. 270-degree panoramic view of Hokkaido grassland visible "
     "on all sides beneath the membrane edge. Late afternoon golden light. " + STYLE),

    # 夜景 — ライトアップ
    ("kumaushi_hybrid_night",
     "The container+dome+membrane compound at night on the Hokkaido hilltop. Containers glow warm "
     "amber from windows. EPS dome has soft light from within, creating a glowing orb. The membrane "
     "canopy is lit from below with warm uplights. A campfire burns on the open deck. Stars fill "
     "the sky — Milky Way visible. Two people silhouetted by the fire. Perfectly remote. " + STYLE),

    # コンテナ水回り・キッチン
    ("kumaushi_hybrid_container_kitchen",
     "Interior of a converted 20ft shipping container kitchen/bathroom unit. Compact but beautiful: "
     "concrete countertop, black matte fixtures, open shelving with ceramics, mini fridge. One side "
     "has a walk-in rain shower with wooden slat floor and a porthole window. Everything built into "
     "the container structure. Warm Hue lighting. A cup of coffee on the counter. Morning light "
     "from the end window showing misty Hokkaido landscape. " + STYLE),

    # クレーン設置シーン
    ("kumaushi_hybrid_crane_install",
     "A large mobile crane lifting a dark-painted 20ft shipping container onto concrete block "
     "foundations on an open Hokkaido hilltop. Second container already placed. Construction workers "
     "in helmets guiding. EPS dome panels stacked nearby ready for assembly. Dramatic clouds. "
     "Vast empty grassland in background. The moment of creation. Documentary style. " + STYLE),

    # 冬景色
    ("kumaushi_hybrid_winter",
     "The container+dome+membrane compound in deep Hokkaido winter snow. Containers half-buried "
     "in snow, warm light from windows. EPS dome glowing like a snow lantern. Membrane canopy "
     "holding a layer of snow. Barrel sauna chimney smoking. A person in the hot tub surrounded "
     "by snow, steam rising dramatically. Blue hour twilight. Mountains white in distance. " + STYLE),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_webp):
        print(f"  skip {name}")
        return True
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for p in r.candidates[0].content.parts:
                if p.inline_data and p.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(p.inline_data.data)
                    subprocess.run(["cwebp","-q","90",out_jpg,"-o",out_webp],check=True,capture_output=True)
                    os.remove(out_jpg)
                    print(f"  ✓ {name}.webp")
                    return True
            print(f"  no image, retry {attempt+1}")
        except Exception as e:
            print(f"  error: {e}")
            time.sleep(5)
    return False

ok = fail = 0
for name, prompt in SHOTS:
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(3)
print(f"\ndone: {ok} ok, {fail} fail")
