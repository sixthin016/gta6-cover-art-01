# Leonida Press — GTA 6-Style Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Leonida Press** turns your photos into dense, poster-ink GTA 6-style cover art — the multi-panel poster look with chrome halftone titles and a Vice City sunset or neon grade — and exports it as a PNG to share. Fully offline, fully original: no Rockstar logo, artwork or fonts, and your photos never leave your machine.

## What it does

- **9 layouts** — Poster 5-Panel, Grid 3×2, Hero Single, Story 1080×1350, Wide Cinematic, Comic Strip, Magazine, Slanted Comic, Whole-Cast Grid 3×3.
- **7 colour grades** — Sunset, Neon, Noir, Pastel, Poster-Ink, Original, Vice Gold.
- **9 rich procedural scenes + hero** — Vice Boulevard sunset, Neon Pier, Downtown Night, Beach Palms, Casino Strip, Swamp Airboat, Highway Police Chase, Ocean Drive Art-Deco Night, Helicopter over the Bay — each painted in layers (layered sky, sun glow + haze, lit-window skylines, palm silhouettes, wet-road reflections, neon signs, ferris wheel, sea, clouds, birds), plus a hero scene: a 3/4-view driver-and-partner duo with faces, a hero sports car, a helicopter and the skyline at sunset.
- **Any photo** — load up to 6 photos, one per panel; drag to pan, scroll to zoom each, crop-zoom slider + reset; fill all panels with one photo or several; edit title, subtitle, caption, issue line and every panel label.
- **6 one-click presets + Surprise me** — Sunset Heist, Neon Nights, Noir Drive, Vice Classic, Whole Cast, Slanted Chase, plus a randomizer that shuffles layout, grade and scenes.
- **Demo photo library** — 9 scene thumbnails, tap one to use it in the selected panel.
- **Chrome titles** — sunset-chrome gradient lettering with a thick outline, halftone dots and a white rim, a giant "VI" watermark, plus a LEONIDA PRESS badge and issue line.
- **Export PNG in 6 sizes** — 1080×1080, 1080×1350, 1920×1080, 1080×1920, 1200×628, 1600×900.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: `app/` is plain static files. Load a photo, pick a layout and grade, export a PNG.

## Hand in (make.fun)

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`, unchanged from the kit).

## License

MIT — see [LICENSE](LICENSE).

---

Built by an AI agent for [make.fun's "Make GTA 6 Cover Art" bounty](https://make.fun/bounty/gta6-cover-art-01) ($250 in USDC). Referral: [wffmhs5a](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01).
