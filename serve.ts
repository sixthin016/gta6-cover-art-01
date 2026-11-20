/* Neon Coast Cover Studio — tiny static server for app/ (dev convenience only).
   Node 22+ standard library only. Serves on port 8080, or --port <n>. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "app");
function dirname(p) { return p.slice(0, p.lastIndexOf("/")) || "/"; }

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
  ".svg": "image/svg+xml",
};

let port = 8080;
const portArg = process.argv.indexOf("--port");
if (portArg !== -1 && process.argv[portArg + 1]) port = Number(process.argv[portArg + 1]);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    let rel = decodeURIComponent(url.pathname);
    if (rel === "/") rel = "/index.html";
    const file = resolve(join(appDir, normalize(rel).replace(/^(\.\.[/\\])+/, "")));
    if (!file.startsWith(appDir + sep) && file !== appDir) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("forbidden");
      return;
    }
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  }
});

server.listen(port, () => console.log(`Neon Coast Cover Studio at http://localhost:${port}`));
