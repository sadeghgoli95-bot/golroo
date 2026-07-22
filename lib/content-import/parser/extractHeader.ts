import type { ArticleSections } from "../types";
import { generateFocusKeyword } from "./generateFocusKeyword";

export type HeaderExtractionResult = {
  title: string | null;
  slug: string | null;
  topic: string | null;
  category: string | null;
  focusKeyword: string | null;
  secondaryKeywords: string[];
  keywords: string[];
  tags: string[];
  metaDescription: string | null;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const LIST_SEPARATOR_PATTERN = /[,،]/;

function splitList(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(LIST_SEPARATOR_PATTERN)
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  );
}

export function extractHeader(sections: ArticleSections): HeaderExtractionResult {
  const title = sections.title?.trim() || null;

  const rawSlug = sections.slug?.trim() || null;
  const slug = rawSlug && SLUG_PATTERN.test(rawSlug) ? rawSlug : null;

  const topic = sections.topic?.trim() || null;
  const category = sections.category?.trim() || null;

  // "Keywords" (the current template's single combined field) takes
  // priority when present; "Focus Keyword"/"Secondary Keywords" remain
  // supported for writers who split them explicitly. When no Focus
  // Keyword is given at all, one is generated automatically — priority
  // Title -> Keywords -> Topic (see generateFocusKeyword.ts) — the
  // writer never has to name it separately.
  const combinedKeywords = splitList(sections.keywords);
  const explicitSecondaryKeywords = splitList(sections.secondaryKeywords);
  const explicitFocusKeyword = sections.focusKeyword?.trim() || null;
  const focusKeyword = explicitFocusKeyword ?? generateFocusKeyword(title, combinedKeywords, topic);
  const secondaryKeywords =
    explicitSecondaryKeywords.length > 0
      ? explicitSecondaryKeywords
      : combinedKeywords.filter((keyword) => keyword !== focusKeyword);
  const keywords = Array.from(new Set([...(focusKeyword ? [focusKeyword] : []), ...secondaryKeywords]));

  const tags = splitList(sections.tags);

  const metaDescription = sections.metaDescription?.trim() || null;

  return { title, slug, topic, category, focusKeyword, secondaryKeywords, keywords, tags, metaDescription };
}
