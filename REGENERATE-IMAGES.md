# REGENERATE-IMAGES.md

How to regenerate the SapuBersih demo image set, and what happens if generation is unavailable.

## The app never hard-depends on these images
Every image slot in the UI has a **pure-CSS placeholder fallback**. If a file under `assets/img/`
is missing, an `onerror` handler swaps in a styled placeholder (`.img-fallback`, defined in
`app.css` / rendered by `components.js`). The demo therefore runs and looks intentional **even with
zero images present** — nothing breaks, no broken-image icons appear. This matters for the offline,
zero-key guarantee.

## Regenerate all 8 (requires internet + the nano-banana skill's bundled API key)
```bash
cd /home/user/SapuBersih
bash assets/img/prompts/gen_all.sh        # hero (16:9) + empty-state (4:3), plus first evidence attempt
bash assets/img/prompts/gen_evidence.sh   # evidence-01..06 at 3:2 (the correct ratio)
```
Watch progress:
```bash
tail -f assets/img/prompts/gen_evidence.log
```

## Regenerate a single image
```bash
SKILL=/root/.claude/skills/nano-banana-images
python3 "$SKILL/scripts/generate_kie.py" \
  assets/img/prompts/evidence-03.json \
  assets/img/evidence-03.jpg "3:2"
```
If the command is cut off mid-poll, the task id is printed at the top — finish with:
```bash
python3 "$SKILL/scripts/get_kie_image.py" <taskId> assets/img/evidence-03.jpg
```

## Allowed aspect ratios (confirmed)
`1:1`, `3:2`, `4:3`, `5:4`, `16:9`. **`16:10` is rejected** — do not use it.

## Re-apply the evidence-06 payment redaction after regenerating it
```bash
python3 - <<'PY'
from PIL import Image, ImageDraw, ImageFont
p="assets/img/evidence-06.jpg"; im=Image.open(p).convert("RGB"); W,H=im.size
d=ImageDraw.Draw(im)
x1,y1,x2,y2=int(.300*W),int(.600*H),int(.665*W),int(.762*H)
d.rectangle([x1,y1,x2,y2],fill=(6,8,12)); d.rectangle([x1,y1,x2,y2],outline=(120,132,158),width=2)
try:
    f=ImageFont.load_default(); t="SALURAN PEMBAYARAN - DIREDAKSI"
    b=d.textbbox((0,0),t,font=f); tw,th=b[2]-b[0],b[3]-b[1]
    d.text(((x1+x2)/2-tw/2,(y1+y2)/2-th/2),t,fill=(180,190,208),font=f)
except Exception as e: print(e)
im.save(p,quality=88); print("ok")
PY
```

## Content rules for any regeneration
- Fictional & synthetic only. **No real domains, brands, logos, faces, or readable promotional offers.**
- Keep the redacted forensic-exhibit aesthetic (redaction bars, blur, evidence framing).
- Hero and empty-state must contain **no text**.
