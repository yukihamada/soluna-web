#!/usr/bin/env python3
"""
Consistent-style photo series for 天空の道場 熊牛.

VISUAL STYLE GUIDE (prepended to every prompt):
- Film: Kodak Portra 800 warmth at dawn/dusk | Kodak T-MAX 400 grain at night
- Color: Deep blacks, warm amber-gold highlights, desaturated cool shadows (blue-purple)
- Contrast: Cinematic — crushed blacks, luminous highlights
- Time: ONLY pre-dawn / dawn / dusk / night — never midday
- Framing: Wide angle 14-35mm, dramatic depth of field
- Mood: Sacred, silent, extreme, primordial Hokkaido
- No text, no logos, no graphic elements
- Every frame: feels like a still from a feature film shot in Hokkaido
"""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = (
    "Cinematic film photograph, Kodak Portra 800 color grading. "
    "Deep crushed blacks, warm amber-gold highlights, desaturated cool blue-purple shadows. "
    "Fine analog film grain. Sacred, silent, extreme atmosphere. "
    "Wide angle lens 16-24mm. Shot in Hokkaido Japan. "
    "Feels like a still from a feature film. No text, no logos. "
    "National Geographic editorial quality. "
)

def gen(name, prompt):
    full = STYLE + prompt
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL,
                contents=full,
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
    # 1. 石鳥居 — 聖域への入口
    ("kumaushi_s_torii",
     "A handmade stone torii gate (two rough stone pillars with a crossbeam) "
     "stands at the entrance to a narrow forest path in Hokkaido at pre-dawn blue hour. "
     "Dense birch and fir forest on both sides. "
     "Ground mist drifts at knee height through the gate. "
     "The path disappears into darkness beyond. "
     "A single dim paper lantern hangs from the gate, amber glow. "
     "The sky above is deep indigo. "
     "Extreme depth of field — gate sharp, forest dissolves into bokeh. "
     "Feels like entering a sacred Shinto shrine deep in nature."
    ),

    # 2. 頂上の柔術家 — 阿寒を背に立つ
    ("kumaushi_s_summit_silhouette",
     "A single jiu-jitsu practitioner in a pure white gi (uniform) "
     "stands alone at the very edge of a hilltop, back to the camera. "
     "They face the most dramatic dawn light — "
     "Mount Akan-dake volcano silhouetted in deep orange-purple on the horizon. "
     "The highland plains of Hokkaido stretch endlessly below. "
     "Their gi catches the golden rim light from behind. "
     "The composition: 1/3 dark earth, 2/3 luminous sky. "
     "The figure is small against the vast landscape. "
     "Shot at f/8, 24mm, golden hour."
    ),

    # 3. 畳と光の柱 — 禅の静物
    ("kumaushi_s_tatami_light",
     "Interior of a geodesic dome jiu-jitsu dojo at 6am. "
     "A single shaft of golden morning sunlight enters through a circular porthole window "
     "and falls in a perfect circle on the dark tatami mat floor. "
     "The rest of the interior is in deep shadow — pure black. "
     "Dust motes drift in the light beam. "
     "No people. Absolute stillness. "
     "A folded white gi lies at the edge of the light circle. "
     "Minimalist, zen, architectural. Shot at f/2.8, 14mm ultra-wide."
    ),

    # 4. 秋の道場 — 紅葉の中のドーム
    ("kumaushi_s_autumn_dome",
     "Wide landscape photograph of a white geodesic dome on a Hokkaido hilltop "
     "surrounded by peak autumn foliage — blazing red, orange, and gold birch trees. "
     "Overcast dramatic sky with heavy dark clouds. "
     "The dome is pure white against the riot of autumn color. "
     "Fallen leaves cover the ground around the dome. "
     "A narrow path of fallen leaves leads to the dome entrance. "
     "Shot from 30 meters away, f/11, showing the full landscape context. "
     "Colors are intense but color graded to film — slightly desaturated, cinematic."
    ),

    # 5. 雨の稽古 — デッキで組む二人
    ("kumaushi_s_rain_training",
     "Two jiu-jitsu practitioners in white gi sparring on a wooden outdoor deck "
     "in heavy Hokkaido rain. "
     "Their gi is soaked and heavy. Steam rises from their bodies. "
     "The rain creates a silver curtain behind them. "
     "Shot from a low angle, the practitioners backlit by diffuse grey light. "
     "The forest edge is barely visible through the rain. "
     "One practitioner is executing a takedown. "
     "Dramatic, elemental, no shelter, fully committed. "
     "1/500s shutter, rain drops frozen in air."
    ),

    # 6. 内部の夜 — 薪ストーブと畳
    ("kumaushi_s_interior_stove",
     "Interior of a geodesic dome at 10pm. "
     "A cast-iron wood stove in the center burns intensely — "
     "orange flames visible through the glass door. "
     "The stove is the ONLY light source in the room. "
     "Its warm amber light illuminates the tatami floor in a radius around it. "
     "A white gi hangs on a wooden peg on the curved wall. "
     "A ceramic tea bowl sits on a small wooden table. "
     "The curved dome walls glow warm where lit, fade to black at the edges. "
     "Absolutely intimate, completely silent. f/1.8, ISO 3200, natural light only."
    ),

    # 7. 組み手のクローズアップ — 柔術の本質
    ("kumaushi_s_grip_closeup",
     "Extreme close-up photograph of two hands gripping a jiu-jitsu gi collar (lapel). "
     "One hand white, one darker — two practitioners locked in a grip fight. "
     "Shot on tatami mat, the weave of the tatami visible in the foreground. "
     "Golden morning light rakes across the scene at a low angle, "
     "catching the texture of the gi fabric in extraordinary detail. "
     "The hands are in sharp focus, the rest dissolves into warm bokeh. "
     "f/1.4, 50mm equivalent, golden hour. "
     "The image communicates everything about jiu-jitsu: contact, tension, presence."
    ),

    # 8. 冬の深夜 — 青い世界のドーム
    ("kumaushi_s_winter_blue",
     "Night photograph of a geodesic dome in deep winter at 2am. "
     "The scene is lit only by a full moon — everything is in shades of deep blue and silver. "
     "Snow is 60cm deep around the dome. "
     "A single amber light glows from within the dome's porthole window. "
     "The amber is the only warm color in an entirely blue-silver world. "
     "The Milky Way is dimly visible through thin clouds. "
     "Birch trees are frosted white, their branches like silver wire. "
     "Shot at f/2.8, ISO 6400, 25-second exposure. Dreamlike, eerie, beautiful."
    ),

    # 9. 黎明の瞑想 — 阿寒を前に座禅
    ("kumaushi_s_meditation_dawn",
     "A single jiu-jitsu practitioner sits in seiza (formal kneeling posture) "
     "on the very edge of a wooden observation deck, facing away from the camera. "
     "Pure white gi. "
     "The sun is just rising behind Mount Akan — "
     "a thin line of brilliant gold appears at the volcanic horizon. "
     "The sky transitions from deep purple-black at top to burning gold at the horizon. "
     "The figure is a small dark silhouette against the luminous dawn. "
     "Complete stillness. Sacred. "
     "Shot at f/8, 24mm, the figure perfectly centered at the horizon line."
    ),

    # 10. サウナ後の外気 — 水蒸気と星
    ("kumaushi_s_sauna_steam",
     "A person stands outside a barrel sauna on a Hokkaido hilltop at night, "
     "arms spread wide, head tilted back, looking at the stars. "
     "They wear only a white towel around their waist. "
     "Enormous clouds of white steam rise from their overheated body into the freezing night air. "
     "Temperature is −15℃. "
     "The steam catches the amber light from the sauna window. "
     "Behind them: clear night sky with dense star field. "
     "The image is simultaneously primal and beautiful. "
     "Shot at f/2.8, ISO 6400, 4-second exposure."
    ),

    # 11. 帯の儀式 — 炎の前で
    ("kumaushi_s_belt_ritual",
     "Close-up fine art photograph: a jiu-jitsu black belt "
     "being held horizontally over an open flame (outdoor fire pit). "
     "The flames illuminate the belt from below — "
     "casting deep orange-amber light on the black fabric. "
     "The character 熊牛 (Kumaushi) is embroidered in gold thread and glows in the firelight. "
     "The background is completely black — the fire and belt are the entire image. "
     "The image feels like a religious ceremony. "
     "Macro photography, f/4, natural flame light only."
    ),

    # 12. 空と大地 — 宇宙規模の構図
    ("kumaushi_s_earth_sky",
     "Ultra-wide 14mm astrophotography: the geodesic dome sits on a dark hilltop "
     "under an overwhelming Milky Way galaxy. "
     "Composition: the dome occupies the bottom 20% of the frame. "
     "The remaining 80% is the most spectacular night sky — "
     "Milky Way core rising directly above the dome in brilliant white-gold. "
     "Thousands of visible stars. Jupiter visible as a bright point. "
     "The dome's amber windows are the only artificial light. "
     "Birch forest silhouettes frame the bottom edges. "
     "30-second exposure at f/2.0, ISO 6400. "
     "The scale makes the dome look like a tiny campfire under the infinite universe."
    ),
]

for name, prompt in shots:
    success = gen(name, prompt)
    time.sleep(2)

print("\n✓ All generated. Deploy with: fly deploy --remote-only -a soluna-teshikaga")
