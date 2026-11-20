// Neon Coast Cover Studio — fixed scenes for screenshots.
// ?shot=editor shows the editor with the real-photo cast loaded and the
// poster fully composed in the preview. ?shot=cover / ?shot=variant show a
// clean exported cover alone. Every scene waits for fonts and photos, paints
// once, then sets window.__shotReady. No selection outline is ever painted
// in a shot: the highlight argument to render() is always -1 here.

import { SIZES } from './cover.js';

function waitFonts() {
  return Promise.race([
    Promise.all([
      document.fonts.load('900 100px Anton'),
      document.fonts.load('400 60px Pacifico'),
    ]).catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
}

export async function runShot(shot, query, app) {
  const isCover = shot === 'cover' || shot === 'variant';
  document.body.classList.add(isCover ? 'shot-cover' : 'shot-editor');

  const state = app.state();
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('quote')) state.quote = query.get('quote');
  if (query.get('size') && SIZES[query.get('size')]) state.size = query.get('size');

  await waitFonts();
  // Load the bundled photos (the same first paint the editor shows).
  const { PHOTO_LIBRARY } = await import('./cover.js');
  await Promise.all(PHOTO_LIBRARY.map(async (photo) => {
    try {
      app.images[photo.id] = await app.loadImage(photo.file);
    } catch {
      app.images[photo.id] = null;
    }
  }));

  app.buildLibrary();
  app.buildControls();
  app.redraw();
  // Repaint without the editor's selection outline.
  app.render(-1);

  const status = document.getElementById('status');
  if (status) status.textContent = 'Ready — 8 photos loaded. Pick a panel, drag to pan, scroll to zoom, then Export All 3 Sizes.';

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
