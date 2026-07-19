import type { ArticleSections } from "../types";

export type ExcerptExtractionResult = {
  excerpt: string | null;
  callout: string | null;
};

export function extractExcerpt(sections: ArticleSections): ExcerptExtractionResult {
  return {
    excerpt: sections.excerpt?.trim() || null,
    callout: sections.callout?.trim() || null,
  };
}
