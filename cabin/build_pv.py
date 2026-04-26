#!/usr/bin/env python3
"""CLUB K4 PV — clean version"""
import os, subprocess, shutil, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

IMG = Path("/Users/yuki/workspace/teshikaga-cabin/img")
OUT = Path("/Users/yuki/workspace/teshikaga-cabin/pv")
TMP = OUT / "tmp2"
OUT.mkdir(exist_ok=True)
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir()

W, H = 1920, 1080
FPS = 30
GOLD   = (200, 164, 85)
GOLD_D = (140, 110, 55)
WHITE  = (240, 236, 228)
DIM    = (120, 120, 120)
BG     = (6, 6, 6)
BG2    = (12, 12, 12)

FONT   = "/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"
FONTB  = "/System/Library/Fonts/ヒラギノ角ゴシック W8.ttc"

def f(size, bold=False):
    return ImageFont.truetype(FONTB if bold else FONT, size)

def webp_to_png(name):
    src = IMG / f"{name}.webp"
    dst = TMP / f"{name}.png"
    if not dst.exists():
        subprocess.run(["ffmpeg","-y","-i",str(src),str(dst),"-loglevel","error"],check=True)
    return dst

def save_clip(frames_dir, name, duration, extra_vf=""):
    out = TMP / f"{name}.mp4"
    vf = f"fade=t=out:st={duration-0.6:.2f}:d=0.6:color=black"
    if extra_vf: vf = extra_vf + "," + vf
    subprocess.run([
        "ffmpeg","-y","-framerate",str(FPS),
        "-i", str(frames_dir/f"frame_%04d.png"),
        "-vf", vf,
        "-c:v","libx264","-pix_fmt","yuv420p",str(out),"-loglevel","error"
    ], check=True)
    return out

def ken_burns_clip(name, duration, zoom_in=True, cx=0.5, cy=0.5):
    """Smooth Ken Burns from static image"""
    png = webp_to_png(name)
    out = TMP / f"{name}_kb.mp4"
    z0 = 1.08 if zoom_in else 1.14
    z1 = 1.14 if zoom_in else 1.08
    # Use xywh offsets based on cx/cy
    x_expr = f"iw*{cx:.2f}-(iw/zoom/2)"
    y_expr = f"ih*{cy:.2f}-(ih/zoom/2)"
    z_expr = f"'{z0}+({z1}-{z0})*on/(duration*{FPS})'"
    vf = (
        f"scale=8000:-1,"
        f"zoompan=z={z_expr}:x='{x_expr}':y='{y_expr}':d=1:s={W}x{H}:fps={FPS},"
        f"fade=t=in:st=0:d=0.6:color=black,"
        f"fade=t=out:st={duration-0.6:.2f}:d=0.6:color=black"
    )
    subprocess.run([
        "ffmpeg","-y","-loop","1","-i",str(png),
        "-t",str(duration),"-vf",vf,
        "-c:v","libx264","-pix_fmt","yuv420p",str(out),"-loglevel","error"
    ], check=True)
    return out

def draw_text_centered(draw, img, text, y, fnt, color, alpha=255):
    bb = draw.textbbox((0,0), text, font=fnt)
    tw = bb[2]-bb[0]
    px = (W - tw) / 2
    layer = Image.new("RGBA", (W,H), (0,0,0,0))
    dl = ImageDraw.Draw(layer)
    # Subtle shadow
    dl.text((px+2, y+2), text, font=fnt, fill=(0,0,0,int(alpha*0.5)))
    dl.text((px, y), text, font=fnt, fill=color+(alpha,))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

def alpha_lerp(t, start, dur=0.5):
    if t < start: return 0
    return min(255, int(((t-start)/dur)*255))

# ══════════════════════════════════════════════════════════════════
# CLIP 00 — BLACK + FADE IN (1.5s)
# ══════════════════════════════════════════════════════════════════
print("[00] Black intro...", flush=True)
c00 = TMP / "c00.mp4"
subprocess.run(["ffmpeg","-y","-f","lavfi","-i",f"color=c=black:s={W}x{H}:r={FPS}",
                "-t","1.5","-c:v","libx264","-pix_fmt","yuv420p",str(c00),"-loglevel","error"], check=True)

# ══════════════════════════════════════════════════════════════════
# CLIP 01 — TOKYO NIGHT (4s)
# ══════════════════════════════════════════════════════════════════
print("[01] Tokyo night...", flush=True)
c01 = ken_burns_clip("k4_pv_tokyo_night", 4.0, zoom_in=True, cx=0.5, cy=0.5)

# ══════════════════════════════════════════════════════════════════
# CLIP 02 — CHAT SCENE "食うんかい！" (8s)
# ══════════════════════════════════════════════════════════════════
print("[02] Chat scene...", flush=True)
CHAT_SEC = 8.0
CHAT_N   = int(CHAT_SEC * FPS)
fd02 = TMP / "chat"; fd02.mkdir(exist_ok=True)

messages = [
    # (appear_t, is_right, text, color)
    (0.4,  False, "サウナ行く？",           WHITE),
    (1.1,  True,  "どこ？ また同じとこ？",  DIM),
    (2.0,  False, "プールは？",             WHITE),
    (2.7,  True,  "高い...",               DIM),
    (3.5,  False, "フェラーリ乗りたい",     WHITE),
    (4.6,  True,  "食うんかい！",           GOLD),
]

BUBBLE_PAD = 28
LINE_H = 90

def draw_bubble(draw, text, fnt, x, y, color, is_right):
    bb = draw.textbbox((0,0), text, font=fnt)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    bw = tw + BUBBLE_PAD*2
    bh = th + BUBBLE_PAD
    bx = x if not is_right else W - x - bw
    by = y
    bg_c = (30,30,30) if not is_right else (20,20,20)
    if color == GOLD:
        bg_c = (50,40,15)
    draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=18, fill=bg_c)
    if color == GOLD:
        draw.rounded_rectangle([bx, by, bx+bw, by+bh], radius=18, outline=GOLD_D, width=1)
    draw.text((bx+BUBBLE_PAD, by+BUBBLE_PAD//2), text, font=fnt, fill=color)
    return bh

f_chat = f(40)
f_kuuunkai = f(56, bold=True)
MARGIN_X = 110
y_positions = []
cy = H*0.18
for i, (_, is_right, text, color) in enumerate(messages):
    bb = ImageDraw.Draw(Image.new("RGB",(1,1))).textbbox((0,0), text, font=f_chat)
    bh = (bb[3]-bb[1]) + BUBBLE_PAD
    y_positions.append(cy)
    cy += bh + 20

for fi in range(CHAT_N):
    t = fi / FPS
    img = Image.new("RGB", (W,H), BG2)

    # Subtle gradient bg
    grad = Image.new("RGB", (W,H), (10,10,10))
    img = Image.blend(img, grad, 0.3)

    draw = ImageDraw.Draw(img)

    for i, (appear_t, is_right, text, color) in enumerate(messages):
        a = alpha_lerp(t, appear_t, 0.4)
        if a == 0: continue

        fnt = f_kuuunkai if text == "食うんかい！" else f_chat
        bb = draw.textbbox((0,0), text, font=fnt)
        tw, th = bb[2]-bb[0], bb[3]-bb[1]
        bw = tw + BUBBLE_PAD*2
        bh = th + BUBBLE_PAD
        bx = MARGIN_X if not is_right else W - MARGIN_X - bw
        by = y_positions[i]
        bg_c = (30,30,30) if not is_right else (22,22,22)
        if color == GOLD: bg_c = (45,35,10)

        layer = Image.new("RGBA", (W,H), (0,0,0,0))
        dl = ImageDraw.Draw(layer)
        r,g,b = bg_c
        dl.rounded_rectangle([bx,by,bx+bw,by+bh], radius=20, fill=(r,g,b,a))
        if color == GOLD:
            dl.rounded_rectangle([bx,by,bx+bw,by+bh], radius=20, outline=GOLD_D+(a,), width=2)
        tr,tg,tb = color
        dl.text((bx+BUBBLE_PAD, by+BUBBLE_PAD//2), text, font=fnt, fill=(tr,tg,tb,a))
        img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
        draw = ImageDraw.Draw(img)

    # Fade out
    if t > CHAT_SEC - 0.8:
        fade = min(1.0, (t-(CHAT_SEC-0.8))/0.8)
        overlay = Image.new("RGB",(W,H), BG2)
        img = Image.blend(img, overlay, fade)

    img.save(fd02/f"frame_{fi:04d}.png")

c02 = TMP/"chat_clip.mp4"
subprocess.run(["ffmpeg","-y","-framerate",str(FPS),"-i",str(fd02/"frame_%04d.png"),
                "-c:v","libx264","-pix_fmt","yuv420p",str(c02),"-loglevel","error"], check=True)

# ══════════════════════════════════════════════════════════════════
# CLIP 03 — AERIAL (6s)
# ══════════════════════════════════════════════════════════════════
print("[03] Aerial...", flush=True)
# Build labeled version
png_src = webp_to_png("k4_ref_aerial_day")
img_a = Image.open(png_src).convert("RGB").resize((W,H), Image.LANCZOS)
draw_a = ImageDraw.Draw(img_a)
# Gold left bar accent
draw_a.rectangle([W*0.08-4, H*0.83, W*0.08-1, H*0.94], fill=GOLD)
f_loc = f(46, bold=True); f_sub = f(22)
draw_a.text((W*0.08+12, H*0.83), "北海道　熊牛原野", font=f_loc, fill=GOLD)
draw_a.text((W*0.08+12, H*0.91), "KUMAUSHI BASE  ·  HOKKAIDO  ·  JAPAN", font=f_sub, fill=DIM)
lbl_path = TMP/"aerial_lbl.png"; img_a.save(lbl_path)

c03 = TMP/"aerial.mp4"
vf_a = (f"scale=8000:-1,"
        f"zoompan=z='1.06+0.008*on/{FPS}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},"
        f"fade=t=in:st=0:d=0.8:color=black,fade=t=out:st=5.2:d=0.8:color=black")
subprocess.run(["ffmpeg","-y","-loop","1","-i",str(lbl_path),"-t","6","-vf",vf_a,
                "-c:v","libx264","-pix_fmt","yuv420p",str(c03),"-loglevel","error"], check=True)

# ══════════════════════════════════════════════════════════════════
# CLIPS 04-08 — ZONE SHOTS (4.5s each)
# ══════════════════════════════════════════════════════════════════
zones = [
    ("k4_pool_infinity",    "INFINITY POOL",              True,  0.5, 0.5),
    ("k4_ref_party",        "DJ  /  BAR  /  PARTY",       True,  0.5, 0.5),
    ("k4_ref_sauna_spa",    "SAUNA  /  SPA",              False, 0.4, 0.5),
    ("k4_supercar",         "FERRARI  /  HARLEY  /  SNOWMOBILE", False, 0.5, 0.5),
    ("k4_ref_night",        "NIGHT  /  MILKY WAY",        True,  0.5, 0.5),
]
zone_clips = []
f_zone = f(30)
for i, (name, label, zin, cx, cy) in enumerate(zones):
    print(f"[{4+i:02d}] {label}...", flush=True)
    png_src = webp_to_png(name)
    img_z = Image.open(png_src).convert("RGB").resize((W,H), Image.LANCZOS)
    draw_z = ImageDraw.Draw(img_z)
    # Bottom gradient bar
    grad_h = 180
    for row in range(grad_h):
        alpha_v = int(220 * (row/grad_h)**0.6)
        draw_z.rectangle([0, H-grad_h+row, W, H-grad_h+row+1], fill=(6,6,6,alpha_v) if False else (6,6,6))
    # Gold accent line
    draw_z.rectangle([W*0.06, H-72, W*0.06+3, H-28], fill=GOLD)
    draw_z.text((W*0.06+16, H-72), label, font=f_zone, fill=GOLD)
    lp = TMP/f"z{i}_{name}.png"; img_z.save(lp)

    z0 = 1.08 if zin else 1.14; z1 = 1.14 if zin else 1.08
    vf_z = (f"scale=8000:-1,"
            f"zoompan=z='{z0}+({z1}-{z0})*on/(duration*{FPS})':x='iw*{cx:.2f}-(iw/zoom/2)':y='ih*{cy:.2f}-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS},"
            f"fade=t=in:st=0:d=0.6:color=black,fade=t=out:st=3.9:d=0.6:color=black")
    out_z = TMP/f"zone_{i}.mp4"
    subprocess.run(["ffmpeg","-y","-loop","1","-i",str(lp),"-t","4.5","-vf",vf_z,
                    "-c:v","libx264","-pix_fmt","yuv420p",str(out_z),"-loglevel","error"], check=True)
    zone_clips.append(out_z)

# ══════════════════════════════════════════════════════════════════
# CLIP 09 — FRIENDS SHOCKED (3.5s)
# ══════════════════════════════════════════════════════════════════
print("[09] Reaction shot...", flush=True)
c09 = ken_burns_clip("k4_pv_friends_shocked", 3.5, zoom_in=False, cx=0.5, cy=0.45)

# ══════════════════════════════════════════════════════════════════
# CLIP 10 — TITLE CARD (8s)
# ══════════════════════════════════════════════════════════════════
print("[10] Title card...", flush=True)
TITLE_SEC = 8.0
TITLE_N   = int(TITLE_SEC * FPS)
fd10 = TMP/"title"; fd10.mkdir(exist_ok=True)

f_t1 = f(128, bold=True)
f_t2 = f(52)
f_t3 = f(28)
f_t4 = f(26)
f_t5 = f(22)

items = [
    # (appear_t, text, color, font, y_ratio, centered)
    (0.6,  "CLUB K4",           GOLD,  f_t1, 0.30, True),
    (1.6,  "所有感を売る。",     WHITE, f_t2, 0.52, True),
    (2.6,  "創設会員  ·  20名限定",  DIM,   f_t3, 0.64, True),
    (3.6,  "solun.art / club-k4",  GOLD,  f_t4, 0.78, True),
    (4.4,  "HOKKAIDO  ·  JAPAN  ·  2026",  (60,60,60), f_t5, 0.88, True),
]

for fi in range(TITLE_N):
    t = fi / FPS
    img = Image.new("RGB",(W,H), BG)
    # Subtle radial glow center
    glow = Image.new("RGB",(W,H),(10,8,3))
    img = Image.blend(img, glow, 0.25)

    for appear_t, text, color, fnt, yr, centered in items:
        a = alpha_lerp(t, appear_t, 0.9)
        if a == 0: continue
        # Slide up effect
        slide = max(0, 1-(t-appear_t)/0.6)
        y_offset = int(slide * 20)
        img = draw_text_centered(ImageDraw.Draw(img), img, text,
                                 int(H*yr)-y_offset, fnt, color, a)

    # Gold thin separator line
    if t > 1.4:
        a_line = alpha_lerp(t, 1.4, 0.6)
        layer = Image.new("RGBA",(W,H),(0,0,0,0))
        dl = ImageDraw.Draw(layer)
        dl.rectangle([W//2-120, int(H*0.485), W//2+120, int(H*0.487)], fill=GOLD+(a_line,))
        img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

    # Final fade out
    if t > TITLE_SEC - 1.2:
        fade = min(1.0, (t-(TITLE_SEC-1.2))/1.2)
        overlay = Image.new("RGB",(W,H), BG)
        img = Image.blend(img, overlay, fade)

    img.save(fd10/f"frame_{fi:04d}.png")

c10 = TMP/"title.mp4"
subprocess.run(["ffmpeg","-y","-framerate",str(FPS),"-i",str(fd10/"frame_%04d.png"),
                "-c:v","libx264","-pix_fmt","yuv420p",str(c10),"-loglevel","error"], check=True)

# ══════════════════════════════════════════════════════════════════
# CONCAT
# ══════════════════════════════════════════════════════════════════
print("\n▶ Concatenating...", flush=True)
all_clips = [c00, c01, c02, c03] + zone_clips + [c09, c10]

concat_file = TMP/"concat.txt"
concat_file.write_text("\n".join(f"file '{c}'" for c in all_clips))

final = OUT/"club_k4_pv.mp4"
subprocess.run([
    "ffmpeg","-y","-f","concat","-safe","0","-i",str(concat_file),
    "-c:v","libx264","-crf","17","-preset","slow","-pix_fmt","yuv420p",
    str(final),"-loglevel","error"
], check=True)

r = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(final)],
                   capture_output=True, text=True)
dur = float(r.stdout.strip())
size_mb = final.stat().st_size // (1024*1024)
print(f"\n✅  {final.name}")
print(f"    {size_mb} MB  ·  {dur:.1f}秒")
