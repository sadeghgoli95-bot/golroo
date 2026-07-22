import type { Article } from "@/lib/article/types";

const MAX_SENTENCES = 3;
const MIN_SENTENCE_LENGTH = 20;
const HEADING_LINE_PATTERN = /^#{1,6}\s+.*$/gm;
const SENTENCE_SPLIT_PATTERN = /(?<=[.!؟?])\s+/;

/**
 * Deterministic extractive summary — real sentences taken verbatim from
 * the article body, not an AI-generated one. No AIProvider is wired into
 * this project (lib/ai/types.ts), so "automatically generate an AI
 * Overview summary" without fabricating text means deriving it from what
 * the writer actually wrote, the same honesty rule the excerpt extractor
 * already follows (lib/content-import/parser/extractExcerpt.ts). Falls
 * back to the excerpt when the body has no usable sentences.
 */
export function buildAiOverviewSummary(article: Pick<Article, "body" | "excerpt">): string | null {
  if (!article.body) return article.excerpt;

  const sentences = article.body
    .replace(HEADING_LINE_PATTERN, "")
    .split(SENTENCE_SPLIT_PATTERN)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= MIN_SENTENCE_LENGTH);

  if (sentences.length === 0) return article.excerpt;

  return sentences.slice(0, MAX_SENTENCES).join(" ");
}
