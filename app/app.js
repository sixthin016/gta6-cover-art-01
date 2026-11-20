"use strict";
/* Neon Coast — Cover Art Studio. All art is drawn by this code from photos + canvas.
   No Rockstar logo, artwork or fonts anywhere. Photos never leave the machine. */

const $ = (id) => document.getElementById(id);
const canvas = $("cover");
const ctx = canvas.getContext("2d");
const params = new URLSearchParams(location.search);
const SHOT = params.get("shot") || "";          // "", "1", "face", "export", "variant"
const CLEAN = SHOT === "1" || SHOT === "export" || SHOT === "variant";

/* ---------------- data ---------------- */
const SAMPLES = [
  { id: "couple",    file: "samples/couple.jpg",    label: "Duo · Leads",     role: "THE DRIVER" },
  { id: "portrait",  file: "samples/portrait.jpg",  label: "Portrait · Lead", role: "THE INSIDER" },
  { id: "neonstreet",file: "samples/neonstreet.jpg",label: "Neon Street",    role: "THE COURIER" },
  { id: "sportscar", file: "samples/sportscar.jpg", label: "Sports Car",      role: "THE GETAWAY" },
  { id: "speedboat", file: "samples/speedboat.jpg", label: "Speedboat",       role: "THE SMUGGLER" },
  { id: "palmbeach", file: "samples/palmbeach.jpg", label: "Palm Beach",      role: "THE FIXER" },
  { id: "pier",      file: "samples/pier.jpg",      label: "Pier Dusk",       role: "THE LOOKOUT" },
  { id: "boulevard", file: "samples/boulevard.jpg", label: "Boulevard",       role: "THE DEALER" },
];
const PHOTO_BY_ID = Object.fromEntries(SAMPLES.map((s) => [s.id, s]));

/* Layouts: rects are fractions of the cover; rot in degrees; skew in degrees.
   Panels run to ~92% of the height so the lower third stays busy. */
const LAYOUTS = [
  { id: "hero-three", name: "Neon Coast", panels: [
    { x: 0, y: 0, w: 1, h: 0.56 },
    { x: 0, y: 0.58, w: 0.34, h: 0.32 },
    { x: 0.34, y: 0.58, w: 0.32, h: 0.32 },
    { x: 0.66, y: 0.58, w: 0.34, h: 0.32 } ] },
  { id: "grid-4", name: "Four Panel", panels: [
    { x: 0, y: 0, w: 0.5, h: 0.45 }, { x: 0.5, y: 0, w: 0.5, h: 0.45 },
    { x: 0, y: 0.46, w: 0.5, h: 0.44 }, { x: 0.5, y: 0.46, w: 0.5, h: 0.44 } ] },
  { id: "full-bleed", name: "Full Bleed", panels: [ { x: 0, y: 0, w: 1, h: 0.92 } ] },
  { id: "cover-grid-9", name: "Whole Cast 3×3", panels: [
    { x: 0, y: 0, w: 0.34, h: 0.30 }, { x: 0.34, y: 0, w: 0.32, h: 0.30 }, { x: 0.66, y: 0, w: 0.34, h: 0.30 },
    { x: 0, y: 0.31, w: 0.34, h: 0.30 }, { x: 0.34, y: 0.31, w: 0.32, h: 0.30 }, { x: 0.66, y: 0.31, w: 0.34, h: 0.30 },
    { x: 0, y: 0.62, w: 0.34, h: 0.30 }, { x: 0.34, y: 0.62, w: 0.32, h: 0.30 }, { x: 0.66, y: 0.62, w: 0.34, h: 0.30 } ] },
  { id: "slanted-comic", name: "Slanted Comic", panels: [
    { x: 0.015, y: 0.01, w: 0.48, h: 0.43, rot: -2, skew: -4 },
    { x: 0.505, y: 0.01, w: 0.48, h: 0.43, rot: 2, skew: -4 },
    { x: 0.015, y: 0.46, w: 0.48, h: 0.44, rot: 2, skew: -4 },
    { x: 0.505, y: 0.46, w: 0.48, h: 0.44, rot: -2, skew: -4 } ] },
  { id: "collage-2x2", name: "Grid Collage", panels: [
    { x: 0, y: 0, w: 0.62, h: 0.90 },
    { x: 0.63, y: 0, w: 0.37, h: 0.44 },
    { x: 0.63, y: 0.46, w: 0.37, h: 0.44 } ] },
  { id: "split-3", name: "Three Split", panels: [
    { x: 0, y: 0, w: 0.34, h: 0.90 },
    { x: 0.34, y: 0, w: 0.32, h: 0.90 },
    { x: 0.66, y: 0, w: 0.34, h: 0.90 } ] },
  { id: "diagonal-hero", name: "Diagonal Hero", panels: [
    { x: -0.06, y: -0.04, w: 1.12, h: 0.66, rot: -5 },
    { x: 0.03, y: 0.68, w: 0.45, h: 0.24, rot: 2 },
    { x: 0.52, y: 0.68, w: 0.45, h: 0.24, rot: -2 } ] },
  { id: "poster-band", name: "Poster Band", panels: [
    { x: 0, y: 0, w: 1, h: 0.42 },
    { x: 0, y: 0.58, w: 0.25, h: 0.32 },
    { x: 0.25, y: 0.58, w: 0.25, h: 0.32 },
    { x: 0.50, y: 0.58, w: 0.25, h: 0.32 },
    { x: 0.75, y: 0.58, w: 0.25, h: 0.32 } ] },
];
const LAYOUT_BY_ID = Object.fromEntries(LAYOUTS.map((l) => [l.id, l]));

/* Grades: per-photo canvas filter + a whole-cover gradient overlay. */
const GRADES = [
  { id: "vice-sunset", name: "Vice Sunset", filter: "saturate(1.45) contrast(1.12) brightness(1.02)",
    stops: [[0, "#ff2e88"], [0.5, "#ff7a3c"], [1, "#7b2ff7"]], blend: "overlay", alpha: 0.5 },
  { id: "electric-duo", name: "Electric Duo", filter: "saturate(1.5) contrast(1.18)",
    stops: [[0, "#22e6ff"], [0.55, "#1b3bff"], [1, "#ff2e88"]], blend: "overlay", alpha: 0.55 },
  { id: "magenta-cyan", name: "Magenta / Cyan", filter: "saturate(1.4) contrast(1.12)",
    stops: [[0, "#ff00c8"], [1, "#00e5ff"]], blend: "soft-light", alpha: 0.7 },
  { id: "heat", name: "Heat", filter: "saturate(1.6) contrast(1.15) brightness(1.05)",
    stops: [[0, "#ff3d00"], [0.6, "#ff9a3c"], [1, "#ffd23c"]], blend: "soft-light", alpha: 0.6 },
  { id: "palm-dusk", name: "Palm Dusk", filter: "saturate(1.3) contrast(1.1)",
    stops: [[0, "#0e7a6b"], [0.5, "#ff9a3c"], [1, "#5b2a86"]], blend: "overlay", alpha: 0.5 },
  { id: "chrome-night", name: "Chrome Night", filter: "saturate(0.75) contrast(1.25) brightness(0.92)",
    stops: [[0, "#2b4bff"], [0.5, "#101b3a"], [1, "#c9d6ff"]], blend: "overlay", alpha: 0.45 },
  { id: "halftone-ink", name: "Halftone Ink", filter: "grayscale(1) contrast(1.35) brightness(1.05)",
    stops: [[0, "#111"], [1, "#fff"]], blend: "overlay", alpha: 0.25, halftone: true },
];
const GRADE_BY_ID = Object.fromEntries(GRADES.map((g) => [g.id, g]));

const PRESETS = [
  { id: "neon-coast", name: "Neon Coast", layout: "hero-three", grade: "vice-sunset", title: "NEON COAST", subtitle: "Vice City nights · starring you" },
  { id: "sunset-sleeve", name: "Sunset Sleeve", layout: "poster-band", grade: "palm-dusk", title: "SUNSET SLEEVE", subtitle: "Golden hour never ends" },
  { id: "palm-poster", name: "Palm Poster", layout: "grid-4", grade: "heat", title: "PALM POSTER", subtitle: "Hot streets, cool crew" },
  { id: "heat-wave", name: "Heat Wave", layout: "split-3", grade: "heat", title: "HEAT WAVE", subtitle: "Run it back, twice as hot" },
  { id: "chrome-night", name: "Chrome Night", layout: "diagonal-hero", grade: "chrome-night", title: "MIDNIGHT RUN", subtitle: "The city sleeps. We don't." },
  { id: "halftone-press", name: "Halftone Press", layout: "cover-grid-9", grade: "halftone-ink", title: "HALFTONE PRESS", subtitle: "Ink, paper & neon" },
];
const PRESET_BY_ID = Object.fromEntries(PRESETS.map((p) => [p.id, p]));

const SCENES = [
  { id: "night-city", name: "Night City", layout: "hero-three", grade: "electric-duo", photos: ["couple", "neonstreet", "sportscar", "pier"], title: "NIGHT CITY", subtitle: "Neon never sleeps" },
  { id: "highway-chase", name: "Highway Chase", layout: "diagonal-hero", grade: "heat", photos: ["sportscar", "boulevard", "neonstreet"], title: "HIGHWAY CHASE", subtitle: "No brakes, no mercy" },
  { id: "club-interior", name: "Club Interior", layout: "grid-4", grade: "magenta-cyan", photos: ["portrait", "neonstreet", "couple", "boulevard"], title: "CLUB NEON", subtitle: "Last call at midnight" },
  { id: "beach-boulevard", name: "Beach Boulevard", layout: "poster-band", grade: "palm-dusk", photos: ["palmbeach", "pier", "speedboat", "couple", "boulevard"], title: "BEACH BOULEVARD", subtitle: "Salt air, fast cars" },
  { id: "rooftop-dusk", name: "Rooftop Dusk", layout: "full-bleed", grade: "vice-sunset", photos: ["portrait"], title: "ROOFTOP DUSK", subtitle: "Above it all" },
  { id: "palm-street", name: "Palm Street", layout: "split-3", grade: "palm-dusk", photos: ["palmbeach", "boulevard", "pier"], title: "PALM STREET", subtitle: "Where the palms lean" },
  { id: "convertible", name: "Convertible", layout: "collage-2x2", grade: "vice-sunset", photos: ["sportscar", "couple", "speedboat"], title: "TOP DOWN", subtitle: "Wind in your face" },
  { id: "skyline", name: "Skyline", layout: "slanted-comic", grade: "chrome-night", photos: ["neonstreet", "portrait", "boulevard", "pier"], title: "SKYLINE", subtitle: "Steel and starlight" },
  { id: "boardwalk", name: "Boardwalk", layout: "cover-grid-9", grade: "heat", photos: ["palmbeach", "pier", "speedboat", "couple", "portrait", "sportscar", "neonstreet", "boulevard", "palmbeach"], title: "BOARDWALK", subtitle: "Nine lives, one summer" },
];

const EXPORT_SIZES = [[1080, 1080], [1080, 1350], [1920, 1080], [1080, 1920], [1200, 1500], [1920, 1920]];
const FURNITURE = [
  { id: "quote", label: "Press-quote bar + 5 stars", on: true },
  { id: "roles", label: "Role-tag ribbons", on: true },
  { id: "voltab", label: "VOL. 01 tab", on: true },
  { id: "tagline", label: "Tagline pill", on: true },
  { id: "billing", label: "Billing block", on: true },
  { id: "credits", label: "Second credits strip", on: true },
  { id: "seal", label: "Gold seal — ORIGINAL COVER ART", on: true },
  { id: "barcode", label: "Barcode", on: true },
  { id: "grain", label: "Film grain", on: true },
  { id: "vignette", label: "Vignette", on: true },
];

/* ---------------- state ---------------- */
function defaultPanels() {
  const order = ["couple", "neonstreet", "speedboat", "palmbeach", "portrait", "sportscar", "pier", "boulevard", "couple"];
  return order.map((pid) => ({ photo: pid, anchor: { x: 0.5, y: 0.42 }, zoom: 1, dx: 0, dy: 0, faceFound: false }));
}
function defaultState() {
  return {
    layout: "hero-three", grade: "vice-sunset", preset: "neon-coast",
    title: "NEON COAST", subtitle: "Vice City nights · starring you",
    tagline: "TWO LIVES. ONE SUNSET. NO WAY BACK.",
    quote: "THE COOLEST COVER MAKER OF THE YEAR",
    titleSize: 110, titleY: 74,
    panels: defaultPanels(),
    furniture: Object.fromEntries(FURNITURE.map((f) => [f.id, f.on])),
    selected: 0, selTouched: false, showAnchor: false,
  };
}
let state = defaultState();
let history = [], future = [];
const images = {};   // sample id -> HTMLImageElement
const uploaded = {}; // upload id -> data URL image

function selectedPanelIndex() {
  const n = state.panels.length;
  return ((state.selected % n) + n) % n; // -1 (no selection) reads as panel 0, never crashes
}
function selectedPanel() { return state.panels[selectedPanelIndex()]; }
function snapshot() { return JSON.stringify({ ...state, selected: 0, selTouched: false, showAnchor: false }); }
function pushHistory() {
  history.push(snapshot());
  if (history.length > 40) history.shift();
  future = [];
}
function restore(json) {
  const keep = { selected: state.selected, selTouched: state.selTouched, showAnchor: state.showAnchor };
  state = { ...JSON.parse(json), ...keep };
  syncControls(); render();
}
function undo() { if (!history.length) return; future.push(snapshot()); restore(history.pop()); setStatus("Undid last change."); }
function redo() { if (!future.length) return; history.push(snapshot()); restore(future.pop()); setStatus("Redid change."); }
function setStatus(msg) { const el = $("statusLine"); if (el) el.textContent = msg; }

/* ---------------- face-aware auto-crop ---------------- */
/* Offline, pure canvas: skin-tone clustering (YCbCr skin window) + dark
   eye/mouth pixels score the best face anchor. Falls back to centre crop. */
function detectFace(img) {
  try {
    const W = 96, H = Math.max(48, Math.round((96 * img.naturalHeight) / img.naturalWidth));
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    const skin = new Uint8Array(W * H), dark = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const r = d[i * 4], gg = d[i * 4 + 1], b = d[i * 4 + 2];
      const cb = 128 - 0.168736 * r - 0.331264 * gg + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * gg - 0.081312 * b;
      // Skin is a muted warm tone: R above G above B with a modest gap.
      // Saturated pink (a jacket), neon magenta and sunset orange all fail
      // the gap test, so they can no longer outvote a real face.
      const rg = r - gg, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      if (r > 90 && rg >= 8 && rg <= 75 && gg >= b - 15 && mx - mn <= 110
          && cr > 133 && cr < 173 && cb > 77 && cb < 127) skin[i] = 1;
      const lum = 0.299 * r + 0.587 * gg + 0.114 * b;
      if (lum < 55) dark[i] = 1;
    }
    // Largest connected skin component that looks face-like: compact blob,
    // roughly face aspect, with dark pixels (eyes / hairline) in its top third.
    // A neon sign or sunset sky is sparse and wide, so it fails the fill test
    // and falls back to centre crop.
    const N = W * H;
    const seen = new Uint8Array(N);
    let best = null, bestScore = 0, skinTotal = 0;
    for (let i = 0; i < N; i++) skinTotal += skin[i];
    if (skinTotal < N * 0.008) return { x: 0.5, y: 0.42, found: false };
    const stack = [];
    for (let start = 0; start < N; start++) {
      if (!skin[start] || seen[start]) continue;
      let size = 0, minX = W, maxX = -1, minY = H, maxY = -1, darkTop = 0;
      stack.length = 0; stack.push(start); seen[start] = 1;
      while (stack.length) {
        const cur = stack.pop();
        const cx = cur % W, cy = (cur / W) | 0;
        size++;
        if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
        const nb = [cur - 1, cur + 1, cur - W, cur + W];
        for (const n2 of nb) {
          if (n2 < 0 || n2 >= N) continue;
          if (cx === 0 && n2 === cur - 1) continue;
          if (cx === W - 1 && n2 === cur + 1) continue;
          if (skin[n2] && !seen[n2]) { seen[n2] = 1; stack.push(n2); }
        }
      }
      if (size < N * 0.008) continue;
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      const fill = size / (bw * bh);
      const aspect = bh / Math.max(1, bw);
      if (fill < 0.35) continue;
      if (aspect < 0.5 || aspect > 2.4) continue;
      const topEnd = minY + Math.floor(bh / 3);
      for (let y = minY; y < topEnd; y++)
        for (let x = minX; x <= maxX; x++) darkTop += dark[y * W + x];
      const score = size * fill * (aspect >= 0.7 && aspect <= 1.8 ? 1.2 : 0.8) * (1 + darkTop / Math.max(1, size));
      if (score > bestScore) {
        bestScore = score;
        best = { x: (minX + maxX + 1) / 2 / W, y: (minY + maxY + 1) / 2 / H };
      }
    }
    if (!best) return { x: 0.5, y: 0.42, found: false };
    return {
      x: Math.min(0.85, Math.max(0.15, best.x)),
      y: Math.min(0.8, Math.max(0.2, best.y)),
      found: true,
    };
  } catch (e) { return { x: 0.5, y: 0.42, found: false }; }
}

function runFaceDetection(panelIdx) {
  const p = state.panels[panelIdx];
  const img = images[p.photo] || uploaded[p.photo];
  if (!img) return;
  const hit = detectFace(img);
  p.anchor = { x: hit.x, y: hit.y };
  p.faceFound = hit.found;
  if (panelIdx === state.selected) {
    $("faceHint").textContent = hit.found
      ? "Face found — crop is centred on the face. Drag the cyan anchor on the cover to nudge it."
      : "No face found in this photo — using centre crop. Pick another photo or drag the anchor.";
  }
}

/* ---------------- rendering ---------------- */
function coverFit(img, dx, dy, dw, dh, anchor, zoom, panX, panY) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(dw / iw, dh / ih) * zoom;
  const sw = dw / scale, sh = dh / scale;
  const cx = anchor.x * iw, cy = anchor.y * ih;
  let sx = cx - sw / 2 + (panX / 100) * sw * 0.5;
  let sy = cy - sh / 2 + (panY / 100) * sh * 0.5;
  sx = Math.min(Math.max(sx, 0), iw - sw);
  sy = Math.min(Math.max(sy, 0), ih - sh);
  return [sx, sy, sw, sh, dx, dy, dw, dh];
}

function drawPanelPhoto(g, img, rect, panel, grade, W, H) {
  const x = rect.x * W, y = rect.y * H, w = rect.w * W, h = rect.h * H;
  g.save();
  if (rect.rot || rect.skew) {
    g.translate(x + w / 2, y + h / 2);
    if (rect.rot) g.rotate((rect.rot * Math.PI) / 180);
    if (rect.skew) g.transform(1, 0, Math.tan((rect.skew * Math.PI) / 180), 1, 0, 0);
    g.translate(-w / 2, -h / 2);
  } else g.translate(x, y);
  g.beginPath(); g.rect(0, 0, w, h); g.clip();
  if (grade.filter) { try { g.filter = grade.filter; } catch (e) {} }
  const [sx, sy, sw, sh] = coverFit(img, 0, 0, w, h, panel.anchor, panel.zoom, panel.dx, panel.dy);
  g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  try { g.filter = "none"; } catch (e) {}
  // diagonal sunset sheen on the hero panel
  const sheen = g.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0, "rgba(255,46,136,0.10)"); sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(34,230,255,0.10)");
  g.fillStyle = sheen; g.fillRect(0, 0, w, h);
  g.restore();
  // firm border / keyline
  g.save();
  if (rect.rot || rect.skew) {
    g.translate(x + w / 2, y + h / 2);
    if (rect.rot) g.rotate((rect.rot * Math.PI) / 180);
    if (rect.skew) g.transform(1, 0, Math.tan((rect.skew * Math.PI) / 180), 1, 0, 0);
    g.translate(-w / 2, -h / 2);
  } else g.translate(x, y);
  g.lineWidth = Math.max(2, W * 0.004);
  g.strokeStyle = "rgba(255,233,180,0.9)";
  g.strokeRect(0, 0, w, h);
  g.restore();
}

function drawChromeTitle(g, text, cx, y, size, W) {
  g.save();
  g.translate(cx, y);
  g.rotate((-2.5 * Math.PI) / 180);
  g.textAlign = "center"; g.textBaseline = "middle";
  const font = `italic ${size}px Anton, "Arial Narrow", sans-serif`;
  g.font = font;
  const total = g.measureText(text).width;
  let x = -total / 2;
  // 3D extrusion, drawn first, down-right in dark magenta
  g.fillStyle = "#5b0a3a";
  for (const ch of text) {
    const wch = g.measureText(ch).width;
    g.fillText(ch, x + wch / 2 + size * 0.055, size * 0.075);
    x += wch;
  }
  // per-glyph sunset stripe fill
  const grad = g.createLinearGradient(0, -size * 0.5, 0, size * 0.5);
  grad.addColorStop(0, "#ffffff"); grad.addColorStop(0.28, "#ffe45e");
  grad.addColorStop(0.52, "#ff9a3c"); grad.addColorStop(0.76, "#ff2e88"); grad.addColorStop(1, "#7b2ff7");
  x = -total / 2;
  g.fillStyle = grad;
  g.lineWidth = Math.max(2, size * 0.02); g.strokeStyle = "#ffffff"; g.lineJoin = "round";
  for (const ch of text) {
    const wch = g.measureText(ch).width;
    g.strokeText(ch, x + wch / 2, 0);
    g.fillText(ch, x + wch / 2, 0);
    x += wch;
  }
  // sparkles
  g.fillStyle = "#fff";
  const sparks = [[-total * 0.42, -size * 0.62, size * 0.09], [total * 0.46, -size * 0.55, size * 0.07], [total * 0.3, size * 0.5, size * 0.06]];
  for (const [sx, sy, s] of sparks) drawSparkle(g, sx, sy, s);
  g.restore();
}
function drawSparkle(g, x, y, s) {
  g.save(); g.translate(x, y);
  g.beginPath();
  g.moveTo(0, -s); g.quadraticCurveTo(0, 0, s, 0); g.quadraticCurveTo(0, 0, 0, s);
  g.quadraticCurveTo(0, 0, -s, 0); g.quadraticCurveTo(0, 0, 0, -s);
  g.fill(); g.restore();
}

function drawNeonSubtitle(g, text, cx, y, size, W) {
  g.save();
  g.font = `${size}px Pacifico, cursive`;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = "#ff2e88"; g.shadowBlur = size * 0.55;
  g.fillStyle = "#ffd7ea";
  g.fillText(text, cx, y);
  g.shadowBlur = size * 0.25; g.fillStyle = "#ffffff";
  g.fillText(text, cx, y);
  g.restore();
}

function drawRoleTag(g, x, y, w, text, W) {
  const h = Math.max(20, W * 0.026);
  g.save();
  g.translate(x, y);
  g.transform(1, 0, -0.25, 1, 0, 0);
  g.fillStyle = "rgba(8,4,16,0.92)"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#ff2e88"; g.fillRect(0, 0, Math.max(4, w * 0.03), h);
  g.fillStyle = "#fff";
  g.font = `${Math.round(h * 0.52)}px Anton, sans-serif`;
  g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(text, w * 0.07, h / 2 + 1);
  g.restore();
}

function drawSeal(g, cx, cy, r, W) {
  g.save(); g.translate(cx, cy);
  // serrated starburst
  g.beginPath();
  const teeth = 24;
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i * Math.PI) / teeth;
    const rr = i % 2 === 0 ? r : r * 0.86;
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  const gold = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  gold.addColorStop(0, "#ffe98a"); gold.addColorStop(0.6, "#ffc93c"); gold.addColorStop(1, "#b8860b");
  g.fillStyle = gold; g.fill();
  g.lineWidth = Math.max(2, r * 0.06); g.strokeStyle = "#7a5a00"; g.stroke();
  g.beginPath(); g.arc(0, 0, r * 0.74, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#4a3200"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `${Math.round(r * 0.24)}px Anton, sans-serif`;
  g.fillText("ORIGINAL", 0, -r * 0.22);
  g.fillText("COVER ART", 0, r * 0.05);
  g.font = `${Math.round(r * 0.16)}px Anton, sans-serif`;
  g.fillText("★ ★ ★", 0, r * 0.36);
  g.restore();
}

function drawBarcode(g, x, y, w, h, W) {
  g.save();
  g.fillStyle = "#fff"; g.fillRect(x - 4, y - 4, w + 8, h + 16);
  g.fillStyle = "#111";
  let px = x;
  let seed = 7;
  while (px < x + w) {
    seed = (seed * 31 + 17) % 97;
    const bw = 2 + (seed % 4);
    if (seed % 3 !== 0) g.fillRect(px, y, bw, h);
    px += bw + 2;
  }
  g.font = `${Math.round(h * 0.22)}px monospace`;
  g.textAlign = "center"; g.textBaseline = "top";
  g.fillText("8 901234 567890", x + w / 2, y + h + 2);
  g.restore();
}

function drawHalftone(g, W, H) {
  const step = Math.max(10, W * 0.012);
  g.save();
  g.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = step / 2; y < H; y += step)
    for (let x = step / 2; x < W; x += step) {
      const r = step * 0.16 * (0.6 + 0.4 * Math.sin((x + y) * 0.02));
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  g.restore();
}

function drawGrain(g, W, H) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 128;
  const gg = c.getContext("2d");
  const d = gg.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v; d.data[i + 3] = 22;
  }
  gg.putImageData(d, 0, 0);
  const pat = g.createPattern(c, "repeat");
  g.save(); g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore();
}

/* The one render path for preview AND export.
   opts.preview: draw the interactive helpers (selection outline, face anchor).
   opts.clean: export / screenshot mode — NEVER any helper. The selection outline
   is drawn ONLY when preview && selected && selTouched && !clean, so a clean
   export can never leak a dashed outline. */
function renderCover(g, W, H, opts) {
  const layout = LAYOUT_BY_ID[state.layout] || LAYOUTS[0];
  const grade = GRADE_BY_ID[state.grade] || GRADES[0];
  const furn = state.furniture;
  const bottomBand = 0.90; // panels run to 90% height; furniture fills the rest

  // base: deep sunset sky so gaps never read as empty
  const sky = g.createLinearGradient(0, 0, W, H);
  sky.addColorStop(0, "#1a0b2e"); sky.addColorStop(0.55, "#4d0f3a"); sky.addColorStop(1, "#12081f");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);

  // photos
  layout.panels.forEach((rect, i) => {
    const p = state.panels[i % state.panels.length];
    const img = images[p.photo] || uploaded[p.photo];
    if (img) drawPanelPhoto(g, img, rect, p, grade, W, H);
  });

  // whole-cover grade overlay
  if (grade.stops.length > 1) {
    const og = g.createLinearGradient(0, 0, W * 0.7, H);
    grade.stops.forEach(([pos, col]) => og.addColorStop(pos, col));
    g.save();
    g.globalCompositeOperation = grade.blend;
    g.globalAlpha = grade.alpha;
    g.fillStyle = og; g.fillRect(0, 0, W, H);
    g.restore();
  }
  if (grade.halftone) drawHalftone(g, W, H);

  // bottom band: busy lower third, not a flat gradient
  const bandY = bottomBand * H;
  const band = g.createLinearGradient(0, bandY, 0, H);
  band.addColorStop(0, "#160a24"); band.addColorStop(1, "#0a0512");
  g.fillStyle = band; g.fillRect(0, bandY, W, H - bandY);
  g.fillStyle = "#ff2e88"; g.fillRect(0, bandY, W, Math.max(3, H * 0.003));

  // role tags on panels
  if (furn.roles) {
    layout.panels.forEach((rect, i) => {
      const p = state.panels[i % state.panels.length];
      const sample = PHOTO_BY_ID[p.photo];
      const role = sample ? sample.role : "THE LEAD";
      const tw = W * 0.16;
      const tagX = Math.max(W * 0.008, rect.x * W + W * 0.015);
      drawRoleTag(g, tagX, (rect.y + rect.h) * H - H * 0.045, tw, role, W);
    });
  }

  // press-quote bar on top
  if (furn.quote) {
    const qh = H * 0.042;
    g.fillStyle = "rgba(5,2,12,0.88)"; g.fillRect(0, 0, W, qh);
    g.fillStyle = "#ffc93c";
    g.font = `${Math.round(qh * 0.52)}px sans-serif`;
    g.textAlign = "left"; g.textBaseline = "middle";
    const stars = "★★★★★";
    g.fillText(stars, W * 0.02, qh / 2 + 1);
    g.fillStyle = "#fff";
    g.font = `italic ${Math.round(qh * 0.44)}px Georgia, serif`;
    g.fillText("“" + state.quote + "”  — VICE CITY WEEKLY", W * 0.02 + g.measureText(stars + "  ").width, qh / 2 + 1);
  }

  // VOL. 01 tab
  if (furn.voltab) {
    const tw = W * 0.11, th = H * 0.028;
    g.save(); g.translate(W - tw - W * 0.015, H * 0.052);
    g.transform(1, 0, -0.2, 1, 0, 0);
    g.fillStyle = "#ffc93c"; g.fillRect(0, 0, tw, th);
    g.fillStyle = "#111"; g.font = `${Math.round(th * 0.55)}px Anton, sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("VOL. 01", tw / 2, th / 2 + 1);
    g.restore();
  }

  // chrome title + neon subtitle, tilted, lower third — subtitle sits clear
  // below the title's extrusion so the two never overlap
  const titleY = (state.titleY / 100) * H;
  drawChromeTitle(g, state.title, W / 2, titleY, (state.titleSize / 100) * W * 0.115, W);
  const subY = Math.min(titleY + (state.titleSize / 100) * W * 0.125, H * 0.88);
  drawNeonSubtitle(g, state.subtitle, W / 2, subY, W * 0.032, W);

  // tagline pill — top of the bottom band
  if (furn.tagline) {
    g.font = `${Math.round(W * 0.016)}px Anton, sans-serif`;
    const tw = g.measureText(state.tagline).width + W * 0.05;
    const th = H * 0.022, tx = (W - tw) / 2, ty = bandY + H * 0.007;
    g.save();
    g.fillStyle = "rgba(255,46,136,0.92)";
    g.beginPath();
    g.roundRect(tx, ty, tw, th, th / 2); g.fill();
    g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(state.tagline, W / 2, ty + th / 2 + 1);
    g.restore();
  }

  // billing block — two short centred lines, clear of the barcode
  if (furn.billing) {
    g.fillStyle = "#d8cde8"; g.textAlign = "center"; g.textBaseline = "top";
    g.font = `${Math.round(W * 0.0135)}px "Arial Narrow", sans-serif`;
    const by = bandY + H * 0.036;
    g.fillText("SUNSET PICTURES  presents  “" + state.title + "”  ·  A COVER BY YOU  ·  STARRING THE DRIVER & THE INSIDER", W / 2, by);
    g.font = `${Math.round(W * 0.0115)}px "Arial Narrow", sans-serif`;
    g.fillStyle = "#9d8fb8";
    g.fillText("DIRECTED BY NEON COAST STUDIO      MUSIC BY THE SUNSET BAND      EDITED ON YOUR OWN CAMERA", W / 2, by + H * 0.016);
  }

  // second credits strip — the last line of the band, clear of billing
  if (furn.credits) {
    const cy = H * 0.981;
    g.fillStyle = "#6f6390"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `${Math.round(W * 0.012)}px "Arial Narrow", sans-serif`;
    g.fillText("CAST: THE DRIVER · THE INSIDER · THE COURIER — A SUNSET PICTURES PRODUCTION · STARRING YOU", W / 2, cy);
  }

  // gold seal + barcode
  if (furn.seal) drawSeal(g, W * 0.885, H * 0.845, W * 0.055, W);
  if (furn.barcode) drawBarcode(g, W * 0.03, H * 0.958, W * 0.09, H * 0.02, W);

  if (furn.vignette) {
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.42)");
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
  if (furn.grain) drawGrain(g, W, H);

  // ---- interactive helpers: preview only, never in a clean render ----
  if (opts.preview && !opts.clean && state.selected != null) {
    const rect = layout.panels[selectedPanelIndex() % layout.panels.length];
    if (rect) {
      const x = rect.x * W, y = rect.y * H, w = rect.w * W, h = rect.h * H;
      // dashed selection outline: only after the user actually clicked a panel
      if (state.selTouched) {
        g.save();
        g.setLineDash([14, 10]);
        g.lineWidth = 4; g.strokeStyle = "#22e6ff";
        g.strokeRect(x + 3, y + 3, w - 6, h - 6);
        g.setLineDash([]);
        g.restore();
      }
      // face anchor marker (draggable in the studio)
      if (state.showAnchor || state.selTouched) {
        const p = selectedPanel();
        const ax = x + p.anchor.x * w, ay = y + p.anchor.y * h;
        g.save();
        g.lineWidth = 4; g.strokeStyle = "#22e6ff";
        g.beginPath(); g.arc(ax, ay, Math.max(12, W * 0.02), 0, Math.PI * 2); g.stroke();
        g.beginPath();
        g.moveTo(ax - W * 0.035, ay); g.lineTo(ax + W * 0.035, ay);
        g.moveTo(ax, ay - W * 0.035); g.lineTo(ax, ay + W * 0.035);
        g.stroke();
        g.fillStyle = "#22e6ff";
        g.font = `bold ${Math.round(W * 0.02)}px sans-serif`;
        g.textAlign = "left"; g.textBaseline = "bottom";
        g.fillText("FACE", ax + W * 0.026, ay - W * 0.014);
        g.restore();
      }
    }
  }
}

function render() {
  renderCover(ctx, canvas.width, canvas.height, { preview: true, clean: CLEAN });
  const layout = LAYOUT_BY_ID[state.layout];
  const ln = $("layoutName"); if (ln) ln.textContent = layout ? layout.name : state.layout;
}

/* ---------------- export ---------------- */
function renderExport(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  renderCover(c.getContext("2d"), w, h, { preview: false, clean: true });
  return c;
}
function downloadCanvas(c, name) {
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      if (!blob) { resolve(0); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      resolve(blob.size);
    }, "image/png");
  });
}
async function exportOne(w, h) {
  const c = renderExport(w, h);
  const bytes = await downloadCanvas(c, `neon-coast-${w}x${h}.png`);
  setStatus(`Exported ${w}×${h} PNG (${Math.round(bytes / 1024)} KB).`);
  return bytes;
}
async function exportAll() {
  setStatus("Exporting all 3 sizes…");
  for (const [w, h] of [[1920, 1080], [1080, 1350], [1080, 1080]]) {
    await exportOne(w, h);
    await new Promise((r) => setTimeout(r, 350));
  }
  setStatus("Exported all 3 sizes.");
}

/* ---------------- UI wiring ---------------- */
function buildThumbs() {
  const box = $("thumbs"); box.innerHTML = "";
  SAMPLES.forEach((s) => {
    const b = document.createElement("button");
    b.className = "thumb"; b.title = s.label;
    b.innerHTML = `<img src="${s.file}" alt="${s.label}"><span>${s.label}</span>`;
    b.onclick = () => {
      pushHistory();
      selectedPanel().photo = s.id;
      selectedPanel().zoom = 1;
      selectedPanel().dx = 0;
      selectedPanel().dy = 0;
      runFaceDetection(selectedPanelIndex());
      syncThumbs(); render();
      setStatus(`Loaded ${s.label} into panel ${state.selected + 1}.`);
    };
    box.appendChild(b);
  });
  syncThumbs();
}
function syncThumbs() {
  const layout = LAYOUT_BY_ID[state.layout];
  const used = new Set(layout.panels.map((_, i) => state.panels[i % state.panels.length].photo));
  document.querySelectorAll(".thumb").forEach((el, i) => el.classList.toggle("in-use", used.has(SAMPLES[i].id)));
}
function buildButtons(list, elId, activeId, onPick) {
  const box = $(elId); box.innerHTML = "";
  list.forEach((item) => {
    const b = document.createElement("button");
    b.className = "btn" + (item.id === activeId ? " active" : "");
    b.textContent = item.name;
    b.onclick = () => { pushHistory(); onPick(item); syncAllButtons(); render(); };
    box.appendChild(b);
  });
}
function syncAllButtons() {
  buildButtons(LAYOUTS, "layoutList", state.layout, (l) => { state.layout = l.id; });
  buildButtons(GRADES, "gradeList", state.grade, (g) => { state.grade = g.id; });
  buildButtons(PRESETS, "presetList", state.preset, (p) => applyPreset(p.id, true));
  buildButtons(SCENES, "sceneList", null, (s) => applyScene(s.id));
}
function buildFurniture() {
  const box = $("furnitureToggles"); box.innerHTML = "";
  FURNITURE.forEach((f) => {
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = !!state.furniture[f.id];
    cb.onchange = () => { pushHistory(); state.furniture[f.id] = cb.checked; render(); };
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(f.label));
    box.appendChild(lab);
  });
}
function applyPreset(id, fromClick) {
  const p = PRESET_BY_ID[id]; if (!p) return;
  state.preset = id; state.layout = p.layout; state.grade = p.grade;
  state.title = p.title; state.subtitle = p.subtitle;
  syncControls();
  if (fromClick) setStatus(`Preset “${p.name}” applied.`);
}
function applyScene(id) {
  const s = SCENES.find((x) => x.id === id); if (!s) return;
  pushHistory();
  state.layout = s.layout; state.grade = s.grade;
  state.title = s.title; state.subtitle = s.subtitle;
  s.photos.forEach((pid, i) => { state.panels[i].photo = pid; state.panels[i].zoom = 1; state.panels[i].dx = 0; state.panels[i].dy = 0; });
  state.panels.forEach((_, i) => runFaceDetection(i));
  syncControls(); render();
  setStatus(`Scene “${s.name}” loaded.`);
}
function surpriseMe() {
  pushHistory();
  const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
  const s = SCENES[Math.floor(Math.random() * SCENES.length)];
  applyPreset(p.id, false);
  state.layout = s.layout; state.grade = s.grade;
  s.photos.forEach((pid, i) => { state.panels[i].photo = pid; });
  state.panels.forEach((_, i) => runFaceDetection(i));
  syncControls(); render();
  setStatus(`Surprise: ${p.name} + ${s.name}.`);
}
function syncControls() {
  $("titleInput").value = state.title;
  $("subtitleInput").value = state.subtitle;
  $("taglineInput").value = state.tagline;
  $("quoteInput").value = state.quote;
  $("titleSizeSlider").value = state.titleSize;
  $("titleSizeVal").textContent = state.titleSize;
  $("titleYSlider").value = state.titleY;
  $("titleYVal").textContent = state.titleY + "%";
  const p = selectedPanel();
  $("zoomSlider").value = Math.round(p.zoom * 100);
  $("zoomVal").textContent = Math.round(p.zoom * 100) + "%";
  $("panXSlider").value = p.dx; $("panXVal").textContent = p.dx;
  $("panYSlider").value = p.dy; $("panYVal").textContent = p.dy;
  syncAllButtons(); buildFurniture(); syncThumbs();
}

/* ---------------- pointer interaction on the stage ---------------- */
function panelRectAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const px = (clientX - r.left) / r.width, py = (clientY - r.top) / r.height;
  const layout = LAYOUT_BY_ID[state.layout];
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const rc = layout.panels[i];
    if (px >= rc.x && px <= rc.x + rc.w && py >= rc.y && py <= rc.y + rc.h) return { index: i, rect: rc, px, py };
  }
  return null;
}
let dragMode = null, dragStart = null;
canvas.addEventListener("pointerdown", (e) => {
  const hit = panelRectAt(e.clientX, e.clientY);
  if (!hit) return;
  state.selected = hit.index; state.selTouched = true; state.showAnchor = true;
  const p = state.panels[hit.index];
  const rect = hit.rect;
  const ax = rect.x + p.anchor.x * rect.w, ay = rect.y + p.anchor.y * rect.h;
  const nearAnchor = Math.abs(hit.px - ax) < 0.05 && Math.abs(hit.py - ay) < 0.05;
  dragMode = nearAnchor ? "anchor" : "pan";
  dragStart = { x: e.clientX, y: e.clientY, dx: p.dx, dy: p.dy, ax: p.anchor.x, ay: p.anchor.y, rect };
  canvas.setPointerCapture(e.pointerId);
  syncControls(); render();
});
canvas.addEventListener("pointermove", (e) => {
  if (!dragMode || !dragStart) return;
  const p = selectedPanel();
  const r = canvas.getBoundingClientRect();
  if (dragMode === "pan") {
    p.dx = Math.max(-60, Math.min(60, dragStart.dx + ((e.clientX - dragStart.x) / r.width) * 120));
    p.dy = Math.max(-60, Math.min(60, dragStart.dy + ((e.clientY - dragStart.y) / r.height) * 120));
  } else {
    const rect = dragStart.rect;
    p.anchor.x = Math.min(0.9, Math.max(0.1, dragStart.ax + ((e.clientX - dragStart.x) / r.width) / rect.w));
    p.anchor.y = Math.min(0.9, Math.max(0.1, dragStart.ay + ((e.clientY - dragStart.y) / r.height) / rect.h));
    p.faceFound = true;
  }
  render();
});
canvas.addEventListener("pointerup", () => { if (dragMode) pushHistory(); dragMode = null; dragStart = null; });
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const p = selectedPanel();
  p.zoom = Math.max(1, Math.min(2.6, p.zoom * (e.deltaY < 0 ? 1.08 : 0.93)));
  syncControls(); render();
}, { passive: false });

/* ---------------- control events ---------------- */
function bindControls() {
  $("undoBtn").onclick = undo;
  $("redoBtn").onclick = redo;
  $("surpriseBtn").onclick = surpriseMe;
  $("exportBtn").onclick = () => exportOne(+($("exportBtn").dataset.w || 1080), +($("exportBtn").dataset.h || 1350));
  $("exportAllBtn").onclick = exportAll;
  document.querySelectorAll(".size-chip").forEach((chip) => {
    chip.onclick = () => {
      document.querySelectorAll(".size-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      $("exportBtn").dataset.w = chip.dataset.w; $("exportBtn").dataset.h = chip.dataset.h;
      $("exportBtn").textContent = `Export PNG ${chip.dataset.w}×${chip.dataset.h}`;
    };
  });
  document.querySelectorAll("[data-export]").forEach((b) => {
    b.onclick = () => { const [w, h] = b.dataset.export.split(",").map(Number); exportOne(w, h); };
  });
  $("recentreBtn").onclick = () => {
    const i = selectedPanelIndex();
    runFaceDetection(i); render();
    setStatus(state.panels[i].faceFound ? "Re-centred on the detected face." : "No face found — centre crop kept.");
  };
  $("zoomSlider").oninput = (e) => { const p = selectedPanel(); p.zoom = e.target.value / 100; $("zoomVal").textContent = e.target.value + "%"; render(); };
  $("zoomSlider").onchange = pushHistory;
  $("panXSlider").oninput = (e) => { selectedPanel().dx = +e.target.value; $("panXVal").textContent = e.target.value; render(); };
  $("panXSlider").onchange = pushHistory;
  $("panYSlider").oninput = (e) => { selectedPanel().dy = +e.target.value; $("panYVal").textContent = e.target.value; render(); };
  $("panYSlider").onchange = pushHistory;
  $("titleInput").oninput = (e) => { state.title = e.target.value.toUpperCase() || "NEON COAST"; render(); };
  $("titleInput").onchange = pushHistory;
  $("subtitleInput").oninput = (e) => { state.subtitle = e.target.value; render(); };
  $("subtitleInput").onchange = pushHistory;
  $("taglineInput").oninput = (e) => { state.tagline = e.target.value.toUpperCase(); render(); };
  $("taglineInput").onchange = pushHistory;
  $("quoteInput").oninput = (e) => { state.quote = e.target.value.toUpperCase(); render(); };
  $("quoteInput").onchange = pushHistory;
  $("titleSizeSlider").oninput = (e) => { state.titleSize = +e.target.value; $("titleSizeVal").textContent = e.target.value; render(); };
  $("titleSizeSlider").onchange = pushHistory;
  $("titleYSlider").oninput = (e) => { state.titleY = +e.target.value; $("titleYVal").textContent = e.target.value + "%"; render(); };
  $("titleYSlider").onchange = pushHistory;
  $("uploadInput").onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const id = "up-" + Date.now();
        uploaded[id] = img;
        pushHistory();
        const p = selectedPanel();
        p.photo = id; p.zoom = 1; p.dx = 0; p.dy = 0;
        runFaceDetection(selectedPanelIndex());
        render();
        setStatus(`Uploaded “${file.name}” into panel ${state.selected + 1}.`);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
  });
}

/* ---------------- boot ---------------- */
function loadSamples() {
  return Promise.all(SAMPLES.map((s) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { images[s.id] = img; resolve(); };
    img.onerror = () => resolve();
    img.src = s.file;
  })));
}
async function boot() {
  buildThumbs(); syncAllButtons(); buildFurniture(); bindControls();
  document.body.classList.toggle("shot-cover", SHOT === "export" || SHOT === "variant");
  if (SHOT === "export") {
    const layout = params.get("layout"); if (layout && LAYOUT_BY_ID[layout]) state.layout = layout;
    const grade = params.get("grade"); if (grade && GRADE_BY_ID[grade]) state.grade = grade;
    const title = params.get("title"); if (title) state.title = title;
    canvas.width = 1080; canvas.height = 1350;
  }
  if (SHOT === "variant") {
    state.layout = "diagonal-hero"; state.grade = "chrome-night";
    state.title = "MIDNIGHT RUN"; state.subtitle = "The city sleeps. We don't.";
    state.selected = -1;
  }
  if (SHOT === "face") {
    state.selected = 0; state.showAnchor = true; state.selTouched = false;
  }
  if (CLEAN) { state.selected = SHOT === "face" ? 0 : -1; state.selTouched = false; }
  await loadSamples();
  try { await document.fonts.ready; } catch (e) {}
  state.panels.forEach((_, i) => runFaceDetection(i));
  if (SHOT === "face") runFaceDetection(0);
  syncControls(); render();
  // saved presets in localStorage (best effort, offline)
  try {
    const saved = JSON.parse(localStorage.getItem("neon-coast-presets") || "{}");
    if (saved.last) { /* last-used preset name shown in status only */ setStatus("Ready — last preset: " + saved.last + "."); }
  } catch (e) {}
  try { localStorage.setItem("neon-coast-presets", JSON.stringify({ last: state.preset })); } catch (e) {}
  // headless verification hook: ?exportcheck=1 exports once and reports the byte size in the DOM
  if (params.get("exportcheck") === "1") {
    const c = renderExport(1080, 1350);
    c.toBlob((blob) => {
      document.body.dataset.exportBytes = blob ? String(blob.size) : "0";
      document.title = "EXPORT_OK";
    }, "image/png");
  }
  // face-detection probe: ?facetest=1 writes every panel's anchor into the DOM
  if (params.get("facetest") === "1") {
    document.body.dataset.facetest = JSON.stringify(state.panels.map((p) => ({
      photo: p.photo, x: +p.anchor.x.toFixed(2), y: +p.anchor.y.toFixed(2), face: p.faceFound,
    })));
  }
  document.body.dataset.ready = "1";
}
boot();
