// Paints the GTA-style cover: a dense multi-panel poster with a Vice City
// colour grade, heavy caption lettering, a LEONIDA badge, a mission strip and
// a small numbered Leonida map inset — all drawn with the canvas 2D API.
// No image, font or asset is loaded from outside the app, so the render is
// deterministic: the same state always paints the same pixels.
//
// Layout contract (fractions of the cover, so every export size matches):
//   panels live in y 0.03 .. 0.76, the caption band in 0.775 .. 0.90, and the
//   mission strip in 0.92 .. 0.965. Nothing from the title band ever touches
//   a panel, and the map inset sits inside the hero panel, clear of the badge.

import { mulberry32 } from './rng.js';

export const LAYOUTS = ['poster', 'grid', 'single', 'story'];
export const GRADES = ['sunset', 'neon', 'pastel', 'noir', 'original'];
export const EXPORT_SIZES = [
  { id: 'square', label: '1080 x 1080 — feed', w: 1080, h: 1080 },
  { id: 'story', label: '1080 x 1350 — story', w: 1080, h: 1350 },
  { id: 'wide', label: '1920 x 1080 — wide', w: 1920, h: 1080 },
];

/** Colour grades: backdrop stops, photo tint, title colour, accent, badge. */
export const GRADE_TABLE = {
  sunset: {
    sky: ['#33105e', '#e14e7d', '#ff9e4f'],
    tint: ['rgba(255, 94, 122, 0.00)', 'rgba(255, 94, 122, 0.36)'],
    title: '#ffffff', accent: '#ffd166', badge: '#ff5e7a',
  },
  neon: {
    sky: ['#080c33', '#45206b', '#ff2e88'],
    tint: ['rgba(0, 229, 255, 0.00)', 'rgba(255, 46, 136, 0.40)'],
    title: '#eafcff', accent: '#00e5ff', badge: '#00e5ff',
  },
  pastel: {
    sky: ['#8fe0ec', '#ffc2d4', '#ffe6a8'],
    tint: ['rgba(255, 194, 212, 0.00)', 'rgba(255, 194, 212, 0.28)'],
    title: '#ffffff', accent: '#ff5e7a', badge: '#ff5e7a',
  },
  noir: {
    sky: ['#0d0a14', '#2b2539', '#575064'],
    tint: ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.42)'],
    title: '#f2f0f4', accent: '#ffd166', badge: '#f2f0f4',
  },
  original: {
    sky: ['#0f3a5c', '#2f7ea8', '#e8b04b'],
    tint: ['rgba(47, 126, 168, 0.00)', 'rgba(47, 126, 168, 0.24)'],
    title: '#ffffff', accent: '#7ef0e0', badge: '#2f7ea8',
  },
};

/** Panel rectangles for each layout, as fractions of the cover [x, y, w, h]. */
export function panelFractions(layout) {
  if (layout === 'grid') {
    return [
      [0.04, 0.03, 0.46, 0.345], [0.50, 0.03, 0.46, 0.345],
      [0.04, 0.395, 0.46, 0.345], [0.50, 0.395, 0.46, 0.345],
    ];
  }
  if (layout === 'single') return [[0.04, 0.03, 0.92, 0.73]];
  if (layout === 'story') {
    return [
      [0.04, 0.03, 0.92, 0.47],
      [0.04, 0.525, 0.45, 0.235], [0.51, 0.525, 0.45, 0.235],
    ];
  }
  // Poster: one hero panel above three small ones — the classic cover look.
  return [
    [0.04, 0.03, 0.92, 0.47],
    [0.04, 0.525, 0.293, 0.235], [0.353, 0.525, 0.294, 0.235], [0.667, 0.525, 0.293, 0.235],
  ];
}

/** Panel slots hold a picture (canvas or image) plus pan (0..1) and zoom (>= 1). */
export function newSlots() {
  return Array.from({ length: 4 }, () => ({ img: null, px: 0.5, py: 0.5, zoom: 1 }));
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Backdrop: grade sky, soft sun glow, faint halftone dots in the corners. */
function paintBackdrop(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  // Halftone corner dots, seeded so they never move.
  const rand = mulberry32(777);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let i = 0; i < 90; i++) {
    const corner = i % 2 === 0;
    const x = corner ? rand() * w * 0.22 : w - rand() * w * 0.22;
    const y = rand() * h * 0.18;
    const r = 1 + rand() * 3.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 60; i++) {
    const x = rand() * w;
    const y = h - rand() * h * 0.06;
    const r = 1 + rand() * 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Draws one panel: the picture cover-fit with pan/zoom, grade tint, frame. */
function paintPanel(ctx, rect, slot, grade, index) {
  const [x, y, w, h] = rect;
  ctx.save();
  roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.035);
  ctx.clip();
  if (slot && slot.img) {
    const iw = slot.img.naturalWidth || slot.img.width;
    const ih = slot.img.naturalHeight || slot.img.height;
    const base = Math.max(w / iw, h / ih) * (slot.zoom || 1);
    const pw = iw * base;
    const ph = ih * base;
    const dx = x + (w - pw) * (slot.px ?? 0.5);
    const dy = y + (h - ph) * (slot.py ?? 0.5);
    ctx.drawImage(slot.img, dx, dy, pw, ph);
  } else {
    ctx.fillStyle = '#241a33';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `bold ${Math.round(h * 0.16)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`PANEL ${index + 1}`, x + w / 2, y + h / 2);
  }
  const tint = ctx.createLinearGradient(0, y, 0, y + h);
  tint.addColorStop(0, grade.tint[0]);
  tint.addColorStop(1, grade.tint[1]);
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  // White frame + soft inner shadow.
  ctx.save();
  roundRect(ctx, x, y, w, h, Math.min(w, h) * 0.035);
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = Math.max(2, w * 0.008);
  ctx.stroke();
  ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = Math.max(6, w * 0.03);
  ctx.stroke();
  ctx.restore();
}

/** LEONIDA badge: pill with a star, top-left inside the hero panel. */
function paintBadge(ctx, x, y, w, grade) {
  const h = w * 0.24;
  ctx.save();
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(10,8,20,0.72)';
  ctx.fill();
  ctx.strokeStyle = grade.badge;
  ctx.lineWidth = Math.max(2, w * 0.012);
  ctx.stroke();
  ctx.fillStyle = grade.badge;
  const starR = h * 0.28;
  const sx = x + h * 0.55;
  const sy = y + h / 2;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? starR : starR * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = sx + Math.cos(a) * r;
    const py = sy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(h * 0.42)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEONIDA', x + h * 1.05, y + h / 2 + h * 0.03);
  ctx.restore();
}

/** Small Leonida map inset: coastline, roads, four numbered spots. Placed
 * inside the hero panel's top-right corner, clear of the badge and the title. */
function paintMapInset(ctx, x, y, w, h, grade) {
  ctx.save();
  roundRect(ctx, x, y, w, h, w * 0.06);
  ctx.fillStyle = 'rgba(8,10,24,0.78)';
  ctx.fill();
  ctx.strokeStyle = grade.accent;
  ctx.lineWidth = Math.max(2, w * 0.01);
  ctx.stroke();
  // Coastline: a peninsula shape.
  ctx.beginPath();
  ctx.moveTo(x + w * 0.12, y + h * 0.85);
  ctx.quadraticCurveTo(x + w * 0.05, y + h * 0.45, x + w * 0.28, y + h * 0.22);
  ctx.quadraticCurveTo(x + w * 0.45, y + h * 0.08, x + w * 0.68, y + h * 0.18);
  ctx.quadraticCurveTo(x + w * 0.92, y + h * 0.3, x + w * 0.86, y + h * 0.55);
  ctx.quadraticCurveTo(x + w * 0.8, y + h * 0.78, x + w * 0.55, y + h * 0.86);
  ctx.closePath();
  ctx.fillStyle = '#2f7ea8';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = Math.max(1, w * 0.006);
  ctx.stroke();
  // Roads.
  ctx.strokeStyle = 'rgba(255,209,102,0.85)';
  ctx.lineWidth = Math.max(1.5, w * 0.008);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.2, y + h * 0.8);
  ctx.lineTo(x + w * 0.5, y + h * 0.5);
  ctx.lineTo(x + w * 0.78, y + h * 0.35);
  ctx.moveTo(x + w * 0.5, y + h * 0.5);
  ctx.lineTo(x + w * 0.62, y + h * 0.78);
  ctx.stroke();
  // Numbered spots, spread so the circles never touch each other or the label.
  const spots = [[0.30, 0.36], [0.68, 0.30], [0.58, 0.62], [0.34, 0.68]];
  ctx.font = `bold ${Math.round(h * 0.19)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  spots.forEach(([fx, fy], i) => {
    const px = x + w * fx;
    const py = y + h * fy;
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.arc(px, py, h * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a18';
    ctx.fillText(String(i + 1), px, py + h * 0.01);
  });
  // Label tucked in the bottom-left corner, below the lowest spot.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold ${Math.round(h * 0.13)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('LEONIDA', x + w * 0.08, y + h * 0.92);
  ctx.restore();
}

/** Fits `text` to `maxWidth` by shrinking the font, then returns the size. */
function fitFont(ctx, text, maxWidth, startSize, weight = 'bold') {
  let size = startSize;
  ctx.font = `${weight} ${size}px sans-serif`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px sans-serif`;
  }
  return size;
}

/** Caption band: small subtitle line, then the huge outlined caption with
 * an accent underline bar. Lives entirely below the panels. */
function paintCaptionBand(ctx, w, h, caption, subtitle, grade) {
  const bandY = h * 0.775;
  const bandH = h * 0.125;
  const cx = w / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // Subtitle, small caps with letter spacing drawn manually.
  const sub = (subtitle || '').trim().toUpperCase();
  if (sub) {
    const size = Math.round(h * 0.021);
    fitFont(ctx, sub, w * 0.8, size, 'bold');
    ctx.fillStyle = grade.accent;
    ctx.fillText(sub, cx, bandY + h * 0.028);
  }
  // Caption: up to two lines, outlined in dark, filled with the grade title.
  const words = (caption || 'VICE CITY').trim().toUpperCase().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    ctx.font = `bold ${Math.round(h * 0.075)}px sans-serif`;
    if (ctx.measureText(trial).width > w * 0.88 && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  const shown = lines.slice(0, 2);
  const lineH = h * 0.062;
  const top = bandY + h * (sub ? 0.055 : 0.02) + lineH * 0.78;
  shown.forEach((line, i) => {
    const size = fitFont(ctx, line, w * 0.9, Math.round(h * 0.068));
    const y = top + i * lineH;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10,6,20,0.9)';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(line, cx, y);
    ctx.fillStyle = grade.title;
    ctx.fillText(line, cx, y);
  });
  // Accent underline bar under the last line.
  const barY = top + (shown.length - 1) * lineH + h * 0.018;
  ctx.fillStyle = grade.accent;
  ctx.fillRect(cx - w * 0.16, barY, w * 0.32, Math.max(4, h * 0.008));
  ctx.restore();
}

/** Mission strip along the foot: mission label, stars, and a fake date. */
function paintMissionStrip(ctx, w, h, grade, subtitle) {
  const y = h * 0.925;
  const sh = h * 0.038;
  ctx.save();
  roundRect(ctx, w * 0.04, y, w * 0.92, sh, sh * 0.35);
  ctx.fillStyle = 'rgba(8,6,18,0.82)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(1, w * 0.0015);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const mission = `MISSION: ${(subtitle || 'LEONIDA NIGHTS').trim().toUpperCase()} — 100%`;
  ctx.font = `bold ${Math.round(sh * 0.42)}px sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(mission, w * 0.06, y + sh / 2 + sh * 0.03);
  // Five stars, right-aligned inside the strip so none is clipped.
  ctx.fillStyle = grade.accent;
  const starR = sh * 0.26;
  for (let i = 0; i < 5; i++) {
    const sx = w * (0.845 + i * 0.023);
    const sy = y + sh / 2;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 === 0 ? starR : starR * 0.45;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const px = sx + Math.cos(a) * r;
      const py = sy + Math.sin(a) * r;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function paintVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.30)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Renders the whole cover onto `ctx` at its own canvas size.
 * `slots` is an array of 4 panel slots; `opts` carries layout, grade,
 * caption and subtitle. Deterministic for fixed inputs.
 */
export function renderCover(ctx, slots, opts = {}) {
  const { width: w, height: h } = ctx.canvas;
  const layout = LAYOUTS.includes(opts.layout) ? opts.layout : 'poster';
  const grade = GRADE_TABLE[GRADES.includes(opts.grade) ? opts.grade : 'sunset'];
  const fractions = panelFractions(layout);
  paintBackdrop(ctx, w, h, grade);
  const rects = fractions.map(([fx, fy, fw, fh]) => [fx * w, fy * h, fw * w, fh * h]);
  rects.forEach((rect, i) => paintPanel(ctx, rect, slots[i], grade, i));
  // Badge top-left, map inset top-right, both inside the hero panel.
  const hero = rects[0];
  const badgeW = Math.min(hero[2] * 0.30, w * 0.26);
  paintBadge(ctx, hero[0] + w * 0.018, hero[1] + h * 0.018, badgeW, grade);
  const mapW = Math.min(hero[2] * 0.30, w * 0.25);
  const mapH = mapW * 0.78;
  paintMapInset(
    ctx,
    hero[0] + hero[2] - mapW - w * 0.018,
    hero[1] + h * 0.018,
    mapW,
    mapH,
    grade,
  );
  paintCaptionBand(ctx, w, h, opts.caption ?? 'VICE CITY', opts.subtitle ?? 'Leonida Nights', grade);
  paintMissionStrip(ctx, w, h, grade, opts.subtitle ?? 'Leonida Nights');
  paintVignette(ctx, w, h);
}
