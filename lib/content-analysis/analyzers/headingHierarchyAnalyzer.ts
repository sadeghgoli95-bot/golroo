import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

/**
 * Validates the real heading hierarchy (article.headings, level 1-6) —
 * distinct from headingAnalyzer.ts, which only checks heading *count*.
 * Two structural rules: at most one H1, and no level jumps more than one
 * step (e.g. H2 straight to H4 skips H3, confusing screen readers and
 * search engines about document structure).
 */
export function analyzeHeadingHierarchy(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (article.headings.length === 0) {
    return { score: 0, warnings: ["ساختار تیتر یافت نشد"], suggestions };
  }

  const h1Count = article.headings.filter((heading) => heading.level === 1).length;
  const validH1Count = h1Count <= 1;
  if (h1Count > 1) {
    warnings.push(`${h1Count} تیتر H1 در مقاله یافت شد — باید حداکثر یک H1 وجود داشته باشد`);
  }

  let noSkippedLevels = true;
  let previousLevel = article.headings[0].level;
  for (const heading of article.headings.slice(1)) {
    if (heading.level - previousLevel > 1) {
      noSkippedLevels = false;
      suggestions.push(`جهش از H${previousLevel} به H${heading.level} در تیتر «${heading.text}» — سلسله‌مراتب تیترها را رعایت کنید`);
    }
    previousLevel = heading.level;
  }

  const checks = [validH1Count, noSkippedLevels];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
