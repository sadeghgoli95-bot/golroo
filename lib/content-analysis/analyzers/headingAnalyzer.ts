import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MIN_HEADING_COUNT, ratioScore } from "../constants";

export function analyzeHeadingStructure(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasHeadings = article.headingCount > 0;
  if (!hasHeadings) warnings.push("ساختار تیتر یافت نشد");

  const hasEnoughHeadings = article.headingCount >= MIN_HEADING_COUNT;
  if (hasHeadings && !hasEnoughHeadings) {
    suggestions.push(`حداقل ${MIN_HEADING_COUNT} تیتر برای ساختار بهتر پیشنهاد می‌شود`);
  }

  const checks = [hasHeadings, hasEnoughHeadings];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
