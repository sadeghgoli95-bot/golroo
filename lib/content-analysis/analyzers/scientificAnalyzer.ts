import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MIN_SOURCE_COUNT, ratioScore } from "../constants";

export function analyzeScientificTrust(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasSources = article.sources.length > 0;
  if (!hasSources) warnings.push("منبعی ثبت نشده است");

  const hasEnoughSources = article.sources.length >= MIN_SOURCE_COUNT;
  if (hasSources && !hasEnoughSources) {
    suggestions.push(`حداقل ${MIN_SOURCE_COUNT} منبع علمی پیشنهاد می‌شود`);
  }

  const sourcesWithDoi = article.sources.filter((source) => source.doi).length;
  const allSourcesHaveDoi = hasSources && sourcesWithDoi === article.sources.length;
  if (hasSources && !allSourcesHaveDoi) {
    suggestions.push(`${article.sources.length - sourcesWithDoi} منبع بدون DOI است`);
  }

  const checks = [hasSources, hasEnoughSources, allSourcesHaveDoi];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
