#!/usr/bin/env bash
# SapuBersih — local offline server helper.
# The demo also runs by opening index.html directly (file://), but a tiny
# local server is the most reliable way to present it. NO internet required.
set -e
PORT="${1:-8080}"
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "SapuBersih — menyajikan demo lokal (offline)"
echo "  Folder : $DIR"
echo "  URL    : http://localhost:$PORT"
echo "  (Ctrl+C untuk berhenti)"
echo

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
  exec python -m SimpleHTTPServer "$PORT"
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "$PORT" .
else
  echo "Tidak menemukan python/npx. Alternatif: buka index.html langsung di peramban (file://)."
  exit 1
fi
