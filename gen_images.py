#!/usr/bin/env python3
"""Generate hero + feature images for SOLUNA artist landing page using Gemini."""
import os, base64, json, urllib.request, urllib.error

GEMINI_KEY = "AIzaSyDrt1QWRPIQ19F9o69EpbnmInDSxkRdsLg"
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "images")
os.makedirs(OUT_DIR, exist_ok=True)

MODEL = "gemini-3.1-flash-image-preview"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={GEMINI_KEY}"

IMAGES = [
    ("hero_bg", "Dark cinematic music festival stage at night, deep purple and gold haze, laser beams cutting through fog, DJ silhouette, 16:9 ultra-wide, no text, photorealistic, dramatic atmospheric lighting, crowd glow in distance"),
    ("feature_instant", "Abstract glowing music waveform exploding into particles, dark background, electric gold and cyan colors, no text, digital art"),
    ("feature_cover", "AI robot hand painting a vinyl record album cover with cosmic brushstrokes, dark studio, golden light, no text, cinematic"),
    ("feature_rights", "Digital lock made of musical notes and sound waves, glowing blue and gold, dark background, abstract tech art, no text"),
    ("feature_radio", "Radio antenna tower in the clouds transmitting music waves across the globe at night, aurora borealis, gold and purple, no text"),
    ("feature_royalty", "Gold coins raining down into music headphones on a dark table, cinematic macro photography, warm bokeh, no text"),
    ("artist_life", "Artist in dark recording studio, laptop open showing waveforms, moody purple backlight, focus and passion, photorealistic, no text"),
]

def generate(name: str, prompt: str) -> bool:
    out_path = os.path.join(OUT_DIR, f"{name}.jpg")
    if os.path.exists(out_path):
        print(f"  skip {name} (exists)")
        return True

    body = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]}
    }).encode()

    req = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {name}: {e.code} {e.read()[:200]}")
        return False

    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    img_part = next((p for p in parts if "inlineData" in p), None)
    if not img_part:
        print(f"  NO IMAGE for {name}: {str(data)[:200]}")
        return False

    raw = base64.b64decode(img_part["inlineData"]["data"])
    with open(out_path, "wb") as f:
        f.write(raw)
    print(f"  OK {name} ({len(raw)//1024}KB)")
    return True

print(f"Generating {len(IMAGES)} images...")
for name, prompt in IMAGES:
    generate(name, prompt)
print("Done.")
