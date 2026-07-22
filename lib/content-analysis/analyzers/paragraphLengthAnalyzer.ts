import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { splitParagraphs, wordCount } from "../textStats";

const MAX_PARAGRAPH_WORDS = 150;

/** Flags paragraphs long enough to hurt on-page readability, especially on mobile. */
export function analyzeParagraphLength(article: AnalyzableArticle): AnalyzerResult {
  const suggestions: string[] = [];

  if (!article.body) return { score: 0, warnings: ["بدنه مقاله وجود ندارد"], suggestions };

  const paragraphs = splitParagraphs(article.body);
  if (paragraphs.length === 0) return { score: 0, warnings: ["پاراگرافی یافت نشد"], suggestions };

  const longParagraphs = paragraphs.filter((paragraph) => wordCount(paragraph) > MAX_PARAGRAPH_WORDS);
  if (longParagraphs.length > 0) {
    suggestions.push(
      `${longParagraphs.length} پاراگراف طولانی‌تر از ${MAX_PARAGRAPH_WORDS} کلمه است — برای خوانایی بهتر آن‌ها را کوتاه‌تر کنید`
    );
  }

  const checks = [longParagraphs.length === 0];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings: [], suggestions };
}
