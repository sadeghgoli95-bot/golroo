import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MIN_IMPORTANT_POINTS, ratioScore } from "../constants";

export function analyzeStructure(article: AnalyzableArticle): AnalyzerResult {
  const suggestions: string[] = [];

  const hasExcerpt = Boolean(article.excerpt);
  if (!hasExcerpt) suggestions.push("خلاصه مقاله وجود ندارد");

  const hasImportantPoints = article.importantPoints.length >= MIN_IMPORTANT_POINTS;
  if (!hasImportantPoints) {
    suggestions.push(`حداقل ${MIN_IMPORTANT_POINTS} نکته مهم پیشنهاد می‌شود`);
  }

  const hasFinalQuestion = Boolean(article.finalQuestion);
  if (!hasFinalQuestion) suggestions.push("پرسش پایانی وجود ندارد");

  const checks = [hasExcerpt, hasImportantPoints, hasFinalQuestion];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings: [], suggestions };
}
