import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

const MIN_WORD_COUNT = 300;
const GOOD_WORD_COUNT = 600;

/** Uses article.wordCount, already computed by the parser — no second word-counting implementation. */
export function analyzeThinContent(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const words = article.wordCount;
  if (words === 0) return { score: 0, warnings: ["بدنه مقاله وجود ندارد"], suggestions };

  if (words < MIN_WORD_COUNT) {
    warnings.push(`محتوا کم‌عمق است (${words} کلمه) — حداقل ${MIN_WORD_COUNT} کلمه پیشنهاد می‌شود`);
  } else if (words < GOOD_WORD_COUNT) {
    suggestions.push(`محتوا می‌تواند عمیق‌تر شود (${words} کلمه) — حدود ${GOOD_WORD_COUNT} کلمه برای پوشش کامل‌تر پیشنهاد می‌شود`);
  }

  const checks = [words >= MIN_WORD_COUNT];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
