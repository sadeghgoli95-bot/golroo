import type { Article, ParsedArticleFields } from "../types";
import { resolveAuthorName } from "../constants";
import { buildCanonicalUrl } from "../canonicalUrl";

/**
 * The only sanctioned way to turn a parser result into a full Article.
 * Fields the parser can't know (publication state, entities/clustering,
 * legacy Mirora sections) get explicit, honest defaults — never guessed.
 * Author and canonical URL are the two fields the current import format
 * deliberately never asks the writer for — they're always derived here.
 */
export function mapParsedFieldsToArticle(parsed: ParsedArticleFields): Article {
  return {
    ...parsed,
    entities: [],
    clusterId: null,
    parentTopic: null,
    callout: null,
    window: null,
    importantPoints: [],
    finalThought: null,
    finalQuestion: null,
    canonicalUrl: buildCanonicalUrl(parsed.slug),
    authorName: resolveAuthorName(null),
    headingCount: parsed.headings.length,
    internalLinkCount: 0,
    externalLinkCount: 0,
    imageAltTexts: [],
    hasFeaturedImage: false,
    // True by construction: the pipeline always generates Article/FAQ
    // JSON-LD and a canonical URL for every parsed article — see
    // lib/content-pipeline/structuredData.ts.
    hasSchema: true,
    hasCanonical: parsed.slug !== null,
    hasFaq: parsed.faq.length > 0,
    // Real, not "true by construction": Open Graph/Twitter Card values
    // (see lib/content-pipeline/metaTags.ts) are only meaningful once a
    // title and a description (meta description or excerpt) exist.
    hasOpenGraph: Boolean(parsed.title && (parsed.metaDescription || parsed.excerpt)),
    hasTwitterCard: Boolean(parsed.title && (parsed.metaDescription || parsed.excerpt)),
    isPublished: false,
    publishedAt: null,
    lastUpdated: null,
  };
}
