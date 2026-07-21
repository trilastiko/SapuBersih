#!/usr/bin/env bash
# Launch all 8 nano-banana image generations in parallel.
SKILL="/root/.claude/skills/nano-banana-images"
P="/home/user/SapuBersih/assets/img/prompts"
OUT="/home/user/SapuBersih/assets/img"
LOG="$OUT/prompts/gen.log"
: > "$LOG"

gen () {
  local name="$1"; local ar="$2"; local ext="$3"
  echo "[START] $name ($ar)" >> "$LOG"
  python3 -u "$SKILL/scripts/generate_kie.py" "$P/$name.json" "$OUT/$name.$ext" "$ar" >> "$LOG" 2>&1
  echo "[DONE:$?] $name -> $OUT/$name.$ext" >> "$LOG"
}

gen hero-cover   "16:9"  jpg &
gen empty-state  "4:3"   png &
gen evidence-01  "16:10" jpg &
gen evidence-02  "16:10" jpg &
gen evidence-03  "16:10" jpg &
gen evidence-04  "16:10" jpg &
gen evidence-05  "16:10" jpg &
gen evidence-06  "16:10" jpg &
wait
echo "[ALL COMPLETE]" >> "$LOG"
ls -la "$OUT"/*.jpg "$OUT"/*.png >> "$LOG" 2>&1
