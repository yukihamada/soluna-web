#!/usr/bin/env python3
"""v6: generate all shots using the reference photo as style guide"""
import os, time, subprocess, base64
from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

# Load reference image
REF_PATH = "/Users/yuki/Downloads/k4_aerial.webp"
ref_bytes = Path(REF_PATH).read_bytes()
REF = types.Part.from_bytes(data=ref_bytes, mime_type="image/webp")

BASE = (
    "STYLE REFERENCE: match this exact architectural style — "
    "white corrugated shipping containers with black aluminum grid windows, "
    "cedar wood decking, white shade sail membrane stretched diagonally between two 2-story wings, "
    "barrel sauna visible on right side, Hokkaido green grassland and mountains. "
    "Same compound, different scenario. "
)

SHOTS = [
    ("k4_ref_aerial_day",
     "Drone aerial photo identical viewpoint to the reference, golden hour summer. "
     "Add: infinity pool extending south from the courtyard (heated, steam rising slightly). "
     "Keep everything else identical to the reference photo. Hokkaido mountains backdrop. "),

    ("k4_ref_night",
     "Same compound at night. "
     "Left rooftop deck: string lights glowing, people with drinks. "
     "Right wing roof: solar panels dark. "
     "Courtyard under membrane: purple DJ lighting from 2F, billiards table visible. "
     "Sauna on right side: orange glow from glass door. "
     "Spa/hot tub on right: steam rising. "
     "Milky Way visible through open south end. "
     "Overall: warm amber vs cool purple, dramatic contrast. "),

    ("k4_ref_winter",
     "Same compound in deep Hokkaido winter. "
     "Snow on all container rooftops. Snow on the cedar deck. "
     "The diagonal shade sail has snow accumulated on it. "
     "Sauna on right: heavy steam rising into cold air. "
     "Spa bubbling. "
     "Snowmobile parked at right side. "
     "Blue-grey winter dusk. Snow falling lightly. "
     "Warm interior lights glow through the grid windows. "),

    ("k4_ref_party",
     "Same compound at night, party mode. "
     "Courtyard under membrane: full party setup. "
     "Purple and amber lighting from Hue strips. "
     "People visible through the large glass doors. "
     "Left rooftop deck: people with drinks, string lights. "
     "2F left wing: DJ booth glass window glowing purple-blue. "
     "Sauna orange-glowing on right. Hot tub steaming. "
     "Energy: private luxury party in the wilderness. "),

    ("k4_ref_interior_court",
     "Eye-level photo from INSIDE the courtyard looking SOUTH toward the open end. "
     "The diagonal white shade sail overhead. Cedar deck underfoot. "
     "Left: glass sliding doors of left wing open, interior warm. "
     "Right: glass doors of right wing. "
     "South: the courtyard opens to Hokkaido grassland and mountains. "
     "On the deck: white EVA jiu-jitsu mats spread out. "
     "Right side outside: barrel sauna visible, spa. "
     "White corrugated container walls. Black aluminum frames. "
     "Beautiful perspective showing the whole space. "),

    ("k4_ref_rooftop",
     "View FROM the left wing rooftop deck looking south. "
     "In foreground: outdoor sectional sofa, string lights, potted plants. "
     "Below: the courtyard with white shade sail, cedar deck. "
     "Beyond: Hokkaido grassland, mountains, sunset sky. "
     "Right: the other 2-story wing with solar panels. "
     "Far right: barrel sauna and spa. "
     "Golden hour light. "),

    ("k4_ref_sauna_spa",
     "Close up of the right side of the compound. "
     "Cedar barrel sauna (round, classic proportions) with warm amber interior glow. "
     "Next to it: rectangular spa/jacuzzi tub, dark water, steam rising. "
     "White corrugated container wall behind. "
     "Solar panels visible on upper right. "
     "Hokkaido green grassland beyond. "
     "Golden hour or dusk light. "),

    ("k4_ref_street",
     "Eye-level view from the south approach road, looking north at the compound. "
     "Same architectural style as reference. "
     "Full facade: left 2-story wing, right 2-story wing, diagonal white membrane between. "
     "Cedar deck in foreground. Gravel approach. "
     "Ferrari (red) or Harley-Davidson parked on gravel in foreground. "
     "Mountains behind the compound. Golden hour. "),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_jpg): os.remove(out_jpg)
    print(f"→ {name}", flush=True)
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL,
                contents=[REF, BASE + prompt],
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"])
            )
            for part in r.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(part.inline_data.data)
                    subprocess.run(["cwebp","-q","92",out_jpg,"-o",out_webp],
                                   check=True, capture_output=True)
                    os.remove(out_jpg)
                    kb = os.path.getsize(out_webp)//1024
                    print(f"  ✓ {name}.webp {kb}KB", flush=True)
                    return True
            print(f"  no image (attempt {attempt+1})", flush=True)
        except Exception as e:
            print(f"  error: {e}", flush=True)
            time.sleep(8)
    return False

ok = fail = 0
for name, prompt in SHOTS:
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(5)
print(f"\nDone: {ok} ok, {fail} fail")
