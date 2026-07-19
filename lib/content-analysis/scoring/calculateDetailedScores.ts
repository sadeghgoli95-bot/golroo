import type { AnalyzableArticle, DetailedScores } from "../types";
import { calculateSEOScore } from "./calculateSEOScore";
import { calculateAEOScore } from "./calculateAEOScore";
import { calculateGEOScore } from "./calculateGEOScore";
import { analyzeScientificTrust } from "../analyzers/scientificAnalyzer";
import { analyzeReadability } from "../analyzers/readabilityAnalyzer";
import { analyzeStructure } from "../analyzers/structureAnalyzer";
import { ratioScore } from "../constants";

const MIN_AUTHORITY_SOURCE_COUNT = 3;

function calculateAuthorityScore(article: AnalyzableArticle): number {
  const checks = [
    Boolean(article.authorName),
    article.sources.length >= MIN_AUTHORITY_SOURCE_COUNT,
    article.sources.length > 0 && article.sources.every((source) => Boolean(source.doi)),
  ];
  return ratioScore(checks.filter(Boolean).length, checks.length);
}

function calculateTrustScore(article: AnalyzableArticle): number {
  const checks = [article.hasCanonical, article.hasSchema, article.sources.length > 0];
  return ratioScore(checks.filter(Boolean).length, checks.length);
}

function calculateInternalLinkingScore(article: AnalyzableArticle): number {
  const checks = [article.internalLinkCount > 0, article.internalLinkCount >= 2];
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

export function calculateDetailedScores(article: AnalyzableArticle): DetailedScores {
  const seo = calculateSEOScore(article).score;
  const aeo = calculateAEOScore(article).score;
  const geo = calculateGEOScore(article).score;
  const scientific = analyzeScientificTrust(article).score;
  const authority = calculateAuthorityScore(article);
  const trust = calculateTrustScore(article);
  const readability = analyzeReadability(article).score;
  const structure = analyzeStructure(article).score;
  const internalLinking = calculateInternalLinkingScore(article);

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
