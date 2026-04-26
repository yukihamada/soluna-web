#!/usr/bin/env python3
"""Generate Tokyo opening scene for CLUB K4 PV"""
import os, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

SHOTS = [
    ("k4_pv_tokyo_night",
     "Cinematic photograph. Night cityscape of Tokyo, viewed from inside a luxury high-rise apartment. "
     "Floor-to-ceiling glass windows. City lights stretching to infinity. "
     "A man in his 30s, back to camera, holding a whiskey glass, looking out at the city. "
     "Moody, blue-grey tones. Bored. Restless. He has everything but something is missing. "
     "8K quality, film grain, anamorphic lens."),

    ("k4_pv_friends_shocked",
     "Cinematic photograph. Group of four stylish Japanese men and women in their 30s, "
     "sitting around a table at a bar in Tokyo. "
     "One person is showing their phone to the others. "
     "Everyone's expression: completely shocked, mouths open, leaning in. "
     "One person pointing at the phone looking amazed. "
     "Warm bar lighting. Shallow depth of field. Film look, 35mm."),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    print(f"→ {name}", flush=True)
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for part in r.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(part.inline_data.data)
                    subprocess.run(["cwebp","-q","92",out_jpg,"-o",out_webp],check=True,capture_output=True)
                    os.remove(out_jpg)
                    kb = os.path.getsize(out_webp)//1024
                    print(f"  ✓ {name}.webp {kb}KB", flush=True)
                    return True
            print(f"  no image (attempt {attempt+1})", flush=True)
        except Exception as e:
            print(f"  error: {e}", flush=True)
            import time; time.sleep(8)
    return False

for name, prompt in SHOTS:
    gen(name, prompt)
print("Done")
