import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateJobMatch, tokenize, cosineSimilarity, inverseDocumentFrequency } from './jobMatcher';
import { makeProfile, makeExperienceSection } from './testProfileFactory';
import { demoProfiles } from '../data/initialData';

const FRONTEND_JOB = `
Senior Frontend Engineer. We need deep React and TypeScript experience to build
accessible web applications. You will improve performance, own our design system,
write tests with Playwright, and work with Tailwind and Zustand. Experience with
CI/CD pipelines and GitHub Actions required.
`;

const CHEF_JOB = `
Head Chef. Lead the kitchen brigade of an award winning restaurant. Plan seasonal
menus, manage food costs and suppliers, train sous chefs, guarantee sanitary
standards, and delight guests with refined tasting experiences every evening.
`;

describe('tokenize', () => {
  it('collapses known multi-word tech phrases into single terms', () => {
    const tokens = tokenize('Experience with machine learning and Power BI required.');
    assert.ok(tokens.includes('machine_learning'));
    assert.ok(tokens.includes('power_bi'));
  });

  it('drops stopwords in both languages', () => {
    const tokens = tokenize('the team para empresa with experiencia and skills');
    assert.equal(tokens.length, 0);
  });
});

describe('cosineSimilarity', () => {
  it('is 1 for identical vectors and 0 for orthogonal ones', () => {
    const a = new Map([['react', 2], ['sql', 1]]);
    const b = new Map([['python', 3]]);
    assert.ok(Math.abs(cosineSimilarity(a, a) - 1) < 1e-9);
    assert.equal(cosineSimilarity(a, b), 0);
    assert.equal(cosineSimilarity(new Map(), a), 0);
  });
});

describe('inverseDocumentFrequency', () => {
  it('weights rare terms higher than corpus-common ones', () => {
    // "python" appears in many corpus documents; a nonsense term in none.
    assert.ok(inverseDocumentFrequency('zzz_nonexistent_term') > inverseDocumentFrequency('python'));
  });
});

describe('calculateJobMatch (TF-IDF)', () => {
  it('returns 0 for an empty job description', () => {
    const result = calculateJobMatch(demoProfiles[0], '   ');
    assert.equal(result.matchPercentage, 0);
    assert.equal(result.keywords.length, 0);
  });

  it('scores the frontend demo profile high against a frontend job', () => {
    const result = calculateJobMatch(demoProfiles[0], FRONTEND_JOB);
    assert.ok(result.matchPercentage >= 50, `expected >= 50, got ${result.matchPercentage}`);
    assert.ok(result.matchedKeywordsCount > result.missingKeywordsCount);
  });

  it('scores the frontend demo profile low against an unrelated job', () => {
    const frontend = calculateJobMatch(demoProfiles[0], FRONTEND_JOB);
    const chef = calculateJobMatch(demoProfiles[0], CHEF_JOB);
    assert.ok(
      chef.matchPercentage < frontend.matchPercentage,
      `chef (${chef.matchPercentage}) must score below frontend (${frontend.matchPercentage})`
    );
    assert.ok(chef.matchPercentage < 40, `unrelated job should stay low, got ${chef.matchPercentage}`);
  });

  it('scores a CV containing the job text verbatim close to 100', () => {
    const mirrored = makeProfile({ summary: FRONTEND_JOB });
    const result = calculateJobMatch(mirrored, FRONTEND_JOB);
    assert.ok(result.matchPercentage >= 95, `expected >= 95, got ${result.matchPercentage}`);
  });

  it('scores a paraphrased CV with the same stack solidly high', () => {
    const paraphrased = makeProfile({
      summary:
        'Senior Frontend Engineer with deep React and TypeScript experience building ' +
        'accessible web applications, improving performance, owning a design system, ' +
        'writing tests with Playwright, working with Tailwind and Zustand, ' +
        'and maintaining CI/CD pipelines with GitHub Actions.',
    });
    const result = calculateJobMatch(paraphrased, FRONTEND_JOB);
    assert.ok(result.matchPercentage >= 75, `expected >= 75, got ${result.matchPercentage}`);
  });

  it('surfaces distinctive job keywords with presence counts', () => {
    const result = calculateJobMatch(demoProfiles[0], FRONTEND_JOB);
    const keywordNames = result.keywords.map((k) => k.keyword.toLowerCase());
    assert.ok(keywordNames.includes('react'), `expected "react" among ${keywordNames.join(', ')}`);

    const react = result.keywords.find((k) => k.keyword.toLowerCase() === 'react');
    assert.ok(react);
    assert.equal(react.status, 'matched');
    assert.ok(react.countInCV > 0);
  });

  it('flags keywords absent from the CV as missing', () => {
    const emptyProfile = makeProfile({
      sectionsOrder: ['sec-exp'],
      sections: { 'sec-exp': makeExperienceSection(['Organized paper files.']) },
    });
    const result = calculateJobMatch(emptyProfile, FRONTEND_JOB);
    assert.ok(result.missingKeywordsCount > 0);
    assert.ok(result.keywords.some((k) => k.status === 'missing'));
  });
});
