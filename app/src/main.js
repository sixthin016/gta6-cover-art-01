// Neon Coast Cover Studio — editor wiring.
// Loads the bundled real photos first (they are the default first paint),
// wires every control, and handles panel picking, drag-pan, wheel-zoom,
// undo/redo, presets, the randomizer and the one-click multi-size export.

import { drawCover, defaultState, cloneState, PHOTO_LIBRARY, LAYOUTS, GRADES, SIZES, PRESETS, PANEL_ROLES, layoutPanels } from './cover.js';
import { drawDemoScene, SCENE_NAMES } from './scenes.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const stageLabel = document.getElementById('stageLabel');
const panelInfo = document.getElementById('panelInfo');
const zoomSlider = document.getElementById('zoom');
const zoomValue = document.getElementById('zoomValue');

const images = {};
const customPhotos = [];
let state = defaultState();
let selectedPanel = 0;
let undoStack = [];
let redoStack = [];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadLibrary() {
  const jobs = PHOTO_LIBRARY.map(async (photo) => {
    try {
      images[photo.id] = await loadImage(photo.file);
    } catch {
      images[photo.id] = null;
    }
  });
  await Promise.all(jobs);
}

function render(highlight = -1) {
  drawCover(canvas, state, images, drawDemoScene, highlight);
}

function setStatus(text) {
  status.textContent = text;
}

function pushHistory() {
  undoStack.push(cloneState(state));
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  syncUndoButtons();
}

function syncUndoButtons() {
  document.getElementById('undo').disabled = undoStack.length === 0;
  document.getElementById('redo').disabled = redoStack.length === 0;
}

function applySize() {
  const [w, h] = SIZES[state.size] || SIZES['1080x1350'];
  canvas.width = w;
  canvas.height = h;
  stageLabel.textContent = `Preview · ${w} × ${h}`;
}

function refreshPanelInfo() {
  const panel = state.panels[selectedPanel];
  const layout = LAYOUTS[state.layout];
  const count = layout.panels.length;
  const label = panel.photo
    ? (PHOTO_LIBRARY.find((p) => p.id === panel.photo)?.label || panel.photo)
    : `Demo art · ${SCENE_NAMES[panel.scene % SCENE_NAMES.length]}`;
  panelInfo.textContent = `Panel ${selectedPanel + 1} of ${count} · ${panel.role} — ${label}. Drag to pan, scroll to zoom.`;
  document.getElementById('role').value = panel.role;
  zoomSlider.value = Math.round((panel.zoom || 1) * 100);
  zoomValue.textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
}

function redraw() {
  applySize();
  render(selectedPanel);
  refreshPanelInfo();
}

// ---- library UI --------------------------------------------------------------

function buildLibrary() {
  const lib = document.getElementById('library');
  lib.innerHTML = '';
  const all = [...PHOTO_LIBRARY, ...customPhotos];
  for (const photo of all) {
    const fig = document.createElement('figure');
    fig.setAttribute('role', 'option');
    fig.title = photo.label;
    const img = document.createElement('img');
    img.src = photo.file;
    img.alt = photo.label;
    const cap = document.createElement('figcaption');
    cap.textContent = photo.label;
    fig.append(img, cap);
    fig.addEventListener('click', () => {
      pushHistory();
      state.panels[selectedPanel].photo = photo.id;
      state.panels[selectedPanel].zoom = 1;
      state.panels[selectedPanel].ox = 0;
      state.panels[selectedPanel].oy = 0;
      redraw();
      setStatus(`${photo.label} is now in panel ${selectedPanel + 1}.`);
      markSelectedPhoto();
    });
    lib.appendChild(fig);
  }
  markSelectedPhoto();
}

function markSelectedPhoto() {
  const all = [...PHOTO_LIBRARY, ...customPhotos];
  const current = state.panels[selectedPanel].photo;
  document.querySelectorAll('#library figure').forEach((fig, i) => {
    fig.classList.toggle('selected', all[i] && all[i].id === current);
  });
}

// ---- chip groups ---------------------------------------------------------------

function buildChips(containerId, entries, current, onPick, swatch) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  for (const [id, item] of entries) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.id = id;
    if (swatch) {
      const dot = document.createElement('span');
      dot.className = 'grade-swatch';
      dot.style.background = item.swatch;
      b.append(dot, document.createTextNode(item.name));
    } else {
      b.textContent = item.name || id;
    }
    b.classList.toggle('active', id === current);
    b.addEventListener('click', () => {
      pushHistory();
      onPick(id);
      box.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.id === id));
      redraw();
    });
    box.appendChild(b);
  }
}

const GRADE_SWATCHES = {
  sunset: 'linear-gradient(135deg,#7b2ff7,#ff6e3c)',
  neonvice: 'linear-gradient(135deg,#ff2e88,#00e5ff)',
  golden: 'linear-gradient(135deg,#ffb347,#ff8a00)',
  tealnoir: 'linear-gradient(135deg,#003c50,#ff7850)',
  magenta: 'linear-gradient(135deg,#ff0080,#7800c8)',
  palmdusk: 'linear-gradient(135deg,#3c145a,#ff5a78)',
  monochrome: 'linear-gradient(135deg,#ffffff,#111111)',
};

function buildControls() {
  buildChips('layouts', Object.entries(LAYOUTS).map(([id, v]) => [id, { name: v.name }]), state.layout, (id) => {
    state.layout = id;
    selectedPanel = 0;
    setStatus(`Layout: ${LAYOUTS[id].name}.`);
  });
  buildChips('grades', Object.entries(GRADES).map(([id, v]) => [id, { name: v.name, swatch: GRADE_SWATCHES[id] }]), state.grade, (id) => {
    state.grade = id;
    setStatus(`Grade: ${GRADES[id].name}.`);
  }, true);
  buildChips('presets', PRESETS.map((p) => [p.id, { name: p.name }]), '', (id) => {
    const preset = PRESETS.find((p) => p.id === id);
    state.layout = preset.layout;
    state.grade = preset.grade;
    state.title = preset.title;
    state.subtitle = preset.subtitle;
    document.getElementById('title').value = preset.title;
    document.getElementById('subtitle').value = preset.subtitle;
    selectedPanel = 0;
    buildControls();
    setStatus(`Preset: ${preset.name}.`);
  });
  buildChips('sizes', Object.entries(SIZES).map(([id, [w, h]]) => [id, { name: `${w} × ${h}` }]), state.size, (id) => {
    state.size = id;
    setStatus(`Export size: ${id}.`);
  });
}

// ---- text inputs ---------------------------------------------------------------

function bindText(id, key) {
  document.getElementById(id).addEventListener('input', (e) => {
    state[key] = e.target.value;
    redraw();
  });
  document.getElementById(id).addEventListener('change', () => pushHistory());
}

// ---- canvas interaction: pick, drag-pan, wheel-zoom ----------------------------

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height,
  };
}

function panelAt(point) {
  const panels = layoutPanels(state, canvas.width, canvas.height);
  for (let i = panels.length - 1; i >= 0; i--) {
    const { x, y, w, h } = panels[i].rect;
    if (point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h) return i;
  }
  return -1;
}

let dragging = false;
let dragStart = null;
let dragPanelStart = null;

canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const hit = panelAt(p);
  if (hit < 0) return;
  selectedPanel = hit;
  dragging = true;
  dragStart = p;
  dragPanelStart = { ox: state.panels[hit].ox || 0, oy: state.panels[hit].oy || 0 };
  canvas.setPointerCapture(e.pointerId);
  redraw();
  markSelectedPhoto();
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const panel = state.panels[selectedPanel];
  const rect = layoutPanels(state, canvas.width, canvas.height)[selectedPanel].rect;
  panel.ox = dragPanelStart.ox + (p.x - dragStart.x) / rect.w;
  panel.oy = dragPanelStart.oy + (p.y - dragStart.y) / rect.h;
  panel.ox = Math.max(-0.6, Math.min(0.6, panel.ox));
  panel.oy = Math.max(-0.6, Math.min(0.6, panel.oy));
  render(selectedPanel);
});

canvas.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = false;
  pushHistory();
  refreshPanelInfo();
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = canvasPoint(e);
  const hit = panelAt(p);
  if (hit < 0) return;
  selectedPanel = hit;
  pushHistory();
  const panel = state.panels[hit];
  panel.zoom = Math.max(1, Math.min(2.6, (panel.zoom || 1) * (e.deltaY < 0 ? 1.12 : 0.89)));
  redraw();
  markSelectedPhoto();
}, { passive: false });

zoomSlider.addEventListener('input', () => {
  const panel = state.panels[selectedPanel];
  panel.zoom = zoomSlider.value / 100;
  zoomValue.textContent = `${zoomSlider.value}%`;
  render(selectedPanel);
});
zoomSlider.addEventListener('change', () => pushHistory());

document.getElementById('role').addEventListener('input', (e) => {
  state.panels[selectedPanel].role = e.target.value.toUpperCase().slice(0, 24);
  redraw();
});
document.getElementById('role').addEventListener('change', () => pushHistory());

document.getElementById('useDemo').addEventListener('click', () => {
  pushHistory();
  state.panels[selectedPanel].photo = null;
  redraw();
  setStatus(`Panel ${selectedPanel + 1} now uses demo art.`);
});

document.getElementById('usePhoto').addEventListener('click', () => {
  pushHistory();
  const panel = state.panels[selectedPanel];
  panel.photo = PHOTO_LIBRARY[selectedPanel % PHOTO_LIBRARY.length].id;
  panel.zoom = 1;
  panel.ox = 0;
  panel.oy = 0;
  redraw();
  markSelectedPhoto();
  setStatus(`Panel ${selectedPanel + 1} back to a library photo.`);
});

// ---- uploads -------------------------------------------------------------------

document.getElementById('upload').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  for (const file of files) {
    const id = `user${customPhotos.length}`;
    const url = URL.createObjectURL(file);
    try {
      images[id] = await loadImage(url);
    } catch {
      continue;
    }
    customPhotos.push({ id, label: file.name.replace(/\.[^.]+$/, '').slice(0, 18) || 'Your photo', file: url });
  }
  buildLibrary();
  pushHistory();
  state.panels[selectedPanel].photo = customPhotos[customPhotos.length - 1].id;
  redraw();
  setStatus(`${files.length} photo(s) added — kept on your machine.`);
  e.target.value = '';
});

// ---- furniture toggles -------------------------------------------------------------

document.querySelectorAll('[data-furniture]').forEach((box) => {
  box.addEventListener('change', () => {
    pushHistory();
    state.furniture[box.dataset.furniture] = box.checked;
    redraw();
  });
});

// ---- undo / redo / surprise ---------------------------------------------------------

document.getElementById('undo').addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(cloneState(state));
  state = undoStack.pop();
  syncUndoButtons();
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('quote').value = state.quote;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('billing2').value = state.billing2;
  buildControls();
  redraw();
  setStatus('Undid the last change.');
});

document.getElementById('redo').addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(cloneState(state));
  state = redoStack.pop();
  syncUndoButtons();
  buildControls();
  redraw();
  setStatus('Redid the change.');
});

document.getElementById('surprise').addEventListener('click', () => {
  pushHistory();
  const layoutIds = Object.keys(LAYOUTS);
  const gradeIds = Object.keys(GRADES);
  state.layout = layoutIds[Math.floor(Math.random() * layoutIds.length)];
  state.grade = gradeIds[Math.floor(Math.random() * gradeIds.length)];
  const titles = ['NEON COAST', 'VICE NIGHTS', 'LAST LIGHT RUN', 'PALM DUSK', 'DOUBLE OR NOTHING', 'THE WHOLE CREW'];
  state.title = titles[Math.floor(Math.random() * titles.length)];
  document.getElementById('title').value = state.title;
  // Shuffle the cast across the panels.
  const order = [...PHOTO_LIBRARY].sort(() => Math.random() - 0.5);
  state.panels.forEach((panel, i) => {
    panel.photo = order[i % order.length].id;
    panel.zoom = 1;
    panel.ox = 0;
    panel.oy = 0;
  });
  selectedPanel = 0;
  buildControls();
  buildLibrary();
  redraw();
  setStatus(`Surprise: ${LAYOUTS[state.layout].name} + ${GRADES[state.grade].name}.`);
});

// ---- export -------------------------------------------------------------------------

function exportCanvas(w, h, filename) {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  drawCover(off, state, images, drawDemoScene, -1);
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve();
    }, 'image/png');
  });
}

document.getElementById('exportOne').addEventListener('click', async () => {
  const [w, h] = SIZES[state.size];
  await exportCanvas(w, h, `neon-coast-${w}x${h}.png`);
  setStatus(`Saved neon-coast-${w}x${h}.png — share it.`);
});

document.getElementById('exportAll').addEventListener('click', async () => {
  const trio = ['1920x1080', '1080x1350', '1080x1080'];
  setStatus('Exporting all 3 sizes…');
  for (const key of trio) {
    const [w, h] = SIZES[key];
    await exportCanvas(w, h, `neon-coast-${w}x${h}.png`);
    await new Promise((r) => setTimeout(r, 450));
  }
  setStatus('Saved all 3 sizes: 1920×1080, 1080×1350, 1080×1080.');
});

// ---- boot -------------------------------------------------------------------------------

bindText('title', 'title');
bindText('subtitle', 'subtitle');
bindText('quote', 'quote');
bindText('tagline', 'tagline');
bindText('billing2', 'billing2');

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), {
    images, loadImage, render, state: () => state, setState: (s) => { state = s; },
    applySize, redraw, buildControls, buildLibrary,
  });
} else {
  (async () => {
    setStatus('Loading your photos…');
    try {
      await Promise.race([
        Promise.all([document.fonts.load('900 100px Anton'), document.fonts.load('400 60px Pacifico')]),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
    } catch { /* fall back to system fonts */ }
    await loadLibrary();
    buildLibrary();
    buildControls();
    syncUndoButtons();
    redraw();
    setStatus('Ready — 8 photos loaded. Pick a panel, drag to pan, scroll to zoom, then Export All 3 Sizes.');
  })();
}
