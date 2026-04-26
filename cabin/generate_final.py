#!/usr/bin/env python3
"""Generate final SOLUNA brand images."""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

prompts = {
    "soluna_hero_wide": (
        "Ultra wide cinematic aerial photograph of a stunning modern black cabin village "
        "nestled in a birch forest beside a caldera lake in Hokkaido Japan at golden hour. "
        "5 dark charred cedar cabins with warm glowing windows scattered among trees. "
        "A wooden boardwalk connects them. Mist rising from the lake. "
        "Snow-capped mountains in the far background. Dramatic sky. "
        "Shot on medium format camera. Architectural Digest quality. 21:9 aspect ratio."
    ),
    "tapkop_luxury": (
        "Interior of an ultra-luxury minimalist Japanese villa at night. "
        "Floor to ceiling windows showing a snowy Hokkaido forest. "
        "Wood-burning fireplace glowing. Warm indirect lighting. "
        "Simple but expensive furniture. Wine glasses on a low table. "
        "Wabi-sabi aesthetic meets Scandinavian design. "
        "Architectural photography, magazine quality."
    ),
    "owner_lifestyle": (
        "A couple and their golden retriever on the wooden deck of a modern dark cabin "
        "overlooking a misty caldera lake at sunrise in Hokkaido. "
        "The man holds coffee. The woman stretches. Morning light. "
        "Solar panels visible on the cabin roof. An EV car parked nearby. "
        "Aspirational lifestyle photography. Calm, wealthy, free."
    ),
    "earn_concept": (
        "Split image concept: left side shows a family enjoying a luxury cabin interior "
        "with warm fireplace and wine, right side shows a smartphone screen displaying "
        "a calendar app with green dollar signs on dates. "
        "The concept of 'use it or earn from it'. Clean modern design. "
        "Dark background, warm lighting on the left, cool digital glow on the right."
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
        else:
            print(f"  No image")
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(2)
print("Done!")
