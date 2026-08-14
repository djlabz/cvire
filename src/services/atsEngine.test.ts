import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateATSScore, scoreTechnicalKeywords } from './atsEngine';
import { makeProfile, makeExperienceSection } from './testProfileFactory';
import { demoProfiles } from '../data/initialData';

describe('scoreTechnicalKeywords', () => {
  it('scores an empty text as 0', () => {
    assert.equal(scoreTechnicalKeywords(''), 0);
  });

  it('scores a generic non-technical text low', () => {
    const generic =
      'Motivated professional with a passion for helping people. ' +
      'Responsible for daily tasks, communication with customers, and organizing meetings. ' +
      'Hard working, detail oriented, and a fast learner who enjoys collaboration.';
    const score = scoreTechnicalKeywords(generic);
    assert.ok(score < 20, `generic text should score < 20, got ${score}`);
  });

  it('scores a dense technical text high', () => {
    const technical =
      'Senior engineer working with React, TypeScript, Node.js, PostgreSQL, Redis, Docker, ' +
      'Kubernetes, AWS, Terraform, GraphQL, Python, and Airflow. Built CI/CD pipelines with ' +
      'GitHub Actions, tests with Playwright and Jest, dashboards in Power BI, and ETL jobs in Spark.';
    const score = scoreTechnicalKeywords(technical);
    assert.ok(score > 75, `dense technical text should score > 75, got ${score}`);
  });

  it('is continuous: more distinct technologies means a higher score', () => {
    const base = 'Worked on business software delivering value to customers every sprint.';
    const few = scoreTechnicalKeywords(`${base} Used SQL daily.`);
    const some = scoreTechnicalKeywords(`${base} Used SQL, Python, Docker, and AWS daily.`);
    const many = scoreTechnicalKeywords(
      `${base} Used SQL, Python, Docker, AWS, React, TypeScript, PostgreSQL, Redis, Kafka, and Kubernetes daily.`
    );
    assert.ok(few < some, `few (${few}) should be < some (${some})`);
    assert.ok(some < many, `some (${some}) should be < many (${many})`);
  });

  it('does not reward the old hardcoded trigger words alone', () => {
    // Pre-fix, the word "management" alone bumped the score to 90.
    const score = scoreTechnicalKeywords('Management of teams and management of budgets.');
    assert.ok(score < 40, `"management" alone should not score high, got ${score}`);
  });
});

describe('calculateATSScore keyword integration', () => {
  it('gives the empty profile a zero keyword score and a diagnostic', () => {
    const { breakdown, diagnostics } = calculateATSScore(makeProfile());
    assert.equal(breakdown.keywordsScore, 0);
    assert.ok(diagnostics.some((d) => d.ruleId === 'low-technical-keywords'));
  });

  it('gives the technical demo profile a high keyword score without a diagnostic', () => {
    const { breakdown, diagnostics } = calculateATSScore(demoProfiles[0]);
    assert.ok(
      breakdown.keywordsScore > 70,
      `demo profile keyword score should be > 70, got ${breakdown.keywordsScore}`
    );
    assert.ok(!diagnostics.some((d) => d.ruleId === 'low-technical-keywords'));
  });

  it('scores a generic profile below a technical one', () => {
    const generic = makeProfile({
      summary: 'Friendly team player who communicates well and learns fast.',
      sectionsOrder: ['sec-exp'],
      sections: {
        'sec-exp': makeExperienceSection([
          'Responsible for customer meetings and status reports.',
          'Organized company events and internal newsletters.',
        ]),
      },
    });

    const technical = makeProfile({
      summary: 'Backend engineer focused on Node.js, PostgreSQL, Docker, and AWS.',
      sectionsOrder: ['sec-exp'],
      sections: {
        'sec-exp': makeExperienceSection([
          'Built REST APIs in Node.js with PostgreSQL and Redis caching.',
          'Deployed microservices to Kubernetes on AWS with Terraform and CI/CD.',
        ]),
      },
    });

    const genericScore = calculateATSScore(generic).breakdown.keywordsScore;
    const technicalScore = calculateATSScore(technical).breakdown.keywordsScore;
    assert.ok(
      genericScore < technicalScore,
      `generic (${genericScore}) should be < technical (${technicalScore})`
    );
  });
});
