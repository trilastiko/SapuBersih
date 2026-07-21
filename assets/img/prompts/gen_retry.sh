#!/usr/bin/env bash
# Retry failed generations with STAGGERED createTask calls (avoids rate-limit burst).
SKILL="/root/.claude/skills/nano-banana-images"
P="/home/user/SapuBersih/assets/img/prompts"
OUT="/home/user/SapuBersih/assets/img"
LOG="$OUT/prompts/gen_retry.log"
: > "$LOG"

gen () {
  local name="$1"; local ar="$2"; local ext="$3"
  echo "[START] $name ($ar)" >> "$LOG"
  python3 -u "$SKILL/scripts/generate_kie.py" "$P/$name.json" "$OUT/$name.$ext" "$ar" >> "$LOG" 2>&1
  echo "[DONE:$?] $name -> $OUT/$name.$ext" >> "$LOG"
}

# Only retry the ones missing. Stagger each launch by 9s so createTask calls never burst.
for pair in "evidence-01:16:10:jpg" "evidence-02:16:10:jpg" "evidence-03:16:10:jpg" "evidence-04:16:10:jpg" "evidence-05:16:10:jpg" "evidence-06:16:10:jpg"; do
  name="${pair%%:*}"; rest="${pair#*:}"; ar="${rest%:*}"; ext="${rest##*:}"
  if [ -f "$OUT/$name.$ext" ]; then echo "[SKIP-exists] $name" >> "$LOG"; continue; fi
  gen "$name" "$ar" "$ext" &
  sleep 9
done
wait
echo "[ALL RETRY COMPLETE]" >> "$LOG"
ls -la "$OUT"/*.jpg "$OUT"/*.png >> "$LOG" 2>&1
