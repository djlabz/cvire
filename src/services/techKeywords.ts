/**
 * Shared technology keyword dictionary and extraction helpers, used by both
 * the ATS engine (keyword density/diversity scoring) and the job matcher
 * (TF-IDF keyword surfacing).
 */

export const KNOWN_TECH_PHRASES: readonly string[] = [
  // Data & analytics
  'data engineering', 'data engineer', 'data analyst', 'data science', 'data scientist',
  'machine learning', 'deep learning', 'nlp', 'llm', 'apache spark', 'spark', 'hadoop',
  'bigquery', 'looker studio', 'power bi', 'tableau', 'streamlit', 'pandas', 'numpy',
  'scikit-learn', 'tensorflow', 'pytorch', 'airflow', 'dbt', 'snowflake', 'redshift',
  'databricks', 'kafka', 'rabbitmq', 'etl', 'elt', 'data modeling', 'data warehouse',
  'web scraping', 'business intelligence', 'dax', 'm code', 'excel', 'vba',
  // Languages
  'python', 'javascript', 'typescript', 'java', 'kotlin', 'swift', 'c#', 'c++',
  'golang', 'rust', 'php', 'ruby', 'scala', 'sql', 'html', 'css', 'sass', 'bash',
  // Frontend
  'react', 'react native', 'next.js', 'nextjs', 'vue', 'nuxt', 'angular', 'svelte',
  'tailwind', 'redux', 'zustand', 'vite', 'webpack', 'pwa', 'accessibility', 'seo',
  // Backend & APIs
  'node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring',
  '.net', 'dotnet', 'laravel', 'rails', 'graphql', 'rest api', 'grpc', 'microservices',
  'websocket', 'oauth', 'jwt',
  // Databases
  'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'elasticsearch',
  'dynamodb', 'indexeddb',
  // Cloud & DevOps
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins',
  'ci/cd', 'github actions', 'gitlab', 'linux', 'serverless', 'lambda', 'cloudflare',
  // Mobile
  'flutter', 'ios', 'android',
  // Testing & quality
  'jest', 'vitest', 'cypress', 'playwright', 'selenium', 'tdd', 'unit testing',
  'e2e testing',
  // Practices & tooling
  'git', 'github', 'agile', 'scrum', 'kanban', 'trello', 'jira', 'figma',
  'design system', 'software engineering', 'software engineer', 'devops',
  'observability', 'monitoring',
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Count occurrences of every known tech phrase in the given text.
 * Multi-word phrases are matched with word boundaries; the input is
 * normalized (lowercase, accents stripped) before matching.
 */
export function extractTechKeywords(text: string): Map<string, number> {
  const normalized = normalizeText(text);
  const counts = new Map<string, number>();

  for (const phrase of KNOWN_TECH_PHRASES) {
    const regex = new RegExp(`(?<![a-z0-9])${escapeRegExp(phrase)}(?![a-z0-9])`, 'g');
    const matches = normalized.match(regex);
    if (matches && matches.length > 0) {
      counts.set(phrase, matches.length);
    }
  }

  return counts;
}
