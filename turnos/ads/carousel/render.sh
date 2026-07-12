#!/bin/bash
# Render del carrusel -> PNG 4:5 (1080×1350) a 2×. Chrome headless, fuentes locales.
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "$0")" && pwd)"; mkdir -p "$DIR/renders"
render(){
  local file="$1" out="$2"; local path="${DIR}/renders/${out}"; rm -f "$path"
  local prof; prof="$(mktemp -d)"
  "$CHROME" --headless=old --disable-gpu --hide-scrollbars --no-sandbox \
    --force-device-scale-factor=2 --default-background-color=00000000 \
    --window-size=1080,1350 --virtual-time-budget=2500 \
    --user-data-dir="$prof" --screenshot="$path" "file://${DIR}/${file}" >/dev/null 2>&1 &
  local pid=$!; local last=-1 cur=0 stable=0
  for i in $(seq 1 60); do
    if [ -s "$path" ]; then cur=$(stat -f%z "$path" 2>/dev/null||echo 0)
      if [ "$cur" = "$last" ]; then stable=$((stable+1)); else stable=0; fi
      [ "$stable" -ge 2 ] && break; last=$cur; fi; sleep 0.3
  done
  kill "$pid" 2>/dev/null; wait "$pid" 2>/dev/null; rm -rf "$prof"
  echo "  ✓ ${out}"
}
for f in "$DIR"/iman-turnos_carrusel_*.html; do
  render "$(basename "$f")" "$(basename "$f" .html).png"
done
echo "CARRUSEL LISTO — $(ls "$DIR"/renders/*.png 2>/dev/null|wc -l|tr -d ' ') PNGs (4:5)"
