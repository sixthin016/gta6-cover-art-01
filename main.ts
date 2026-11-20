/* Neon Coast — entry program for make.fun gta6-cover-art-01.
   Copies app/ and screenshots/ next to this file into the output directory
   (MAKEFUN_OUTPUT_DIR, or /output), then writes dossier.json with the
   vendored dossier builder. Node 22, standard library only. */
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

await mkdir(outDir, { recursive: true });
await cp(join(here, 'app'), join(outDir, 'app'), { recursive: true });
await cp(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = await buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots_max: 4,
  screenshot_max_bytes: 262144,
  app_max_files: 993,
  app_max_bytes: 50331648,
});
/* buildDossier returns the dossier as raw bytes (a Uint8Array); write those
   bytes out exactly, without re-encoding them as JSON. */
await writeFile(join(outDir, 'dossier.json'), dossier);
console.log('dossier written to', join(outDir, 'dossier.json'));
