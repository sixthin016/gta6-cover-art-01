# Neon Coast — GTA 6 Cover Art Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline browser web app that turns your photos + a caption into a Vice City
neon-sunset cover poster — the multi-panel, chrome-title look of a game cover,
drawn live on canvas and exported as a PNG to share.

## What is inside

- **Face-aware auto-crop** — when a photo loads, an offline skin-tone clustering
  detector finds the face and centres the crop on it. The cyan anchor marker is
  draggable, and "Re-centre on face" re-runs the detection. Centre crop is the
  fallback when no face is found.
- **9 layouts** — Neon Coast hero-and-three, Four Panel, Full Bleed, Whole Cast
  3×3, Slanted Comic, Grid Collage, Three Split, Diagonal Hero, Poster Band.
- **7 grades** — Vice Sunset, Electric Duo, Magenta/Cyan, Heat, Palm Dusk,
  Chrome Night, Halftone Ink.
- **6 presets** — Neon Coast, Sunset Sleeve, Palm Poster, Heat Wave,
  Chrome Night, Halftone Press.
- **Poster furniture** — chrome striped 3D title with neon script subtitle,
  role-tag ribbons, press-quote bar with 5 gold stars, VOL. 01 tab, tagline
  pill, billing block, a second credits strip, gold "ORIGINAL COVER ART"
  seal and a barcode. All toggleable.
- **Export** — PNG in 6 sizes (1080×1080, 1080×1350, 1920×1080, 1080×1920,
  1200×1500, 1920×1920) plus one-click **Export All 3 Sizes**, undo/redo,
  a "Surprise me" randomizer and 9 one-click demo scenes.
- **Real photos first** — the studio opens with photographic portraits,
  street, car, boat and beach shots already loaded into the panels. You can
  upload any of your own photos instead; nothing ever leaves your machine.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080 — pick a layout, grade and preset, edit the
caption, and hit **Export PNG** (or **Export All 3 Sizes**).

## Originality

All art in this app is original and drawn by its own code from photos and
canvas. It contains no Rockstar Games logo, no official artwork and no
Rockstar fonts.
