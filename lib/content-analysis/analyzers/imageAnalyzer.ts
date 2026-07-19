import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

export function analyzeImages(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!article.hasFeaturedImage) warnings.push("تصویر شاخص وجود ندارد");

  const allImagesHaveAlt =
    article.imageAltTexts.length > 0 && article.imageAltTexts.every((alt) => alt.trim().length > 0);
  if (article.imageAltTexts.length > 0 && !allImagesHaveAlt) {
    suggestions.push("برخی تصاویر Alt Text ندارند");
  }

  const checks = [article.hasFeaturedImage, allImagesHaveAlt];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
