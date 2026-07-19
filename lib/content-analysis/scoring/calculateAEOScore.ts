import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

export function calculateAEOScore(article: AnalyzableArticle): AnalyzerResult {
  const suggestions: string[] = [];

  const hasFinalQuestion = Boolean(article.finalQuestion);
  if (!hasFinalQuestion) suggestions.push("پرسش پایانی برای پوشش بهتر سؤال‌ها پیشنهاد می‌شود");

  const hasDirectAnswers = article.importantPoints.length > 0;
  if (!hasDirectAnswers) suggestions.push("نکات مهم برای پاسخ مستقیم پیشنهاد می‌شود");

  const hasFaqOpportunity = article.hasFaq;
  if (!hasFaqOpportunity) suggestions.push("افزودن بخش FAQ پیشنهاد می‌شود");

  const hasSnippetOpportunity = Boolean(article.excerpt);
  if (!hasSnippetOpportunity) suggestions.push("خلاصه کوتاه برای Featured Snippet پیشنهاد می‌شود");

  const checks = [hasFinalQuestion, hasDirectAnswers, hasFaqOpportunity, hasSnippetOpportunity];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings: [], suggestions };
}
