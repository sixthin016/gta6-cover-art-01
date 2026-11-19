// Hand-in builder for the gta6-cover-art-01 entry.
//
// The entry itself lives next to this file: app/ is the cover-maker web app
// (plain static files a desktop browser loads offline, app/index.html plus its
// ES modules, no library and no network request) and screenshots/ holds 3 or 4
// PNG or JPEG renders of it, the first by name being the cover.
//
// This program stages the hand-in and nothing else:
//   1. checks that app/ is really there and that screenshots/, when present,
//      is a folder, so a typo fails loudly instead of handing in half an entry;
//   2. copies app/ and screenshots/ into the hand-in directory;
//   3. asks the vendored make.fun library to summarise the staged entry and
//      writes that summary as dossier.json, the file the judge reads;
//   4. prints a short report of what was staged, for the build log.
//
// The hand-in directory is /output inside the grader's container. Anywhere
// else, MAKEFUN_OUTPUT_DIR stands in for it:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it locally first with `node serve.ts` and http://localhost:8080 to see
// the app itself. Node 22 or newer, standard library only, no install step.

import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

/** How many files a staging pass moved, and how many bytes they came to. */
interface Staged {
  files: number;
  bytes: number;
}

/** The caps the scorer's gate.json sets for this bounty. Only text_max_bytes
 *  shapes the dossier's bytes; the rest make this program refuse an entry the
 *  scorer would refuse anyway (more than 4 screenshots or one over 256 KiB;
 *  more than 993 files in app/ or 48 MiB of app files in all, or a path under
 *  app/ over 1000 bytes — app/ counts beside /output's own 1000-entry cap,
 *  together with its screenshots/ and dossier.json). */
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

/** The folder this file sits in, and the hand-in directory it stages into. */
const repoDir = dirname(fileURLToPath(import.meta.url));
const handInDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** A path that must be a directory, or a plain-English reason it is not. */
function requireFolder(path: string, label: string): void {
  if (!existsSync(path)) throw new Error(`${label}: no such folder (${path})`);
  if (!lstatSync(path).isDirectory()) throw new Error(`${label}: not a folder (${path})`);
}

/**
 * Copy a folder tree file by file into `target`, creating directories as it
 * goes, and tally what moved into `tally`. Plain files and directories only:
 * anything else (a symlink, a socket) stops the build with a clear error
 * instead of silently staging something the scorer would refuse.
 */
function stageTree(source: string, target: string, tally: Staged): void {
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) {
      stageTree(from, to, tally);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
      tally.files += 1;
      tally.bytes += statSync(from).size;
    } else {
      throw new Error(`cannot stage ${from}: not a plain file or directory`);
    }
  }
}

/** Print the build report: what was staged and how big the dossier came out. */
function reportBuild(app: Staged, shots: Staged, dossierBytes: number): void {
  console.log(`hand-in ready: ${handInDir}`);
  console.log(`  app: ${app.files} files, ${app.bytes} bytes`);
  console.log(`  screenshots: ${shots.files} files, ${shots.bytes} bytes`);
  console.log(`  dossier.json: ${dossierBytes} bytes`);
}

// ------------------------------------------------------------------ the build

const appDir = join(repoDir, 'app');
const shotsDir = join(repoDir, 'screenshots');

requireFolder(appDir, 'app/');
if (existsSync(shotsDir)) requireFolder(shotsDir, 'screenshots/');

mkdirSync(handInDir, { recursive: true });

const stagedApp: Staged = { files: 0, bytes: 0 };
const stagedShots: Staged = { files: 0, bytes: 0 };

stageTree(appDir, join(handInDir, 'app'), stagedApp);

// screenshots/ always exists in the hand-in, even when the repo has none yet,
// so the dossier builder sees the same shape either way.
mkdirSync(join(handInDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) stageTree(shotsDir, join(handInDir, 'screenshots'), stagedShots);

const dossier = buildDossier(handInDir, DOSSIER_CAPS);
writeFileSync(join(handInDir, 'dossier.json'), dossier);

reportBuild(stagedApp, stagedShots, dossier.length);
