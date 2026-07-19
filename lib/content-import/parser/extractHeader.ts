import type { ArticleSections } from "../types";

export type HeaderExtractionResult = {
  title: string | null;
  slug: string | null;
  topic: string | null;
  keywords: string[];
  metaDescription: string | null;
  readingTime: number | null;
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const KEYWORD_SEPARATOR_PATTERN = /[,،]/;

export function extractHeader(sections: ArticleSections): HeaderExtractionResult {
  const title = sections.title?.trim() || null;

  const rawSlug = sections.slug?.trim() || null;
  const slug = rawSlug && SLUG_PATTERN.test(rawSlug) ? rawSlug : null;

  const topic = sections.topic?.trim() || null;

  const rawKeywords = sections.keywords || "";
  const keywords = Array.from(
    new Set(
      rawKeywords
        .split(KEYWORD_SEPARATOR_PATTERN)
        .map((keyword) => keyword.trim())
        .filter((keyword) => keyword.length > 0)
    )
  );

  const metaDescription = sections.metaDescription?.trim() || null;

  const rawReadingTime = sections.readingTime?.trim();
  const parsedReadingTime = rawReadingTime ? parseInt(rawReadingTime, 10) : NaN;
  const readingTime = Number.isFinite(parsedReadingTime) ? parsedReadingTime : null;

  return { title, slug, topic, keywords, metaDescription, readingTime };
}
