#!/usr/bin/env python3
"""Generate renovation AFTER images based on actual BEFORE property photos."""

import os
import sys
import base64
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    # try reading from ~/.env
    env_path = Path.home() / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("GOOGLE_API_KEY=") or line.startswith("GEMINI_API_KEY="):
                API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not API_KEY:
    print("ERROR: No API key found")
    sys.exit(1)

client = genai.Client(api_key=API_KEY)
IMG_DIR = Path("/Users/yuki/workspace/soluna-web/cabin/img")

tasks = [
    {
        "before": "wakayama_real_nachi1.jpg",
        "out": "wakayama_after_exterior.webp",
        "prompt": (
            "This is a BEFORE photo of an old Japanese house in Nachikatsuura, Wakayama. "
            "Generate an AFTER photo showing this exact same building beautifully renovated. "
            "Keep the same building shape, same site, same surrounding landscape. "
            "Renovation style: dark charcoal wood cladding replacing the old brown panels, "
            "new deep eaves with subtle LED lighting, simple zen gravel garden added in front, "
            "new dark aluminum window frames replacing old aluminum, "
            "clean black downpipes, lush green moss on the stone retaining wall. "
            "Shoot from same angle as the original photo. Late afternoon golden hour light. "
            "Photorealistic, architectural photography quality."
        ),
    },
    {
        "before": "wakayama_real_nachi9.jpg",
        "out": "wakayama_after_interior.webp",
        "prompt": (
            "This is a BEFORE photo of an old Japanese tatami room interior in Wakayama. "
            "Generate an AFTER photo showing this exact same room beautifully renovated. "
            "Keep the same room layout, same window positions, same wooden ceiling beams. "
            "Renovation style: keep the exposed wooden ceiling beams but clean and oiled, "
            "remove the old furniture, replace tatami with sleek polished concrete or light oak flooring, "
            "new minimal Japanese paper shoji screens at the same window positions, "
            "a low platform bed with white linen, warm indirect LED lighting hidden in ceiling, "
            "a single bonsai or ikebana as accent. Same camera angle as original photo. "
            "Photorealistic, luxury interior architecture photography."
        ),
    },
    {
        "before": "teshikaga_real_97.jpg",
        "out": "teshikaga_after_exterior.webp",
        "prompt": (
            "This is a BEFORE photo of an old house in Teshikaga, Hokkaido, Japan in winter with snow. "
            "Generate an AFTER photo showing this exact same building beautifully renovated. "
            "Keep the same building footprint, shape, and the snowy Hokkaido landscape with birch trees. "
            "Renovation style: replace the old siding with dark charcoal weathered cedar cladding, "
            "new large triple-glazed windows where the old ones were, "
            "same dark metal roof but cleaner, "
            "warm amber interior light glowing from windows, "
            "simple wooden deck added at entrance, "
            "outdoor wood stack beside the door, "
            "snow on the ground same as original. Same camera angle. "
            "Photorealistic, architectural photography quality, winter evening light."
        ),
    },
    {
        "before": "teshikaga_real_97.jpg",
        "out": "teshikaga_after_interior.webp",
        "prompt": (
            "This is a BEFORE photo of an old house exterior in Teshikaga, Hokkaido. "
            "Generate an AFTER photo showing the INTERIOR of this same building renovated as a luxury cabin. "
            "Style: exposed structural wooden beams on ceiling, "
            "polished concrete floor with underfloor heating, "
            "large wood-burning stove in center with black flue pipe, "
            "floor-to-ceiling windows looking out at Hokkaido birch forest and snow, "
            "two low leather armchairs facing the stove, "
            "warm amber lighting from ceiling pendants, "
            "simple pine shelving with books and single whisky glass. "
            "Photorealistic, luxury cabin interior photography."
        ),
    },
]


def load_image(path: Path) -> bytes:
    return path.read_bytes()


def generate_after(task: dict) -> None:
    before_path = IMG_DIR / task["before"]
    out_path = IMG_DIR / task["out"]

    print(f"\nGenerating {task['out']} from {task['before']}...")
    image_bytes = load_image(before_path)

    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            task["prompt"],
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    saved = False
    for part in response.candidates[0].content.parts:
        if part.inline_data and part.inline_data.mime_type.startswith("image/"):
            img_data = part.inline_data.data
            if isinstance(img_data, str):
                img_data = base64.b64decode(img_data)
            out_path.write_bytes(img_data)
            size_kb = len(img_data) // 1024
            print(f"  ✓ {task['out']} ({size_kb}KB)")
            saved = True
            break

    if not saved:
        text_parts = [p.text for p in response.candidates[0].content.parts if hasattr(p, "text") and p.text]
        print(f"  ✗ No image in response. Text: {' '.join(text_parts)[:200]}")


for task in tasks:
    try:
        generate_after(task)
    except Exception as e:
        print(f"  ERROR: {e}")

print("\nDone.")
