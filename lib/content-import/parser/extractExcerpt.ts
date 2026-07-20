import type { ArticleSections } from "../types";

const AUTO_EXCERPT_MAX_LENGTH = 200;
const TRUNCATION_SUFFIX = "…";

export type ExcerptExtractionResult = {
  excerpt: string | null;
  callout: string | null;
};

/** Truncates at the last whole word within the limit — never mid-word. */
function deriveExcerptFromBody(body: string | null): string | null {
  if (!body) return null;

  const trimmed = body.trim();
  if (trimmed.length <= AUTO_EXCERPT_MAX_LENGTH) return trimmed;

  const truncated = trimmed.slice(0, AUTO_EXCERPT_MAX_LENGTH);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const words = lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated;

  return `${words.trim()}${TRUNCATION_SUFFIX}`;
}

/** Falls back to a body-derived excerpt only when no explicit excerpt label was present. */
export function extractExcerpt(sections: ArticleSections, body: string | null): ExcerptExtractionResult {
  return {
    excerpt: sections.excerpt?.trim() || deriveExcerptFromBody(body),
    callout: sections.callout?.trim() || null,
  };
}
