#!/usr/bin/env python3
"""Batch 2 — 16 new shots for 天空の道場 熊牛"""
import os, time
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

    # 1. 朝の茶 — 道場でのお茶
    ("kumaushi_b_tea_ceremony",
     "Interior photograph inside a minimalist tatami dojo at 6am. "
     "A single practitioner in a wrinkled white gi sits seiza on the tatami, "
     "both hands cupped around a dark ceramic bowl of matcha. "
     "Steam rises from the bowl. The tatami extends to a full-height glass wall "
     "showing Hokkaido mountains in the distance — still dark blue-purple with the first light on the horizon. "
     "The only light source is the dawn outside. The room is almost entirely dark — "
     "just the faint glow of sky and the steam from the bowl. "
     "Ultra quiet, sacred morning ritual. Shot at f/2, 35mm."
    ),

    # 2. グループ稽古 — 6人の柔術家
    ("kumaushi_b_group_training",
     "Wide interior photograph of a tatami dojo with six jiu-jitsu practitioners drilling technique at dawn. "
     "Three pairs spread across the tatami — one pair near the full-height glass wall (backlit by sunrise), "
     "one pair center, one pair near camera. "
     "All wear white gis — the fabric catches the raking golden dawn light. "
     "The tatami surface reflects the glow. "
     "The glass wall shows Hokkaido volcanic mountains in silhouette — orange and purple dawn sky. "
     "Pure movement, discipline, focus. Shot at f/5.6, 16mm ultra-wide. "
     "The image conveys: these people came from around the world to be here."
    ),

    # 3. アイスバス — 冬の朝
    ("kumaushi_b_ice_bath",
     "Photograph of a person entering an outdoor ice bath on a wooden deck at dawn in Hokkaido winter. "
     "A dark rectangular tub filled with ice-cold water and ice chunks — "
     "the water surface reflects the pre-dawn sky. "
     "The person is lowering themselves in slowly, breath exploding in white fog clouds. "
     "They are shirtless — steam rises off their warm skin in the freezing air. "
     "Snow covers the ground and the deck railing. "
     "In the background: birch trees, then open plain, then volcanic mountains on the horizon. "
     "Temperature is -10°C — this is absolute commitment. Shot at f/4, 24mm. "
     "The breath fog and ice contrast are extraordinary."
    ),

    # 4. 朝霧 — 谷の霧の海
    ("kumaushi_b_morning_mist",
     "Epic dawn photograph from a hilltop looking down into a valley completely filled with white fog. "
     "The fog is thick — only the mountaintops emerge above it, floating like islands. "
     "In the foreground: the edge of a flat-roof building and its living green rooftop, "
     "a person standing at the roof edge in a white gi looking out over the sea of fog. "
     "Mount Meakan and Mount Akan are perfectly silhouetted — massive dark cones against amber-pink sky. "
     "The fog below is luminous, glowing as the sun begins to rise behind the mountains. "
     "This is the most isolated, sacred view on earth. Shot at f/8, 24mm. The person is tiny against the vastness."
    ),

    # 5. 北海道キタキツネ — 道場の前
    ("kumaushi_b_hokkaido_fox",
     "Wildlife photograph of a Hokkaido red fox (Ezo red fox) sitting on the stone path "
     "leading to a minimalist concrete and wood building in Hokkaido. "
     "The fox has turned to look directly at the camera — intelligent amber eyes, thick winter fur, "
     "white chest, bushy tail curled around its feet. "
     "The building entrance is visible behind: raw concrete wall, a wooden sliding door, "
     "a single persimmon lantern glowing amber. "
     "Dusk light — orange-gold sky behind the building. "
     "Snow on the ground. The fox is completely at ease — this is its territory. "
     "Shot at f/4, 85mm. The fox and building are in perfect compositional balance."
    ),

    # 6. ブリザード稽古 — 屋外雪嵐
    ("kumaushi_b_blizzard_training",
     "Dramatic photograph of two jiu-jitsu practitioners training outdoors in a Hokkaido blizzard. "
     "Horizontal snow — driven sideways by fierce wind, nearly whiteout conditions. "
     "The two figures are in white gis (almost invisible against the snow), "
     "one executing a throw, the other airborne. "
     "They are on a wooden outdoor deck or platform — snow accumulation around the edges. "
     "The blizzard is so thick that the background (mountains, trees) has disappeared. "
     "Only the two figures and the swirling white chaos. "
     "This image says: nothing stops the practice. Shot at f/8, 35mm. "
     "One of the most brutal and beautiful training images imaginable."
    ),

    # 7. 薪割り — 早朝の儀式
    ("kumaushi_b_wood_chopping",
     "Photograph of a person chopping firewood at dawn outside a minimalist cabin in Hokkaido. "
     "The person is mid-swing — axe raised high, body fully extended in the power position. "
     "They wear a cotton work shirt and canvas pants. "
     "The woodpile is large — split logs stacked against a raw concrete wall. "
     "Fresh snow on the ground, cold vapor breath visible. "
     "Dawn light: horizontal amber-gold raking across the scene from the left. "
     "In the background: open Hokkaido plains, then the mountain silhouette. "
     "This is physical preparation. The same energy as a warm-up before jiu-jitsu. "
     "Shot at f/4, 35mm. High shutter speed to freeze the motion."
    ),

    # 8. 洗面 / 水 — 中庭の水鉢
    ("kumaushi_b_water_ritual",
     "Close-up photograph of hands performing a water purification ritual at a stone water basin "
     "(tsukubai) in a Japanese courtyard garden. "
     "The hands are cupped, catching flowing water that pours from a bamboo spout. "
     "The water is crystal clear — tiny droplets exploding off the stone. "
     "The stone basin is covered in dark green moss. "
     "Background (out of focus): the dojo glass wall reflecting the morning sky, "
     "dark volcanic rock stepping stones, moss garden. "
     "5:50am, pre-training ritual. Shot at f/2, 50mm macro. "
     "The water and moss textures are extraordinary."
    ),

    # 9. 屋上 — 黄金の夕暮れ
    ("kumaushi_b_rooftop_golden",
     "Extraordinary photograph of the rooftop terrace of a concrete building on a Hokkaido hilltop "
     "at golden hour — 30 minutes before sunset. "
     "A solitary person sits cross-legged on dark martial arts mats at the roof edge, "
     "facing away from the camera, looking toward Mount Akan. "
     "The volcanic mountain is bathed in intense gold light — almost painfully bright. "
     "The sky is a gradient: deep amber at the horizon, burnt orange above, pale blue at zenith. "
     "The person is completely still, silhouetted. "
     "Native plants at the roof edge glow gold in the light. "
     "The steam from a distant hot spring or the round wooden ofuro catches the light. "
     "This is the moment everything stops. Shot at f/8, 50mm."
    ),

    # 10. 冬の鳥居 — 雪の中の石鳥居
    ("kumaushi_b_torii_winter",
     "Photograph of a stone torii gate in deep snow on a Hokkaido hilltop approach path. "
     "The torii is simple natural granite, no paint — just raw stone. "
     "The path beyond the torii is barely visible — deep fresh snow, "
     "footprints of the last practitioner who passed through. "
     "On either side: young birch trees heavily laden with snow, branches white. "
     "The building is just barely visible beyond the torii — a dark horizontal mass in the snow. "
     "The sky is the flat white of snowfall — overcast, diffuse. "
     "Perfect silence. The torii marks the transition from the ordinary world to the sacred space. "
     "Shot at f/8, 35mm. The path perspective is perfectly centered."
    ),

    # 11. 満天の星 × 建物外観
    ("kumaushi_b_stars_exterior",
     "Night photograph of the exterior of the dojo compound from 30 meters distance. "
     "The building is a dark horizontal mass — raw concrete, low and massive. "
     "The windows glow: warm amber from inside the dojo and guest rooms — tiny squares of warmth. "
     "Above the building: the Milky Way blazes across the entire sky — dense, luminous, overwhelming. "
     "The galaxy core is directly above the building. "
     "The Hokkaido plain stretches dark and flat to the horizon. "
     "This is one of the darkest places in Japan. "
     "Shot at f/2.0, ISO 3200, 25-second exposure. "
     "The building looks tiny under the infinite galaxy."
    ),

    # 12. 春 — 野花と道場
    ("kumaushi_b_spring_wildflowers",
     "Wide photograph of the dojo compound surrounded by Hokkaido spring wildflowers. "
     "The flat rooftop is covered in blooming sedum and native flowers — white, yellow, pale purple. "
     "The slope around the building is covered in: "
     "wild lupins (purple), buttercups, Hokkaido alpine flowers in dense clusters. "
     "The building's raw concrete exterior contrasts with the riot of color. "
     "A practitioner stretches in the courtyard, visible through the open glass door. "
     "The volcanic mountains in the background still have snow on their peaks "
     "despite the spring flowers below. "
     "Shot at f/8, 24mm. Late May — the season when everything explodes at once."
    ),

    # 13. 夜の焚き火 — 石のサークル
    ("kumaushi_b_bonfire_night",
     "Photograph of a stone fire circle at night with a large bonfire burning in Hokkaido. "
     "Six practitioners sit on stone seats around the fire in a circle — "
     "some in gis, some wrapped in blankets. "
     "The fire is large and crackling — orange and white at the core, red embers. "
     "The light from the fire illuminates faces from below: intense, meditative, present. "
     "Sparks rise into the darkness above. "
     "Beyond the circle: total darkness — just the flat Hokkaido plain and the invisible mountains. "
     "One person is speaking; the others listen. "
     "Post-training sharing circle. This is the heart of the community. "
     "Shot at f/2.8, 24mm. ISO 3200. No light source except fire."
    ),

    # 14. 着替え / 白帯のたたみ方
    ("kumaushi_b_gi_fold",
     "Close-up still life photograph of a white jiu-jitsu gi folded and placed on a tatami mat. "
     "The gi is perfectly folded — jacket on top of pants, white belt rolled and placed in the center. "
     "On the tatami beside it: a dark ceramic bowl (empty, just washed), "
     "a single wooden peg on the wall with another gi hanging. "
     "Morning light rakes across the tatami at an extreme angle — "
     "individual fibers of the tatami casting tiny shadows. "
     "The white of the gi glows against the golden-brown of the tatami. "
     "Utter simplicity. This is the preparation for practice. "
     "Shot at f/2.8, 35mm, extreme low angle — nearly at tatami level."
    ),

    # 15. 霧雨の屋上 — 一人の瞑想
    ("kumaushi_b_mist_rooftop_meditation",
     "Moody atmospheric photograph of a person meditating on the rooftop of the dojo compound "
     "during light rain and mist in Hokkaido. "
     "The person sits zazen — perfectly upright on the dark martial arts mats, "
     "hands in mudra, eyes closed. "
     "Fine misty rain creates a soft haze. "
     "Droplets bead on the gi fabric and on the mat surface — visible in the close ambient light. "
     "The mist softens the mountains behind completely — only a dark grey suggestion of peaks. "
     "The rooftop plants drip. The round ofuro bath steams at the edge. "
     "Everything is grey, wet, alive. "
     "The person is completely still and completely present. "
     "Shot at f/2, 24mm. No direct light — only the diffuse grey of an overcast rain day."
    ),

    # 16. 秋 — 紅葉と道場外観
    ("kumaushi_b_autumn_building",
     "Wide exterior photograph of the dojo compound in peak Hokkaido autumn foliage. "
     "The L-shaped concrete building sits on the hilltop surrounded by birch trees "
     "in full autumn color: brilliant yellow, orange, and the first russet-red. "
     "The building's raw concrete has absorbed moisture and appears dark charcoal. "
     "The living green roof has turned: sedum in deep red, grasses in amber and gold. "
     "The full-height glass dojo wall reflects the autumn tree colors. "
     "A single practitioner walks along the stone path toward the entrance. "
     "Mount Akan rises purple and enormous on the horizon. "
     "Shot at f/8, 24mm, late afternoon light — the golden moment when autumn is at maximum saturation."
    ),
]

for name, prompt in shots:
    success = gen(name, prompt)
    time.sleep(2)

print(f"\n✓ Done. {len(shots)} shots attempted.")
