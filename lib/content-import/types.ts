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

/**
 * Every heading text writers actually use to open the FAQ/Sources
 * sections, canonical Persian form first. Writers sometimes annotate the
 * canonical Persian heading with an English gloss (e.g. "## سوالات متداول
 * (FAQ)") or write an English-only label with no "##" at all (e.g.
 * "External Sources:") — both are real, observed variations of the same
 * template, not a different format, so the parser must recognize all of
 * them (see buildSectionHeadingPattern in parseArticle.ts).
 */
export const FAQ_SECTION_HEADINGS = ["سوالات متداول", "FAQ"] as const;
export const SOURCES_SECTION_HEADINGS = ["منابع", "External Sources", "Sources"] as const;
