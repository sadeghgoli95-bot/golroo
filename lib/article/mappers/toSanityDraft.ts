import type { Article } from "../types";

/**
 * Reverse of fromSanity.ts, scoped to what createDraft needs — not a full
 * Article->Sanity round-trip. `body` becomes a single Portable Text
 * paragraph block because the canonical Article only carries plain text
 * (the parser doesn't preserve heading/list/image structure); this is an
 * honest minimal conversion, not a fabricated rich-text reconstruction.
 */
export type SanityDraftPayload = {
  _type: "article";
  title: string;
  slug: { _type: "slug"; current: string };
  topic?: string;
  excerpt?: string;
  callout?: string;
  body: { _type: "block"; style: "normal"; children: { _type: "span"; text: string }[] }[];
  window?: string;
  importantPoints?: string[];
  finalThought?: string;
  finalQuestion?: string;
  status: "draft";
  seo: {
    metaDescription?: string;
    keywords?: string[];
  };
};

export function mapArticleToSanityDraft(article: Article): SanityDraftPayload {
  if (!article.title) throw new Error("Cannot create a draft without a title");
  if (!article.slug) throw new Error("Cannot create a draft without a slug");

  return {
    _type: "article",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    ...(article.topic ? { topic: article.topic } : {}),
    ...(article.excerpt ? { excerpt: article.excerpt } : {}),
    ...(article.callout ? { callout: article.callout } : {}),
    body: article.body
      ? [{ _type: "block", style: "normal", children: [{ _type: "span", text: article.body }] }]
      : [],
    ...(article.window ? { window: article.window } : {}),
    ...(article.importantPoints.length > 0 ? { importantPoints: article.importantPoints } : {}),
    ...(article.finalThought ? { finalThought: article.finalThought } : {}),
    ...(article.finalQuestion ? { finalQuestion: article.finalQuestion } : {}),
    status: "draft",
    seo: {
      ...(article.metaDescription ? { metaDescription: article.metaDescription } : {}),
      ...(article.keywords.length > 0 ? { keywords: article.keywords } : {}),
    },
  };
}
