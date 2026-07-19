import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { analyzeScientificTrust } from "../analyzers/scientificAnalyzer";

const PASSING_SCIENTIFIC_SCORE = 50;

export function calculateGEOScore(article: AnalyzableArticle): AnalyzerResult {
  const scientific = analyzeScientificTrust(article);
  const warnings = [...scientific.warnings];
  const suggestions = [...scientific.suggestions];

  const hasAuthorAttribution = Boolean(article.authorName);
  if (!hasAuthorAttribution) warnings.push("نام نویسنده ثبت نشده است");

  const hasEvidenceDensity = article.sources.length >= article.importantPoints.length;
  if (!hasEvidenceDensity) suggestions.push("تراکم شواهد نسبت به نکات مطرح‌شده کم است");

  const checks = [scientific.score >= PASSING_SCIENTIFIC_SCORE, hasAuthorAttribution, hasEvidenceDensity];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
