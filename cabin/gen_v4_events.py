#!/usr/bin/env python3
"""v4 event shots: 漆喰塗りWork Party + company founder"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
BASE = ("Architectural photography, magazine quality. White stucco RAL 9016 containers. "
        "Hokkaido Japan highland. ")

SHOTS = [
    ("k4_shikkui_party",
     "Documentary photography. Autumn day in Hokkaido. "
     "A group of 8-10 diverse people (men and women, 25-45 years old, casual clothes with aprons) "
     "are hand-plastering white lime plaster (漆喰) directly onto the exterior of white shipping containers. "
     "They are using traditional Japanese trowels (左官鏝) and paint rollers. "
     "Some people laugh, some focus carefully. "
     "Buckets of white plaster on the cedar deck. "
     "The containers are in U-shape formation on a Hokkaido hilltop — grassland and mountains beyond. "
     "Warm autumn afternoon light. A few patches are fresh-plastered bright white, "
     "older patches are slightly weathered. "
     "Energy: joyful community work, like a barn raising. "
     "One person has plaster on their cheek and is smiling. "
     "Photography style: reportage, candid, warm tones. "),

    ("k4_shikkui_closeup",
     "Close-up macro photograph. Hands applying white lime plaster (漆喰) "
     "with a stainless Japanese trowel onto a shipping container wall. "
     "The plaster is wet and textured, handmade marks visible. "
     "Background: blurred Hokkaido mountain panorama. "
     "Warm afternoon light catches the fresh plaster surface. "
     "Artisanal, handmade quality. Beautiful imperfection. "
     "Photography style: editorial macro, shallow depth of field. "),

    ("k4_founder",
     "Editorial portrait photography. A Japanese man in his late 30s, "
     "athletic build (jiu-jitsu practitioner), wearing a simple white linen shirt, "
     "standing at the edge of a Hokkaido hilltop at golden hour. "
     "Behind him: the white container compound with the retractable PTFE membrane roof. "
     "He looks into the distance at the mountain panorama. Confident, visionary expression. "
     "The light is warm and cinematic. "
     "Photography style: magazine portrait, environmental, thoughtful. "),

    ("k4_team_workparty",
     "Wide angle group photo. 10 people standing in front of white container compound "
     "at sunset in Hokkaido. They are wearing casual clothes and aprons, "
     "holding plastering tools and drinks. Everyone is smiling and laughing. "
     "The containers behind them are freshly plastered white. "
     "Cedar deck, mountains in background. Golden hour light. "
     "Celebratory, community spirit. "
     "Photography style: warm, documentary, wide. "),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    if os.path.exists(out_jpg): os.remove(out_jpg)
    print(f"→ {name}", flush=True)
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for part in r.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(part.inline_data.data)
                    subprocess.run(["cwebp","-q","92",out_jpg,"-o",out_webp],
                                   check=True,capture_output=True)
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
    time.sleep(4)
print(f"\nDone: {ok} ok, {fail} fail")
