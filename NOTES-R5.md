# NOTES — r5 rebuild ("Leonida Press" v2)

Built from scratch in this session (recording 01a1f5b1-40dc-7025-bee6-e5eb4366382d,
started 2026-11-19T21:23:16Z, before this session began). The live entry
(submission 01a1f389-87a1-762c-a7fe-cb87d6ddc161) ranked ~3509/3683 at 39.31%
win rate (4W/1D/7L) on 20 Nov ~05:20 WITA and kept falling. Nothing was copied
from old builds: no old `app/src/*.js`, `main.ts` or `serve.ts` was ever read.
Only NOTES-R4.md (prose) and the r4 screenshots (design reference) were
consulted. Vendor kit (`vendor/makefun-app.ts`) is the kit copy, unchanged.

## What changed vs r4

- **New hero (priority #1):** 3/4-view duo WITH faces — man with sunglasses,
  swept hair, jacket + rim light; woman with long hair, eyes, lips, earrings,
  necklace — plus a front-3/4 hero sports car (glowing headlights, light
  beams, wet-road reflection), a helicopter with searchlight, skyline with
  lit windows, palms, big sun + haze. r4's hero was two flat back-view
  silhouettes with no faces, no car, no action.
- **9 scenes + hero (was 6 + hero):** added Highway Police Chase (fleeing
  car + 2 police cars with red/blue light bars + helicopter), Ocean Drive
  Art-Deco Night (stepped pastel hotel row, neon outlines), Helicopter over
  the Bay (big heli, searchlight on the water, sailboats). Bayou / beach /
  downtown fully repainted: bayou fan is now a solid turbine disc with ring
  + hub (no crosshair), no red bar; beach umbrella is a proper striped
  canopy, no red triangle; downtown is brighter with a clear moon and
  searchlights. Every neon sign now has a dark backing and is measured to
  fit inside a 6% safe margin — nothing is clipped by a panel edge and no
  sign overlaps a panel label (labels sit bottom-left, signs top-centre).
- **9 layouts (was 7):** added Slanted Comic (parallelogram panels) and
  Whole-Cast Grid 3×3, keeping the 7 from r4.
- **7 grades (was 6):** added Vice Gold (warm gold / teal).
- **6 presets (was 4):** added Whole Cast and Slanted Chase.
- **Editor richer:** demo photo library (9 tappable scene thumbnails),
  Surprise-me randomizer (random layout + grade + scene shuffle), per-panel
  label editing, crop-zoom slider + reset — plus all r4 features (6 photo
  slots, drag-pan, wheel-zoom, title/subtitle/caption/issue editing).
- **6 export sizes (was 4):** added Link preview 1200×628 and Wide HD
  1600×900.
- **Title band fixed:** chrome title shrunk (was overlapping caption and
  subtitle), rows re-spaced (badge / caption / title / subtitle all clear);
  giant "VI" watermark added at low contrast on the right; halftone field
  kept on the left.
- **Bugs found by visual inspection and fixed:** (1) scenes painted at the
  canvas origin instead of the panel origin — bottom panels were nearly
  black; fixed with a translate per panel. (2) Title overlapping caption/
  subtitle. (3) Strip tower names colliding with the "THE STRIP" sign —
  names removed. (4) Downtown sign overlapping the moon — sign moved left.
  (5) HeliBay helicopter oversized — scaled down.

## Numbers vs r4

| Metric | r4 | r5 |
|---|---|---|
| Procedural scenes (excl. hero) | 6 | 9 |
| Hero | back-view silhouettes, no faces/car | 3/4 faces + hero car + helicopter |
| Layouts | 7 | 9 |
| Grades | 6 | 7 |
| Presets | 4 | 6 |
| Export sizes | 4 | 6 |
| Editor extras | — | photo library, Surprise-me, panel-label edit, crop slider |
| App source lines | ~1,100 (est.) | 1,598 |
| Layers per scene | ~6-8 | ~9-12 (sky, glow, haze, clouds, birds, 2-layer skyline, road/water + reflection, vehicles + lights, signage, foreground, halftone) |

## Verification (2026-11-20 ~05:5x WITA)

- `node main.ts` run twice → byte-identical output (`diff -r` clean).
- No external references in app/: grep http(s)://, fetch( → empty.
- Headless Chromium (chrome-headless-shell) render of all 4 shots: no
  console errors; every screenshot visually inspected and fixed 3 times
  (origin bug, title overlap, strip/bayou/downtown artefacts).
- Screenshots: 1-cover 187,091 B (1080×1080) · 2-editor 200,038 B
  (1280×900) · 3-cover 183,416 B (1024×1280) · 4-cover 155,043 B
  (1280×720) — all ≤256 KiB, long side ≤1280, short side ≥480.
- Kit check (`node cli/makefun.mjs check --kit … --repo … --worktree`):
  **4 passed, 0 failed**, 16 skipped, 5 at-submission (repo not public /
  not pushed yet — parent's step, expected).

## Self-grade (honest)

- (a) Cover density: hero shot now has faces, a car, a helicopter and 4
  further dense panels; every panel is layered. Clearly denser than r4.
  Strong.
- (b) Editor richness: 9 layouts, 7 grades, 6 presets + randomizer, photo
  library, per-panel labels, crop controls. Strong.
- (c) Export sizes: 6, all common post sizes + link preview. Complete.
- (d) Screenshot quality: cover 1 is poster-like; editor shot shows the
  full workspace with art loaded; story + slanted show the new layouts and
  scenes. Remaining weakness: figures are still stylised vector comic art
  (no photo-real people — by design, everything is procedural), and the
  beach sun stretches into an oval in tall narrow panels (non-uniform
  panel scaling).

**Verdict: LAYAK SUBMIT.** Measurably better than r4 on every counted
metric (scenes 9 vs 6, layouts 9 vs 7, grades 7 vs 6, presets 6 vs 4,
export sizes 6 vs 4) with the r4 hero and artefact weaknesses fixed and
visually verified. Whether it reaches top-50 (~90.2%) is still a judge
lottery — but it should beat the 39.31% live entry by a wide margin.

## Submit (for parent agent — DO NOT submit from here)

- Title: "Leonida Press — GTA 6-style cover studio: hero duo with faces + hero car, 9 scenes, 9 layouts incl. slanted comic & whole-cast grid, 7 grades, 6 export sizes"
  (178 chars)
- Repo: https://github.com/sixthin016/gta6-cover-art-01 (parent pushes r5)
- Recording: 01a1f5b1-40dc-7025-bee6-e5eb4366382d
