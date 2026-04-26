#!/usr/bin/env python3
"""
美留和グランド 大型D型ハウス 画像生成
D型ハウス = D字型断面の大型ドラム建築（半円柱形）
"""
import os, base64, json, urllib.request
from pathlib import Path

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAg-uxbOhwYEFp0WqSnlQKJ4oje59xNr-E")
IMG_DIR = Path("/Users/yuki/workspace/teshikaga-cabin/img")

SHOTS = [
    {
        "name": "d_house_exterior_day",
        "prompt": (
            "Exterior wide shot, golden hour, Hokkaido grassland, Japan. "
            "A massive D-shaped architectural house — D-shape in cross-section: "
            "the curved side faces forward with floor-to-ceiling curved glass panels, "
            "the flat back wall is solid white concrete, "
            "the building is 20 meters wide and 12 meters tall. "
            "The curved facade glows warm amber from interior lighting. "
            "The structure sits alone on a vast rolling green Hokkaido hilltop, "
            "wild grass in the foreground, dramatic clouds and mountains at the horizon. "
            "Ultra-modern, brutalist-organic hybrid architecture. "
            "Photorealistic, cinematic, 8K, anamorphic lens, breath-taking."
        )
    },
    {
        "name": "d_house_interior",
        "prompt": (
            "Interior shot of a D-shaped architectural house, Hokkaido Japan. "
            "Looking from inside toward the curved glass facade wall: "
            "the D-curve interior is a single vast open hall, 20m wide, 12m tall. "
            "Curved ceiling follows the D arc — exposed white concrete with wood ribs. "
            "The entire curved facade is floor-to-ceiling glass, "
            "showing panoramic view of Hokkaido grassland and rolling hills beyond. "
            "Interior: polished concrete floor, minimal furniture — long communal table, "
            "lounge area with low sofas, a grand piano in the corner, "
            "warm pendant lights hanging from the curved ceiling. "
            "Afternoon light flooding through the glass. "
            "Photorealistic, architectural photography, 8K, wide angle."
        )
    },
    {
        "name": "d_house_aerial",
        "prompt": (
            "Aerial bird's eye view, directly from above, Hokkaido grassland. "
            "A large D-shaped building: perfectly visible D cross-section from above "
            "— the flat side is a solid white wall, the curved side is curved glass. "
            "The roof is a smooth white arc. "
            "Building is 20m wide, surrounded by manicured grass paths. "
            "Near the D-house: the white container complex (U-shape) is visible nearby "
            "on the same Hokkaido hilltop compound. "
            "Long shadows from late afternoon sun. "
            "Photorealistic, drone shot, 8K, cinematic."
        )
    },
    {
        "name": "d_house_night",
        "prompt": (
            "Night exterior shot, Hokkaido grassland, clear sky full of stars. "
            "The D-shaped house glows brilliantly: "
            "the entire curved glass facade illuminated warm amber from inside, "
            "the D-shape glows like a giant lantern in the dark. "
            "Milky Way visible above. "
            "People silhouetted inside through the glass. "
            "Reflections of stars in a small pond nearby. "
            "The flat white concrete back wall catches moonlight. "
            "Photorealistic, cinematic, moody, 8K, ultra-wide."
        )
    },
    {
        "name": "d_house_winter",
        "prompt": (
            "Winter exterior shot, Hokkaido, deep snow, blue sky. "
            "The D-shaped house covered in snow on its curved roof "
            "— a perfect white arc shape dusted with fresh snow. "
            "The curved glass facade reflects blue sky. "
            "Smoke from a chimney rises in crisp winter air. "
            "Snow stretches endlessly in all directions. "
            "Warm orange glow from interior visible through glass. "
            "Ski tracks approaching the entrance. "
            "Photorealistic, cinematic, 8K, stunning winter landscape."
        )
    },
]

def generate_image(shot):
    out_path = IMG_DIR / f"miruwa_dhouse_{shot['name']}.jpg"
    if out_path.exists():
        print(f"  skip: {out_path.name}")
        return out_path

    print(f"  generating: {shot['name']}...")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={API_KEY}"
    payload = json.dumps({
        "contents": [{"parts": [{"text": shot["prompt"]}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
    }).encode()

    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

    for part in data.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        if "inlineData" in part:
            img_bytes = base64.b64decode(part["inlineData"]["data"])
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            print(f"  saved: {out_path.name} ({len(img_bytes)//1024}KB)")
            return out_path
    print(f"  no image in response")
    return None

if __name__ == "__main__":
    print("=== 美留和 D型ハウス 画像生成 ===")
    for shot in SHOTS:
        generate_image(shot)
    print("Done.")
