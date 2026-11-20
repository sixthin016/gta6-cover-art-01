// Neon Coast Cover Studio — cover renderer.
// Draws a GTA-style multi-panel poster onto any canvas: real photos in slanted
// comic panels, a striped chrome 3D title, and full poster furniture (press
// quote, role tags, tagline pill, billing block, gold seal, barcode).
// Everything is drawn from the state object; the render is deterministic:
// same state + same images = same pixels.

export const PHOTO_LIBRARY = [
  { id: 'portrait', label: 'The Driver', file: 'samples/portrait.jpg' },
  { id: 'couple', label: 'The Couple', file: 'samples/couple.jpg' },
  { id: 'sportscar', label: 'Sports Car', file: 'samples/sportscar.jpg' },
  { id: 'neonstreet', label: 'Neon Street', file: 'samples/neonstreet.jpg' },
  { id: 'speedboat', label: 'Speedboat', file: 'samples/speedboat.jpg' },
  { id: 'palmbeach', label: 'Palm Beach', file: 'samples/palmbeach.jpg' },
  { id: 'boulevard', label: 'Boulevard', file: 'samples/boulevard.jpg' },
  { id: 'pier', label: 'Pier', file: 'samples/pier.jpg' },
];

export const PANEL_ROLES = [
  'THE DRIVER', 'THE INSIDER', 'THE COURIER', 'THE GETAWAY', 'THE LOOKOUT',
  'THE FIXER', 'THE ROOKIE', 'THE LEGEND', 'THE CREW',
];

export const GRADES = {
  sunset:    { name: 'Sunset',     filter: 'saturate(1.25) contrast(1.08) brightness(1.02)', top: 'rgba(123,47,247,0.20)', bottom: 'rgba(255,110,60,0.28)' },
  neonvice:  { name: 'Neon Vice',  filter: 'saturate(1.45) contrast(1.12) brightness(1.0)',  top: 'rgba(255,46,136,0.22)', bottom: 'rgba(0,229,255,0.20)' },
  golden:    { name: 'Golden Hour',filter: 'saturate(1.3) contrast(1.05) brightness(1.06) sepia(0.18)', top: 'rgba(255,190,60,0.16)', bottom: 'rgba(255,140,0,0.24)' },
  tealnoir:  { name: 'Teal Noir',  filter: 'saturate(0.95) contrast(1.18) brightness(0.94)', top: 'rgba(0,60,80,0.26)', bottom: 'rgba(255,120,80,0.16)' },
  magenta:   { name: 'Magenta Rush',filter: 'saturate(1.5) contrast(1.1) brightness(1.0)',  top: 'rgba(255,0,128,0.24)', bottom: 'rgba(120,0,200,0.22)' },
  palmdusk:  { name: 'Palm Dusk',  filter: 'saturate(1.15) contrast(1.06) brightness(0.97)', top: 'rgba(60,20,90,0.28)', bottom: 'rgba(255,90,120,0.20)' },
  monochrome:{ name: 'Mono Chrome',filter: 'grayscale(1) contrast(1.15) brightness(1.04)', top: 'rgba(255,255,255,0.06)', bottom: 'rgba(0,0,0,0.18)' },
};

export const SIZES = {
  '1920x1080': [1920, 1080],
  '1080x1350': [1080, 1350],
  '1080x1080': [1080, 1080],
  '1080x1920': [1080, 1920],
  '1200x628': [1200, 628],
  '1200x1500': [1200, 1500],
};

// Each layout: panels as fractions [x, y, w, h, rotationDegrees] of the cover.
// Panel area runs y 0.295..0.855; title zone above, billing below.
export const LAYOUTS = {
  slanted: { name: 'Slanted Comic', panels: [
    [0.03, 0.295, 0.56, 0.56, -2], [0.61, 0.295, 0.36, 0.27, 2.5], [0.61, 0.585, 0.36, 0.27, -2.5] ] },
  classic: { name: 'Classic Trio', panels: [
    [0.03, 0.295, 0.62, 0.56, 0], [0.67, 0.295, 0.30, 0.27, 0], [0.67, 0.585, 0.30, 0.27, 0] ] },
  duo: { name: 'Hero Duo', panels: [
    [0.03, 0.295, 0.46, 0.56, -1], [0.51, 0.295, 0.46, 0.56, 1] ] },
  triptych: { name: 'Triptych', panels: [
    [0.03, 0.295, 0.30, 0.56, 0], [0.35, 0.295, 0.30, 0.56, 0], [0.67, 0.295, 0.30, 0.56, 0] ] },
  grid3x3: { name: 'Whole-Cast Grid', panels: [
    [0.03, 0.295, 0.30, 0.175, 0], [0.35, 0.295, 0.30, 0.175, 0], [0.67, 0.295, 0.30, 0.175, 0],
    [0.03, 0.485, 0.30, 0.175, 0], [0.35, 0.485, 0.30, 0.175, 0], [0.67, 0.485, 0.30, 0.175, 0],
    [0.03, 0.675, 0.30, 0.18, 0], [0.35, 0.675, 0.30, 0.18, 0], [0.67, 0.675, 0.30, 0.18, 0] ] },
  spotlight: { name: 'Spotlight', panels: [
    [0.03, 0.295, 0.30, 0.27, -2], [0.67, 0.295, 0.30, 0.27, 2], [0.03, 0.585, 0.94, 0.27, 0] ] },
  strip: { name: 'Film Strip', panels: [
    [0.03, 0.295, 0.94, 0.175, 0], [0.03, 0.485, 0.94, 0.175, 0], [0.03, 0.675, 0.94, 0.18, 0] ] },
  split: { name: 'Split Run', panels: [
    [0.03, 0.295, 0.94, 0.27, -1.5], [0.03, 0.585, 0.46, 0.27, 1.5], [0.51, 0.585, 0.46, 0.27, -1.5] ] },
  poster: { name: 'Poster Lead', panels: [
    [0.03, 0.295, 0.94, 0.38, 0], [0.03, 0.69, 0.30, 0.165, 0],
    [0.35, 0.69, 0.30, 0.165, 0], [0.67, 0.69, 0.30, 0.165, 0] ] },
};

export const PRESETS = [
  { id: 'golden', name: 'Golden Getaway', layout: 'slanted', grade: 'sunset', title: 'NEON COAST', subtitle: 'five friends · one coast · no way back' },
  { id: 'vice', name: 'Vice Nights', layout: 'classic', grade: 'neonvice', title: 'VICE NIGHTS', subtitle: 'the city never sleeps, neither do we' },
  { id: 'duo', name: 'Duo Run', layout: 'duo', grade: 'golden', title: 'DOUBLE OR NOTHING', subtitle: 'two hearts, one fast car' },
  { id: 'cast', name: 'Full Cast', layout: 'grid3x3', grade: 'magenta', title: 'THE WHOLE CREW', subtitle: 'every face has a price' },
  { id: 'chase', name: 'Sunset Chase', layout: 'split', grade: 'tealnoir', title: 'LAST LIGHT RUN', subtitle: 'outrun the sunset' },
  { id: 'beach', name: 'Palm Dusk', layout: 'poster', grade: 'palmdusk', title: 'PALM DUSK', subtitle: 'paradise has a getaway plan' },
];

const DEFAULT_PANEL_PHOTOS = ['portrait', 'couple', 'sportscar', 'neonstreet', 'speedboat', 'palmbeach', 'boulevard', 'pier', 'portrait'];

export function defaultState() {
  return {
    title: 'NEON COAST',
    subtitle: 'five friends · one coast · no way back',
    quote: 'PURE GOLDEN-HOUR MAYHEM',
    quoteSource: 'THE HARBOR GAZETTE',
    tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
    billing1: 'A SUNSET PICTURES PRODUCTION',
    billing2: 'STARRING YOU · SHOT ON YOUR OWN CAMERA',
    layout: 'slanted',
    grade: 'sunset',
    size: '1080x1350',
    panels: DEFAULT_PANEL_PHOTOS.map((photo, i) => ({
      photo, scene: i, zoom: 1, ox: 0, oy: 0, role: PANEL_ROLES[i % PANEL_ROLES.length],
    })),
    furniture: { quote: true, stars: true, vol: true, tagline: true, billing: true, seal: true, barcode: true, roles: true },
  };
}

export function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

// ---- helpers ---------------------------------------------------------------

function starPath(ctx, cx, cy, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function fitFont(ctx, text, maxWidth, startSize, family, weight = 900) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

// ---- chrome 3D title -------------------------------------------------------

export function drawChromeTitle(ctx, text, cx, topY, maxWidth, maxSize) {
  const label = (text || 'NEON COAST').toUpperCase();
  const size = fitFont(ctx, label, maxWidth, maxSize, 'Anton, "Arial Black", sans-serif');
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const totalW = ctx.measureText(label).width;
  let x = cx - totalW / 2;
  const baseline = topY + size;
  // Shear for the retro italic lean.
  ctx.transform(1, 0, -0.10, 1, size * 0.10, 0);
  const depth = Math.max(3, size * 0.055);
  // 3D extrusion: stacked dark-magenta copies down-right.
  ctx.fillStyle = '#5b0a4e';
  for (let d = Math.round(depth); d >= 1; d--) {
    const o = d * (depth / Math.round(depth));
    let gx = x;
    for (const ch of label) {
      ctx.fillText(ch, gx + o, baseline + o);
      gx += ctx.measureText(ch).width;
    }
  }
  // Per-glyph sunset stripe fill + sharp white keyline.
  let gx = x;
  for (const ch of label) {
    const cw = ctx.measureText(ch).width;
    const g = ctx.createLinearGradient(0, topY, 0, baseline + depth);
    g.addColorStop(0.0, '#ffffff');
    g.addColorStop(0.28, '#ffe45e');
    g.addColorStop(0.52, '#ff9a3c');
    g.addColorStop(0.76, '#ff2e88');
    g.addColorStop(1.0, '#7b2ff7');
    ctx.fillStyle = g;
    ctx.fillText(ch, gx, baseline);
    ctx.lineWidth = Math.max(1.5, size * 0.022);
    ctx.strokeStyle = '#ffffff';
    ctx.lineJoin = 'round';
    ctx.strokeText(ch, gx, baseline);
    gx += cw;
  }
  ctx.restore();
  // Sparkles: fixed positions, deterministic.
  const spark = [[0.16, 0.42], [0.84, 0.30], [0.68, 0.62]];
  for (const [fx, fy] of spark) {
    const sx = cx + (fx - 0.5) * totalW;
    const sy = topY + fy * size;
    const r = size * 0.07;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ff9de2';
    ctx.shadowBlur = size * 0.12;
    starPath(ctx, sx, sy, r, 4);
    ctx.fill();
    ctx.restore();
  }
  return size;
}

export function drawScriptSubtitle(ctx, text, cx, y, maxWidth, maxSize) {
  const label = text || '';
  if (!label) return 0;
  const size = fitFont(ctx, label, maxWidth, maxSize, 'Pacifico, cursive', 400);
  ctx.save();
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff7ad9';
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = size * 0.35;
  ctx.fillText(label, cx, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(label, cx, y - size * 0.03);
  ctx.restore();
  return size;
}

// ---- panels ----------------------------------------------------------------

export function layoutPanels(state, W, H) {
  const layout = LAYOUTS[state.layout] || LAYOUTS.slanted;
  return layout.panels.map(([fx, fy, fw, fh, rot], i) => ({
    rect: { x: fx * W, y: fy * H, w: fw * W, h: fh * H },
    rot,
    panel: state.panels[i] || state.panels[0],
    index: i,
  }));
}

function drawPanelPhoto(ctx, img, rect, panel, grade) {
  const { x, y, w, h } = rect;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = panel.zoom || 1;
  const base = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * base;
  const dh = ih * base;
  const dx = x + (w - dw) / 2 + (panel.ox || 0) * w;
  const dy = y + (h - dh) / 2 + (panel.oy || 0) * h;
  ctx.save();
  if (grade && grade.filter) ctx.filter = grade.filter;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function drawRoleTag(ctx, rect, role, W, H) {
  const fs = Math.max(11, Math.min(Math.min(W, H) * 0.016, rect.h * 0.30));
  ctx.save();
  ctx.font = `900 ${fs}px Anton, "Arial Black", sans-serif`;
  const tw = ctx.measureText(role).width;
  const pad = fs * 0.7;
  const bw = tw + pad * 2 + fs * 0.5;
  const bh = fs * 1.9;
  const bx = rect.x + W * 0.008;
  const by = rect.y + rect.h - bh - W * 0.01;
  // Parallelogram ribbon.
  ctx.beginPath();
  const slant = fs * 0.55;
  ctx.moveTo(bx + slant, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw - slant, by + bh);
  ctx.lineTo(bx, by + bh);
  ctx.closePath();
  ctx.fillStyle = 'rgba(8, 4, 12, 0.88)';
  ctx.fill();
  // Accent bar.
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(bx + slant, by, fs * 0.28, bh);
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, bx + slant + fs * 0.55, by + bh / 2 + fs * 0.05);
  ctx.restore();
}

function drawPanels(ctx, state, W, H, images, drawScene) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  for (const { rect, rot, panel, index } of layoutPanels(state, W, H)) {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.translate(-cx, -cy);
    // Drop shadow.
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = W * 0.02;
    ctx.shadowOffsetY = W * 0.008;
    ctx.fillStyle = '#12041c';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    // Photo or procedural demo scene, clipped to the panel.
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const img = panel.photo ? images[panel.photo] : null;
    if (img) drawPanelPhoto(ctx, img, rect, panel, grade);
    else drawScene(ctx, panel.scene ?? index % 9, rect, grade);
    // Inner sunset wash at the foot of the panel.
    const wash = ctx.createLinearGradient(0, rect.y + rect.h * 0.55, 0, rect.y + rect.h);
    wash.addColorStop(0, 'rgba(255,110,60,0)');
    wash.addColorStop(1, 'rgba(255,46,136,0.28)');
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    // Cream-gold keyline.
    ctx.lineWidth = Math.max(2, W * 0.003);
    ctx.strokeStyle = '#f5e6c8';
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    if (state.furniture.roles && panel.role) drawRoleTag(ctx, rect, panel.role, W, H);
  }
}

// ---- furniture ---------------------------------------------------------------

function drawPressQuote(ctx, state, W, H) {
  if (!state.furniture.quote && !state.furniture.stars) return;
  const S = Math.min(W, H);
  const y = H * 0.032;
  const fs = Math.max(12, S * 0.017);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (state.furniture.stars) {
    const r = fs * 0.55;
    const gap = r * 2.6;
    const total = gap * 4;
    const startX = W / 2 - total / 2;
    ctx.fillStyle = '#ffc93c';
    ctx.shadowColor = 'rgba(255,180,0,0.8)';
    ctx.shadowBlur = fs * 0.3;
    for (let i = 0; i < 5; i++) {
      starPath(ctx, startX + i * gap, y - fs * 1.0, r);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  if (state.furniture.quote) {
    ctx.font = `900 ${fs}px Anton, "Arial Black", sans-serif`;
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(`\u201C${state.quote}\u201D`, W / 2, y);
    ctx.font = `700 ${fs * 0.72}px "Arial Narrow", sans-serif`;
    ctx.fillStyle = 'rgba(255,233,168,0.75)';
    ctx.fillText(`— ${state.quoteSource}`, W / 2, y + fs * 1.35);
  }
  ctx.restore();
}

function drawVolTab(ctx, W, H) {
  const fs = Math.max(11, Math.min(W, H) * 0.015);
  ctx.save();
  ctx.font = `900 ${fs}px Anton, "Arial Black", sans-serif`;
  const label = 'VOL. 01';
  const tw = ctx.measureText(label).width;
  const pad = fs * 0.8;
  const bw = tw + pad * 2;
  const bh = fs * 2.0;
  const bx = W - bw - W * 0.02;
  const by = H * 0.012;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw * 0.82, by + bh + fs * 0.5);
  ctx.lineTo(bx, by + bh);
  ctx.closePath();
  ctx.fillStyle = '#0b0612';
  ctx.fill();
  ctx.strokeStyle = '#f5e6c8';
  ctx.lineWidth = Math.max(1, W * 0.0015);
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + bw / 2, by + bh / 2);
  ctx.restore();
}

function drawTaglinePill(ctx, state, W, H, topY) {
  if (!state.furniture.tagline || !state.tagline) return 0;
  const fs = Math.max(11, Math.min(W, H) * 0.016);
  ctx.save();
  ctx.font = `900 ${fs}px Anton, "Arial Black", sans-serif`;
  const tw = ctx.measureText(state.tagline).width;
  const pad = fs * 1.1;
  const bw = tw + pad * 2;
  const bh = fs * 2.1;
  const bx = (W - bw) / 2;
  const by = topY;
  ctx.beginPath();
  const r = bh / 2;
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
  ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + bw, by, r);
  ctx.closePath();
  ctx.fillStyle = 'rgba(11,6,18,0.85)';
  ctx.fill();
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.tagline, W / 2, by + bh / 2 + fs * 0.05);
  ctx.restore();
  return bh;
}

function drawBilling(ctx, state, W, H) {
  if (!state.furniture.billing) return;
  const fs = Math.max(11, Math.min(W, H) * 0.015);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fs}px Anton, "Arial Black", sans-serif`;
  ctx.fillStyle = '#ffe9a8';
  ctx.fillText(state.billing1, W / 2, H * 0.895);
  ctx.font = `700 ${fs * 0.85}px "Arial Narrow", sans-serif`;
  ctx.fillStyle = 'rgba(255,233,168,0.85)';
  ctx.fillText(state.billing2, W / 2, H * 0.895 + fs * 1.7);
  ctx.restore();
}

function drawSeal(ctx, W, H) {
  const cx = W * 0.885;
  const cy = H * 0.925;
  const r = Math.min(W, H) * 0.052;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.82;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#ffe45e');
  g.addColorStop(0.5, '#ffc93c');
  g.addColorStop(1, '#e08a00');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.strokeStyle = '#7a4d00';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.strokeStyle = '#7a4d00';
  ctx.stroke();
  ctx.fillStyle = '#5b2d00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = r * 0.26;
  ctx.font = `900 ${fs}px Anton, "Arial Black", sans-serif`;
  ctx.fillText('ORIGINAL', 0, -fs * 0.55);
  ctx.fillText('COVER ART', 0, fs * 0.55);
  ctx.restore();
}

function drawBarcode(ctx, W, H) {
  const bw = W * 0.11;
  const bh = H * 0.028;
  const bx = W * 0.03;
  const by = H * 0.925;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx - W * 0.006, by - H * 0.004, bw + W * 0.012, bh + H * 0.012);
  ctx.fillStyle = '#111111';
  // Deterministic bar pattern.
  const pattern = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1];
  let x = bx;
  const unit = bw / 42;
  for (const wdt of pattern) {
    ctx.fillRect(x, by, unit * wdt, bh);
    x += unit * (wdt + 1);
    if (x > bx + bw) break;
  }
  ctx.font = `700 ${Math.max(9, W * 0.011)}px "Arial Narrow", sans-serif`;
  ctx.fillStyle = '#111111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('0 12345 67890 1', bx + bw / 2, by + bh + H * 0.002);
  ctx.restore();
}

function drawBackground(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b0b2e');
  g.addColorStop(0.35, '#5b1b6e');
  g.addColorStop(0.62, '#c22a6e');
  g.addColorStop(0.85, '#ff6e3c');
  g.addColorStop(1, '#ffb347');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Low sun disc behind the title.
  const sunR = W * 0.16;
  const sg = ctx.createRadialGradient(W / 2, H * 0.16, sunR * 0.1, W / 2, H * 0.16, sunR);
  sg.addColorStop(0, 'rgba(255,240,170,0.85)');
  sg.addColorStop(0.55, 'rgba(255,160,80,0.45)');
  sg.addColorStop(1, 'rgba(255,120,60,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.16, sunR, 0, Math.PI * 2);
  ctx.fill();
}

// ---- main entry --------------------------------------------------------------

/**
 * Draws the whole cover for `state` onto `canvas` (its own W x H).
 * `images` maps photo id -> HTMLImageElement. `drawScene` paints a
 * procedural demo scene (index, rect, grade) when a panel has no photo.
 * `highlight` (editor only) is a panel index to outline; never in exports.
 */
export function drawCover(canvas, state, images, drawScene, highlight = -1) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  drawBackground(ctx, W, H);
  drawPressQuote(ctx, state, W, H);
  if (state.furniture.vol) drawVolTab(ctx, W, H);
  // Title block, stacked so nothing overlaps on any aspect ratio: the title
  // size is capped by height as well as width, the script subtitle sits
  // just under the title's baseline, and the tagline pill under that.
  const titleTop = H * 0.06;
  const titleSize = drawChromeTitle(ctx, state.title, W / 2, titleTop, W * 0.94, Math.min(W * 0.155, H * 0.13));
  const subMax = Math.min(W * 0.042, H * 0.04);
  const subSize = fitFont(ctx, state.subtitle || '', W * 0.9, subMax, 'Pacifico, cursive', 400);
  const subtitleY = titleTop + titleSize + subSize * 0.75;
  drawScriptSubtitle(ctx, state.subtitle, W / 2, subtitleY, W * 0.9, subMax);
  drawTaglinePill(ctx, state, W, H, subtitleY + subSize * 0.85);
  drawPanels(ctx, state, W, H, images, drawScene);
  drawBilling(ctx, state, W, H);
  if (state.furniture.seal) drawSeal(ctx, W, H);
  if (state.furniture.barcode) drawBarcode(ctx, W, H);
  // Grade wash over everything, then a vignette.
  const grade = GRADES[state.grade] || GRADES.sunset;
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(0.5, 'rgba(0,0,0,0)');
  wash.addColorStop(1, grade.bottom);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,2,20,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // Editor-only selection outline (never on an export).
  if (highlight >= 0) {
    const panels = layoutPanels(state, W, H);
    const hit = panels[highlight];
    if (hit) {
      ctx.save();
      ctx.lineWidth = Math.max(3, W * 0.006);
      ctx.strokeStyle = '#00e5ff';
      ctx.setLineDash([W * 0.02, W * 0.01]);
      ctx.strokeRect(hit.rect.x - 4, hit.rect.y - 4, hit.rect.w + 8, hit.rect.h + 8);
      ctx.restore();
    }
  }
}
