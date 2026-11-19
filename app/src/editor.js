// Wires the Vice Cover Studio editor: pick photos, type a caption, choose a
// layout and a colour grade, drag each panel to position its photo, scroll to
// zoom, and export the cover as a PNG. A `?shot=` query sets up a fixed scene
// for a screenshot instead (cover / editor / story / wide); window.__shotReady
// is set once the scene is painted.

import { renderCover, newSlots, panelFractions, LAYOUTS, GRADES, EXPORT_SIZES } from './cover.js';
import { paintAllScenes, SCENE_IDS } from './scenes.js';

const canvas = document.getElementById('stage');
const captionInput = document.getElementById('caption');
const subtitleInput = document.getElementById('subtitle');
const statusLine = document.getElementById('status');
const sceneLabel = document.getElementById('sceneLabel');

const state = {
  layout: 'poster',
  grade: 'sunset',
  caption: 'VICE CITY',
  subtitle: 'Leonida Nights',
  slots: newSlots(),
  selected: 0,
};

const demoScenes = paintAllScenes(720);

function loadDemoScenes(firstId) {
  const order = firstId
    ? [firstId, ...SCENE_IDS.filter((id) => id !== firstId)]
    : SCENE_IDS;
  state.slots.forEach((slot, i) => {
    slot.img = demoScenes[order[i % order.length]];
    slot.px = 0.5;
    slot.py = 0.5;
    slot.zoom = 1;
  });
}

function stageSize() {
  if (state.layout === 'story') return { w: 1080, h: 1350 };
  return { w: 1080, h: 1080 };
}

function redraw() {
  const { w, h } = stageSize();
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  renderCover(ctx, state.slots, {
    layout: state.layout,
    grade: state.grade,
    caption: state.caption,
    subtitle: state.subtitle,
  });
}

function setStatus(text) {
  statusLine.textContent = text;
}

function refreshButtons() {
  document.querySelectorAll('[data-layout]').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('[data-grade]').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  document.querySelectorAll('[data-slot]').forEach((b) => {
    b.classList.toggle('active', Number(b.dataset.slot) === state.selected);
  });
  sceneLabel.textContent = `Panel ${state.selected + 1} selected — drag the photo to move it, scroll to zoom.`;
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// --- Controls ---------------------------------------------------------------

document.querySelectorAll('[data-layout]').forEach((button) => {
  button.addEventListener('click', () => {
    state.layout = button.dataset.layout;
    refreshButtons();
    redraw();
  });
});
document.querySelectorAll('[data-grade]').forEach((button) => {
  button.addEventListener('click', () => {
    state.grade = button.dataset.grade;
    refreshButtons();
    redraw();
  });
});
document.querySelectorAll('[data-slot]').forEach((button) => {
  button.addEventListener('click', () => {
    state.selected = Number(button.dataset.slot);
    refreshButtons();
  });
});
captionInput.addEventListener('input', () => {
  state.caption = captionInput.value || 'VICE CITY';
  redraw();
});
subtitleInput.addEventListener('input', () => {
  state.subtitle = subtitleInput.value || 'Leonida Nights';
  redraw();
});
document.getElementById('demoPhotos').addEventListener('click', () => {
  loadDemoScenes();
  setStatus('Demo photos loaded — four procedural Leonida scenes.');
  redraw();
});
document.getElementById('resetView').addEventListener('click', () => {
  state.slots.forEach((slot) => {
    slot.px = 0.5;
    slot.py = 0.5;
    slot.zoom = 1;
  });
  redraw();
  setStatus('All panels reset to centre.');
});

// One file input per panel slot.
document.querySelectorAll('input[data-upload]').forEach((input) => {
  input.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const slotIndex = Number(input.dataset.upload);
    try {
      const img = await loadImageFile(file);
      state.slots[slotIndex].img = img;
      state.slots[slotIndex].px = 0.5;
      state.slots[slotIndex].py = 0.5;
      state.slots[slotIndex].zoom = 1;
      state.selected = slotIndex;
      setStatus(`Photo ${slotIndex + 1} loaded: ${file.name}`);
      refreshButtons();
      redraw();
    } catch {
      setStatus('That file could not be read as an image.');
    }
  });
});

let dragging = null;

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  const fx = (event.clientX - rect.left) / rect.width;
  const fy = (event.clientY - rect.top) / rect.height;
  const fractions = panelFractions(state.layout);
  const hit = fractions.findIndex(
    ([px, py, pw, ph]) => fx >= px && fx <= px + pw && fy >= py && fy <= py + ph,
  );
  if (hit === -1) return;
  state.selected = hit;
  refreshButtons();
  const slot = state.slots[hit];
  dragging = { slot, startX: event.clientX, startY: event.clientY, px: slot.px, py: slot.py };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const dx = (event.clientX - dragging.startX) / rect.width;
  const dy = (event.clientY - dragging.startY) / rect.height;
  dragging.slot.px = clamp(dragging.px + dx, 0, 1);
  dragging.slot.py = clamp(dragging.py + dy, 0, 1);
  redraw();
});

canvas.addEventListener('pointerup', () => {
  dragging = null;
});

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const slot = state.slots[state.selected];
  const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
  slot.zoom = clamp(slot.zoom * factor, 1, 4);
  redraw();
}, { passive: false });

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// --- Export -----------------------------------------------------------------

function exportPng(size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  renderCover(off.getContext('2d'), state.slots, {
    layout: state.layout,
    grade: state.grade,
    caption: state.caption,
    subtitle: state.subtitle,
  });
  off.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-cover-${size.w}x${size.h}.png`;
    a.click();
    setStatus(`Saved vice-cover-${size.w}x${size.h}.png`);
  }, 'image/png');
}

document.querySelectorAll('[data-export]').forEach((button) => {
  button.addEventListener('click', () => {
    const size = EXPORT_SIZES.find((s) => s.id === button.dataset.export);
    if (size) exportPng(size);
  });
});

// --- Screenshot scenes -------------------------------------------------------

function markReady() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

function runShot() {
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (!shot) return false;
  const scene = query.get('scene') || 'boulevard';
  state.caption = query.get('caption') || 'VICE CITY';
  state.subtitle = query.get('subtitle') || 'Leonida Nights';
  state.grade = GRADES.includes(query.get('grade')) ? query.get('grade') : 'sunset';
  state.layout = LAYOUTS.includes(query.get('layout')) ? query.get('layout') : 'poster';
  captionInput.value = state.caption;
  subtitleInput.value = state.subtitle;
  loadDemoScenes(SCENE_IDS.includes(scene) ? scene : 'boulevard');
  if (shot === 'cover' || shot === 'story' || shot === 'wide') {
    document.body.classList.add('shot-cover');
    // Render at the window size so the screenshot is full-bleed and crisp.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    renderCover(ctx, state.slots, {
      layout: state.layout,
      grade: state.grade,
      caption: state.caption,
      subtitle: state.subtitle,
    });
  } else {
    refreshButtons();
    redraw();
  }
  markReady();
  return true;
}

// --- Boot -------------------------------------------------------------------

if (!runShot()) {
  loadDemoScenes();
  refreshButtons();
  redraw();
} else if (new URLSearchParams(location.search).get('shot') !== 'cover'
  && new URLSearchParams(location.search).get('shot') !== 'story'
  && new URLSearchParams(location.search).get('shot') !== 'wide') {
  refreshButtons();
}
