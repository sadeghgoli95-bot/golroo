import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

/**
 * Featured-image selection happens manually in Sanity Studio, never
 * during import (see lib/content-import) — so a missing image is a
 * plain informational warning, not a scoring failure, and alt-text
 * validation is skipped entirely when there's no image to have alt text.
 */
export function analyzeImages(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!article.hasFeaturedImage) {
    warnings.push("تصویر شاخص وجود ندارد — انتخاب تصویر در Sanity Studio انجام می‌شود");
    return { score: 100, warnings, suggestions };
  }

  const hasAltTexts = article.imageAltTexts.length > 0;
  const allImagesHaveAlt = hasAltTexts && article.imageAltTexts.every((alt) => alt.trim().length > 0);

  if (!hasAltTexts) {
    suggestions.push("تصویر شاخص فاقد Alt Text است");
  } else if (!allImagesHaveAlt) {
    suggestions.push("برخی تصاویر Alt Text ندارند");
  }

  return { score: ratioScore(allImagesHaveAlt ? 1 : 0, 1), warnings, suggestions };
}
