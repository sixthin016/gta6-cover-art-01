// Leonida Press — cover engine: 7 layouts, 6 colour grades, chrome/halftone titles.
// drawCover(canvas, state) paints the whole cover. state:
//   { layout, grade, title, subtitle, caption, issue, panels: [{ photo, scene, ox, oy, zoom, label }] }
// A panel shows a user photo when present, otherwise its procedural scene.
import { SCENES, mulberry32, renderSceneCanvas, drawHeroDuo } from './scenes.js';

export const LAYOUTS = [
  { id: 'poster', name: 'Poster 5-Panel', panels: 5 },
  { id: 'grid', name: 'Grid 3×2', panels: 6 },
  { id: 'hero', name: 'Hero Single', panels: 1 },
  { id: 'story', name: 'Story 1080×1350', panels: 4 },
  { id: 'wide', name: 'Wide Cinematic', panels: 3 },
  { id: 'comic', name: 'Comic Strip', panels: 4 },
  { id: 'magazine', name: 'Magazine', panels: 3 },
];

export const GRADES = [
  { id: 'sunset', name: 'Sunset', top: 'rgba(255,110,60,0.20)', bottom: 'rgba(255,60,140,0.28)', vignette: 0.32, sat: 1.15 },
  { id: 'neon', name: 'Neon', top: 'rgba(0,229,255,0.16)', bottom: 'rgba(255,46,154,0.30)', vignette: 0.38, sat: 1.25 },
  { id: 'noir', name: 'Noir', top: 'rgba(10,10,30,0.28)', bottom: 'rgba(0,0,0,0.42)', vignette: 0.5, sat: 0.55 },
  { id: 'pastel', name: 'Pastel', top: 'rgba(255,200,220,0.22)', bottom: 'rgba(140,220,220,0.20)', vignette: 0.18, sat: 0.9 },
  { id: 'ink', name: 'Poster-Ink', top: 'rgba(255,180,60,0.14)', bottom: 'rgba(20,10,60,0.34)', vignette: 0.42, sat: 1.3 },
  { id: 'original', name: 'Original', top: 'rgba(0,0,0,0)', bottom: 'rgba(0,0,0,0.10)', vignette: 0.28, sat: 1.0 },
];

const PANEL_LABELS = ['OCEAN DR', 'PIER 9', 'DOWNTOWN', 'VICE BEACH', 'THE STRIP', 'LEONIDA BAYOU'];

// Panel rectangles (fractions of W/H) per layout. Title band is reserved separately.
export function layoutPanels(layout, W, H) {
  const t = 0.24; // title band at the bottom
  const g = 0.012; // gap
  const area = { x: g, y: g, w: 1 - 2 * g, h: 1 - t - g };
  const P = (x, y, w, h, i) => ({ x: x * W, y: y * H, w: w * W, h: h * H, i });
  switch (layout) {
    case 'poster': // hero top + 4 below (GTA multi-panel poster)
      return [
        P(area.x, area.y, area.w, area.h * 0.52, 0),
        P(area.x, area.y + area.h * 0.52 + g, area.w * 0.25 - g / 2, area.h * 0.48 - g, 1),
        P(area.x + area.w * 0.25 + g / 2, area.y + area.h * 0.52 + g, area.w * 0.25 - g / 2, area.h * 0.48 - g, 2),
        P(area.x + area.w * 0.50 + g / 2, area.y + area.h * 0.52 + g, area.w * 0.25 - g / 2, area.h * 0.48 - g, 3),
        P(area.x + area.w * 0.75 + g / 2, area.y + area.h * 0.52 + g, area.w * 0.25 - g / 2, area.h * 0.48 - g, 4),
      ];
    case 'grid':
      return [0, 1, 2, 3, 4, 5].map((i) => {
        const cx = i % 3, cy = Math.floor(i / 3);
        return P(area.x + cx * (area.w / 3 + g / 2) - (cx === 0 ? 0 : g / 2) + (cx === 2 ? g / 2 : 0) * 0,
          area.y + cy * (area.h / 2 + g / 2), area.w / 3 - g / 2, area.h / 2 - g / 2, i);
      });
    case 'hero':
      return [P(area.x, area.y, area.w, area.h, 0)];
    case 'story': // tall: hero + 3 stacked strips
      return [
        P(area.x, area.y, area.w, area.h * 0.55, 0),
        P(area.x, area.y + area.h * 0.55 + g, area.w, area.h * 0.14 - g / 2, 1),
        P(area.x, area.y + area.h * 0.69 + g, area.w, area.h * 0.14 - g / 2, 2),
        P(area.x, area.y + area.h * 0.83 + g, area.w, area.h * 0.17 - g, 3),
      ];
    case 'wide': // cinematic: wide hero + two small
      return [
        P(area.x, area.y, area.w, area.h * 0.62, 0),
        P(area.x, area.y + area.h * 0.62 + g, area.w * 0.5 - g / 2, area.h * 0.38 - g, 1),
        P(area.x + area.w * 0.5 + g / 2, area.y + area.h * 0.62 + g, area.w * 0.5 - g / 2, area.h * 0.38 - g, 2),
      ];
    case 'comic': // 4 tilted strips, comic-book energy
      return [0, 1, 2, 3].map((i) => P(area.x, area.y + i * (area.h / 4 + g / 2) - (i === 0 ? 0 : 0), area.w, area.h / 4 - g / 2, i));
    case 'magazine': // masthead hero + bottom pair
      return [
        P(area.x, area.y, area.w, area.h * 0.60, 0),
        P(area.x, area.y + area.h * 0.60 + g, area.w * 0.5 - g / 2, area.h * 0.40 - g, 1),
        P(area.x + area.w * 0.5 + g / 2, area.y + area.h * 0.60 + g, area.w * 0.5 - g / 2, area.h * 0.40 - g, 2),
      ];
    default:
      return [P(area.x, area.y, area.w, area.h, 0)];
  }
}

function fitTitleFont(ctx, text, maxW, startSize) {
  let size = startSize;
  ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 14) {
    size -= 2;
    ctx.font = `900 ${size}px "Arial Black", "Helvetica Neue", sans-serif`;
  }
  return size;
}

// Chrome title: thick dark outline, sunset-chrome gradient fill, halftone dots, white rim.
export function drawChromeTitle(ctx, text, cx, y, maxW, size) {
  const upper = text.toUpperCase();
  const fs = fitTitleFont(ctx, upper, maxW, size);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  // Halftone dot field behind the letters.
  const off = document.createElement('canvas');
  off.width = Math.ceil(maxW); off.height = Math.ceil(fs * 1.3);
  const o = off.getContext('2d');
  o.font = ctx.font; o.textAlign = 'center'; o.textBaseline = 'middle';
  o.fillStyle = '#fff';
  o.fillText(upper, maxW / 2, fs * 0.62);
  o.globalCompositeOperation = 'source-in';
  const rng = mulberry32(99);
  for (let yy = 0; yy < off.height; yy += 7) {
    for (let xx = 0; xx < off.width; xx += 7) {
      const r = 1 + rng() * 2.2;
      o.fillStyle = `rgba(255,255,255,${0.25 + rng() * 0.4})`;
      o.beginPath(); o.arc(xx + 3, yy + 3, r, 0, Math.PI * 2); o.fill();
    }
  }
  ctx.save();
  ctx.translate(cx - maxW / 2, y - fs * 0.95);
  ctx.drawImage(off, 0, 0);
  ctx.restore();
  // Outline + chrome fill.
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#14041f';
  ctx.lineWidth = Math.max(6, fs * 0.14);
  ctx.strokeText(upper, cx, y);
  const grad = ctx.createLinearGradient(0, y - fs, 0, y + fs * 0.15);
  grad.addColorStop(0, '#fffbe0');
  grad.addColorStop(0.35, '#ffd27a');
  grad.addColorStop(0.55, '#ff7a3c');
  grad.addColorStop(0.75, '#ff2e9a');
  grad.addColorStop(1, '#7b2dff');
  ctx.fillStyle = grad;
  ctx.fillText(upper, cx, y);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(1.5, fs * 0.02);
  ctx.strokeText(upper, cx, y);
  return fs;
}

function drawPanelLabel(ctx, rect, label, W) {
  const fs = Math.max(11, W * 0.016);
  ctx.font = `800 ${fs}px "Helvetica Neue", Arial, sans-serif`;
  const pad = fs * 0.55;
  const tw = ctx.measureText(label).width;
  const bx = rect.x + 8, by = rect.y + rect.h - fs * 2.1;
  ctx.fillStyle = 'rgba(10,4,20,0.82)';
  ctx.fillRect(bx, by, tw + pad * 2, fs * 1.7);
  ctx.fillStyle = '#ffd27a';
  ctx.fillRect(bx, by, 4, fs * 1.7);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + pad + 3, by + fs * 0.88);
}

function applyGrade(ctx, W, H, grade) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, grade.top);
  g.addColorStop(1, grade.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Vignette.
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(5,2,12,${grade.vignette})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function grain(ctx, W, H, seed) {
  const rng = mulberry32(seed);
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < W * H / 900; i++) {
    ctx.fillStyle = rng() < 0.5 ? '#fff' : '#000';
    ctx.fillRect(rng() * W, rng() * H, 1.4, 1.4);
  }
  ctx.restore();
}

function drawPhotoInto(ctx, photo, rect, ox, oy, zoom) {
  const iw = photo.naturalWidth || photo.width, ih = photo.naturalHeight || photo.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * (zoom || 1);
  const dw = iw * base, dh = ih * base;
  const dx = rect.x + (rect.w - dw) / 2 + (ox || 0) * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + (oy || 0) * rect.h;
  ctx.drawImage(photo, dx, dy, dw, dh);
}

function drawSceneInto(ctx, sceneId, rect) {
  const c = renderSceneCanvas(sceneId, Math.max(2, Math.round(rect.w)), Math.max(2, Math.round(rect.h)));
  ctx.drawImage(c, rect.x, rect.y, rect.w, rect.h);
}

export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const grade = GRADES.find((g) => g.id === state.grade) ?? GRADES[0];
  const layout = LAYOUTS.find((l) => l.id === state.layout) ?? LAYOUTS[0];
  const panels = state.panels || [];

  // Backdrop: deep violet + faint halftone field.
  ctx.fillStyle = '#12041f';
  ctx.fillRect(0, 0, W, H);

  const rects = layoutPanels(state.layout, W, H);
  rects.forEach((rect, idx) => {
    const panel = panels[idx] || {};
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (panel.photo) {
      drawPhotoInto(ctx, panel.photo, rect, panel.ox, panel.oy, panel.zoom);
    } else if (panel.heroDuo) {
      const c = document.createElement('canvas');
      c.width = Math.max(2, Math.round(rect.w)); c.height = Math.max(2, Math.round(rect.h));
      drawHeroDuo(c.getContext('2d'), c.width, c.height, mulberry32(7));
      ctx.drawImage(c, rect.x, rect.y, rect.w, rect.h);
    } else {
      drawSceneInto(ctx, panel.scene || SCENES[idx % SCENES.length].id, rect);
    }
    // Grade wash per panel, then frame.
    const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
    g.addColorStop(0, grade.top); g.addColorStop(1, grade.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = Math.max(1, W * 0.0015);
    ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
    const scene = SCENES.find((s) => s.id === panel.scene);
    const label = panel.label || (scene ? scene.label : null) || PANEL_LABELS[idx % PANEL_LABELS.length];
    drawPanelLabel(ctx, rect, label, W);
  });

  // ---- Title band ----
  const bandY = H * 0.76;
  const band = ctx.createLinearGradient(0, bandY, 0, H);
  band.addColorStop(0, 'rgba(18,4,31,0)');
  band.addColorStop(0.15, 'rgba(18,4,31,0.92)');
  band.addColorStop(1, '#12041f');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, W, H - bandY);
  // Issue rule.
  ctx.fillStyle = '#ff2e9a';
  ctx.fillRect(W * 0.04, bandY + H * 0.018, W * 0.92, Math.max(2, H * 0.004));

  const title = (state.title || 'LEONIDA').trim().toUpperCase() || 'LEONIDA';
  const titleSize = drawChromeTitle(ctx, title, W / 2, H * 0.935, W * 0.92, H * 0.095);

  // Subtitle (neon script feel: italic bold, pink glow).
  const sub = (state.subtitle || '').trim();
  if (sub) {
    const fs = Math.max(14, H * 0.024);
    ctx.font = `italic 800 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.save();
    ctx.shadowColor = '#ff2e9a'; ctx.shadowBlur = fs * 0.7;
    ctx.fillStyle = '#ffe9f6';
    ctx.fillText(sub.toUpperCase(), W / 2, H * 0.972);
    ctx.restore();
  }

  // Badge LEONIDA + issue line, top corners of the band.
  const badgeFs = Math.max(12, H * 0.017);
  ctx.font = `900 ${badgeFs}px "Arial Black", sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const badgeText = '★ LEONIDA PRESS';
  const bw = ctx.measureText(badgeText).width + badgeFs * 1.2;
  const badgeY = bandY + H * 0.048;
  ctx.fillStyle = '#ffd27a';
  ctx.fillRect(W * 0.04, badgeY, bw, badgeFs * 1.9);
  ctx.fillStyle = '#14041f';
  ctx.fillText(badgeText, W * 0.04 + badgeFs * 0.6, badgeY + badgeFs * 0.98);
  ctx.textAlign = 'right';
  ctx.font = `700 ${badgeFs}px "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText((state.issue || 'ISSUE 06 · VICE CITY · 2026').toUpperCase(), W * 0.96, badgeY + badgeFs * 0.95);

  // Caption strip (small, between badge row and title).
  const cap = (state.caption || '').trim();
  if (cap) {
    const fs = Math.max(13, H * 0.020);
    ctx.font = `700 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(cap, W / 2, bandY + H * 0.09);
  }

  applyGrade(ctx, W, H, grade);
  grain(ctx, W, H, 1234);
  // Outer frame.
  ctx.strokeStyle = '#ffd27a';
  ctx.lineWidth = Math.max(3, W * 0.004);
  ctx.strokeRect(W * 0.008, H * 0.008, W * 0.984, H * 0.984);
  return { titleSize };
}

export const EXPORT_SIZES = [
  { id: '1080x1080', label: 'Square · 1080 × 1080', w: 1080, h: 1080 },
  { id: '1080x1350', label: 'Portrait · 1080 × 1350', w: 1080, h: 1350 },
  { id: '1920x1080', label: 'Landscape · 1920 × 1080', w: 1920, h: 1080 },
  { id: '1080x1920', label: 'Story · 1080 × 1920', w: 1080, h: 1920 },
];

export function exportCoverPNG(state, sizeId) {
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) ?? EXPORT_SIZES[0];
  const c = document.createElement('canvas');
  c.width = size.w; c.height = size.h;
  drawCover(c, state);
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}
