// Fixed scenes for screenshots: ?shot=editor shows the page with demo photos loaded;
// ?shot=cover shows the exported cover alone, at the size the query asks for.
// window.__shotReady is set once painted.
export async function runShot(shot, query, render) {
  const canvas = document.getElementById('cover');
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const w = Number(query.get('w')) || 1080;
    const h = Number(query.get('h')) || 1080;
    canvas.width = w; canvas.height = h;
    if (render) render();
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__shotReady = true;
}
