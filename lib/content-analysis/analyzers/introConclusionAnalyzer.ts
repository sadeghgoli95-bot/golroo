import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";
import { splitParagraphs, wordCount } from "../textStats";

const MIN_INTRO_WORDS = 30;
const MIN_CONCLUSION_WORDS = 20;

/** Checks the first paragraph (introduction) and last paragraph (conclusion) for substance. */
export function analyzeIntroConclusion(article: AnalyzableArticle): AnalyzerResult {
  const suggestions: string[] = [];

  if (!article.body) return { score: 0, warnings: ["بدنه مقاله وجود ندارد"], suggestions };

  const paragraphs = splitParagraphs(article.body);
  if (paragraphs.length === 0) return { score: 0, warnings: ["پاراگرافی یافت نشد"], suggestions };

  const intro = paragraphs[0];
  const conclusion = paragraphs[paragraphs.length - 1];

  const strongIntro = wordCount(intro) >= MIN_INTRO_WORDS;
  if (!strongIntro) suggestions.push("مقدمه مقاله کوتاه است — مقدمه‌ای قوی‌تر برای معرفی موضوع پیشنهاد می‌شود");

  const strongConclusion = paragraphs.length > 1 && wordCount(conclusion) >= MIN_CONCLUSION_WORDS;
  if (!strongConclusion) suggestions.push("جمع‌بندی مقاله ضعیف است یا وجود ندارد — یک جمع‌بندی قوی‌تر پیشنهاد می‌شود");

  const checks = [strongIntro, strongConclusion];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings: [], suggestions };
}
