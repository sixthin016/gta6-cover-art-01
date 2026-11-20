// Neon Coast — entry program for make.fun gta6-cover-art-01.
// Copies app/ and screenshots/ from beside this file into the output
// directory (MAKEFUN_OUTPUT_DIR, or /output), then writes dossier.json
// there with the vendored dossier builder.
import { buildDossier } from "./vendor/makefun-app.ts";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

await mkdir(join(outDir, "app"), { recursive: true });
await mkdir(join(outDir, "screenshots"), { recursive: true });
await cp(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
await cp(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossier = await buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots_max: 4,
  screenshot_max_bytes: 262144,
  app_max_files: 993,
  app_max_bytes: 50331648,
});
await writeFile(join(outDir, "dossier.json"), dossier);
console.log(`dossier written: ${join(outDir, "dossier.json")} (${dossier.length} bytes)`);
