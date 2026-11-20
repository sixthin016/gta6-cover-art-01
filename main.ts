// Neon Coast — entry program for the gta6-cover-art-01 bounty.
// Copies the built web app (app/) and its screenshots (screenshots/) from beside
// this file into the output directory, then writes dossier.json there using the
// kit's vendored dossier builder. Node 22, standard library only.
import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

await mkdir(outDir, { recursive: true });
await cp(join(here, "app"), join(outDir, "app"), { recursive: true });
await cp(join(here, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossierText = await buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots_max: 4,
  screenshot_max_bytes: 262144,
  app_max_files: 993,
  app_max_bytes: 50331648,
});
await writeFile(join(outDir, "dossier.json"), dossierText, "utf8");
console.log("dossier written:", outDir + "/dossier.json", Buffer.byteLength(dossierText, "utf8"), "bytes");
