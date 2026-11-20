// Tiny static server for app/ — development convenience only.
// Serves on port 8080, or --port <n>. Refuses any path outside app/.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(join(fileURLToPath(new URL(".", import.meta.url)), "app"));
const args = process.argv.slice(2);
let port = 8080;
const portIdx = args.indexOf("--port");
if (portIdx !== -1 && args[portIdx + 1]) port = Number(args[portIdx + 1]) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/") rel = "/index.html";
    const filePath = resolve(join(appRoot, normalize(rel)));
    if (!filePath.startsWith(appRoot + "/") && filePath !== appRoot) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("Forbidden\n");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found\n");
  }
});

server.listen(port, () => {
  console.log(`Neon Coast studio at http://localhost:${port}`);
});
