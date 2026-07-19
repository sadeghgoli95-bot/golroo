import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

export function analyzeSchema(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];

  if (!article.hasSchema) warnings.push("Schema ساختاریافته یافت نشد");
  if (!article.hasCanonical) warnings.push("Canonical URL یافت نشد");

  const checks = [article.hasSchema, article.hasCanonical];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions: [] };
}
