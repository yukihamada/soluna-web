#!/usr/bin/env python3
"""Generate pro-quality images. Some with reference photos for consistency."""
import os, time, base64
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ["GEMINI_API_KEY"])
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"
SRC = "/Users/yuki/workspace/business/enablerfun-analytics/src/assets"

def load_img(path):
    with open(path, "rb") as f:
        return f.read()

def gen(name, prompt, ref_path=None):
    print(f"Generating {name}...")
    try:
        contents = []
        if ref_path and os.path.exists(ref_path):
            img_data = load_img(ref_path)
            mime = "image/jpeg" if ref_path.endswith(".jpg") else "image/png"
            contents.append(types.Part.from_bytes(data=img_data, mime_type=mime))
        contents.append(prompt)

        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=contents,
            config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
        )
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                ext = part.inline_data.mime_type.split("/")[-1]
                path = f"{OUT}/pro_{name}.{ext}"
                with open(path, "wb") as f:
                    f.write(part.inline_data.data)
                print(f"  Saved: pro_{name}")
                return True
        print(f"  No image")
        return False
    except Exception as e:
        print(f"  Error: {e}")
        return False

# 1. Hero - TAPKOP at golden hour (reference: real exterior)
gen("hero",
    "Transform this building photo into a stunning architectural magazine cover. "
    "Same building but photographed at golden hour sunset, warm light glowing from windows, "
    "dramatic sky with pink clouds. Manicured lawn. Professional real estate photography. "
    "Ultra high quality, sharp, magazine cover worthy. Wide angle.",
    f"{OUT}/tapkop_real2.jpg")
time.sleep(3)

# 2. TAPKOP interior - enhance the real interior
gen("tapkop_interior",
    "Enhance this interior photo to magazine quality. Same room but with perfect warm lighting, "
    "fire burning in the fireplace, wine glasses on the table, evening blue hour visible "
    "through the windows. Cozy luxury atmosphere. Architectural Digest quality.",
    f"{OUT}/tapkop_real3.jpg")
time.sleep(3)

# 3. Sauna tower completed - from the construction photo
gen("sauna_complete",
    "This is a spiral wooden tower sauna under construction. Generate the COMPLETED version: "
    "same spiral wood design but fully finished with charred cedar exterior cladding, "
    "steam rising from the top, snow on the ground, birch trees around it, "
    "a person walking toward it in a bathrobe. Winter evening, warm light from inside. "
    "Architectural photography, magazine quality.",
    f"{OUT}/real_sauna_building.png")
time.sleep(3)

# 4. THE NEST - enhance
gen("nest_hero",
    "Enhance this architectural photo to magazine cover quality. Same building but "
    "photographed at blue hour with warm interior light glowing through windows. "
    "Snow on the ground. Dramatic composition. Architectural Digest level.",
    f"{SRC}/property-nest.jpg")
time.sleep(3)

# 5. Atami WHITE HOUSE - enhance with ocean
gen("atami_hero",
    "Enhance this interior to luxury real estate photography. Same white minimalist space "
    "but at sunset, golden light streaming through the floor-to-ceiling windows, "
    "Sagami Bay ocean view dramatic in the background. A bottle of champagne on the table. "
    "Vogue Living quality.",
    f"{SRC}/property-atami.jpg")
time.sleep(3)

# 6. Hawaii beach house - enhance
gen("hawaii_hero",
    "Enhance this beach house photo to luxury travel magazine quality. Same view but "
    "at sunset with dramatic orange sky, palm trees silhouetted, a couple on the deck "
    "watching the sunset with wine glasses. Tropical paradise. Conde Nast Traveler quality.",
    f"{SRC}/property-honolulu.jpg")
time.sleep(3)

# 7. Village at night - cinematic
gen("village_cinematic",
    "A cluster of 5 modern dark charred cedar cabins in a snowy Hokkaido birch forest at night. "
    "Warm golden light from each cabin window. Wooden boardwalks connecting them with subtle string lights. "
    "A central bonfire with a few people gathered around. Stars and Milky Way clearly visible overhead. "
    "Fresh snow on the ground reflecting the warm light. A golden retriever lying by the fire. "
    "Long exposure photography. Absolutely stunning. National Geographic quality.")
time.sleep(3)

# 8. HondaJet with dogs - cinematic
gen("jet_cinematic",
    "A white HondaJet private jet on a small airstrip with snow-capped Hokkaido mountains behind. "
    "A well-dressed couple walking toward the jet with their golden retriever. The jet door is open. "
    "Clear blue winter sky. The feeling of freedom and luxury. "
    "Shot on Hasselblad medium format. Aviation luxury lifestyle photography.")
time.sleep(3)

# 9. Morning coffee on deck
gen("morning_deck",
    "Close-up of a hand holding a ceramic coffee cup on a wooden deck railing. "
    "Background: misty caldera lake (Kussharo) at sunrise, birch trees, mountains. "
    "Shallow depth of field. Steam rising from the coffee. "
    "The perfect morning. Lifestyle photography, magazine quality.")
time.sleep(3)

# 10. Sauna interior with fire
gen("sauna_inside",
    "Inside a beautiful wood-fired sauna. Cedar walls glowing amber from the fire. "
    "Hot stones with steam rising. A small window showing snowy birch forest outside. "
    "A wooden bucket and ladle. The feeling of intense heat and relaxation. "
    "Dramatic lighting. Sauna culture photography.")

print("\nDone! All pro images generated.")
