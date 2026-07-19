export const SEO_TITLE_MIN_LENGTH = 30;
export const SEO_TITLE_MAX_LENGTH = 60;
export const SEO_META_MIN_LENGTH = 70;
export const SEO_META_MAX_LENGTH = 160;
export const MIN_INTERNAL_LINKS = 2;
export const MIN_HEADING_COUNT = 2;
export const MIN_IMPORTANT_POINTS = 3;
export const MIN_SOURCE_COUNT = 2;
export const MIN_KEYWORD_COUNT = 3;
export const MAX_KEYWORD_COUNT = 10;
export const MAX_SLUG_WORD_COUNT = 6;
export const MAX_AVERAGE_SENTENCE_WORDS = 25;

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

export function ratioScore(passed: number, total: number): number {
  if (total === 0) return SCORE_MIN;
  return Math.round((passed / total) * SCORE_MAX);
}

/** Jaccard similarity between two string sets, case-insensitive. 0 when both are empty. */
export function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a.map((value) => value.toLowerCase()));
  const setB = new Set(b.map((value) => value.toLowerCase()));
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersectionSize = 0;
  for (const value of setA) {
    if (setB.has(value)) intersectionSize += 1;
  }
  const unionSize = setA.size + setB.size - intersectionSize;

  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

export const EXACT_DUPLICATE_THRESHOLD = 0.98;
export const NEAR_DUPLICATE_THRESHOLD = 0.75;
export const KEYWORD_DUPLICATE_THRESHOLD = 0.7;
export const ENTITY_DUPLICATE_THRESHOLD = 0.7;

export const LINK_SUGGESTION_MIN_SCORE = 0.2;
