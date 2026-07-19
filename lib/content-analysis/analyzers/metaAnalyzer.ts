import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { SEO_META_MIN_LENGTH, SEO_META_MAX_LENGTH, ratioScore } from "../constants";

export function analyzeMeta(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasMeta = Boolean(article.metaDescription);
  if (!hasMeta) warnings.push("Meta Description وجود ندارد");

  const length = article.metaDescription?.length ?? 0;
  const withinLength = hasMeta && length >= SEO_META_MIN_LENGTH && length <= SEO_META_MAX_LENGTH;
  if (hasMeta && !withinLength) {
    suggestions.push(`طول توضیحات متا بین ${SEO_META_MIN_LENGTH} تا ${SEO_META_MAX_LENGTH} کاراکتر پیشنهاد می‌شود`);
  }

  const hasKeyword = hasMeta && article.keywords.some((keyword) => article.metaDescription!.includes(keyword));
  if (hasMeta && !hasKeyword) suggestions.push("کلیدواژه اصلی در توضیحات متا دیده نمی‌شود");

  const checks = [hasMeta, withinLength, hasKeyword];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
