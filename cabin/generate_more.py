#!/usr/bin/env python3
"""Generate additional images for clarity."""
import os, time
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

prompts = {
    "hondajet": (
        "A sleek white HondaJet private jet parked on a small rural airstrip in Hokkaido. "
        "Snow-capped mountains in background. A couple with a golden retriever walking toward the jet. "
        "Luxury lifestyle. Clear blue sky. Cinematic wide shot. Magazine quality."
    ),
    "atami": (
        "A beautiful traditional-modern Japanese villa with an outdoor onsen (hot spring bath) "
        "overlooking the Pacific Ocean in Atami, Japan. Steam rising from the wooden bath. "
        "Cherry blossom trees nearby. Warm sunset light. Luxury ryokan aesthetic. "
        "Architectural photography, magazine quality."
    ),
    "kamiyama": (
        "Vast rolling green hills and forest in rural Japan, aerial drone photograph. "
        "A single modern dark cabin visible among the trees on a hilltop. "
        "100,000 tsubo of pristine untouched land. Morning mist in the valleys. "
        "Dramatic landscape photography. The sense of owning an entire mountain."
    ),
    "use_day": (
        "A family of four relaxing inside a luxury minimalist cabin. Father reading by a wood stove, "
        "mother and children playing on the floor. A golden retriever sleeping nearby. "
        "Large window showing snowy birch forest. Warm indirect lighting. Cedar ceiling. "
        "The feeling of home, not a hotel. Lifestyle photography."
    ),
    "earn_day": (
        "An elegant couple checking into a luxury dark-wood cabin in a forest. "
        "A concierge in black uniform greeting them at the door. The cabin glows warmly inside. "
        "String lights along the wooden walkway. Evening. Premium hospitality. "
        "The feeling of a boutique hotel. Magazine quality."
    ),
    "bonfire_night": (
        "People gathered around a large bonfire in a Hokkaido birch forest at night. "
        "String lights overhead. Dark modern cabins with glowing windows in background. "
        "Someone playing guitar. Wine glasses. Stars visible. Dogs lying by the fire. "
        "Warm, intimate, community. Lifestyle photography."
    ),
    "sauna_water": (
        "A person plunging into a cold water bath (wooden barrel) next to a modern tower sauna "
        "in a snowy Hokkaido forest. Steam rising from their body. Birch trees covered in snow. "
        "The contrast of heat and cold. Dramatic action shot. Wellness photography."
    ),
    "cabin_morning": (
        "Morning light streaming through large windows of a modern cabin bedroom. "
        "Simple white linen bed. Cedar plank ceiling. A cup of coffee on the windowsill. "
        "Snowy forest visible outside. A dog sleeping at the foot of the bed. "
        "Peaceful, minimal, warm. Interior photography."
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
                path = f"{OUT}/{name}.{ext}"
                with open(path, "wb") as f:
                    f.write(part.inline_data.data)
                print(f"  Saved: {name}")
                break
        else:
            print(f"  No image")
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(2)
print("Done!")
