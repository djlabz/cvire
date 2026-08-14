/**
 * Browser smoke test for both PDF export modes (requires the app running,
 * default http://127.0.0.1:5173 — override with CVIRE_URL).
 *
 * - ATS-safe mode: downloads, then passes the full ATS verification suite
 *   (links, reading order, no raster, no invisible text, size budget).
 * - Visual mode: downloads and is honestly visual-only — raster pages with
 *   ZERO extractable text (the old invisible text layer must stay gone).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { extractPdfText } from './verify-pdf-text.mjs';
import { verifyAtsPdf } from './verify-ats-pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'tmp', 'pdf-smoke');
const baseUrl = process.env.CVIRE_URL || 'http://127.0.0.1:5173';

async function waitForApp(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByText('Initializing cvire local database...').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  await page.waitForSelector('text=Senior Frontend Engineer', { timeout: 30000 });
}

async function openDemoEditor(page) {
  await page.getByText('Senior Frontend Engineer (US Remote)').first().click();
  await page.waitForSelector('.a4-paper', { timeout: 30000 });
  await page.waitForTimeout(500);
}

/** Open the export modal and pick a mode: 'ats' or 'visual'. */
export async function exportPdf(page, mode, filename) {
  const exportBtn = page.getByRole('button', { name: /Export PDF|Exportar PDF/i });
  await exportBtn.click();

  const optionRe =
    mode === 'ats' ? /ATS-safe|Compatível com ATS/i : /Visual/i;
  const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
  await page.getByRole('button', { name: optionRe }).click();

  const download = await downloadPromise;
  const target = path.join(outDir, filename);
  await download.saveAs(target);
  await page.keyboard.press('Escape').catch(() => {});
  return target;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const results = [];

  try {
    await waitForApp(page);
    await openDemoEditor(page);

    // --- ATS-safe mode: full machine-readability contract.
    const t1 = Date.now();
    const atsPath = await exportPdf(page, 'ats', 'ats-safe.pdf');
    const atsResult = await verifyAtsPdf(atsPath);
    results.push({
      case: 'ats-safe',
      file: atsPath,
      ok: atsResult.ok,
      errors: atsResult.errors,
      stats: atsResult.stats,
      elapsedMs: Date.now() - t1,
    });

    // --- Visual mode: raster pages, zero text by design.
    const t2 = Date.now();
    const visualPath = await exportPdf(page, 'visual', 'visual.pdf');
    const visual = await extractPdfText(visualPath);
    const visualErrors = [];
    if (visual.full.trim().length > 0) {
      visualErrors.push(
        `Visual export contains extractable text (${visual.full.length} chars) — invisible text layer resurrected?`
      );
    }
    if (visual.sizeBytes < 10 * 1024) {
      visualErrors.push(`Visual export suspiciously small: ${visual.sizeBytes} bytes`);
    }
    results.push({
      case: 'visual',
      file: visualPath,
      ok: visualErrors.length === 0,
      errors: visualErrors,
      stats: { numPages: visual.numPages, sizeBytes: visual.sizeBytes },
      elapsedMs: Date.now() - t2,
    });

    const summary = { baseUrl, results };
    fs.writeFileSync(path.join(outDir, 'smoke-results.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));

    if (results.some((r) => !r.ok)) process.exit(1);
  } finally {
    await browser.close();
  }
}

import { pathToFileURL } from 'node:url';
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
