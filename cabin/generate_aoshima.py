#!/usr/bin/env python3
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

prompts = {
    "aoshima_pool": (
        "A stunning luxury villa with a private infinity pool overlooking the Pacific Ocean "
        "in Miyazaki, Japan at sunset. Modern concrete architecture with floor-to-ceiling glass. "
        "A terrace of 560 square meters. Tropical plants. Warm evening light reflecting on the pool. "
        "The ultimate luxury retreat. Architectural Digest cover quality."
    ),
    "aoshima_interior": (
        "Interior of an ultra-luxury modern villa. Double-height living room with concrete walls "
        "and warm wood accents. A large fireplace burning. Floor-to-ceiling windows showing "
        "ocean view at dusk. Designer furniture. Minimal but warm. "
        "A couple relaxing on a sofa with wine. Vogue Living quality."
    ),
}

for name, prompt in prompts.items():
    print(f"Generating {name}...")
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=prompt,
            config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                ext = part.inline_data.mime_type.split("/")[-1]
                with open(f"{OUT}/{name}.{ext}", "wb") as f:
                    f.write(part.inline_data.data)
                print(f"  Saved")
                break
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(2)
print("Done!")
