/* Neon Coast Cover Studio — entry program.
   Copies app/ and screenshots/ into the output directory, then builds
   the dossier with the vendored make.fun library and writes dossier.json. */
import { buildDossier } from "./vendor/makefun-app.ts";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outDir, { recursive: true });

for (const name of ["app", "screenshots"]) {
  const src = join(repoDir, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) continue;
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots_max: 4,
  screenshot_max_bytes: 262144,
  app_max_files: 993,
  app_max_bytes: 50331648,
});

const text =
  typeof dossier === "string"
    ? dossier
    : dossier instanceof Uint8Array
      ? new TextDecoder().decode(dossier)
      : JSON.stringify(dossier, null, 2);
writeFileSync(join(outDir, "dossier.json"), text);
console.log(`dossier written: ${join(outDir, "dossier.json")} (${text.length} bytes)`);
