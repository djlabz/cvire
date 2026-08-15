import { CVProfile } from '../types/cv';

/**
 * Browser entry point for the ATS-safe text-native export.
 * Heavy modules (@react-pdf/renderer and the document builder) are loaded
 * on demand so they never weigh on the initial app bundle.
 */
export async function exportResumeToAtsPdf(profile: CVProfile, filename: string): Promise<void> {
  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const [{ pdf }, { buildAtsPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./atsPdfDocument'),
  ]);

  const blob = await pdf(buildAtsPdfDocument(profile)).toBlob();

  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = cleanFilename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Give the browser a tick to start the download before revoking.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}
