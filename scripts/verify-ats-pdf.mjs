/**
 * ATS-safety verification for the text-native PDF export.
 *
 * Checks (all must pass):
 *  1. Links      — at least one /URI link annotation per expected profile link.
 *  2. Order      — text extracted positionally (sorted by Y, then X, like
 *                  pdftotext and classic ATS parsers) keeps section markers in
 *                  document order, and no line mixes content of two sections.
 *  3. No raster  — zero DCTDecode (JPEG) image objects in the file.
 *  4. No stealth — zero text drawn with invisible rendering mode (Tr 3).
 *  5. Size       — sample file stays under 100KB.
 *
 * Usage: node scripts/verify-ats-pdf.mjs <file.pdf>
 */
import fs from 'node:fs';
import path from 'node:path';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const EXPECTED_LINK_SUBSTRINGS = [
  'linkedin.com',
  'github.com',
  'mailto:',
];

// Section titles of the demo profile, in expected reading order.
const EXPECTED_SECTION_ORDER = [
  'Work Experience',
  'Education',
  'Featured Projects',
  'Technical Skills',
  'Languages',
];

const MAX_SIZE_BYTES = 100 * 1024;

/** Extract lines the way a positional parser would: sort by Y, then X. */
function extractPositionalLines(textContent) {
  const items = textContent.items
    .filter((item) => 'str' in item && item.str.trim().length > 0)
    .map((item) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
    }));

  // Bucket into visual lines (same Y within tolerance), top of page first.
  const lines = [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  for (const item of sorted) {
    const line = lines.find((l) => Math.abs(l.y - item.y) < 2.5);
    if (line) {
      line.parts.push(item);
    } else {
      lines.push({ y: item.y, parts: [item] });
    }
  }

  return lines.map((line) => ({
    y: line.y,
    text: line.parts
      .sort((a, b) => a.x - b.x)
      .map((p) => p.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim(),
  }));
}

async function collectUriAnnotations(doc) {
  const uris = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const annotations = await page.getAnnotations();
    for (const annotation of annotations) {
      if (annotation.subtype === 'Link' && annotation.url) {
        uris.push(annotation.url);
      }
    }
  }
  return uris;
}

async function countInvisibleTextOps(doc) {
  let invisibleOps = 0;
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const opList = await page.getOperatorList();
    for (let j = 0; j < opList.fnArray.length; j += 1) {
      if (opList.fnArray[j] === OPS.setTextRenderingMode && opList.argsArray[j]?.[0] === 3) {
        invisibleOps += 1;
      }
    }
  }
  return invisibleOps;
}

export async function verifyAtsPdf(pdfPath, options = {}) {
  const expectedLinks = options.expectedLinks ?? EXPECTED_LINK_SUBSTRINGS;
  const expectedSectionOrder = options.expectedSectionOrder ?? EXPECTED_SECTION_ORDER;
  const maxSizeBytes = options.maxSizeBytes ?? MAX_SIZE_BYTES;

  const rawBytes = fs.readFileSync(pdfPath);
  const errors = [];

  // --- Check 3: no DCTDecode raster objects (filter names are never
  // compressed in object dictionaries, so a byte scan is reliable).
  const dctCount = rawBytes
    .toString('latin1')
    .split('/DCTDecode').length - 1;
  if (dctCount > 0) {
    errors.push(`Found ${dctCount} DCTDecode (JPEG) object(s) — ATS-safe PDF must have zero raster images`);
  }

  const doc = await getDocument({ data: new Uint8Array(rawBytes), useSystemFonts: true }).promise;

  // --- Check 1: /URI link annotations
  const uris = await collectUriAnnotations(doc);
  if (uris.length === 0) {
    errors.push('PDF has zero /URI link annotations');
  }
  for (const expected of expectedLinks) {
    if (!uris.some((uri) => uri.includes(expected))) {
      errors.push(`No /URI annotation matching "${expected}" (found: ${uris.join(', ') || 'none'})`);
    }
  }

  // --- Check 4: invisible text rendering mode
  const invisibleOps = await countInvisibleTextOps(doc);
  if (invisibleOps > 0) {
    errors.push(`Found ${invisibleOps} invisible text rendering op(s) (Tr 3) — white-fonting risk`);
  }

  // --- Check 2: positional reading order
  const allLines = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    allLines.push(...extractPositionalLines(content));
  }
  const rawText = allLines.map((l) => l.text).join('\n');
  // Section titles render with CSS text-transform: uppercase, so compare
  // case-insensitively — exactly what real ATS parsers do.
  const fullText = rawText.toUpperCase();

  let cursor = -1;
  for (const marker of expectedSectionOrder.map((m) => m.toUpperCase())) {
    const idx = fullText.indexOf(marker);
    if (idx === -1) {
      errors.push(`Section marker missing from extracted text: "${marker}"`);
    } else if (idx < cursor) {
      errors.push(`Section marker out of order: "${marker}" appears before the previous section`);
    } else {
      cursor = idx;
    }
  }

  // No positional line may contain two different section titles at once
  // (the tell-tale sign of sidebar/main column interleaving).
  for (const line of allLines) {
    const upperLine = line.text.toUpperCase();
    const markersOnLine = expectedSectionOrder.filter((m) => upperLine.includes(m.toUpperCase()));
    if (markersOnLine.length > 1) {
      errors.push(`Interleaved sections on one line: "${line.text}"`);
    }
  }

  // --- Check 5: size budget
  if (rawBytes.length > maxSizeBytes) {
    errors.push(`File is ${rawBytes.length} bytes — exceeds the ${maxSizeBytes} byte ATS-safe budget`);
  }

  return {
    ok: errors.length === 0,
    errors,
    stats: {
      sizeBytes: rawBytes.length,
      numPages: doc.numPages,
      uriAnnotations: uris.length,
      uris,
      dctDecodeObjects: dctCount,
      invisibleTextOps: invisibleOps,
      extractedPreview: rawText.slice(0, 400),
    },
  };
}

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error('Usage: node scripts/verify-ats-pdf.mjs <file.pdf>');
    process.exit(1);
  }

  const absolute = path.resolve(pdfPath);
  if (!fs.existsSync(absolute)) {
    console.error(`File not found: ${absolute}`);
    process.exit(1);
  }

  const result = await verifyAtsPdf(absolute);
  console.log(JSON.stringify({ file: absolute, ...result }, null, 2));
  process.exit(result.ok ? 0 : 1);
}

import { pathToFileURL } from 'node:url';
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
