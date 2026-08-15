/**
 * Browser check for the VISUAL export's multi-page slicing (requires the app
 * running — override URL with CVIRE_URL).
 *
 * The visual pipeline rasterizes the on-screen canvas and slices it into A4
 * pages using pdfPageCut's keep-together bands. Since the visual mode is
 * image-only by design (no text layer — see exportService.ts), this script
 * asserts structural properties: page count grows with padded content, every
 * page carries a raster image, and no extractable text exists.
 *
 * Keep-together band CORRECTNESS is unit-tested in src/services/pdfPageCut.test.ts,
 * and the ATS export's pagination is covered by scripts/verify-ats-pagination.tsx.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { extractPdfText } from './verify-pdf-text.mjs';
import { exportPdf } from './smoke-pdf-export.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'tmp', 'pdf-cut');
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

async function padMainColumn(page) {
  await page.evaluate(() => {
    const main = document.querySelector('.a4-paper .grid > .col-span-2');
    if (!main) throw new Error('ModernTech main column not found');
    for (let i = 0; i < 40; i += 1) {
      const p = document.createElement('p');
      p.className = 'text-sm leading-relaxed';
      p.textContent = `Main column filler ${i} for multi-page PDF cut verification with enough vertical length.`;
      main.appendChild(p);
    }
  });
  await page.waitForTimeout(400);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  try {
    await waitForApp(page);
    await openDemoEditor(page);

    const singlePath = await exportPdf(page, 'visual', 'visual-single.pdf');
    const single = await extractPdfText(singlePath);

    await padMainColumn(page);
    const multiPath = await exportPdf(page, 'visual', 'visual-multipage.pdf');
    const multi = await extractPdfText(multiPath);

    if (multi.numPages < 2) {
      throw new Error(`Expected padded export to span 2+ pages, got ${multi.numPages}`);
    }
    if (multi.numPages <= single.numPages) {
      throw new Error(
        `Padded export (${multi.numPages}p) should have more pages than unpadded (${single.numPages}p)`
      );
    }
    if (multi.full.trim().length > 0) {
      throw new Error('Visual export must not contain extractable text (invisible layer resurrected?)');
    }

    const rawBytes = fs.readFileSync(multiPath).toString('latin1');
    const imageCount = rawBytes.split('/Subtype /Image').length - 1;
    if (imageCount < multi.numPages) {
      throw new Error(`Expected >= ${multi.numPages} page images, found ${imageCount}`);
    }

    console.log(
      JSON.stringify({
        ok: true,
        single: { file: singlePath, numPages: single.numPages, sizeBytes: single.sizeBytes },
        multi: { file: multiPath, numPages: multi.numPages, sizeBytes: multi.sizeBytes, imageCount },
      }, null, 2)
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
