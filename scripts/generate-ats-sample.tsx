/**
 * Renders the ATS-safe PDF for the bundled demo profile without a browser.
 * Used by `npm run verify:ats` to produce the artifact that
 * scripts/verify-ats-pdf.mjs then inspects.
 *
 * Usage: tsx scripts/generate-ats-sample.tsx [output.pdf]
 */
import fs from 'node:fs';
import path from 'node:path';
import { renderToBuffer } from '@react-pdf/renderer';
import { buildAtsPdfDocument } from '../src/services/atsPdfDocument';
import { demoProfiles } from '../src/data/initialData';

async function main() {
  const outPath = path.resolve(process.argv[2] || 'tmp/ats-sample.pdf');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const profile = demoProfiles[0];
  const buffer = await renderToBuffer(buildAtsPdfDocument(profile));
  fs.writeFileSync(outPath, buffer);

  console.log(
    JSON.stringify({ file: outPath, sizeBytes: buffer.length, profile: profile.title })
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
