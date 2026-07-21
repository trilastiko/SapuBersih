#!/usr/bin/env bash
SKILL="/root/.claude/skills/nano-banana-images"
P="/home/user/SapuBersih/assets/img/prompts"
OUT="/home/user/SapuBersih/assets/img"
LOG="$OUT/prompts/gen_evidence.log"
: > "$LOG"
gen(){ echo "[START] $1" >> "$LOG"; python3 -u "$SKILL/scripts/generate_kie.py" "$P/$1.json" "$OUT/$1.jpg" "3:2" >> "$LOG" 2>&1; echo "[DONE:$?] $1" >> "$LOG"; }
for n in evidence-01 evidence-02 evidence-03 evidence-04 evidence-05 evidence-06; do
  [ -f "$OUT/$n.jpg" ] && { echo "[SKIP] $n" >> "$LOG"; continue; }
  gen "$n" & sleep 3
done
wait
echo "[COMPLETE]" >> "$LOG"
ls -la "$OUT"/evidence-*.jpg >> "$LOG" 2>&1
