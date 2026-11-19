// Procedural demo "photos" for Vice Cover Studio. Each scene paints a whole
// Leonida postcard — boulevard sunset, neon pier, dusk skyline, beach day —
// with the canvas 2D API only. No photo file is ever loaded, so the app works
// with zero assets. Every scene is drawn from a fixed seed, so the pixels are
// identical on every run.

import { mulberry32, range } from './rng.js';

export const SCENE_IDS = ['boulevard', 'pier', 'skyline', 'beach'];

const SEEDS = { boulevard: 101, pier: 202, skyline: 303, beach: 404 };

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function glowSun(ctx, x, y, r, core, halo) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 2.2);
  g.addColorStop(0, halo);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 2.4, y - r * 2.4, r * 4.8, r * 4.8);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Retro sun slats.
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(20,8,40,0.55)';
  for (let i = 0; i < 4; i++) {
    const sy = y + r * 0.15 + i * r * 0.22;
    ctx.fillRect(x - r, sy, r * 2, r * 0.07);
  }
  ctx.restore();
}

function stars(ctx, w, h, rand, n, topFrac) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) {
    const x = rand() * w;
    const y = rand() * h * topFrac;
    const r = 0.6 + rand() * 1.6;
    ctx.globalAlpha = 0.35 + rand() * 0.65;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function birds(ctx, w, h, rand, n, yTop, yBottom) {
  ctx.strokeStyle = 'rgba(20,10,30,0.85)';
  ctx.lineWidth = Math.max(2, w * 0.004);
  for (let i = 0; i < n; i++) {
    const x = range(rand, w * 0.1, w * 0.9);
    const y = range(rand, yTop, yBottom);
    const s = range(rand, w * 0.02, w * 0.045);
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.55, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.55, x + s, y);
    ctx.stroke();
  }
}

/** A palm silhouette: curved trunk + drooping fronds. */
function palm(ctx, x, y, size, lean, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, size * 0.05);
  ctx.lineCap = 'round';
  // Trunk, bending toward `lean`.
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * 0.25, y - size * 0.55, x + lean, y - size);
  ctx.stroke();
  const topX = x + lean;
  const topY = y - size;
  // Fronds.
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI / 2) + (i - 3) * 0.42;
    const len = size * (0.62 + (i % 2) * 0.12);
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len + size * 0.10;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.5,
      topY + Math.sin(a) * len * 0.45 - size * 0.08,
      ex,
      ey,
    );
    ctx.lineWidth = Math.max(2, size * 0.035);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(topX - size * 0.03, topY + size * 0.04, size * 0.035, 0, Math.PI * 2);
  ctx.arc(topX + size * 0.04, topY + size * 0.05, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

/** Lit-window city silhouette along the bottom of the frame. `maxH` caps the
 * tallest tower as a fraction of the frame height. */
function cityRow(ctx, w, h, baseY, rand, palette, maxH = 0.42) {
  let x = -w * 0.02;
  while (x < w * 1.02) {
    const bw = range(rand, w * 0.06, w * 0.16);
    const bh = range(rand, h * 0.12, h * maxH);
    ctx.fillStyle = palette;
    ctx.fillRect(x, baseY - bh, bw, bh);
    // Rooftop antenna on some towers.
    if (rand() < 0.35) {
      ctx.fillRect(x + bw * 0.45, baseY - bh - h * 0.06, w * 0.006, h * 0.06);
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.arc(x + bw * 0.48, baseY - bh - h * 0.065, w * 0.006, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = palette;
    }
    // Windows.
    const cols = Math.max(2, Math.floor(bw / (w * 0.02)));
    const rows = Math.max(2, Math.floor(bh / (h * 0.035)));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < 0.42) {
          ctx.fillStyle = rand() < 0.75 ? '#ffd166' : '#7ef0e0';
          ctx.globalAlpha = 0.5 + rand() * 0.5;
          ctx.fillRect(
            x + w * 0.008 + c * (bw / cols),
            baseY - bh + h * 0.012 + r * (bh / rows),
            w * 0.011,
            h * 0.016,
          );
          ctx.globalAlpha = 1;
        }
      }
    }
    x += bw + range(rand, 0, w * 0.015);
  }
}

function boulevard(ctx, w, h, rand) {
  skyGradient(ctx, w, h, [[0, '#2b1055'], [0.45, '#c2437a'], [0.75, '#ff7e5f'], [1, '#feb47b']]);
  glowSun(ctx, w * 0.5, h * 0.38, w * 0.11, '#fff3c4', 'rgba(255,190,90,0.55)');
  stars(ctx, w, h, rand, 40, 0.3);
  birds(ctx, w, h, rand, 5, h * 0.08, h * 0.3);
  // Shorter towers here so the sun stays visible above the skyline.
  cityRow(ctx, w, h, h * 0.62, rand, '#241536', 0.28);
  // Street: perspective road from the horizon to the bottom edge.
  ctx.fillStyle = '#1c1426';
  ctx.beginPath();
  ctx.moveTo(w * 0.32, h * 0.62);
  ctx.lineTo(w * 0.68, h * 0.62);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  // Sidewalks.
  ctx.fillStyle = '#3a2b4d';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.lineTo(w * 0.32, h * 0.62);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w, h * 0.62);
  ctx.lineTo(w * 0.68, h * 0.62);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  // Centre dashes, growing toward the viewer.
  ctx.fillStyle = '#ffd166';
  for (let i = 0; i < 6; i++) {
    const t = i / 6;
    const y = h * (0.64 + t * 0.34);
    const half = w * (0.004 + t * 0.016);
    ctx.fillRect(w * 0.5 - half / 2, y, half, h * (0.012 + t * 0.03));
  }
  // Neon signs on both sidewalks.
  const signs = ['#00e5ff', '#ff2e88', '#ffd166', '#7ef0e0'];
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = w * 0.5 + side * w * (0.30 + i * 0.055);
    const y = h * (0.68 + i * 0.055);
    const sw = w * (0.055 + i * 0.012);
    const sh = h * (0.035 + i * 0.008);
    ctx.fillStyle = signs[i % signs.length];
    ctx.globalAlpha = 0.9;
    ctx.fillRect(x - sw / 2, y, sw, sh);
    ctx.globalAlpha = 0.25;
    ctx.fillRect(x - sw, y - sh * 0.4, sw * 3, sh * 1.8);
    ctx.globalAlpha = 1;
  }
  palm(ctx, w * 0.07, h * 0.99, h * 0.34, w * 0.05, '#160a24');
  palm(ctx, w * 0.93, h * 0.99, h * 0.30, -w * 0.04, '#160a24');
  // Low sun haze.
  const haze = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.75);
  haze.addColorStop(0, 'rgba(255,120,90,0)');
  haze.addColorStop(1, 'rgba(255,120,90,0.18)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, h * 0.55, w, h * 0.2);
}

function pier(ctx, w, h, rand) {
  skyGradient(ctx, w, h, [[0, '#070b2a'], [0.5, '#1d1450'], [0.8, '#5b1e63'], [1, '#ff2e88']]);
  stars(ctx, w, h, rand, 90, 0.5);
  // Moon.
  ctx.fillStyle = '#f4f1ff';
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.16, w * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(180,170,220,0.5)';
  ctx.beginPath();
  ctx.arc(w * 0.805, h * 0.15, w * 0.012, 0, Math.PI * 2);
  ctx.arc(w * 0.835, h * 0.175, w * 0.008, 0, Math.PI * 2);
  ctx.fill();
  // Ferris wheel, glowing.
  const cx = w * 0.24;
  const cy = h * 0.44;
  const R = w * 0.17;
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = Math.max(3, w * 0.008);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
  ctx.stroke();
  const cabins = ['#ff2e88', '#ffd166', '#00e5ff', '#7ef0e0', '#ff7e5f', '#b388ff'];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    ctx.strokeStyle = 'rgba(0,229,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = cabins[i % cabins.length];
    ctx.beginPath();
    ctx.arc(x, y, w * 0.016, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#0b1035';
  ctx.lineWidth = Math.max(4, w * 0.012);
  ctx.beginPath();
  ctx.moveTo(cx - R * 0.5, h * 0.72);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + R * 0.5, h * 0.72);
  ctx.stroke();
  // Pier deck.
  ctx.fillStyle = '#120b2e';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  ctx.fillStyle = '#241a4d';
  for (let i = 0; i < 14; i++) {
    ctx.fillRect(0, h * (0.72 + i * 0.02), w, h * 0.004);
  }
  // Neon rail lights.
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#00e5ff' : '#ff2e88';
    ctx.beginPath();
    ctx.arc(w * (0.04 + i * 0.08), h * 0.735, w * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }
  // Water with neon reflections below the deck edge.
  const water = ctx.createLinearGradient(0, h * 0.78, 0, h);
  water.addColorStop(0, '#1a1440');
  water.addColorStop(1, '#070b2a');
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.86, w, h * 0.14);
  for (let i = 0; i < 26; i++) {
    const y = h * (0.87 + rand() * 0.12);
    const x = rand() * w;
    const len = range(rand, w * 0.03, w * 0.12);
    ctx.strokeStyle = rand() < 0.5 ? 'rgba(0,229,255,0.5)' : 'rgba(255,46,136,0.5)';
    ctx.lineWidth = Math.max(2, h * 0.004);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
}

function skyline(ctx, w, h, rand) {
  skyGradient(ctx, w, h, [[0, '#0f1e3d'], [0.45, '#274b73'], [0.75, '#e08a4b'], [1, '#f7c873']]);
  glowSun(ctx, w * 0.68, h * 0.55, w * 0.09, '#ffe9a8', 'rgba(255,190,90,0.5)');
  // Clouds.
  ctx.fillStyle = 'rgba(255,220,180,0.5)';
  for (let i = 0; i < 6; i++) {
    const x = rand() * w;
    const y = range(rand, h * 0.06, h * 0.3);
    const cw = range(rand, w * 0.12, w * 0.28);
    ctx.beginPath();
    ctx.ellipse(x, y, cw, h * 0.022, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  cityRow(ctx, w, h, h * 0.78, rand, '#141b2e');
  // Second, nearer row of towers.
  cityRow(ctx, w, h, h * 0.86, rand, '#0a0f1e');
  // Water in front.
  const water = ctx.createLinearGradient(0, h * 0.86, 0, h);
  water.addColorStop(0, '#2a4a6b');
  water.addColorStop(1, '#0f1e3d');
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.86, w, h * 0.14);
  for (let i = 0; i < 22; i++) {
    const y = h * (0.87 + rand() * 0.12);
    ctx.strokeStyle = 'rgba(247,200,115,0.45)';
    ctx.lineWidth = Math.max(2, h * 0.004);
    ctx.beginPath();
    ctx.moveTo(rand() * w, y);
    ctx.lineTo(rand() * w + w * 0.08, y);
    ctx.stroke();
  }
  // A small boat with a wake.
  ctx.fillStyle = '#0a0f1e';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, h * 0.93);
  ctx.lineTo(w * 0.58, h * 0.93);
  ctx.lineTo(w * 0.55, h * 0.955);
  ctx.lineTo(w * 0.45, h * 0.955);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.moveTo(w * 0.44, h * 0.958);
  ctx.lineTo(w * 0.38, h * 0.965);
  ctx.moveTo(w * 0.56, h * 0.958);
  ctx.lineTo(w * 0.62, h * 0.965);
  ctx.stroke();
}

function beach(ctx, w, h, rand) {
  skyGradient(ctx, w, h, [[0, '#3ec6e0'], [0.45, '#a8e6e0'], [0.62, '#ffe9a8'], [1, '#ffd166']]);
  glowSun(ctx, w * 0.72, h * 0.26, w * 0.09, '#fffbe0', 'rgba(255,240,170,0.6)');
  // Clouds.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 5; i++) {
    const x = rand() * w;
    const y = range(rand, h * 0.05, h * 0.25);
    ctx.beginPath();
    ctx.ellipse(x, y, range(rand, w * 0.08, w * 0.16), h * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  birds(ctx, w, h, rand, 4, h * 0.1, h * 0.28);
  // Ocean.
  const sea = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.72);
  sea.addColorStop(0, '#2fb3c9');
  sea.addColorStop(1, '#0f7ea8');
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.5, w, h * 0.22);
  // Wave lines.
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 5; i++) {
    const y = h * (0.53 + i * 0.035);
    ctx.lineWidth = Math.max(2, h * 0.005);
    ctx.beginPath();
    for (let x = 0; x <= w; x += w / 24) {
      const yy = y + Math.sin(x * 0.02 + i * 1.7) * h * 0.006;
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  // Sand.
  const sand = ctx.createLinearGradient(0, h * 0.72, 0, h);
  sand.addColorStop(0, '#f2d8a0');
  sand.addColorStop(1, '#e0b96f');
  ctx.fillStyle = sand;
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  // Wet sand band.
  ctx.fillStyle = 'rgba(190,150,90,0.5)';
  ctx.fillRect(0, h * 0.72, w, h * 0.03);
  // Footprints.
  ctx.fillStyle = 'rgba(150,110,60,0.55)';
  for (let i = 0; i < 8; i++) {
    const x = w * (0.3 + i * 0.045) + (i % 2 ? w * 0.015 : -w * 0.015);
    const y = h * (0.8 + i * 0.02);
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.012, h * 0.008, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Umbrella: striped cone on a pole.
  const ux = w * 0.2;
  const uy = h * 0.78;
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = Math.max(3, w * 0.006);
  ctx.beginPath();
  ctx.moveTo(ux, uy);
  ctx.lineTo(ux, h * 0.99);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a0 = Math.PI + (i / 8) * Math.PI;
    const a1 = Math.PI + ((i + 1) / 8) * Math.PI;
    ctx.fillStyle = i % 2 === 0 ? '#ff5e7a' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(ux, uy - h * 0.02);
    ctx.arc(ux, uy - h * 0.02, w * 0.13, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  palm(ctx, w * 0.86, h * 0.98, h * 0.36, -w * 0.05, '#1d4d33');
  // Beach ball.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w * 0.62, h * 0.9, w * 0.035, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff5e7a';
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.9);
  ctx.arc(w * 0.62, h * 0.9, w * 0.035, -Math.PI / 2, Math.PI / 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#00a8cc';
  ctx.beginPath();
  ctx.moveTo(w * 0.62, h * 0.9);
  ctx.arc(w * 0.62, h * 0.9, w * 0.035, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.fill();
}

const PAINTERS = { boulevard, pier, skyline, beach };

/** Paints scene `id` onto a fresh canvas of `w` x `h` and returns it. */
export function paintScene(id, w = 720, h = 720) {
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(SEEDS[id] ?? 999);
  (PAINTERS[id] ?? boulevard)(ctx, w, h, rand);
  return canvas;
}

/** Paints every scene once, keyed by id. */
export function paintAllScenes(size = 720) {
  const out = {};
  for (const id of SCENE_IDS) out[id] = paintScene(id, size, size);
  return out;
}
