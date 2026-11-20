// Procedural Vice City scenes for Leonida Press r5.
// Every scene is drawn from scratch with the canvas 2D API: no images, no
// external references, no Rockstar artwork. All drawing happens in a local
// 100 x 100 space (scaled to the panel), and every sign / label is kept
// inside a 6-unit safe margin so nothing is ever clipped by a panel edge.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// --- shared paint helpers (local 100x100 space) ---------------------------

export function paintSky(ctx, stops, sun) {
  const g = ctx.createLinearGradient(0, 0, 0, 100);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 100);
  if (sun) {
    const glow = ctx.createRadialGradient(sun.x, sun.y, 2, sun.x, sun.y, sun.r);
    glow.addColorStop(0, sun.glow); glow.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = sun.color;
    ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r * 0.55, 0, Math.PI * 2); ctx.fill();
  }
}

export function paintHaze(ctx, y, h, color) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.5, color);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y, 100, h);
}

export function paintClouds(ctx, rand, count, y0, y1, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rand() * 100, y = y0 + rand() * (y1 - y0), w = 8 + rand() * 16;
    ctx.beginPath();
    ctx.ellipse(x, y, w, w * 0.22, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.5, y + 1, w * 0.6, w * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintBirds(ctx, rand, count, y0, y1) {
  ctx.strokeStyle = 'rgba(20,8,20,0.75)'; ctx.lineWidth = 0.7; ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = 6 + rand() * 88, y = y0 + rand() * (y1 - y0), s = 1.2 + rand() * 1.6;
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.8, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.8, x + s, y);
    ctx.stroke();
  }
}

// Two-layer skyline: far silhouettes, then near towers with lit windows.
export function paintSkyline(ctx, rand, baseY, farColor, nearColor, lit, winColors) {
  ctx.fillStyle = farColor;
  let x = -2;
  while (x < 102) {
    const bw = 6 + rand() * 9, bh = 10 + rand() * 16;
    ctx.fillRect(x, baseY - bh, bw, bh + 2);
    if (rand() < 0.4) ctx.fillRect(x + bw * 0.3, baseY - bh - 3, bw * 0.25, 3);
    x += bw + rand() * 2;
  }
  ctx.fillStyle = nearColor;
  x = -2;
  while (x < 102) {
    const bw = 5 + rand() * 8, bh = 14 + rand() * 22;
    ctx.fillRect(x, baseY - bh, bw, bh + 2);
    if (rand() < 0.5) { ctx.fillRect(x + bw * 0.35, baseY - bh - 4, bw * 0.3, 4); }
    if (lit) {
      for (let wy = baseY - bh + 3; wy < baseY - 3; wy += 4) {
        for (let wx = x + 1.5; wx < x + bw - 1.5; wx += 3) {
          if (rand() < 0.34) {
            ctx.fillStyle = winColors[Math.floor(rand() * winColors.length)];
            ctx.fillRect(wx, wy, 1.4, 1.8);
            ctx.fillStyle = nearColor;
          }
        }
      }
    }
    x += bw + 1 + rand() * 3;
  }
}

export function paintPalm(ctx, x, y, s, lean, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s, s);
  ctx.strokeStyle = dark; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(1.5, -12, 0.5, -22); ctx.stroke();
  ctx.fillStyle = dark;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.08 - (i / 6) * Math.PI * 0.85;
    ctx.beginPath();
    ctx.moveTo(0.5, -22);
    ctx.quadraticCurveTo(Math.cos(a) * 7, -22 + Math.sin(a) * 7 - 2, Math.cos(a) * 11, -22 + Math.sin(a) * 11 + 4);
    ctx.quadraticCurveTo(Math.cos(a) * 6, -22 + Math.sin(a) * 6 + 1, 0.5, -22);
    ctx.fill();
  }
  ctx.restore();
}

// Wet road with a sun streak and lane dashes.
export function paintRoad(ctx, y, color, streak) {
  ctx.fillStyle = color; ctx.fillRect(0, y, 100, 100 - y);
  if (streak) {
    const g = ctx.createLinearGradient(0, y, 0, 100);
    g.addColorStop(0, streak); g.addColorStop(1, 'rgba(255,140,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(38, y); ctx.lineTo(62, y); ctx.lineTo(78, 100); ctx.lineTo(22, 100); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,220,120,0.85)';
  for (let x = 6; x < 100; x += 14) ctx.fillRect(x, y + (100 - y) * 0.45, 5, 1.1);
}

// Side-view car with headlight / taillight glow.
export function paintCarSide(ctx, x, y, s, body, flip) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  const g = ctx.createLinearGradient(0, -9, 0, 2);
  g.addColorStop(0, body); g.addColorStop(1, '#1a0f24');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-16, 0); ctx.lineTo(-15, -4); ctx.lineTo(-9, -5.5); ctx.lineTo(-5, -9);
  ctx.lineTo(6, -9); ctx.lineTo(11, -5.5); ctx.lineTo(16, -4); ctx.lineTo(16, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(10,16,32,0.9)';
  ctx.beginPath(); ctx.moveTo(-4, -8.2); ctx.lineTo(5, -8.2); ctx.lineTo(8.5, -5.6); ctx.lineTo(-7.5, -5.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(160,220,255,0.5)';
  ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(1, -8); ctx.lineTo(2, -6); ctx.lineTo(-2.5, -6); ctx.closePath(); ctx.fill();
  for (const wx of [-10, 10]) {
    ctx.fillStyle = '#0c0a12'; ctx.beginPath(); ctx.arc(wx, 0, 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cfd6e4'; ctx.beginPath(); ctx.arc(wx, 0, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2438'; ctx.beginPath(); ctx.arc(wx, 0, 0.6, 0, Math.PI * 2); ctx.fill();
  }
  const beam = ctx.createRadialGradient(16.5, -3, 0.5, 16.5, -3, 7);
  beam.addColorStop(0, 'rgba(255,250,200,0.95)'); beam.addColorStop(1, 'rgba(255,250,200,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.arc(16.5, -3, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff6c8'; ctx.fillRect(15.6, -3.8, 1.2, 1.4);
  ctx.fillStyle = '#ff2e4d'; ctx.fillRect(-16.4, -3.8, 1.1, 1.4);
  ctx.restore();
}

// Neon sign, always drawn inside the safe rect: text is measured and shrunk
// to fit, so it can never be clipped by a panel edge.
export function paintNeonSign(ctx, text, cx, y, maxW, color, glowColor) {
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let size = 7;
  ctx.font = `bold ${size}px Arial, sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 2.5) {
    size -= 0.5; ctx.font = `bold ${size}px Arial, sans-serif`;
  }
  const w = ctx.measureText(text).width + 6;
  // dark backing so the sign stays readable over clouds, sun or windows
  ctx.fillStyle = 'rgba(10,5,20,0.45)';
  ctx.fillRect(cx - w / 2 - 1, y - size * 0.85, w + 2, size * 1.7);
  ctx.strokeStyle = color; ctx.lineWidth = 0.7;
  ctx.shadowColor = glowColor; ctx.shadowBlur = 4;
  ctx.strokeRect(cx - w / 2, y - size * 0.75, w, size * 1.5);
  ctx.fillStyle = color;
  ctx.fillText(text, cx, y + 0.4);
  ctx.restore();
}

export function paintHalftone(ctx, x, y, w, h, color, gap, maxR) {
  ctx.fillStyle = color;
  for (let yy = y; yy < y + h; yy += gap) {
    for (let xx = x; xx < x + w; xx += gap) {
      const t = 1 - (yy - y) / h;
      const r = 0.3 + t * maxR;
      ctx.beginPath(); ctx.arc(xx, yy, r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

// Helicopter with rotor, tail boom and a searchlight cone.
export function paintHelicopter(ctx, x, y, s, body, flip) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-14, -7); ctx.lineTo(14, -7); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.ellipse(0, -7, 15, 1.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(7, -1); ctx.lineTo(20, -3.5); ctx.lineTo(20, -0.5); ctx.lineTo(7, 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(20, -3.5); ctx.lineTo(22.5, -8); ctx.lineTo(23.5, -8); ctx.lineTo(21.5, -2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(150,220,255,0.85)';
  ctx.beginPath(); ctx.ellipse(5.5, -1, 3.4, 2.4, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1a1024'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-6, 4.5); ctx.lineTo(-8, 8); ctx.moveTo(6, 4.5); ctx.lineTo(8, 8); ctx.stroke();
  ctx.strokeStyle = '#1a1024'; ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(8, 8); ctx.stroke();
  const beam = ctx.createLinearGradient(0, 4, 0, 26);
  beam.addColorStop(0, 'rgba(255,246,190,0.5)'); beam.addColorStop(1, 'rgba(255,246,190,0)');
  ctx.fillStyle = beam;
  ctx.beginPath(); ctx.moveTo(-2, 4); ctx.lineTo(2, 4); ctx.lineTo(9, 26); ctx.lineTo(-9, 26); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// --- people: comic 3/4-view figures with faces ---------------------------
// A stylised GTA-poster figure: skin face with jaw shading, hair, dark
// glasses, nose + mouth, jacket with collar and rim light on the sun side.

export function paintMan(ctx, x, y, s, opt = {}) {
  const skin = opt.skin || '#e8b48c', hair = opt.hair || '#241a12';
  const jacket = opt.jacket || '#7a1f3d', shirt = opt.shirt || '#f2e8d5';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // legs
  ctx.fillStyle = '#221a2e';
  ctx.beginPath(); ctx.moveTo(-4.5, -26); ctx.lineTo(-1, -26); ctx.lineTo(-2.5, 0); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1, -26); ctx.lineTo(4.5, -26); ctx.lineTo(7, 0); ctx.lineTo(2.5, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0e0a14';
  ctx.fillRect(-7.6, -1.5, 5.6, 2.4); ctx.fillRect(2, -1.5, 5.6, 2.4);
  // torso: open jacket over shirt
  const jg = ctx.createLinearGradient(-9, 0, 9, 0);
  jg.addColorStop(0, '#3d1220'); jg.addColorStop(0.55, jacket); jg.addColorStop(1, '#ff8a5c');
  ctx.fillStyle = jg;
  ctx.beginPath();
  ctx.moveTo(-9, -52); ctx.quadraticCurveTo(-11, -40, -8.5, -26);
  ctx.lineTo(8.5, -26); ctx.quadraticCurveTo(11, -40, 9, -52);
  ctx.quadraticCurveTo(0, -56, -9, -52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shirt;
  ctx.beginPath(); ctx.moveTo(-3.4, -52); ctx.lineTo(3.4, -52); ctx.lineTo(2.2, -27); ctx.lineTo(-2.2, -27); ctx.closePath(); ctx.fill();
  // jacket lapels + collar
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.moveTo(-3.4, -52); ctx.lineTo(-7, -47); ctx.lineTo(-4.4, -40); ctx.lineTo(-2, -48); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(3.4, -52); ctx.lineTo(7, -47); ctx.lineTo(4.4, -40); ctx.lineTo(2, -48); ctx.closePath(); ctx.fill();
  // arms
  ctx.strokeStyle = jacket; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -50); ctx.quadraticCurveTo(-12, -38, -10, -28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9, -50); ctx.quadraticCurveTo(12.5, -40, 10.5, -30); ctx.stroke();
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(-10, -27, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10.5, -29, 2.2, 0, Math.PI * 2); ctx.fill();
  // neck + head (3/4 view, face turned slightly right)
  ctx.fillStyle = '#c98f66'; ctx.fillRect(-2.6, -58, 5.2, 6);
  const hg = ctx.createLinearGradient(-7, -78, 7, -78);
  hg.addColorStop(0, '#c98f66'); hg.addColorStop(0.6, skin); hg.addColorStop(1, '#ffcf9e');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(-6.5, -72); ctx.quadraticCurveTo(-7.5, -60, -3.5, -56.5);
  ctx.quadraticCurveTo(0, -54.5, 3.5, -56.5);
  ctx.quadraticCurveTo(7.5, -60, 6.5, -72);
  ctx.quadraticCurveTo(6, -79, 0, -79);
  ctx.quadraticCurveTo(-6, -79, -6.5, -72); ctx.closePath(); ctx.fill();
  // hair: swept back, side part
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-7.2, -70); ctx.quadraticCurveTo(-8, -82, 0, -82.5);
  ctx.quadraticCurveTo(8, -82, 7.2, -70);
  ctx.quadraticCurveTo(6.5, -76, 4, -76.5); ctx.quadraticCurveTo(2, -79, -1, -77);
  ctx.quadraticCurveTo(-4.5, -75.5, -7.2, -70); ctx.closePath(); ctx.fill();
  // jaw shade + stubble
  ctx.fillStyle = 'rgba(90,50,30,0.28)';
  ctx.beginPath(); ctx.ellipse(0, -58.5, 4.6, 2.6, 0, 0, Math.PI); ctx.fill();
  // sunglasses (dark lenses + bridge, sun glint)
  ctx.fillStyle = '#120a18';
  ctx.beginPath(); ctx.ellipse(-3.4, -68.5, 2.9, 2.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.4, -68.5, 2.9, 2.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-0.8, -68.9, 1.6, 0.8);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-5.2, -69.8, 1.6, 0.9); ctx.fillRect(1.6, -69.8, 1.6, 0.9);
  // nose + mouth
  ctx.strokeStyle = 'rgba(120,60,30,0.7)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(0.6, -67); ctx.lineTo(0.2, -63.5); ctx.quadraticCurveTo(1.4, -62.6, 2, -63.4); ctx.stroke();
  ctx.strokeStyle = '#7a2e22'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-2, -60.4); ctx.quadraticCurveTo(0, -59.4, 2.2, -60.4); ctx.stroke();
  // rim light on the sun (right) side
  ctx.strokeStyle = 'rgba(255,170,90,0.9)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(6.6, -74); ctx.quadraticCurveTo(7.6, -64, 4, -57); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(9.4, -52); ctx.quadraticCurveTo(11, -40, 8.8, -27); ctx.stroke();
  ctx.restore();
}

export function paintWoman(ctx, x, y, s, opt = {}) {
  const skin = opt.skin || '#f0c49a', hair = opt.hair || '#3a1c10';
  const top = opt.top || '#ff5c8a', skirt = opt.skirt || '#1d2f5e';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // legs
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.moveTo(-3.5, -24); ctx.lineTo(-0.8, -24); ctx.lineTo(-2, 0); ctx.lineTo(-5.4, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0.8, -24); ctx.lineTo(3.5, -24); ctx.lineTo(5.4, 0); ctx.lineTo(2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a0f2e';
  ctx.beginPath(); ctx.moveTo(-5.6, -1.5); ctx.lineTo(-1.6, -1.5); ctx.lineTo(-1.8, 1.6); ctx.lineTo(-5.8, 1.6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(1.6, -1.5); ctx.lineTo(5.6, -1.5); ctx.lineTo(5.8, 1.6); ctx.lineTo(1.8, 1.6); ctx.closePath(); ctx.fill();
  // skirt
  ctx.fillStyle = skirt;
  ctx.beginPath(); ctx.moveTo(-6, -34); ctx.lineTo(6, -34); ctx.lineTo(8, -23); ctx.lineTo(-8, -23); ctx.closePath(); ctx.fill();
  // torso top
  const tg = ctx.createLinearGradient(-8, 0, 8, 0);
  tg.addColorStop(0, '#a11e4e'); tg.addColorStop(0.55, top); tg.addColorStop(1, '#ffb08a');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-7.5, -50); ctx.quadraticCurveTo(-8.5, -40, -6.5, -33);
  ctx.lineTo(6.5, -33); ctx.quadraticCurveTo(8.5, -40, 7.5, -50);
  ctx.quadraticCurveTo(0, -53, -7.5, -50); ctx.closePath(); ctx.fill();
  // arms: one down, one hand on hip
  ctx.strokeStyle = skin; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-7.5, -49); ctx.quadraticCurveTo(-10.5, -38, -8.5, -27); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(7.5, -49); ctx.quadraticCurveTo(11, -42, 9, -36); ctx.quadraticCurveTo(7, -34, 5.5, -35); ctx.stroke();
  // long wavy hair behind shoulders
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-8.5, -74); ctx.quadraticCurveTo(-11, -58, -9, -44);
  ctx.quadraticCurveTo(-7, -52, -6.5, -60); ctx.lineTo(-6.5, -74); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8.5, -74); ctx.quadraticCurveTo(11.5, -56, 9.5, -40);
  ctx.quadraticCurveTo(7.5, -48, 6.8, -58); ctx.lineTo(6.8, -74); ctx.closePath(); ctx.fill();
  // neck + face (3/4, turned slightly left)
  ctx.fillStyle = '#d69c72'; ctx.fillRect(-2.4, -57, 4.8, 5.5);
  const hg = ctx.createLinearGradient(-6, -76, 6, -76);
  hg.addColorStop(0, '#e0a878'); hg.addColorStop(0.55, skin); hg.addColorStop(1, '#ffe0b8');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(-6, -71); ctx.quadraticCurveTo(-6.8, -60, -3, -56.8);
  ctx.quadraticCurveTo(0, -55.2, 3, -56.8);
  ctx.quadraticCurveTo(6.8, -60, 6, -71);
  ctx.quadraticCurveTo(5.5, -78, 0, -78);
  ctx.quadraticCurveTo(-5.5, -78, -6, -71); ctx.closePath(); ctx.fill();
  // hair cap + fringe
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-6.8, -70); ctx.quadraticCurveTo(-7.5, -81, 0, -81.5);
  ctx.quadraticCurveTo(7.5, -81, 6.8, -70);
  ctx.quadraticCurveTo(6, -75.5, 3.5, -76); ctx.quadraticCurveTo(1, -78.5, -1.5, -76.5);
  ctx.quadraticCurveTo(-4, -74.5, -6.8, -70); ctx.closePath(); ctx.fill();
  // eyes, brows, lips, blush
  ctx.fillStyle = '#241018';
  ctx.beginPath(); ctx.ellipse(-2.8, -67.5, 1.1, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(2.8, -67.5, 1.1, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-2.5, -68, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3.1, -68, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = hair; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-4.2, -70); ctx.quadraticCurveTo(-2.8, -70.8, -1.4, -70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1.4, -70); ctx.quadraticCurveTo(2.8, -70.8, 4.2, -70); ctx.stroke();
  ctx.strokeStyle = 'rgba(140,70,40,0.7)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(0.4, -66.5); ctx.lineTo(0.1, -63.8); ctx.quadraticCurveTo(1, -63, 1.6, -63.6); ctx.stroke();
  ctx.fillStyle = '#c22e4e';
  ctx.beginPath(); ctx.ellipse(0, -60.6, 2.1, 1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,120,140,0.35)';
  ctx.beginPath(); ctx.ellipse(-4.6, -63.5, 1.4, 0.9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4.6, -63.5, 1.4, 0.9, 0, 0, Math.PI * 2); ctx.fill();
  // gold earring + necklace
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath(); ctx.arc(-6.4, -62, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6.4, -62, 0.7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd76a'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(-3, -53); ctx.quadraticCurveTo(0, -50.5, 3, -53); ctx.stroke();
  // rim light
  ctx.strokeStyle = 'rgba(255,170,90,0.9)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(6.2, -72); ctx.quadraticCurveTo(7, -63, 3.4, -57.5); ctx.stroke();
  ctx.restore();
}

// Front 3/4 sports car: hood, windshield, glowing headlights, wheel, shadow.
export function paintHeroCar(ctx, x, y, s, body) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // ground shadow + wet reflection
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(0, 2, 34, 4.5, 0, 0, Math.PI * 2); ctx.fill();
  const rg = ctx.createLinearGradient(0, 2, 0, 16);
  rg.addColorStop(0, 'rgba(255,120,90,0.35)'); rg.addColorStop(1, 'rgba(255,120,90,0)');
  ctx.fillStyle = rg; ctx.fillRect(-30, 2, 60, 14);
  // body
  const g = ctx.createLinearGradient(-32, -22, 32, 0);
  g.addColorStop(0, '#2a0a1e'); g.addColorStop(0.45, body); g.addColorStop(1, '#ff9a5c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-32, -2); ctx.quadraticCurveTo(-33, -8, -26, -10);
  ctx.lineTo(-14, -13); ctx.lineTo(-6, -20); ctx.lineTo(14, -20);
  ctx.lineTo(24, -13); ctx.lineTo(32, -9); ctx.lineTo(33, -2);
  ctx.quadraticCurveTo(33, 1, 28, 1); ctx.lineTo(-28, 1); ctx.quadraticCurveTo(-32, 1, -32, -2);
  ctx.closePath(); ctx.fill();
  // windshield + side glass with sky reflection
  ctx.fillStyle = 'rgba(12,20,40,0.92)';
  ctx.beginPath(); ctx.moveTo(-5, -18.6); ctx.lineTo(13, -18.6); ctx.lineTo(20, -13); ctx.lineTo(-11, -13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,180,120,0.45)';
  ctx.beginPath(); ctx.moveTo(2, -18.4); ctx.lineTo(9, -18.4); ctx.lineTo(12, -13.4); ctx.lineTo(5, -13.4); ctx.closePath(); ctx.fill();
  // hood lines + grille
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-24, -9.5); ctx.quadraticCurveTo(0, -12, 26, -9); ctx.stroke();
  ctx.fillStyle = '#140a1c'; ctx.fillRect(-8, -4.5, 16, 2.6);
  ctx.fillStyle = '#ffd76a'; ctx.fillRect(-8, -4.5, 16, 0.7);
  // headlights with glow
  for (const hx of [-24, 24]) {
    const glow = ctx.createRadialGradient(hx, -6, 0.5, hx, -6, 9);
    glow.addColorStop(0, 'rgba(255,246,190,0.95)'); glow.addColorStop(1, 'rgba(255,246,190,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(hx, -6, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8d0';
    ctx.beginPath(); ctx.ellipse(hx, -6, 4.6, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(hx, -6, 2.2, 1, 0, 0, Math.PI * 2); ctx.fill();
  }
  // light beams on the road
  const beam = ctx.createLinearGradient(0, -4, 0, 18);
  beam.addColorStop(0, 'rgba(255,246,190,0.4)'); beam.addColorStop(1, 'rgba(255,246,190,0)');
  ctx.fillStyle = beam;
  ctx.beginPath(); ctx.moveTo(-27, -4); ctx.lineTo(-21, -4); ctx.lineTo(-12, 18); ctx.lineTo(-34, 18); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(21, -4); ctx.lineTo(27, -4); ctx.lineTo(34, 18); ctx.lineTo(12, 18); ctx.closePath(); ctx.fill();
  // wheels
  for (const wx of [-22, 22]) {
    ctx.fillStyle = '#0b0810'; ctx.beginPath(); ctx.arc(wx, 0, 5.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d7dce8'; ctx.beginPath(); ctx.arc(wx, 0, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2a2438'; ctx.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(wx, 0); ctx.lineTo(wx + Math.cos(a) * 2.6, Math.sin(a) * 2.6); ctx.stroke();
    }
  }
  // side mirror + rim light
  ctx.fillStyle = body; ctx.fillRect(30, -14, 3.4, 2.2);
  ctx.strokeStyle = 'rgba(255,180,100,0.95)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(32, -9); ctx.quadraticCurveTo(33, -2, 28, 1); ctx.stroke();
  ctx.restore();
}

// --- the hero scene: faces, hero car, helicopter, skyline, palms --------
export function paintHeroScene(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('hero' + seed));
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#3a1150'); sky.addColorStop(0.35, '#c23a6e');
  sky.addColorStop(0.62, '#ff7a4d'); sky.addColorStop(0.8, '#ffb35c'); sky.addColorStop(1, '#ffd98a');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // sun + glow
  const sx = w * 0.68, sy = h * 0.52, sr = h * 0.26;
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.2, sx, sy, sr * 2.4);
  glow.addColorStop(0, 'rgba(255,220,140,0.85)'); glow.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffe9b0';
  ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,150,90,0.35)';
  ctx.beginPath(); ctx.arc(sx, sy, sr * 1.25, 0, Math.PI * 2); ctx.fill();
  // clouds + birds
  ctx.save(); ctx.scale(w / 100, h / 100); paintClouds(ctx, rand, 7, 6, 26, 'rgba(255,190,160,0.5)'); ctx.restore();
  ctx.save(); ctx.scale(w / 100, h / 100); paintBirds(ctx, rand, 6, 8, 22); ctx.restore();
  // helicopter top-left
  paintHelicopter(ctx, w * 0.16, h * 0.16, Math.min(w, h) * 0.006, '#2b1b3a', false);
  // skyline
  ctx.save(); ctx.translate(0, h * 0.62); ctx.scale(w / 100, h / 100);
  paintSkyline(ctx, rand, 0, 'rgba(70,20,70,0.85)', '#2a0f2e', true, ['#ffd76a', '#ff9a5c', '#9be8ff', '#ff7ad9']);
  ctx.restore();
  // road
  const roadY = h * 0.62;
  const rg = ctx.createLinearGradient(0, roadY, 0, h);
  rg.addColorStop(0, '#4a2340'); rg.addColorStop(1, '#160a20');
  ctx.fillStyle = rg; ctx.fillRect(0, roadY, w, h - roadY);
  const streak = ctx.createLinearGradient(0, roadY, 0, h);
  streak.addColorStop(0, 'rgba(255,170,90,0.55)'); streak.addColorStop(1, 'rgba(255,170,90,0)');
  ctx.fillStyle = streak;
  ctx.beginPath(); ctx.moveTo(w * 0.42, roadY); ctx.lineTo(w * 0.62, roadY); ctx.lineTo(w * 0.78, h); ctx.lineTo(w * 0.3, h); ctx.closePath(); ctx.fill();
  // palms framing the edges
  ctx.save(); ctx.scale(w / 100, h / 100); paintPalm(ctx, 4, 96, 1.15, 0.12, '#1c0a24'); ctx.restore();
  ctx.save(); ctx.scale(w / 100, h / 100); paintPalm(ctx, 97, 98, 1.05, -0.14, '#1c0a24'); ctx.restore();
  // hero car, right of centre
  paintHeroCar(ctx, w * 0.66, h * 0.86, Math.min(w, h) * 0.011, '#c22e6e');
  // the duo, 3/4 view with faces, left of the car
  const fs = h * 0.0115;
  paintMan(ctx, w * 0.30, h * 0.97, fs, { jacket: '#7a1f3d', shirt: '#f2e8d5', hair: '#241a12' });
  paintWoman(ctx, w * 0.44, h * 0.97, fs * 0.96, { top: '#ff5c8a', skirt: '#1d2f5e', hair: '#2e1408' });
  // halftone corner + ground haze
  ctx.save(); ctx.globalAlpha = 0.5; paintHalftone(ctx, w * 0.82, h * 0.02, w * 0.16, h * 0.2, '#ff7ad9', 7, 1.6); ctx.restore();
  paintHaze(ctx, roadY - h * 0.03, h * 0.06, 'rgba(255,150,100,0.25)');
}

// --- the 9 procedural scenes --------------------------------------------
// Each scene draws in a local 100x100 space and keeps every sign inside
// the safe rect (x 8..92, y 6..88). Panel labels are drawn by cover.js at
// the bottom-left; signs live at the top, so they never overlap.

function local(ctx, w, h, fn) {
  ctx.save(); ctx.scale(w / 100, h / 100); fn(); ctx.restore();
}

export function paintBoulevard(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('boulevard' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#5a1a5e'], [0.4, '#c23a6e'], [0.7, '#ff7a4d'], [1, '#ffb35c']],
      { x: 50, y: 46, r: 16, color: '#ffe9b0', glow: 'rgba(255,200,120,0.7)' });
    paintClouds(ctx, rand, 5, 6, 24, 'rgba(255,190,160,0.45)');
    paintBirds(ctx, rand, 4, 8, 20);
    paintSkyline(ctx, rand, 62, 'rgba(90,30,80,0.8)', '#33123a', true, ['#ffd76a', '#ff9a5c', '#9be8ff']);
    paintRoad(ctx, 62, '#3a1a34', 'rgba(255,170,90,0.5)');
    paintPalm(ctx, 6, 98, 0.9, 0.1, '#1c0a24');
    paintPalm(ctx, 94, 99, 0.8, -0.12, '#1c0a24');
    paintCarSide(ctx, 30, 84, 1.15, '#c22e6e', false);
    paintCarSide(ctx, 74, 88, 0.9, '#2f6fb2', true);
    paintNeonSign(ctx, 'OCEAN DR', 50, 12, 70, '#7df3ff', '#37b6ff');
  });
}

export function paintPier(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('pier' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#0a0a2e'], [0.55, '#1c1445'], [1, '#3a1a5e']], null);
    ctx.fillStyle = '#f4ecd8';
    ctx.beginPath(); ctx.arc(78, 16, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(244,236,216,0.25)';
    ctx.beginPath(); ctx.arc(78, 16, 8, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.6})`;
      ctx.fillRect(rand() * 100, rand() * 40, 0.8, 0.8);
    }
    paintSkyline(ctx, rand, 58, 'rgba(20,10,40,0.9)', '#160b2e', true, ['#7df3ff', '#ffd76a', '#ff7ad9']);
    // ferris wheel, right side, behind the deck
    ctx.save(); ctx.translate(76, 34);
    ctx.strokeStyle = '#7df3ff'; ctx.lineWidth = 0.9; ctx.shadowColor = '#37b6ff'; ctx.shadowBlur = 5;
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); ctx.stroke();
    }
    ctx.shadowBlur = 0;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3;
      ctx.fillStyle = ['#ff5c8a', '#ffd76a', '#7df3ff'][i % 3];
      ctx.beginPath(); ctx.arc(Math.cos(a) * 13, Math.sin(a) * 13, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // water + pier deck
    const wg = ctx.createLinearGradient(0, 58, 0, 100);
    wg.addColorStop(0, '#12233f'); wg.addColorStop(1, '#0a1226');
    ctx.fillStyle = wg; ctx.fillRect(0, 58, 100, 42);
    ctx.fillStyle = 'rgba(125,243,255,0.35)';
    for (let i = 0; i < 12; i++) ctx.fillRect(10 + rand() * 80, 62 + rand() * 30, 6 + rand() * 10, 0.8);
    ctx.fillStyle = '#241a33'; ctx.fillRect(0, 66, 100, 6);
    ctx.fillStyle = '#3a2a4a';
    for (let x = 4; x < 100; x += 9) ctx.fillRect(x, 72, 3, 12);
    ctx.fillStyle = '#ffd76a';
    for (let x = 6; x < 100; x += 12) ctx.fillRect(x, 68.5, 5, 0.9);
    paintNeonSign(ctx, 'PIER 9', 50, 12, 60, '#7df3ff', '#37b6ff');
  });
}

export function paintDowntown(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('downtown' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#0b0b26'], [0.6, '#241238'], [1, '#3d1a4a']], null);
    ctx.fillStyle = '#e8e0c8';
    ctx.beginPath(); ctx.arc(82, 14, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,190,170,0.5)';
    ctx.beginPath(); ctx.arc(80.5, 13, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(83.5, 15.5, 0.9, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.6})`;
      ctx.fillRect(rand() * 100, rand() * 46, 0.8, 0.8);
    }
    // searchlight beams
    ctx.fillStyle = 'rgba(255,244,200,0.10)';
    ctx.beginPath(); ctx.moveTo(18, 58); ctx.lineTo(10, 8); ctx.lineTo(16, 8); ctx.lineTo(26, 58); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(70, 58); ctx.lineTo(84, 6); ctx.lineTo(89, 8); ctx.lineTo(78, 58); ctx.closePath(); ctx.fill();
    paintSkyline(ctx, rand, 64, 'rgba(16,8,32,0.9)', '#120a24', true, ['#ffd76a', '#9be8ff', '#ff7ad9', '#8affc1']);
    paintRoad(ctx, 64, '#191024', 'rgba(255,220,120,0.3)');
    paintCarSide(ctx, 32, 84, 1.1, '#8a1f3d', false);
    paintCarSide(ctx, 72, 89, 0.85, '#1f5e8a', true);
    paintNeonSign(ctx, 'DOWNTOWN', 40, 12, 60, '#ff7ad9', '#ff2e9a');
  });
}

export function paintBeach(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('beach' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#7ec8e8'], [0.45, '#ffd9a0'], [0.7, '#ff9a6a'], [1, '#ffb35c']],
      { x: 50, y: 44, r: 13, color: '#fff3c8', glow: 'rgba(255,220,140,0.6)' });
    paintClouds(ctx, rand, 5, 6, 22, 'rgba(255,255,255,0.75)');
    paintBirds(ctx, rand, 5, 8, 20);
    // sea with a sun path
    const sg = ctx.createLinearGradient(0, 52, 0, 74);
    sg.addColorStop(0, '#2f7fa8'); sg.addColorStop(1, '#1d5a80');
    ctx.fillStyle = sg; ctx.fillRect(0, 52, 100, 22);
    const sp = ctx.createLinearGradient(0, 52, 0, 74);
    sp.addColorStop(0, 'rgba(255,220,140,0.7)'); sp.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = sp;
    ctx.beginPath(); ctx.moveTo(42, 52); ctx.lineTo(58, 52); ctx.lineTo(66, 74); ctx.lineTo(34, 74); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 10; i++) ctx.fillRect(8 + rand() * 84, 54 + rand() * 16, 5 + rand() * 9, 0.8);
    // sand
    const sand = ctx.createLinearGradient(0, 74, 0, 100);
    sand.addColorStop(0, '#f2d9a0'); sand.addColorStop(1, '#e0b878');
    ctx.fillStyle = sand; ctx.fillRect(0, 74, 100, 26);
    // striped umbrella (clear shape: pole + canopy, no stray triangles)
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(68, 74); ctx.lineTo(68, 90); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#ff5c8a' : '#fff3e0';
      ctx.beginPath(); ctx.moveTo(68, 74);
      const a0 = Math.PI + (i / 6) * Math.PI, a1 = Math.PI + ((i + 1) / 6) * Math.PI;
      ctx.arc(68, 74, 9, a0, a1); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#ff5c8a'; ctx.beginPath(); ctx.arc(68, 74, 1.2, 0, Math.PI * 2); ctx.fill();
    // towel + ball
    ctx.fillStyle = '#37b6ff'; ctx.fillRect(52, 88, 10, 4);
    ctx.fillStyle = '#ff5c8a'; ctx.beginPath(); ctx.arc(82, 92, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(82, 92, 1.3, 0, Math.PI * 2); ctx.fill();
    paintPalm(ctx, 10, 99, 1.0, 0.14, '#2a4a1e');
    paintPalm(ctx, 20, 100, 0.8, -0.08, '#2a4a1e');
    paintPalm(ctx, 92, 99, 0.9, -0.14, '#2a4a1e');
    paintNeonSign(ctx, 'VICE BEACH', 50, 12, 72, '#ff5c8a', '#ff2e6a');
  });
}

export function paintStrip(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('strip' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#1a0a3a'], [0.55, '#5a1a6e'], [1, '#a12e7a']], null);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.5})`;
      ctx.fillRect(rand() * 100, rand() * 34, 0.8, 0.8);
    }
    // casino towers with vertical neon strips
    const towers = [
      { x: 8, w: 20, h: 46, c: '#2a1040', neon: '#ff2e9a', name: 'VICE' },
      { x: 32, w: 18, h: 56, c: '#1c0a34', neon: '#37b6ff', name: 'ROYAL' },
      { x: 54, w: 20, h: 50, c: '#2a1040', neon: '#ffd76a', name: 'PALMS' },
      { x: 78, w: 18, h: 58, c: '#1c0a34', neon: '#3dff8a', name: 'JACKPOT' },
    ];
    for (const t of towers) {
      ctx.fillStyle = t.c; ctx.fillRect(t.x, 66 - t.h, t.w, t.h);
      ctx.fillStyle = t.neon; ctx.shadowColor = t.neon; ctx.shadowBlur = 4;
      ctx.fillRect(t.x - 0.7, 66 - t.h, 1.4, t.h);
      ctx.fillRect(t.x + t.w - 0.7, 66 - t.h, 1.4, t.h);
      ctx.shadowBlur = 0;
      for (let wy = 66 - t.h + 4; wy < 62; wy += 5) {
        for (let wx = t.x + 2; wx < t.x + t.w - 2; wx += 3.4) {
          if (rand() < 0.4) {
            ctx.fillStyle = ['#ffd76a', '#9be8ff', '#ff7ad9'][Math.floor(rand() * 3)];
            ctx.fillRect(wx, wy, 1.5, 2);
          }
        }
      }
      // no per-tower name: the scene's own "THE STRIP" sign identifies it
      // (names drawn here collided with the sign and the tower edges)
    }
    paintRoad(ctx, 66, '#241028', 'rgba(255,120,200,0.35)');
    paintCarSide(ctx, 30, 84, 1.1, '#ffd76a', false);
    paintCarSide(ctx, 72, 89, 0.85, '#37b6ff', true);
    paintNeonSign(ctx, 'THE STRIP', 50, 10, 64, '#ffd76a', '#ff9a00');
  });
}

export function paintBayou(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('bayou' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#3a2a4a'], [0.45, '#b45a3a'], [0.75, '#ff8a4d'], [1, '#ffc46a']],
      { x: 68, y: 40, r: 12, color: '#ffe9b0', glow: 'rgba(255,180,100,0.6)' });
    paintClouds(ctx, rand, 4, 6, 20, 'rgba(255,190,150,0.4)');
    paintBirds(ctx, rand, 4, 8, 18);
    // distant treeline
    ctx.fillStyle = 'rgba(60,40,30,0.8)';
    for (let x = -2; x < 102; x += 6 + rand() * 5) {
      ctx.beginPath(); ctx.ellipse(x, 60, 5 + rand() * 4, 4 + rand() * 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    // water with sunset reflection
    const wg = ctx.createLinearGradient(0, 58, 0, 100);
    wg.addColorStop(0, '#5a3a28'); wg.addColorStop(1, '#2a1a14');
    ctx.fillStyle = wg; ctx.fillRect(0, 58, 100, 42);
    ctx.fillStyle = 'rgba(255,180,100,0.4)';
    for (let i = 0; i < 14; i++) ctx.fillRect(20 + rand() * 60, 60 + rand() * 34, 5 + rand() * 10, 0.8);
    // cypress trees: trunk + drooping moss + canopy blobs (layered, no pills)
    for (const [tx, ts] of [[10, 1.1], [24, 0.9], [88, 1.2], [95, 0.85]]) {
      ctx.fillStyle = '#241610';
      ctx.beginPath(); ctx.moveTo(tx - 2 * ts, 78); ctx.lineTo(tx - 0.8 * ts, 52 * ts + 8); ctx.lineTo(tx + 0.8 * ts, 52 * ts + 8); ctx.lineTo(tx + 2 * ts, 78); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2e2a16';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(tx + (rand() - 0.5) * 10 * ts, 46 + rand() * 10, 5 * ts, 3.4 * ts, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(120,140,80,0.6)'; ctx.lineWidth = 0.7;
      for (let i = 0; i < 5; i++) {
        const mx = tx + (rand() - 0.5) * 9 * ts;
        ctx.beginPath(); ctx.moveTo(mx, 50 + rand() * 4); ctx.lineTo(mx + 0.5, 58 + rand() * 5); ctx.stroke();
      }
    }
    // airboat: bright hull + seat + fan as a solid turbine disc with a
    // ring and hub (no radial spokes, so it never reads as a crosshair)
    ctx.save(); ctx.translate(52, 76);
    ctx.fillStyle = '#c8501e';
    ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.lineTo(12, 5); ctx.lineTo(-12, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd76a'; ctx.fillRect(-15, -0.8, 30, 1);
    ctx.fillStyle = '#3a1a10'; ctx.fillRect(-8, -5, 6, 5); ctx.fillRect(2, -5, 6, 5);
    ctx.fillStyle = '#c8b08a';
    ctx.beginPath(); ctx.arc(12, -8, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#241610';
    ctx.beginPath(); ctx.arc(12, -8, 6.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d8c49a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(12, -8, 4.6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.arc(12, -8, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // reeds in the foreground
    ctx.strokeStyle = '#3a2e16'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const rx = rand() * 100;
      ctx.beginPath(); ctx.moveTo(rx, 100); ctx.quadraticCurveTo(rx + (rand() - 0.5) * 4, 90, rx + (rand() - 0.5) * 6, 82 + rand() * 6); ctx.stroke();
    }
    paintHaze(ctx, 56, 10, 'rgba(255,180,120,0.22)');
    paintNeonSign(ctx, 'LEONIDA BAYOU', 50, 10, 76, '#ffd76a', '#ff9a00');
  });
}

export function paintChase(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('chase' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#2a1150'], [0.45, '#8a2a6e'], [0.7, '#ff6a4d'], [1, '#ffb35c']],
      { x: 24, y: 40, r: 13, color: '#ffe9b0', glow: 'rgba(255,180,110,0.6)' });
    paintClouds(ctx, rand, 4, 6, 22, 'rgba(255,170,140,0.4)');
    paintBirds(ctx, rand, 3, 8, 16);
    paintSkyline(ctx, rand, 56, 'rgba(70,20,70,0.8)', '#2a0f2e', true, ['#ffd76a', '#ff9a5c', '#9be8ff']);
    // highway in perspective
    ctx.fillStyle = '#241428'; ctx.fillRect(0, 56, 100, 44);
    ctx.fillStyle = 'rgba(255,150,80,0.35)';
    ctx.beginPath(); ctx.moveTo(44, 56); ctx.lineTo(56, 56); ctx.lineTo(72, 100); ctx.lineTo(28, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,220,120,0.9)';
    for (let i = 0; i < 5; i++) {
      const y = 60 + i * 8, s = 0.6 + i * 0.5;
      ctx.fillRect(50 - s / 2, y, s, 2.4);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(36, 56); ctx.lineTo(38, 56); ctx.lineTo(16, 100); ctx.lineTo(10, 100); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(64, 56); ctx.lineTo(62, 56); ctx.lineTo(84, 100); ctx.lineTo(90, 100); ctx.closePath(); ctx.fill();
    // fleeing sports car + two police cars with light bars
    paintCarSide(ctx, 50, 78, 1.3, '#c22e6e', false);
    paintCarSide(ctx, 22, 86, 0.95, '#1c2a44', false);
    paintCarSide(ctx, 80, 86, 0.95, '#1c2a44', true);
    for (const px of [22, 80]) {
      for (const [col, dx] of [['#ff2e4d', -1.6], ['#2e7dff', 1.6]]) {
        const glow = ctx.createRadialGradient(px + dx, 75, 0.5, px + dx, 75, 7);
        glow.addColorStop(0, col); glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(px + dx, 75, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col; ctx.fillRect(px + dx - 1.4, 74.4, 2.8, 1.6);
      }
    }
    paintHelicopter(ctx, 78, 16, 0.55, '#2b1b3a', false);
    paintNeonSign(ctx, 'HIGHWAY 95', 50, 10, 66, '#ff7ad9', '#ff2e9a');
  });
}

export function paintArtDeco(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('artdeco' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#0d1030'], [0.5, '#2a1a55'], [1, '#6e2a6e']],
      { x: 80, y: 16, r: 9, color: '#f4ecd8', glow: 'rgba(240,230,200,0.4)' });
    for (let i = 0; i < 36; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.55})`;
      ctx.fillRect(rand() * 100, rand() * 38, 0.8, 0.8);
    }
    // art-deco hotel row: stepped facades, pastel + neon outline
    const hotels = [
      { x: 6, w: 20, h: 34, c: '#f2a0b8', neon: '#ff5c8a' },
      { x: 28, w: 22, h: 44, c: '#7de8d8', neon: '#2ee8c8' },
      { x: 52, w: 20, h: 38, c: '#ffd76a', neon: '#ff9a00' },
      { x: 74, w: 20, h: 48, c: '#b8a0f2', neon: '#9a6eff' },
    ];
    for (const ht of hotels) {
      ctx.fillStyle = ht.c;
      ctx.beginPath();
      ctx.moveTo(ht.x, 70); ctx.lineTo(ht.x, 70 - ht.h + 6);
      ctx.quadraticCurveTo(ht.x, 70 - ht.h, ht.x + 4, 70 - ht.h);
      ctx.lineTo(ht.x + ht.w - 4, 70 - ht.h);
      ctx.quadraticCurveTo(ht.x + ht.w, 70 - ht.h, ht.x + ht.w, 70 - ht.h + 6);
      ctx.lineTo(ht.x + ht.w, 70); ctx.closePath(); ctx.fill();
      // stepped crown
      ctx.fillRect(ht.x + ht.w * 0.3, 70 - ht.h - 4, ht.w * 0.4, 4);
      ctx.strokeStyle = ht.neon; ctx.lineWidth = 0.9; ctx.shadowColor = ht.neon; ctx.shadowBlur = 4;
      ctx.strokeRect(ht.x + 1.5, 70 - ht.h + 2, ht.w - 3, ht.h - 4);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(20,10,30,0.85)';
      for (let wy = 70 - ht.h + 6; wy < 66; wy += 6) {
        for (let wx = ht.x + 3.5; wx < ht.x + ht.w - 3.5; wx += 5) {
          if (rand() < 0.6) ctx.fillRect(wx, wy, 2.4, 3.2);
        }
      }
    }
    paintRoad(ctx, 70, '#1d1026', 'rgba(255,200,120,0.3)');
    paintCarSide(ctx, 50, 84, 1.15, '#37b6ff', false);
    paintPalm(ctx, 4, 98, 0.85, 0.1, '#140a20');
    paintPalm(ctx, 96, 99, 0.8, -0.12, '#140a20');
    paintNeonSign(ctx, 'OCEAN DRIVE', 50, 10, 70, '#7de8d8', '#2ee8c8');
  });
}

export function paintHeliBay(ctx, w, h, seed) {
  const rand = mulberry32(hashSeed('helibay' + seed));
  local(ctx, w, h, () => {
    paintSky(ctx, [[0, '#3a1150'], [0.4, '#c23a6e'], [0.65, '#ff7a4d'], [1, '#ffc46a']],
      { x: 30, y: 46, r: 15, color: '#ffe9b0', glow: 'rgba(255,200,120,0.7)' });
    paintClouds(ctx, rand, 5, 6, 22, 'rgba(255,190,160,0.45)');
    paintBirds(ctx, rand, 5, 10, 24);
    paintSkyline(ctx, rand, 58, 'rgba(80,25,75,0.85)', '#33123a', true, ['#ffd76a', '#ff9a5c']);
    // bay water + sun path + boats
    const wg = ctx.createLinearGradient(0, 58, 0, 100);
    wg.addColorStop(0, '#2a4a6e'); wg.addColorStop(1, '#12233f');
    ctx.fillStyle = wg; ctx.fillRect(0, 58, 100, 42);
    ctx.fillStyle = 'rgba(255,200,120,0.5)';
    ctx.beginPath(); ctx.moveTo(22, 58); ctx.lineTo(38, 58); ctx.lineTo(52, 100); ctx.lineTo(8, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    for (let i = 0; i < 12; i++) ctx.fillRect(6 + rand() * 88, 62 + rand() * 32, 5 + rand() * 9, 0.8);
    for (const [bx, bs] of [[18, 1], [72, 0.8]]) {
      ctx.fillStyle = '#e8e0d0';
      ctx.beginPath(); ctx.moveTo(bx - 8 * bs, 82); ctx.lineTo(bx + 8 * bs, 82); ctx.lineTo(bx + 5 * bs, 86); ctx.lineTo(bx - 5 * bs, 86); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#e8e0d0'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(bx, 82); ctx.lineTo(bx, 70); ctx.stroke();
      ctx.fillStyle = '#ff5c8a';
      ctx.beginPath(); ctx.moveTo(bx, 70); ctx.lineTo(bx, 80); ctx.lineTo(bx + 6 * bs, 78); ctx.closePath(); ctx.fill();
    }
    // big helicopter with searchlight on the water
    paintHelicopter(ctx, 64, 30, 0.72, '#1c1228', false);
    paintNeonSign(ctx, 'LEONIDA BAY', 50, 10, 68, '#7df3ff', '#37b6ff');
  });
}

export const SCENES = {
  hero: { name: 'Hero Duo', label: 'VICE CITY · SUNSET', paint: paintHeroScene },
  boulevard: { name: 'Vice Boulevard', label: 'OCEAN DR · SUNSET', paint: paintBoulevard },
  pier: { name: 'Neon Pier', label: 'PIER 9 · NIGHT', paint: paintPier },
  downtown: { name: 'Downtown Night', label: 'DOWNTOWN · 2 AM', paint: paintDowntown },
  beach: { name: 'Beach Palms', label: 'VICE BEACH · NOON', paint: paintBeach },
  strip: { name: 'Casino Strip', label: 'THE STRIP · NEON', paint: paintStrip },
  bayou: { name: 'Swamp Airboat', label: 'LEONIDA BAYOU', paint: paintBayou },
  chase: { name: 'Highway Chase', label: 'HIGHWAY 95 · DUSK', paint: paintChase },
  artdeco: { name: 'Ocean Drive Deco', label: 'OCEAN DRIVE · NIGHT', paint: paintArtDeco },
  helibay: { name: 'Helicopter Bay', label: 'LEONIDA BAY · SUNSET', paint: paintHeliBay },
};
export const SCENE_KEYS = Object.keys(SCENES);
