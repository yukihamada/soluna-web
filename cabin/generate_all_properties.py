#!/usr/bin/env python3
"""Generate photos for tapkop, nesting, lodge, atami — 6 each = 24 total"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = ("Cinematic film photograph, Kodak Portra 800 color grading. "
         "Deep crushed blacks, warm amber-gold highlights, desaturated cool blue shadows. "
         "Fine analog film grain. Feels like a still from a feature film. No text, no logos. "
         "National Geographic / Wallpaper magazine editorial quality. ")

SHOTS = [
  # TAPKOP — アイヌ語で「丘」、北海道弟子屈の高台エコビレッジ
  ("tapkop_aerial_village","Aerial shot of a small eco-village cluster of 5-6 wooden cabins on a broad hilltop in Hokkaido wilderness. Surrounded by birch and pine forest. Lake Mashu visible in far distance. Golden hour. Smoke rising from one chimney. Remote, self-sufficient, sacred. "+STYLE),
  ("tapkop_forest_path","Narrow wooden path through dense Hokkaido birch forest leading uphill toward warm cabin lights at dusk. Misty, cool air. Fallen leaves. Lantern posts. Silent, meditative. "+STYLE),
  ("tapkop_communal_fire","Group of 6 people sitting around a large outdoor fire circle at night in open Hokkaido meadow. Simple wooden log seats. Stars visible. Talking quietly. Connection. "+STYLE),
  ("tapkop_cabin_interior","Interior of a simple wooden cabin — rough timber walls, low table, cushions on wood floor, small cast iron stove burning. One window showing birch forest outside. Warm amber light. Minimal. "+STYLE),
  ("tapkop_lake_mashu_view","Person standing at edge of hilltop looking out at Lake Mashu in morning mist. White gi or simple linen clothing. Completely alone. Infinite horizon. "+STYLE),
  ("tapkop_greenhouse_morning","Small timber-frame greenhouse with vegetable plants inside, frost on glass, morning sunlight streaming through. Hokkaido wilderness visible beyond. Self-sufficiency. "+STYLE),

  # NESTING — 東京近郊リトリートヴィラ
  ("nesting_exterior_rain","Modern Japanese retreat villa exterior in rain — dark timber cladding, low horizontal roofline, large glass walls with warm interior visible. Garden with raked gravel and single pine. Rainy day, quiet. "+STYLE),
  ("nesting_living_space","Interior of a modern Japanese villa — sunken living area with tatami platform, floor-to-ceiling glass sliding doors opening to a forest garden. Afternoon light. Minimal furniture. Deep silence. "+STYLE),
  ("nesting_forest_bath","Person sitting on wooden deck of villa, surrounded by tall cedar forest. Morning mist. Cup of tea. Complete solitude 2 hours from Tokyo. "+STYLE),
  ("nesting_night_garden","Villa at night — warm light from interior casting on Japanese garden with moss, stone lantern, raked gravel. Dark cedar forest surrounding. Stars barely visible. "+STYLE),
  ("nesting_onsen_outdoor","Small outdoor cypress wood onsen tub on villa deck, person soaking, view of forested valley. Steam rising in cold air. Late autumn leaves on surface. "+STYLE),
  ("nesting_kitchen_morning","Minimal Japanese kitchen inside villa — concrete countertop, single window above sink showing forest. Coffee brewing. Morning ritual. Simple, intentional living. "+STYLE),

  # THE LODGE — 北海道弟子屈の山小屋ログハウス
  ("lodge_exterior_snow","Traditional Hokkaido log cabin lodge in deep winter snow. Low roof, small windows glowing amber. Pine forest background. Blue hour light. Smoke from chimney. Isolated. "+STYLE),
  ("lodge_great_room","Interior of a log cabin great room — exposed log walls, stone fireplace blazing, animal hide rugs, low wood ceiling. 4 people playing cards or reading. Cozy winter night. "+STYLE),
  ("lodge_hot_spring_night","Outdoor natural hot spring bath next to lodge building at night. Stone basin, steam, snow on ground, pine forest, stars. One person alone in the water. Perfect silence. "+STYLE),
  ("lodge_morning_view","View from lodge deck at dawn — Hokkaido valley with morning fog, distant mountains. Coffee mug in foreground, wooden railing. Cold crisp air. Renewal. "+STYLE),
  ("lodge_wood_interior","Lodge bedroom — low timber frame bed with heavy wool blanket, small skylight showing stars, rough plank walls. Candlelight. Absolute simplicity. "+STYLE),
  ("lodge_trail_approach","Forest trail approach to lodge — tall pine trees, dappled summer light, wooden trail marker. Person hiking. Birdsong. Green undergrowth. "+STYLE),

  # SOLUNA 熱海 — 静岡県熱海市、相模湾パノラマ
  ("atami_cliff_view","Dramatic ocean view from clifftop villa site in Atami — Sagami Bay stretching to horizon, Izu Peninsula visible, morning golden light. Empty land with single wooden viewing platform. Future site. "+STYLE),
  ("atami_sunset_ocean","Blazing orange-pink sunset over Sagami Bay as seen from Atami clifftop. Two people silhouetted on wooden platform. Dramatic clouds. Mediterranean feeling in Japan. "+STYLE),
  ("atami_onsen_exterior","Traditional stone onsen bath on cliff edge overlooking ocean. Steam rising. Dawn light. No buildings in view — just water, sky, sea. Pure contemplation. "+STYLE),
  ("atami_container_render","Two minimalist white container villas perched on Atami cliff overlooking Sagami Bay. Floor-to-ceiling glass on ocean side. Stone terrace. Mediterranean vegetation. Conceptual, sleek. "+STYLE),
  ("atami_town_aerial","Aerial view of Atami town with terraced buildings, Sagami Bay, and distant islands. The clifftop site visible at top of frame. Gold evening light. "+STYLE),
  ("atami_bbq_deck","Stone terrace BBQ deck on Atami cliff — simple outdoor grill, two chairs, glass of wine, Sagami Bay panorama. Warm summer evening. Casually luxurious. "+STYLE),
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
