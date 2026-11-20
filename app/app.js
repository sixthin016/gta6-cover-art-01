/* Neon Coast — GTA 6-style cover art studio. All art drawn by this code from
   the user's photos. No Rockstar logo, artwork or fonts anywhere. */
'use strict';

const PHOTOS = [
  { file: 'samples/portrait.jpg', name: 'Portrait', role: 'THE DRIVER' },
  { file: 'samples/couple.jpg', name: 'Duo', role: 'THE INSIDER' },
  { file: 'samples/neonstreet.jpg', name: 'Neon street', role: 'THE COURIER' },
  { file: 'samples/sportscar.jpg', name: 'Sports car', role: 'THE DRIVER' },
  { file: 'samples/speedboat.jpg', name: 'Speedboat', role: 'THE INSIDER' },
  { file: 'samples/palmbeach.jpg', name: 'Palm beach', role: 'THE COURIER' },
  { file: 'samples/boulevard.jpg', name: 'Boulevard', role: 'THE DRIVER' },
  { file: 'samples/pier.jpg', name: 'Pier', role: 'THE INSIDER' },
];
const ROLES = ['THE DRIVER', 'THE INSIDER', 'THE COURIER', 'THE LOOKOUT', 'THE FIXER', 'THE GETAWAY'];
const CAST = ['LUCIA VOSS', 'MARCUS REYES', 'DANA KOVAC', 'JULES PARK', 'TOMMY SALT', 'NIA FONTAINE'];

/* Layouts: panel rects as fractions of the panel area (x,y,w,h, rotation deg). */
const LAYOUTS = {
  fourGrid:  { label: 'Four-panel grid', rects: [[0, 0, .5, .5, 0], [.5, 0, .5, .5, 0], [0, .5, .5, .5, 0], [.5, .5, .5, .5, 0]] },
  heroThree: { label: 'Hero + three', rects: [[0, 0, .62, 1, 0], [.62, 0, .38, .34, 0], [.62, .34, .38, .33, 0], [.62, .67, .38, .33, 0]] },
  fullBleed: { label: 'Full-bleed single', rects: [[0, 0, 1, 1, 0]] },
  nineGrid:  { label: 'Nine-panel cover', rects: [[0,0,.34,.34,0],[.34,0,.33,.34,0],[.67,0,.33,.34,0],[0,.34,.34,.33,0],[.34,.34,.33,.33,0],[.67,.34,.33,.33,0],[0,.67,.34,.33,0],[.34,.67,.33,.33,0],[.67,.67,.33,.33,0]] },
  comic:     { label: 'Slanted comic', rects: [[0, 0, 1, .46, -2], [0, .5, .52, .5, 2.5], [.52, .5, .48, .5, -2]] },
  collage:   { label: '2×2 collage', rects: [[0, 0, .58, .58, 0], [.58, 0, .42, .42, 0], [.58, .42, .42, .58, 0], [0, .58, .58, .42, 0]] },
  split3:    { label: '3-panel split', rects: [[0, 0, .34, 1, 0], [.34, 0, .33, 1, 0], [.67, 0, .33, 1, 0]] },
  diagonal:  { label: 'Diagonal hero', rects: [[0, 0, .68, .72, -3], [.68, 0, .32, .4, 2], [.3, .68, .7, .32, 1.5]] },
  band:      { label: 'Poster band', rects: [[0, 0, 1, .55, 0], [0, .55, .34, .45, 0], [.34, .55, .33, .45, 0], [.67, .55, .33, .45, 0]] },
};
const LAYOUT_KEYS = Object.keys(LAYOUTS);

const GRADES = {
  sunset:     { label: 'Vice City sunset', top: '#ff7a1a', mid: '#ff2e88', bot: '#2b0f5e', mode: 'overlay', a: .55 },
  duotone:    { label: 'Electric blue / hot pink', top: '#19d3ff', mid: '#ff2e88', bot: '#0b1030', mode: 'overlay', a: .62 },
  magentacyan:{ label: 'Magenta–cyan', top: '#ff00c8', mid: '#00e5ff', bot: '#12002e', mode: 'soft-light', a: .6 },
  heat:       { label: 'Heat', top: '#ffd23e', mid: '#ff5a1a', bot: '#5e0f0f', mode: 'overlay', a: .55 },
  palmdusk:   { label: 'Palm dusk', top: '#ffb36b', mid: '#c94b7c', bot: '#1d2b53', mode: 'overlay', a: .5 },
  chromenight:{ label: 'Chrome night', top: '#9be8ff', mid: '#5a6cff', bot: '#050510', mode: 'soft-light', a: .6 },
  halftone:   { label: 'Halftone ink', top: '#ffffff', mid: '#ff2e88', bot: '#111111', mode: 'overlay', a: .45, halftone: true },
};
const GRADE_KEYS = Object.keys(GRADES);

const PRESETS = {
  neoncoast:  { label: 'Neon Coast', layout: 'fourGrid', grade: 'sunset', title: 'VICE CITY NIGHTS', sub: 'vice city nights', tag: 'EVERY SUNSET HAS A PRICE' },
  sunsetsleeve:{ label: 'Sunset Sleeve', layout: 'heroThree', grade: 'palmdusk', title: 'PALM & PISTOL', sub: 'palm & pistol', tag: 'TWO LIVES. ONE GETAWAY.' },
  palmposter: { label: 'Palm Poster', layout: 'band', grade: 'duotone', title: 'PALM BOULEVARD', sub: 'palm boulevard', tag: 'CRUISE THE NEON MILE' },
  heatwave:   { label: 'Heat Wave', layout: 'split3', grade: 'heat', title: 'HEAT WAVE', sub: 'heat wave', tag: 'THE CITY NEVER COOLS DOWN' },
  chromenight:{ label: 'Chrome Night', layout: 'diagonal', grade: 'chromenight', title: 'CHROME NIGHT', sub: 'chrome night', tag: 'STEEL, NEON AND REGRET' },
  halftone:   { label: 'Halftone Press', layout: 'nineGrid', grade: 'halftone', title: 'INK & NEON', sub: 'ink & neon', tag: 'PRINTED IN HOT PINK' },
};
const PRESET_KEYS = Object.keys(PRESETS);

const SCENES = [
  { label: 'Night city', sub: 'neon street · duo', layout: 'fourGrid', grade: 'duotone', photos: [2, 1, 3, 0], title: 'VICE CITY NIGHTS' },
  { label: 'Highway chase', sub: 'sports car · pier', layout: 'heroThree', grade: 'heat', photos: [3, 6, 0, 2], title: 'HIGHWAY CHASE' },
  { label: 'Club interior', sub: 'neon · portrait', layout: 'comic', grade: 'magentacyan', photos: [2, 0, 1], title: 'CLUB NEON' },
  { label: 'Beach boulevard', sub: 'palm beach · boat', layout: 'band', grade: 'sunset', photos: [5, 4, 6, 0], title: 'BEACH BOULEVARD' },
  { label: 'Rooftop dusk', sub: 'boulevard · skyline', layout: 'diagonal', grade: 'palmdusk', photos: [6, 2, 1], title: 'ROOFTOP DUSK' },
  { label: 'Palm street', sub: 'palm beach · couple', layout: 'split3', grade: 'sunset', photos: [5, 1, 2], title: 'PALM STREET' },
  { label: 'Convertible', sub: 'sports car · pier', layout: 'collage', grade: 'chromenight', photos: [3, 7, 5, 0], title: 'CONVERTIBLE' },
  { label: 'Skyline', sub: 'night city · duo', layout: 'nineGrid', grade: 'duotone', photos: [2, 0, 3, 1, 6, 4, 5, 7, 2], title: 'SKYLINE' },
  { label: 'Boardwalk', sub: 'pier · beach', layout: 'band', grade: 'palmdusk', photos: [7, 5, 1, 0], title: 'BOARDWALK' },
];

const SIZES = [
  { label: '1080×1080', w: 1080, h: 1080 },
  { label: '1080×1350', w: 1080, h: 1350 },
  { label: '1920×1080', w: 1920, h: 1080 },
  { label: '1080×1920', w: 1080, h: 1920 },
  { label: '1200×628', w: 1200, h: 628 },
  { label: '1200×1500', w: 1200, h: 1500 },
];

const state = {
  layout: 'fourGrid', grade: 'sunset', preset: 'neoncoast',
  title: 'VICE CITY NIGHTS', sub: 'vice city nights',
  tag: 'EVERY SUNSET HAS A PRICE',
  quote: '“The most electric cover maker of the summer.”',
  titleSize: 100, titleY: 66, grain: true, vignette: true, seal: true,
  faceOn: true, selected: 0, selTouched: false, exportSize: '1080x1350',
  panels: [],
};
let undoStack = [], redoStack = [];
const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const $ = id => document.getElementById(id);

function say(msg) { if (statusEl) statusEl.textContent = msg; }
function snapshot() { return JSON.stringify({ layout: state.layout, grade: state.grade, title: state.title, sub: state.sub, tag: state.tag, quote: state.quote, titleSize: state.titleSize, titleY: state.titleY, grain: state.grain, vignette: state.vignette, seal: state.seal, panels: state.panels.map(p => ({ file: p.file, role: p.role, zoom: p.zoom, ox: p.ox, oy: p.oy, anchor: p.anchor, faceFound: p.faceFound })) }); }
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 40) undoStack.shift(); redoStack = []; }
function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, { layout: s.layout, grade: s.grade, title: s.title, sub: s.sub, tag: s.tag, quote: s.quote, titleSize: s.titleSize, titleY: s.titleY, grain: s.grain, vignette: s.vignette, seal: s.seal });
  s.panels.forEach((sp, i) => { const p = state.panels[i]; if (p) Object.assign(p, sp); });
  syncInputs(); render();
}
function undo() { if (!undoStack.length) return say('Nothing to undo'); redoStack.push(snapshot()); restore(undoStack.pop()); say('Undone'); }
function redo() { if (!redoStack.length) return say('Nothing to redo'); undoStack.push(snapshot()); restore(redoStack.pop()); say('Redone'); }

/* ---- photos + face-aware auto-crop (pure canvas, offline) ---- */
const imgCache = {};
function loadImage(file) {
  if (imgCache[file]) return imgCache[file];
  const p = new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = file;
  });
  imgCache[file] = p;
  return p;
}
function isSkin(r, g, b) {
  /* Skin: warm, R clearly above G and B, but NOT hot-pink fabric — cap the
     R-G / R-B gaps so a pink puffer jacket (R-G ~150) is rejected. */
  const rg = r - g, rb = r - b;
  return r > 95 && r < 245 && g > 60 && b > 35 && rg > 12 && rg < 80 && rb > 18 && rb < 110;
}
function isDark(r, g, b) { return r + g + b < 210; }
/* Downscale, score skin-tone clusters + dark eye/mouth regions on an 8x6 grid,
   return the best cell centre as {x,y} in 0..1 photo coords, or null. */
function detectFaceAnchor(img) {
  try {
    const W = 96, H = Math.max(48, Math.round(96 * img.naturalHeight / img.naturalWidth));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    const GX = 8, GY = 6, skin = new Array(GX * GY).fill(0), dark = new Array(GX * GY).fill(0), tot = new Array(GX * GY).fill(0);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
      const ci = Math.min(GX - 1, Math.floor(x / W * GX)) + GX * Math.min(GY - 1, Math.floor(y / H * GY));
      tot[ci]++;
      if (isSkin(r, gg, b)) skin[ci]++;
      if (isDark(r, gg, b)) dark[ci]++;
    }
    let best = -1, bestScore = 0;
    for (let k = 0; k < GX * GY; k++) {
      const frac = skin[k] / Math.max(1, tot[k]);
      const score = skin[k] * (0.6 + frac) + dark[k] * 0.25;
      if (score > bestScore) { bestScore = score; best = k; }
    }
    const totalSkin = skin.reduce((a, b) => a + b, 0);
    if (best < 0 || totalSkin < W * H * 0.015 || bestScore < 40) return null;
    const cx = (best % GX + 0.5) / GX, cy = (Math.floor(best / GX) + 0.5) / GY;
    return { x: cx, y: Math.min(0.85, Math.max(0.08, cy)) };
  } catch (e) { return null; }
}
async function makePanel(photoIdx, role) {
  const ph = PHOTOS[photoIdx % PHOTOS.length];
  const img = await loadImage(ph.file);
  const anchor = state.faceOn ? detectFaceAnchor(img) : null;
  return { file: ph.file, name: ph.name, role: role || ph.role, img, zoom: 1.25, ox: 0, oy: 0, anchor: anchor || { x: .5, y: .42 }, faceFound: !!anchor };
}
async function loadDefaultPanels(photoIdxs) {
  const list = photoIdxs || [1, 0, 2, 3];
  state.panels = [];
  for (let i = 0; i < list.length; i++) state.panels.push(await makePanel(list[i], ROLES[i % ROLES.length]));
  const found = state.panels.filter(p => p.faceFound).length;
  const chip = $('faceStatus');
  if (chip) chip.textContent = found ? `Face found in ${found} photo${found > 1 ? 's' : ''} — crop centred on face` : 'No face found — centre crop';
  const hint = $('hint');
  if (hint) hint.innerHTML = found
    ? `Face-aware crop is <b>ON</b> — the pink ◎ marker sits on the detected face in ${found} panel${found > 1 ? 's' : ''}. Drag it to nudge the crop, drag the photo to pan, use Zoom to tighten the shot.`
    : 'Face-aware crop is <b>ON</b> but no face was found in these photos — centre crop used. Load a portrait to see the face anchor.';
}

/* ---- geometry ---- */
function panelRects(W, H) {
  const ax = 0, ay = Math.round(H * 0.055), aw = W, ah = Math.round(H * 0.845);
  return LAYOUTS[state.layout].rects.map((r, i) => ({
    x: ax + r[0] * aw, y: ay + r[1] * ah, w: r[2] * aw, h: r[3] * ah, rot: r[4] || 0,
    panel: state.panels[i % state.panels.length],
  }));
}
function drawCoverPhoto(g, img, rect, panel, W, H) {
  g.save();
  g.beginPath(); g.rect(rect.x, rect.y, rect.w, rect.h); g.clip();
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (panel.zoom || 1.25);
  const dw = iw * scale, dh = ih * scale;
  /* Anchor-centred: the face anchor stays at the panel centre unless panned. */
  const ax = panel.anchor ? panel.anchor.x : .5, ay = panel.anchor ? panel.anchor.y : .5;
  let dx = rect.x + (rect.w - dw) / 2 + (0.5 - ax) * dw * 0.9 + (panel.ox || 0);
  let dy = rect.y + (rect.h - dh) / 2 + (0.5 - ay) * dh * 0.9 + (panel.oy || 0);
  dx = Math.min(rect.x + 40, Math.max(rect.x + rect.w - dw - 40, dx));
  dy = Math.min(rect.y + 40, Math.max(rect.y + rect.h - dh - 40, dy));
  g.drawImage(img, dx, dy, dw, dh);
  g.restore();
}
function applyGrade(g, rect, W, H) {
  const gr = GRADES[state.grade];
  const grad = g.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  grad.addColorStop(0, gr.top); grad.addColorStop(.55, gr.mid); grad.addColorStop(1, gr.bot);
  g.save();
  g.beginPath(); g.rect(rect.x, rect.y, rect.w, rect.h); g.clip();
  g.globalCompositeOperation = gr.mode;
  g.globalAlpha = gr.a;
  g.fillStyle = grad; g.fillRect(rect.x, rect.y, rect.w, rect.h);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (gr.halftone) {
    g.fillStyle = 'rgba(0,0,0,.28)';
    const s = Math.max(5, W / 160);
    for (let y = rect.y + s; y < rect.y + rect.h; y += s * 2)
      for (let x = rect.x + s; x < rect.x + rect.w; x += s * 2) {
        g.beginPath(); g.arc(x, y, s * .28, 0, 7); g.fill();
      }
  }
  g.restore();
}

/* ---- chrome title: per-glyph sunset stripes + white keyline + magenta 3D ---- */
function drawChromeTitle(g, text, cx, topY, size, W) {
  g.save();
  g.font = `italic ${size}px Anton, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'top';
  const widths = [...text].map(ch => g.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  const stripe = g.createLinearGradient(0, topY, 0, topY + size);
  stripe.addColorStop(0, '#ffffff'); stripe.addColorStop(.28, '#ffe95e');
  stripe.addColorStop(.5, '#ff8a1e'); stripe.addColorStop(.72, '#ff2e88'); stripe.addColorStop(1, '#8b2bff');
  const tilt = -0.035;
  g.translate(cx, topY + size / 2); g.rotate(tilt); g.translate(-cx, -(topY + size / 2));
  [...text].forEach((ch, i) => {
    const w = widths[i], chx = x + w / 2;
    if (ch !== ' ') {
      g.fillStyle = '#7b0f4d';
      for (let k = 5; k >= 1; k--) g.fillText(ch, chx + k * size * .045, topY + k * size * .045);
      g.fillStyle = stripe;
      g.fillText(ch, chx, topY);
      g.lineWidth = Math.max(2, size * .045); g.strokeStyle = '#ffffff';
      g.strokeText(ch, chx, topY);
    }
    x += w;
  });
  g.restore();
  /* sparkles around the title */
  g.save();
  g.fillStyle = '#ffffff';
  const spots = [[cx - total * .48, topY - size * .12], [cx + total * .5, topY + size * .2], [cx + total * .3, topY - size * .18]];
  spots.forEach(([sx, sy], i) => {
    const r = size * (.09 + i * .02);
    g.beginPath();
    g.moveTo(sx, sy - r); g.quadraticCurveTo(sx, sy, sx + r, sy); g.quadraticCurveTo(sx, sy, sx, sy + r);
    g.quadraticCurveTo(sx, sy, sx - r, sy); g.quadraticCurveTo(sx, sy, sx, sy - r); g.fill();
  });
  g.restore();
  return topY + size;
}
function drawStarburst(g, cx, cy, r, label) {
  g.save(); g.translate(cx, cy);
  g.beginPath();
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * Math.PI * 2, rr = i % 2 ? r * .78 : r;
    g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
  g.fillStyle = '#ffc94d'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#7b0f4d'; g.stroke();
  g.fillStyle = '#7b0f4d'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `bold ${Math.round(r * .24)}px system-ui, sans-serif`;
  g.fillText('ORIGINAL', 0, -r * .28); g.fillText('COVER ART', 0, r * .05);
  g.font = `${Math.round(r * .18)}px system-ui, sans-serif`;
  g.fillText('★ ★ ★', 0, r * .38);
  g.restore();
}
function drawBarcode(g, x, y, w, h) {
  g.save(); g.fillStyle = '#fff'; g.fillRect(x - 4, y - 4, w + 8, h + 18);
  g.fillStyle = '#111';
  let px = x; let seed = 7;
  while (px < x + w - 2) { seed = (seed * 31 + 17) % 97; const bw = 1 + seed % 4; if (seed % 3) g.fillRect(px, y, bw, h); px += bw + 1 + seed % 3; }
  g.font = '11px monospace'; g.textAlign = 'center'; g.fillText('8 90210 2026 11', x + w / 2, y + h + 13);
  g.restore();
}

/* ---- the cover ---- */
function renderTo(g, W, H, preview) {
  /* sunset sky */
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1b0b3d'); sky.addColorStop(.35, '#7b1e6e'); sky.addColorStop(.62, '#ff5a3c'); sky.addColorStop(.8, '#ffb36b'); sky.addColorStop(1, '#2b0f5e');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  /* sun disc + skyline silhouette */
  g.save();
  g.fillStyle = 'rgba(255,214,120,.9)';
  g.beginPath(); g.arc(W * .78, H * .30, H * .11, 0, 7); g.fill();
  g.fillStyle = 'rgba(20,6,40,.85)';
  let bx = 0; let seed = 3;
  while (bx < W) { seed = (seed * 37 + 11) % 89; const bw = W * (.05 + seed % 9 / 100), bh = H * (.06 + seed % 14 / 100); g.fillRect(bx, H * .055 + H * .30 - bh, bw, bh); bx += bw + W * .008; }
  g.restore();
  /* panels */
  const rects = panelRects(W, H);
  rects.forEach((r, i) => {
    if (!r.panel || !r.panel.img) return;
    g.save();
    g.translate(r.x + r.w / 2, r.y + r.h / 2); g.rotate(r.rot * Math.PI / 180); g.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
    drawCoverPhoto(g, r.panel.img, r, r.panel, W, H);
    applyGrade(g, r, W, H);
    g.restore();
    /* cream-gold keyline + gutter */
    g.save();
    g.translate(r.x + r.w / 2, r.y + r.h / 2); g.rotate(r.rot * Math.PI / 180); g.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
    g.lineWidth = Math.max(3, W / 220); g.strokeStyle = '#ffe9b0'; g.strokeRect(r.x, r.y, r.w, r.h);
    g.lineWidth = Math.max(1, W / 500); g.strokeStyle = 'rgba(255,255,255,.55)'; g.strokeRect(r.x + 5, r.y + 5, r.w - 10, r.h - 10);
    g.restore();
    /* role ribbon */
    const rw = Math.min(r.w * .62, W * .22), rh = Math.max(16, H * .024);
    const rx = r.x + 8, ry = r.y + r.h - rh - 10;
    g.save();
    g.beginPath();
    g.moveTo(rx, ry); g.lineTo(rx + rw, ry); g.lineTo(rx + rw - 12, ry + rh); g.lineTo(rx, ry + rh); g.closePath();
    g.fillStyle = 'rgba(8,4,18,.92)'; g.fill();
    g.fillStyle = '#ff2e88'; g.fillRect(rx, ry, 6, rh);
    g.fillStyle = '#fff'; g.font = `bold ${Math.round(rh * .52)}px Anton, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(r.panel.role || 'THE DRIVER', rx + 12, ry + rh / 2 + 1);
    g.restore();
    /* selection outline: editor-only, and only after the user explicitly
       picks a panel — never on a fresh load / screenshot, never in clean/export renders */
    if (preview && i === state.selected && state.selTouched && !document.body.classList.contains('clean')) { g.save(); g.strokeStyle = '#19d3ff'; g.lineWidth = 3; g.setLineDash([10, 6]); g.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); g.restore(); }
  });
  /* press-quote bar on top */
  const qh = H * .042;
  g.fillStyle = 'rgba(8,4,18,.88)'; g.fillRect(0, 0, W, qh);
  g.fillStyle = '#ffc94d'; g.font = `bold ${Math.round(qh * .5)}px system-ui, sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText('★ ★ ★ ★ ★', W * .02, qh / 2 + 1);
  g.fillStyle = '#fff'; g.font = `italic ${Math.round(qh * .42)}px Georgia, serif`;
  g.fillText(state.quote, W * .02 + W * .13, qh / 2 + 1);
  /* VOL. 01 tab */
  g.save();
  g.fillStyle = '#ff2e88';
  g.beginPath(); g.moveTo(W * .86, qh); g.lineTo(W * .98, qh); g.lineTo(W * .98, qh + H * .028); g.lineTo(W * .86, qh + H * .028); g.closePath(); g.fill();
  g.fillStyle = '#fff'; g.font = `bold ${Math.round(H * .016)}px Anton, sans-serif`; g.textAlign = 'center';
  g.fillText('VOL. 01', W * .92, qh + H * .019);
  g.restore();
  /* chrome title in the lower third — subtitle sits BELOW it with a clear gap */
  const titleSize = Math.round(W * .105 * state.titleSize / 100);
  const titleTop = Math.round(H * state.titleY / 100);
  const titleBottom = drawChromeTitle(g, state.title.toUpperCase(), W / 2, titleTop, titleSize, W);
  const subGap = Math.round(H * .014);
  const subY = titleBottom + subGap;
  g.save();
  g.font = `${Math.round(W * .042)}px Pacifico, cursive`;
  g.textAlign = 'center'; g.textBaseline = 'top';
  g.shadowColor = '#ff2e88'; g.shadowBlur = Math.round(W * .02);
  g.fillStyle = '#ff9ecf'; g.fillText(state.sub, W / 2, subY);
  g.shadowBlur = 0; g.fillStyle = '#fff';
  g.fillText(state.sub, W / 2, subY);
  g.restore();
  const subBottom = subY + Math.round(W * .055);
  /* tagline pill just under the subtitle */
  const tagY = subBottom + Math.round(H * .012);
  g.save();
  g.font = `bold ${Math.round(W * .02)}px Anton, sans-serif`;
  const tw = g.measureText(state.tag).width + W * .05;
  g.fillStyle = 'rgba(8,4,18,.85)';
  g.beginPath(); g.roundRect((W - tw) / 2, tagY, tw, H * .032, H * .016); g.fill();
  g.fillStyle = '#ffc94d'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(state.tag, W / 2, tagY + H * .016);
  g.restore();
  /* billing block + second credits strip (busier lower third) */
  const billY = Math.round(H * .905), billH = Math.round(H * .05);
  g.fillStyle = 'rgba(8,4,18,.92)'; g.fillRect(0, billY, W, billH);
  g.fillStyle = '#fff'; g.font = `bold ${Math.round(W * .017)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(CAST.slice(0, 4).join('   ·   '), W / 2, billY + billH * .32);
  g.fillStyle = '#b9a8d8'; g.font = `${Math.round(W * .014)}px system-ui, sans-serif`;
  g.fillText('A SUNSET PICTURES PRODUCTION', W / 2, billY + billH * .74);
  const credY = billY + billH;
  g.fillStyle = '#12071f'; g.fillRect(0, credY, W, H - credY);
  g.fillStyle = '#8f7fb5'; g.font = `${Math.round(W * .0135)}px system-ui, sans-serif`; g.textAlign = 'center';
  g.fillText('STARRING YOU  ·  SHOT ON YOUR OWN CAMERA  ·  MUSIC BY THE NEON MILE  ·  © 2026 SUNSET PICTURES', W / 2, credY + (H - credY) / 2 + 1);
  /* starburst seal + barcode (barcode sits fully inside the billing strip) */
  if (state.seal) drawStarburst(g, W * .90, H * .83, Math.round(W * .055), 'seal');
  drawBarcode(g, W * .035, billY + 5, Math.round(W * .09), Math.max(14, billH - 26));
  /* grain + vignette */
  if (state.grain) {
    g.save(); g.globalAlpha = .07;
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = Math.random() > .5 ? '#fff' : '#000';
      g.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
    }
    g.restore();
  }
  if (state.vignette) {
    const vg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
}
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderTo(ctx, canvas.width, canvas.height, true);
  if (!document.body.classList.contains('clean')) drawAnchorMarkers();
}
/* face anchor markers on the preview canvas (DOM overlay via canvas drawing) */
function drawAnchorMarkers() {
  if (!state.faceOn) return;
  const rects = panelRects(canvas.width, canvas.height);
  const sx = canvas.clientWidth / canvas.width, sy = canvas.clientHeight / canvas.height;
  ctx.save();
  rects.forEach((r, i) => {
    const p = r.panel; if (!p || !p.anchor) return;
    const iw = p.img.naturalWidth, ih = p.img.naturalHeight;
    const scale = Math.max(r.w / iw, r.h / ih) * (p.zoom || 1.25);
    const dw = iw * scale, dh = ih * scale;
    const dx = r.x + (r.w - dw) / 2 + (0.5 - p.anchor.x) * dw * 0.9 + (p.ox || 0);
    const dy = r.y + (r.h - dh) / 2 + (0.5 - p.anchor.y) * dh * 0.9 + (p.oy || 0);
    const mx = dx + p.anchor.x * dw, my = dy + p.anchor.y * dh;
    ctx.strokeStyle = '#ff2e88'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(mx, my, 16, 0, 7); ctx.stroke();
    ctx.fillStyle = '#ff2e88'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('◎', mx, my - 26);
    if (i === state.selected && state.selTouched) { ctx.fillStyle = '#19d3ff'; ctx.font = 'bold 13px system-ui, sans-serif'; ctx.fillText(p.faceFound ? 'FACE LOCKED' : 'NO FACE — CENTRE', mx, my + 30); }
  });
  ctx.restore();
}

/* ---- export ---- */
function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
function exportSize(size, silent) {
  return new Promise(res => {
    const off = document.createElement('canvas');
    off.width = size.w; off.height = size.h;
    renderTo(off.getContext('2d'), size.w, size.h, false);
    off.toBlob(b => {
      if (b) downloadBlob(b, `neon-coast-${size.w}x${size.h}.png`);
      if (!silent) say(`Exported ${size.w}×${size.h} PNG`);
      res(!!b);
    }, 'image/png');
  });
}
function currentSize() {
  const [w, h] = state.exportSize.split('x').map(Number);
  return { w, h, label: state.exportSize };
}
async function exportAll() {
  say('Exporting 3 sizes…');
  for (const s of [SIZES[2], SIZES[1], SIZES[0]]) { await exportSize(s, true); await new Promise(r => setTimeout(r, 250)); }
  say('Exported 1920×1080, 1080×1350 and 1080×1080 PNGs');
}

/* ---- UI ---- */
function buildButtons() {
  const lay = $('layouts');
  LAYOUT_KEYS.forEach(k => {
    const b = document.createElement('button');
    b.textContent = LAYOUTS[k].label; b.dataset.k = k;
    b.onclick = () => { pushUndo(); state.layout = k; state.preset = ''; syncButtons(); render(); say(`Layout: ${LAYOUTS[k].label}`); };
    lay.appendChild(b);
  });
  const gr = $('grades');
  GRADE_KEYS.forEach(k => {
    const b = document.createElement('button');
    b.textContent = GRADES[k].label; b.dataset.k = k;
    b.onclick = () => { pushUndo(); state.grade = k; state.preset = ''; syncButtons(); render(); say(`Grade: ${GRADES[k].label}`); };
    gr.appendChild(b);
  });
  const pr = $('presets');
  PRESET_KEYS.forEach(k => {
    const b = document.createElement('button');
    b.textContent = PRESETS[k].label; b.dataset.k = k;
    b.onclick = () => applyPreset(k);
    pr.appendChild(b);
  });
  const sc = $('scenes');
  SCENES.forEach(s => {
    const b = document.createElement('button');
    b.className = 'scene'; b.innerHTML = `${s.label}<small>${s.sub}</small>`;
    b.onclick = () => applyScene(s);
    sc.appendChild(b);
  });
  const th = $('thumbs');
  PHOTOS.forEach((p, i) => {
    const f = document.createElement('figure');
    const im = document.createElement('img');
    im.src = p.file; im.alt = p.name; im.loading = 'lazy';
    im.onclick = async () => {
      pushUndo();
      state.panels[state.selected] = await makePanel(i, state.panels[state.selected].role);
      syncPanelBar(); render();
      say(`${p.name} loaded into panel ${state.selected + 1}${state.panels[state.selected].faceFound ? ' — face centred' : ' — no face, centre crop'}`);
    };
    const cap = document.createElement('figcaption'); cap.textContent = p.name;
    f.appendChild(im); f.appendChild(cap); th.appendChild(f);
  });
  const ps = $('panelSel');
  for (let i = 0; i < 9; i++) { const o = document.createElement('option'); o.value = i; o.textContent = `Panel ${i + 1}`; ps.appendChild(o); }
  const rs = $('roleSel');
  ROLES.forEach(r => { const o = document.createElement('option'); o.value = r; o.textContent = r; rs.appendChild(o); });
}
function syncButtons() {
  document.querySelectorAll('#layouts button').forEach(b => b.classList.toggle('active', b.dataset.k === state.layout));
  document.querySelectorAll('#grades button').forEach(b => b.classList.toggle('active', b.dataset.k === state.grade));
  document.querySelectorAll('#presets button').forEach(b => b.classList.toggle('active', b.dataset.k === state.preset));
  document.querySelectorAll('.sizechip').forEach(b => b.classList.toggle('on', b.dataset.size === state.exportSize));
}
function syncPanelBar() {
  const p = state.panels[state.selected];
  if (!p) return;
  $('panelSel').value = state.selected;
  $('roleSel').value = p.role;
  $('zoom').value = p.zoom || 1.25;
}
function syncInputs() {
  $('titleInput').value = state.title; $('subInput').value = state.sub; $('tagInput').value = state.tag;
  $('quoteInput').value = state.quote; $('titleSize').value = state.titleSize; $('titleY').value = state.titleY;
  $('titleSizeVal').textContent = state.titleSize + '%';
  $('titleYVal').textContent = state.titleY + '%';
  $('grain').checked = state.grain; $('vignette').checked = state.vignette; $('seal').checked = state.seal;
  syncButtons(); syncPanelBar();
}
async function applyPreset(k) {
  const p = PRESETS[k]; if (!p) return;
  pushUndo();
  state.preset = k; state.layout = p.layout; state.grade = p.grade;
  state.title = p.title; state.sub = p.sub; state.tag = p.tag;
  syncInputs(); render(); say(`Preset: ${p.label}`);
}
async function applyScene(s) {
  pushUndo();
  state.layout = s.layout; state.grade = s.grade; state.title = s.title; state.sub = s.title.toLowerCase();
  await loadDefaultPanels(s.photos);
  syncInputs(); syncPanelBar(); render();
  say(`Scene loaded: ${s.label}`);
}
function wire() {
  document.querySelectorAll('.sizechip').forEach(b => b.onclick = () => { state.exportSize = b.dataset.size; syncButtons(); say(`Export size ${b.dataset.size}`); });
  $('exportBtn').onclick = () => exportSize(currentSize());
  $('exportAllBtn').onclick = exportAll;
  $('undoBtn').onclick = undo; $('redoBtn').onclick = redo;
  $('surpriseBtn').onclick = () => {
    pushUndo();
    state.layout = LAYOUT_KEYS[Math.floor(Math.random() * LAYOUT_KEYS.length)];
    state.grade = GRADE_KEYS[Math.floor(Math.random() * GRADE_KEYS.length)];
    const p = PRESET_KEYS[Math.floor(Math.random() * PRESET_KEYS.length)];
    state.preset = p; state.title = PRESETS[p].title; state.sub = PRESETS[p].sub;
    syncInputs(); render(); say(`Surprise: ${PRESETS[p].label} + ${LAYOUTS[state.layout].label}`);
  };
  const recentre = async () => {
    const p = state.panels[state.selected];
    if (!p || !p.img) return;
    const a = detectFaceAnchor(p.img);
    pushUndo();
    if (a) { p.anchor = a; p.faceFound = true; say('Face found — crop re-centred on the face'); }
    else { p.anchor = { x: .5, y: .42 }; p.faceFound = false; say('No face found — centre crop'); }
    render();
  };
  $('recentreBtn').onclick = recentre; $('faceBtn').onclick = recentre;
  $('panelSel').onchange = e => { state.selected = +e.target.value; state.selTouched = true; syncPanelBar(); render(); };
  $('roleSel').onchange = e => { pushUndo(); state.panels[state.selected].role = e.target.value; render(); };
  $('zoom').oninput = e => { state.panels[state.selected].zoom = +e.target.value; render(); };
  $('zoom').onchange = () => pushUndo();
  $('swapBtn').onclick = async () => {
    pushUndo();
    const cur = state.panels[state.selected];
    const next = (PHOTOS.findIndex(p => p.file === cur.file) + 1) % PHOTOS.length;
    state.panels[state.selected] = await makePanel(next, cur.role);
    syncPanelBar(); render(); say('Photo swapped');
  };
  $('titleInput').oninput = e => { state.title = e.target.value.toUpperCase() || 'UNTITLED'; render(); };
  $('titleInput').onchange = () => pushUndo();
  $('subInput').oninput = e => { state.sub = e.target.value; render(); };
  $('subInput').onchange = () => pushUndo();
  $('tagInput').oninput = e => { state.tag = e.target.value.toUpperCase(); render(); };
  $('quoteInput').oninput = e => { state.quote = e.target.value; render(); };
  $('titleSize').oninput = e => { state.titleSize = +e.target.value; $('titleSizeVal').textContent = state.titleSize + '%'; render(); };
  $('titleY').oninput = e => { state.titleY = +e.target.value; $('titleYVal').textContent = state.titleY + '%'; render(); };
  $('grain').onchange = e => { state.grain = e.target.checked; render(); };
  $('vignette').onchange = e => { state.vignette = e.target.checked; render(); };
  $('seal').onchange = e => { state.seal = e.target.checked; render(); };
  $('savePresetBtn').onclick = () => { localStorage.setItem('neoncoast-look', snapshot()); say('Look saved in this browser'); };
  $('loadPresetBtn').onclick = () => { const s = localStorage.getItem('neoncoast-look'); if (s) { pushUndo(); restore(s); say('Saved look loaded'); } else say('No saved look yet'); };
  $('upload').onchange = async e => {
    const files = [...e.target.files]; if (!files.length) return;
    pushUndo();
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const img = await loadImage(url).catch(() => null);
      if (!img) continue;
      const anchor = detectFaceAnchor(img);
      state.panels[state.selected] = { file: url, name: f.name, role: state.panels[state.selected].role, img, zoom: 1.25, ox: 0, oy: 0, anchor: anchor || { x: .5, y: .42 }, faceFound: !!anchor };
      state.selected = (state.selected + 1) % 9;
    }
    syncPanelBar(); render();
    say(`${files.length} photo(s) loaded — ${state.panels.some(p => p.faceFound) ? 'face centred' : 'centre crop'}`);
  };
  /* drag: marker moves the anchor, elsewhere pans the photo */
  let drag = null;
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
  }
  function anchorPos(r, p) {
    const iw = p.img.naturalWidth, ih = p.img.naturalHeight;
    const scale = Math.max(r.w / iw, r.h / ih) * (p.zoom || 1.25);
    const dw = iw * scale, dh = ih * scale;
    const dx = r.x + (r.w - dw) / 2 + (0.5 - p.anchor.x) * dw * 0.9 + (p.ox || 0);
    const dy = r.y + (r.h - dh) / 2 + (0.5 - p.anchor.y) * dh * 0.9 + (p.oy || 0);
    return { x: dx + p.anchor.x * dw, y: dy + p.anchor.y * dh, dw, dh };
  }
  canvas.addEventListener('pointerdown', e => {
    const pt = toCanvas(e);
    const rects = panelRects(canvas.width, canvas.height);
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i], p = r.panel;
      if (!p || !p.img) continue;
      const ap = anchorPos(r, p);
      if (Math.hypot(pt.x - ap.x, pt.y - ap.y) < 34) { state.selected = i; state.selTouched = true; drag = { kind: 'anchor', i, x: pt.x, y: pt.y }; canvas.setPointerCapture(e.pointerId); syncPanelBar(); render(); return; }
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) {
        state.selected = i; state.selTouched = true; drag = { kind: 'pan', i, x: pt.x, y: pt.y, ox: p.ox || 0, oy: p.oy || 0 };
        canvas.setPointerCapture(e.pointerId); syncPanelBar(); render(); return;
      }
    }
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const pt = toCanvas(e);
    const rects = panelRects(canvas.width, canvas.height);
    const r = rects[drag.i], p = r.panel;
    if (drag.kind === 'anchor') {
      const ap = anchorPos(r, p);
      p.anchor = { x: Math.min(.95, Math.max(.05, (pt.x - (ap.x - p.anchor.x * ap.dw)) / ap.dw)), y: Math.min(.95, Math.max(.05, (pt.y - (ap.y - p.anchor.y * ap.dh)) / ap.dh)) };
      p.faceFound = true;
    } else {
      p.ox = drag.ox + (pt.x - drag.x); p.oy = drag.oy + (pt.y - drag.y);
    }
    render();
  });
  canvas.addEventListener('pointerup', () => { if (drag) { pushUndo(); drag = null; } });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  });
}

/* ---- boot ---- */
async function boot() {
  buildButtons(); wire();
  const q = new URLSearchParams(location.search);
  if (q.get('clean') === '1') document.body.classList.add('clean');
  if (q.get('layout') && LAYOUTS[q.get('layout')]) state.layout = q.get('layout');
  if (q.get('grade') && GRADES[q.get('grade')]) state.grade = q.get('grade');
  if (q.get('title')) { state.title = q.get('title').toUpperCase(); state.sub = q.get('title').toLowerCase(); }
  if (q.get('shot') === 'facecrop') { state.selected = 0; state.layout = 'heroThree'; }
  if (q.get('shot') === 'export') { state.layout = 'comic'; state.grade = 'sunset'; }
  if (q.get('shot') === 'variant') { state.layout = 'nineGrid'; state.grade = 'chromenight'; state.title = 'SKYLINE'; state.sub = 'skyline'; }
  /* shot mode: deselect — no selection outline on any panel in screenshots
     (face anchor markers still draw in shot 2 via drawAnchorMarkers) */
  if (q.get('shot')) state.selected = -1;
  const scene = q.get('scene');
  const photos = scene ? (SCENES.find(s => s.label.toLowerCase().replace(/\s/g, '') === scene) || {}).photos
    : (q.get('shot') === 'export' ? [2, 0, 5] : null);
  await loadDefaultPanels(photos);
  if (q.get('shot') === 'facecrop') {
    /* hero portrait in the big panel so the face anchor is unmistakable */
    state.panels[0] = await makePanel(0, state.panels[0].role);
  }
  /* export-size canvas matches the chosen preset ratio for clean shots */
  if (q.get('clean') === '1' && q.get('w') && q.get('h')) { canvas.width = +q.get('w'); canvas.height = +q.get('h'); }
  syncInputs(); syncPanelBar(); render();
  say('Ready — real photos loaded, face-aware crop on.');
}
boot();
