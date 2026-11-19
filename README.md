# Leonida Press — GTA 6-Style Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sixthin016/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Leonida Press** turns your photos into dense, poster-ink GTA 6-style cover art — the multi-panel poster look with chrome halftone titles and a Vice City sunset or neon grade — and exports it as a PNG to share. Fully offline, fully original: no Rockstar logo, artwork or fonts, and your photos never leave your machine.

## What it does

- **7 layouts** — Poster 5-Panel, Grid 3×2, Hero Single, Story 1080×1350, Wide Cinematic, Comic Strip, Magazine.
- **6 colour grades** — Sunset, Neon, Noir, Pastel, Poster-Ink, Original.
- **6 rich procedural scenes** — Vice Boulevard sunset, Neon Pier, Downtown Night, Beach Palms, Casino Strip, Swamp Airboat — each painted in layers (layered sky, sun glow + haze, lit-window skylines, palm silhouettes, wet-road reflections, neon signs, ferris wheel, sea, clouds, birds), plus a comic hero sample: a rim-lit driver-and-partner duo at sunset.
- **Any photo** — load up to 6 photos, one per panel; drag to pan, scroll to zoom each; fill all panels with one photo or several; edit title, subtitle, caption and issue line.
- **4 one-click presets** — Sunset Heist, Neon Nights, Noir Drive, Vice Classic.
- **Chrome titles** — sunset-chrome gradient lettering with a thick outline, halftone dots and a white rim, plus a LEONIDA PRESS badge and issue line.
- **Export PNG in 4 sizes** — 1080×1080, 1080×1350, 1920×1080, 1080×1920.

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
