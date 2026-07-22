import type { AnalyzableArticle } from "../types";

export type SearchIntent = "question" | "comparative" | "transactional" | "informational";

export type SearchIntentResult = {
  intent: SearchIntent;
  signals: string[];
};

// Not an ML classifier — this project has no trained intent model or AI
// provider wired in yet. A real, deterministic keyword-pattern signal
// from the Title/Focus Keyword, honestly labeled as heuristic rather
// than presented as a confident prediction.
const QUESTION_WORDS = ["چرا", "چگونه", "چطور", "چیست", "کدام", "آیا", "چند"];
const COMPARATIVE_WORDS = ["بهترین", "مقایسه", "تفاوت"];
const TRANSACTIONAL_WORDS = ["خرید", "قیمت", "رزرو", "نوبت", "مشاوره"];

export function analyzeSearchIntent(article: AnalyzableArticle): SearchIntentResult {
  const haystack = `${article.title ?? ""} ${article.focusKeyword ?? ""}`;

  if (QUESTION_WORDS.some((word) => haystack.includes(word))) {
    return { intent: "question", signals: ["عبارت پرسشی در عنوان یا کلیدواژه اصلی"] };
  }
  if (COMPARATIVE_WORDS.some((word) => haystack.includes(word))) {
    return { intent: "comparative", signals: ["عبارت مقایسه‌ای در عنوان یا کلیدواژه اصلی"] };
  }
  if (TRANSACTIONAL_WORDS.some((word) => haystack.includes(word))) {
    return { intent: "transactional", signals: ["عبارت تراکنشی در عنوان یا کلیدواژه اصلی"] };
  }

  return { intent: "informational", signals: ["پیش‌فرض بر اساس نبود سیگنال پرسشی/مقایسه‌ای/تراکنشی"] };
}
