import type { Article, ParsedArticleFields } from "../types";

/**
 * The only sanctioned way to turn a parser result into a full Article.
 * Fields the parser can't know (publication state, structural signals,
 * classification beyond topic/keywords) get explicit, honest defaults —
 * never guessed.
 */
export function mapParsedFieldsToArticle(parsed: ParsedArticleFields): Article {
  return {
    ...parsed,
    tags: [],
    entities: [],
    clusterId: null,
    parentTopic: null,
    authorName: null,
    headingCount: 0,
    internalLinkCount: 0,
    externalLinkCount: 0,
    imageAltTexts: [],
    hasFeaturedImage: false,
    hasSchema: false,
    hasCanonical: false,
    hasFaq: false,
    hasOpenGraph: false,
    hasTwitterCard: false,
    isPublished: false,
  };
}
