#!/usr/bin/env python3
"""
熊牛原野 ワイドショット生成 + 動画化
引きの映像：ドームハウス・大型コンテナ複合施設の全景
"""
import os, subprocess, base64, json, urllib.request, urllib.error
from pathlib import Path

API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAg-uxbOhwYEFp0WqSnlQKJ4oje59xNr-E")
IMG_DIR = Path("/Users/yuki/workspace/teshikaga-cabin/img")
PV_DIR  = Path("/Users/yuki/workspace/teshikaga-cabin/pv")
PV_DIR.mkdir(exist_ok=True)

# --- プロンプト定義 ---
SHOTS = [
    {
        "name": "wide_aerial_full",
        "prompt": (
            "Ultra-wide aerial drone shot, 200 meters altitude, looking down at 45-degree angle. "
            "Remote Hokkaido grassland hilltop, Japan. "
            "A private compound: 12 white shipping containers arranged in asymmetric U-shape courtyard, "
            "2 geodesic dome structures (8m diameter, white ETFE membrane) nearby, "
            "a large tensile PTFE membrane canopy covering the central courtyard (120sqm), "
            "infinity pool glinting at the south edge, "
            "rooftop deck on west wing, solar panels on roof. "
            "Surrounded by vast rolling Hokkaido grassland, no other buildings for 2km. "
            "Distant mountains (Mt. Akan, Mashu lake direction). "
            "Late afternoon golden hour light. "
            "Cinematic, photorealistic, 8K quality, wide angle lens."
        )
    },
    {
        "name": "wide_ground_domes",
        "prompt": (
            "Wide ground-level perspective shot from 80 meters away. "
            "Hokkaido remote hilltop compound, Japan. "
            "Left side: 2 large geodesic dome buildings (white polycarbonate panels, 8m tall). "
            "Center-right: 12 white shipping containers in U-shape, central courtyard visible through entrance, "
            "white PTFE tensile membrane canopy overhead, "
            "people (tiny silhouettes) visible in courtyard. "
            "Foreground: long grass, wildflowers. "
            "Sky: dramatic clouds, blue sky. "
            "Ultra-cinematic, golden hour, photorealistic, anamorphic lens flare."
        )
    },
    {
        "name": "wide_dusk_lit",
        "prompt": (
            "Dusk exterior wide shot of remote Hokkaido compound. "
            "Blue hour sky, first stars appearing. "
            "Glowing compound: "
            "Shipping container complex (U-shape) with warm amber interior light spilling from windows, "
            "geodesic dome glowing like a lantern (warm white light from within), "
            "tensile membrane roof softly illuminated from below, "
            "infinity pool reflecting purple sky, "
            "bonfire in foreground courtyard, "
            "DJ music area 2nd floor glowing purple-blue. "
            "Wide angle, 150m away, slightly elevated angle. "
            "Photorealistic, moody, cinematic, 8K."
        )
    },
    {
        "name": "wide_snow_aerial",
        "prompt": (
            "Winter aerial shot, bird's eye view from 150m altitude. "
            "Hokkaido compound covered in snow. "
            "White shipping container complex in U-shape, snow on rooftops. "
            "Two geodesic domes with snow-frosted panels. "
            "Steam rising from outdoor hot spring pool. "
            "Snowmobile tracks across the white field. "
            "Surrounding grassland completely white, endless snow plains. "
            "Late afternoon winter light, long blue shadows. "
            "Spectacular, cinematic, ultra-wide, photorealistic."
        )
    },
    {
        "name": "wide_sunrise_scale",
        "prompt": (
            "Sunrise shot, ground level, 100m away looking northeast. "
            "Hokkaido private compound: "
            "Container cluster (12 units, U-shape) silhouetted against orange sunrise sky, "
            "dome structures flanking both sides, "
            "tensile canopy catching first light, "
            "foreground: morning mist over grassland, "
            "Mt. Mashu faintly visible in far distance. "
            "Ultra-wide 16mm equivalent lens. "
            "Epic scale, tiny human figures visible for scale. "
            "Cinematic, photorealistic, golden hour, breath-taking."
        )
    },
]

def generate_image(shot):
    out_path = IMG_DIR / f"kumaushi_wide_{shot['name']}.jpg"
    if out_path.exists():
        print(f"  skip (exists): {out_path.name}")
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
            # Save directly as jpg (no webp conversion needed)
            with open(out_path, "wb") as f:
                f.write(img_bytes)
            print(f"  saved: {out_path.name}")
            return out_path
    print(f"  no image in response")
    return None

def make_video(image_paths):
    """画像からケンバーンズ動画を生成"""
    out_video = PV_DIR / "kumaushi_wide.mp4"
    clips = []
    tmp_clips = []

    for i, img_path in enumerate(image_paths):
        if not img_path or not img_path.exists():
            continue
        clip_out = PV_DIR / f"clip_{i:02d}.mp4"
        tmp_clips.append(clip_out)

        # ケンバーンズ: ズームイン/アウト交互、スタート位置もバリエーション
        zoom_dirs = [
            # (zoom_start, zoom_end, x_drift, y_drift)
            (1.05, 1.0,  "iw/2",    "ih/2"),     # ズームアウト・中央
            (1.0,  1.05, "iw*0.45", "ih*0.45"),  # ズームイン・左上寄り
            (1.04, 1.0,  "iw*0.55", "ih*0.55"),  # ズームアウト・右下寄り
            (1.0,  1.06, "iw/2",    "ih*0.4"),   # ズームイン・上寄り
            (1.05, 1.0,  "iw*0.5",  "ih*0.6"),   # ズームアウト・下寄り
        ]
        zs, ze, cx, cy = zoom_dirs[i % len(zoom_dirs)]
        dur = 6.0  # 各クリップ6秒
        fps = 30
        frames = int(dur * fps)

        # zoompan フィルター
        zoom_expr = f"if(lte(on\\,1)\\,{zs}\\,min(zoom+({ze-zs:.4f}/{frames})\\,{max(zs,ze):.4f}))"
        vf = (
            f"scale=3840:2160,"
            f"zoompan=z='{zoom_expr}':x='({cx})*in_w-out_w/2':y='({cy})*in_h-out_h/2'"
            f":d={frames}:s=1920x1080:fps={fps},"
            f"fade=t=in:st=0:d=0.8:color=black,"
            f"fade=t=out:st={dur-0.8:.2f}:d=0.8:color=black"
        )

        subprocess.run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(img_path),
            "-vf", vf,
            "-t", str(dur),
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-preset", "fast", str(clip_out), "-loglevel", "error"
        ], check=True)
        clips.append(clip_out)
        print(f"  clip {i+1}/{len(image_paths)} done")

    if not clips:
        print("no clips generated")
        return

    # concat
    list_file = PV_DIR / "concat_wide.txt"
    with open(list_file, "w") as f:
        for c in clips:
            f.write(f"file '{c}'\n")

    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(list_file),
        "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-preset", "medium", "-crf", "20",
        str(out_video), "-loglevel", "error"
    ], check=True)

    # cleanup temp clips
    for c in tmp_clips:
        c.unlink(missing_ok=True)
    list_file.unlink(missing_ok=True)

    size_mb = out_video.stat().st_size / 1024 / 1024
    print(f"\nVideo: {out_video}  ({size_mb:.1f} MB)")
    return out_video

if __name__ == "__main__":
    print("=== 熊牛原野 ワイドショット生成 ===")
    paths = []
    for shot in SHOTS:
        p = generate_image(shot)
        paths.append(p)

    print("\n=== 動画生成 ===")
    generated = [p for p in paths if p and p.exists()]
    print(f"{len(generated)}/{len(SHOTS)} images available")
    make_video(generated)
    print("Done.")
