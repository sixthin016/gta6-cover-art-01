/* Neon Coast — GTA 6 style cover studio. All code written for this entry.
   Offline, single file, no network. Photos are read on the user's machine. */
"use strict";

/* ---------- bundled real photos (first paint is photographic, never procedural) ---------- */
const PHOTOS = [
  { id: "couple",     src: "samples/couple.jpg",     label: "Duo · boulevard" },
  { id: "portrait",   src: "samples/portrait.jpg",   label: "Lead portrait" },
  { id: "neonstreet", src: "samples/neonstreet.jpg", label: "Neon street" },
  { id: "sportscar",  src: "samples/sportscar.jpg",  label: "Sports car" },
  { id: "palmbeach",  src: "samples/palmbeach.jpg",  label: "Palm beach" },
  { id: "speedboat",  src: "samples/speedboat.jpg",  label: "Speedboat" },
  { id: "pier",       src: "samples/pier.jpg",       label: "Pier at dusk" },
  { id: "boulevard",  src: "samples/boulevard.jpg",  label: "Boulevard" },
];
const photoById = Object.fromEntries(PHOTOS.map(p => [p.id, p]));

/* ---------- layouts: 9, slots in fractions of the cover ---------- */
const ROLES = ["THE DRIVER", "THE INSIDER", "THE COURIER", "THE GETAWAY", "THE LOOKOUT", "THE FIXER", "THE HEIRESS", "THE MECHANIC", "THE RUNNER"];
const LAYOUTS = [
  { id: "heroThree", name: "Hero + three", slots: [
    { x: .012, y: .052, w: .608, h: .868, rot: 0, role: 0 },
    { x: .632, y: .052, w: .356, h: .283, rot: 0, role: 1 },
    { x: .632, y: .343, w: .356, h: .283, rot: 0, role: 2 },
    { x: .632, y: .634, w: .356, h: .286, rot: 0, role: 3 } ] },
  { id: "grid4", name: "Four-panel grid", slots: [
    { x: .012, y: .052, w: .482, h: .428, rot: 0, role: 0 },
    { x: .506, y: .052, w: .482, h: .428, rot: 0, role: 1 },
    { x: .012, y: .492, w: .482, h: .428, rot: 0, role: 2 },
    { x: .506, y: .492, w: .482, h: .428, rot: 0, role: 3 } ] },
  { id: "fullBleed", name: "Full-bleed single", slots: [
    { x: 0, y: .045, w: 1, h: .875, rot: 0, role: 0 } ] },
  { id: "nineGrid", name: "Nine-panel cover", slots: [
    { x: .012, y: .052, w: .318, h: .283, rot: 0, role: 0 },
    { x: .341, y: .052, w: .318, h: .283, rot: 0, role: 1 },
    { x: .670, y: .052, w: .318, h: .283, rot: 0, role: 2 },
    { x: .012, y: .343, w: .318, h: .283, rot: 0, role: 3 },
    { x: .341, y: .343, w: .318, h: .283, rot: 0, role: 4 },
    { x: .670, y: .343, w: .318, h: .283, rot: 0, role: 5 },
    { x: .012, y: .634, w: .318, h: .286, rot: 0, role: 6 },
    { x: .341, y: .634, w: .318, h: .286, rot: 0, role: 7 },
    { x: .670, y: .634, w: .318, h: .286, rot: 0, role: 8 } ] },
  { id: "slanted", name: "Slanted comic", slots: [
    { x: .020, y: .060, w: .470, h: .520, rot: -3, role: 0 },
    { x: .510, y: .055, w: .470, h: .520, rot: 2.5, role: 1 },
    { x: .030, y: .600, w: .600, h: .320, rot: -2, role: 2 },
    { x: .660, y: .600, w: .320, h: .320, rot: 3, role: 3 } ] },
  { id: "collage22", name: "2×2 grid-collage", slots: [
    { x: .012, y: .052, w: .976, h: .420, rot: 0, role: 0 },
    { x: .012, y: .484, w: .482, h: .436, rot: 0, role: 1 },
    { x: .506, y: .484, w: .482, h: .436, rot: 0, role: 2 } ] },
  { id: "split3", name: "3-panel split", slots: [
    { x: .012, y: .052, w: .318, h: .868, rot: 0, role: 0 },
    { x: .341, y: .052, w: .318, h: .868, rot: 0, role: 1 },
    { x: .670, y: .052, w: .318, h: .868, rot: 0, role: 2 } ] },
  { id: "diagonal", name: "Diagonal hero", slots: [
    { x: -.06, y: .030, w: .760, h: .700, rot: -4, role: 0 },
    { x: .640, y: .560, w: .348, h: .360, rot: 3, role: 1 },
    { x: .300, y: .740, w: .330, h: .180, rot: -2, role: 2 } ] },
  { id: "posterBand", name: "Poster band", slots: [
    { x: .012, y: .052, w: .976, h: .480, rot: 0, role: 0 },
    { x: .012, y: .544, w: .318, h: .376, rot: 0, role: 1 },
    { x: .341, y: .544, w: .318, h: .376, rot: 0, role: 2 },
    { x: .670, y: .544, w: .318, h: .376, rot: 0, role: 3 } ] },
];
const layoutById = Object.fromEntries(LAYOUTS.map(l => [l.id, l]));

/* ---------- grades: 7 neon gradient-map looks ---------- */
const GRADES = [
  { id: "sunset",    name: "Vice City sunset", top: "#ff9a1f", bot: "#c026d3", sw: "linear-gradient(135deg,#ff9a1f,#c026d3)" },
  { id: "duotone",   name: "Electric duotone", top: "#22d3ee", bot: "#ff2e88", sw: "linear-gradient(135deg,#22d3ee,#ff2e88)" },
  { id: "magcyan",   name: "Magenta / cyan",   top: "#ff00a8", bot: "#00e5ff", sw: "linear-gradient(135deg,#ff00a8,#00e5ff)" },
  { id: "heat",      name: "Heat",             top: "#ffd23c", bot: "#ff2e2e", sw: "linear-gradient(135deg,#ffd23c,#ff2e2e)" },
  { id: "palmdusk",  name: "Palm dusk",        top: "#7c3aed", bot: "#f97316", sw: "linear-gradient(135deg,#7c3aed,#f97316)" },
  { id: "chrome",    name: "Chrome night",     top: "#a5c8ff", bot: "#0ea5e9", sw: "linear-gradient(135deg,#a5c8ff,#0ea5e9)" },
  { id: "halftone",  name: "Halftone ink",     top: "#f5f0ff", bot: "#1a1030", sw: "linear-gradient(135deg,#f5f0ff,#1a1030)" },
];
const gradeById = Object.fromEntries(GRADES.map(g => [g.id, g]));

/* ---------- presets: 6 one-click looks (layout + grade + lettering) ---------- */
const PRESETS = [
  { id: "neoncoast", name: "Neon Coast",   layout: "heroThree", grade: "duotone",  title: "NEON COAST",    subtitle: "vice city nights" },
  { id: "sunset",    name: "Sunset Sleeve", layout: "slanted",  grade: "sunset",   title: "SUNSET SLEEVE", subtitle: "golden hour run" },
  { id: "palm",      name: "Palm Poster",  layout: "nineGrid",  grade: "palmdusk", title: "PALM POSTER",   subtitle: "salt air & neon" },
  { id: "heat",      name: "Heat Wave",    layout: "diagonal",  grade: "heat",     title: "HEAT WAVE",     subtitle: "too fast to catch" },
  { id: "chrome",    name: "Chrome Night", layout: "fullBleed", grade: "chrome",   title: "CHROME NIGHT",  subtitle: "midnight overdrive" },
  { id: "halftone",  name: "Halftone Press", layout: "grid4",   grade: "halftone", title: "HALFTONE PRESS", subtitle: "ink & thunder" },
];
const presetById = Object.fromEntries(PRESETS.map(p => [p.id, p]));

/* ---------- demo scenes: 9 one-click scene loads ---------- */
const SCENES = [
  { id: "nightcity", name: "🌃 Night city",      preset: "neoncoast", photos: ["neonstreet", "couple", "portrait", "sportscar"] },
  { id: "highway",   name: "🛣️ Highway chase",  preset: "heat",      photos: ["sportscar", "boulevard", "couple", "neonstreet"] },
  { id: "club",      name: "🪩 Club interior",   preset: "neoncoast", photos: ["neonstreet", "portrait", "couple", "palmbeach"] },
  { id: "beach",     name: "🏖️ Beach boulevard", preset: "palm",     photos: ["palmbeach", "couple", "speedboat", "pier"] },
  { id: "rooftop",   name: "🌇 Rooftop dusk",    preset: "sunset",    photos: ["portrait", "pier", "neonstreet", "couple"] },
  { id: "palmstreet",name: "🌴 Palm street",     preset: "palm",      photos: ["palmbeach", "boulevard", "couple", "portrait"] },
  { id: "convert",   name: "🚗 Convertible",     preset: "chrome",    photos: ["sportscar", "couple", "palmbeach", "neonstreet"] },
  { id: "skyline",   name: "🌆 Skyline",         preset: "chrome",    photos: ["pier", "neonstreet", "portrait", "couple"] },
  { id: "boardwalk", name: "🎡 Boardwalk",       preset: "halftone",  photos: ["pier", "palmbeach", "speedboat", "couple"] },
];
const sceneById = Object.fromEntries(SCENES.map(s => [s.id, s]));

/* ---------- export sizes: 6, the first three are the one-click set ---------- */
const SIZES = [
  { id: "1350", label: "1080 × 1350 · portrait", w: 1080, h: 1350 },
  { id: "square", label: "1080 × 1080 · square", w: 1080, h: 1080 },
  { id: "wide", label: "1920 × 1080 · wide", w: 1920, h: 1080 },
  { id: "story", label: "1080 × 1920 · story", w: 1080, h: 1920 },
  { id: "social", label: "1200 × 630 · social", w: 1200, h: 630 },
  { id: "poster", label: "2048 × 1080 · poster", w: 2048, h: 1080 },
];
const sizeById = Object.fromEntries(SIZES.map(s => [s.id, s]));
const QUICK_SIZES = ["wide", "1350", "square"]; // the Export All 3 Sizes set

/* ---------- state ---------- */
function defaultPanels() {
  const order = ["couple", "neonstreet", "portrait", "sportscar", "palmbeach", "speedboat", "pier", "boulevard", "couple"];
  return order.map((pid, i) => ({ photo: pid, zoom: 1, ox: 0.5, oy: 0.5, anchor: null, anchorFound: false }));
}
const state = {
  layout: "heroThree", grade: "duotone", preset: "neoncoast",
  title: "NEON COAST", subtitle: "vice city nights",
  tagline: "TWO LIVES. ONE SUNSET.",
  titleSize: 110, titleY: 62,
  size: "1350", selected: 0,
  grain: true, vignette: true,
  quote: true, ribbons: true, seal: true, billing: true, barcode: true,
  panels: defaultPanels(),
};
let selectedPhoto = "couple";

/* ---------- image cache ---------- */
const imgCache = new Map();
function loadImage(src) {
  if (imgCache.has(src)) return imgCache.get(src);
  const p = new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("cannot load " + src));
    im.src = src;
  });
  imgCache.set(src, p);
  return p;
}
function photoSrc(panel) {
  if (!panel || !panel.photo) return null;
  if (panel.photo.startsWith("data:")) return panel.photo;
  const p = photoById[panel.photo];
  return p ? p.src : null;
}

/* ---------- face-aware crop: pure-canvas skin-cluster detection, fully offline ----------
   Downscale, score skin-tone pixels, slide a face-sized window over the mask and take
   the densest window; the anchor is its centre, nudged up toward the eyes. */
function detectFace(img) {
  const W = 96, H = Math.max(24, Math.round(96 * img.naturalHeight / img.naturalWidth));
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const skin = new Uint8Array(W * H);
  let skinTotal = 0;
  for (let i = 0; i < W * H; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    const ok = r > 70 && r > g + 12 && g >= b - 4 && r - b > 16 && r < 252 && g > 38;
    skin[i] = ok ? 1 : 0;
    skinTotal += ok ? 1 : 0;
  }
  if (skinTotal < W * H * 0.012) return { x: 0.5, y: 0.42, found: false };
  const ww = Math.max(14, Math.round(W * 0.42)), wh = Math.max(12, Math.round(H * 0.34));
  let best = null;
  for (let wy = 0; wy + wh <= H; wy += 3) {
    for (let wx = 0; wx + ww <= W; wx += 3) {
      let s = 0;
      for (let yy = wy; yy < wy + wh; yy += 2)
        for (let xx = wx; xx < wx + ww; xx += 2) s += skin[yy * W + xx];
      const density = s / ((ww / 2) * (wh / 2));
      const cy = (wy + wh / 2) / H;
      const score = density * (1 - Math.abs(cy - 0.38) * 0.55); // faces live in the upper half
      if (!best || score > best.score) best = { score, density, cx: (wx + ww / 2) / W, cy };
    }
  }
  if (!best || best.density < 0.22) return { x: 0.5, y: 0.42, found: false };
  return { x: Math.min(0.85, Math.max(0.15, best.cx)), y: Math.min(0.8, Math.max(0.12, best.cy - 0.05)), found: true };
}

async function applyFaceToPanel(i) {
  const panel = state.panels[i];
  const src = photoSrc(panel);
  if (!src) return;
  try {
    const img = await loadImage(src);
    const f = detectFace(img);
    panel.anchor = { x: f.x, y: f.y };
    panel.anchorFound = f.found;
    if (f.found) { panel.ox = f.x; panel.oy = f.y; }
    window.__faceReport = window.__faceReport || {};
    window.__faceReport[panel.photo] = { found: f.found, x: +f.x.toFixed(3), y: +f.y.toFixed(3) };
  } catch (e) { panel.anchorFound = false; }
}
async function detectAllDefaultFaces() {
  for (let i = 0; i < state.panels.length; i++) await applyFaceToPanel(i);
}

/* ---------- cover rendering ---------- */
function slotRect(slot, W, H) {
  return { x: slot.x * W, y: slot.y * H, w: slot.w * W, h: slot.h * H, rot: slot.rot || 0 };
}
/* cover-fit transform for a panel: scale so the photo covers the rect, centred on (ox,oy) */
function coverTransform(img, rect, panel) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * (panel.zoom || 1);
  const dw = iw * scale, dh = ih * scale;
  const ox = panel.ox == null ? 0.5 : panel.ox, oy = panel.oy == null ? 0.5 : panel.oy;
  let dx = rect.x + (rect.w - dw) / 2 - (ox - 0.5) * (dw - rect.w);
  let dy = rect.y + (rect.h - dh) / 2 - (oy - 0.5) * (dh - rect.h);
  dx = Math.min(rect.x, Math.max(rect.x + rect.w - dw, dx));
  dy = Math.min(rect.y, Math.max(rect.y + rect.h - dh, dy));
  return { dx, dy, dw, dh, scale };
}
function drawPhotoInRect(ctx, img, rect, panel) {
  const t = coverTransform(img, rect, panel);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, t.dx, t.dy, t.dw, t.dh);
  ctx.restore();
  return t;
}
function star(ctx, cx, cy, r, points, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
function sparkle(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r); ctx.quadraticCurveTo(cx, cy, cx + r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + r); ctx.quadraticCurveTo(cx, cy, cx - r, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  ctx.fill(); ctx.restore();
}
function drawChromeTitle(ctx, text, cx, y, size, W) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(-2.5 * Math.PI / 180);
  ctx.font = size + "px Anton, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const tw = ctx.measureText(text).width;
  const scale = Math.min(1, (W * 0.94) / tw);
  ctx.scale(scale, scale);
  const grad = ctx.createLinearGradient(0, -size * 0.82, 0, size * 0.18);
  grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.28, "#ffe45e");
  grad.addColorStop(0.52, "#ff7a1a"); grad.addColorStop(0.76, "#ff2e88");
  grad.addColorStop(1, "#8b1fd8");
  // dark-magenta 3D extrusion, down-right
  ctx.fillStyle = "#5e0a44";
  for (let k = 5; k >= 1; k--) ctx.fillText(text, k * size * 0.035, k * size * 0.045);
  // sharp white keyline
  ctx.lineWidth = size * 0.085; ctx.strokeStyle = "#ffffff";
  ctx.lineJoin = "round"; ctx.strokeText(text, 0, 0);
  // striped sunset fill, per glyph so the stripes stay vertical
  let x = -ctx.measureText(text).width / 2;
  ctx.textAlign = "left";
  for (const ch of text) {
    const cw = ctx.measureText(ch).width;
    const g = ctx.createLinearGradient(0, -size * 0.82, 0, size * 0.18);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.28, "#ffe45e");
    g.addColorStop(0.52, "#ff7a1a"); g.addColorStop(0.76, "#ff2e88"); g.addColorStop(1, "#8b1fd8");
    ctx.fillStyle = g;
    ctx.fillText(ch, x, 0);
    x += cw;
  }
  // sparkles on the title
  sparkle(ctx, -tw * 0.42, -size * 0.75, size * 0.10, "#ffffff");
  sparkle(ctx, tw * 0.30, -size * 0.95, size * 0.08, "#ffe45e");
  sparkle(ctx, tw * 0.46, size * 0.02, size * 0.07, "#22d3ee");
  ctx.restore();
  return tw * scale;
}
function drawRibbon(ctx, x, y, w, h, text, accent) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(8, 0); ctx.lineTo(w, 0); ctx.lineTo(w - 8, h); ctx.lineTo(0, h); ctx.closePath();
  ctx.fillStyle = "rgba(8,4,16,0.92)"; ctx.fill();
  ctx.fillStyle = accent; ctx.fillRect(0, 0, 5, h);
  ctx.fillStyle = "#fff";
  ctx.font = Math.round(h * 0.52) + "px Anton, sans-serif";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(text, 12, h / 2 + 1);
  ctx.restore();
}
function drawStarburst(ctx, cx, cy, r, lines) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const n = 16;
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n;
    const rr = i % 2 === 0 ? r : r * 0.82;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#ffc93c"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = "#7a4d00"; ctx.stroke();
  ctx.fillStyle = "#241100";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = Math.round(r * 0.30) + "px Anton, sans-serif";
  lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * r * 0.34));
  ctx.restore();
}
function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.fillRect(x - 4, y - 4, w + 8, h + 22);
  ctx.fillStyle = "#111";
  let bx = x, seed = 7;
  while (bx < x + w - 3) {
    seed = (seed * 16807) % 2147483647;
    const bw = 1 + (seed % 4);
    if (seed % 3 !== 0) ctx.fillRect(bx, y, bw, h);
    bx += bw + 1 + (seed % 3);
  }
  ctx.font = Math.round(h * 0.28) + "px monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText("8 501337 202611", x, y + h + 3);
  ctx.restore();
}

async function renderCover(ctx, W, H, opts) {
  const st = opts.state;
  const layout = layoutById[st.layout] || LAYOUTS[0];
  const grade = gradeById[st.grade] || GRADES[0];
  // backdrop: deep neon night
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1b0b33"); bg.addColorStop(0.55, "#12071f"); bg.addColorStop(1, "#07030d");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // sunset glow band behind the panels
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 10, W * 0.5, H * 0.42, W * 0.75);
  glow.addColorStop(0, "rgba(255,122,26,0.28)"); glow.addColorStop(0.6, "rgba(255,46,136,0.12)"); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // panels
  const loaded = [];
  for (let i = 0; i < layout.slots.length; i++) {
    const panel = st.panels[i];
    const src = photoSrc(panel);
    loaded.push(src ? loadImage(src).catch(() => null) : Promise.resolve(null));
  }
  const imgs = await Promise.all(loaded);
  const u = W / 1080; // unit scale
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i];
    const rect = slotRect(slot, W, H);
    const panel = st.panels[i];
    ctx.save();
    if (slot.rot) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(slot.rot * Math.PI / 180);
      ctx.translate(-rect.w / 2, -rect.h / 2);
      rect.x = 0; rect.y = 0;
    }
    const img = imgs[i];
    if (img) drawPhotoInRect(ctx, img, rect, panel);
    else { ctx.fillStyle = "#2a1445"; ctx.fillRect(rect.x, rect.y, rect.w, rect.h); }
    // cream-gold keyline + inner shade
    ctx.strokeStyle = "rgba(255,240,200,0.9)"; ctx.lineWidth = Math.max(2, 3 * u);
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = Math.max(6, 10 * u);
    ctx.strokeRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6);
    // role-tag ribbon
    if (st.ribbons) {
      const rw = Math.min(rect.w * 0.72, (ROLES[slot.role].length * 11 + 26) * u);
      drawRibbon(ctx, rect.x + 8 * u, rect.y + rect.h - 34 * u, rw, 26 * u, ROLES[slot.role], i % 2 ? "#22d3ee" : "#ff2e88");
    }
    ctx.restore();
  }

  // grade: neon gradient-map wash over the whole cover
  ctx.save();
  const ggrad = ctx.createLinearGradient(0, 0, W * 0.25, H);
  ggrad.addColorStop(0, grade.top); ggrad.addColorStop(1, grade.bot);
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = grade.id === "halftone" ? 0.28 : 0.5;
  ctx.fillStyle = ggrad; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "soft-light";
  ctx.globalAlpha = 0.5;
  const pink = ctx.createRadialGradient(W * 0.5, H * 0.9, 10, W * 0.5, H * 0.9, W * 0.8);
  pink.addColorStop(0, "rgba(255,46,136,0.9)"); pink.addColorStop(1, "rgba(255,46,136,0)");
  ctx.fillStyle = pink; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (grade.id === "halftone") {
    ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = "#000";
    const step = Math.max(5, 7 * u);
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      if (((x / step) | 0) % 2 === 0 && ((y / step) | 0) % 2 === 0) ctx.fillRect(x, y, step * 0.5, step * 0.5);
    }
    ctx.restore();
  }

  // press-quote bar on top
  if (st.quote) {
    ctx.save();
    ctx.fillStyle = "rgba(8,4,16,0.94)";
    ctx.fillRect(0, 0, W, H * 0.045);
    ctx.fillStyle = "#ffc93c";
    ctx.font = Math.round(H * 0.02) + "px Anton, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const q = "★★★★★  “THE COVER EVERYONE WILL BE POSTING” — SUNSET PRESS";
    ctx.fillText(q, W / 2, H * 0.024);
    ctx.restore();
  }
  // VOL. 01 tab
  ctx.save();
  ctx.fillStyle = "#ff2e88";
  ctx.beginPath();
  ctx.moveTo(W * 0.86, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H * 0.042); ctx.lineTo(W * 0.86, H * 0.042);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = Math.round(H * 0.02) + "px Anton, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("VOL. 01", W * 0.93, H * 0.022);
  ctx.restore();

  // tagline pill + chrome title + neon subtitle + heat meter
  const titleSize = st.titleSize * u * (W / 1080) * 1.0;
  const titleY = (st.titleY / 100) * H * 0.92 + H * 0.06;
  ctx.save();
  const pill = st.tagline || "";
  if (pill) {
    ctx.font = Math.round(20 * u) + "px Anton, sans-serif";
    const pw = ctx.measureText(pill).width + 36 * u;
    ctx.fillStyle = "rgba(8,4,16,0.85)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - pw / 2, titleY - titleSize * 1.28, pw, 34 * u, 17 * u);
    ctx.fill();
    ctx.strokeStyle = "#ffc93c"; ctx.lineWidth = 2 * u; ctx.stroke();
    ctx.fillStyle = "#ffe45e"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(pill, W / 2, titleY - titleSize * 1.28 + 17 * u);
  }
  ctx.restore();
  drawChromeTitle(ctx, st.title || "NEON COAST", W / 2, titleY, titleSize, W);
  // neon script subtitle
  ctx.save();
  ctx.font = Math.round(titleSize * 0.30) + "px Pacifico, cursive";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.shadowColor = "#ff2e88"; ctx.shadowBlur = 18 * u;
  ctx.fillStyle = "#ffd7ea";
  ctx.fillText(st.subtitle || "", W / 2, titleY + titleSize * 0.24);
  ctx.restore();
  // heat meter of stars under the subtitle
  ctx.save();
  const hy = titleY + titleSize * 0.84;
  for (let i = 0; i < 5; i++) star(ctx, W / 2 + (i - 2) * 34 * u, hy, 12 * u, 5, i < 4 ? "#ffc93c" : "rgba(255,255,255,0.25)");
  ctx.fillStyle = "#fff"; ctx.font = Math.round(16 * u) + "px Anton, sans-serif";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("HEAT 4.5", W / 2 + 100 * u, hy);
  ctx.restore();

  // starburst seal
  if (st.seal) drawStarburst(ctx, W * 0.885, H * 0.845, 62 * u, ["ORIGINAL", "COVER ART"]);
  // billing block + second credits strip (busy lower third)
  if (st.billing) {
    ctx.save();
    ctx.fillStyle = "rgba(5,2,10,0.96)";
    ctx.fillRect(0, H * 0.92, W, H * 0.08);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = Math.round(15 * u) + "px Anton, sans-serif";
    ctx.fillText("SUNSET PICTURES  ·  STARRING YOU  ·  A LEONIDA STORY", W / 2, H * 0.938);
    ctx.font = Math.round(13 * u) + "px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillText("LUCIA  ·  JASON  ·  THE CREW  —  “A SUNSET PICTURES PRODUCTION · STARRING YOU · SHOT ON YOUR OWN CAMERA”", W / 2, H * 0.968);
    ctx.restore();
    if (st.barcode) drawBarcode(ctx, 18 * u, H * 0.928, 110 * u, 26 * u);
  }

  // grain + vignette
  if (st.grain) {
    ctx.save(); ctx.globalAlpha = 0.07;
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#000";
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.4 * u, 1.4 * u);
    }
    ctx.restore();
  }
  if (st.vignette) {
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
}

/* ---------- face-crop demo view (screenshot 2): original + anchor vs cropped panel ---------- */
async function renderFaceCropDemo(ctx, W, H) {
  ctx.fillStyle = "#0b0714"; ctx.fillRect(0, 0, W, H);
  const img = await loadImage("samples/portrait.jpg").catch(() => null);
  if (!img) return;
  const f = detectFace(img);
  const gap = 24, half = (W - gap * 3) / 2, top = 90, ph = H - 190;
  // left: original with face box + anchor
  ctx.save();
  ctx.fillStyle = "#1a0f2e"; ctx.fillRect(gap, top, half, ph);
  const s = Math.min(half / img.naturalWidth, ph / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  const dx = gap + (half - dw) / 2, dy = top + (ph - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  const ax = dx + f.x * dw, ay = dy + f.y * dh;
  ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 3;
  ctx.strokeRect(ax - dw * 0.22, ay - dh * 0.20, dw * 0.44, dh * 0.40);
  ctx.fillStyle = "#22d3ee";
  ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "700 22px sans-serif"; ctx.textAlign = "left";
  ctx.fillText(f.found ? "FACE FOUND — anchor locked on the face" : "NO FACE — centre crop fallback", gap, top - 18);
  ctx.restore();
  // right: the same photo cropped around the anchor, as the panel shows it
  const rx = gap * 2 + half;
  ctx.save();
  ctx.fillStyle = "#1a0f2e"; ctx.fillRect(rx, top, half, ph);
  ctx.beginPath(); ctx.rect(rx, top, half, ph); ctx.clip();
  const panel = { photo: "portrait", zoom: 1.35, ox: f.x, oy: f.y, anchor: { x: f.x, y: f.y }, anchorFound: f.found };
  drawPhotoInRect(ctx, img, { x: rx, y: top, w: half, h: ph }, panel);
  ctx.restore();
  ctx.strokeStyle = "rgba(255,240,200,0.9)"; ctx.lineWidth = 3;
  ctx.strokeRect(rx, top, half, ph);
  ctx.fillStyle = "#fff"; ctx.font = "700 22px sans-serif"; ctx.textAlign = "left";
  ctx.fillText("PANEL CROP — centred on the face anchor", rx, top - 18);
  ctx.fillStyle = "#ffc93c"; ctx.font = "700 28px Anton, sans-serif"; ctx.textAlign = "center";
  ctx.fillText("FACE-AWARE CROP", W / 2, 38);
  ctx.fillStyle = "#b9a6d6"; ctx.font = "16px sans-serif";
  ctx.fillText("Drag the anchor to nudge the crop · “Re-centre on face” re-runs detection · falls back to centre crop when no face is found", W / 2, H - 42);
  window.__faceReport = window.__faceReport || {};
  window.__faceReport.portrait = { found: f.found, x: +f.x.toFixed(3), y: +f.y.toFixed(3) };
}

/* ---------- studio UI ---------- */
const $ = id => document.getElementById(id);
const preview = $("cover");
const pctx = preview.getContext("2d");
let renderToken = 0;
let history = [], historyIdx = -1;

function snapshot() { return JSON.stringify(state); }
function pushHistory() {
  history = history.slice(0, historyIdx + 1);
  history.push(snapshot());
  if (history.length > 50) history.shift();
  historyIdx = history.length - 1;
  syncUndoButtons();
}
function restoreHistory(i) {
  const s = JSON.parse(history[i]);
  Object.assign(state, s);
  state.panels = s.panels;
  syncInputs();
  renderPreview();
}
function syncUndoButtons() {
  $("btnUndo").disabled = historyIdx <= 0;
  $("btnRedo").disabled = historyIdx >= history.length - 1;
}
function syncInputs() {
  $("inTitle").value = state.title;
  $("inSubtitle").value = state.subtitle;
  $("inTagline").value = state.tagline;
  $("inTitleSize").value = state.titleSize;
  $("inTitleY").value = state.titleY;
  $("tglGrain").checked = state.grain;
  $("tglVignette").checked = state.vignette;
  $("tglQuote").checked = state.quote;
  $("tglRibbons").checked = state.ribbons;
  $("tglSeal").checked = state.seal;
  $("tglBilling").checked = state.billing;
  $("tglBarcode").checked = state.barcode;
  $("exportSizeLabel").textContent = sizeById[state.size].w + " × " + sizeById[state.size].h;
  document.querySelectorAll("#layoutList button").forEach(b => b.classList.toggle("on", b.dataset.id === state.layout));
  document.querySelectorAll("#gradeList button").forEach(b => b.classList.toggle("on", b.dataset.id === state.grade));
  document.querySelectorAll("#presetList button").forEach(b => b.classList.toggle("on", b.dataset.id === state.preset));
  document.querySelectorAll("#exportList label").forEach(l => l.classList.toggle("on", l.dataset.id === state.size));
  document.querySelectorAll(".size-chip").forEach(c => c.classList.toggle("on", c.dataset.id === state.size));
  const panel = state.panels[state.selected];
  const hint = $("panelHint");
  if (panel && panel.anchor) {
    hint.hidden = false;
    hint.textContent = panel.anchorFound
      ? "Panel " + (state.selected + 1) + ": face found — crop is centred on the face. Drag the ◎ anchor to nudge it, drag the photo to pan, scroll to zoom."
      : "Panel " + (state.selected + 1) + ": no face found in this photo — using a centre crop. Pick another photo or drag to reframe.";
    $("faceStatus").textContent = panel.anchorFound
      ? "Face found in panel " + (state.selected + 1) + " — anchor at " + Math.round(panel.anchor.x * 100) + "% / " + Math.round(panel.anchor.y * 100) + "%."
      : "No face found in panel " + (state.selected + 1) + " — centre crop fallback.";
  }
}

async function renderPreview() {
  const token = ++renderToken;
  await renderCover(pctx, 1080, 1350, { state });
  if (token !== renderToken) return;
  // face anchor marker on the selected panel
  const layout = layoutById[state.layout];
  const slot = layout.slots[state.selected];
  const panel = state.panels[state.selected];
  if (slot && panel) {
    const src = photoSrc(panel);
    if (src) {
      const img = await loadImage(src).catch(() => null);
      if (img && token === renderToken) {
        const rect = slotRect(slot, 1080, 1350);
        const t = coverTransform(img, rect, panel);
        const ax = panel.anchor ? t.dx + panel.anchor.x * t.dw : t.dx + t.dw / 2;
        const ay = panel.anchor ? t.dy + panel.anchor.y * t.dh : t.dy + t.dh / 2;
        pctx.save();
        pctx.strokeStyle = "#22d3ee"; pctx.lineWidth = 3;
        pctx.beginPath(); pctx.arc(ax, ay, 18, 0, Math.PI * 2); pctx.stroke();
        pctx.fillStyle = "#22d3ee";
        pctx.beginPath(); pctx.arc(ax, ay, 8, 0, Math.PI * 2); pctx.fill();
        pctx.strokeStyle = "#fff"; pctx.lineWidth = 2;
        pctx.beginPath(); pctx.arc(ax, ay, 26, 0, Math.PI * 2); pctx.stroke();
        pctx.restore();
      }
    }
  }
}

function applyPreset(id, keepPhotos) {
  const p = presetById[id];
  if (!p) return;
  state.preset = id; state.layout = p.layout; state.grade = p.grade;
  state.title = p.title; state.subtitle = p.subtitle;
  if (!keepPhotos) { /* photos stay; only the look changes */ }
  pushHistory(); syncInputs(); renderPreview();
}
function applyScene(id) {
  const s = sceneById[id];
  if (!s) return;
  const p = presetById[s.preset];
  state.preset = s.preset; state.layout = p.layout; state.grade = p.grade;
  state.title = p.title; state.subtitle = p.subtitle;
  s.photos.forEach((pid, i) => { if (state.panels[i]) state.panels[i].photo = pid; });
  pushHistory(); syncInputs();
  detectAllDefaultFaces().then(renderPreview);
  document.querySelectorAll("#sceneList button").forEach(b => b.classList.toggle("on", b.dataset.id === id));
}
function assignPhotoToSelected(pid) {
  const panel = state.panels[state.selected];
  panel.photo = pid;
  selectedPhoto = pid;
  applyFaceToPanel(state.selected).then(() => { pushHistory(); renderPreview(); });
  document.querySelectorAll("#photoGrid img").forEach(im => im.classList.toggle("sel", im.dataset.id === pid));
}

/* ---------- export ---------- */
function downloadBlob(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
async function exportSize(size, silent) {
  const c = document.createElement("canvas");
  c.width = size.w; c.height = size.h;
  await renderCover(c.getContext("2d"), size.w, size.h, { state });
  const blob = await new Promise(res => c.toBlob(res, "image/png"));
  const name = "neon-coast-" + size.w + "x" + size.h + ".png";
  if (!silent) downloadBlob(blob, name);
  window.__exportedSizes = window.__exportedSizes || [];
  window.__exportedSizes.push({ name, bytes: blob.size });
  return blob;
}
async function exportCurrent() { await exportSize(sizeById[state.size]); }
async function exportAllThree() {
  for (const id of QUICK_SIZES) {
    await exportSize(sizeById[id]);
    await new Promise(r => setTimeout(r, 350));
  }
}

/* ---------- pointer editing on the preview ---------- */
function canvasPoint(ev) {
  const r = preview.getBoundingClientRect();
  return { x: (ev.clientX - r.left) / r.width * 1080, y: (ev.clientY - r.top) / r.height * 1350 };
}
function slotAt(x, y) {
  const layout = layoutById[state.layout];
  for (let i = layout.slots.length - 1; i >= 0; i--) {
    const s = slotRect(layout.slots[i], 1080, 1350);
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return i;
  }
  return -1;
}
let drag = null;
preview.addEventListener("pointerdown", async ev => {
  const { x, y } = canvasPoint(ev);
  const layout = layoutById[state.layout];
  const slot = layout.slots[state.selected];
  const panel = state.panels[state.selected];
  // anchor drag first
  if (slot && panel && panel.anchor) {
    const src = photoSrc(panel);
    const img = src ? await loadImage(src).catch(() => null) : null;
    if (img) {
      const rect = slotRect(slot, 1080, 1350);
      const t = coverTransform(img, rect, panel);
      const ax = t.dx + panel.anchor.x * t.dw, ay = t.dy + panel.anchor.y * t.dh;
      if (Math.hypot(x - ax, y - ay) < 46) { drag = { mode: "anchor" }; preview.setPointerCapture(ev.pointerId); return; }
    }
  }
  const hit = slotAt(x, y);
  if (hit >= 0) {
    if (hit !== state.selected) { state.selected = hit; syncInputs(); renderPreview(); }
    drag = { mode: "pan", x, y, ox: state.panels[hit].ox, oy: state.panels[hit].oy, idx: hit };
    preview.setPointerCapture(ev.pointerId);
  }
});
preview.addEventListener("pointermove", async ev => {
  if (!drag) return;
  const { x, y } = canvasPoint(ev);
  const idx = drag.idx != null ? drag.idx : state.selected;
  const panel = state.panels[idx];
  const layout = layoutById[state.layout];
  const slot = layout.slots[idx];
  if (!slot || !panel) return;
  const src = photoSrc(panel);
  const img = src ? await loadImage(src).catch(() => null) : null;
  if (!img) return;
  const rect = slotRect(slot, 1080, 1350);
  const t = coverTransform(img, rect, panel);
  if (drag.mode === "anchor") {
    panel.anchor = { x: Math.min(0.95, Math.max(0.05, (x - t.dx) / t.dw)), y: Math.min(0.95, Math.max(0.05, (y - t.dy) / t.dh)) };
    panel.ox = panel.anchor.x; panel.oy = panel.anchor.y; panel.anchorFound = true;
  } else {
    const spanX = Math.max(1, t.dw - rect.w), spanY = Math.max(1, t.dh - rect.h);
    panel.ox = Math.min(1, Math.max(0, drag.ox - (x - drag.x) / spanX));
    panel.oy = Math.min(1, Math.max(0, drag.oy - (y - drag.y) / spanY));
  }
  renderPreview();
});
preview.addEventListener("pointerup", () => { if (drag) { drag = null; pushHistory(); } });
preview.addEventListener("wheel", ev => {
  ev.preventDefault();
  const panel = state.panels[state.selected];
  panel.zoom = Math.min(3, Math.max(1, (panel.zoom || 1) * (ev.deltaY < 0 ? 1.12 : 0.89)));
  renderPreview();
}, { passive: false });

/* ---------- build the control lists ---------- */
function buildUI() {
  const grid = $("photoGrid");
  PHOTOS.forEach(p => {
    const fig = document.createElement("figure");
    const im = document.createElement("img");
    im.src = p.src; im.alt = p.label; im.dataset.id = p.id;
    if (p.id === selectedPhoto) im.classList.add("sel");
    im.addEventListener("click", () => assignPhotoToSelected(p.id));
    const cap = document.createElement("figcaption");
    cap.textContent = p.label;
    fig.append(im, cap);
    grid.appendChild(fig);
  });
  const sl = $("sceneList");
  SCENES.forEach(s => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = s.name; b.dataset.id = s.id;
    b.addEventListener("click", () => applyScene(s.id));
    sl.appendChild(b);
  });
  const ll = $("layoutList");
  LAYOUTS.forEach(l => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = l.name; b.dataset.id = l.id;
    b.addEventListener("click", () => { state.layout = l.id; pushHistory(); syncInputs(); renderPreview(); });
    ll.appendChild(b);
  });
  const gl = $("gradeList");
  GRADES.forEach(g => {
    const b = document.createElement("button");
    b.type = "button"; b.dataset.id = g.id;
    const sw = document.createElement("span");
    sw.className = "sw"; sw.style.background = g.sw;
    b.append(sw, document.createTextNode(g.name));
    b.addEventListener("click", () => { state.grade = g.id; pushHistory(); syncInputs(); renderPreview(); });
    gl.appendChild(b);
  });
  const pl = $("presetList");
  PRESETS.forEach(p => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = p.name; b.dataset.id = p.id;
    b.addEventListener("click", () => applyPreset(p.id));
    pl.appendChild(b);
  });
  const el = $("exportList");
  SIZES.forEach(s => {
    const lab = document.createElement("label");
    lab.dataset.id = s.id;
    const inp = document.createElement("input");
    inp.type = "radio"; inp.name = "exportSize"; inp.checked = s.id === state.size;
    inp.addEventListener("change", () => { state.size = s.id; syncInputs(); });
    lab.append(inp, document.createTextNode(s.label));
    el.appendChild(lab);
  });
  const sc = $("sizeChips");
  QUICK_SIZES.forEach(id => {
    const s = sizeById[id];
    const b = document.createElement("button");
    b.type = "button"; b.className = "size-chip"; b.dataset.id = id;
    b.textContent = s.w + "×" + s.h;
    b.addEventListener("click", () => { state.size = id; syncInputs(); });
    sc.appendChild(b);
    if (id !== QUICK_SIZES[QUICK_SIZES.length - 1]) sc.appendChild(document.createTextNode("·"));
  });
  syncInputs();
}

/* ---------- wire the toolbar + inputs ---------- */
function wireUI() {
  $("btnExportAll").addEventListener("click", exportAllThree);
  $("btnExportOne").addEventListener("click", exportCurrent);
  $("btnSurprise").addEventListener("click", () => {
    const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    const titles = ["MIDNIGHT RUN", "PALM HEAT", "VICE ROYALE", "NEON HARBOUR", "SUNSET HEIST", "CHROME DAWN"];
    applyPreset(p.id);
    state.title = titles[Math.floor(Math.random() * titles.length)];
    const s = SCENES[Math.floor(Math.random() * SCENES.length)];
    s.photos.forEach((pid, i) => { if (state.panels[i]) state.panels[i].photo = pid; });
    pushHistory(); syncInputs();
    detectAllDefaultFaces().then(renderPreview);
  });
  $("btnUndo").addEventListener("click", () => { if (historyIdx > 0) { historyIdx--; restoreHistory(historyIdx); syncUndoButtons(); } });
  $("btnRedo").addEventListener("click", () => { if (historyIdx < history.length - 1) { historyIdx++; restoreHistory(historyIdx); syncUndoButtons(); } });
  $("btnRecentre").addEventListener("click", async () => {
    await applyFaceToPanel(state.selected);
    syncInputs(); renderPreview();
  });
  $("btnSaveLook").addEventListener("click", () => {
    try { localStorage.setItem("neoncoast-look", snapshot()); $("faceStatus").textContent = "Look saved in this browser."; } catch (e) { /* storage unavailable */ }
  });
  $("btnLoadLook").addEventListener("click", () => {
    try {
      const raw = localStorage.getItem("neoncoast-look");
      if (!raw) { $("faceStatus").textContent = "No saved look yet — save one first."; return; }
      const s = JSON.parse(raw);
      Object.assign(state, s); state.panels = s.panels;
      pushHistory(); syncInputs(); renderPreview();
    } catch (e) { /* bad save */ }
  });
  $("inTitle").addEventListener("input", e => { state.title = e.target.value.toUpperCase(); renderPreview(); });
  $("inTitle").addEventListener("change", pushHistory);
  $("inSubtitle").addEventListener("input", e => { state.subtitle = e.target.value; renderPreview(); });
  $("inSubtitle").addEventListener("change", pushHistory);
  $("inTagline").addEventListener("input", e => { state.tagline = e.target.value.toUpperCase(); renderPreview(); });
  $("inTagline").addEventListener("change", pushHistory);
  $("inTitleSize").addEventListener("input", e => { state.titleSize = +e.target.value; renderPreview(); });
  $("inTitleSize").addEventListener("change", pushHistory);
  $("inTitleY").addEventListener("input", e => { state.titleY = +e.target.value; renderPreview(); });
  $("inTitleY").addEventListener("change", pushHistory);
  const bindToggle = (id, key) => $(id).addEventListener("change", e => { state[key] = e.target.checked; pushHistory(); renderPreview(); });
  bindToggle("tglGrain", "grain"); bindToggle("tglVignette", "vignette");
  bindToggle("tglQuote", "quote"); bindToggle("tglRibbons", "ribbons");
  bindToggle("tglSeal", "seal"); bindToggle("tglBilling", "billing"); bindToggle("tglBarcode", "barcode");
  $("fileInput").addEventListener("change", async e => {
    for (const file of e.target.files) {
      if (!file.type.startsWith("image/")) continue;
      const url = await new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.readAsDataURL(file);
      });
      const id = "up" + Date.now() + Math.floor(Math.random() * 999);
      PHOTOS.push({ id, src: url, label: file.name.slice(0, 18) });
      const fig = document.createElement("figure");
      const im = document.createElement("img");
      im.src = url; im.alt = file.name; im.dataset.id = id;
      im.addEventListener("click", () => assignPhotoToSelected(id));
      const cap = document.createElement("figcaption");
      cap.textContent = file.name.slice(0, 18);
      fig.append(im, cap);
      $("photoGrid").appendChild(fig);
      state.panels[state.selected].photo = id;
      await applyFaceToPanel(state.selected);
      pushHistory(); renderPreview();
    }
    e.target.value = "";
  });
}

/* ---------- shot modes for screenshots: ?shot=cover / ?shot=facecrop ---------- */
function stageCanvas() {
  let stage = document.getElementById("shotStage");
  if (!stage) {
    stage = document.createElement("div");
    stage.id = "shotStage";
    const c = document.createElement("canvas");
    c.id = "shotCanvas";
    stage.appendChild(c);
    document.body.appendChild(stage);
  }
  return stage.querySelector("canvas");
}
async function runShotMode(params) {
  const mode = params.get("shot");
  document.body.classList.add(mode === "facecrop" ? "shot-face" : "shot-cover");
  const c = stageCanvas();
  c.width = window.innerWidth; c.height = window.innerHeight;
  const ctx = c.getContext("2d");
  await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]);
  if (mode === "facecrop") {
    await renderFaceCropDemo(ctx, c.width, c.height);
  } else {
    const preset = params.get("preset");
    if (preset && presetById[preset]) applyPreset(preset);
    const layout = params.get("layout"), grade = params.get("grade"), title = params.get("title");
    if (layout && layoutById[layout]) state.layout = layout;
    if (grade && gradeById[grade]) state.grade = grade;
    if (title) state.title = title;
    const scene = params.get("scene");
    if (scene && sceneById[scene]) {
      sceneById[scene].photos.forEach((pid, i) => { if (state.panels[i]) state.panels[i].photo = pid; });
    }
    await detectAllDefaultFaces();
    await renderCover(ctx, c.width, c.height, { state });
  }
  window.__ready = true;
}

/* ---------- boot ---------- */
async function boot() {
  const params = new URLSearchParams(location.search);
  if (params.get("shot")) { await runShotMode(params); return; }
  buildUI();
  wireUI();
  const scene = params.get("scene");
  if (scene && sceneById[scene]) applyScene(scene);
  await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))]);
  await detectAllDefaultFaces();
  pushHistory();
  await renderPreview();
  window.__ready = true;
}
document.addEventListener("DOMContentLoaded", boot);
