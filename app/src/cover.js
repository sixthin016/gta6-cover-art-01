// Cover composition for Leonida Press r5: 9 layouts, 7 colour grades,
// chrome title with halftone and a giant "VI" watermark, safe margins.
// Panels are defined as fractions of the art area (above the title band).
import { SCENES, SCENE_KEYS } from './scenes.js';

export const GRADES = {
  sunset: { name: 'Sunset', tint: 'rgba(255,110,60,0.16)', deep: 'rgba(160,30,90,0.20)', vignette: 0.22 },
  neon: { name: 'Neon', tint: 'rgba(60,20,180,0.20)', deep: 'rgba(255,40,160,0.18)', vignette: 0.28 },
  noir: { name: 'Noir', tint: 'rgba(10,10,30,0.34)', deep: 'rgba(0,0,0,0.30)', vignette: 0.4 },
  pastel: { name: 'Pastel', tint: 'rgba(255,200,220,0.16)', deep: 'rgba(120,200,255,0.12)', vignette: 0.1 },
  ink: { name: 'Poster-Ink', tint: 'rgba(255,180,40,0.10)', deep: 'rgba(40,10,60,0.26)', vignette: 0.3 },
  original: { name: 'Original', tint: 'rgba(0,0,0,0)', deep: 'rgba(0,0,0,0)', vignette: 0.12 },
  vicegold: { name: 'Vice Gold', tint: 'rgba(255,190,60,0.18)', deep: 'rgba(20,90,90,0.20)', vignette: 0.2 },
};
export const GRADE_KEYS = Object.keys(GRADES);

// Each layout: panels in fractions of the art area, plus a title-band share.
// The art area is the cover minus the title band at the bottom.
export const LAYOUTS = {
  poster5: {
    name: 'Poster 5-Panel',
    band: 0.2,
    panels: [
      { x: 0.01, y: 0.015, w: 0.98, h: 0.42, scene: 'hero' },
      { x: 0.01, y: 0.45, w: 0.235, h: 0.53, scene: 'downtown' },
      { x: 0.2575, y: 0.45, w: 0.235, h: 0.53, scene: 'beach' },
      { x: 0.505, y: 0.45, w: 0.235, h: 0.53, scene: 'strip' },
      { x: 0.7525, y: 0.45, w: 0.2375, h: 0.53, scene: 'bayou' },
    ],
  },
  grid3x2: {
    name: 'Grid 3x2 · 6 panels',
    band: 0.2,
    panels: [
      { x: 0.01, y: 0.015, w: 0.32, h: 0.475, scene: 'pier' },
      { x: 0.34, y: 0.015, w: 0.32, h: 0.475, scene: 'downtown' },
      { x: 0.67, y: 0.015, w: 0.32, h: 0.475, scene: 'beach' },
      { x: 0.01, y: 0.505, w: 0.32, h: 0.475, scene: 'strip' },
      { x: 0.34, y: 0.505, w: 0.32, h: 0.475, scene: 'bayou' },
      { x: 0.67, y: 0.505, w: 0.32, h: 0.475, scene: 'hero' },
    ],
  },
  hero: {
    name: 'Hero Single',
    band: 0.2,
    panels: [{ x: 0.01, y: 0.015, w: 0.98, h: 0.97, scene: 'hero' }],
  },
  story: {
    name: 'Story 1080x1350',
    band: 0.2,
    panels: [
      { x: 0.02, y: 0.015, w: 0.96, h: 0.36, scene: 'hero' },
      { x: 0.02, y: 0.39, w: 0.96, h: 0.185, scene: 'chase' },
      { x: 0.02, y: 0.59, w: 0.96, h: 0.185, scene: 'artdeco' },
      { x: 0.02, y: 0.79, w: 0.96, h: 0.19, scene: 'helibay' },
    ],
  },
  wide: {
    name: 'Wide Cinematic',
    band: 0.22,
    panels: [
      { x: 0.01, y: 0.02, w: 0.98, h: 0.55, scene: 'hero' },
      { x: 0.01, y: 0.59, w: 0.485, h: 0.39, scene: 'chase' },
      { x: 0.505, y: 0.59, w: 0.485, h: 0.39, scene: 'artdeco' },
    ],
  },
  comic: {
    name: 'Comic Strip',
    band: 0.2,
    panels: [
      { x: 0.01, y: 0.015, w: 0.98, h: 0.3, scene: 'chase' },
      { x: 0.01, y: 0.33, w: 0.48, h: 0.325, scene: 'hero' },
      { x: 0.5, y: 0.33, w: 0.49, h: 0.325, scene: 'helibay' },
      { x: 0.01, y: 0.67, w: 0.98, h: 0.31, scene: 'artdeco' },
    ],
  },
  magazine: {
    name: 'Magazine',
    band: 0.2,
    panels: [
      { x: 0.01, y: 0.015, w: 0.62, h: 0.97, scene: 'hero' },
      { x: 0.64, y: 0.015, w: 0.35, h: 0.47, scene: 'pier' },
      { x: 0.64, y: 0.505, w: 0.35, h: 0.475, scene: 'beach' },
    ],
  },
  slanted: {
    name: 'Slanted Comic',
    band: 0.2,
    slant: 0.05,
    panels: [
      { x: 0.01, y: 0.015, w: 0.98, h: 0.38, scene: 'hero' },
      { x: 0.01, y: 0.41, w: 0.315, h: 0.57, scene: 'chase' },
      { x: 0.335, y: 0.41, w: 0.315, h: 0.57, scene: 'artdeco' },
      { x: 0.66, y: 0.41, w: 0.33, h: 0.57, scene: 'helibay' },
    ],
  },
  castgrid: {
    name: 'Whole-Cast Grid 3x3',
    band: 0.2,
    panels: [
      { x: 0.01, y: 0.015, w: 0.32, h: 0.315, scene: 'hero' },
      { x: 0.34, y: 0.015, w: 0.32, h: 0.315, scene: 'boulevard' },
      { x: 0.67, y: 0.015, w: 0.32, h: 0.315, scene: 'pier' },
      { x: 0.01, y: 0.345, w: 0.32, h: 0.315, scene: 'downtown' },
      { x: 0.34, y: 0.345, w: 0.32, h: 0.315, scene: 'chase' },
      { x: 0.67, y: 0.345, w: 0.32, h: 0.315, scene: 'beach' },
      { x: 0.01, y: 0.675, w: 0.32, h: 0.305, scene: 'strip' },
      { x: 0.34, y: 0.675, w: 0.32, h: 0.305, scene: 'bayou' },
      { x: 0.67, y: 0.675, w: 0.32, h: 0.305, scene: 'artdeco' },
    ],
  },
};
export const LAYOUT_KEYS = Object.keys(LAYOUTS);

export const PRESETS = {
  sunset: { name: 'Sunset Heist', layout: 'poster5', grade: 'sunset', title: 'SUNSET HEIST', subtitle: 'Vice City Nights', caption: 'One last score under the palms.', issue: 'Issue 06 · Vice City · 2026' },
  neon: { name: 'Neon Nights', layout: 'grid3x2', grade: 'neon', title: 'NEON NIGHTS', subtitle: 'Pier 9 after dark', caption: 'The strip never sleeps.', issue: 'Issue 06 · Vice City · 2026' },
  noir: { name: 'Noir Drive', layout: 'story', grade: 'noir', title: 'NOIR DRIVE', subtitle: 'Downtown, 2 AM', caption: 'No witnesses. No regrets.', issue: 'Issue 06 · Vice City · 2026' },
  classic: { name: 'Vice Classic', layout: 'wide', grade: 'vicegold', title: 'VICE CLASSIC', subtitle: 'Leonida, 2026', caption: 'Welcome back to Vice City.', issue: 'Issue 06 · Vice City · 2026' },
  cast: { name: 'Whole Cast', layout: 'castgrid', grade: 'sunset', title: 'LEONIDA', subtitle: 'The whole crew, one cover', caption: 'Every street. Every score. One city.', issue: 'Issue 06 · Vice City · 2026' },
  slanted: { name: 'Slanted Chase', layout: 'slanted', grade: 'neon', title: 'HIGHWAY 95', subtitle: 'They never saw us coming', caption: 'Pedal down. Lights behind.', issue: 'Issue 06 · Vice City · 2026' },
};
export const PRESET_KEYS = Object.keys(PRESETS);

export const EXPORT_SIZES = [
  { name: 'Square 1080 x 1080', w: 1080, h: 1080 },
  { name: 'Portrait 1080 x 1350', w: 1080, h: 1350 },
  { name: 'Landscape 1920 x 1080', w: 1920, h: 1080 },
  { name: 'Story 1080 x 1920', w: 1080, h: 1920 },
  { name: 'Link preview 1200 x 628', w: 1200, h: 628 },
  { name: 'Wide HD 1600 x 900', w: 1600, h: 900 },
];

// Default panel state for a layout: one slot per panel.
export function defaultPanels(layoutKey) {
  return LAYOUTS[layoutKey].panels.map((p, i) => ({
    scene: p.scene, label: SCENES[p.scene].label,
    photo: null, zoom: 1, ox: 0, oy: 0, seed: 100 + i * 7,
  }));
}

export function defaultState() {
  const preset = PRESETS.sunset;
  return {
    layout: preset.layout, grade: preset.grade,
    title: preset.title, subtitle: preset.subtitle,
    caption: preset.caption, issue: preset.issue,
    panels: defaultPanels(preset.layout),
  };
}

// Fit a fitted title size so the text never overflows the band.
function fitFont(ctx, text, maxW, start, weight = 900) {
  let size = start;
  ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2; ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  }
  return size;
}

function drawChromeTitle(ctx, text, cx, cy, maxW, h) {
  const size = fitFont(ctx, text, maxW, h * 0.4);
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const g = ctx.createLinearGradient(0, cy - size * 0.55, 0, cy + size * 0.55);
  g.addColorStop(0, '#fff3c8'); g.addColorStop(0.35, '#ffb35c');
  g.addColorStop(0.6, '#ff5c8a'); g.addColorStop(1, '#c22e8a');
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2a0a2e'; ctx.lineWidth = size * 0.16;
  ctx.strokeText(text, cx, cy);
  ctx.fillStyle = g; ctx.fillText(text, cx, cy);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = size * 0.03;
  ctx.strokeText(text, cx, cy);
  ctx.restore();
  return size;
}

function drawLabelChip(ctx, x, y, text, h) {
  const size = Math.max(10, h * 0.028);
  ctx.save();
  ctx.font = `bold ${size}px Arial, sans-serif`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const tw = ctx.measureText(text).width;
  const pad = size * 0.7;
  ctx.fillStyle = 'rgba(12,6,20,0.78)';
  ctx.fillRect(x, y, tw + pad * 2, size * 1.9);
  ctx.fillStyle = '#ffd76a'; ctx.fillRect(x, y, size * 0.28, size * 1.9);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x + pad + size * 0.28, y + size * 0.98);
  ctx.restore();
}

function drawPhotoCover(ctx, img, px, py, pw, ph, zoom, ox, oy) {
  const scale = Math.max(pw / img.naturalWidth, ph / img.naturalHeight) * zoom;
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  ctx.drawImage(img, px + (pw - dw) / 2 + ox, py + (ph - dh) / 2 + oy, dw, dh);
}

function applyGrade(ctx, px, py, pw, ph, grade) {
  ctx.save();
  ctx.beginPath(); ctx.rect(px, py, pw, ph); ctx.clip();
  if (grade.tint) { ctx.fillStyle = grade.tint; ctx.fillRect(px, py, pw, ph); }
  const vg = ctx.createRadialGradient(
    px + pw / 2, py + ph / 2, Math.min(pw, ph) * 0.3,
    px + pw / 2, py + ph / 2, Math.max(pw, ph) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(10,4,20,${grade.vignette})`);
  ctx.fillStyle = vg; ctx.fillRect(px, py, pw, ph);
  if (grade.deep) {
    const dg = ctx.createLinearGradient(0, py + ph * 0.6, 0, py + ph);
    dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, grade.deep);
    ctx.fillStyle = dg; ctx.fillRect(px, py, pw, ph);
  }
  ctx.restore();
}

// Draw one panel: clip (parallelogram when slanted), paint the scene or
// the user's photo, grade it, frame it, label it.
function drawPanel(ctx, panel, rect, state, seed) {
  const { x, y, w, h } = rect;
  const slant = state.slant || 0;
  ctx.save();
  ctx.beginPath();
  if (slant) {
    ctx.moveTo(x + slant, y); ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - slant, y + h); ctx.lineTo(x, y + h); ctx.closePath();
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  const scene = SCENES[panel.scene] || SCENES.boulevard;
  // Scenes paint in a 0..w / 0..h space, so translate to the panel origin.
  ctx.save();
  ctx.translate(x, y);
  if (panel.photo) drawPhotoCover(ctx, panel.photo, 0, 0, w, h, panel.zoom, panel.ox, panel.oy);
  else scene.paint(ctx, w, h, seed);
  ctx.restore();
  applyGrade(ctx, x, y, w, h, GRADES[state.grade]);
  ctx.restore();
  // frame
  ctx.save();
  ctx.beginPath();
  if (slant) {
    ctx.moveTo(x + slant, y); ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - slant, y + h); ctx.lineTo(x, y + h); ctx.closePath();
  } else ctx.rect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,240,200,0.9)'; ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.stroke();
  ctx.restore();
  // label chip: bottom-left, inset from the panel edge (safe margin)
  const inset = Math.max(6, w * 0.03);
  drawLabelChip(ctx, x + inset, y + h - Math.max(22, h * 0.085), panel.label, h);
}

function drawTitleBand(ctx, state, W, H, bandY, bandH) {
  // deep plum band with a sunset glow at its top edge
  const bg = ctx.createLinearGradient(0, bandY, 0, H);
  bg.addColorStop(0, '#2a0f2e'); bg.addColorStop(1, '#160818');
  ctx.fillStyle = bg; ctx.fillRect(0, bandY, W, H - bandY);
  ctx.fillStyle = '#ff2e9a'; ctx.fillRect(W * 0.04, bandY, W * 0.92, Math.max(2, H * 0.004));
  // giant "VI" watermark, right side, low contrast so it never fights the title
  ctx.save();
  ctx.font = `900 ${bandH * 1.05}px Arial, sans-serif`;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,92,138,0.07)';
  ctx.fillText('VI', W * 0.985, bandY + bandH * 0.52);
  ctx.strokeStyle = 'rgba(255,215,106,0.07)'; ctx.lineWidth = 1.5;
  ctx.strokeText('VI', W * 0.985, bandY + bandH * 0.52);
  ctx.restore();
  // halftone dots, left edge of the band
  ctx.save(); ctx.globalAlpha = 0.55;
  const gap = Math.max(7, W * 0.008);
  for (let yy = bandY + bandH * 0.12; yy < bandY + bandH * 0.9; yy += gap) {
    for (let xx = W * 0.015; xx < W * 0.09; xx += gap) {
      ctx.fillStyle = 'rgba(255,122,217,0.5)';
      ctx.beginPath(); ctx.arc(xx, yy, gap * 0.14, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // badge + issue row
  const rowY = bandY + bandH * 0.16;
  const badgeSize = Math.max(11, bandH * 0.13);
  ctx.save();
  ctx.font = `bold ${badgeSize}px Arial, sans-serif`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const badgeText = '★ LEONIDA PRESS';
  const bw = ctx.measureText(badgeText).width + badgeSize * 1.6;
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(W * 0.1, rowY - badgeSize * 0.75, bw, badgeSize * 1.5);
  ctx.fillStyle = '#2a0a2e'; ctx.fillText(badgeText, W * 0.1 + badgeSize * 0.8, rowY);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `bold ${Math.max(10, bandH * 0.105)}px Arial, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(state.issue.toUpperCase(), W * 0.9, rowY);
  ctx.restore();
  // caption
  const capSize = fitFont(ctx, state.caption, W * 0.72, bandH * 0.12, 700);
  ctx.save();
  ctx.font = `700 ${capSize}px Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(state.caption, W / 2, bandY + bandH * 0.34);
  ctx.restore();
  // chrome title
  drawChromeTitle(ctx, state.title.toUpperCase(), W / 2, bandY + bandH * 0.62, W * 0.86, bandH);
  // subtitle
  const subSize = fitFont(ctx, state.subtitle.toUpperCase(), W * 0.7, bandH * 0.12, 800);
  ctx.save();
  ctx.font = `italic 800 ${subSize}px Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8b8d8';
  ctx.fillText(state.subtitle.toUpperCase(), W / 2, bandY + bandH * 0.87);
  ctx.restore();
}

// Render the whole cover onto a canvas (its own size decides the output).
export function renderCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const layout = LAYOUTS[state.layout] || LAYOUTS.poster5;
  const bandH = H * layout.band;
  const artH = H - bandH;
  // outer frame
  ctx.fillStyle = '#160818'; ctx.fillRect(0, 0, W, H);
  const frame = Math.max(3, W * 0.006);
  ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = frame;
  ctx.strokeRect(frame / 2, frame / 2, W - frame, H - frame);
  // panels
  layout.panels.forEach((p, i) => {
    const panel = state.panels[i] || { scene: p.scene, label: SCENES[p.scene].label, photo: null, zoom: 1, ox: 0, oy: 0, seed: 100 };
    drawPanel(ctx, panel, {
      x: frame + p.x * (W - frame * 2),
      y: frame + p.y * (artH - frame * 2),
      w: p.w * (W - frame * 2),
      h: p.h * (artH - frame * 2),
    }, { ...state, slant: layout.slant ? W * layout.slant : 0, grade: state.grade }, panel.seed ?? 100);
  });
  drawTitleBand(ctx, state, W, H, artH, bandH);
  return canvas;
}

// Render an offscreen cover at an export size.
export function renderExport(state, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return renderCover(c, state);
}
