# NOTES — r4 rebuild ("Leonida Press")

Built from scratch in this session (recording 01a1f549-8699-722e-aec7-1a7a090fd504),
after the live entry (submission 01a1f389-87a1-762c-a7fe-cb87d6ddc161, commit 84efb3f6)
ranked 3308/3469 at 39.31% win rate (4W / 1D / 7L). Nothing was copied from the
old builds (gta6-cover-art-01, -recorded, -recorded2 were never opened).

## What changed vs the live entry

- **Scenes rewritten rich, not flat:** 6 procedural scenes (Vice Boulevard sunset,
  Neon Pier, Downtown Night, Beach Palms, Casino Strip, Swamp Airboat), each painted
  in layers — layered sky gradient, sun glow + haze bands, two-layer skyline with
  varied lit windows, palm silhouettes, wet-road reflections, cars with headlight /
  taillight glow, fitted neon signs, lit ferris wheel, sea with sun path, clouds,
  birds. Plus a comic hero sample: rim-lit driver + partner duo at sunset.
- **Layouts 7, grades 6** (was fewer): Poster 5-Panel, Grid 3×2, Hero Single,
  Story 1080×1350, Wide Cinematic, Comic Strip, Magazine; Sunset / Neon / Noir /
  Pastel / Poster-Ink / Original.
- **Title treatment:** chrome gradient lettering, thick dark outline, halftone dot
  field, white rim — plus LEONIDA PRESS badge, issue line, caption strip.
- **Editor:** 6 photo slots (upload per panel), drag-to-pan, wheel-zoom, title /
  subtitle / caption / issue editing, 4 one-click presets, fill-all-panels demo
  (demo photos are the scenes rendered at each panel's own aspect ratio, so no
  strip is a thin slice), 4 export sizes (1080×1080, 1080×1350, 1920×1080,
  1080×1920).
- **Title band fixed:** badge / caption / title / subtitle no longer overlap
  (band 24% of height, stacked).
- **Screenshots:** 4 (poster 1080×1080, editor 1280×900, story 1024×1280,
  wide 1280×720), all ≤256 KiB, all taken from the real app in headless Chromium,
  visually inspected and fixed twice (title-band overlap, story layout showing
  1 panel, strip slices, swamp cypress pills).

## Verification (2026-11-20 ~03:5x WITA)

- `node main.ts` run twice → byte-identical output (`diff -r` clean).
- No external references in app/: grep for http(s)://, fetch(, import( → empty.
- Headless Chromium render: no console errors on any of the 4 shots.
- Kit check (`node cli/makefun.mjs check --kit . --repo … --worktree`):
  4 passed, 0 failed — competition_open PASS, snapshot PASS (18 files,
  756,991 bytes), license_osi PASS (MIT), entrypoint PASS (node22).
  Note: kit is level 26, site is at level 27 (check's own note).
- Screenshots: 1-cover 162,222 B · 2-editor 210,336 B · 3-cover 150,274 B ·
  4-cover 112,363 B — all within gate limits.

## Self-grade (honest)

- (a) Cover density: 5 panels on the hero shot, 6 layered scenes + duo,
  chrome/halftone title, badge + issue + caption. Clearly denser than the live
  entry's flat blocks. Strong.
- (b) Editor richness: 7 layouts, 6 grades, 4 presets, 6 photo slots with
  pan/zoom, 4 text fields. Strong.
- (c) Export sizes: 4 (all common post sizes + story). Complete.
- (d) Screenshot quality: cover dense and poster-like; editor shot shows the
  full workspace with photos loaded; story + wide show the other sizes.
  Remaining weakness: figures/car are still simple vector shapes (no photo-real
  people — by design, everything is procedural), and neon signs at panel edges
  get cropped by cover-fit in a few panels.

**Verdict: JELAS LEBIH BAIK.** The live entry lost on thin, flat, empty art;
this one is dense, layered and poster-like in every screenshot, with more
layouts, grades and export sizes. Whether it reaches top-50 (~89.5%) is still
a judge lottery — but it should beat the 39.31% live entry by a wide margin.

## Submit (for parent agent — DO NOT submit from here)

- Title: "Leonida Press — GTA 6-style cover studio: 7 layouts, 6 grades,
  5-panel multi-photo covers, halftone chrome titles, PNG export 4 sizes"
  (141 chars)
- Repo: https://github.com/sixthin016/gta6-cover-art-01
- Recording: 01a1f549-8699-722e-aec7-1a7a090fd504
