import type { Article } from "../types";

/**
 * Reverse of fromSanity.ts, scoped to what createDraft needs — not a full
 * Article->Sanity round-trip. `body` becomes a single Portable Text
 * paragraph block because the canonical Article only carries plain text
 * (the parser doesn't preserve heading/list/image structure); this is an
 * honest minimal conversion, not a fabricated rich-text reconstruction.
 */
export type SanityReference = { _type: "reference"; _ref: string };

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
  author?: SanityReference;
  status: "draft";
  seo: {
    metaDescription?: string;
    keywords?: string[];
  };
};

/**
 * `authorRef` is a pre-resolved Sanity reference (author is a `reference`
 * field in the schema, not a plain string) — resolving/creating that
 * author document requires a Sanity client, so it's the repository's
 * job (see SanityArticleRepository.resolveAuthorReference), keeping this
 * mapper a pure function with no I/O. Omitted entirely when not given,
 * so callers that don't have one (in-memory repository, tests) still work.
 */
export function mapArticleToSanityDraft(article: Article, authorRef?: SanityReference): SanityDraftPayload {
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
    ...(authorRef ? { author: authorRef } : {}),
    status: "draft",
    seo: {
      ...(article.metaDescription ? { metaDescription: article.metaDescription } : {}),
      ...(article.keywords.length > 0 ? { keywords: article.keywords } : {}),
    },
  };
}
