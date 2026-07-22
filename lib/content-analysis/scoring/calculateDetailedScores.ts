import type { AnalyzableArticle, DetailedScores } from "../types";
import { calculateSEOScore } from "./calculateSEOScore";
import { calculateAEOScore } from "./calculateAEOScore";
import { calculateGEOScore } from "./calculateGEOScore";
import { calculateContentScore } from "./calculateContentScore";
import { analyzeScientificTrust } from "../analyzers/scientificAnalyzer";
import { analyzeSourceAuthority } from "../analyzers/sourceAuthorityAnalyzer";
import { analyzeReadability } from "../analyzers/readabilityAnalyzer";
import { ratioScore } from "../constants";

function calculateAuthorityScore(article: AnalyzableArticle): number {
  // Source *identifier* quality (DOI/PMID/URL/authoritative domain) is
  // analyzeSourceAuthority's job — it already knows books never carry a
  // DOI. This used to require every source to have a DOI directly,
  // penalizing book citations (the same bug already fixed once in
  // lib/content-analysis/analyzers/scientificAnalyzer.ts, but this file
  // had its own independent copy of the mistake).
  const checks = [Boolean(article.authorName), article.sources.length >= 3, analyzeSourceAuthority(article).score >= 50];
  return ratioScore(checks.filter(Boolean).length, checks.length);
}

function calculateTrustScore(article: AnalyzableArticle): number {
  const checks = [article.hasCanonical, article.hasSchema, article.sources.length > 0];
  return ratioScore(checks.filter(Boolean).length, checks.length);
}

function calculateInternalLinkingScore(internalLinkSuggestionCount: number): number {
  const checks = [internalLinkSuggestionCount > 0, internalLinkSuggestionCount >= 2];
  return ratioScore(checks.filter(Boolean).length, checks.length);
}

const OVERALL_WEIGHTS = {
  seo: 0.2,
  aeo: 0.15,
  geo: 0.15,
  scientific: 0.15,
  authority: 0.1,
  trust: 0.1,
  readability: 0.05,
  structure: 0.05,
  internalLinking: 0.05,
} as const;

/**
 * `internalLinkSuggestionCount` must be computed by the caller (via
 * analyzeInternalLinking against the real corpus — see
 * lib/content-analysis/analyzers/internalLinkAnalyzer.ts) and passed in
 * explicitly. This function only ever receives a single article, so it
 * has no way to know real internal-link opportunities itself; the field
 * used to read article.internalLinkCount, which is hardcoded 0
 * everywhere in this codebase and was never actually populated —
 * silently failing this check for every article regardless of reality.
 */
export function calculateDetailedScores(
  article: AnalyzableArticle,
  internalLinkSuggestionCount: number
): DetailedScores {
  const seo = calculateSEOScore(article).score;
  const aeo = calculateAEOScore(article).score;
  const geo = calculateGEOScore(article).score;
  const scientific = analyzeScientificTrust(article).score;
  const authority = calculateAuthorityScore(article);
  const trust = calculateTrustScore(article);
  const readability = analyzeReadability(article).score;
  // "structure" now delegates to calculateContentScore (readability,
  // accessibility, paragraph length, content depth, intro/conclusion)
  // instead of the retired legacy-field-based structureAnalyzer.
  const structure = calculateContentScore(article).score;
  const internalLinking = calculateInternalLinkingScore(internalLinkSuggestionCount);

  const overall = Math.round(
    seo * OVERALL_WEIGHTS.seo +
      aeo * OVERALL_WEIGHTS.aeo +
      geo * OVERALL_WEIGHTS.geo +
      scientific * OVERALL_WEIGHTS.scientific +
      authority * OVERALL_WEIGHTS.authority +
      trust * OVERALL_WEIGHTS.trust +
      readability * OVERALL_WEIGHTS.readability +
      structure * OVERALL_WEIGHTS.structure +
      internalLinking * OVERALL_WEIGHTS.internalLinking
  );

  return { seo, aeo, geo, scientific, authority, trust, readability, structure, internalLinking, overall };
}
