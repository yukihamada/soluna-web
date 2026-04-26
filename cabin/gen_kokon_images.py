#!/usr/bin/env python3
"""Generate Yakiniku Kokon BBQ images using Gemini"""
import os, base64, json, urllib.request, urllib.error

API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    # Try reading from .env
    env_path = os.path.expanduser("~/.env")
    if os.path.exists(env_path):
        for line in open(env_path):
            line = line.strip()
            if line.startswith("GEMINI_API_KEY=") or line.startswith("GOOGLE_API_KEY="):
                API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not found")
    exit(1)

print(f"Using API key: {API_KEY[:8]}...")

PROMPTS = [
    {
        "name": "kokon_wagyu_grill",
        "prompt": "Cinematic close-up photograph of premium Japanese wagyu beef A5 slices sizzling on a traditional charcoal yakiniku grill. Glowing orange charcoal beneath, thin wisps of aromatic smoke rising. Dark moody background, dramatic low lighting. High-end restaurant quality. Rich golden-brown meat, visible marbling. Night atmosphere."
    },
    {
        "name": "kokon_outdoor_bbq_hokkaido",
        "prompt": "Atmospheric outdoor yakiniku BBQ dinner scene in Hokkaido wilderness at night. Charcoal grill glowing on a wooden deck surrounded by birch trees and dark forest. Milky Way visible in the starry sky above. Elegant table setting with wagyu beef, sake glasses, candles. Private exclusive dining experience. Cinematic photography, dark moody tones."
    },
    {
        "name": "kokon_wagyu_plate",
        "prompt": "Elegant plating of premium Japanese wagyu beef for yakiniku. Thinly sliced A5 wagyu arranged artfully on a dark slate plate, garnished with fresh herbs and sea salt. Background shows a rustic wood cabin interior with soft candlelight. Dark background, dramatic lighting. Fine dining presentation, bokeh effect."
    },
]

OUTPUT_DIR = "/Users/yuki/workspace/teshikaga-cabin/img"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key={API_KEY}"

for item in PROMPTS:
    print(f"\nGenerating: {item['name']}...")
    payload = json.dumps({
        "contents": [{"parts": [{"text": item["prompt"]}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
    }).encode()

    req = urllib.request.Request(URL, data=payload,
        headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())

        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        saved = False
        for part in parts:
            if "inlineData" in part:
                img_data = base64.b64decode(part["inlineData"]["data"])
                mime = part["inlineData"].get("mimeType", "image/png")
                ext = "jpg" if "jpeg" in mime else "png"
                path = f"{OUTPUT_DIR}/{item['name']}.{ext}"
                with open(path, "wb") as f:
                    f.write(img_data)
                print(f"  Saved: {path} ({len(img_data)//1024}KB)")
                saved = True
                break
        if not saved:
            print(f"  No image in response. Keys: {list(data.keys())}")
            if "candidates" in data:
                print(f"  Parts: {[list(p.keys()) for p in parts]}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP {e.code}: {body[:300]}")
    except Exception as e:
        print(f"  Error: {e}")

print("\nDone!")
