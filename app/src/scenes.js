// Leonida Press — procedural Vice City scenes, painted rich and dense on canvas.
// Every scene is drawn in layers (sky, glow, haze, skyline, street, reflections, neon,
// figures) from a fixed seed, so the same seed always paints the same picture.
// No external images, no Rockstar artwork: all shapes are original code.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a, b, t) { return a + (b - a) * t; }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function skyGradient(ctx, w, h, stops, horizon) {
  const g = ctx.createLinearGradient(0, 0, 0, h * horizon);
  for (const [t, c] of stops) g.addColorStop(t, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h * horizon + 1);
}

function sunGlow(ctx, x, y, r, core, halo) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, core);
  g.addColorStop(0.35, halo);
  g.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function sunDisc(ctx, x, y, r, c1, c2) {
  const g = ctx.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function hazeBands(ctx, w, h, horizon, rng, colors) {
  for (let i = 0; i < 5; i++) {
    const y = horizon * h * (0.55 + i * 0.11) + rng() * 8;
    const g = ctx.createLinearGradient(0, y - 14, 0, y + 14);
    g.addColorStop(0, 'rgba(255,170,120,0)');
    g.addColorStop(0.5, colors[i % colors.length]);
    g.addColorStop(1, 'rgba(255,170,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 14, w, 28);
  }
}

function clouds(ctx, w, h, rng, n, color, top, bottom) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const cx = rng() * w, cy = top + rng() * (bottom - top), s = 0.5 + rng() * 1.4;
    ctx.globalAlpha = 0.10 + rng() * 0.22;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 90 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 50 * s, cy + 4, 60 * s, 10 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 55 * s, cy + 5, 55 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function birds(ctx, w, h, rng, n, y0, y1) {
  ctx.strokeStyle = 'rgba(20,8,20,0.75)';
  ctx.lineWidth = Math.max(1.5, w / 500);
  for (let i = 0; i < n; i++) {
    const x = rng() * w, y = y0 + rng() * (y1 - y0), s = 6 + rng() * 10;
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s / 2, y - s * 0.6, x, y);
    ctx.quadraticCurveTo(x + s / 2, y - s * 0.6, x + s, y);
    ctx.stroke();
  }
}

// Skyline: layered buildings with lit windows, rooftop clutter, antennae.
function skyline(ctx, w, h, horizonY, rng, opts) {
  const { far, near, lit } = opts;
  // Far layer (hazy silhouettes).
  let x = -10;
  while (x < w) {
    const bw = 30 + rng() * 70, bh = h * (0.10 + rng() * 0.22);
    ctx.fillStyle = far;
    ctx.fillRect(x, horizonY - bh, bw, bh + 2);
    x += bw + rng() * 14;
  }
  // Near layer with windows.
  x = -20;
  while (x < w) {
    const bw = 40 + rng() * 90, bh = h * (0.16 + rng() * 0.30);
    const top = horizonY - bh;
    ctx.fillStyle = near;
    ctx.fillRect(x, top, bw, bh + 2);
    // Rooftop details: water tower / antenna / AC boxes.
    if (rng() < 0.55) {
      ctx.fillStyle = near;
      ctx.fillRect(x + bw * 0.2, top - 10 - rng() * 14, bw * 0.18, 12 + rng() * 14);
      ctx.fillRect(x + bw * 0.55, top - 6, bw * 0.22, 7);
    }
    if (rng() < 0.3) { ctx.strokeStyle = near; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + bw / 2, top); ctx.lineTo(x + bw / 2, top - 26 - rng() * 20); ctx.stroke(); }
    // Lit windows.
    const cols = Math.max(2, Math.floor(bw / 16)), rows = Math.max(3, Math.floor(bh / 22));
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if (rng() < 0.42) {
        ctx.fillStyle = pick(rng, lit);
        ctx.globalAlpha = 0.55 + rng() * 0.45;
        ctx.fillRect(x + 5 + c * ((bw - 10) / cols), top + 6 + r * ((bh - 12) / rows), 6, 8);
      }
    }
    ctx.globalAlpha = 1;
    x += bw + rng() * 10;
  }
}

function palm(ctx, x, y, s, color, rng) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, s * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.02, y - s);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = (-Math.PI * 0.15) - (i / 6) * Math.PI * 0.75 + (rng() - 0.5) * 0.2;
    const len = s * (0.42 + rng() * 0.2);
    const tx = x + s * 0.02 + Math.cos(a) * len, ty = y - s + Math.sin(a) * len * 0.7 + len * 0.22;
    ctx.lineWidth = Math.max(2, s * 0.035);
    ctx.beginPath();
    ctx.moveTo(x + s * 0.02, y - s);
    ctx.quadraticCurveTo(x + s * 0.02 + Math.cos(a) * len * 0.5, y - s + Math.sin(a) * len * 0.35 - len * 0.18, tx, ty);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath(); ctx.arc(x + s * 0.02 - 3, y - s + 4, 3, 0, Math.PI * 2); ctx.arc(x + s * 0.02 + 4, y - s + 5, 3, 0, Math.PI * 2); ctx.fill();
}

function wetRoad(ctx, w, h, y0, base, streakColors, rng) {
  const g = ctx.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0, base); g.addColorStop(1, '#0a0614');
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, h - y0);
  // Reflection streaks.
  for (let i = 0; i < 26; i++) {
    const x = rng() * w, len = 20 + rng() * 90;
    ctx.fillStyle = pick(rng, streakColors);
    ctx.globalAlpha = 0.08 + rng() * 0.22;
    ctx.fillRect(x, y0 + 4 + rng() * (h - y0 - len), 2 + rng() * 4, len);
  }
  ctx.globalAlpha = 1;
  // Lane dashes.
  ctx.fillStyle = 'rgba(255,220,120,0.75)';
  for (let x = 0; x < w; x += 90) ctx.fillRect(x, y0 + (h - y0) * 0.62, 42, 4);
}

function car(ctx, x, y, s, body, rng, headlight) {
  // Side-profile car with windows, wheels, glow.
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (headlight) {
    const g = ctx.createRadialGradient(118, 26, 2, 118, 26, 60);
    g.addColorStop(0, 'rgba(255,240,180,0.9)'); g.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(118, 26, 60, 0, Math.PI * 2); ctx.fill();
    const g2 = ctx.createRadialGradient(-8, 26, 2, -8, 26, 46);
    g2.addColorStop(0, 'rgba(255,60,60,0.85)'); g2.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(-8, 26, 46, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(-58, 28); ctx.lineTo(-56, 12); ctx.lineTo(-30, 8); ctx.lineTo(-12, -8);
  ctx.lineTo(34, -8); ctx.lineTo(52, 8); ctx.lineTo(58, 12); ctx.lineTo(58, 28); ctx.closePath(); ctx.fill();
  // Windows.
  ctx.fillStyle = 'rgba(180,220,255,0.85)';
  ctx.beginPath(); ctx.moveTo(-26, 6); ctx.lineTo(-10, -4); ctx.lineTo(8, -4); ctx.lineTo(8, 6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12, 6); ctx.lineTo(12, -4); ctx.lineTo(30, -4); ctx.lineTo(44, 6); ctx.closePath(); ctx.fill();
  // Headlight / taillight.
  ctx.fillStyle = '#fff6c8'; ctx.fillRect(50, 14, 8, 5);
  ctx.fillStyle = '#ff2e3e'; ctx.fillRect(-58, 14, 6, 5);
  // Wheels.
  for (const wx of [-34, 34]) {
    ctx.fillStyle = '#0c0c12'; ctx.beginPath(); ctx.arc(wx, 28, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c8ccd4'; ctx.beginPath(); ctx.arc(wx, 28, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function neonSign(ctx, x, y, w, h, text, color, rng) {
  ctx.save();
  ctx.shadowColor = color; ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  let fs = Math.round(h * 0.62);
  ctx.font = `bold ${fs}px "Arial Black", sans-serif`;
  while (ctx.measureText(text).width > w - 8 && fs > 6) {
    fs -= 1;
    ctx.font = `bold ${fs}px "Arial Black", sans-serif`;
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.shadowBlur = 4;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  ctx.restore();
}

function ferrisWheel(ctx, cx, cy, r, rng, palette) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
    const gx = cx + Math.cos(a) * r, gy = cy + Math.sin(a) * r;
    const c = pick(rng, palette);
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 14);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(cx - r * 0.5, cy + r * 1.5); ctx.lineTo(cx, cy); ctx.lineTo(cx + r * 0.5, cy + r * 1.5); ctx.stroke();
  ctx.restore();
}

function sea(ctx, w, h, y0, rng, sunX, sunColor) {
  const g = ctx.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0, '#2a1a4a'); g.addColorStop(0.4, '#1a2a5e'); g.addColorStop(1, '#0a1030');
  ctx.fillStyle = g; ctx.fillRect(0, y0, w, h - y0);
  // Sun path on water.
  const pg = ctx.createLinearGradient(0, y0, 0, h);
  pg.addColorStop(0, sunColor); pg.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = pg; ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(sunX - 60, y0); ctx.lineTo(sunX + 60, y0); ctx.lineTo(sunX + 140, h); ctx.lineTo(sunX - 140, h); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  // Wave sparkles.
  for (let i = 0; i < 90; i++) {
    const y = y0 + rng() * (h - y0);
    ctx.fillStyle = rng() < 0.5 ? 'rgba(255,200,140,0.5)' : 'rgba(160,200,255,0.4)';
    ctx.globalAlpha = 0.15 + rng() * 0.4;
    ctx.fillRect(rng() * w, y, 8 + rng() * 26, 1.5);
  }
  ctx.globalAlpha = 1;
}

// ---- Individual scenes (each paints a full w x h frame) ----

function drawBoulevard(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#2b1055'], [0.35, '#7b2d8b'], [0.62, '#ff7e5f'], [0.8, '#feb47b'], [1, '#ffcf9e']], 0.72);
  sunGlow(ctx, w * 0.62, h * 0.52, w * 0.42, 'rgba(255,214,130,0.95)', 'rgba(255,140,80,0.55)');
  sunDisc(ctx, w * 0.62, h * 0.52, w * 0.075, '#fff3c4', '#ff9e57');
  clouds(ctx, w, h, rng, 7, '#ff9e7a', h * 0.06, h * 0.4);
  birds(ctx, w, h, rng, 6, h * 0.08, h * 0.3);
  hazeBands(ctx, w, h, 0.72, rng, ['rgba(255,150,110,0.20)', 'rgba(255,120,140,0.16)', 'rgba(255,180,120,0.18)']);
  skyline(ctx, w, h, h * 0.72, rng, { far: '#4a2560', near: '#241031', lit: ['#ffd27a', '#ff9e57', '#7df9ff', '#ff7ad9'] });
  // Palm-lined boulevard.
  wetRoad(ctx, w, h, h * 0.72, '#3a1c44', ['#ff9e57', '#ffd27a', '#ff7ad9', '#7df9ff'], rng);
  for (let i = 0; i < 5; i++) palm(ctx, w * (0.06 + i * 0.22), h * 0.98, h * 0.16, '#12081c', rng);
  car(ctx, w * 0.30, h * 0.86, w / 420, '#ff2e63', rng, true);
  car(ctx, w * 0.68, h * 0.90, w / 520, '#08d9d6', rng, true);
  neonSign(ctx, w * 0.06, h * 0.60, w * 0.20, h * 0.055, 'VICE', '#ff2e9a', rng);
  neonSign(ctx, w * 0.74, h * 0.56, w * 0.20, h * 0.055, 'HOTEL', '#00e5ff', rng);
}

function drawPier(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#12082e'], [0.4, '#5b2a86'], [0.65, '#ff5e8a'], [0.85, '#ffb37a'], [1, '#ffd9a0']], 0.66);
  sunGlow(ctx, w * 0.5, h * 0.6, w * 0.5, 'rgba(255,190,110,0.95)', 'rgba(255,90,140,0.5)');
  sunDisc(ctx, w * 0.5, h * 0.58, w * 0.09, '#fff7d6', '#ff7a9e');
  clouds(ctx, w, h, rng, 6, '#ff8fb0', h * 0.05, h * 0.35);
  birds(ctx, w, h, rng, 5, h * 0.1, h * 0.32);
  ferrisWheel(ctx, w * 0.78, h * 0.42, h * 0.17, rng, ['#ff2e9a', '#00e5ff', '#ffd27a', '#7dff6a', '#ff7a3c']);
  skyline(ctx, w, h, h * 0.66, rng, { far: '#3d1f52', near: '#1c0b2c', lit: ['#ffd27a', '#ff7ad9', '#7df9ff'] });
  sea(ctx, w, h, h * 0.66, rng, w * 0.5, 'rgba(255,150,90,0.55)');
  // Wooden pier deck + posts.
  ctx.fillStyle = '#241226';
  ctx.fillRect(0, h * 0.80, w, h * 0.045);
  for (let x = 10; x < w; x += 46) { ctx.fillStyle = '#1a0c1e'; ctx.fillRect(x, h * 0.845, 10, h * 0.06); }
  ctx.fillStyle = 'rgba(255,210,140,0.5)';
  for (let x = 20; x < w; x += 90) ctx.fillRect(x, h * 0.80, 26, 3);
  neonSign(ctx, w * 0.05, h * 0.70, w * 0.24, h * 0.06, 'PIER 9', '#00e5ff', rng);
  palm(ctx, w * 0.10, h * 0.82, h * 0.13, '#12081c', rng);
  palm(ctx, w * 0.90, h * 0.84, h * 0.11, '#12081c', rng);
}

function drawDowntown(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#05060f'], [0.45, '#141a3a'], [0.7, '#3a2a5e'], [1, '#7a3a6e']], 0.78);
  // Moon + glow.
  sunGlow(ctx, w * 0.82, h * 0.16, w * 0.22, 'rgba(220,230,255,0.7)', 'rgba(140,160,255,0.3)');
  ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.16, w * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,170,200,0.6)';
  ctx.beginPath(); ctx.arc(w * 0.81, h * 0.15, w * 0.008, 0, Math.PI * 2); ctx.arc(w * 0.835, h * 0.175, w * 0.006, 0, Math.PI * 2); ctx.fill();
  // Stars.
  for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(255,255,255,${0.25 + rng() * 0.6})`; ctx.fillRect(rng() * w, rng() * h * 0.4, 1.6, 1.6); }
  skyline(ctx, w, h, h * 0.78, rng, { far: '#1a1440', near: '#0a0618', lit: ['#ffd27a', '#7df9ff', '#ff7ad9', '#fff6c8', '#9dff57'] });
  // Searchlight beams.
  for (const bx of [w * 0.2, w * 0.55]) {
    const g = ctx.createLinearGradient(bx, h * 0.78, bx + w * 0.12, 0);
    g.addColorStop(0, 'rgba(200,230,255,0.35)'); g.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(bx - 8, h * 0.78); ctx.lineTo(bx + 8, h * 0.78); ctx.lineTo(bx + w * 0.16, 0); ctx.lineTo(bx + w * 0.05, 0); ctx.closePath(); ctx.fill();
  }
  wetRoad(ctx, w, h, h * 0.78, '#0d0a1c', ['#7df9ff', '#ff7ad9', '#ffd27a', '#ff5e8a'], rng);
  car(ctx, w * 0.26, h * 0.90, w / 460, '#e8e8f0', rng, true);
  car(ctx, w * 0.62, h * 0.93, w / 560, '#ff2e63', rng, true);
  neonSign(ctx, w * 0.06, h * 0.62, w * 0.26, h * 0.055, 'DOWNTOWN', '#ff2e9a', rng);
  neonSign(ctx, w * 0.68, h * 0.58, w * 0.26, h * 0.055, '24 HR', '#ffd27a', rng);
  palm(ctx, w * 0.94, h * 0.99, h * 0.15, '#05030a', rng);
}

function drawBeach(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#3ec6e0'], [0.35, '#8fe3d8'], [0.6, '#ffd9a0'], [0.8, '#ff9e7a'], [1, '#ff7a9e']], 0.62);
  sunGlow(ctx, w * 0.3, h * 0.5, w * 0.4, 'rgba(255,230,160,0.95)', 'rgba(255,150,100,0.5)');
  sunDisc(ctx, w * 0.3, h * 0.48, w * 0.07, '#fffbe0', '#ffb37a');
  clouds(ctx, w, h, rng, 8, '#ffffff', h * 0.05, h * 0.35);
  birds(ctx, w, h, rng, 7, h * 0.08, h * 0.28);
  // Distant palms + lifeguard tower silhouette.
  sea(ctx, w, h, h * 0.62, rng, w * 0.3, 'rgba(255,200,140,0.5)');
  // Sand.
  const sg = ctx.createLinearGradient(0, h * 0.78, 0, h);
  sg.addColorStop(0, '#f2c98a'); sg.addColorStop(1, '#d99a5b');
  ctx.fillStyle = sg; ctx.fillRect(0, h * 0.78, w, h * 0.22);
  // Sand texture + footprints.
  for (let i = 0; i < 160; i++) { ctx.fillStyle = `rgba(120,70,30,${0.08 + rng() * 0.15})`; ctx.fillRect(rng() * w, h * 0.78 + rng() * h * 0.22, 2, 2); }
  ctx.fillStyle = 'rgba(120,70,30,0.35)';
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(w * 0.4 + i * 16, h * 0.86 + (i % 2) * 8, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); }
  palm(ctx, w * 0.08, h * 0.86, h * 0.22, '#1c2a12', rng);
  palm(ctx, w * 0.22, h * 0.9, h * 0.17, '#243616', rng);
  palm(ctx, w * 0.88, h * 0.88, h * 0.20, '#1c2a12', rng);
  // Beach umbrella + towel.
  ctx.fillStyle = '#ff2e63';
  ctx.beginPath(); ctx.moveTo(w * 0.62, h * 0.82); ctx.lineTo(w * 0.74, h * 0.82); ctx.lineTo(w * 0.68, h * 0.74); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7a3a1a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(w * 0.68, h * 0.82); ctx.lineTo(w * 0.68, h * 0.74); ctx.stroke();
  ctx.fillStyle = '#00e5ff'; ctx.fillRect(w * 0.60, h * 0.88, w * 0.10, h * 0.02);
  ctx.fillStyle = '#ffd27a'; ctx.fillRect(w * 0.60, h * 0.90, w * 0.10, h * 0.015);
  neonSign(ctx, w * 0.68, h * 0.60, w * 0.26, h * 0.055, 'OCEAN DR', '#ff7ad9', rng);
}

function drawCasino(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#1a0533'], [0.4, '#5b1a6e'], [0.65, '#c22a7a'], [0.85, '#ff7a3c'], [1, '#ffb37a']], 0.70);
  sunGlow(ctx, w * 0.5, h * 0.55, w * 0.45, 'rgba(255,180,120,0.9)', 'rgba(255,80,160,0.5)');
  clouds(ctx, w, h, rng, 5, '#ff8fb0', h * 0.06, h * 0.3);
  // Casino towers with vertical neon strips.
  const towers = [
    { x: 0.04, w: 0.20, h: 0.52, c: '#2a0f4a', neon: '#ff2e9a', sign: 'VICE' },
    { x: 0.28, w: 0.16, h: 0.62, c: '#1c0b38', neon: '#00e5ff', sign: 'ROYAL' },
    { x: 0.48, w: 0.22, h: 0.46, c: '#33124f', neon: '#ffd27a', sign: 'PALMS' },
    { x: 0.74, w: 0.22, h: 0.58, c: '#20093a', neon: '#7dff6a', sign: 'JACKPOT' },
  ];
  for (const t of towers) {
    const tx = t.x * w, tw = t.w * w, th = t.h * h, top = h * 0.70 - th;
    ctx.fillStyle = t.c; ctx.fillRect(tx, top, tw, th + 2);
    // Window grid, mostly lit.
    for (let r = 0; r < Math.floor(th / 20); r++) for (let c = 0; c < Math.floor(tw / 16); c++) {
      if (rng() < 0.55) { ctx.fillStyle = pick(rng, ['#ffd27a', '#7df9ff', '#ff7ad9', '#fff6c8']); ctx.globalAlpha = 0.5 + rng() * 0.5; ctx.fillRect(tx + 5 + c * 16, top + 8 + r * 20, 7, 9); }
    }
    ctx.globalAlpha = 1;
    // Neon edge strips.
    ctx.save(); ctx.shadowColor = t.neon; ctx.shadowBlur = 14; ctx.fillStyle = t.neon;
    ctx.fillRect(tx - 2, top, 4, th); ctx.fillRect(tx + tw - 2, top, 4, th);
    let nfs = Math.round(tw * 0.16);
    ctx.font = `bold ${nfs}px "Arial Black", sans-serif`;
    while (ctx.measureText(t.sign).width > tw - 6 && nfs > 6) { nfs -= 1; ctx.font = `bold ${nfs}px "Arial Black", sans-serif`; }
    ctx.textAlign = 'center';
    ctx.fillText(t.sign, tx + tw / 2, top + th * 0.22);
    ctx.restore();
  }
  // Marquee dots row.
  for (let x = 0; x < w; x += 18) {
    ctx.fillStyle = pick(rng, ['#ff2e9a', '#ffd27a', '#00e5ff']);
    ctx.globalAlpha = 0.6 + rng() * 0.4;
    ctx.beginPath(); ctx.arc(x, h * 0.70, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  wetRoad(ctx, w, h, h * 0.70, '#241031', ['#ff2e9a', '#ffd27a', '#00e5ff', '#7dff6a'], rng);
  car(ctx, w * 0.35, h * 0.86, w / 430, '#ffd27a', rng, true);
  car(ctx, w * 0.72, h * 0.90, w / 540, '#7df9ff', rng, true);
  palm(ctx, w * 0.05, h * 0.98, h * 0.14, '#12081c', rng);
}

function drawSwamp(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#3a2a1a'], [0.35, '#8a5a2a'], [0.6, '#e08a4a'], [0.8, '#ffb37a'], [1, '#ffd9a0']], 0.68);
  sunGlow(ctx, w * 0.68, h * 0.5, w * 0.4, 'rgba(255,200,120,0.95)', 'rgba(255,130,60,0.5)');
  sunDisc(ctx, w * 0.68, h * 0.48, w * 0.065, '#fff3c4', '#ff9e57');
  clouds(ctx, w, h, rng, 6, '#ffab7a', h * 0.05, h * 0.35);
  birds(ctx, w, h, rng, 5, h * 0.1, h * 0.3);
  // Cypress tree line: narrow trunks with ragged crowns, not pills.
  for (let i = 0; i < 9; i++) {
    const tx = (i / 8) * w + (rng() - 0.5) * 30, th = h * (0.16 + rng() * 0.14);
    const tw = 14 + rng() * 12;
    ctx.fillStyle = '#1e2a12';
    ctx.fillRect(tx - 3, h * 0.68 - th * 0.45, 6, th * 0.45);
    // Ragged crown: two overlapping ellipses + lighter top, never a smooth pill.
    ctx.beginPath(); ctx.ellipse(tx, h * 0.68 - th * 0.5, tw, th * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(tx - tw * 0.45, h * 0.68 - th * 0.38, tw * 0.6, th * 0.22, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(90,120,60,0.55)';
    ctx.beginPath(); ctx.ellipse(tx - tw * 0.3, h * 0.68 - th * 0.58, tw * 0.55, th * 0.18, -0.3, 0, Math.PI * 2); ctx.fill();
    // Spanish moss drips.
    ctx.strokeStyle = 'rgba(120,140,80,0.8)'; ctx.lineWidth = 2;
    for (let m = 0; m < 4; m++) { const mx = tx - 18 + rng() * 36; ctx.beginPath(); ctx.moveTo(mx, h * 0.68 - th * 0.55); ctx.lineTo(mx, h * 0.68 - th * 0.55 + 12 + rng() * 14); ctx.stroke(); }
  }
  // Swamp water with sun path + reeds.
  const wg = ctx.createLinearGradient(0, h * 0.68, 0, h);
  wg.addColorStop(0, '#4a3a1a'); wg.addColorStop(0.5, '#2a2410'); wg.addColorStop(1, '#141008');
  ctx.fillStyle = wg; ctx.fillRect(0, h * 0.68, w, h * 0.32);
  ctx.fillStyle = 'rgba(255,170,90,0.45)';
  ctx.beginPath(); ctx.moveTo(w * 0.68 - 40, h * 0.68); ctx.lineTo(w * 0.68 + 40, h * 0.68); ctx.lineTo(w * 0.68 + 120, h); ctx.lineTo(w * 0.68 - 120, h); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = rng() < 0.5 ? 'rgba(255,190,120,0.4)' : 'rgba(180,220,160,0.35)';
    ctx.globalAlpha = 0.15 + rng() * 0.35;
    ctx.fillRect(rng() * w, h * 0.68 + rng() * h * 0.3, 10 + rng() * 30, 1.5);
  }
  ctx.globalAlpha = 1;
  // Reeds in foreground.
  ctx.strokeStyle = '#2a3a12'; ctx.lineWidth = 3;
  for (let i = 0; i < 40; i++) {
    const rx = rng() * w, ry = h * 0.86 + rng() * h * 0.13;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + (rng() - 0.5) * 10, ry - 30, rx + (rng() - 0.5) * 16, ry - 44 - rng() * 20); ctx.stroke();
  }
  // Airboat: hull + fan cage + driver silhouette.
  const bx = w * 0.42, by = h * 0.82, s = w / 420;
  ctx.save(); ctx.translate(bx, by); ctx.scale(s, s);
  ctx.fillStyle = '#c22a2a';
  ctx.beginPath(); ctx.moveTo(-70, 10); ctx.lineTo(70, 10); ctx.lineTo(60, 26); ctx.lineTo(-60, 26); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#e8e8f0'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-40, -16, 26, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, -42); ctx.lineTo(-40, 10); ctx.moveTo(-66, -16); ctx.lineTo(-14, -16); ctx.stroke();
  ctx.fillStyle = '#12081c';
  ctx.beginPath(); ctx.arc(18, -6, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(10, 2, 16, 10);
  ctx.restore();
  // Wake.
  ctx.strokeStyle = 'rgba(255,240,200,0.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(bx - 90 - i * 18, by + 18 + i * 6); ctx.quadraticCurveTo(bx - 40, by + 30 + i * 6, bx + 20, by + 22 + i * 6); ctx.stroke(); }
}

// Comic hero sample: duo silhouette (driver + partner) against a sunset, poster-ink style.
export function drawHeroDuo(ctx, w, h, rng) {
  skyGradient(ctx, w, h, [[0, '#2b1055'], [0.4, '#8b2d8b'], [0.65, '#ff5e8a'], [0.85, '#ffb37a'], [1, '#ffcf9e']], 0.75);
  sunGlow(ctx, w * 0.5, h * 0.55, w * 0.5, 'rgba(255,210,130,0.95)', 'rgba(255,120,80,0.55)');
  sunDisc(ctx, w * 0.5, h * 0.52, w * 0.11, '#fff3c4', '#ff9e57');
  clouds(ctx, w, h, rng, 5, '#ff9e7a', h * 0.06, h * 0.3);
  skyline(ctx, w, h, h * 0.75, rng, { far: '#4a2560', near: '#241031', lit: ['#ffd27a', '#ff7ad9', '#7df9ff'] });
  wetRoad(ctx, w, h, h * 0.75, '#33183e', ['#ff9e57', '#ffd27a', '#ff7ad9'], rng);
  // Low sports car behind them.
  car(ctx, w * 0.5, h * 0.96, w / 300, '#5a2a4a', rng, true);
  // Rim-lit duo silhouettes.
  const s = h / 300;
  function figure(cx, baseY, flip, jacket) {
    ctx.save(); ctx.translate(cx, baseY); ctx.scale(flip ? -s : s, s);
    ctx.fillStyle = '#12081c';
    // Legs.
    ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-10, -78); ctx.lineTo(-2, -78); ctx.lineTo(2, -40); ctx.lineTo(8, -78); ctx.lineTo(16, -78); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill();
    // Torso + jacket.
    ctx.fillStyle = jacket;
    ctx.beginPath(); ctx.moveTo(-20, -78); ctx.quadraticCurveTo(-24, -130, -12, -138); ctx.lineTo(12, -138); ctx.quadraticCurveTo(24, -130, 20, -78); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#12081c';
    ctx.beginPath(); ctx.moveTo(-20, -78); ctx.lineTo(-12, -138); ctx.lineTo(-4, -138); ctx.lineTo(-8, -78); ctx.closePath(); ctx.fill();
    // Arm resting on car / hand on hip.
    ctx.strokeStyle = '#12081c'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(14, -128); ctx.quadraticCurveTo(34, -108, 30, -84); ctx.stroke();
    // Head + hair.
    ctx.fillStyle = '#12081c';
    ctx.beginPath(); ctx.arc(0, -152, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-15, -156); ctx.quadraticCurveTo(0, -172, 15, -156); ctx.lineTo(12, -146); ctx.lineTo(-12, -146); ctx.closePath(); ctx.fill();
    // Sunset rim light on the right edge.
    ctx.strokeStyle = 'rgba(255,190,110,0.95)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(20, -78); ctx.quadraticCurveTo(24, -130, 12, -138); ctx.stroke();
    ctx.beginPath(); ctx.arc(8, -152, 14, -Math.PI * 0.4, Math.PI * 0.35); ctx.stroke();
    ctx.restore();
  }
  figure(w * 0.40, h * 0.97, false, '#ff2e63');
  figure(w * 0.58, h * 0.97, true, '#08d9d6');
  // Palm silhouettes framing.
  palm(ctx, w * 0.06, h * 0.99, h * 0.24, '#0d0514', rng);
  palm(ctx, w * 0.94, h * 0.99, h * 0.22, '#0d0514', rng);
}

export const SCENES = [
  { id: 'boulevard', name: 'Vice Boulevard', label: 'OCEAN DR · SUNSET', draw: drawBoulevard, seed: 11 },
  { id: 'pier', name: 'Neon Pier', label: 'PIER 9 · NIGHT', draw: drawPier, seed: 23 },
  { id: 'downtown', name: 'Downtown Night', label: 'DOWNTOWN · 2 AM', draw: drawDowntown, seed: 37 },
  { id: 'beach', name: 'Beach Palms', label: 'VICE BEACH · NOON', draw: drawBeach, seed: 41 },
  { id: 'casino', name: 'Casino Strip', label: 'THE STRIP · NEON', draw: drawCasino, seed: 53 },
  { id: 'swamp', name: 'Swamp Airboat', label: 'LEONIDA BAYOU', draw: drawSwamp, seed: 67 },
];

// Paints a scene by id into a fresh offscreen canvas of the given size.
export function renderSceneCanvas(id, w, h) {
  const scene = SCENES.find((s) => s.id === id) ?? SCENES[0];
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w)); c.height = Math.max(2, Math.round(h));
  const ctx = c.getContext('2d');
  scene.draw(ctx, c.width, c.height, mulberry32(scene.seed));
  return c;
}
