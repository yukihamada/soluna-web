#!/usr/bin/env python3
"""
Architecture photos for 天空の道場 熊牛
Layout: L-shaped / courtyard building on hilltop
- 道場 (dojo, 8×10m, tatami, glass wall facing mountains)
- 部屋1・部屋2 (2 guest rooms, 5×6m each)
- 中庭 (courtyard, 8×6m, natural stone + moss + water)
- 屋上テラス (rooftop terrace, accessible from courtyard stairs)
- 屋上: 湯船 + 植物に隠れた太陽光/太陽熱/水タンク
"""
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
    # 1. 空撮 — 全体配置 (コの字/L字、中庭が見える)
    ("kumaushi_a_aerial_layout",
     "Epic aerial drone photograph at dusk looking straight down at a small minimalist Japanese architectural compound "
     "on a Hokkaido hilltop. "
     "The building is L-shaped / U-shaped with a central open courtyard visible from above. "
     "Three distinct wings are visible: "
     "a long dojo wing (large glass wall facing the mountain panorama), "
     "a courtyard (open air, moss and stone garden, small water feature), "
     "and a smaller rooms wing. "
     "The flat rooftop is partially covered in green plants and moss — the solar panels are almost invisible "
     "because native Hokkaido grasses grow between and around them. "
     "A round wooden bathtub (ofuro) is visible on the rooftop, steaming. "
     "The surrounding landscape is Hokkaido highland — birch forest, open plains, volcanic mountains at horizon. "
     "Golden dusk light. The compound looks like it grew naturally from the hilltop. "
     "Shot from 30 meters directly above, f/8, ultra sharp."
    ),

    # 2. 中庭 — 石と苔と水
    ("kumaushi_a_courtyard",
     "Ground-level photograph inside an intimate Japanese courtyard garden at the center of an architectural compound "
     "on a Hokkaido hilltop at dawn. "
     "The courtyard is 8×6 meters, open to the sky. "
     "Walls on three sides are raw concrete with a wabi-sabi texture, aged and mossy. "
     "The garden has: irregular stepping stones of dark volcanic rock, "
     "deep green moss covering the ground, "
     "a shallow rectangular water channel (tsukubai-style) with still dark water reflecting the sky, "
     "two twisted dwarf birch trees, naturally shaped. "
     "One glass wall reveals the dojo interior — tatami mats and morning light. "
     "On the opposite wall: a narrow staircase with wooden handrail leads up to the rooftop. "
     "The sky visible above is deep blue-pink pre-dawn. "
     "Absolutely silent. Zen, architectural, sacred. Shot at f/4, 16mm."
    ),

    # 3. 屋上テラス — 湯船と山 (夜明け)
    ("kumaushi_a_rooftop_bath_dawn",
     "Extraordinary photograph of a rooftop outdoor bath (ofuro) at sunrise on a Hokkaido hilltop. "
     "The round wooden soaking tub (180cm diameter, aromatic hinoki cypress) sits at the edge of a flat rooftop terrace. "
     "Hot water steams in the freezing morning air — the steam rises in long white plumes. "
     "One person is in the bath, head tilted back, eyes closed, facing Mount Akan on the horizon. "
     "The volcanic mountain silhouette is backlit by the rising sun — brilliant orange-gold on the horizon, "
     "deep purple above. "
     "The rooftop edge has no railing — just the edge and the infinite sky. "
     "Around the tub: native Hokkaido grasses, stonecrop succulents, and small ferns grow in low planter beds. "
     "The solar panels are hidden completely beneath the plant growth. "
     "This is one of the most beautiful places on earth to be at 5am. Shot at f/4, 24mm."
    ),

    # 4. 屋上 — 植物に隠れた設備
    ("kumaushi_a_rooftop_plants",
     "Wide photograph of a rooftop garden on a low flat-roofed building in Hokkaido. "
     "The rooftop is completely covered in a living green roof — "
     "native Hokkaido plants: arctic moss, wild grasses, stonecrop sedum, small wildflowers. "
     "Almost invisible beneath the plants: thin-profile solar panels (flush-mounted, nearly horizontal) "
     "and flat solar thermal collectors (the same dark color as the soil, covered in moss at edges). "
     "A cylindrical water storage tank in the corner is completely wrapped in climbing moss and ferns "
     "— it looks like a natural rock formation. "
     "The overall effect: the rooftop looks like a natural Hokkaido meadow, not a building. "
     "Shot from standing height looking across the rooftop. Overcast dramatic sky. "
     "The building disappears into the landscape."
    ),

    # 5. 道場 内部 → 中庭ビュー
    ("kumaushi_a_dojo_courtyard_view",
     "Interior photograph of a minimalist jiu-jitsu dojo looking through full-height glass sliding doors "
     "into the central courtyard garden. "
     "The dojo floor is premium tatami mat — perfectly laid, golden-brown, fresh. "
     "The glass doors are fully open — no threshold between inside and outside. "
     "The courtyard is visible: moss, stone, dwarf birch, still water channel. "
     "Morning light enters from the courtyard, raking across the tatami at a low angle. "
     "The dojo walls are raw white plaster (Japanese shikkui finish). "
     "One wooden peg on the wall holds a white gi (jiu-jitsu uniform). "
     "No furniture, no equipment — pure emptiness and light. "
     "The image is about the connection between the martial arts space and nature. "
     "Shot at f/5.6, 14mm ultra-wide, 6am morning light."
    ),

    # 6. ゲストルーム内部 → 中庭ビュー
    ("kumaushi_a_room_interior",
     "Interior photograph of a minimalist Japanese guest room at dusk. "
     "The room is 5×6 meters: tatami floor, low wooden platform bed with white linen, "
     "shoji screen on one wall, a single low wooden table with a ceramic tea bowl. "
     "One full-height window faces directly into the private courtyard — "
     "the courtyard is lit by paper lanterns at dusk, moss glowing amber. "
     "The room has no decoration except a single hanging scroll (kakejiku) on one wall with brushstroke kanji. "
     "Warm amber light from a recessed ceiling fixture. "
     "The room is about 20% lit interior, 80% dark — "
     "the emphasis is on the luminous courtyard view through the window. "
     "Ryokan editorial quality. Shot at f/2.8, 24mm."
    ),

    # 7. 屋上 — 夜 湯船 × 天の川
    ("kumaushi_a_rooftop_stars",
     "Night photograph of the rooftop terrace of the dojo compound. "
     "The round wooden ofuro bath glows with warm amber from an underwater light. "
     "Steam rises dramatically from the hot water into the freezing air. "
     "Two people sit in the bath facing opposite directions. "
     "The entire sky above is the Milky Way — blazing, crystalline, overwhelming. "
     "The native plant beds around the bath are visible — grasses and moss catching the steam. "
     "On the horizon: Mount Akan is a dark silhouette. "
     "No electric lights other than the bath glow — total darkness around. "
     "Shot at f/2.0, ISO 6400, 20-second exposure. "
     "The most surreal and beautiful bath on earth."
    ),

    # 8. 全景 — 建物外観 × 夕暮れ
    ("kumaushi_a_exterior_dusk",
     "Wide exterior photograph of the dojo compound building at dusk from 20 meters distance. "
     "The building is low, horizontal, and massive — a single-story structure that hugs the hilltop contours. "
     "Raw board-formed concrete exterior walls, aged and slightly mossy at the base. "
     "The flat roof is the living green roof — from this angle you can see the grasses and plants "
     "growing on the rooftop, the building melting into the hilltop. "
     "Full-height glass on the dojo wing is lit from within — warm amber tatami glow visible inside. "
     "The courtyard is open-air in the center of the building — warm paper lantern light visible. "
     "The volcanic mountain range is visible on the horizon in deep purple-orange. "
     "A single narrow stone pathway leads to the entrance. "
     "The building looks ancient and permanent, like it has always been here. Shot at f/8, 24mm."
    ),
]

for name, prompt in shots:
    success = gen(name, prompt)
    time.sleep(2)

print("\n✓ Done.")
