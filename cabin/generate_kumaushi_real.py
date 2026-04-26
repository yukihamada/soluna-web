#!/usr/bin/env python3
"""Generate REALISTIC product/construction photos for kumaushi build steps"""
import os, time, subprocess
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

REAL = ("Realistic smartphone photograph taken on iPhone 15 Pro. Natural lighting. "
        "Looks like a real photo posted on Instagram or a construction blog. "
        "NOT cinematic, NOT film grain, NOT color graded. Just a clean, honest photo. "
        "Sharp focus, natural colors, slight lens distortion. ")

SHOTS = [
    # Step 1: 置き基礎 — 実際のコンクリートブロック基礎
    ("step1_foundation",
     "Concrete pier block foundations on cleared flat ground. Simple gray concrete blocks "
     "(about 40cm x 40cm) arranged in two parallel rows on leveled dirt/gravel. "
     "A yellow measuring tape and laser level tool visible. Worker in blue work clothes "
     "checking level. Simple, unglamorous construction site. Grass around edges. Overcast sky. " + REAL),

    # Step 2: 実際のコンテナクレーン作業
    ("step2_container_crane",
     "A real 25-ton mobile crane lifting a matte black painted 20ft shipping container "
     "off a flatbed truck. The container has a door and window cut into the side, painted "
     "professionally. Real construction site on open flat land. Workers in white hard hats "
     "and safety vests. Crane boom at angle. Chains/straps attached to container corner castings. "
     "Muddy ground, tire tracks. Blue sky with clouds. " + REAL),

    # Step 3: 実際のコンテナハウス内装
    ("step3_container_interior",
     "Interior of a real, actually-built 20ft shipping container tiny home bedroom. "
     "Light birch plywood walls and ceiling panels. A real queen-size bed with white sheets "
     "and gray blanket. Small window at the end with actual view outside. Warm LED downlights "
     "recessed in ceiling. Built-in wardrobe with sliding door. Very compact but well designed. "
     "Real materials, real textures. Looks like a photo from a container house maker's portfolio. " + REAL),

    # Step 4: 実際のEPSドーム組立
    ("step4_dome_assembly",
     "Real construction photo of workers assembling a white EPS (expanded polystyrene / styrofoam) "
     "dome house. The dome is partially built — you can see the interlocking white foam panels "
     "being stacked. Workers wearing hard hats, one on a small ladder. The panels are large "
     "white curved sections, very lightweight. Real construction site, some tools on the ground. "
     "Clear day. Looks like a photo from a Japanese EPS dome manufacturer's website. " + REAL),

    # Step 5: 実際のテンション膜
    ("step5_membrane_stretch",
     "Real photo of a tensile membrane structure / shade sail being installed. White PTFE fabric "
     "stretched over steel mast poles. Workers pulling cables tight. The membrane has elegant "
     "curves. Steel posts are simple round tubes with base plates. Turnbuckles and steel cables "
     "visible. Outdoor setting. Looks like a photo from a tent/membrane company's installation "
     "portfolio. Professional but real. " + REAL),

    # Step 6: 実際のTesla Powerwall設置
    ("step6_solar_powerwall",
     "Two real Tesla Powerwall 3 units (flat white rectangular boxes with Tesla logo) "
     "wall-mounted on the exterior of a dark container/building. Thick black cables connected. "
     "An electrician in work clothes connecting wires to a gray electrical panel below. "
     "Nearby: a ground-mounted solar panel array (20 panels on metal frame racks) angled "
     "toward the sun. A white Starlink dish on a short pole. Clean installation. Real photo. " + REAL),

    # Step 7: 実際のバレルサウナ
    ("step7_sauna_barrel",
     "A real Finnish barrel sauna (horizontal cedar barrel, about 2.4m long, with a small "
     "metal chimney on top) sitting on a wooden deck. Next to it: a round wooden hot tub "
     "(Japanese-style soaking tub, about 1.5m diameter, wooden staves with metal bands). "
     "And a small stainless steel ice plunge pool. All three sitting on wooden deck boards. "
     "Garden hose connected. Outdoor setting. Looks like a real product photo from a sauna "
     "manufacturer. Clean, honest. " + REAL),

    # Step 8: 完成外観 — リアルな複合体
    ("step8_complete_golden",
     "Real photo of a completed container house + dome compound. Two dark-painted 20ft shipping "
     "containers placed parallel with a white dome structure between them. A white fabric shade "
     "canopy extends outward. Wooden deck with outdoor furniture. Solar panels on ground racks. "
     "Open rural landscape in background. Sunset light but natural, not over-processed. "
     "Looks like a real photo from an architectural firm's completed project gallery. " + REAL),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    # Force regenerate by removing existing
    for f in [out_jpg, out_webp]:
        if os.path.exists(f):
            os.remove(f)
    print(f"→ {name}")
    for attempt in range(3):
        try:
            r = client.models.generate_content(
                model=MODEL, contents=prompt,
                config=types.GenerateContentConfig(response_modalities=["IMAGE","TEXT"]))
            for p in r.candidates[0].content.parts:
                if p.inline_data and p.inline_data.data:
                    with open(out_jpg,"wb") as f: f.write(p.inline_data.data)
                    subprocess.run(["cwebp","-q","90",out_jpg,"-o",out_webp],check=True,capture_output=True)
                    os.remove(out_jpg)
                    print(f"  ✓ {name}.webp")
                    return True
            print(f"  no image, retry {attempt+1}")
        except Exception as e:
            print(f"  error: {e}")
            time.sleep(5)
    return False

ok = fail = 0
for name, prompt in SHOTS:
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(3)
print(f"\ndone: {ok} ok, {fail} fail")
