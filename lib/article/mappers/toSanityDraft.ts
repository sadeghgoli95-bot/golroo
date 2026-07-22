import type { Article } from "../types";
import { markdownToPortableText, type PortableTextBodyItem } from "./portableText/markdownToPortableText";

/**
 * Reverse of fromSanity.ts, scoped to what createDraft/updateDraft need —
 * not a full Article->Sanity round-trip. `body` is converted from the
 * parser's raw Markdown string (see extractBody.ts) into real Portable
 * Text blocks via markdownToPortableText — the single place in this
 * codebase allowed to construct `article.body` Portable Text, so every
 * block/span always gets a `_key` (see portableText/createKey.ts) and
 * Studio never reports "Missing keys" for this field again.
 */
export type SanityReference = { _type: "reference"; _ref: string };

/**
 * `category`, `tags`, `faq`, and `sources` are `reference`/array-of-
 * reference fields on the Sanity `article` schema (sanity/schemaTypes/
 * article.ts) — they point at real `category`/`tag`/`faq`/`source`
 * documents, not plain strings/objects. Resolving (or creating) those
 * documents requires a Sanity client, so — same reasoning as `author` —
 * it's the repository's job (SanityArticleRepository.resolve*Reference*),
 * keeping this mapper a pure function with no I/O. Every ref is optional
 * so callers without a resolved value (in-memory repository, tests) still
 * work; omitted entirely rather than sent as an empty/undefined field.
 */
export type SanityDraftRefs = {
  author?: SanityReference;
  category?: SanityReference;
  tags?: SanityReference[];
  faq?: SanityReference[];
  sources?: SanityReference[];
};

export type SanityDraftPayload = {
  _type: "article";
  title: string;
  slug: { _type: "slug"; current: string };
  topic?: string;
  readingTime?: number;
  excerpt?: string;
  callout?: string;
  body: PortableTextBodyItem[];
  window?: string;
  importantPoints?: string[];
  finalThought?: string;
  finalQuestion?: string;
  category?: SanityReference;
  tags?: SanityReference[];
  faq?: SanityReference[];
  sources?: SanityReference[];
  author?: SanityReference;
  status: "draft";
  seo: {
    metaDescription?: string;
    focusKeyword?: string;
    keywords?: string[];
  };
};

/**
 * `refs` carries every reference-typed field the repository has already
 * resolved (or created) against Sanity before calling this function — see
 * SanityDraftRefs above for why those can't be resolved here.
 */
export function mapArticleToSanityDraft(article: Article, refs: SanityDraftRefs = {}): SanityDraftPayload {
  if (!article.title) throw new Error("Cannot create a draft without a title");
  if (!article.slug) throw new Error("Cannot create a draft without a slug");

  return {
    _type: "article",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    ...(article.topic ? { topic: article.topic } : {}),
    ...(article.readingTime !== null ? { readingTime: article.readingTime } : {}),
    ...(article.excerpt ? { excerpt: article.excerpt } : {}),
    ...(article.callout ? { callout: article.callout } : {}),
    body: markdownToPortableText(article.body),
    ...(article.window ? { window: article.window } : {}),
    ...(article.importantPoints.length > 0 ? { importantPoints: article.importantPoints } : {}),
    ...(article.finalThought ? { finalThought: article.finalThought } : {}),
    ...(article.finalQuestion ? { finalQuestion: article.finalQuestion } : {}),
    ...(refs.category ? { category: refs.category } : {}),
    ...(refs.tags && refs.tags.length > 0 ? { tags: refs.tags } : {}),
    ...(refs.faq && refs.faq.length > 0 ? { faq: refs.faq } : {}),
    ...(refs.sources && refs.sources.length > 0 ? { sources: refs.sources } : {}),
    ...(refs.author ? { author: refs.author } : {}),
    status: "draft",
    seo: {
      ...(article.metaDescription ? { metaDescription: article.metaDescription } : {}),
      ...(article.focusKeyword ? { focusKeyword: article.focusKeyword } : {}),
      ...(article.keywords.length > 0 ? { keywords: article.keywords } : {}),
    },
  };
}
