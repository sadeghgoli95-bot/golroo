import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { SEO_TITLE_MIN_LENGTH, SEO_TITLE_MAX_LENGTH, ratioScore } from "../constants";

export function analyzeTitle(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasTitle = Boolean(article.title);
  if (!hasTitle) warnings.push("عنوان وجود ندارد");

  const length = article.title?.length ?? 0;
  const withinLength = hasTitle && length >= SEO_TITLE_MIN_LENGTH && length <= SEO_TITLE_MAX_LENGTH;
  if (hasTitle && !withinLength) {
    suggestions.push(`طول عنوان بین ${SEO_TITLE_MIN_LENGTH} تا ${SEO_TITLE_MAX_LENGTH} کاراکتر پیشنهاد می‌شود`);
  }

  const hasKeyword = hasTitle && article.keywords.some((keyword) => article.title!.includes(keyword));
  if (hasTitle && !hasKeyword) suggestions.push("کلیدواژه اصلی در عنوان دیده نمی‌شود");

  const checks = [hasTitle, withinLength, hasKeyword];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
