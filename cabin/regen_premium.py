#!/usr/bin/env python3
"""Regenerate key kumaushi images — premium quality v2
White stucco container compound, Hokkaido highland, luxury martial arts retreat"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

# Base style — luxury architectural photography
ARCH = ("Architectural photography, 50mm lens, magazine quality. "
        "RAL 9016 Traffic White stucco-finished shipping containers, smooth hand-applied lime plaster. "
        "Black anodized aluminum thermal-break window frames. Warm golden light. "
        "Hokkaido Japan highland grassland, distant mountain ranges, vast open sky. "
        "Clean, sharp, high dynamic range. No people unless specified. ")

SHOTS = [
    # ─── HERO / EXTERIOR ───
    ("k4_aerial",
     "Dramatic aerial drone photograph, golden hour, 4 white stucco-finished 20ft ISO shipping containers "
     "arranged in a perfect U-shape (court side south) on a Hokkaido grassland hilltop at 400m elevation. "
     "White plastered walls glowing warm amber in evening light. The central courtyard visible — white EVA "
     "puzzle mats covering the entire floor, cedar barrel sauna at one end. A gossamer white PTFE tensile "
     "membrane stretched over the courtyard on minimal steel posts, translucent, catching last light. "
     "Ground-mounted solar panels (35kW array) to one side. Wooden cedar deck extending south. "
     "Vast rolling green grassland, 270 degree panoramic view to mountains. A few deer grazing in distance. "
     "Shot from 60m altitude at 45° angle. Professional real estate drone photography. "
     + ARCH),

    ("k4_ext_ushape",
     "Eye-level wide shot of the white container compound from the open south side. "
     "Four RAL 9016 white stucco containers in U-shape. Center courtyard with white EVA mats and "
     "a gossamer tensile membrane roof overhead. Large sliding glass doors (thermally broken aluminum, "
     "black frame) on each container face the courtyard. Two containers have floor-to-ceiling glass, "
     "warm amber interior light glowing through. Cedar barrel sauna at left. Wooden cedar deck in foreground. "
     "Hokkaido mountains at golden hour background, dramatic clouds. Clean, minimal, extraordinary. "
     + ARCH),

    ("k4_ext_full",
     "Side elevation of single white stucco container unit. "
     "Smooth lime plaster finish, almost Mediterranean in texture. One 1800mm sliding glass door "
     "(black aluminum frame) flanked by small fixed window. Cedar wood step. "
     "The stucco completely covers the corrugated steel — you'd never know it's a container. "
     "Grass and wildflowers at base. Deep blue Hokkaido sky. Elegant, minimal. "
     + ARCH),

    ("k4_ext_detail",
     "Close macro shot: white lime stucco texture on container wall meeting a black anodized aluminum "
     "window frame. The plaster has a beautiful hand-troweled texture, slightly uneven and artisanal. "
     "Morning raking light creates soft shadows in the stucco texture. A copper drainage detail at "
     "container corner. The craftsmanship is exquisite — Japanese shikkui tradition meets industrial form. "
     + ARCH),

    # ─── DOJO & COURTYARD ───
    ("k4_dojo_center",
     "Looking into the central courtyard dojo space from the open south end. "
     "White stucco container walls form three sides. Floor completely covered with WHITE EVA puzzle mats "
     "(clean, fresh, combat-grade). The white PTFE tensile membrane overhead filters sunlight to a soft glow. "
     "Far end: a 4K short-throw projector on white wall, a small rocket mass heater. "
     "Cedar wood details at transitions. Through the open south end: infinite Hokkaido grassland horizon. "
     "Shot with 24mm wide angle for the full dojo feel. Breathtaking dojo — Zen meets wilderness. "
     + ARCH),

    ("k4_winter_dojo",
     "The white container compound in deep Hokkaido winter. Heavy fresh snow on container rooftops and "
     "surrounding ground. The white stucco walls are indistinguishable from the snow — beautiful "
     "white-on-white abstraction. Under the tensile membrane, the white mats are perfectly clear of snow. "
     "A lone figure in white gi sits in seiza position on the mats, meditative, snow falling around the "
     "open south end. Steam rising from the cedar barrel hot tub visible at left. "
     "Twilight, deep blue, quiet snowfall. The most beautiful dojo in winter. "
     + ARCH),

    # ─── NIGHT ───
    ("k4_night",
     "The white container compound at night. Full Milky Way overhead — Hokkaido has no light pollution. "
     "White stucco walls softly lit by warm ground uplights, glowing like lanterns. "
     "Glass sliding doors amber with interior warmth. Central courtyard: string lights along membrane posts. "
     "A campfire burning in the courtyard casting orange light on white mats. "
     "In distance: city lights of Teshikaga faintly visible. Astrophotography quality sky. "
     "Long exposure, tripod, 16mm. Magical. "
     + ARCH),

    # ─── CONSTRUCTION ───
    ("k4_crane_install",
     "Telescoping mobile crane hoisting the final (4th) white stucco 20ft container into position. "
     "Three white containers already placed in U-shape on concrete pads on Hokkaido grassland hilltop. "
     "Construction workers in hi-vis vests and helmets guiding the lowering container with rope taglines. "
     "The container is finished and ready — white stucco exterior, sliding glass door already installed. "
     "Late afternoon light. A documentary construction photograph — this is the key moment of assembly. "
     + ARCH),

    # ─── INTERIORS ───
    ("k4_int_bedroom_wide",
     "Interior of container bedroom unit, wide shot from corner. "
     "White walls and white ceiling (closed-cell spray foam, plastered smooth). "
     "Airweave king mattress on low wooden platform bed. White linen. "
     "Large sliding glass door wall-to-wall, floor to ceiling: panoramic Hokkaido grassland view. "
     "Minimalist — no clutter. Single shelf, Muji reading lamp. Heated floor (visible at door gap). "
     "Morning light flooding in. Photography: Architectural Digest quality. "
     + ARCH),

    ("k4_int_bath",
     "Bathroom container interior. "
     "White plaster walls, 120×120cm Japanese stone-look tile floor with floor drain. "
     "Freestanding soaking bathtub at window, view of Hokkaido grassland. "
     "Rain shower corner in stainless steel. TOTO wall-hung WC. "
     "Small porthole window circles letting in stream of light at shoulder height. "
     "100mm spray foam ceiling insulated and plastered. Warm neutral light. Spa-like. "
     + ARCH),

    ("k4_int_kitchen_wide",
     "Open kitchen and dining container interior. "
     "One long galley kitchen: white Silestone counter, IH induction range, Balmuda The Brew. "
     "Large sliding glass door opens to courtyard and dojo. "
     "Counter-height window at 1000mm looking onto courtyard (for cooking while watching training). "
     "Wood dining table for 4. White walls, concrete-look floor. "
     "Afternoon light streaming through the sliding door. Inviting. "
     + ARCH),

    # ─── SAUNA & WELLNESS ───
    ("winter_sauna",
     "Cedar barrel sauna in Hokkaido snowscape. "
     "Round barrel sauna, 2m diameter, natural cedar staves turning silver-grey. "
     "Small round window with warm amber glow from interior. "
     "Snow piled on roof. Wooden changing deck with snow. "
     "Next to it: wooden barrel hot tub (filled, steam rising in cold air). "
     "White container buildings visible in background. "
     "Blue-grey dusk sky, snowflakes falling. Steam vs cold — profound contrast. "
     + ARCH),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_jpg): os.remove(out_jpg)
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for part in r.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    with open(out_jpg, "wb") as f:
                        f.write(part.inline_data.data)
                    result = subprocess.run(
                        ["cwebp", "-q", "92", out_jpg, "-o", out_webp],
                        check=True, capture_output=True)
                    os.remove(out_jpg)
                    size_kb = os.path.getsize(out_webp) // 1024
                    print(f"  ✓ {name}.webp  {size_kb}KB")
                    return True
            print(f"  no image in response (attempt {attempt+1})")
        except Exception as e:
            print(f"  error: {e}")
            time.sleep(8)
    return False

ok = fail = 0
for name, prompt in SHOTS:
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(4)

print(f"\n{'='*40}")
print(f"Done: {ok} ok, {fail} fail")
