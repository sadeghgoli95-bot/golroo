import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

/**
 * article.hasOpenGraph/hasTwitterCard (set in
 * lib/article/mappers/fromParsedFields.ts) are real, not "true by
 * construction" — OpenGraph/Twitter Card generation degrades to empty
 * fields if title or a description is missing, so the flags mirror that.
 */
export function analyzeMetaTags(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];

  if (!article.hasOpenGraph) warnings.push("داده Open Graph کامل نیست (عنوان یا توضیحات وجود ندارد)");
  if (!article.hasTwitterCard) warnings.push("داده Twitter Card کامل نیست (عنوان یا توضیحات وجود ندارد)");

  const checks = [article.hasOpenGraph, article.hasTwitterCard];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions: [] };
}
