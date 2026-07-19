import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

export function analyzeAccessibility(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const allImagesHaveAlt =
    article.imageAltTexts.length === 0 || article.imageAltTexts.every((alt) => alt.trim().length > 0);
  if (!allImagesHaveAlt) warnings.push("تصاویر بدون Alt Text وجود دارند");

  const hasHeadingStructure = article.headingCount > 0;
  if (!hasHeadingStructure) suggestions.push("ساختار تیتر برای دسترسی‌پذیری بهتر پیشنهاد می‌شود");

  const checks = [allImagesHaveAlt, hasHeadingStructure];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
