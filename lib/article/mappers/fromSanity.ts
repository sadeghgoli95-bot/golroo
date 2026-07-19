import type { Article } from "../types";

/**
 * Minimal shape of a Sanity `article` document this mapper understands,
 * based directly on sanity/schemaTypes/article.ts and seo.ts (verified
 * against the real schema, not assumed). `body`/`realExample`/
 * `scientificExplanation` are Portable Text arrays in Sanity — resolving
 * Portable Text to plain text is a rendering concern, not a mapping one,
 * so this type expects `bodyText` already resolved by the caller.
 *
 * `sources[]` uses `authors`/`year: number` because that's what
 * sanity/schemaTypes/source.ts actually declares (not `author`/`year:
 * string`, which an earlier draft of this type assumed) — see
 * lib/article/queries/articleProjection.ts for the GROQ projection that
 * fills this shape from the real Sanity dataset.
 */
export type SanityArticleDocument = {
  title: string | null;
  slug: { current: string } | null;
  topic: string | null;
  readingTime: number | null;
  excerpt: string | null;
  callout: string | null;
  bodyText: string | null;
  window: string | null;
  importantPoints: string[] | null;
  finalThought: string | null;
  finalQuestion: string | null;
  featuredImage: unknown | null;
  featuredImageAlt: string | null;
  sources:
    | {
        doi: string | null;
        authors: string | null;
        journal: string | null;
        year: number | null;
        title: string | null;
      }[]
    | null;
  tags: { title: string }[] | null;
  author: { name: string } | null;
  faq: unknown[] | null;
  status: "draft" | "ready" | "published" | "review" | null;
  seo: {
    metaDescription: string | null;
    keywords: string[] | null;
    canonicalUrl: string | null;
    ogImage: unknown | null;
    twitterTitle: string | null;
  } | null;
};

const PUBLISHED_STATUS = "published";

/**
 * ASSUMPTION: `entities`, `clusterId`, and `parentTopic` have no
 * corresponding field in the current Sanity schema (confirmed against
 * sanity/schemaTypes/article.ts) — they map to their empty/null defaults
 * until those fields exist, or an entity-extraction step populates them
 * separately. `hasSchema` likewise has no schema-side signal to read and
 * defaults to false.
 */
export function mapSanityDocumentToArticle(doc: SanityArticleDocument): Article {
  return {
    slug: doc.slug?.current ?? null,
    title: doc.title,
    topic: doc.topic,
    keywords: doc.seo?.keywords ?? [],
    tags: doc.tags?.map((tag) => tag.title) ?? [],
    entities: [],
    clusterId: null,
    parentTopic: null,
    body: doc.bodyText,
    excerpt: doc.excerpt,
    callout: doc.callout,
    window: doc.window,
    importantPoints: doc.importantPoints ?? [],
    finalThought: doc.finalThought,
    finalQuestion: doc.finalQuestion,
    metaDescription: doc.seo?.metaDescription ?? null,
    readingTime: doc.readingTime,
    authorName: doc.author?.name ?? null,
    sources: (doc.sources ?? []).map((source) => ({
      doi: source.doi,
      pmid: null,
      author: source.authors,
      journal: source.journal,
      year: source.year !== null ? String(source.year) : null,
      title: source.title,
    })),
    headingCount: 0,
    internalLinkCount: 0,
    externalLinkCount: 0,
    imageAltTexts: doc.featuredImageAlt ? [doc.featuredImageAlt] : [],
    hasFeaturedImage: Boolean(doc.featuredImage),
    hasSchema: false,
    hasCanonical: Boolean(doc.seo?.canonicalUrl),
    hasFaq: Boolean(doc.faq && doc.faq.length > 0),
    hasOpenGraph: Boolean(doc.seo?.ogImage),
    hasTwitterCard: Boolean(doc.seo?.twitterTitle),
    isPublished: doc.status === PUBLISHED_STATUS,
    wordCount: doc.bodyText ? doc.bodyText.split(/\s+/).filter(Boolean).length : 0,
    characterCount: doc.bodyText?.length ?? 0,
    estimatedReadingTime: doc.readingTime ?? 0,
    warnings: [],
  };
}
