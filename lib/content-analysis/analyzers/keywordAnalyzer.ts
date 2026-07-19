import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MIN_KEYWORD_COUNT, MAX_KEYWORD_COUNT, ratioScore } from "../constants";

export function analyzeKeywords(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasKeywords = article.keywords.length > 0;
  if (!hasKeywords) warnings.push("Keywords خالی است");

  const withinRange =
    hasKeywords &&
    article.keywords.length >= MIN_KEYWORD_COUNT &&
    article.keywords.length <= MAX_KEYWORD_COUNT;
  if (hasKeywords && !withinRange) {
    suggestions.push(`تعداد کلیدواژه بین ${MIN_KEYWORD_COUNT} تا ${MAX_KEYWORD_COUNT} پیشنهاد می‌شود`);
  }

  const usedInBody =
    hasKeywords && Boolean(article.body) && article.keywords.some((keyword) => article.body!.includes(keyword));
  if (hasKeywords && !usedInBody) suggestions.push("کلیدواژه‌ها در بدنه مقاله دیده نمی‌شوند");

  const checks = [hasKeywords, withinRange, usedInBody];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
