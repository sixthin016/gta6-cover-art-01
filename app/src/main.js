// Leonida Press — editor: uploads, drag-to-pan, wheel-zoom, layouts, grades,
// presets, demo fill, 4-size PNG export. All photos stay on the user's machine.
import { LAYOUTS, GRADES, EXPORT_SIZES, drawCover, exportCoverPNG, layoutPanels } from './cover.js';
import { SCENES, renderSceneCanvas } from './scenes.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

const PRESETS = {
  sunset: { layout: 'poster', grade: 'sunset', title: 'SUNSET HEIST', subtitle: 'Vice City nights', caption: 'One last score under the palms.', heroDuo: true },
  neon: { layout: 'grid', grade: 'neon', title: 'NEON NIGHTS', subtitle: 'Pier 9 after dark', caption: 'The strip never sleeps.', heroDuo: false },
  noir: { layout: 'hero', grade: 'noir', title: 'NOIR DRIVE', subtitle: 'Downtown, 2 AM', caption: 'No witnesses. No regrets.', heroDuo: false },
  classic: { layout: 'magazine', grade: 'ink', title: 'VICE CLASSIC', subtitle: 'Leonida, 2026', caption: 'Welcome back to Vice City.', heroDuo: false },
};

function defaultPanels(layoutId) {
  const count = (LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0]).panels;
  return Array.from({ length: 6 }, (_, i) => ({
    photo: null, scene: SCENES[i % SCENES.length].id,
    ox: 0, oy: 0, zoom: 1, label: undefined, heroDuo: false,
  })).slice(0, Math.max(count, 1));
}

const state = {
  layout: 'poster',
  grade: 'sunset',
  title: 'SUNSET HEIST',
  subtitle: 'Vice City nights',
  caption: 'One last score under the palms.',
  issue: 'Issue 06 · Vice City · 2026',
  panels: defaultPanels('poster'),
};

let selected = 0;

function currentPanels() {
  const count = (LAYOUTS.find((l) => l.id === state.layout) ?? LAYOUTS[0]).panels;
  while (state.panels.length < count) {
    const i = state.panels.length;
    state.panels.push({ photo: null, scene: SCENES[i % SCENES.length].id, ox: 0, oy: 0, zoom: 1 });
  }
  return state.panels.slice(0, count);
}

function render() {
  drawCover(canvas, { ...state, panels: currentPanels() });
  renderPanelStrip();
}

function renderPanelStrip() {
  const strip = $('panels');
  strip.innerHTML = '';
  currentPanels().forEach((panel, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'panel-slot' + (i === selected ? ' selected' : '');
    btn.textContent = `Panel ${i + 1} · ${panel.photo ? 'PHOTO' : (panel.heroDuo ? 'DUO' : SCENES.find((s) => s.id === panel.scene)?.name ?? 'Scene')}`;
    btn.addEventListener('click', () => { selected = i; render(); });
    strip.appendChild(btn);
  });
  $('panelLabel').textContent = `Panel ${selected + 1} selected — drag on the cover to pan, scroll to zoom.`;
}

function setStatus(msg) { statusEl.textContent = msg; }

function bindControls() {
  const layoutSel = $('layout');
  LAYOUTS.forEach((l) => { const o = document.createElement('option'); o.value = l.id; o.textContent = `${l.name} · ${l.panels} panels`; layoutSel.appendChild(o); });
  layoutSel.value = state.layout;
  layoutSel.addEventListener('change', () => { state.layout = layoutSel.value; selected = 0; render(); });

  const gradeSel = $('grade');
  GRADES.forEach((g) => { const o = document.createElement('option'); o.value = g.id; o.textContent = g.name; gradeSel.appendChild(o); });
  gradeSel.value = state.grade;
  gradeSel.addEventListener('change', () => { state.grade = gradeSel.value; render(); });

  $('title').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('caption').addEventListener('input', (e) => { state.caption = e.target.value; render(); });
  $('issue').addEventListener('input', (e) => { state.issue = e.target.value; render(); });

  document.querySelectorAll('[data-preset]').forEach((b) => {
    b.addEventListener('click', () => {
      const p = PRESETS[b.dataset.preset];
      Object.assign(state, { layout: p.layout, grade: p.grade, title: p.title, subtitle: p.subtitle, caption: p.caption });
      state.panels = defaultPanels(p.layout);
      if (p.heroDuo) state.panels[0].heroDuo = true;
      selected = 0;
      $('layout').value = p.layout; $('grade').value = p.grade;
      $('title').value = p.title; $('subtitle').value = p.subtitle; $('caption').value = p.caption;
      render();
      setStatus(`Preset applied: ${b.textContent.trim()}`);
    });
  });

  $('fillDemo').addEventListener('click', () => {
    fillDemoPhotos();
    render();
    setStatus('Demo photos loaded into every panel — replace any panel with your own photo.');
  });

  $('photo').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImageFile(file);
    const panel = currentPanels()[selected];
    panel.photo = img; panel.ox = 0; panel.oy = 0; panel.zoom = 1;
    render();
    setStatus(`Photo loaded into Panel ${selected + 1}. Drag to pan, scroll to zoom.`);
    e.target.value = '';
  });

  $('clearPhoto').addEventListener('click', () => {
    const panel = currentPanels()[selected];
    panel.photo = null; panel.ox = 0; panel.oy = 0; panel.zoom = 1;
    render();
    setStatus(`Panel ${selected + 1} back to its procedural scene.`);
  });

  document.querySelectorAll('[data-export]').forEach((b) => {
    b.addEventListener('click', async () => {
      setStatus(`Exporting ${b.dataset.export}…`);
      const blob = await exportCoverPNG({ ...state, panels: currentPanels() }, b.dataset.export);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leonida-press-${b.dataset.export}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setStatus(`Exported leonida-press-${b.dataset.export}.png`);
    });
  });

  // Drag to pan + wheel to zoom on the selected panel.
  let dragging = false, lastX = 0, lastY = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const panel = currentPanels()[selected];
    const rect = canvas.getBoundingClientRect();
    panel.ox += (e.clientX - lastX) / rect.width;
    panel.oy += (e.clientY - lastY) / rect.height;
    lastX = e.clientX; lastY = e.clientY;
    render();
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = currentPanels()[selected];
    panel.zoom = Math.min(3, Math.max(0.6, panel.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
    render();
  }, { passive: false });
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

// Demo photos: the procedural scenes rendered as images, one per panel,
// each rendered at its panel's own aspect ratio so no strip is a thin slice.
// Panels flagged heroDuo keep the comic duo instead of a photo.
export function fillDemoPhotos() {
  const rects = layoutPanels(state.layout, 1080, 1080);
  currentPanels().forEach((panel, i) => {
    if (panel.heroDuo) { panel.photo = null; return; }
    const scene = SCENES[(i + 1) % SCENES.length];
    const r = rects[i] ?? { w: 900, h: 900 };
    panel.photo = renderSceneCanvas(scene.id, Math.max(2, Math.round(r.w)), Math.max(2, Math.round(r.h)));
    panel.scene = scene.id;
    panel.label = scene.label;
    panel.ox = 0; panel.oy = 0; panel.zoom = 1;
  });
}

export function applyShotState(query) {
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('caption')) state.caption = query.get('caption');
  if (query.get('preset')) {
    const p = PRESETS[query.get('preset')];
    if (p) { Object.assign(state, { layout: p.layout, grade: p.grade, title: p.title, subtitle: p.subtitle, caption: p.caption }); state.panels = defaultPanels(p.layout); if (p.heroDuo) state.panels[0].heroDuo = true; }
  }
  $('layout').value = state.layout; $('grade').value = state.grade;
  $('title').value = state.title; $('subtitle').value = state.subtitle; $('caption').value = state.caption;
}

const query = new URLSearchParams(location.search);
bindControls();
applyShotState(query);
fillDemoPhotos();
render();
if (query.get('shot')) {
  runShot(query.get('shot'), query, () => render());
}
