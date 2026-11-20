// Editor wiring for Leonida Press r5: presets, layouts, grades, photo
// slots with pan/zoom/crop, panel-label editing, a demo photo library,
// Surprise-me, and PNG export in 6 sizes.
import { LAYOUTS, LAYOUT_KEYS, GRADES, GRADE_KEYS, PRESETS, PRESET_KEYS, EXPORT_SIZES, defaultState, defaultPanels, renderCover, renderExport } from './cover.js';
import { SCENES, SCENE_KEYS } from './scenes.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const state = defaultState();
let selected = 0;
let dragging = null;

window.addEventListener('error', (e) => {
  const el = $('console-errors');
  if (el) el.textContent += `ERROR: ${e.message}\n`;
});

function selectedPanel() { return state.panels[selected]; }

function redraw() {
  // canvas keeps the preview aspect of the chosen export preview size
  renderCover(canvas, state);
  $('status').textContent = `${LAYOUTS[state.layout].name} · ${GRADES[state.grade].name} · ${state.panels.length} panels · Panel ${selected + 1} selected — drag on the cover to pan a photo, scroll to zoom it.`;
  buildPanelButtons();
  buildLibrary();
}

function buildPanelButtons() {
  const wrap = $('panel-buttons');
  wrap.innerHTML = '';
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'panel-btn' + (i === selected ? ' active' : '');
    b.textContent = `Panel ${i + 1} · ${p.photo ? 'PHOTO' : SCENES[p.scene].name}`;
    b.addEventListener('click', () => { selected = i; syncPanelEditor(); redraw(); });
    wrap.appendChild(b);
  });
}

function syncPanelEditor() {
  const p = selectedPanel();
  $('panel-label').value = p.label;
  $('panel-scene').value = p.scene;
  $('zoom').value = Math.round((p.zoom - 1) * 100);
  $('zoom-val').textContent = `${Math.round(p.zoom * 100)}%`;
}

// Demo photo library: one thumbnail per scene, rendered by the app itself.
function buildLibrary() {
  const lib = $('library');
  if (lib.dataset.built) return;
  lib.dataset.built = '1';
  for (const key of SCENE_KEYS) {
    const cell = document.createElement('button');
    cell.type = 'button'; cell.className = 'lib-cell';
    cell.title = `Use ${SCENES[key].name} as the demo photo for the selected panel`;
    const thumb = document.createElement('canvas');
    thumb.width = 120; thumb.height = 80;
    const tctx = thumb.getContext('2d');
    SCENES[key].paint(tctx, 120, 80, 100);
    const cap = document.createElement('span');
    cap.textContent = SCENES[key].name;
    cell.append(thumb, cap);
    cell.addEventListener('click', () => {
      const p = selectedPanel();
      p.scene = key; p.label = SCENES[key].label; p.photo = null;
      syncPanelEditor(); redraw();
    });
    lib.appendChild(cell);
  }
}

function applyPreset(key) {
  const pr = PRESETS[key];
  state.layout = pr.layout; state.grade = pr.grade;
  state.title = pr.title; state.subtitle = pr.subtitle;
  state.caption = pr.caption; state.issue = pr.issue;
  state.panels = defaultPanels(pr.layout);
  selected = 0;
  $('title').value = state.title; $('subtitle').value = state.subtitle;
  $('caption').value = state.caption; $('issue').value = state.issue;
  $('layout').value = state.layout; $('grade').value = state.grade;
  syncPanelEditor(); redraw();
}

function surpriseMe() {
  const layout = LAYOUT_KEYS[Math.floor(Math.random() * LAYOUT_KEYS.length)];
  const grade = GRADE_KEYS[Math.floor(Math.random() * GRADE_KEYS.length)];
  const preset = PRESETS[PRESET_KEYS[Math.floor(Math.random() * PRESET_KEYS.length)]];
  state.layout = layout; state.grade = grade;
  state.title = preset.title; state.subtitle = preset.subtitle;
  state.caption = preset.caption; state.issue = preset.issue;
  state.panels = defaultPanels(layout);
  // shuffle the scenes across panels so the mix is never the same twice
  const keys = [...SCENE_KEYS];
  state.panels.forEach((p) => {
    const k = keys.splice(Math.floor(Math.random() * keys.length), 1)[0];
    p.scene = k; p.label = SCENES[k].label;
  });
  selected = 0;
  $('title').value = state.title; $('subtitle').value = state.subtitle;
  $('caption').value = state.caption; $('issue').value = state.issue;
  $('layout').value = state.layout; $('grade').value = state.grade;
  syncPanelEditor(); redraw();
}

// --- controls -------------------------------------------------------------
const layoutSel = $('layout');
for (const k of LAYOUT_KEYS) {
  const o = document.createElement('option'); o.value = k; o.textContent = LAYOUTS[k].name; layoutSel.appendChild(o);
}
layoutSel.value = state.layout;
layoutSel.addEventListener('change', () => {
  state.layout = layoutSel.value;
  state.panels = defaultPanels(state.layout);
  selected = 0; syncPanelEditor(); redraw();
});

const gradeSel = $('grade');
for (const k of GRADE_KEYS) {
  const o = document.createElement('option'); o.value = k; o.textContent = GRADES[k].name; gradeSel.appendChild(o);
}
gradeSel.value = state.grade;
gradeSel.addEventListener('change', () => { state.grade = gradeSel.value; redraw(); });

const sceneSel = $('panel-scene');
for (const k of SCENE_KEYS) {
  const o = document.createElement('option'); o.value = k; o.textContent = SCENES[k].name; sceneSel.appendChild(o);
}
sceneSel.addEventListener('change', () => {
  const p = selectedPanel();
  p.scene = sceneSel.value; p.label = SCENES[p.scene].label; p.photo = null;
  syncPanelEditor(); redraw();
});

$('presets').addEventListener('click', (e) => {
  const key = e.target.closest('button')?.dataset.preset;
  if (key) applyPreset(key);
});
$('surprise').addEventListener('click', surpriseMe);

for (const [id, key] of [['title', 'title'], ['subtitle', 'subtitle'], ['caption', 'caption'], ['issue', 'issue']]) {
  $(id).addEventListener('input', () => { state[key] = $(id).value; redraw(); });
}
$('panel-label').addEventListener('input', () => {
  selectedPanel().label = $('panel-label').value.toUpperCase();
  redraw();
});
$('zoom').addEventListener('input', () => {
  selectedPanel().zoom = 1 + Number($('zoom').value) / 100;
  $('zoom-val').textContent = `${Math.round(selectedPanel().zoom * 100)}%`;
  redraw();
});
$('reset-crop').addEventListener('click', () => {
  const p = selectedPanel();
  p.zoom = 1; p.ox = 0; p.oy = 0; syncPanelEditor(); redraw();
});

// --- photos ---------------------------------------------------------------
function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
$('photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const img = await loadImageFile(file);
    const p = selectedPanel();
    p.photo = img; p.zoom = 1; p.ox = 0; p.oy = 0;
    syncPanelEditor(); redraw();
    $('status').textContent = `Photo loaded into Panel ${selected + 1}. Drag to pan, scroll to zoom.`;
  } catch { $('status').textContent = 'Could not read that photo file.'; }
  e.target.value = '';
});
$('fill-demo').addEventListener('click', () => {
  // Fill every panel with a different demo scene (the app's own art).
  const keys = [...SCENE_KEYS];
  state.panels.forEach((p) => {
    const k = keys.splice(Math.floor(Math.random() * keys.length), 1)[0] || 'boulevard';
    p.scene = k; p.label = SCENES[k].label; p.photo = null;
  });
  syncPanelEditor(); redraw();
});
$('clear-photo').addEventListener('click', () => {
  const p = selectedPanel();
  p.photo = null; p.zoom = 1; p.ox = 0; p.oy = 0;
  syncPanelEditor(); redraw();
});

// --- pan / zoom on the cover ----------------------------------------------
function panelAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const x = (clientX - r.left) / r.width, y = (clientY - r.top) / r.height;
  const layout = LAYOUTS[state.layout];
  const artH = 1 - layout.band;
  for (let i = 0; i < layout.panels.length; i++) {
    const p = layout.panels[i];
    if (x >= p.x && x <= p.x + p.w && y >= p.y * artH && y <= (p.y + p.h) * artH) return i;
  }
  return -1;
}
canvas.addEventListener('pointerdown', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i >= 0) {
    selected = i; syncPanelEditor();
    dragging = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = selectedPanel();
  if (!p.photo) return;
  const r = canvas.getBoundingClientRect();
  p.ox += ((e.clientX - dragging.x) / r.width) * canvas.width;
  p.oy += ((e.clientY - dragging.y) / r.height) * canvas.height;
  dragging = { x: e.clientX, y: e.clientY };
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (e) => {
  const i = panelAt(e.clientX, e.clientY);
  if (i < 0) return;
  e.preventDefault();
  const p = state.panels[i];
  p.zoom = Math.min(3, Math.max(1, p.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  selected = i; syncPanelEditor(); redraw();
}, { passive: false });

// --- export ---------------------------------------------------------------
const exportWrap = $('export-buttons');
EXPORT_SIZES.forEach((s, idx) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'export-btn';
  b.textContent = s.name;
  b.addEventListener('click', () => {
    const out = renderExport(state, s.w, s.h);
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `leonida-press-${s.w}x${s.h}.png`;
      a.click();
      $('status').textContent = `Saved leonida-press-${s.w}x${s.h}.png`;
    }, 'image/png');
  });
  exportWrap.appendChild(b);
});

// --- shots ----------------------------------------------------------------
const query = new URLSearchParams(location.search);
if (query.get('shot')) {
  runShot(query, state, { applyPreset, surpriseMe, redraw, syncPanelEditor, layoutSel, gradeSel });
} else {
  $('title').value = state.title; $('subtitle').value = state.subtitle;
  $('caption').value = state.caption; $('issue').value = state.issue;
  syncPanelEditor();
  redraw();
}
