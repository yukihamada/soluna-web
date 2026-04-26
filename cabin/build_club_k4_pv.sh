#!/bin/bash
set -e
IMG="/Users/yuki/workspace/teshikaga-cabin/img"
OUT="/Users/yuki/workspace/teshikaga-cabin/pv"
mkdir -p "$OUT/tmp"

FONT="/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc"
FONT_BOLD="/System/Library/Fonts/ヒラギノ角ゴシック W8.ttc"
# Fallback fonts
if [ ! -f "$FONT" ]; then FONT="/System/Library/Fonts/Hiragino Sans GB.ttc"; fi
if [ ! -f "$FONT" ]; then FONT="/System/Library/Fonts/Arial.ttf"; fi

W=1920
H=1080
FPS=30
FADE=20   # frames for crossfade
GOLD="0xc8a455"
WHITE="0xf0ece4"

echo "▶ Converting webp images to png..."
for name in k4_pv_tokyo_night k4_pv_friends_shocked k4_ref_aerial_day k4_pool_infinity k4_ref_party k4_ref_sauna_spa k4_supercar k4_dj_booth k4_ref_night k4_ref_interior_court k4_ref_winter k4_ref_rooftop; do
  ffmpeg -y -i "$IMG/${name}.webp" "$OUT/tmp/${name}.png" -loglevel error
done

echo "▶ Building clips..."

# ── CLIP 00: BLACK OPENER 2s ──────────────────────────────────
ffmpeg -y -f lavfi -i color=c=black:s=${W}x${H}:r=$FPS -t 2 \
  -vf "drawtext=text='':fontcolor=white:fontsize=1" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c00.mp4" -loglevel error

# ── CLIP 01: TOKYO NIGHT — 5s Ken Burns zoom-in ─────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_pv_tokyo_night.png" -t 5 \
  -vf "scale=8000:-1,zoompan=z='1.08-0.016*on/$FPS':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=1:color=black,
       fade=t=out:st=4:d=1:color=black,
       drawtext=text='サウナ行く？':fontfile='$FONT':fontsize=0:fontcolor=white:x=w/2-tw/2:y=h*0.8:enable='between(t,0,1)'" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c01.mp4" -loglevel error

# ── CLIP 02: CHAT SCENE — 7s text sequence ───────────────────
ffmpeg -y -f lavfi -i color=c=0x0a0a0a:s=${W}x${H}:r=$FPS -t 7 \
  -vf "
  drawtext=text='「サウナ行く？」':fontfile='$FONT':fontsize=52:fontcolor=0xf0ece4:x=w*0.15:y=h*0.28:enable='between(t,0.3,7)':alpha='if(lt(t,0.3),0,if(lt(t,0.8),(t-0.3)/0.5,1))',
  drawtext=text='「どこ？ また同じとこ？」':fontfile='$FONT':fontsize=44:fontcolor=0x888888:x=w*0.15:y=h*0.38:enable='between(t,0.9,7)':alpha='if(lt(t,0.9),0,if(lt(t,1.4),(t-0.9)/0.5,1))',
  drawtext=text='「プールは？」':fontfile='$FONT':fontsize=52:fontcolor=0xf0ece4:x=w*0.55:y=h*0.48:enable='between(t,1.8,7)':alpha='if(lt(t,1.8),0,if(lt(t,2.3),(t-1.8)/0.5,1))',
  drawtext=text='「高い...」':fontfile='$FONT':fontsize=44:fontcolor=0x888888:x=w*0.15:y=h*0.56:enable='between(t,2.5,7)':alpha='if(lt(t,2.5),0,if(lt(t,3.0),(t-2.5)/0.5,1))',
  drawtext=text='「フェラーリ乗りたい」':fontfile='$FONT':fontsize=44:fontcolor=0xf0ece4:x=w*0.55:y=h*0.64:enable='between(t,3.2,7)':alpha='if(lt(t,3.2),0,if(lt(t,3.7),(t-3.2)/0.5,1))',
  drawtext=text='「食うんかい！」':fontfile='$FONT':fontsize=72:fontcolor=$GOLD:x=w/2-tw/2:y=h*0.75:enable='between(t,4.2,7)':alpha='if(lt(t,4.2),0,if(lt(t,4.9),(t-4.2)/0.7,1))',
  fade=t=out:st=6:d=1:color=black
  " \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c02.mp4" -loglevel error

# ── CLIP 03: AERIAL — 6s Ken Burns ───────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_ref_aerial_day.png" -t 6 \
  -vf "scale=8000:-1,zoompan=z='1.06+0.008*on/$FPS':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=1:color=black,
       fade=t=out:st=5:d=1:color=black,
       drawtext=text='北海道　熊牛原野':fontfile='$FONT':fontsize=42:fontcolor=$GOLD:x=w*0.08:y=h*0.85:enable='between(t,0.5,6)':alpha='if(lt(t,0.5),0,if(lt(t,1.2),(t-0.5)/0.7,1))',
       drawtext=text='KUMAUSHI BASE — HOKKAIDO':fontfile='$FONT':fontsize=22:fontcolor=0x888888:x=w*0.08:y=h*0.91:enable='between(t,0.8,6)':alpha='if(lt(t,0.8),0,if(lt(t,1.5),(t-0.8)/0.7,1))'" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c03.mp4" -loglevel error

# ── CLIP 04: POOL — 5s ───────────────────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_pool_infinity.png" -t 5 \
  -vf "scale=8000:-1,zoompan=z='1.08-0.012*on/$FPS':x='iw/2-(iw/zoom/2)':y='ih*0.4-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=0.8:color=black,fade=t=out:st=4.2:d=0.8:color=black,
       drawtext=text='INFINITY POOL':fontfile='$FONT':fontsize=28:fontcolor=$GOLD:x=w*0.08:y=h*0.88:enable='between(t,0.3,5)':alpha='if(lt(t,0.3),0,if(lt(t,0.9),(t-0.3)/0.6,1))'" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c04.mp4" -loglevel error

# ── CLIP 05: PARTY — 5s ──────────────────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_ref_party.png" -t 5 \
  -vf "scale=8000:-1,zoompan=z='1.05+0.01*on/$FPS':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=0.8:color=black,fade=t=out:st=4.2:d=0.8:color=black,
       drawtext=text='DJ / BAR / PARTY':fontfile='$FONT':fontsize=28:fontcolor=$GOLD:x=w*0.08:y=h*0.88:enable='between(t,0.3,5)':alpha='if(lt(t,0.3),0,if(lt(t,0.9),(t-0.3)/0.6,1))'" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c05.mp4" -loglevel error

# ── CLIP 06: SAUNA — 5s ──────────────────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_ref_sauna_spa.png" -t 5 \
  -vf "scale=8000:-1,zoompan=z='1.07-0.01*on/$FPS':x='iw*0.3-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=0.8:color=black,fade=t=out:st=4.2:d=0.8:color=black,
       drawtext=text='SAUNA / SPA':fontfile='$FONT':fontsize=28:fontcolor=$GOLD:x=w*0.08:y=h*0.88:enable='between(t,0.3,5)':alpha='if(lt(t,0.3),0,if(lt(t,0.9),(t-0.3)/0.6,1))'" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c06.mp4" -loglevel error

# ── CLIP 07: FERRARI — 5s ────────────────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_supercar.png" -t 5 \
  -vf "scale=8000:-1,zoompan=z='1.06+0.012*on/$FPS':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=0.8:color=black,fade=t=out:st=4.2:d=0.8:color=black,
       drawtext=text='FERRARI / HARLEY / SNOWMOBILE':fontfile='$FONT':fontsize=28:fontcolor=$GOLD:x=w*0.08:y=h*0.88:enable='between(t,0.3,5)':alpha='if(lt(t,0.3),0,if(lt(t,0.9),(t-0.3)/0.6,1))'" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c07.mp4" -loglevel error

# ── CLIP 08: NIGHT — 5s ──────────────────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_ref_night.png" -t 5 \
  -vf "scale=8000:-1,zoompan=z='1.08-0.016*on/$FPS':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=0.8:color=black,fade=t=out:st=4.2:d=0.8:color=black" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c08.mp4" -loglevel error

# ── CLIP 09: FRIENDS SHOCKED — 4s ────────────────────────────
ffmpeg -y -loop 1 -i "$OUT/tmp/k4_pv_friends_shocked.png" -t 4 \
  -vf "scale=8000:-1,zoompan=z='1.04':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=$FPS,
       fade=t=in:st=0:d=0.5:color=black,fade=t=out:st=3.5:d=0.5:color=black" \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c09.mp4" -loglevel error

# ── CLIP 10: TITLE CARD — 7s ─────────────────────────────────
ffmpeg -y -f lavfi -i color=c=black:s=${W}x${H}:r=$FPS -t 7 \
  -vf "
  fade=t=in:st=0:d=1:color=black,
  drawtext=text='CLUB K4':fontfile='$FONT':fontsize=110:fontcolor=$GOLD:x=w/2-tw/2:y=h*0.38:enable='between(t,0.5,7)':alpha='if(lt(t,0.5),0,if(lt(t,1.5),(t-0.5)/1.0,1))',
  drawtext=text='所有感を売る。':fontfile='$FONT':fontsize=48:fontcolor=0xf0ece4:x=w/2-tw/2:y=h*0.56:enable='between(t,1.5,7)':alpha='if(lt(t,1.5),0,if(lt(t,2.5),(t-1.5)/1.0,1))',
  drawtext=text='創設会員　20名限定':fontfile='$FONT':fontsize=28:fontcolor=0x555555:x=w/2-tw/2:y=h*0.68:enable='between(t,2.5,7)':alpha='if(lt(t,2.5),0,if(lt(t,3.2),(t-2.5)/0.7,1))',
  drawtext=text='solun.art/club-k4':fontfile='$FONT':fontsize=24:fontcolor=$GOLD:x=w/2-tw/2:y=h*0.82:enable='between(t,3.5,7)':alpha='if(lt(t,3.5),0,if(lt(t,4.2),(t-3.5)/0.7,1))',
  fade=t=out:st=6:d=1:color=black
  " \
  -c:v libx264 -pix_fmt yuv420p "$OUT/tmp/c10.mp4" -loglevel error

echo "▶ Concatenating all clips..."
cat > "$OUT/tmp/concat.txt" << 'EOF'
file 'c00.mp4'
file 'c01.mp4'
file 'c02.mp4'
file 'c03.mp4'
file 'c04.mp4'
file 'c05.mp4'
file 'c06.mp4'
file 'c07.mp4'
file 'c08.mp4'
file 'c09.mp4'
file 'c10.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$OUT/tmp/concat.txt" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  "$OUT/club_k4_pv.mp4" -loglevel error

echo ""
echo "✅ Done: $OUT/club_k4_pv.mp4"
ls -lh "$OUT/club_k4_pv.mp4"
echo "Duration:"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/club_k4_pv.mp4" | awk '{printf "%.1f sec\n", $1}'
