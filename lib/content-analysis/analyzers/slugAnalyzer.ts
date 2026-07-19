import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { MAX_SLUG_WORD_COUNT, ratioScore } from "../constants";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function analyzeSlug(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const hasSlug = Boolean(article.slug);
  if (!hasSlug) warnings.push("Slug وجود ندارد");

  const isValidFormat = hasSlug && SLUG_PATTERN.test(article.slug!);
  if (hasSlug && !isValidFormat) warnings.push("Slug نامعتبر است");

  const wordCount = article.slug?.split("-").filter(Boolean).length ?? 0;
  const isConcise = isValidFormat && wordCount <= MAX_SLUG_WORD_COUNT;
  if (isValidFormat && !isConcise) {
    suggestions.push(`Slug کوتاه‌تر (حداکثر ${MAX_SLUG_WORD_COUNT} کلمه) پیشنهاد می‌شود`);
  }

  const checks = [hasSlug, isValidFormat, isConcise];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
