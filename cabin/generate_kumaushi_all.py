#!/usr/bin/env python3
"""Regenerate ALL kumaushi page images — white stucco containers + white mats unified style"""
import os, time, subprocess, sys
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
MODEL = "gemini-3-pro-image-preview"
OUT = "/Users/yuki/workspace/teshikaga-cabin/img"

STYLE = ("Photorealistic photograph. Natural lighting. Clean, sharp. "
         "Real materials, real textures. No artistic filters, no film grain. "
         "Location: open hilltop grassland in Hokkaido, Japan. Distant mountains. "
         "White stucco shipping container compound with white martial arts mats. ")

SHOTS = [
    # === HERO / KEY VISUALS ===
    ("kumaushi_aerial_dawn",
     "Aerial drone photo at dawn. Four white stucco 20ft containers in U-shape on green Hokkaido hilltop. "
     "White mats in central courtyard under white membrane canopy. Barrel sauna, wooden hot tub on side. "
     "Solar panels on ground racks. Morning mist over grassland. Mountains in distance. Golden dawn light. " + STYLE),

    ("k4_aerial",
     "Aerial drone photo, midday. Four white stucco containers in U-shape. Central courtyard with white "
     "martial arts mats and membrane canopy. Two people in white gis training. Barrel sauna and hot tub "
     "visible. Solar panels. Vast green grassland. Blue sky. Clean, bright. " + STYLE),

    ("k4_dojo_center",
     "Ground level looking into U-shape courtyard. White stucco container walls on three sides. White "
     "EVA martial arts mats on floor. Fabric canopy overhead. Two people in white gis doing BJJ. Open end "
     "shows panoramic Hokkaido mountains. Bright, serene, clean white dojo. " + STYLE),

    ("k4_ext_ushape",
     "Ground level photo of four white stucco containers in U-shape at golden hour. Glass doors glowing "
     "warm. White membrane canopy over courtyard. Dark burnt-cedar (yakisugi) deck extending outward. "
     "Reflection pool at entrance. Green grassland. Like a Greek monastery on a Hokkaido hill. " + STYLE),

    ("k4_night",
     "The white stucco compound at night. Warm amber light from windows. Courtyard white mats lit by "
     "string lights under canopy. Campfire on yakisugi deck. Stars and Milky Way above. White walls "
     "softly illuminated. Barrel sauna chimney glowing. Magical. " + STYLE),

    ("k4_winter_dojo",
     "Winter. Snow on container roofs and ground. White stucco blends with snow. Under membrane canopy, "
     "white mats clear. Person in white gi training solo. Steam from hot tub nearby. Snowy mountains "
     "through open end. White-on-white beauty. " + STYLE),

    # === CONTAINER EXTERIORS ===
    ("k4_ext_full",
     "Single 20ft container with white stucco exterior. Sliding glass door with black aluminum frame. "
     "Small square window. Wooden step at door. Green grass, blue sky. Clean, minimal. Looks like "
     "Mediterranean micro-villa. Real product photo. " + STYLE),

    ("k4_ext_detail",
     "Close-up of white stucco texture on container wall. Hand-applied lime plaster (Japanese shikkui). "
     "Black-framed glass door partially visible. Brass door handle. Container corner geometry visible "
     "under the plaster. Warm sunlight casting soft shadows. Beautiful craftsmanship. " + STYLE),

    # === CONTAINER INTERIORS ===
    ("k4_int_bedroom_wide",
     "Wide-angle interior of container bedroom. Birch plywood walls and ceiling. Queen bed with white "
     "linen. Window at end showing mountains. Recessed LED lights. Built-in wardrobe. Dark vinyl floor. "
     "White container ceiling ribs visible. Compact, luxurious. " + STYLE),

    ("k4_bedroom",
     "Container bedroom detail. Low platform bed, white sheets, indigo throw. Floating desk with chair. "
     "Full-width sliding glass door showing Hokkaido panorama. Cedar floor. Warm LED. Hotel quality. " + STYLE),

    ("k4_int_bath",
     "Container bathroom. Walk-in rain shower, gray stone tile. Deep oval soaking tub by porthole window "
     "with mountain view. Matte black fixtures. Heated towel rail. TOTO smart toilet visible. Spa quality. " + STYLE),

    ("k4_bathroom",
     "Container bathroom detail. TOTO Neorest smart toilet, white tile floor. Small window. Brass "
     "accessories. Warm LED lighting. Clean, premium. " + STYLE),

    ("k4_int_kitchen_wide",
     "Container kitchen/dining wide angle. Concrete countertop, matte black faucet, IH cooktop, "
     "under-counter fridge. Dining table for 4 by window. Pendant light. Balmuda coffee maker on counter. "
     "Wine cooler visible. Warm, inviting small space. " + STYLE),

    ("k4_kitchen",
     "Container kitchen detail. Concrete counter with brass faucet. Open shelving with ceramics. "
     "Vermicular pot on IH. Balmuda kettle. Window showing grassland. Morning light. " + STYLE),

    # === HOW IT'S BUILT STEPS ===
    ("step1_foundation",
     "Concrete pier blocks being placed on cleared flat ground on Hokkaido hilltop. Worker checking level "
     "with laser. Simple gray blocks in two rows. Grass around edges. Overcast sky. " + STYLE),

    ("k4_crane_install",
     "Mobile crane lifting a white stucco 20ft container off flatbed truck. Three white containers already "
     "in U-shape position. Workers in hard hats. Pallet of white mats nearby. Documentary style. " + STYLE),

    ("step5_membrane_stretch",
     "Workers stretching white membrane fabric over steel posts between white stucco containers. "
     "Cables and turnbuckles. White mats visible below on ground. Dramatic curved canopy forming. " + STYLE),

    ("step6_solar_powerwall",
     "Two Tesla Powerwall 3 units on white stucco container wall. Electrician connecting cables. "
     "Solar panels on ground racks nearby. Starlink dish on pole. Clean installation. " + STYLE),

    ("step7_sauna_barrel",
     "Cedar barrel sauna on yakisugi deck next to white containers. Round hinoki hot tub and stainless "
     "ice bath next to it. Garden hose connected. White membrane canopy edge visible above. " + STYLE),

    # === ECO SYSTEMS ===
    ("eco_rainwater",
     "Stainless IBC water tank beside white container. Gutters from white container roof feeding into "
     "tank through first-flush diverter. Carbon filter attached. Green grassland background. " + STYLE),

    ("eco_compost_toilet",
     "Modern Separett composting toilet in container bathroom. Sleek white unit. White tile walls. "
     "Small exhaust vent pipe. Bag of wood shavings. Looks like normal modern bathroom. " + STYLE),

    ("eco_rocket_heater",
     "Rocket mass heater in container. Short metal J-tube combustion chamber. Long white plastered "
     "thermal mass bench along wall. Small fire visible. Kettle on top. Cozy, efficient. " + STYLE),

    ("eco_reed_bed",
     "Small constructed wetland outdoors near white containers. Rectangular gravel basin with reeds "
     "and cattails. Gray water pipe entering one end. Clean water out to garden. Natural, beautiful. " + STYLE),

    ("eco_solar_thermal",
     "Vacuum tube solar collectors on white container roof. About 20 black tubes in rack. Insulated "
     "copper pipes to hot water tank. Blue sky. Heats hot tub and shower with sunlight only. " + STYLE),

    ("eco_rooftop_garden",
     "Vegetable garden on white container roof. Shallow raised beds with herbs, lettuce, tomatoes. "
     "Drip irrigation from rainwater. Person picking herbs. Mountains in background. " + STYLE),

    # === UPGRADES ===
    ("up_heated_floor",
     "Electric underfloor heating mat being installed under white martial arts mats. Orange heating "
     "cable mat on surface. White EVA mats being laid on top. Thermostat on white wall. " + STYLE),

    ("up_smart_glass",
     "Split view: smart glass window on white container. Left=transparent (landscape visible). "
     "Right=frosted opaque (milky white). Black aluminum frame. Wall switch. Modern. " + STYLE),

    ("up_projector_wall",
     "Night. 4K image projected on white stucco container wall outdoors. UFC fight on 3m wide "
     "'screen'. People on yakisugi deck watching. Stars above. Barrel sauna nearby. " + STYLE),

    ("up_toto_neorest",
     "TOTO Neorest smart toilet in container bathroom. Sleek white. Gray stone floor. Porthole window "
     "with mountain view. Lid auto-open, blue LED night light. Premium. " + STYLE),

    ("up_sonos_deck",
     "White Sonos Era 300 on wooden shelf on yakisugi deck. Hokkaido panorama behind. Golden hour. "
     "People relaxing after sauna. Towels, water bottles. Great sound in wilderness. " + STYLE),

    ("up_corten_accent",
     "One container wall left as raw Corten steel (rusty orange-brown) while other walls white stucco. "
     "Black-framed window in Corten wall. Morning light making rust glow. Beautiful contrast. " + STYLE),

    ("up_reflection_pool",
     "Shallow reflection pool (3m x 1m, 5cm deep) at entrance to white container compound. Still water "
     "reflecting white walls and blue sky. Black river stones. Wooden stepping stones. Zen. " + STYLE),

    ("up_yakisugi_deck",
     "Dark charred yakisugi cedar deck extending from white stucco containers. Jet-black wood against "
     "white walls. Outdoor chairs. Green grassland beyond. Golden hour. Dramatic material contrast. " + STYLE),

    ("up_brass_hardware",
     "Close-up of brushed brass door handle on white stucco wall. Warm gold against matte white. "
     "Brass house number plate nearby. Brass towel hook and light switch. Elegant details. " + STYLE),

    ("up_tesla_charger",
     "White Tesla Wall Connector on white stucco container wall. White Tesla Model Y charging. "
     "Solar panels in background. Open grassland. EV charges from solar, feeds house at night. " + STYLE),

    # === AMENITIES / EQUIPMENT ===
    ("comfort_barrel_sauna",
     "Cedar barrel sauna (8-person, wood-fired) on yakisugi deck. Small chimney smoking. Door open "
     "showing wooden interior benches. White containers in background. " + STYLE),

    ("comfort_hot_tub",
     "Round Japanese hinoki cypress hot tub (180cm diameter) on deck. Person soaking. Steam rising. "
     "White container walls behind. Mountains visible. Evening light. " + STYLE),

    ("comfort_ice_bath",
     "Stainless steel ice bath plunge pool on deck. Cold clear water. White containers behind. "
     "Person about to step in wearing towel. Cold morning. " + STYLE),

    ("comfort_pizza_oven",
     "Small portable pizza oven (Ooni style) on outdoor table on yakisugi deck. Pizza being made. "
     "White containers in background. Evening. Casual outdoor cooking. " + STYLE),

    ("comfort_stargazing",
     "Person looking through telescope on yakisugi deck at night. White containers softly lit behind. "
     "Milky Way clearly visible in sky. No light pollution. Stars everywhere. " + STYLE),

    ("comfort_ebike",
     "Two electric mountain bikes parked on yakisugi deck beside white container. Helmets hanging "
     "on handlebar. Charging from wall outlet. Grassland trail visible in background. " + STYLE),

    ("comfort_greenhouse",
     "Small timber-frame greenhouse next to white containers. Vegetable plants inside. Frost on glass. "
     "Morning sunlight. Connected to rainwater system. Self-sufficiency. " + STYLE),

    ("comfort_underground_cellar",
     "Small root cellar / storage built into hillside near white containers. Wooden door. Cool storage "
     "for food and drinks. Natural temperature control. Grass-covered roof blends with landscape. " + STYLE),

    # === OTHER KEY IMAGES ===
    ("bonfire_night",
     "Large campfire burning on open ground near white container compound at night. Two people sitting "
     "on log seats. White containers glowing behind. Stars above. Intimate, warm. " + STYLE),

    ("jiujitsu",
     "Two people in white gis doing Brazilian Jiu-Jitsu on white mats in the central courtyard. "
     "White container walls on sides. Membrane canopy above. Mountain panorama through open end. "
     "Action shot — one person executing a sweep. Dynamic, powerful. " + STYLE),

    ("kumaushi_b_bonfire_night",
     "Wide shot of the compound at night with bonfire. White containers, yakisugi deck, membrane "
     "canopy glowing. People around fire. Stars. Hokkaido wilderness. Complete serenity. " + STYLE),

    ("winter_sauna",
     "Barrel sauna in snow near white containers. Person exiting sauna into cold air. Snow on ground. "
     "Steam from person's body. Ice bath nearby with ice on surface. Hardcore winter wellness. " + STYLE),

    # === TECH/OFFGRID (old images to replace) ===
    ("offgrid_solar_thermal",
     "Ground-mounted solar panel array (20 panels) on metal racks next to white containers. "
     "Tesla Powerwall visible on container wall. Starlink dish. Clean energy installation. " + STYLE),

    ("offgrid_water_system",
     "Water system overview: rainwater gutters on white container roof → IBC tank → carbon filter → "
     "distribution manifold. Clean plumbing. Professional installation. " + STYLE),

    ("dome_v2h_tesla",
     "White Tesla Model Y parked next to white container with Tesla Wall Connector and two Powerwalls. "
     "V2H bidirectional setup. Solar panels in background. The car IS the backup battery. " + STYLE),
]

def gen(name, prompt):
    out_jpg = f"{OUT}/{name}.jpg"
    out_webp = f"{OUT}/{name}.webp"
    for f in [out_jpg, out_webp]:
        if os.path.exists(f): os.remove(f)
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
                    print(f"  ✓ {name}.webp ({len(p.inline_data.data)//1024}KB)")
                    return True
            print(f"  no image, retry {attempt+1}")
        except Exception as e:
            print(f"  error: {e}")
            time.sleep(8)
    return False

ok = fail = 0
for i, (name, prompt) in enumerate(SHOTS):
    print(f"\n[{i+1}/{len(SHOTS)}]")
    if gen(name, prompt): ok += 1
    else: fail += 1
    time.sleep(2)
print(f"\n{'='*40}\ndone: {ok} ok, {fail} fail out of {len(SHOTS)}")
