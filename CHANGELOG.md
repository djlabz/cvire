# Changelog

All notable changes to cvire are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow
[SemVer](https://semver.org/).

## [0.2.0] — 2026-08-14

Branch `fix/ats-safe-export-and-audit`: full response to the external audit.

### Added
- **ATS-safe text-native PDF export** (`@react-pdf/renderer`, previously an
  unused dependency): real selectable text, embedded fonts, real `/URI` link
  annotations for profile and project links, PDF metadata from the profile,
  single-column linearized reading order, and keep-together pagination that
  never orphans a section title or item header. Demo profile exports at ~7KB
  (previous raster export: ~600KB).
- **Export mode dialog**: "ATS-safe (recommended)" vs "Visual (print
  fidelity)", with localized explanations (en-US, pt-BR).
- **`npm run verify:ats`**: headless verification failing on missing link
  annotations, wrong/interleaved positional reading order, raster
  (DCTDecode) content, invisible text rendering ops, size over 100KB, and
  orphaned titles across pages.
- **CI workflow** (`ci.yml`) running lint, 33 unit tests, `verify:ats`, and
  the production build on every push/PR (previously CI only deployed).
- **LICENSE** file (MIT) matching the README badge.
- `CHANGELOG.md` (this file), `repository`/`homepage`/`bugs` metadata in
  package.json.

### Fixed
- **Crypto vault**: the AES-GCM master key was regenerated every session and
  never persisted, so any saved Gemini API key became permanently
  undecryptable after a reload. The key is now generated once,
  non-extractable, and persisted in IndexedDB (Dexie v2 `cryptoKeys` table).
  Orphaned ciphertexts from the buggy build are detected, purged, and the
  user is asked to re-enter the key with a clear localized notice.
- **ATS "Technical Keywords" score** (25% weight) was a hardcoded stub
  (`includes('react'|'typescript'|'management') ? 90 : 70`). It now scores
  continuously by density and diversity of technologies from a shared
  dictionary, over the profile's actual text.
- **Job matcher is now real TF-IDF**, as the README always claimed:
  log-normalized TF × smoothed IDF over an embedded 24-document corpus of
  synthetic job descriptions, cosine similarity for the match percentage,
  TF-IDF-ranked keyword surfacing. Fully offline.
- **README clone URL** pointed at the pre-migration personal repo
  (`Jownao/cvire`); all repository references now use the canonical
  `github.com/djlabz/cvire`. The stack section no longer claims the unused
  `html2pdf.js`.

### Changed
- **Visual export no longer injects an invisible white text layer** over the
  rasterized pages — that pattern is what "white fonting" fraud detectors
  flag. Machine readability is now the ATS-safe mode's job.
- Heavy export dependencies (`@react-pdf/renderer`, `html2canvas-pro`,
  `jspdf`) and the Gemini SDK are now lazy-loaded, keeping them out of the
  initial bundle.
- `SectionsList.tsx` (786 lines) split into focused subcomponents under
  `src/components/editor/sections/` with no behavior change.

### Removed
- Dead module `src/services/pdfTextLayer.ts` (never imported).
- Duplicate `html2canvas` v1 dependency (only `html2canvas-pro` is used).
- Stale committed build output under `assets/` (~1.5MB of minified bundles,
  referenced by nothing).

## [0.1.0]

Initial public iteration: multi-profile editor with Dexie/IndexedDB storage,
five templates, A4 preview with page-cut indicators, ATS score and linter,
job matcher, versioning with side-by-side compare, i18n (en-US, pt-BR), and
raster PDF export.
