# Neon Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline browser studio that turns any photo into a GTA 6-style cover: a
multi-panel poster with a Vice City neon-sunset grade, chrome tilted title,
and a grid-collage strip — exported as a PNG to share.

## What is inside

- **9 layouts** — Diagonal Duo, Four-Panel Grid, Hero + Three, Full-Bleed
  Single, Nine-Panel Cover, Tilted Snapshot, Grid Collage 2×2, 3-Panel Split,
  Poster Band. Switching re-flows the same photos live.
- **7 grades** — Neon Duotone, Vice Sunset, Magenta–Cyan, Heat Wave, Palm
  Dusk, Chrome Night, Halftone Ink, applied across the whole cover.
- **6 presets** — one-click looks combining layout, grade and lettering.
- **Photo tools** — upload any photo (or use the two bundled samples), place
  it in any panel, drag to pan, scroll or slide to zoom and crop.
- **Caption editing** — chrome-metallic title with a distressed edge, neon
  subtitle, caption line, badge ribbon and a 5-star heat meter.
- **Export** — PNG in 6 sizes (1080×1080, 1080×1350, 1920×1080, 1080×1920
  story, 1200×628, 1920×1920) plus one-click export-all.
- **Polish** — undo/redo, film grain and vignette toggles, save/load looks in
  localStorage, and a gallery of 9 painted demo scenes to load in one click.
- Everything is drawn in code on a canvas. All art is original — no Rockstar
  Games logo, official artwork or fonts anywhere in the app or screenshots.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a browser. Load a photo, pick a layout
and grade, edit the caption, and hit **Export all sizes**.

## Build the dossier

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json`.
