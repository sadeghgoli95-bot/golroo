import { firstParagraph, truncateAtWholeWord } from "./extractParagraphs";

const AUTO_EXCERPT_MAX_LENGTH = 180;

/**
 * Single implementation for excerpt generation, in priority order: Meta
 * Description (already writer-authored or auto-generated — see
 * generateMetaDescription.ts, resolved before this is called) -> first
 * paragraph of the body -> first 180 characters of the body. Every
 * caller (validator, SEO report, Open Graph, JSON-LD, AI Overview) reads
 * the resulting article.excerpt rather than re-deriving one.
 */
export function extractExcerpt(body: string | null, metaDescription: string | null): string | null {
  if (metaDescription && metaDescription.trim()) return metaDescription.trim();
  if (!body) return null;

  const trimmedBody = body.trim();
  if (!trimmedBody) return null;

  const paragraph = firstParagraph(trimmedBody);
  if (paragraph) return truncateAtWholeWord(paragraph, AUTO_EXCERPT_MAX_LENGTH);

  return truncateAtWholeWord(trimmedBody, AUTO_EXCERPT_MAX_LENGTH);
}
