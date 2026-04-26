#!/usr/bin/env python3
"""Generate rooftop BJJ mats photo for 天空の道場 熊牛"""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = (
    "Cinematic architectural photograph, Kodak Portra 800 film grading. "
    "Deep blacks, warm amber light, cool blue shadows. Fine grain. "
    "Sacred silence. Hokkaido Japan. No text, no graphics. "
    "Editorial quality, Wallpaper magazine / Dezeen level photography. "
)

def gen(name, prompt):
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL,
                contents=STYLE + prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"])
            )
            for p in r.candidates[0].content.parts:
                if p.inline_data and p.inline_data.data:
                    jpg = f"{OUT}/{name}.jpg"
                    webp = f"{OUT}/{name}.webp"
                    with open(jpg, "wb") as f:
                        f.write(p.inline_data.data)
                    os.system(f'cwebp -q 90 "{jpg}" -o "{webp}" -quiet')
                    os.remove(jpg)
                    print(f"  ✓ {os.path.getsize(webp)//1024}KB")
                    return True
            print(f"  ✗ no image (attempt {attempt+1})")
        except Exception as e:
            print(f"  ✗ {e} (attempt {attempt+1})")
        time.sleep(3)
    return False

shots = [
    # 屋上テラス — マット稽古 × 阿寒の山並み
    ("kumaushi_a_rooftop_mats",
     "Extraordinary photograph of a rooftop jiu-jitsu training area at dawn on a Hokkaido hilltop. "
     "The flat rooftop of a low concrete building is covered with interlocking martial arts mats — "
     "dark charcoal-grey foam puzzle mats, perfectly laid edge-to-edge, covering 40 square meters. "
     "Two practitioners in white gis are training on the mats — one executing a sweep technique, "
     "the other defending, both deeply focused. "
     "The rooftop edge is at the horizon — beyond it, Mount Akan and Mount Meakan rise in the distance, "
     "volcanic silhouettes backlit by the pre-dawn amber sky. "
     "Around the edges of the rooftop: native Hokkaido grasses and stonecrop sedum grow in low planters, "
     "giving the impression that the building is part of the hillside. "
     "A round wooden ofuro bath is visible in one corner, steam rising. "
     "The light is 5:30am: deep orange on the horizon, dark blue-purple overhead. "
     "The mats catch the warm dawn light — this is the most extraordinary training space on earth. "
     "Shot at f/4, 20mm ultra-wide. Total stillness except for the two fighters."
    ),
    # 屋上 — 誰もいない朝 (solo mat view)
    ("kumaushi_a_rooftop_mats_empty",
     "Minimalist photograph of an empty rooftop martial arts training space at first light in Hokkaido. "
     "Dark charcoal puzzle mats cover the entire flat rooftop — perfectly clean, no footprints yet. "
     "The camera is at mat level looking across the surface toward the horizon: "
     "Mount Akan is a dark massive silhouette against a glowing amber sunrise sky. "
     "The rooftop mat edge meets the infinite sky — no railing, just the edge and the mountain. "
     "A folded white gi lies at the corner of the mats. "
     "Native grasses at the rooftop edge catch the first light — golden and still. "
     "This image communicates: this is where the practice begins. Before anyone else wakes up. "
     "Shot at f/2.8, 16mm, ground level perspective. Long shadows from the rising sun."
    ),
]

for name, prompt in shots:
    success = gen(name, prompt)
    time.sleep(2)

print("\n✓ Done.")
