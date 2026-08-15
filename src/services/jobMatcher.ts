import { CVProfile } from '../types/cv';
import { JobMatchResult, KeywordMatch } from '../types/ats';
import { KNOWN_TECH_PHRASES, normalizeText } from './techKeywords';
import { profileToPlainText } from './profileText';
import jobCorpus from '../data/jobCorpus.json';

/**
 * Real TF-IDF job matching.
 *
 * - IDF is computed over an embedded corpus of synthetic job descriptions
 *   (src/data/jobCorpus.json) plus the target description — fully offline.
 * - TF uses log-normalized term frequency (1 + ln(tf)).
 * - The match percentage is the cosine similarity between the CV and job
 *   TF-IDF vectors, mapped through sqrt so mid-range similarities spread
 *   over a readable 0-100 scale (cosine 0.25 → 50%).
 * - Known multi-word tech phrases ("machine learning", "power bi", …) are
 *   collapsed into single tokens before tokenization so they behave as one
 *   term in both TF and IDF.
 */

const BILINGUAL_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will',
  'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
  'you', 'your', 'our', 'we', 'or', 'not', 'such', 'both', 'their', 'them', 'than',
  'de', 'em', 'para', 'com', 'um', 'uma', 'os', 'as', 'por', 'como', 'do', 'da',
  'dos', 'das', 'nos', 'nas', 'no', 'na', 'que', 'se', 'ou', 'mais', 'menos',
  'voce', 'vai', 'ser', 'sua', 'seu', 'suas', 'seus', 'nossa', 'nosso', 'pessoa',
  'requisitos', 'experiencia', 'conhecimento', 'atuar', 'vaga', 'trabalhar',
  'empresa', 'responsabilidades', 'diferencial', 'desejavel', 'obrigatorio',
  'area', 'equipe', 'time', 'projetos', 'solucoes', 'ferramentas', 'processos',
  'work', 'experience', 'ability', 'required', 'preferred', 'skills', 'job',
  'role', 'team', 'company', 'looking', 'seeking', 'responsibilities', 'qualifications',
  'strong', 'plus', 'essential', 'welcome', 'expected', 'mandatory', 'familiarity'
]);

const PHRASE_TOKENS = new Map(
  KNOWN_TECH_PHRASES.filter((phrase) => phrase.includes(' ')).map((phrase) => [
    phrase,
    phrase.replace(/\s+/g, '_'),
  ])
);

/** Tokenize text: normalize, collapse known phrases, drop stopwords/noise. */
export function tokenize(text: string): string[] {
  let normalized = normalizeText(text);

  PHRASE_TOKENS.forEach((token, phrase) => {
    normalized = normalized.split(phrase).join(token);
  });

  return normalized
    .replace(/[^a-z0-9#+._/-\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^[.\-/]+|[.\-/]+$/g, ''))
    .filter((word) => word.length > 2 && !BILINGUAL_STOP_WORDS.has(word) && !/^\d+$/.test(word));
}

function termCounts(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return counts;
}

// Document frequency of every term across the embedded corpus (memoized).
let corpusDocumentFrequency: Map<string, number> | null = null;
let corpusSize = 0;

function getCorpusDocumentFrequency(): Map<string, number> {
  if (corpusDocumentFrequency) return corpusDocumentFrequency;

  corpusDocumentFrequency = new Map();
  const documents: string[] = jobCorpus.documents;
  corpusSize = documents.length;

  for (const documentText of documents) {
    const uniqueTerms = new Set(tokenize(documentText));
    uniqueTerms.forEach((term) => {
      corpusDocumentFrequency!.set(term, (corpusDocumentFrequency!.get(term) || 0) + 1);
    });
  }

  return corpusDocumentFrequency;
}

/** Smoothed IDF: ln((N + 1) / (df + 1)) + 1. Terms absent from the corpus get the max weight. */
export function inverseDocumentFrequency(term: string): number {
  const df = getCorpusDocumentFrequency().get(term) || 0;
  return Math.log((corpusSize + 1) / (df + 1)) + 1;
}

function tfidfVector(tokens: string[]): Map<string, number> {
  const vector = new Map<string, number>();
  termCounts(tokens).forEach((count, term) => {
    const tf = 1 + Math.log(count);
    vector.set(term, tf * inverseDocumentFrequency(term));
  });
  return vector;
}

export function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  a.forEach((weightA, term) => {
    const weightB = b.get(term);
    if (weightB) dot += weightA * weightB;
  });

  let normA = 0;
  a.forEach((weight) => {
    normA += weight * weight;
  });
  let normB = 0;
  b.forEach((weight) => {
    normB += weight * weight;
  });

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function displayKeyword(term: string): string {
  const phrase = term.replace(/_/g, ' ');
  return phrase
    .split(' ')
    .map((word) =>
      word.length <= 3 && !['sql', 'gcp', 'aws', 'etl', 'elt', 'dax', 'nlp', 'llm', 'tdd', 'seo'].includes(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}

export function calculateJobMatch(cv: CVProfile, jobDescription: string): JobMatchResult {
  if (!jobDescription || !jobDescription.trim()) {
    return {
      matchPercentage: 0,
      matchedKeywordsCount: 0,
      missingKeywordsCount: 0,
      keywords: [],
    };
  }

  const jobTokens = tokenize(jobDescription);
  const cvTokens = tokenize(profileToPlainText(cv));

  const jobVector = tfidfVector(jobTokens);
  const cvVector = tfidfVector(cvTokens);

  const similarity = cosineSimilarity(jobVector, cvVector);
  // sqrt spreads typical CV-vs-job cosines (0.05-0.5) across a readable scale.
  const matchPercentage = Math.round(Math.min(1, Math.sqrt(similarity)) * 100);

  // Surface the job's most distinctive terms (highest TF-IDF weight) and
  // check their presence in the CV.
  const jobCounts = termCounts(jobTokens);
  const cvCounts = termCounts(cvTokens);

  const targetKeywords = Array.from(jobVector.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const keywordsList: KeywordMatch[] = [];
  let matchedCount = 0;
  let missingCount = 0;

  targetKeywords.forEach(([term]) => {
    const countInJob = jobCounts.get(term) || 0;
    const countInCV = cvCounts.get(term) || 0;

    let status: KeywordMatch['status'] = 'missing';
    if (countInCV > 0) {
      status = countInCV > 10 ? 'overused' : 'matched';
      matchedCount++;
    } else {
      missingCount++;
    }

    keywordsList.push({
      keyword: displayKeyword(term),
      countInJob,
      countInCV,
      status,
    });
  });

  return {
    matchPercentage,
    matchedKeywordsCount: matchedCount,
    missingKeywordsCount: missingCount,
    keywords: keywordsList,
  };
}
