/**
 * Captures the README screenshots from the real app and writes them to docs/media/.
 *
 * Usage:
 *   npm run capture:media                       # builds, boots `vite preview`, captures, shuts down
 *   CVIRE_URL=http://127.0.0.1:5173 npm run capture:media   # reuse an already-running app
 *
 * The shots are deterministic: they always use the seeded demo profile, a fixed
 * viewport, and animations disabled, so re-running only produces a diff when the
 * UI actually changed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'docs', 'media');

const VIEWPORT = { width: 1440, height: 900 };
const SCALE = 1.5;
const PREVIEW_PORT = 4179;

/**
 * Boot `vite preview` on a fixed port and resolve once it answers.
 *
 * The vite bin is invoked directly (not through npx) and `unref`ed so the
 * capture process can exit cleanly once the child is killed.
 */
async function startPreviewServer() {
  const bin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(
    process.execPath,
    [bin, 'preview', '--port', String(PREVIEW_PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore' }
  );
  child.unref();

  const url = `http://127.0.0.1:${PREVIEW_PORT}/`;
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return { url, child };
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  child.kill('SIGKILL');
  throw new Error(`vite preview did not answer on ${url} within 30s`);
}

async function waitForApp(page, baseUrl) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page
    .getByText('Initializing cvire local database...')
    .waitFor({ state: 'hidden', timeout: 30_000 })
    .catch(() => {});
  await page.waitForSelector('text=Senior Frontend Engineer', { timeout: 30_000 });
  await page.waitForTimeout(400);
}

async function shot(page, name, options = {}) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, ...options });
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`  ✓ docs/media/${name}.png (${kb}KB)`);
  return file;
}

async function openDemoEditor(page) {
  await page.getByText('Senior Frontend Engineer (US Remote)').first().click();
  await page.waitForSelector('.a4-paper', { timeout: 30_000 });
  await page.waitForTimeout(800); // let fonts settle before rasterizing the preview
}

async function closeModal(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  let server = null;
  let baseUrl = process.env.CVIRE_URL;
  if (!baseUrl) {
    console.log('Booting vite preview (set CVIRE_URL to reuse a running app)...');
    server = await startPreviewServer();
    baseUrl = server.url;
  }
  console.log(`Capturing from ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  try {
    await waitForApp(page, baseUrl);

    // 1. Dashboard — profile grid. Cropped to the populated band: the seeded
    // database has a single resume, so a full-height shot is mostly empty canvas.
    await shot(page, 'dashboard', {
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: 480 },
    });

    // 2. Editor + live A4 preview (split mode).
    await openDemoEditor(page);
    await shot(page, 'editor-preview');

    // 3. Export modal — the two modes and their trade-off.
    await page.getByRole('button', { name: /Export PDF|Exportar PDF/i }).click();
    await page.waitForTimeout(400);
    await shot(page, 'export-modal');
    await closeModal(page);

    // 4. ATS text view — the linearized reading order an ATS parser sees.
    await page.getByRole('button', { name: /ATS Text View|Visão de Texto ATS/i }).click();
    await page.waitForTimeout(400);
    await shot(page, 'ats-text-view');
    await closeModal(page);

    console.log('\nDone. Review the PNGs before committing.');
  } finally {
    await browser.close();
    if (server) server.child.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
