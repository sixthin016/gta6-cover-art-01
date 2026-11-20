// Fixed scenes for screenshots: ?shot=cover shows the cover alone at the
// requested size; ?shot=editor shows the editor with demo art loaded.
// window.__shotReady is set once the cover has been painted twice.
import { PRESETS, defaultPanels } from './cover.js';

export function runShot(query, state, ui) {
  const presetKey = query.get('preset') || 'sunset';
  const layoutKey = query.get('layout');
  const gradeKey = query.get('grade');
  if (presetKey && PRESETS[presetKey]) ui.applyPreset(presetKey);
  if (layoutKey) {
    state.layout = layoutKey;
    state.panels = defaultPanels(layoutKey);
  }
  if (gradeKey) state.grade = gradeKey;
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('caption')) state.caption = query.get('caption');
  if (query.get('shot') === 'cover') document.body.classList.add('shot-cover');
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('caption').value = state.caption;
  document.getElementById('issue').value = state.issue;
  document.getElementById('layout').value = state.layout;
  document.getElementById('grade').value = state.grade;
  ui.syncPanelEditor();
  ui.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ui.redraw();
    window.__shotReady = true;
    document.title = 'shot-ready';
  }));
}
