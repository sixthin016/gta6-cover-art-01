# Neon Coast — GTA 6 Style Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn any photo into a GTA 6-style cover: a multi-panel poster with a Vice City
neon-sunset grade, bold chrome-striped lettering, and a one-click PNG export in
every post size. Everything runs offline in the browser — photos never leave
your machine.

## What is inside

- **Face-aware auto-crop** — when a photo lands in a panel, the app finds the
  face (skin-tone clusters, scored on a downscaled canvas, no network, no
  model) and centres the crop on it. The anchor is a draggable marker; a
  "Re-centre on face" button re-runs detection; no face means a centre crop
  and an honest note in the panel hint.
- **9 layouts** — hero-and-three, four-panel grid, full-bleed single,
  nine-panel cover grid, slanted comic, 2×2 grid-collage, 3-panel split,
  diagonal hero, poster band. Switching re-flows the same photos live.
- **7 grades** — Vice City sunset, electric duotone, magenta/cyan, heat, palm
  dusk, chrome night, halftone ink. One grade washes the whole cover.
- **6 preset looks** — Neon Coast, Sunset Sleeve, Palm Poster, Heat Wave,
  Chrome Night, Halftone Press: layout + grade + lettering in one click.
- **Caption editing** — thick condensed italic chrome title with a sunset
  stripe fill, white keyline and magenta 3D extrusion, a glowing pink neon
  script subtitle, editable tagline, title size and height controls, a heat
  meter of stars.
- **Poster furniture** — press-quote bar with five gold stars, VOL. 01 tab,
  tagline pill, per-panel role-tag ribbons, a gold serrated starburst seal
  reading "ORIGINAL COVER ART", a billing block plus a second credits strip,
  and a barcode. All toggleable.
- **Export** — PNG in 1080×1080, 1080×1350, 1920×1080, 1080×1920, 1200×630 and
  2048×1080, plus "Export All 3 Sizes" in one click. Undo/redo, grain and
  vignette toggles, a "Surprise me" randomizer, saved looks in localStorage,
  and 9 one-click demo scenes.
- **Real photos first** — the studio opens with photographic portraits,
  streets, cars and beaches already in the panels.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — pick a layout, a grade, a preset, type your
title, drag a photo into a panel, and hit Export.

## Originality

All art in this app is original and drawn by its own code from photos and
canvas. It uses no Rockstar Games logo, no official artwork, and no Rockstar
fonts. Lettering uses Anton and Pacifico under the SIL Open Font License.
