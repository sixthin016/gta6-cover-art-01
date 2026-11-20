# Neon Coast — GTA 6 Cover Art Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn any photo and a caption into a GTA 6-style multi-panel cover poster: a Vice City neon-sunset grade, a chrome striped title, role ribbons, a press-quote bar, a starburst seal and a billing block — exported as a PNG in six post sizes, all offline in your browser. Photos never leave your machine.

## What is inside

- **Face-aware auto-crop** — the studio finds the face in each photo (skin-tone clusters plus dark eye/mouth regions, pure canvas JavaScript, no network) and centres the crop on it. A pink ◎ marker shows the anchor; drag it to nudge, or hit "Re-centre on face" to re-run detection.
- **9 layouts** — four-panel grid, hero + three, full-bleed single, nine-panel cover grid, slanted comic, 2×2 collage, 3-panel split, diagonal hero and poster band. Switching re-flows the same photos live.
- **7 grades** — Vice City sunset, electric-blue / hot-pink duotone, magenta–cyan, heat, palm dusk, chrome night and halftone ink.
- **6 presets** — Neon Coast, Sunset Sleeve, Palm Poster, Heat Wave, Chrome Night and Halftone Press, each one click.
- **Caption editing** — a thick condensed italic chrome title with sunset stripes, a white keyline and a magenta 3D extrusion, plus a glowing pink neon script subtitle that always sits below the title with a clear gap. Size and height sliders, tagline pill, press quote, VOL. 01 tab, billing block and a second credits strip.
- **9 demo scenes** — night city, highway chase, club interior, beach boulevard, rooftop dusk, palm street, convertible, skyline and boardwalk, each one click.
- **Export** — PNG in 1080×1080, 1080×1350, 1920×1080, 1080×1920, 1200×628 and 1200×1500, plus "Export All 3 Sizes" in one click. Undo/redo, a "Surprise me" randomizer and save/load of your look in localStorage.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 — pick a photo (or use the bundled ones), choose a layout, grade and preset, edit the caption, and hit Export PNG.

## Originality

All art in this app is original, drawn by its own code from photos plus canvas. There is no Rockstar Games logo, no official artwork and no Rockstar font anywhere in the app or its screenshots.
