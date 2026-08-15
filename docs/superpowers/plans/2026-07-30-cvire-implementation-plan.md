# CV Builder Pro (`cvire`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `writing-plans` and `to-issues` task-by-task execution. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `cvire`, an advanced 100% client-side, offline-first resume builder with multi-profile IndexedDB storage, real-time A4 paginated canvas with auto-fit, deterministic ATS score & resume linter, BYOK encrypted AI assistant, and dual vector PDF generation.

**Architecture:** Modular React 19 + TypeScript + Vite architecture using Tailwind CSS v4 design tokens, Zustand reactive UI state, Dexie.js relational IndexedDB storage, `@dnd-kit` item-level drag & drop, `@react-pdf/renderer` vector PDF compilation, Web Crypto API encrypted BYOK key storage, and i18next internationalization.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Dexie 4, Zustand 5, @dnd-kit 6, @react-pdf/renderer 4, html2pdf.js, @google/genai, i18next, Lucide React.

## Global Constraints
- 100% Client-Side / Offline-First. No backend server dependencies.
- Repository Language: **English ONLY** (Code, comments, commits, issues, and docs).
- User Privacy: BYOK API keys must be encrypted locally via Web Crypto API (`SubtleCrypto`).
- PDF Export: High-fidelity A4 layout matching visual canvas without mid-line text splits.

---

## Phase 1: MVP Core Architecture (Issues #1 to #6)

### Task 1: Project Scaffolding & Configuration Setup
**Files:**
- Create/Modify: `vite.config.ts`, `package.json`, `index.html`, `src/index.css`, `src/vite-env.d.ts`

- [ ] Configure Tailwind CSS v4 `@tailwindcss/vite` plugin in `vite.config.ts`.
- [ ] Set up global CSS tokens in `src/index.css` (dark mode colors, print `@page A4` rules, custom scrollbars, paper shadows).
- [ ] Verify build with `npm run build`.

### Task 2: Domain Schemas, Dexie.js Database & Zustand Store
**Files:**
- Create: `src/types/cv.ts`, `src/types/template.ts`, `src/types/ats.ts`
- Create: `src/db/cvDatabase.ts`, `src/data/initialData.ts`
- Create: `src/store/useCVStore.ts`, `src/store/useUIStore.ts`

- [ ] Define TypeScript schemas (`CVProfile`, `CVSection`, `SectionItem`, `BulletItem`, `ThemeSettings`, `CVVersion`).
- [ ] Configure Dexie.js `cvDatabase` with tables (`profiles`, `versions`, `encryptedKeys`).
- [ ] Seed initial demo resume profiles (Software Engineer, UI/UX Designer, Product Manager).
- [ ] Implement Zustand `useCVStore` with active profile selection, CRUD, and undo/redo state helpers.

### Task 3: Dashboard & Multi-Profile Manager
**Files:**
- Create: `src/components/dashboard/DashboardHeader.tsx`
- Create: `src/components/dashboard/ProfileGrid.tsx`
- Create: `src/components/dashboard/ProfileCard.tsx`
- Create: `src/components/dashboard/BatchActionBar.tsx`
- Create: `src/components/dashboard/DemoTemplateModal.tsx`

- [ ] Build search bar, language filter, and favorite/archive tab toggles.
- [ ] Implement profile card grid with template thumbnails, last edited timestamp, duplicate, delete, and clone actions.
- [ ] Implement batch operations (Multi-select delete, batch JSON export).
- [ ] Build demo resume profile picker modal.

### Task 4: Dynamic Editor Shell & Drag-and-Drop Forms
**Files:**
- Create: `src/components/editor/EditorShell.tsx`
- Create: `src/components/editor/PersonalForm.tsx`
- Create: `src/components/editor/SummaryEditor.tsx`
- Create: `src/components/editor/SectionsList.tsx`
- Create: `src/components/editor/SortableSection.tsx`
- Create: `src/components/editor/SortableBulletItem.tsx`
- Create: `src/components/editor/ItemFormModal.tsx`

- [ ] Implement Personal Info & Summary edit forms with live binding to `useCVStore`.
- [ ] Implement `@dnd-kit` sortable list for section ordering (Experience, Education, Skills, Languages, Projects, Custom).
- [ ] Implement granular `@dnd-kit` bullet point reordering (`SortableBulletItem`).
- [ ] Add section visibility toggles and column assignment (Main vs Sidebar).

### Task 5: Paginated A4 Canvas & Viewport Controls
**Files:**
- Create: `src/components/preview/A4PaperCanvas.tsx`
- Create: `src/components/preview/PageDivider.tsx`
- Create: `src/components/preview/ViewportToolbar.tsx`

- [ ] Render standard A4 aspect ratio paper container (`794px × 1123px` at 96 DPI).
- [ ] Calculate live height breaks and display virtual dashed page split dividers ("Page 1", "Page 2").
- [ ] Build viewport toolbar with zoom controls (50% to 150%), view mode switches (Edit, Split 50/50, Preview Paper).

### Task 6: Base DOM Templates (Modern Tech, Executive Classic, Minimalist Clean)
**Files:**
- Create: `src/components/templates/registry.ts`
- Create: `src/components/templates/ModernTech/ModernTechTemplate.tsx`
- Create: `src/components/templates/ExecutiveClassic/ExecutiveClassicTemplate.tsx`
- Create: `src/components/templates/MinimalistClean/MinimalistCleanTemplate.tsx`

- [ ] Implement `ModernTechTemplate` (2-column layout with colored sidebar & skill badges).
- [ ] Implement `ExecutiveClassicTemplate` (1-column traditional layout with elegant borders).
- [ ] Implement `MinimalistCleanTemplate` (Clean whitespace-focused layout).
- [ ] Bind all templates to reactive `ThemeSettings` (primaryColor, accentColor, fontScale, lineHeight, margins).

---

## Phase 2: ATS Engine & Resume Intelligence (Issues #7 to #9)

### Task 7: Deterministic ATS Engine & Resume Linter
**Files:**
- Create: `src/services/atsEngine.ts`
- Create: `src/components/ats/ATSScoreGauge.tsx`
- Create: `src/components/ats/ResumeLinterPanel.tsx`

- [ ] Implement weighted 0-100 score engine (Structure 20%, Keywords 25%, Metrics 20%, Action Verbs 15%, Length 10%, Contacts 10%).
- [ ] Implement static Linter rules (`summary-length-check`, `missing-action-verb`, `bullet-length-excess`, `lack-of-quantification`, `overused-keywords`, `inconsistent-date-format`).
- [ ] Build ATS score gauge drawer with actionable diagnostic recommendations (Errors, Warnings, Tips).

### Task 8: ATS Plain Text Preview & Keyword Heatmap Overlay
**Files:**
- Create: `src/components/ats/ATSPlainPreviewModal.tsx`
- Create: `src/components/preview/KeywordHeatmapOverlay.tsx`

- [ ] Render raw unstyled text parser view simulating ATS scanners (Workday, Taleo, Greenhouse).
- [ ] Implement keyword heatmap overlay toggling highlights for matched, overused, and missing target keywords.

### Task 9: Local Resume Analytics & Multi-Locale Date Formatter
**Files:**
- Create: `src/services/analyticsService.ts`
- Create: `src/components/dashboard/AnalyticsModal.tsx`
- Modify: `src/i18n/index.ts`, `src/i18n/en-US.json`, `src/i18n/pt-BR.json`

- [ ] Calculate word count, reading time (200 wpm), action verb ratio, and metric density.
- [ ] Regionalize date formatters (`MMM YYYY` vs `MM/YYYY`) and section title dictionaries for English and Portuguese.

---

## Phase 3: AI BYOK & Job Matching Engine (Issues #10 to #11)

### Task 10: Web Crypto Key Vault & Client-Side BYOK AI Service
**Files:**
- Create: `src/db/cryptoVault.ts`
- Create: `src/services/aiService.ts`
- Create: `src/components/ai/APIKeyModal.tsx`
- Create: `src/components/ai/BulletPointAIButton.tsx`

- [ ] Implement Web Crypto API (`SubtleCrypto` AES-GCM 256-bit) encryption/decryption vault for BYOK keys.
- [ ] Integrate Google Gemini API (`@google/genai`) client-side prompts for STAR-method bullet re-writing.
- [ ] Add "Improve with AI" action button inside bullet point editor.

### Task 11: Offline & AI-Assisted Job Matcher
**Files:**
- Create: `src/services/jobMatcher.ts`
- Create: `src/components/ai/JobMatcherDrawer.tsx`

- [ ] Build offline TF-IDF / N-gram keyword extraction comparing Job Description against Resume content.
- [ ] Display Match Score %, Found Keywords (Green), Missing Keywords (Red), and Frequency.
- [ ] Add optional AI semantic match analysis when BYOK key is configured.

---

## Phase 4: Advanced Customization & Versioning (Issues #12 to #14)

### Task 12: Auto-Fit Engine
**Files:**
- Create: `src/services/autoFitEngine.ts`
- Create: `src/components/preview/AutoFitControls.tsx`

- [ ] Implement iterative font scaling (-5% to -15%), line height reduction (-0.05 step), and spacing compression algorithm.
- [ ] Provide 1-click "Fit to 1 Page" / "Fit to 2 Pages" toolbar button.

### Task 13: Version History & Side-by-Side CV Comparison
**Files:**
- Create: `src/services/versionService.ts`
- Create: `src/components/dashboard/VersionHistoryDrawer.tsx`
- Create: `src/components/dashboard/CompareModal.tsx`

- [ ] Save snapshots in Dexie `versions` table on significant edits or manual "Save Version" action.
- [ ] Implement version restoration and visual text diff viewer.
- [ ] Build dual-pane Side-by-Side CV Compare modal displaying variance in ATS Score, words, metrics, and bullet diffs.

### Task 14: Expanded Theme Customizer & Additional Templates (Creative Accent, Compact Single)
**Files:**
- Create: `src/components/templates/CreativeAccent/CreativeAccentTemplate.tsx`
- Create: `src/components/templates/CompactSingle/CompactSingleTemplate.tsx`
- Create: `src/components/editor/ThemeCustomizer.tsx`

- [ ] Implement `CreativeAccentTemplate` (Vibrant header banner layout) & `CompactSingleTemplate` (Dense 1-page layout).
- [ ] Expand Theme Customizer with options for border radius, divider styles, bullet icons, header layout, and column gaps.

---

## Phase 5: PDF Export Engine & Final Integration (Issues #15 to #16)

### Task 15: Dual PDF Export Engine (@react-pdf/renderer + html2pdf.js)
**Files:**
- Create: `src/components/pdf/PDFDocumentRenderer.tsx`
- Create: `src/components/pdf/PDFStyles.ts`
- Create: `src/services/exportService.ts`

- [ ] Build `@react-pdf/renderer` vector PDF document compiled directly in-browser.
- [ ] Add `html2pdf.js` canvas snapshot fallback for 100% visual DOM reproduction.
- [ ] Build JSON Resume export/import handlers and batch multi-CV ZIP backup exporter.

### Task 16: End-to-End Verification & Production Build Audit
- [ ] Run full build check `npm run build` and ensure TypeScript strict mode compilation succeeds with 0 errors.
- [ ] Verify offline IndexedDB storage persistence across browser page reloads.
- [ ] Commit all completed features to Git repository `https://github.com/djlabz/cvire`.
