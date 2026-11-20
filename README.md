# Neon Coast Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/c/gta6-cover-art-01)

A real-photo GTA 6 cover art maker — an offline web app that turns your photos into a multi-panel, Vice City neon-sunset poster and exports it as a PNG to share. Built for the [Make GTA 6 Cover Art competition on make.fun](https://make.fun/c/gta6-cover-art-01).

## What it does

- **Real photos first.** 8 photorealistic photos load with the app (a bespectacled driver at golden hour, a couple on a neon street, a sports car, a speedboat, a palm beach, and more) and fill the panels the moment the app opens. Upload your own photos too — they never leave your machine.
- **Striped chrome 3D titles.** The cover title is drawn per glyph in Anton with a white→yellow→orange→magenta→purple sunset stripe, a sharp white keyline, a dark-magenta 3D extrusion, and sparkles — plus a glowing Pacifico script subtitle.
- **Full poster furniture.** Press-quote bar with 5 gold stars, VOL. 01 tab, tagline pill, per-panel role tags (THE DRIVER, THE INSIDER, THE COURIER…), billing block, gold "ORIGINAL COVER ART" seal, and a barcode — every piece editable and toggleable.
- **9 layouts, 7 grades, 6 presets.** Slanted comic panels, Hero Duo, Triptych, Whole-Cast 3×3 grid, Spotlight, Film Strip, Split Run, Poster Lead, Classic Trio — each with 7 colour grades from Sunset to Neon Vice to Mono Chrome.
- **Crop and position per panel.** Click a panel to select it, drag to pan, scroll or slide to zoom, set its role tag, or swap it to one of 9 procedural demo scenes.
- **Fast to PNG.** One click exports all three post sizes — 1920×1080, 1080×1350, 1080×1080 — plus 3 more sizes, with undo/redo and a "Surprise me" randomizer.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: every script, font, and photo is a file under `app/`. Fonts are Anton and Pacifico under the SIL Open Font License, bundled in `app/fonts/`. The two kit sample photos (`boulevard.jpg`, `pier.jpg`) were made for make.fun and are free to use; the other six photos were made with an image model for this entry.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. Two runs produce byte-identical output.

## License

MIT — see [LICENSE](LICENSE).
