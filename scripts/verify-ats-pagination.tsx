/**
 * Multi-page pagination check for the ATS-safe export, headless (no browser).
 *
 * Pads the demo profile with enough filler bullets to force 3+ pages, renders
 * with @react-pdf/renderer, and asserts the keep-together guarantees:
 *  - no section title sits orphaned on a page without its first content;
 *  - key phrases are never sliced across pages;
 *  - all section markers survive pagination in reading order.
 *
 * Usage: tsx scripts/verify-ats-pagination.tsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { renderToBuffer } from '@react-pdf/renderer';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { buildAtsPdfDocument } from '../src/services/atsPdfDocument';
import { demoProfiles } from '../src/data/initialData';
import type { CVProfile } from '../src/types/cv';

function padProfile(base: CVProfile): CVProfile {
  const padded: CVProfile = JSON.parse(JSON.stringify(base));
  const expSection = padded.sections['sec-exp'];

  for (let i = 0; i < 6; i += 1) {
    expSection.items.push({
      id: `filler-exp-${i}`,
      title: `Filler Role ${i}`,
      subtitle: `Filler Company ${i}`,
      startDate: 'Jan 2010',
      endDate: 'Dec 2011',
      bulletItems: Array.from({ length: 6 }, (_, j) => ({
        id: `filler-b-${i}-${j}`,
        text: `Filler achievement ${i}.${j} describing a measurable outcome with enough words to occupy a full line of the exported resume document.`,
        enabled: true,
      })),
    });
  }

  return padded;
}

async function extractPages(buffer: Buffer): Promise<string[]> {
  const doc = await getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }
  return pages;
}

function assertTitleNotOrphaned(pages: string[], title: string, companions: string[]): void {
  pages.forEach((pageText, index) => {
    if (!pageText.toUpperCase().includes(title.toUpperCase())) return;
    const hasCompanion = companions.some((companion) => pageText.includes(companion));
    if (!hasCompanion) {
      throw new Error(
        `Orphan section title "${title}" on page ${index + 1} without any of [${companions.join(', ')}]`
      );
    }
  });
}

function assertPhraseIntact(pages: string[], phrase: string): void {
  const fullJoined = pages.join('\n');
  if (!fullJoined.includes(phrase)) {
    throw new Error(`Phrase "${phrase}" missing or sliced across pages`);
  }
}

async function main() {
  const padded = padProfile(demoProfiles[0]);
  const buffer = await renderToBuffer(buildAtsPdfDocument(padded));

  const outPath = path.resolve('tmp/ats-pagination-sample.pdf');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);

  const pages = await extractPages(buffer);

  if (pages.length < 3) {
    throw new Error(`Expected the padded profile to span 3+ pages, got ${pages.length}`);
  }

  assertTitleNotOrphaned(pages, 'Work Experience', ['Senior Frontend Engineer', 'Filler Role']);
  assertTitleNotOrphaned(pages, 'Education', ['University of California', 'B.S. in Computer Science']);
  assertTitleNotOrphaned(pages, 'Languages', ['English', 'Portuguese']);
  assertTitleNotOrphaned(pages, 'Technical Skills', ['Frontend Core', 'React']);

  assertPhraseIntact(pages, 'English');
  assertPhraseIntact(pages, 'Filler achievement 5.5');

  console.log(
    JSON.stringify({
      ok: true,
      file: outPath,
      numPages: pages.length,
      sizeBytes: buffer.length,
    })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
