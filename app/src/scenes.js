// Neon Coast Cover Studio — procedural demo scenes.
// Nine small painted scenes used only as a hidden fallback: when a panel has
// no photo assigned, the panel paints one of these instead of staying empty.
// Real photos are always the default; these exist so a panel never renders
// blank and so the demo library shows what the layout engine can do.

export const SCENE_NAMES = [
  'Sunset Beach', 'Neon Street', 'Palm Dusk', 'Car Chase', 'Speedboat Run',
  'Skyline', 'Motel Row', 'Pier Lights', 'Highway Dawn',
];

function sky(ctx, rect, stops) {
  const g = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function sun(ctx, rect, cxF, cyF, rF, color) {
  const cx = rect.x + rect.w * cxF;
  const cy = rect.y + rect.h * cyF;
  const r = rect.w * rF;
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function palm(ctx, x, y, s, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(8, -60, 4, -110);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55;
    ctx.beginPath();
    ctx.moveTo(4, -110);
    ctx.quadraticCurveTo(4 + Math.cos(a) * 34, -110 + Math.sin(a) * 30, 4 + Math.cos(a) * 58, -110 + Math.sin(a) * 52);
    ctx.stroke();
  }
  ctx.restore();
}

function building(ctx, x, y, w, h, color, lit) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  if (lit) {
    ctx.fillStyle = 'rgba(255,210,90,0.85)';
    const cols = Math.max(1, Math.floor(w / 18));
    const rows = Math.max(1, Math.floor(h / 22));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if ((c * 7 + r * 3) % 3 === 0) ctx.fillRect(x + 5 + c * 18, y + 6 + r * 22, 8, 10);
      }
    }
  }
}

function car(ctx, x, y, w, color) {
  const h = w * 0.32;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.55);
  ctx.lineTo(x + w * 0.08, y + h * 0.35);
  ctx.lineTo(x + w * 0.32, y + h * 0.18);
  ctx.lineTo(x + w * 0.68, y + h * 0.18);
  ctx.lineTo(x + w * 0.9, y + h * 0.38);
  ctx.lineTo(x + w, y + h * 0.55);
  ctx.lineTo(x + w, y + h * 0.8);
  ctx.lineTo(x, y + h * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0d0d18';
  ctx.beginPath();
  ctx.arc(x + w * 0.24, y + h * 0.82, w * 0.09, 0, Math.PI * 2);
  ctx.arc(x + w * 0.76, y + h * 0.82, w * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,240,180,0.9)';
  ctx.fillRect(x + w * 0.86, y + h * 0.42, w * 0.08, h * 0.12);
}

const SCENES = [
  // 0 Sunset Beach
  (ctx, r) => {
    sky(ctx, r, [[0, '#2b1055'], [0.5, '#c22a6e'], [0.8, '#ff7a3c'], [1, '#ffc46b']]);
    sun(ctx, r, 0.5, 0.42, 0.22, '#fff0aa');
    ctx.fillStyle = '#0e4d6e';
    ctx.fillRect(r.x, r.y + r.h * 0.62, r.w, r.h * 0.38);
    ctx.fillStyle = '#f2c98a';
    ctx.fillRect(r.x, r.y + r.h * 0.78, r.w, r.h * 0.22);
    palm(ctx, r.x + r.w * 0.16, r.y + r.h * 0.8, r.w / 260, -0.12);
    palm(ctx, r.x + r.w * 0.86, r.y + r.h * 0.82, r.w / 300, 0.14);
  },
  // 1 Neon Street
  (ctx, r) => {
    sky(ctx, r, [[0, '#12041f'], [0.6, '#3d1157'], [1, '#8a1d6e']]);
    building(ctx, r.x + r.w * 0.02, r.y + r.h * 0.2, r.w * 0.26, r.h * 0.8, '#1c0b2e', true);
    building(ctx, r.x + r.w * 0.32, r.y + r.h * 0.08, r.w * 0.3, r.h * 0.92, '#241238', true);
    building(ctx, r.x + r.w * 0.66, r.y + r.h * 0.28, r.w * 0.32, r.h * 0.72, '#1c0b2e', true);
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(r.x + r.w * 0.06, r.y + r.h * 0.16, r.w * 0.2, r.h * 0.05);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(r.x + r.w * 0.36, r.y + r.h * 0.04, r.w * 0.22, r.h * 0.05);
    ctx.fillStyle = '#2a1638';
    ctx.fillRect(r.x, r.y + r.h * 0.86, r.w, r.h * 0.14);
    ctx.fillStyle = 'rgba(255,46,136,0.5)';
    ctx.fillRect(r.x + r.w * 0.1, r.y + r.h * 0.86, r.w * 0.2, r.h * 0.02);
    ctx.fillStyle = 'rgba(0,229,255,0.5)';
    ctx.fillRect(r.x + r.w * 0.6, r.y + r.h * 0.9, r.w * 0.25, r.h * 0.02);
  },
  // 2 Palm Dusk
  (ctx, r) => {
    sky(ctx, r, [[0, '#1a0b33'], [0.55, '#7a2a6e'], [1, '#ff8a5c']]);
    sun(ctx, r, 0.68, 0.55, 0.18, '#ffd27a');
    ctx.fillStyle = '#160a24';
    ctx.fillRect(r.x, r.y + r.h * 0.72, r.w, r.h * 0.28);
    palm(ctx, r.x + r.w * 0.22, r.y + r.h * 0.74, r.w / 220, -0.2);
    palm(ctx, r.x + r.w * 0.5, r.y + r.h * 0.76, r.w / 260, 0.05);
    palm(ctx, r.x + r.w * 0.8, r.y + r.h * 0.73, r.w / 240, 0.22);
  },
  // 3 Car Chase
  (ctx, r) => {
    sky(ctx, r, [[0, '#ff9a3c'], [0.5, '#ff5e6e'], [1, '#7b2ff7']]);
    sun(ctx, r, 0.24, 0.3, 0.16, '#fff0aa');
    ctx.fillStyle = '#3a1c4d';
    ctx.fillRect(r.x, r.y + r.h * 0.55, r.w, r.h * 0.45);
    ctx.strokeStyle = 'rgba(255,233,168,0.9)';
    ctx.lineWidth = Math.max(2, r.w * 0.008);
    ctx.setLineDash([r.w * 0.06, r.w * 0.04]);
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h * 0.78);
    ctx.lineTo(r.x + r.w, r.y + r.h * 0.78);
    ctx.stroke();
    ctx.setLineDash([]);
    car(ctx, r.x + r.w * 0.18, r.y + r.h * 0.58, r.w * 0.5, '#ff2e4d');
    car(ctx, r.x + r.w * 0.62, r.y + r.h * 0.66, r.w * 0.3, '#1c1c2e');
  },
  // 4 Speedboat Run
  (ctx, r) => {
    sky(ctx, r, [[0, '#ff7a3c'], [0.45, '#ff5e8a'], [1, '#5b2a8a']]);
    sun(ctx, r, 0.5, 0.4, 0.2, '#fff0aa');
    ctx.fillStyle = '#0e6e8a';
    ctx.fillRect(r.x, r.y + r.h * 0.55, r.w, r.h * 0.45);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(r.x + r.w * (0.05 + i * 0.18), r.y + r.h * (0.62 + (i % 2) * 0.12), r.w * 0.12, r.h * 0.015);
    }
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath();
    ctx.moveTo(r.x + r.w * 0.2, r.y + r.h * 0.62);
    ctx.lineTo(r.x + r.w * 0.75, r.y + r.h * 0.62);
    ctx.lineTo(r.x + r.w * 0.68, r.y + r.h * 0.74);
    ctx.lineTo(r.x + r.w * 0.28, r.y + r.h * 0.74);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(r.x + r.w * 0.68, r.y + r.h * 0.72);
    ctx.quadraticCurveTo(r.x + r.w * 0.85, r.y + r.h * 0.8, r.x + r.w * 0.95, r.y + r.h * 0.72);
    ctx.lineTo(r.x + r.w * 0.68, r.y + r.h * 0.72);
    ctx.fill();
  },
  // 5 Skyline
  (ctx, r) => {
    sky(ctx, r, [[0, '#12041f'], [0.5, '#4d1a6e'], [1, '#ff6e3c']]);
    sun(ctx, r, 0.5, 0.5, 0.24, '#ffd27a');
    const hs = [0.5, 0.68, 0.42, 0.74, 0.58, 0.46, 0.66];
    hs.forEach((h, i) => {
      building(ctx, r.x + (i * r.w) / 7, r.y + r.h * (1 - h - 0.08), r.w / 7 - 2, r.h * (h + 0.08), '#14082a', i % 2 === 0);
    });
    ctx.fillStyle = '#0a0512';
    ctx.fillRect(r.x, r.y + r.h * 0.92, r.w, r.h * 0.08);
  },
  // 6 Motel Row
  (ctx, r) => {
    sky(ctx, r, [[0, '#2b1055'], [0.6, '#c22a6e'], [1, '#ff9a3c']]);
    building(ctx, r.x, r.y + r.h * 0.3, r.w, r.h * 0.45, '#2a1140', true);
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(r.x + r.w * 0.08, r.y + r.h * 0.22, r.w * 0.3, r.h * 0.07);
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(r.x + r.w * 0.58, r.y + r.h * 0.2, r.w * 0.34, r.h * 0.07);
    ctx.fillStyle = '#1c0b2e';
    ctx.fillRect(r.x, r.y + r.h * 0.75, r.w, r.h * 0.25);
    car(ctx, r.x + r.w * 0.3, r.y + r.h * 0.68, r.w * 0.42, '#ffb347');
  },
  // 7 Pier Lights
  (ctx, r) => {
    sky(ctx, r, [[0, '#1b0b2e'], [0.5, '#7a2a6e'], [1, '#ff7a5c']]);
    sun(ctx, r, 0.7, 0.42, 0.18, '#ffd27a');
    ctx.fillStyle = '#0e4d6e';
    ctx.fillRect(r.x, r.y + r.h * 0.6, r.w, r.h * 0.4);
    ctx.fillStyle = '#2a1638';
    ctx.fillRect(r.x, r.y + r.h * 0.52, r.w, r.h * 0.05);
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#ff2e88' : '#00e5ff';
      ctx.beginPath();
      ctx.arc(r.x + r.w * (0.08 + i * 0.16), r.y + r.h * 0.48, r.w * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,210,122,0.5)';
    ctx.fillRect(r.x + r.w * 0.2, r.y + r.h * 0.6, r.w * 0.06, r.h * 0.3);
    ctx.fillRect(r.x + r.w * 0.65, r.y + r.h * 0.6, r.w * 0.06, r.h * 0.3);
  },
  // 8 Highway Dawn
  (ctx, r) => {
    sky(ctx, r, [[0, '#3a1c6e'], [0.5, '#ff5e6e'], [1, '#ffb347']]);
    sun(ctx, r, 0.5, 0.34, 0.15, '#fff0aa');
    ctx.fillStyle = '#241238';
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w * 0.42, r.y + r.h * 0.55);
    ctx.lineTo(r.x + r.w * 0.58, r.y + r.h * 0.55);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = Math.max(2, r.w * 0.008);
    ctx.setLineDash([r.w * 0.05, r.w * 0.05]);
    ctx.beginPath();
    ctx.moveTo(r.x + r.w * 0.5, r.y + r.h * 0.56);
    ctx.lineTo(r.x + r.w * 0.5, r.y + r.h);
    ctx.stroke();
    ctx.setLineDash([]);
    palm(ctx, r.x + r.w * 0.12, r.y + r.h * 0.62, r.w / 300, -0.15);
    palm(ctx, r.x + r.w * 0.9, r.y + r.h * 0.6, r.w / 320, 0.18);
  },
];

/** Paints procedural demo scene `index` (0-8) inside rect `r` on ctx. */
export function drawDemoScene(ctx, index, rect, _grade) {
  const fn = SCENES[((index % SCENES.length) + SCENES.length) % SCENES.length];
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  fn(ctx, rect);
  ctx.restore();
}
