import { CVProfile } from '../types/cv';
import { ATSScoreBreakdown, LinterDiagnostic } from '../types/ats';
import { extractTechKeywords } from './techKeywords';
import { profileToPlainText } from './profileText';

const ACTION_VERBS = new Set([
  'architected', 'built', 'created', 'designed', 'developed', 'engineered',
  'implemented', 'launched', 'led', 'managed', 'migrated', 'optimized',
  'orchestrated', 'pioneered', 'reduced', 'scaled', 'spearheaded', 'transformed',
  'desenvolveu', 'liderou', 'criou', 'otimizou', 'arquitetou', 'reduziu', 'implementou'
]);

/**
 * Continuous technical-keyword scoring (0-100) from the shared tech
 * dictionary, combining:
 * - diversity: how many DISTINCT technologies appear (12+ ≈ full marks), and
 * - density:   tech mentions per 100 words (≈6/100 is healthy; extreme
 *              stuffing above 18/100 tapers back down).
 */
export function scoreTechnicalKeywords(plainText: string): number {
  const words = plainText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  const techCounts = extractTechKeywords(plainText);
  const uniqueTech = techCounts.size;
  let totalMentions = 0;
  techCounts.forEach((count) => {
    totalMentions += count;
  });

  const diversityScore = Math.min(uniqueTech / 12, 1);

  const mentionsPer100Words = (totalMentions / words.length) * 100;
  let densityScore = Math.min(mentionsPer100Words / 6, 1);
  if (mentionsPer100Words > 18) {
    densityScore = Math.max(0.6, 1 - (mentionsPer100Words - 18) / 30);
  }

  return Math.round((diversityScore * 0.6 + densityScore * 0.4) * 100);
}

export function calculateATSScore(profile: CVProfile): {
  breakdown: ATSScoreBreakdown;
  diagnostics: LinterDiagnostic[];
} {
  const diagnostics: LinterDiagnostic[] = [];

  // 1. Structure & Formatting (20%)
  const hasExp = Object.values(profile.sections).some((s) => s.type === 'experience' && s.visible);
  const hasEdu = Object.values(profile.sections).some((s) => s.type === 'education' && s.visible);
  const hasSkills = Object.values(profile.sections).some((s) => s.type === 'skills' && s.visible);
  let structureScore = 50;
  if (hasExp) structureScore += 20;
  if (hasEdu) structureScore += 15;
  if (hasSkills) structureScore += 15;

  // 2. Keywords & Relevance (25%)
  const keywordsScore = scoreTechnicalKeywords(profileToPlainText(profile));

  if (keywordsScore < 50) {
    diagnostics.push({
      id: 'diag-keywords',
      ruleId: 'low-technical-keywords',
      severity: 'warning',
      title: 'Low Technical Keyword Coverage',
      message: 'Few recognizable technologies, tools, or methodologies were detected in your resume.',
      suggestion: 'Name the concrete stack you used (languages, frameworks, databases, cloud, tooling) in skills and experience bullets.',
    });
  }

  // 3. Metrics & Quantification (20%)
  let totalBullets = 0;
  let metricBullets = 0;

  Object.values(profile.sections).forEach((sec) => {
    sec.items.forEach((item) => {
      item.bulletItems.forEach((b) => {
        if (!b.enabled) return;
        totalBullets++;
        if (/\d+%|\$\d+|\d+\+|\d+ (users|teams|projects|clients|fps|ms)/i.test(b.text)) {
          metricBullets++;
        }
      });
    });
  });

  const metricRatio = totalBullets > 0 ? metricBullets / totalBullets : 0;
  const metricsScore = Math.min(Math.round(metricRatio * 100 * 1.5), 100);

  if (metricsScore < 50) {
    diagnostics.push({
      id: 'diag-metrics',
      ruleId: 'lack-of-quantification',
      severity: 'warning',
      title: 'Low Quantification Rate',
      message: 'Less than 40% of your experience bullet points include measurable metrics (e.g. %, $, numbers).',
      suggestion: 'Add concrete results, performance numbers, or team metrics to strengthen impact.',
    });
  }

  // 4. Action Verbs (15%)
  let actionVerbCount = 0;
  Object.values(profile.sections).forEach((sec) => {
    sec.items.forEach((item) => {
      item.bulletItems.forEach((b) => {
        if (!b.enabled) return;
        const firstWord = b.text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        if (firstWord && ACTION_VERBS.has(firstWord)) {
          actionVerbCount++;
        }
      });
    });
  });

  const actionVerbRatio = totalBullets > 0 ? actionVerbCount / totalBullets : 0;
  const actionVerbsScore = Math.min(Math.round(actionVerbRatio * 100 * 1.3), 100);

  if (actionVerbsScore < 60) {
    diagnostics.push({
      id: 'diag-verbs',
      ruleId: 'missing-action-verb',
      severity: 'info',
      title: 'Action Verb Optimization',
      message: 'Start bullet points with strong action verbs like Spearheaded, Engineered, or Architected.',
      suggestion: 'Use action verbs to immediately highlight leadership and execution.',
    });
  }

  // 5. Length & Summary (10%)
  const summaryWords = profile.summary.split(/\s+/).filter(Boolean).length;
  let lengthScore = 100;

  if (summaryWords < 30) {
    lengthScore = 60;
    diagnostics.push({
      id: 'diag-sum-short',
      ruleId: 'summary-length-check',
      severity: 'warning',
      title: 'Professional Summary Too Short',
      message: `Your summary contains ${summaryWords} words. Optimal length is 40 to 120 words.`,
    });
  } else if (summaryWords > 140) {
    lengthScore = 70;
    diagnostics.push({
      id: 'diag-sum-long',
      ruleId: 'summary-length-check',
      severity: 'warning',
      title: 'Professional Summary Too Long',
      message: `Your summary contains ${summaryWords} words. Consider condensing to under 120 words for fast ATS parsing.`,
    });
  }

  // 6. Contact Info (10%)
  let contactScore = 0;
  if (profile.personal.fullName) contactScore += 25;
  if (profile.personal.email && profile.personal.email.includes('@')) contactScore += 25;
  if (profile.personal.phone) contactScore += 25;
  if (profile.personal.location) contactScore += 25;

  if (contactScore < 100) {
    diagnostics.push({
      id: 'diag-contact',
      ruleId: 'missing-contact-info',
      severity: 'error',
      title: 'Incomplete Contact Information',
      message: 'Ensure Email, Phone, and Location are filled out.',
    });
  }

  // Weighted total score
  const totalScore = Math.round(
    structureScore * 0.2 +
      keywordsScore * 0.25 +
      metricsScore * 0.2 +
      actionVerbsScore * 0.15 +
      lengthScore * 0.1 +
      contactScore * 0.1
  );

  return {
    breakdown: {
      structureScore,
      keywordsScore,
      metricsScore,
      actionVerbsScore,
      lengthScore,
      contactScore,
      totalScore,
    },
    diagnostics,
  };
}
