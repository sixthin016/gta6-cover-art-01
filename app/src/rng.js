// Deterministic seeded random numbers (mulberry32). Every procedural scene
// and texture in Vice Cover Studio derives from a fixed seed, so the same
// state always paints the same pixels — the cover export is byte-stable.

/** Returns a function that yields pseudo-random numbers in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks an item from `list` using `rand`. */
export function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

/** Random number in [min, max). */
export function range(rand, min, max) {
  return min + rand() * (max - min);
}
