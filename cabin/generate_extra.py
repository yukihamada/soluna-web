#!/usr/bin/env python3
"""Generate additional experience images."""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

prompts = {
    "jiujitsu": (
        "Two people practicing Brazilian jiu-jitsu outdoors on mats in a beautiful Hokkaido forest clearing. "
        "Morning light through birch trees. They wear white gis. A dog watches from nearby. "
        "Modern dark wood cabins visible in the background. Peaceful, athletic atmosphere. "
        "Magazine quality sports photography."
    ),
    "food_pizza": (
        "Close-up of a wood-fired pizza being pulled from a rustic outdoor pizza oven, "
        "in a Hokkaido forest setting. Fresh local ingredients visible: tomatoes, cheese, basil. "
        "A bonfire and string lights in the background. Evening golden hour. "
        "Rustic luxury food photography. Magazine quality."
    ),
    "dog_forest": (
        "A happy golden retriever running freely through a Hokkaido birch forest in autumn. "
        "Golden leaves on the ground. A modern dark wood cabin visible in the background. "
        "Warm sunlight filtering through trees. Joy and freedom. "
        "Lifestyle pet photography, magazine quality."
    ),
    "koe_speaker": (
        "A small, elegant cylindrical wireless speaker device mounted on a birch tree trunk in a forest. "
        "Minimalist design, dark matte finish with a subtle green LED ring. "
        "The forest is bathed in warm evening light. Other speakers visible on distant trees. "
        "The concept of distributed sound in nature. Product photography in environment."
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
                print(f"  Saved: {OUT}/{name}.{ext}")
                break
        else:
            print(f"  No image for {name}")
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(2)
print("Done!")
