/* Neon Coast Cover Studio — original cover engine, vanilla canvas.
   All art is drawn in code (gradients, skylines, palms, silhouettes).
   No Rockstar logo, artwork or fonts anywhere. */
"use strict";

/* ---------- helpers ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

/* ---------- catalogues ---------- */
const SCENES = [
  { id: "nightcity", name: "Night city" },
  { id: "highway", name: "Highway chase" },
  { id: "club", name: "Club interior" },
  { id: "beach", name: "Beach boulevard" },
  { id: "rooftop", name: "Rooftop dusk" },
  { id: "palmstreet", name: "Palm street" },
  { id: "convertible", name: "Convertible" },
  { id: "skyline", name: "Skyline" },
  { id: "boardwalk", name: "Boardwalk" },
];
const LAYOUTS = [
  { id: "diagonal", name: "Diagonal Duo", desc: "Duo on a diagonal + 3-panel strip" },
  { id: "grid4", name: "Four-Panel Grid", desc: "Classic 2 × 2 cover grid" },
  { id: "hero3", name: "Hero + Three", desc: "One hero, three below" },
  { id: "fullbleed", name: "Full-Bleed Single", desc: "One photo, edge to edge" },
  { id: "ninegrid", name: "Nine-Panel Cover", desc: "3 × 3 grid, title block centre" },
  { id: "tilted", name: "Tilted Snapshot", desc: "Candid tilt + mini print" },
  { id: "collage", name: "Grid Collage 2×2", desc: "Thick borders, title band" },
  { id: "split3", name: "3-Panel Split", desc: "Three vertical strips" },
  { id: "band", name: "Poster Band", desc: "Photo · title · photo bands" },
];
const GRADES = [
  { id: "duotone", name: "Neon Duotone", desc: "Electric blue / hot pink" },
  { id: "sunset", name: "Vice Sunset", desc: "Orange dusk gradient" },
  { id: "magenta", name: "Magenta–Cyan", desc: "Complementary pop" },
  { id: "heat", name: "Heat Wave", desc: "Scorched amber–red" },
  { id: "palm", name: "Palm Dusk", desc: "Violet + coral dusk" },
  { id: "chrome", name: "Chrome Night", desc: "Cold steel night" },
  { id: "halftone", name: "Halftone Ink", desc: "Print dots + ink black" },
];
const PRESETS = [
  { id: "neon", name: "Neon Coast", desc: "Diagonal Duo · Duotone · chrome title", layout: "diagonal", grade: "duotone", title: "GTA VI", subtitle: "NEON COAST", badge: "VICE CITY" },
  { id: "sleeve", name: "Sunset Sleeve", desc: "Hero + Three · Vice Sunset", layout: "hero3", grade: "sunset", title: "GTA VI", subtitle: "SUNSET SLEEVE", badge: "OCEAN DRIVE" },
  { id: "palm", name: "Palm Poster", desc: "Nine-Panel · Palm Dusk · star meter", layout: "ninegrid", grade: "palm", title: "GTA VI", subtitle: "PALM POSTER", badge: "PALM STREET" },
  { id: "heat", name: "Heat Wave", desc: "3-Panel Split · Heat grade", layout: "split3", grade: "heat", title: "GTA VI", subtitle: "HEAT WAVE", badge: "MIDNIGHT RUN" },
  { id: "chrome", name: "Chrome Night", desc: "Full-Bleed · Chrome Night", layout: "fullbleed", grade: "chrome", title: "GTA VI", subtitle: "CHROME NIGHT", badge: "DOWNTOWN" },
  { id: "halftone", name: "Halftone Press", desc: "Tilted Snapshot · Halftone Ink", layout: "tilted", grade: "halftone", title: "GTA VI", subtitle: "HALFTONE PRESS", badge: "NEWSSTAND" },
];
const EXPORT_SIZES = [
  { w: 1080, h: 1080, label: "1080 × 1080 · Square" },
  { w: 1080, h: 1350, label: "1080 × 1350 · Portrait" },
  { w: 1920, h: 1080, label: "1920 × 1080 · Wide" },
  { w: 1080, h: 1920, label: "1080 × 1920 · Story" },
  { w: 1200, h: 628, label: "1200 × 628 · Social" },
  { w: 1920, h: 1920, label: "1920 × 1920 · Print" },
];

/* ---------- state ---------- */
function defaultSlots() {
  const ids = ["nightcity", "convertible", "highway", "club", "beach", "rooftop", "palmstreet", "skyline", "boardwalk"];
  return ids.map((id) => ({ kind: "scene", scene: id, photoId: null, zoom: 1, ox: 0, oy: 0 }));
}
function defaultState() {
  return {
    layout: "diagonal", grade: "duotone", preset: "neon",
    title: "GTA VI", subtitle: "NEON COAST", caption: "Welcome back to Vice City",
    badge: "VICE CITY", titleSize: 128, tilt: -4, heat: 4,
    grain: true, vignette: true, activeSlot: 0,
    slots: defaultSlots(),
  };
}
let state = defaultState();
const photos = new Map(); // photoId -> HTMLImageElement
let photoSeq = 0;

/* ---------- undo / redo ---------- */
const history = { past: [], future: [] };
function snapshot() {
  return JSON.stringify({ ...state, slots: state.slots.map((s) => ({ ...s })) });
}
function commit() {
  history.past.push(snapshot());
  if (history.past.length > 60) history.past.shift();
  history.future.length = 0;
  updateUndoButtons();
}
function restore(json) {
  const s = JSON.parse(json);
  state = { ...defaultState(), ...s, slots: s.slots };
  syncInputs();
  renderAll();
}
function undo() {
  if (!history.past.length) return;
  history.future.push(snapshot());
  restore(history.past.pop());
  updateUndoButtons();
}
function redo() {
  if (!history.future.length) return;
  history.past.push(snapshot());
  restore(history.future.pop());
  updateUndoButtons();
}
function updateUndoButtons() {
  $("#undoBtn").disabled = !history.past.length;
  $("#redoBtn").disabled = !history.future.length;
}

/* ---------- layout geometry (fractions of W/H) ---------- */
function layoutPanels(layout) {
  switch (layout) {
    case "grid4": return [
      { s: 0, x: 0, y: 0, w: 0.5, h: 0.5 }, { s: 1, x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { s: 2, x: 0, y: 0.5, w: 0.5, h: 0.5 }, { s: 3, x: 0.5, y: 0.5, w: 0.5, h: 0.5 }];
    case "hero3": return [
      { s: 0, x: 0, y: 0, w: 1, h: 0.64 },
      { s: 1, x: 0, y: 0.64, w: 0.333, h: 0.36 }, { s: 2, x: 0.333, y: 0.64, w: 0.334, h: 0.36 },
      { s: 3, x: 0.667, y: 0.64, w: 0.333, h: 0.36 }];
    case "fullbleed": return [{ s: 0, x: 0, y: 0, w: 1, h: 1 }];
    case "ninegrid": return [
      { s: 0, x: 0, y: 0, w: 1 / 3, h: 1 / 3 }, { s: 1, x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { s: 2, x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 }, { s: 3, x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { s: 4, x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 }, { s: 5, x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
      { s: 6, x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 }, { s: 7, x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 }];
    case "tilted": return [
      { s: 0, x: 0.03, y: 0.02, w: 0.94, h: 0.78, tilt: -3 },
      { s: 1, x: 0.55, y: 0.68, w: 0.4, h: 0.28, tilt: 4 }];
    case "collage": return [
      { s: 0, x: 0.02, y: 0.02, w: 0.47, h: 0.42 }, { s: 1, x: 0.51, y: 0.02, w: 0.47, h: 0.42 },
      { s: 2, x: 0.02, y: 0.46, w: 0.47, h: 0.42 }, { s: 3, x: 0.51, y: 0.46, w: 0.47, h: 0.42 }];
    case "split3": return [
      { s: 0, x: 0, y: 0, w: 1 / 3, h: 1 }, { s: 1, x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { s: 2, x: 2 / 3, y: 0, w: 1 / 3, h: 1 }];
    case "band": return [
      { s: 0, x: 0, y: 0, w: 1, h: 0.38 },
      { s: 1, x: 0, y: 0.58, w: 0.5, h: 0.42 }, { s: 2, x: 0.5, y: 0.58, w: 0.5, h: 0.42 }];
    case "diagonal":
    default: return [
      { s: 0, x: 0, y: 0, w: 1, h: 0.66, diag: "tl" },
      { s: 1, x: 0, y: 0.3, w: 1, h: 0.56, diag: "br" },
      { s: 2, x: 0, y: 0.84, w: 1 / 3, h: 0.16 }, { s: 3, x: 1 / 3, y: 0.84, w: 1 / 3, h: 0.16 },
      { s: 4, x: 2 / 3, y: 0.84, w: 1 / 3, h: 0.16 }];
  }
}

/* ---------- scene painters (all art drawn in code) ---------- */
function skylineRow(ctx, x, y, w, h, rnd, base, lit) {
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.05 + rnd() * 0.09);
    const bh = h * (0.35 + rnd() * 0.65);
    ctx.fillStyle = base;
    ctx.fillRect(bx, y + h - bh, bw, bh);
    if (rnd() > 0.4) { ctx.fillRect(bx + bw * 0.3, y + h - bh - h * 0.08, bw * 0.16, h * 0.08); }
    for (let k = 0; k < 14; k++) {
      if (rnd() > 0.55) {
        ctx.fillStyle = lit;
        ctx.fillRect(bx + rnd() * bw * 0.8, y + h - bh + rnd() * bh * 0.8, Math.max(2, bw * 0.07), Math.max(2, bh * 0.05));
        ctx.fillStyle = base;
      }
    }
    bx += bw + 1;
  }
}
function palm(ctx, x, y, s, color) {
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = Math.max(2, s * 0.06);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.55, x + s * 0.28, y - s * 0.85); ctx.stroke();
  ctx.lineWidth = Math.max(1.5, s * 0.045);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.05 + i * 0.14);
    const tx = x + s * 0.28 + Math.cos(a) * s * 0.42;
    const ty = y - s * 0.85 + Math.sin(a) * s * 0.42 + s * 0.22;
    ctx.beginPath(); ctx.moveTo(x + s * 0.28, y - s * 0.85);
    ctx.quadraticCurveTo(x + s * 0.28 + Math.cos(a) * s * 0.22, y - s * 0.85 + Math.sin(a) * s * 0.2, tx, ty);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(x + s * 0.28, y - s * 0.8, s * 0.05, 0, Math.PI * 2); ctx.fill();
}
function sunDisc(ctx, x, y, r, c1, c2) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
function paintScene(ctx, scene, x, y, w, h, seed) {
  const rnd = mulberry(seed * 7919 + 13);
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  let g;
  switch (scene) {
    case "nightcity":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#12082e"); g.addColorStop(0.55, "#3d1160"); g.addColorStop(1, "#ff2e88");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      sunDisc(ctx, x + w * 0.72, y + h * 0.3, w * 0.16, "#ffe9f4", "#ff7ab8");
      skylineRow(ctx, x, y + h * 0.18, w, h * 0.82, rnd, "#0a0518", "#ffd166");
      ctx.fillStyle = "#19d3ff"; ctx.globalAlpha = 0.5;
      ctx.fillRect(x, y + h * 0.86, w, h * 0.02); ctx.globalAlpha = 1;
      break;
    case "highway": {
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#ff7a18"); g.addColorStop(0.5, "#c2185b"); g.addColorStop(1, "#1b1035");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      sunDisc(ctx, x + w * 0.5, y + h * 0.34, w * 0.13, "#fff3d6", "#ff9a3d");
      ctx.fillStyle = "#0d0a1a";
      ctx.beginPath(); ctx.moveTo(x + w * 0.32, y + h * 0.42); ctx.lineTo(x + w * 0.68, y + h * 0.42);
      ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#ffe9a8"; ctx.lineWidth = Math.max(2, w * 0.012); ctx.setLineDash([h * 0.09, h * 0.07]);
      ctx.beginPath(); ctx.moveTo(x + w * 0.5, y + h * 0.45); ctx.lineTo(x + w * 0.5, y + h); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ff2e4d";
      ctx.fillRect(x + w * 0.36, y + h * 0.62, w * 0.05, h * 0.03);
      ctx.fillRect(x + w * 0.6, y + h * 0.62, w * 0.05, h * 0.03);
      break;
    }
    case "club":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#160a2e"); g.addColorStop(1, "#3d0a3d");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#ff2e88"; ctx.fillRect(x + w * 0.08, y + h * 0.12, w * 0.84, h * 0.03);
      ctx.fillStyle = "#19d3ff"; ctx.fillRect(x + w * 0.08, y + h * 0.2, w * 0.84, h * 0.02);
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = ["#ff2e88", "#19d3ff", "#ffb020", "#7b2ff7"][i % 4];
        ctx.globalAlpha = 0.35 + rnd() * 0.6;
        ctx.beginPath(); ctx.arc(x + rnd() * w, y + rnd() * h * 0.5, 2 + rnd() * w * 0.02, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#05030a";
      for (let i = 0; i < 3; i++) {
        const px = x + w * (0.2 + i * 0.3);
        ctx.beginPath(); ctx.arc(px, y + h * 0.62, w * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(px - w * 0.07, y + h * 0.62, w * 0.14, h * 0.38);
      }
      break;
    case "beach":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#2b1055"); g.addColorStop(0.45, "#ff7e5f"); g.addColorStop(0.62, "#feb47b"); g.addColorStop(0.63, "#0e4d6e"); g.addColorStop(1, "#062a44");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      sunDisc(ctx, x + w * 0.5, y + h * 0.5, w * 0.2, "#fff8e0", "#ff9a3d");
      ctx.fillStyle = "#0a0a18";
      ctx.fillRect(x, y + h * 0.66, w, h * 0.06);
      palm(ctx, x + w * 0.12, y + h * 0.68, w * 0.34, "#081018");
      palm(ctx, x + w * 0.82, y + h * 0.7, w * 0.3, "#081018");
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + h * (0.72 + i * 0.05)); ctx.lineTo(x + w * 0.7, y + h * (0.72 + i * 0.05)); ctx.stroke();
      }
      break;
    case "rooftop":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#1b2a6b"); g.addColorStop(0.55, "#c86dd7"); g.addColorStop(1, "#ff7e5f");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      sunDisc(ctx, x + w * 0.3, y + h * 0.42, w * 0.11, "#ffe9f4", "#ff9a3d");
      skylineRow(ctx, x, y + h * 0.3, w, h * 0.5, rnd, "#14102a", "#ffb020");
      ctx.fillStyle = "#0b0714"; ctx.fillRect(x, y + h * 0.8, w, h * 0.2);
      palm(ctx, x + w * 0.85, y + h * 0.82, w * 0.26, "#05030a");
      ctx.fillStyle = "#ffd166";
      for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(x + w * (0.06 + i * 0.1), y + h * 0.82, 2.5, 0, Math.PI * 2); ctx.fill(); }
      break;
    case "palmstreet":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#ff9a3d"); g.addColorStop(0.5, "#ff2e88"); g.addColorStop(1, "#241040");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#14082a";
      ctx.beginPath(); ctx.moveTo(x + w * 0.42, y + h * 0.4); ctx.lineTo(x + w * 0.58, y + h * 0.4);
      ctx.lineTo(x + w * 0.85, y + h); ctx.lineTo(x + w * 0.15, y + h); ctx.closePath(); ctx.fill();
      palm(ctx, x + w * 0.06, y + h * 0.55, w * 0.4, "#0a0616");
      palm(ctx, x + w * 0.72, y + h * 0.5, w * 0.36, "#0a0616");
      ctx.fillStyle = "#19d3ff"; ctx.font = `900 ${Math.max(10, w * 0.09)}px Arial, sans-serif`;
      ctx.save(); ctx.translate(x + w * 0.14, y + h * 0.3); ctx.rotate(-0.06); ctx.fillText("HOTEL", 0, 0); ctx.restore();
      ctx.fillStyle = "#ff2e88"; ctx.save(); ctx.translate(x + w * 0.68, y + h * 0.36); ctx.rotate(0.05); ctx.fillText("NEON", 0, 0); ctx.restore();
      break;
    case "convertible":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#ffb020"); g.addColorStop(0.5, "#ff5e62"); g.addColorStop(1, "#3d1160");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      sunDisc(ctx, x + w * 0.68, y + h * 0.3, w * 0.17, "#fff8e0", "#ff7a18");
      palm(ctx, x + w * 0.08, y + h * 0.6, w * 0.3, "#12081f");
      ctx.fillStyle = "#c1122f";
      ctx.beginPath();
      ctx.moveTo(x + w * 0.12, y + h * 0.78); ctx.lineTo(x + w * 0.2, y + h * 0.62);
      ctx.lineTo(x + w * 0.52, y + h * 0.6); ctx.lineTo(x + w * 0.62, y + h * 0.68);
      ctx.lineTo(x + w * 0.9, y + h * 0.7); ctx.lineTo(x + w * 0.92, y + h * 0.8);
      ctx.lineTo(x + w * 0.12, y + h * 0.82); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#0d0a1a";
      ctx.beginPath(); ctx.arc(x + w * 0.28, y + h * 0.82, w * 0.055, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + w * 0.76, y + h * 0.82, w * 0.055, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e8e8f0";
      ctx.beginPath(); ctx.arc(x + w * 0.28, y + h * 0.82, w * 0.022, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + w * 0.76, y + h * 0.82, w * 0.022, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#12081f";
      ctx.beginPath(); ctx.arc(x + w * 0.46, y + h * 0.52, w * 0.045, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + w * 0.42, y + h * 0.55, w * 0.09, h * 0.09);
      break;
    case "skyline":
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#0b1035"); g.addColorStop(0.6, "#7b2ff7"); g.addColorStop(1, "#ff2e88");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      sunDisc(ctx, x + w * 0.5, y + h * 0.55, w * 0.14, "#ffe9f4", "#ffb020");
      skylineRow(ctx, x, y + h * 0.25, w, h * 0.55, rnd, "#0a0618", "#19d3ff");
      ctx.fillStyle = "rgba(255,46,136,0.35)"; ctx.fillRect(x, y + h * 0.8, w, h * 0.2);
      break;
    case "boardwalk":
    default:
      g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, "#12082e"); g.addColorStop(0.55, "#ff2e88"); g.addColorStop(1, "#19d3ff");
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#ffe9f4"; ctx.lineWidth = Math.max(2, w * 0.01);
      ctx.beginPath(); ctx.arc(x + w * 0.74, y + h * 0.34, w * 0.17, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(x + w * 0.74, y + h * 0.34);
        ctx.lineTo(x + w * 0.74 + Math.cos(a) * w * 0.17, y + h * 0.34 + Math.sin(a) * w * 0.17); ctx.stroke();
      }
      ctx.fillStyle = "#0d0a1a";
      ctx.fillRect(x, y + h * 0.72, w, h * 0.28);
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(x, y + h * (0.74 + i * 0.04)); ctx.lineTo(x + w, y + h * (0.74 + i * 0.04)); ctx.stroke();
      }
      ctx.fillStyle = "#ffb020";
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(x + w * (0.05 + i * 0.1), y + h * 0.7, 3, 0, Math.PI * 2); ctx.fill(); }
      break;
  }
  ctx.restore();
}

/* ---------- duo protagonists (stylised silhouettes, original art) ---------- */
function drawDuo(ctx, x, y, w, h) {
  ctx.save();
  // diagonal light streak behind the pair
  const g = ctx.createLinearGradient(x, y + h, x + w, y);
  g.addColorStop(0, "rgba(255,46,136,0.0)"); g.addColorStop(0.5, "rgba(255,46,136,0.28)"); g.addColorStop(1, "rgba(25,211,255,0.0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x + w * 0.55, y); ctx.lineTo(x + w * 0.75, y); ctx.lineTo(x + w * 0.2, y + h); ctx.closePath(); ctx.fill();

  const s = h; // scale unit
  // --- male lead, left: standing, holding a long weapon across his body ---
  const mx = x + w * 0.26, my = y + h * 0.92;
  ctx.fillStyle = "#0a0616"; ctx.strokeStyle = "#0a0616"; ctx.lineCap = "round";
  ctx.lineWidth = s * 0.07;
  ctx.beginPath(); ctx.moveTo(mx - s * 0.02, my - s * 0.52); ctx.lineTo(mx - s * 0.06, my); ctx.stroke(); // left leg
  ctx.beginPath(); ctx.moveTo(mx + s * 0.04, my - s * 0.52); ctx.lineTo(mx + s * 0.1, my); ctx.stroke(); // right leg
  ctx.lineWidth = s * 0.1;
  ctx.beginPath(); ctx.moveTo(mx, my - s * 0.52); ctx.lineTo(mx + s * 0.01, my - s * 0.78); ctx.stroke(); // torso
  // shoulders + hips as filled blocks so the figure reads as a body, not a stick
  ctx.fillStyle = "#0a0616";
  ctx.beginPath(); ctx.ellipse(mx, my - s * 0.76, s * 0.085, s * 0.045, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(mx + s * 0.01, my - s * 0.52, s * 0.075, s * 0.04, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + s * 0.01, my - s * 0.86, s * 0.062, 0, Math.PI * 2); ctx.fill(); // head
  ctx.lineWidth = s * 0.04;
  ctx.beginPath(); ctx.moveTo(mx, my - s * 0.74); ctx.lineTo(mx - s * 0.2, my - s * 0.58); ctx.stroke(); // arm to weapon
  ctx.beginPath(); ctx.moveTo(mx, my - s * 0.74); ctx.lineTo(mx + s * 0.16, my - s * 0.62); ctx.stroke();
  ctx.lineWidth = s * 0.022; ctx.strokeStyle = "#1c1430";
  ctx.beginPath(); ctx.moveTo(mx - s * 0.3, my - s * 0.5); ctx.lineTo(mx + s * 0.34, my - s * 0.72); ctx.stroke(); // weapon
  ctx.strokeStyle = "#ff2e88"; ctx.lineWidth = Math.max(2, s * 0.012); // pink rim light
  ctx.beginPath(); ctx.moveTo(mx + s * 0.05, my - s * 0.78); ctx.lineTo(mx + s * 0.06, my - s * 0.55); ctx.stroke();

  // --- female lead, right: leaning on a car hood ---
  const fx = x + w * 0.72, fy = y + h * 0.92;
  ctx.fillStyle = "#0a0616"; ctx.strokeStyle = "#0a0616"; ctx.lineCap = "round";
  ctx.fillStyle = "#8f1030"; // car hood she leans on
  ctx.beginPath();
  ctx.moveTo(fx - s * 0.34, fy - s * 0.3); ctx.lineTo(fx - s * 0.05, fy - s * 0.42);
  ctx.lineTo(fx + s * 0.3, fy - s * 0.4); ctx.lineTo(fx + s * 0.34, fy - s * 0.18);
  ctx.lineTo(fx - s * 0.34, fy - s * 0.16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#0a0616";
  ctx.lineWidth = s * 0.06;
  ctx.beginPath(); ctx.moveTo(fx - s * 0.08, fy - s * 0.4); ctx.lineTo(fx - s * 0.16, fy); ctx.stroke(); // legs
  ctx.beginPath(); ctx.moveTo(fx + s * 0.02, fy - s * 0.4); ctx.lineTo(fx + s * 0.1, fy - s * 0.02); ctx.stroke();
  ctx.lineWidth = s * 0.09;
  ctx.beginPath(); ctx.moveTo(fx - s * 0.03, fy - s * 0.4); ctx.lineTo(fx - s * 0.05, fy - s * 0.66); ctx.stroke(); // torso leaning
  ctx.beginPath(); ctx.ellipse(fx - s * 0.05, fy - s * 0.64, s * 0.075, s * 0.04, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(fx - s * 0.05, fy - s * 0.72, s * 0.06, 0, Math.PI * 2); ctx.fill(); // head
  ctx.lineWidth = s * 0.035; // neck joins head to torso
  ctx.beginPath(); ctx.moveTo(fx - s * 0.05, fy - s * 0.68); ctx.lineTo(fx - s * 0.05, fy - s * 0.64); ctx.stroke();
  ctx.lineWidth = s * 0.035;
  ctx.beginPath(); ctx.moveTo(fx - s * 0.05, fy - s * 0.62); ctx.lineTo(fx - s * 0.24, fy - s * 0.42); ctx.stroke(); // arm to hood
  ctx.strokeStyle = "#19d3ff"; ctx.lineWidth = Math.max(2, s * 0.012); // cyan rim light
  ctx.beginPath(); ctx.moveTo(fx - s * 0.1, fy - s * 0.66); ctx.lineTo(fx - s * 0.11, fy - s * 0.42); ctx.stroke();
  ctx.restore();
}

/* ---------- panel + photo drawing ---------- */
function drawPhotoCover(ctx, img, x, y, w, h, zoom, ox, oy) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale, dh = ih * scale;
  const dx = x + (w - dw) / 2 + ox * w;
  const dy = y + (h - dh) / 2 + oy * h;
  ctx.drawImage(img, dx, dy, dw, dh);
}
function drawSlot(ctx, slot, x, y, w, h, seed) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (slot.kind === "photo" && slot.photoId && photos.get(slot.photoId)) {
    drawPhotoCover(ctx, photos.get(slot.photoId), x, y, w, h, slot.zoom, slot.ox, slot.oy);
  } else {
    paintScene(ctx, slot.scene, x, y, w, h, seed + slot.scene.length);
    if (slot.zoom !== 1 || slot.ox || slot.oy) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x, y, w, h);
    }
  }
  ctx.restore();
}

/* ---------- grades ---------- */
function applyGrade(ctx, W, H, grade) {
  ctx.save();
  const ops = {
    sunset: [["soft-light", 0.85, "#ff9a3d", "#7b2ff7"], ["overlay", 0.3, "#ff7e5f", "#3d1160"]],
    duotone: [["color", 0.62, "#19d3ff", "#ff2e88"], ["overlay", 0.42, "#19d3ff", "#ff2e88"]],
    magenta: [["color", 0.55, "#ff00a8", "#00e5ff"], ["overlay", 0.3, "#ff00a8", "#00e5ff"]],
    heat: [["overlay", 0.5, "#ffdd00", "#ff3d00"], ["soft-light", 0.4, "#ff3d00", "#7a0e00"]],
    palm: [["soft-light", 0.75, "#2b1055", "#ff7e5f"], ["overlay", 0.25, "#ff7e5f", "#2b1055"]],
    chrome: [["color", 0.35, "#8fa8c0", "#274b63"], ["overlay", 0.3, "#bfe3ff", "#0b1c2c"]],
    halftone: [["overlay", 0.35, "#111111", "#ffffff"]],
  }[grade] || [];
  for (const [mode, alpha, c1, c2] of ops) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha;
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  if (grade === "halftone") {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    const step = Math.max(7, W / 130);
    for (let yy = step / 2; yy < H; yy += step) {
      for (let xx = step / 2; xx < W; xx += step) {
        const r = step * 0.16 * (0.6 + 0.4 * Math.sin(xx * 0.01 + yy * 0.013));
        ctx.beginPath(); ctx.arc(xx, yy, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  ctx.restore();
}

/* ---------- title block ---------- */
function drawTitleBlock(ctx, W, H, st, area) {
  const cx = area.x + area.w / 2, cy = area.y + area.h / 2;
  const size = (st.titleSize * area.w) / 1080;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((st.tilt * Math.PI) / 180);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // chromatic shadows
  ctx.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,46,136,0.85)";
  ctx.fillText(st.title, 5, 5);
  ctx.fillStyle = "rgba(25,211,255,0.85)";
  ctx.fillText(st.title, -5, -3);
  // chrome fill
  const cg = ctx.createLinearGradient(0, -size * 0.55, 0, size * 0.55);
  cg.addColorStop(0, "#ffffff"); cg.addColorStop(0.35, "#c8d6e5"); cg.addColorStop(0.55, "#5a6b7d");
  cg.addColorStop(0.75, "#f2f6fa"); cg.addColorStop(1, "#8fa3b8");
  ctx.fillStyle = cg;
  ctx.strokeStyle = "rgba(10,5,20,0.9)"; ctx.lineWidth = Math.max(3, size * 0.045);
  ctx.strokeText(st.title, 0, 0);
  ctx.fillText(st.title, 0, 0);
  // distressed grit: punch tiny specks out of the letters
  const rnd = mulberry(st.title.length * 31 + 7);
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 26; i++) {
    const px = (rnd() - 0.5) * size * 3.4, py = (rnd() - 0.5) * size * 0.9;
    ctx.fillRect(px, py, size * 0.02 + rnd() * size * 0.03, 1.5);
  }
  ctx.globalCompositeOperation = "source-over";
  // subtitle — neon script feel (bold italic)
  ctx.font = `italic 900 ${size * 0.24}px Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ff2e88"; ctx.shadowBlur = size * 0.12;
  ctx.fillText(st.subtitle, 0, size * 0.62);
  ctx.shadowBlur = 0;
  // caption line
  ctx.font = `${size * 0.15}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fillText(st.caption, 0, size * 0.88);
  ctx.restore();

  // badge ribbon (top-right of the title area)
  ctx.save();
  ctx.translate(area.x + area.w * 0.86, area.y + area.h * 0.08);
  ctx.rotate(0.1);
  ctx.fillStyle = "#ff2e88";
  const bw = Math.max(90, area.w * 0.24), bh = Math.max(22, area.h * 0.16);
  ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.fillStyle = "#fff"; ctx.font = `900 ${Math.max(11, bh * 0.5)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(st.badge, 0, 1);
  ctx.restore();

  // heat meter — stars under the subtitle
  const sx = area.x + area.w * 0.08, sy = area.y + area.h * 0.86;
  const sr = Math.max(9, area.w * 0.02);
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, sx + i * sr * 2.4, sy, sr, i < st.heat ? "#ffb020" : "rgba(255,255,255,0.25)");
  }
}
function drawStar(ctx, x, y, r, color) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

/* ---------- cover render ---------- */
let noiseCanvas = null;
function getNoise() {
  if (noiseCanvas) return noiseCanvas;
  noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = 180; noiseCanvas.height = 180;
  const nctx = noiseCanvas.getContext("2d");
  const img = nctx.createImageData(180, 180);
  const rnd = mulberry(42);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  nctx.putImageData(img, 0, 0);
  return noiseCanvas;
}
function titleAreaFor(layout, W, H) {
  switch (layout) {
    case "ninegrid": return { x: W / 3, y: H / 3, w: W / 3, h: H / 3 };
    case "band": return { x: 0, y: H * 0.38, w: W, h: H * 0.2 };
    case "collage": return { x: 0, y: H * 0.88, w: W, h: H * 0.12 };
    case "tilted": return { x: W * 0.05, y: H * 0.02, w: W * 0.6, h: H * 0.2 };
    case "diagonal": return { x: W * 0.04, y: H * 0.6, w: W * 0.92, h: H * 0.24 };
    case "hero3": return { x: 0, y: H * 0.44, w: W, h: H * 0.2 };
    case "split3": return { x: 0, y: H * 0.62, w: W, h: H * 0.3 };
    case "grid4": return { x: 0, y: H * 0.68, w: W, h: H * 0.28 };
    case "fullbleed":
    default: return { x: 0, y: H * 0.6, w: W, h: H * 0.34 };
  }
}
function renderCover(ctx, W, H, st) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b0714"; ctx.fillRect(0, 0, W, H);
  const panels = layoutPanels(st.layout);
  const border = Math.max(3, W * 0.006);
  for (const p of panels) {
    const px = p.x * W, py = p.y * H, pw = p.w * W, ph = p.h * H;
    ctx.save();
    if (p.tilt) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.translate(-pw / 2, -ph / 2);
      drawSlot(ctx, st.slots[p.s], 0, 0, pw, ph, p.s + 3);
      ctx.restore();
    } else if (p.diag === "tl") {
      ctx.beginPath();
      ctx.moveTo(px, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw * 0.18, py + ph);
      ctx.lineTo(px, py + ph); ctx.closePath(); ctx.clip();
      drawSlot(ctx, st.slots[p.s], px, py, pw, ph, p.s + 3);
      ctx.restore();
    } else if (p.diag === "br") {
      ctx.beginPath();
      ctx.moveTo(px + pw, py); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px, py + ph);
      ctx.lineTo(px + pw * 0.82, py); ctx.closePath(); ctx.clip();
      drawSlot(ctx, st.slots[p.s], px, py, pw, ph, p.s + 3);
      ctx.restore();
    } else {
      drawSlot(ctx, st.slots[p.s], px, py, pw, ph, p.s + 3);
      ctx.restore();
    }
    // firm panel borders (the collage look)
    ctx.save();
    ctx.strokeStyle = st.layout === "collage" ? "#f4eefc" : "rgba(244,238,252,0.85)";
    ctx.lineWidth = st.layout === "collage" ? border * 2 : border;
    ctx.strokeRect(px + border / 2, py + border / 2, pw - border, ph - border);
    ctx.restore();
  }
  // duo protagonists on the hero layouts
  if (st.layout === "diagonal" || st.layout === "fullbleed" || st.layout === "hero3") {
    const dy = st.layout === "diagonal" ? H * 0.08 : H * 0.18;
    const dh = st.layout === "diagonal" ? H * 0.58 : H * 0.5;
    drawDuo(ctx, W * 0.05, dy, W * 0.9, dh);
  }
  // nine-panel title block background
  if (st.layout === "ninegrid") {
    ctx.save();
    ctx.fillStyle = "#0b0714";
    ctx.fillRect(W / 3, H / 3, W / 3, H / 3);
    ctx.strokeStyle = "#ff2e88"; ctx.lineWidth = Math.max(3, W * 0.006);
    ctx.strokeRect(W / 3, H / 3, W / 3, H / 3);
    ctx.restore();
  }
  // title block
  const ta = titleAreaFor(st.layout, W, H);
  drawTitleBlock(ctx, W, H, st, ta);
  // grade across the whole cover
  applyGrade(ctx, W, H, st.grade);
  // grain + vignette
  if (st.grain) {
    ctx.save(); ctx.globalAlpha = 0.07;
    const pat = ctx.createPattern(getNoise(), "repeat");
    ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  if (st.vignette) {
    const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
}

/* ---------- main render + thumbnails ---------- */
const coverCanvas = $("#cover");
function renderAll() {
  const ctx = coverCanvas.getContext("2d");
  renderCover(ctx, coverCanvas.width, coverCanvas.height, state);
  const lay = LAYOUTS.find((l) => l.id === state.layout);
  const gr = GRADES.find((g) => g.id === state.grade);
  $("#stageLabel").textContent = `Live cover — ${lay ? lay.name : state.layout} · ${gr ? gr.name : state.grade}`;
  $$("#layoutGrid .btn").forEach((b) => b.classList.toggle("active", b.dataset.id === state.layout));
  $$("#gradeGrid .btn").forEach((b) => b.classList.toggle("active", b.dataset.id === state.grade));
  $$("#presetList .preset-card").forEach((b) => b.classList.toggle("sel", b.dataset.id === state.preset));
  $$(".slot").forEach((el, i) => el.classList.toggle("sel", i === state.activeSlot));
  renderLayoutStrip();
}
function renderLayoutStrip() {
  const strip = $("#layoutStrip");
  if (!strip.children.length) {
    for (const l of LAYOUTS) {
      const c = document.createElement("canvas");
      c.width = 148; c.height = 184; c.title = l.name; c.dataset.id = l.id;
      c.addEventListener("click", () => { commit(); state.layout = l.id; state.preset = ""; renderAll(); });
      strip.appendChild(c);
    }
  }
  Array.from(strip.children).forEach((c) => {
    const tmp = { ...state, layout: c.dataset.id };
    renderCover(c.getContext("2d"), c.width, c.height, tmp);
    c.classList.toggle("sel", c.dataset.id === state.layout);
  });
}
function paintSceneThumbs() {
  $$(".scene-btn canvas").forEach((c) => {
    paintScene(c.getContext("2d"), c.dataset.scene, 0, 0, c.width, c.height, 5);
  });
  $$(".slot canvas").forEach((c) => {
    const slot = state.slots[+c.dataset.slot];
    if (slot.kind === "photo" && slot.photoId && photos.get(slot.photoId)) {
      drawPhotoCover(c.getContext("2d"), photos.get(slot.photoId), 0, 0, c.width, c.height, 1, 0, 0);
    } else {
      paintScene(c.getContext("2d"), slot.scene, 0, 0, c.width, c.height, +c.dataset.slot + 3);
    }
  });
  $$(".swatch").forEach((sw) => {
    const tmp = { ...state, grade: sw.dataset.grade };
    renderCover(sw.getContext("2d"), sw.width, sw.height, tmp);
    sw.classList.toggle("sel", sw.dataset.grade === state.grade);
  });
}

/* ---------- UI build ---------- */
function buildUI() {
  // layouts
  $("#layoutGrid").innerHTML = LAYOUTS.map((l) =>
    `<button class="btn" data-id="${l.id}">${l.name}<small>${l.desc}</small></button>`).join("");
  $$("#layoutGrid .btn").forEach((b) => b.addEventListener("click", () => {
    commit(); state.layout = b.dataset.id; state.preset = ""; renderAll();
  }));
  // grades
  $("#gradeGrid").innerHTML = GRADES.map((g) =>
    `<button class="btn" data-id="${g.id}">${g.name}<small>${g.desc}</small></button>`).join("");
  $$("#gradeGrid .btn").forEach((b) => b.addEventListener("click", () => {
    commit(); state.grade = b.dataset.id; state.preset = ""; renderAll(); paintSceneThumbs();
  }));
  // grade swatches: duotone vs sunset vs halftone
  $("#gradeSwatches").innerHTML = ["duotone", "sunset", "halftone"].map((g) =>
    `<canvas class="swatch" data-grade="${g}" width="180" height="120" title="${g}"></canvas>`).join("");
  $$(".swatch").forEach((sw) => sw.addEventListener("click", () => {
    commit(); state.grade = sw.dataset.grade; renderAll(); paintSceneThumbs();
  }));
  // presets
  $("#presetList").innerHTML = PRESETS.map((p) =>
    `<button class="preset-card" data-id="${p.id}"><b>${p.name}</b><small>${p.desc}</small></button>`).join("");
  $$("#presetList .preset-card").forEach((b) => b.addEventListener("click", () => {
    const p = PRESETS.find((x) => x.id === b.dataset.id);
    commit();
    state.preset = p.id; state.layout = p.layout; state.grade = p.grade;
    state.title = p.title; state.subtitle = p.subtitle; state.badge = p.badge;
    syncInputs(); renderAll(); paintSceneThumbs();
  }));
  // scenes (both galleries)
  const sceneHtml = SCENES.map((s) =>
    `<button class="scene-btn" data-scene="${s.id}"><canvas data-scene="${s.id}" width="180" height="90"></canvas><span>${s.name}</span></button>`).join("");
  $("#sceneGrid").innerHTML = sceneHtml;
  $("#sceneGrid2").innerHTML = sceneHtml;
  $$(".scene-btn").forEach((b) => b.addEventListener("click", () => {
    commit();
    const slot = state.slots[state.activeSlot];
    slot.kind = "scene"; slot.scene = b.dataset.scene; slot.photoId = null; slot.zoom = 1; slot.ox = 0; slot.oy = 0;
    renderAll(); paintSceneThumbs(); setStatus(`Scene “${b.dataset.scene}” loaded into panel ${state.activeSlot + 1}.`);
  }));
  // slots
  $("#slotGrid").innerHTML = state.slots.map((s, i) =>
    `<div class="slot" data-slot="${i}"><canvas data-slot="${i}" width="120" height="150"></canvas></div>`).join("");
  $$(".slot").forEach((el) => el.addEventListener("click", () => {
    state.activeSlot = +el.dataset.slot; syncCropInputs(); renderAll();
  }));
  // export sizes
  $("#exportGrid").innerHTML = EXPORT_SIZES.map((s, i) =>
    `<button class="btn" data-i="${i}">${s.label}</button>`).join("");
  $$("#exportGrid .btn").forEach((b) => b.addEventListener("click", () => {
    exportOne(EXPORT_SIZES[+b.dataset.i]);
  }));
  // tabs
  $$("#tabs button").forEach((b) => b.addEventListener("click", () => activateTab(b.dataset.tab)));
  renderSavedList();
}
function activateTab(name) {
  $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".tab-page").forEach((p) => { p.hidden = p.dataset.page !== name; });
}
function renderSavedList() {
  const saved = JSON.parse(localStorage.getItem("ncc-saved") || "[]");
  $("#savedList").innerHTML = saved.length
    ? `<h3>Saved looks</h3>` + saved.map((s, i) =>
      `<button class="preset-card" data-saved="${i}"><b>${s.name}</b><small>${s.layout} · ${s.grade}</small></button>`).join("")
    : "";
  $$("#savedList .preset-card").forEach((b) => b.addEventListener("click", () => {
    const s = JSON.parse(localStorage.getItem("ncc-saved") || "[]")[+b.dataset.saved];
    commit(); Object.assign(state, JSON.parse(s.json)); syncInputs(); renderAll(); paintSceneThumbs();
  }));
}
function setStatus(msg) { $("#statusLine").textContent = msg; }

/* ---------- inputs ---------- */
function syncInputs() {
  $("#titleInput").value = state.title;
  $("#titleInput2").value = state.title;
  $("#subtitleInput").value = state.subtitle;
  $("#subtitleInput2").value = state.subtitle;
  $("#captionInput").value = state.caption;
  $("#badgeInput").value = state.badge;
  $("#titleSizeSlider").value = state.titleSize;
  $("#tiltSlider").value = state.tilt;
  $("#heatSlider").value = state.heat;
  $("#grainToggle").checked = state.grain;
  $("#vignetteToggle").checked = state.vignette;
  syncCropInputs();
}
function syncCropInputs() {
  const s = state.slots[state.activeSlot];
  $("#zoomSlider").value = s.zoom;
  $("#panXSlider").value = s.ox;
  $("#panYSlider").value = s.oy;
}
function bindInputs() {
  const text = (id, key) => $(id).addEventListener("input", (e) => { state[key] = e.target.value; renderAll(); });
  text("#titleInput", "title"); text("#subtitleInput", "subtitle");
  text("#captionInput", "caption"); text("#badgeInput", "badge");
  // quick-caption mirrors on the Grades tab
  $("#titleInput2").addEventListener("input", (e) => { state.title = e.target.value; $("#titleInput").value = state.title; renderAll(); });
  $("#subtitleInput2").addEventListener("input", (e) => { state.subtitle = e.target.value; $("#subtitleInput").value = state.subtitle; renderAll(); });
  $("#titleInput2").addEventListener("change", commit);
  $("#subtitleInput2").addEventListener("change", commit);
  $("#titleInput").addEventListener("change", commit);
  $("#subtitleInput").addEventListener("change", commit);
  $("#captionInput").addEventListener("change", commit);
  $("#badgeInput").addEventListener("change", commit);
  $("#titleSizeSlider").addEventListener("input", (e) => { state.titleSize = +e.target.value; renderAll(); });
  $("#titleSizeSlider").addEventListener("change", commit);
  $("#tiltSlider").addEventListener("input", (e) => { state.tilt = +e.target.value; renderAll(); });
  $("#tiltSlider").addEventListener("change", commit);
  $("#heatSlider").addEventListener("input", (e) => { state.heat = +e.target.value; renderAll(); });
  $("#heatSlider").addEventListener("change", commit);
  $("#grainToggle").addEventListener("change", (e) => { commit(); state.grain = e.target.checked; renderAll(); });
  $("#vignetteToggle").addEventListener("change", (e) => { commit(); state.vignette = e.target.checked; renderAll(); });
  $("#zoomSlider").addEventListener("input", (e) => { state.slots[state.activeSlot].zoom = +e.target.value; renderAll(); });
  $("#zoomSlider").addEventListener("change", commit);
  $("#panXSlider").addEventListener("input", (e) => { state.slots[state.activeSlot].ox = +e.target.value; renderAll(); });
  $("#panXSlider").addEventListener("change", commit);
  $("#panYSlider").addEventListener("input", (e) => { state.slots[state.activeSlot].oy = +e.target.value; renderAll(); });
  $("#panYSlider").addEventListener("change", commit);
  $("#resetCropBtn").addEventListener("click", () => {
    commit();
    const s = state.slots[state.activeSlot];
    s.zoom = 1; s.ox = 0; s.oy = 0; syncCropInputs(); renderAll();
  });
  $("#undoBtn").addEventListener("click", undo);
  $("#redoBtn").addEventListener("click", redo);
  $("#savePresetBtn").addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("ncc-saved") || "[]");
    const snap = { ...state, slots: state.slots.map((s) => ({ ...s })) };
    saved.push({ name: `${state.preset || state.layout} · ${new Date().toLocaleTimeString()}`, layout: state.layout, grade: state.grade, json: JSON.stringify(snap) });
    localStorage.setItem("ncc-saved", JSON.stringify(saved));
    renderSavedList(); setStatus("Look saved in this browser.");
  });
  $("#exportAllBtn").addEventListener("click", exportAll);
  $("#exportAllBtn2").addEventListener("click", exportAll);
  // photo upload
  $("#photoInput").addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const id = `p${++photoSeq}`;
          photos.set(id, img);
          const slot = state.slots[state.activeSlot];
          commit();
          slot.kind = "photo"; slot.photoId = id; slot.zoom = 1; slot.ox = 0; slot.oy = 0;
          addPhotoThumb(id, img);
          renderAll(); paintSceneThumbs();
          setStatus(`Photo loaded into panel ${state.activeSlot + 1}.`);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(f);
    });
    e.target.value = "";
  });
  // drag to pan + wheel to zoom on the cover
  let dragging = false, lastX = 0, lastY = 0;
  coverCanvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; coverCanvas.setPointerCapture(e.pointerId); });
  coverCanvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const s = state.slots[state.activeSlot];
    s.ox = clamp(s.ox + (e.clientX - lastX) / coverCanvas.clientWidth, -0.5, 0.5);
    s.oy = clamp(s.oy + (e.clientY - lastY) / coverCanvas.clientHeight, -0.5, 0.5);
    lastX = e.clientX; lastY = e.clientY;
    syncCropInputs(); renderAll();
  });
  coverCanvas.addEventListener("pointerup", () => { if (dragging) { dragging = false; commit(); } });
  coverCanvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const s = state.slots[state.activeSlot];
    s.zoom = clamp(s.zoom * (e.deltaY < 0 ? 1.08 : 0.93), 1, 3);
    syncCropInputs(); renderAll();
  }, { passive: false });
}
function addPhotoThumb(id, img) {
  const el = document.createElement("img");
  el.src = img.src; el.title = "Your photo"; el.dataset.pid = id;
  el.addEventListener("click", () => {
    commit();
    const slot = state.slots[state.activeSlot];
    slot.kind = "photo"; slot.photoId = id; slot.zoom = 1; slot.ox = 0; slot.oy = 0;
    $$("#photoThumbs img").forEach((t) => t.classList.toggle("sel", t === el));
    renderAll(); paintSceneThumbs();
  });
  $("#photoThumbs").appendChild(el);
}
function loadSamplePhotos() {
  for (const [name, file] of [["Boulevard", "samples/boulevard.jpg"], ["Pier", "samples/pier.jpg"]]) {
    const img = new Image();
    img.onload = () => {
      const id = `sample-${name.toLowerCase()}`;
      photos.set(id, img);
      const el = document.createElement("img");
      el.src = img.src; el.title = `Sample: ${name}`; el.dataset.pid = id;
      el.addEventListener("click", () => {
        commit();
        const slot = state.slots[state.activeSlot];
        slot.kind = "photo"; slot.photoId = id; slot.zoom = 1; slot.ox = 0; slot.oy = 0;
        renderAll(); paintSceneThumbs();
        setStatus(`Sample photo “${name}” placed in panel ${state.activeSlot + 1}.`);
      });
      $("#photoThumbs").appendChild(el);
    };
    img.onerror = () => setStatus(`Sample photo ${file} not found — scenes still work.`);
    img.src = file;
  }
}

/* ---------- export ---------- */
function renderExportCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  renderCover(c.getContext("2d"), w, h, state);
  return c;
}
function downloadCanvas(canvas, filename) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      resolve(blob ? blob.size : 0);
    }, "image/png");
  });
}
async function exportOne(size) {
  const canvas = renderExportCanvas(size.w, size.h);
  const bytes = await downloadCanvas(canvas, `neon-coast-${size.w}x${size.h}.png`);
  $("#exportStatus").textContent = `Exported ${size.w}×${size.h} PNG (${Math.round(bytes / 1024)} KiB).`;
  setStatus(`Exported ${size.w}×${size.h}.`);
  showExportThumb(canvas, size);
  return bytes;
}
async function exportAll() {
  $("#exportStatus").textContent = "Exporting all 6 sizes…";
  let total = 0;
  for (const s of EXPORT_SIZES) {
    total += await exportOne(s);
    await new Promise((r) => setTimeout(r, 120));
  }
  $("#exportStatus").textContent = `All 6 sizes exported (${Math.round(total / 1024)} KiB total).`;
  setStatus("All 6 sizes exported.");
}
function showExportThumb(canvas, size) {
  const box = $("#exportPreview");
  box.hidden = false;
  const t = $("#exportThumb");
  const tctx = t.getContext("2d");
  tctx.clearRect(0, 0, t.width, t.height);
  tctx.drawImage(canvas, 0, 0, t.width, t.height);
  $("#exportMeta").textContent = `${size.w} × ${size.h} PNG`;
  $("#sizePill").textContent = `${size.w} × ${size.h}`;
}

/* ---------- shot modes (for screenshots) ---------- */
function applyShotMode() {
  const shot = new URLSearchParams(location.search).get("shot");
  if (!shot) return;
  if (shot === "1") {
    const canvas = renderExportCanvas(1080, 1080);
    showExportThumb(canvas, { w: 1080, h: 1080 });
    activateTab("layout");
  } else if (shot === "2") {
    state.layout = "ninegrid"; state.grade = "duotone";
    activateTab("layout");
  } else if (shot === "3") {
    state.grade = "duotone";
    activateTab("grade");
  } else if (shot === "4") {
    activateTab("export");
  }
  renderAll(); paintSceneThumbs();
}

/* ---------- init ---------- */
buildUI();
bindInputs();
syncInputs();
loadSamplePhotos();
applyShotMode();
renderAll();
paintSceneThumbs();
updateUndoButtons();
window.__studio = {
  state: () => state,
  counts: () => ({ layouts: LAYOUTS.length, grades: GRADES.length, presets: PRESETS.length, sizes: EXPORT_SIZES.length, scenes: SCENES.length }),
  exportDataURL: (w, h) => renderExportCanvas(w, h).toDataURL("image/png").length,
  exportSizes: () => EXPORT_SIZES,
};
window.__shotReady = true;
