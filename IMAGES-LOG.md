# IMAGES-LOG.md — SapuBersih demo image set

All images generated with **Nano Banana 2** (`nano-banana-2`) via the Kie.ai API using the
`nano-banana-images` skill. Prompt JSON for each lives in `assets/img/prompts/`.
Budget cap for this deliverable: **8 images. Used: 8/8.**

> Every evidence thumbnail is a **fictional, synthetic, redacted forensic artifact**. None depicts
> a real website, brand, logo, or readable promotional offer. They exist to illustrate the
> "captured evidence" concept in the demo UI, never to advertise gambling.

| # | File | Prompt JSON | Role | Aspect | Res | Notes |
|---|------|-------------|------|--------|-----|-------|
| 1 | `assets/img/hero-cover.jpg` | `prompts/hero-cover.json` | Intro/hero cover graphic | 16:9 | 2K | Abstract global network/nodes motif, dark government-tech tone, negative space lower third for headline. No text. |
| 2 | `assets/img/empty-state.png` | `prompts/empty-state.json` | Empty-state illustration | 4:3 | 1K | Minimal monoline magnifier + empty document grid. No text. |
| 3 | `assets/img/evidence-01.jpg` | `prompts/evidence-01.json` | Evidence capture — slot grid | 3:2 | 1K | Generic "CASINO" slot layout, black redaction bars, garbled synthetic text, forensic frame. |
| 4 | `assets/img/evidence-02.jpg` | `prompts/evidence-02.json` | Evidence capture — mythology theme | 3:2 | 1K | Invented robed thunder figure (no real character/brand), redaction bars. |
| 5 | `assets/img/evidence-03.jpg` | `prompts/evidence-03.json` | Evidence capture — live-casino table | 3:2 | 1K | Abstract dealer-table layout, no recognizable faces, redaction bars. |
| 6 | `assets/img/evidence-04.jpg` | `prompts/evidence-04.json` | Evidence capture — jackpot burst | 3:2 | 1K | Abstract coin-burst, all amounts pixelated/redacted. |
| 7 | `assets/img/evidence-05.jpg` | `prompts/evidence-05.json` | Evidence capture — lottery/number board | 3:2 | 1K | Numbered-ball grid, all numbers illegible, redaction bars. |
| 8 | `assets/img/evidence-06.jpg` | `prompts/evidence-06.json` | Evidence capture — login/deposit form | 3:2 | 1K | `EXHIBIT / CASE NO / CAPTURED BY` forensic chrome; payment-channel row **post-redacted** with a black bar (`SALURAN PEMBAYARAN — DIREDAKSI`) to remove semi-real card logos the model rendered. |

## Post-processing
- `evidence-06.jpg`: the model rendered a payment-methods row with semi-real card/wallet logos. Per the
  brief ("no real payment brand logos"), that row was overwritten with a forensic redaction bar via
  Pillow — see the one-off script inline in the build history. This is consistent with the redacted-exhibit aesthetic.

## Generation notes / gotchas (for regeneration)
- The Kie.ai `nano-banana-2` endpoint **rejects `aspect_ratio: "16:10"`** with
  `{"code":500,"msg":"This aspect_ratio is not within the range of allowed options"}` and returns
  `data:null`. Allowed ratios confirmed working: `1:1, 3:2, 4:3, 5:4, 16:9`. Evidence thumbnails use `3:2`.
- The bundled `generate_kie.py` does not surface that error gracefully (it crashes on the null payload).
  If a generation "fails" instantly, check the aspect ratio first.
- Launch generations **staggered** (a few seconds apart) rather than in a simultaneous burst.

See `REGENERATE-IMAGES.md` for exact regeneration commands and the CSS-placeholder fallback.
