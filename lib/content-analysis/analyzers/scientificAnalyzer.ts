import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MIN_SOURCE_COUNT, ratioScore } from "../constants";

/**
 * Source *identifier* quality (DOI/PMID/URL/authoritative domain) is
 * sourceAuthorityAnalyzer.ts's responsibility, not this file's — a DOI
 * check here used to require every source to have one, which penalized
 * book citations (books never carry a DOI, by design; see
 * lib/content-import/parser/extractSources.ts).
 */
export function analyzeScientificTrust(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasSources = article.sources.length > 0;
  if (!hasSources) warnings.push("منبعی ثبت نشده است");

  const hasEnoughSources = article.sources.length >= MIN_SOURCE_COUNT;
  if (hasSources && !hasEnoughSources) {
    suggestions.push(`حداقل ${MIN_SOURCE_COUNT} منبع علمی پیشنهاد می‌شود`);
  }

  const checks = [hasSources, hasEnoughSources];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
