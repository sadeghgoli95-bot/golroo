import type { Article } from "../types";
import { resolveAuthorName } from "../constants";
import { buildCanonicalUrl } from "../canonicalUrl";
import { generateMetaDescription } from "@/lib/content-import/parser/generateMetaDescription";

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
  category: { title: string } | null;
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
        url: string | null;
      }[]
    | null;
  tags: { title: string }[] | null;
  author: { name: string } | null;
  faq: { question: string | null; answer: string | null }[] | null;
  status: "draft" | "ready" | "published" | "review" | null;
  seo: {
    metaDescription: string | null;
    focusKeyword: string | null;
    keywords: string[] | null;
    canonicalUrl: string | null;
    ogImage: unknown | null;
    twitterTitle: string | null;
  } | null;
};

const PUBLISHED_STATUS = "published";

/**
 * ASSUMPTION: `entities`, `clusterId`, `parentTopic`, `secondaryKeywords`,
 * and `headings` have no corresponding field in the current Sanity schema
 * (confirmed against sanity/schemaTypes/article.ts) — they map to their
 * empty/null defaults until those fields exist, or a dedicated extraction
 * step populates them separately (headings would
 * need parsing Portable Text `body` blocks for heading styles, which
 * this mapper does not attempt — it only receives pre-resolved plain
 * text). `canonicalUrl` and `hasSchema` are always computed rather than
 * read from Sanity — neither depends on document data (see their fields
 * below for why).
 */
export function mapSanityDocumentToArticle(doc: SanityArticleDocument): Article {
  const slug = doc.slug?.current ?? null;

  return {
    slug,
    title: doc.title,
    topic: doc.topic,
    category: doc.category?.title ?? null,
    focusKeyword: doc.seo?.focusKeyword ?? null,
    secondaryKeywords: [],
    keywords: doc.seo?.keywords ?? [],
    tags: doc.tags?.map((tag) => tag.title) ?? [],
    entities: [],
    clusterId: null,
    parentTopic: null,
    body: doc.bodyText,
    excerpt: doc.excerpt,
    headings: [],
    faq: (doc.faq ?? [])
      .filter((item): item is { question: string; answer: string } => Boolean(item.question && item.answer))
      .map((item) => ({ question: item.question, answer: item.answer })),
    callout: doc.callout,
    window: doc.window,
    importantPoints: doc.importantPoints ?? [],
    finalThought: doc.finalThought,
    finalQuestion: doc.finalQuestion,
    // Same generator the import pipeline uses when a writer omits Meta
    // Description (lib/content-import/parser/generateMetaDescription.ts)
    // — applied here too so articles already in Sanity without one (a
    // real, observed gap: several already-published articles have no
    // seo.metaDescription) get the same automatic treatment, not a
    // second implementation.
    metaDescription: doc.seo?.metaDescription ?? generateMetaDescription(doc.bodyText),
    canonicalUrl: buildCanonicalUrl(slug),
    readingTime: doc.readingTime,
    authorName: resolveAuthorName(doc.author?.name),
    sources: (doc.sources ?? []).map((source) => ({
      doi: source.doi,
      pmid: null,
      url: source.url,
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
    // True by construction, same as fromParsedFields.ts: the public
    // article page (app/journal/[slug]/page.tsx) unconditionally emits
    // Article JSON-LD for every published article regardless of Sanity
    // field state — there's no scenario where a published article lacks it.
    hasSchema: true,
    hasCanonical: Boolean(doc.seo?.canonicalUrl) || slug !== null,
    hasFaq: Boolean(doc.faq && doc.faq.length > 0),
    // Same real signal as lib/article/mappers/fromParsedFields.ts: OG/
    // Twitter render from title+description with a fallback chain (see
    // app/journal/[slug]/page.tsx generateMetadata) — ogImage/
    // twitterTitle are optional manual overrides, not prerequisites, so
    // checking for their presence previously read false for nearly every
    // published article despite real OG/Twitter tags actually rendering.
    hasOpenGraph: Boolean(doc.title && (doc.seo?.metaDescription || doc.excerpt)),
    hasTwitterCard: Boolean(doc.title && (doc.seo?.metaDescription || doc.excerpt)),
    isPublished: doc.status === PUBLISHED_STATUS,
    wordCount: doc.bodyText ? doc.bodyText.split(/\s+/).filter(Boolean).length : 0,
    characterCount: doc.bodyText?.length ?? 0,
    estimatedReadingTime: doc.readingTime ?? 0,
    warnings: [],
  };
}
