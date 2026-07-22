export type { ArticleSource, ArticleHeading, ArticleFaqItem, ParsedArticleFields, ArticleSummary } from "@/lib/article/types";

export type ArticleSections = Record<string, string>;

export type SectionKey = keyof typeof SECTION_LABEL_ALIASES;

/**
 * Canonical section key -> every label line the parser accepts for it.
 * Metadata only — the body, FAQ, and Sources sections are no longer
 * label-driven (see parseArticle.ts): they're delimited by the Markdown
 * body itself and by the `## سوالات متداول` / `## منابع` headings.
 */
export const SECTION_LABEL_ALIASES = {
  title: ["عنوان", "Title"],
  slug: ["اسلاگ", "Slug"],
  // "Keywords" is the current recommended template's single combined
  // field (first item becomes Focus Keyword automatically — see
  // extractHeader.ts). "Focus Keyword"/"Secondary Keywords" are still
  // accepted for writers who split them explicitly.
  keywords: ["کلیدواژه‌ها", "Keywords"],
  focusKeyword: ["کلیدواژه اصلی", "Focus Keyword"],
  secondaryKeywords: ["کلیدواژه‌های ثانویه", "Secondary Keywords"],
  topic: ["موضوع", "Topic"],
  metaDescription: ["توضیحات متا", "Meta Description"],
  category: ["دسته‌بندی", "Category"],
  tags: ["برچسب‌ها", "برچسب", "Tags"],
} as const;

export const FAQ_SECTION_HEADING = "سوالات متداول";
export const SOURCES_SECTION_HEADING = "منابع";
