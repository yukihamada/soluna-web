#!/usr/bin/env python3
"""Generate before (Wakayama AI listing-style) and after (renovation) images for 5+5 properties."""

import os, sys, base64
from pathlib import Path
from google import genai
from google.genai import types

API_KEY = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    env_path = Path.home() / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "API_KEY" in line and "=" in line:
                API_KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
                break

client = genai.Client(api_key=API_KEY)
IMG = Path("/Users/yuki/workspace/soluna-web/cabin/img")


def gen_text(prompt: str, out: str):
    """Generate image from text prompt."""
    print(f"  Generating {out}...")
    r = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[prompt],
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )
    for part in r.candidates[0].content.parts:
        if part.inline_data and part.inline_data.mime_type.startswith("image/"):
            d = part.inline_data.data
            if isinstance(d, str):
                d = base64.b64decode(d)
            (IMG / out).write_bytes(d)
            print(f"  ✓ {out} ({len(d)//1024}KB)")
            return
    print(f"  ✗ No image for {out}")


def gen_from_image(before_path: str, prompt: str, out: str):
    """Generate renovation image from before photo."""
    print(f"  Renovating {before_path} → {out}...")
    img_bytes = (IMG / before_path).read_bytes()
    r = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[
            types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
            prompt,
        ],
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )
    for part in r.candidates[0].content.parts:
        if part.inline_data and part.inline_data.mime_type.startswith("image/"):
            d = part.inline_data.data
            if isinstance(d, str):
                d = base64.b64decode(d)
            (IMG / out).write_bytes(d)
            print(f"  ✓ {out} ({len(d)//1024}KB)")
            return
    print(f"  ✗ No image for {out}")


# ── WAKAYAMA 5 properties ─────────────────────────────────────────────────────
# These generate BEFORE (listing-style) + AFTER (renovation) for each

WA = [
    {
        "id": "kainan",
        "area": "海南市下津",
        "price": "¥30万",
        "spec": "4SDK 築1952年 土地215m²",
        "before_prompt": (
            "Photorealistic Japanese real estate listing photo. "
            "Exterior of a very old 1952 Japanese house in Kainan city, Wakayama, near the Seto Inland Sea. "
            "Single-story weathered wooden structure with old dark tile roof, "
            "white peeling plaster walls, sliding wooden storm shutters (雨戸), "
            "small concrete front yard with old planters and a bicycle, "
            "narrow residential street visible. "
            "Shot on smartphone, slightly overexposed sky, power lines visible, "
            "typical Japanese real estate listing photo style."
        ),
        "after_prompt": (
            "This is a BEFORE photo of a 1952 Japanese house. "
            "Generate an AFTER photo showing this same building renovated as a luxury coastal retreat. "
            "Keep same footprint: dark charcoal yakisugi (焼杉) wood cladding replacing white plaster, "
            "new deep eaves with recessed LED strip lighting, "
            "large sliding glass doors replacing old shutters, "
            "clean gravel zen garden in front yard, "
            "same tile roof cleaned and repaired. "
            "Warm evening golden light. Same camera angle. Photorealistic architectural photo."
        ),
    },
    {
        "id": "tanabe_furuo",
        "area": "田辺市古江崎",
        "price": "¥48万",
        "spec": "4DK 築1961年 建物126m²",
        "before_prompt": (
            "Photorealistic Japanese real estate listing photo. "
            "Exterior of a 1961 two-story Japanese house in Tanabe city, Wakayama (南紀). "
            "Tan/cream colored mortar exterior walls, dark gray clay tile roof (築64年), "
            "rusted iron rain gutters, old aluminum single-pane windows with curtains, "
            "small concrete entrance with old potted plants and mail box. "
            "Surrounded by other older houses, a narrow street in front. "
            "Slightly dim cloudy afternoon light, "
            "standard real estate photo style (iPhone wide angle, minor distortion)."
        ),
        "after_prompt": (
            "This is a BEFORE photo of an old 1961 Japanese house. "
            "Generate an AFTER photo showing this same building beautifully renovated as a luxury stay. "
            "Keep same two-story volume: "
            "dark shou sugi ban (焼杉) cladding replacing tan mortar walls, "
            "new black aluminum window frames with triple glazing, "
            "deep timber overhang added at entrance with a wooden bench, "
            "new stone pathway leading to door, curated planting of Japanese maples and moss. "
            "Warm late afternoon light. Same angle. Photorealistic."
        ),
    },
    {
        "id": "hidaka_yura",
        "area": "日高郡由良町",
        "price": "¥48万",
        "spec": "6LDK 築1971年 建物120m²",
        "before_prompt": (
            "Photorealistic Japanese real estate listing photo. "
            "Exterior of a large 1971 Japanese house in Yura town, Hidaka district, Wakayama, "
            "near the Pacific Ocean coast. "
            "Large single-story traditional house with wide clay tile roof, "
            "brown aluminum siding panels on lower walls, "
            "old aluminum sliding windows, covered concrete engawa (porch), "
            "wide garden with overgrown bushes and old stone lantern. "
            "Blue sky with some clouds, typical Wakayama coastal area, "
            "standard real estate iPhone photo style."
        ),
        "after_prompt": (
            "This is a BEFORE photo of an old large 1971 Japanese house near the Wakayama coast. "
            "Generate an AFTER photo showing this same building renovated as a luxury seaside retreat. "
            "Keep the wide footprint and tile roof: "
            "replace siding panels with natural cedar wood cladding (natural oil finish), "
            "large new sliding glass door system replacing old aluminum windows, "
            "redesigned engawa porch with hardwood decking, "
            "refined garden with raked gravel, stone path, and pruned bonsai pines. "
            "Bright blue sky, ocean light feel. Same angle. Photorealistic architectural photo."
        ),
    },
    {
        "id": "ryujin",
        "area": "田辺市龍神村",
        "price": "¥150万",
        "spec": "4DK 築1975年 土地421m²",
        "before_prompt": (
            "Photorealistic Japanese real estate listing photo. "
            "Exterior of a 1975 Japanese farmhouse in Ryujin village (龍神村), "
            "Tanabe city, Wakayama deep mountain area (龍神温泉). "
            "Two-story wooden farmhouse with dark gray steel sheet roof, "
            "old brown wooden plank walls weathered by mountain climate, "
            "small wooden sliding door entrance, "
            "large concrete-paved yard with old gardening tools and woodpile, "
            "surrounded by cedar forest on steep hillside. "
            "Misty mountain atmosphere, slightly overcast. "
            "Standard real estate listing photo."
        ),
        "after_prompt": (
            "This is a BEFORE photo of a 1975 Japanese farmhouse in Ryujin mountain village, Wakayama. "
            "Generate an AFTER photo showing this same building renovated as a luxury mountain onsen retreat. "
            "Keep same footprint and surrounding cedar forest: "
            "replace wooden plank walls with new dark charcoal wood vertical cladding, "
            "new large picture windows framing the forest view, "
            "wooden deck with outdoor soaking tub (露天風呂), "
            "stone garden with lantern, steam rising slightly. "
            "Moody forest light, same mountain backdrop. Photorealistic architectural photography."
        ),
    },
    {
        "id": "shingu",
        "area": "新宮市",
        "price": "¥98万",
        "spec": "3LDK 築1968年 建物89m²",
        "before_prompt": (
            "Photorealistic Japanese real estate listing photo. "
            "Exterior of a 1968 Japanese house in Shingu city, Wakayama (南紀熊野). "
            "Single-story concrete block and plaster house with flat concrete roof, "
            "old cream/beige paint peeling, green algae on north wall, "
            "aluminum sliding windows with fly screens, "
            "small concrete entrance step, metal gate, "
            "narrow street in front, power lines overhead, neighboring house visible. "
            "Overcast afternoon light, "
            "typical slightly unflattering Japanese real estate listing photo."
        ),
        "after_prompt": (
            "This is a BEFORE photo of a 1968 Japanese concrete house in Shingu city (Kumano area). "
            "Generate an AFTER photo showing this same building renovated as a luxury Kumano retreat. "
            "Keep same single-story footprint and concrete structure: "
            "new yakisugi (焼杉) wooden cladding attached to exterior over old concrete, "
            "skylight added to flat roof with new wood pergola structure on top, "
            "new black framed floor-to-ceiling windows, "
            "entrance garden with river stones and bamboo screen, "
            "warm interior amber light glowing through windows. "
            "Late afternoon sun. Same angle. Photorealistic."
        ),
    },
]

# ── TESHIKAGA 5 properties (already have before photos) ──────────────────────
TE = [
    {
        "id": "92",
        "before": "teshikaga_real_92.jpg",
        "area": "弟子屈町中央2丁目",
        "price": "¥120万",
        "after_prompt": (
            "This is a BEFORE photo of a house in Teshikaga town center (中央2丁目), Hokkaido. "
            "Generate an AFTER photo showing this same building renovated as a luxury Hokkaido retreat. "
            "Keep same footprint and surroundings: "
            "replace old cladding with dark charcoal weathered cedar board-and-batten, "
            "new large triple-glazed windows at same positions, "
            "warm amber interior light glowing, "
            "simple wooden entrance deck with firewood stack, "
            "clean modern gutters. Same camera angle. "
            "Photorealistic architectural photography, Hokkaido autumn light."
        ),
    },
    {
        "id": "68",
        "before": "teshikaga_real_68.jpg",
        "area": "川湯温泉6丁目",
        "price": "¥1,600万",
        "after_prompt": (
            "This is a BEFORE photo of a house in Kawayu Onsen 6-chome, Teshikaga, Hokkaido. "
            "Generate an AFTER photo showing this same building renovated as a premium onsen villa. "
            "Keep same building shape: "
            "dark timber cladding replacing old exterior, "
            "new large floor-to-ceiling windows, "
            "outdoor wooden deck with private rotenburo (露天風呂) soaking tub visible at side, "
            "steam rising from tub, birch trees in background, "
            "warm golden interior light. Same angle. "
            "Photorealistic luxury architectural photography."
        ),
    },
    {
        "id": "94",
        "before": "teshikaga_real_94.jpg",
        "area": "川湯温泉1丁目",
        "price": "¥2,600万",
        "after_prompt": (
            "This is a BEFORE photo of a large property in Kawayu Onsen 1-chome, Teshikaga, Hokkaido. "
            "Generate an AFTER photo showing this same building renovated as a ultra-luxury Hokkaido lodge. "
            "Keep same large footprint: "
            "full dark shou sugi ban (焼杉) cladding, "
            "dramatic new pitched roof structure with large overhangs, "
            "floor-to-ceiling glazing throughout, "
            "exterior lighting with warm amber LEDs under eaves, "
            "curated birch grove garden. "
            "Winter twilight, snow on ground. Same angle. Photorealistic."
        ),
    },
    {
        "id": "95",
        "before": "teshikaga_real_95.jpg",
        "area": "熊牛原野8-32",
        "price": "¥770万",
        "after_prompt": (
            "This is a BEFORE photo of a small house in Kumaushi Harano (熊牛原野), Teshikaga, Hokkaido "
            "(adjacent to SOLUNA's land). "
            "Generate an AFTER photo showing this same building renovated as a cozy Hokkaido glamping cabin. "
            "Keep same compact footprint and existing wooden deck: "
            "fresh dark cedar cladding, "
            "new large windows, "
            "extended wooden deck with outdoor fire pit, "
            "existing surrounding birch/spruce trees enhanced, "
            "warm interior light. "
            "Clear Hokkaido autumn sky. Same angle. Photorealistic."
        ),
    },
    {
        "id": "98",
        "before": "teshikaga_real_98.jpg",
        "area": "川湯温泉4丁目",
        "price": "¥250万",
        "after_prompt": (
            "This is a BEFORE photo of a house in Kawayu Onsen 4-chome, Teshikaga, Hokkaido. "
            "Generate an AFTER photo showing this same building renovated as a budget-luxury Hokkaido cabin. "
            "Keep same building shape: "
            "replace old siding with dark weathered cedar cladding, "
            "new black-framed windows, "
            "simple wooden entrance porch with lantern, "
            "firewood stacked beside door, "
            "snow on roof and ground. "
            "Blue winter sky. Same camera angle. Photorealistic architectural photo."
        ),
    },
]

print("=== Wakayama: generating BEFORE photos ===")
for p in WA:
    out = f"wakayama_{p['id']}_before.jpg"
    gen_text(p["before_prompt"], out)

print("\n=== Wakayama: generating AFTER renovation photos ===")
for p in WA:
    before = f"wakayama_{p['id']}_before.jpg"
    out = f"wakayama_{p['id']}_after.jpg"
    gen_from_image(before, p["after_prompt"], out)

print("\n=== Teshikaga: generating AFTER renovation photos ===")
for p in TE:
    out = f"teshikaga_{p['id']}_after.jpg"
    gen_from_image(p["before"], p["after_prompt"], out)

print("\nAll done.")
