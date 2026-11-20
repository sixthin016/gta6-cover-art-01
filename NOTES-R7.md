# NOTES-R7 — Neon Coast Cover Studio (round 4)

Built 2026-11-20 in this session under recording 01a1f774-a5d8-77ff-94ca-58b36c20d863.
Repo: https://github.com/sixthin016/gta6-cover-art-01 — NOT submitted.

## What was built

A from-scratch offline web app (`app/`, 16 files, 1.87 MB) that turns real
photos into GTA-style multi-panel cover art:

- **Real photos as the default first paint.** 8 photos bundled and
  auto-loaded: the 2 kit samples (`boulevard.jpg`, `pier.jpg`) + 6
  photorealistic images generated for this entry (bespectacled driver at
  golden hour, laughing couple on a neon street, neon street, orange sports
  car, speedboat, palm beach). The procedural demo art is a hidden fallback
  only — it never renders by default.
- **Striped chrome 3D title** (`app/src/cover.js` `drawChromeTitle`): Anton
  (OFL, bundled TTF), per-glyph white→yellow→orange→magenta→purple sunset
  stripe, sharp white keyline, dark-magenta 3D extrusion, 3 sparkles.
  Pacifico script subtitle in glowing pink.
- **Full poster furniture**, all editable/toggleable: press-quote bar +
  5 gold stars, VOL. 01 tab, tagline pill, per-panel role-tag ribbons
  (THE DRIVER / THE INSIDER / THE COURIER …), billing block, gold starburst
  "ORIGINAL COVER ART" seal, barcode.
- **9 layouts** (Slanted Comic, Classic Trio, Hero Duo, Triptych,
  Whole-Cast 3×3 Grid, Spotlight, Film Strip, Split Run, Poster Lead),
  **7 grades** (Sunset, Neon Vice, Golden Hour, Teal Noir, Magenta Rush,
  Palm Dusk, Mono Chrome), **6 presets**, **6 export sizes**.
- **Editor**: click a panel to select it, drag to pan, scroll/slider to
  zoom, per-panel role text, photo library + multi-upload (uploads stay on
  the machine), undo/redo, "Surprise me" randomizer, "Export All 3 Sizes"
  (1920×1080 / 1080×1350 / 1080×1080 in one click).
- **9 procedural demo scenes** (`app/src/scenes.js`) as the fallback library.
- `main.ts` / `serve.ts` written fresh in this session; `vendor/makefun-app.ts`
  is the kit copy, byte-identical (verified with diff); LICENSE MIT from the
  starter; README carries all three live make.fun badges.

## Verification (all done 2026-11-20, before commit)

- **Screenshots — all 4 viewed by me, defects fixed.** One real defect found
  and fixed: on the 1920×1080 landscape export the title was sized from
  width only, so the script subtitle overlapped the title glyphs and the
  stars clipped at the top. Fixed by stacking the title block vertically
  (title size capped by height too, subtitle under the baseline, pill under
  that) and basing furniture font sizes on `min(W, H)`. Re-rendered and
  re-viewed: clean on portrait, landscape, and square.
- **Screenshots** (all ≤ 256 KiB, long side ≤ 1280, short side ≥ 480):
  - `1-editor.jpg` 1280×800, 147,045 B — editor, real photos loaded, full
    poster in preview, no selection overlay, no helper text.
  - `2-cover-1080x1350.jpg` 1024×1280, 194,602 B — clean export, slanted
    comic, Sunset grade.
  - `3-cover-1920x1080.jpg` 1280×720, 134,471 B — clean export, classic
    layout, Golden Hour, "VICE NIGHTS".
  - `4-variant.jpg` 1024×1024, 212,231 B — second variant, 3×3 grid,
    Magenta Rush, "THE WHOLE CREW".
- **Offline**: grep over `app/` finds no `http://`, `https://`, `fetch(` or
  external import (only a relative `import('./cover.js')`). Fonts + photos
  bundled locally.
- **Determinism**: `main.ts` run twice → `diff -r` clean, byte-identical
  output. Dossier 979,727 bytes (< 1.5 MiB cap).
- **Kit check** (`node cli/makefun.mjs check --kit . --repo … --worktree`):
  **4 passed, 0 failed**, 17 skipped (transcript checks, site-side), 5
  "at submission" (repo_public / repo_owner / repo_created_after_open /
  commit_in_repo / duplicate_snapshot — resolved by the site at submit time
  after this push).
- **Plain load** (no `?shot`): no console/page errors; Export All click
  runs without throwing. `app/` has 16 files, 0 symlinks.

## Self-grade vs the round-5 floor

- Floor kept: 9 procedural scenes ✓, 9 layouts incl. slanted comic + 3×3
  grid ✓, 7 grades ✓, 6 presets ✓, 6 export sizes ✓, faced hero duo +
  sports-car hero ✓, editor with photo slots + drag-pan + wheel-zoom +
  editable text + photo library + crop-zoom slider ✓.
- Above the floor: real photos are now the default first paint (the
  verdict's biggest lever); chrome 3D striped title + script subtitle;
  complete poster furniture (press quote + stars, VOL tab, tagline pill,
  billing, seal, barcode); "Export All 3 Sizes" one-click; undo/redo;
  randomizer; title block that adapts to every aspect ratio.
- Honest limits: the judge still compares against ~4,700 entries and the
  top-50 cutoff is ~91% win rate; this entry's art is photographic and
  complete, but I cannot verify a win rate locally. The bottom band of the
  portrait cover is a large flat sunset gradient (panels end at 85.5%,
  billing at ~89.5%) — acceptable breathing room, but a busier lower third
  could look richer. The 1200×628 size is only exercised by the layout math,
  not screenshotted.
