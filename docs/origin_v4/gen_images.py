#!/usr/bin/env python3
"""Generate SOLUNA ORIGIN v4 perspectives via Gemini 3 Pro Image."""
import os, sys, base64, time
from pathlib import Path
from google import genai
from google.genai import types

KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
client = genai.Client(api_key=KEY)
MODEL = "gemini-3-pro-image-preview"
OUT = Path(__file__).parent

# Common style anchor for visual coherence
STYLE = (
    "Cinematic architectural visualization, photoreal, golden-hour or blue-hour, "
    "Aman/Six Senses level luxury, Japanese minimal vernacular: cedar shou-sugi-ban, "
    "lime plaster, washi paper, copper detailing, deep navy and gold palette, "
    "low contrast, soft fog, hand-drawn film grain, 35mm anamorphic feel, "
    "no humans visible unless specified, no text, no logos, no watermarks. "
    "Strictly low-rise (3 floors max). Respect Ise Shima National Park scale."
)

PROMPTS = {
    "01_cover": (
        "Pre-dawn at Meoto-iwa (the Wedded Rocks of Futamigaura, Ise, Mie, Japan). "
        "Two sacred rocks linked by a thick shimenawa rope, sun cresting between them, "
        "calm sea reflecting molten gold. Ultra-wide cinematic frame, deep indigo sky "
        "with first amber light, mist on the water, single torii silhouette on a small island. "
        "Editorial luxury hotel cover image mood. " + STYLE
    ),
    "02_axis_a_glamping": (
        "Bird's eye twilight view of 20 low domes scattered on a coastal pine forest "
        "ridge facing Meoto-iwa rocks in the distance. Domes are matte charcoal cedar shells "
        "with brass-rimmed circular skylights glowing warm. Boardwalk paths. Onsen steam. "
        "Misty Ise sea horizon at dusk. Hidden, scattered, never gridded. "
        "Sense of monastic retreat, not resort. " + STYLE
    ),
    "03_axis_b_gate": (
        "Three-story low-rise mixed-use complex at Futamigaura station front, "
        "Ise Japan. Floor 1: open-air pilgrim retail street with shou-sugi-ban "
        "cedar columns, paper lanterns, narrow Ama-fisher market stalls. "
        "Floor 2: stone-clad pilgrim center with deep eaves. Floor 3: a row of "
        "small inn windows lit warm at dusk. Roof: slight irimoya pitch, dark tile. "
        "Pedestrian-only stone street in foreground leading to torii gate. "
        "Strictly 3 floors maximum, human scale, blends with surrounding traditional houses. "
        + STYLE
    ),
    "04_masterplan": (
        "High-altitude isometric architectural masterplan illustration of a coastal "
        "Japanese pilgrimage site. From left to right: train station with small heli pad, "
        "a low-rise 3-story 'Origin Gate' complex, a stone pedestrian spine ('omotesando') "
        "lined with traditional shops, twenty scattered glamping domes on a forested coastal "
        "ridge, ending at the Meoto-iwa twin rocks in the sea. Hand-painted sumi-ink and "
        "gold-leaf style on aged washi paper, with subtle Japanese cartography labels in "
        "elegant typography. Two zones clearly separated by green forest. " + STYLE
    ),
    "05_misogi_spa": (
        "Interior of a Misogi purification spa in Ise, Japan. A long stone cold-plunge basin "
        "fed by a single bamboo spout, dark cedar walls with shou-sugi-ban texture, "
        "a translucent shoji screen letting in dawn light, a single lit candle on a cypress "
        "tray, mist rising from the water, polished black slate floor. Sacred, monastic, silent. "
        + STYLE
    ),
    "06_pilgrim_inn": (
        "A small Pilgrim Inn guest room in the third floor of a low-rise complex in Futamigaura, "
        "Ise Japan. View through floor-to-ceiling washi-papered window onto the sea and "
        "Meoto-iwa rocks at sunrise. Tatami floor, a low futon with charcoal linen, "
        "a single carved cedar bench, a small alcove with a single white peony. "
        "Walls in lime plaster, ceiling in cedar planks. Restrained, monastic. " + STYLE
    ),
    "07_omotesando": (
        "A narrow stone pedestrian street ('omotesando' / approach path) in Futamigaura, "
        "Ise Japan, at blue hour. Lined on both sides by single-story shou-sugi-ban shops "
        "selling pearls, ama-diver dried abalone, cedar woodcraft, ritual salt. Warm paper "
        "lantern lighting overhead. Wet stone reflections after rain. The path leads "
        "down toward the sea where Meoto-iwa rocks are faintly visible. Quiet, no crowd. "
        + STYLE
    ),
    "08_ama_dining": (
        "A private dining hall on the coast of Futamigaura, Ise Japan, evening. "
        "An eight-seat live-edge cedar counter facing an open hearth where an ama "
        "(female sea-diver) silhouette grills abalone over charcoal. Behind, "
        "a wall of glass opens onto the dark sea with the silhouette of Meoto-iwa rocks "
        "barely visible at dusk. Single warm pendant light over each seat. "
        "Editorial Aman-level restaurant mood. " + STYLE
    ),
}

def gen(name, prompt):
    out = OUT / f"{name}.png"
    if out.exists() and out.stat().st_size > 50_000:
        print(f"[skip] {out.name} ({out.stat().st_size//1024}KB)")
        return
    print(f"[gen ] {name} ...", flush=True)
    t0 = time.time()
    resp = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )
    saved = False
    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None) and part.inline_data.data:
            data = part.inline_data.data
            if isinstance(data, str):
                data = base64.b64decode(data)
            out.write_bytes(data)
            saved = True
            print(f"        -> {out.name} ({len(data)//1024}KB) {time.time()-t0:.1f}s")
            break
    if not saved:
        print(f"        !! no image part returned for {name}")
        for p in resp.candidates[0].content.parts:
            print("        text:", getattr(p, "text", None))

if __name__ == "__main__":
    targets = sys.argv[1:] or list(PROMPTS.keys())
    for k in targets:
        if k not in PROMPTS:
            print("unknown:", k); continue
        try:
            gen(k, PROMPTS[k])
        except Exception as e:
            print(f"  ERROR {k}: {e}")
