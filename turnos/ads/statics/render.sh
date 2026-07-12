#!/bin/bash
# Render de statics -> PNG (1:1 1080 y 4:5 1350). Chrome escribe el screenshot
# en pocos segundos pero queda vivo ~60s: poleamos por PNG estable y lo matamos.
# Fuentes locales (../fonts) + UI real (../../css/app.css) → sin depender de red.
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DIR/renders"

render(){
  local file="$1" w="$2" h="$3" out="$4" query="$5"
  local path="${DIR}/renders/${out}"; rm -f "$path"
  local prof; prof="$(mktemp -d)"
  "$CHROME" --headless=old --disable-gpu --hide-scrollbars --no-sandbox \
    --force-device-scale-factor=2 --default-background-color=00000000 \
    --window-size="${w},${h}" --virtual-time-budget=2500 \
    --user-data-dir="$prof" --screenshot="$path" \
    "file://${DIR}/${file}${query}" >/dev/null 2>&1 &
  local pid=$!; local last=-1 cur=0 stable=0
  for i in $(seq 1 60); do
    if [ -s "$path" ]; then
      cur=$(stat -f%z "$path" 2>/dev/null || echo 0)
      if [ "$cur" = "$last" ]; then stable=$((stable+1)); else stable=0; fi
      [ "$stable" -ge 2 ] && break; last=$cur
    fi; sleep 0.3
  done
  kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null; rm -rf "$prof"
  echo "  ✓ ${out} ($(sips -g pixelWidth -g pixelHeight "$path" 2>/dev/null | awk '/pixelWidth/{x=$2}/pixelHeight/{print x"x"$2}'))"
}

# cada creative se renderiza en 4:5 (default) y 1:1 (?f=sq)
ONE="${1:-}"
for f in "$DIR"/iman-turnos_static_*.html; do
  base="$(basename "$f" .html)"
  [ -n "$ONE" ] && [ "$base" != "$ONE" ] && continue
  render "$(basename "$f")" 1080 1350 "${base}_4x5.png" ""
  render "$(basename "$f")" 1080 1080 "${base}_1x1.png" "?f=sq"
done
echo "STATICS LISTAS — $(ls "$DIR"/renders/*.png 2>/dev/null | wc -l | tr -d ' ') PNGs"
