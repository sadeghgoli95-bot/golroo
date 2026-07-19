export type { ArticleSource, ParsedArticleFields, ArticleSummary } from "@/lib/article/types";

export type ArticleSections = Record<string, string>;

export type SectionKey = keyof typeof SECTION_LABEL_ALIASES;

/**
 * Canonical section key -> every label line the parser accepts for it.
 * Matching is order-independent — the parser scans every line once and
 * switches section on whichever alias it recognizes, regardless of where
 * it appears in the input. The trailing ":" is matched separately by the
 * parser, so aliases never include it themselves (an alias like "Title"
 * already covers both "Title:" and "Title :" once the parser normalizes
 * whitespace before the colon).
 *
 * ASSUMPTION: no reference sample of "the format always used for Mirora
 * articles" existed in the repo — this alias set was inferred from the
 * existing Sanity article schema field names plus common English/Persian
 * label variants. Confirm/extend before relying on it in production.
 */
export const SECTION_LABEL_ALIASES = {
  title: ["عنوان", "Title"],
  slug: ["اسلاگ", "Slug"],
  topic: ["موضوع", "Topic"],
  keywords: ["کلیدواژه‌ها", "کلیدواژه", "Keywords"],
  metaDescription: ["توضیحات متا", "Meta Description"],
  readingTime: ["زمان مطالعه", "Reading Time"],
  excerpt: ["خلاصه", "Excerpt"],
  callout: ["جمله جلب‌توجه", "Callout"],
  window: ["پنجره", "Window"],
  importantPoints: ["نکات مهم", "Important Points"],
  body: ["بدنه", "Body"],
  finalThought: ["نتیجه‌گیری نهایی", "Final Thought"],
  finalQuestion: ["پرسش پایانی", "Final Question"],
  sources: ["منابع", "Sources"],
} as const;
