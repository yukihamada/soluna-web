#!/usr/bin/env python3
"""
美留和グランド コンテナ複合棟 画像生成
参考: ルーフデッキ+ウォータースライダー+プール+柔術コートヤード+望遠鏡
"""
import os, base64, json, urllib.request
from pathlib import Path

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAg-uxbOhwYEFp0WqSnlQKJ4oje59xNr-E")
IMG_DIR = Path("/Users/yuki/workspace/teshikaga-cabin/img")

SHOTS = [
    {
        "name": "miruwa_container_aerial",
        "prompt": (
            "Aerial drone shot from 45-degree angle, golden hour, Hokkaido grassland, Japan. "
            "A luxury white shipping container complex in U-shape, 2 stories tall. "
            "Rooftop terrace on top with: outdoor cinema projection screen (large white screen), "
            "Netflix display mounted on container wall showing colorful interface, "
            "astronomical telescope on tripod, lounge chairs, people doing BJJ/judo in gi in the center courtyard. "
            "On the right side: large stainless steel water slide spiraling down from rooftop to ground. "
            "Long rectangular infinity pool alongside the right wing of containers. "
            "BBQ grill station at the left corner. "
            "Hammock strung in the courtyard. "
            "Inside courtyard visible through glass: sauna barrel, hot tub. "
            "Surrounding: vast Hokkaido rolling grassland, distant mountains (Akan, Mashu direction). "
            "All containers painted white, industrial-luxe aesthetic. "
            "Photorealistic, cinematic, 8K, anamorphic, breath-taking."
        )
    },
    {
        "name": "miruwa_container_rooftop",
        "prompt": (
            "Eye-level shot from rooftop terrace of white shipping container complex, Hokkaido Japan. "
            "Standing on the rooftop deck looking across: "
            "Large outdoor cinema screen (blank white) on left, "
            "Netflix 65-inch TV display showing homepage mounted on container wall, "
            "Astronomical telescope (white) pointed at sky, "
            "Comfy lounge chairs and low table, "
            "Person in BJJ gi looking relaxed with shisha. "
            "Below in the courtyard: two people sparring BJJ. "
            "Far background: Hokkaido golden grassland, rolling hills, mountains at horizon, dramatic sunset clouds. "
            "Magic hour light, golden sky. Photorealistic, ultra-wide lens, cinematic."
        )
    },
    {
        "name": "miruwa_container_slide_pool",
        "prompt": (
            "Ground-level wide shot, Hokkaido grassland. "
            "White shipping container 2-story complex. "
            "Focus on the right side: shiny stainless steel spiral water slide running from 2nd floor down to ground. "
            "Person sliding down laughing. "
            "Long lap pool (25m, crystal blue water) integrated alongside the container. "
            "Pool overflows at edge giving infinity effect over grassland and mountains. "
            "Afternoon light, reflections in pool water. "
            "BBQ grill visible at corner with smoke. "
            "Photorealistic, cinematic, 8K, dramatic."
        )
    },
    {
        "name": "miruwa_container_dusk",
        "prompt": (
            "Dusk exterior shot, blue hour, Hokkaido. "
            "White container complex glowing: warm amber light from interior through glass walls. "
            "Rooftop deck softly lit with string lights. "
            "Netflix screen glowing blue-orange. "
            "Telescope silhouetted against purple-orange sky. "
            "Pool reflects the sky and lights. "
            "Stars beginning to appear. "
            "Smoke from sauna visible. "
            "People silhouetted on rooftop. "
            "Moody, cinematic, photorealistic, beautiful."
        )
    },
    {
        "name": "miruwa_container_courtyard_bjj",
        "prompt": (
            "Interior courtyard view of white container complex, Hokkaido Japan. "
            "Glass-walled BJJ/judo dojo area in center: two people in white gi sparring on white mat, "
            "instructor watching in blue gi. "
            "White EVA mat covers the floor. "
            "Through glass wall you can see the pool and grassland beyond. "
            "Hammock strung between containers. "
            "Overhead: clear sky or open membrane canopy. "
            "Warm afternoon light. Photorealistic, cinematic. "
            "Clean, luxurious, architectural photography style."
        )
    },
]

def generate_image(shot):
    out_path = IMG_DIR / f"miruwa_container_{shot['name']}.jpg"
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
    print("=== 美留和 コンテナ複合棟 画像生成 ===")
    for shot in SHOTS:
        generate_image(shot)
    print("Done.")
