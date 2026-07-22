import { groq } from "next-sanity";

/**
 * The one GROQ projection every repository query reuses. Its shape is a
 * 1:1 match for SanityArticleDocument (lib/article/mappers/fromSanity.ts)
 * — change one, change the other. `pt::text(body)` resolves Portable Text
 * to plain text at query time, matching the convention already used by
 * sanity/lib/queries.ts's searchIndexQuery.
 */
export const articleProjection = groq`
  title,
  slug,
  topic,
  "category": category->{title},
  readingTime,
  excerpt,
  callout,
  "bodyText": pt::text(body),
  window,
  importantPoints,
  finalThought,
  finalQuestion,
  featuredImage,
  featuredImageAlt,
  "sources": sources[]->{doi, authors, journal, year, title, url},
  "tags": tags[]->{title},
  "author": author->{name},
  "faq": faq[]->{question, answer},
  status,
  "seo": {
    "metaDescription": seo.metaDescription,
    "keywords": seo.keywords,
    "canonicalUrl": seo.canonicalUrl,
    "ogImage": seo.ogImage,
    "twitterTitle": seo.twitterTitle
  }
`;

/** Matches the same "not a draft" convention already used by sanity/lib/queries.ts. */
export const NOT_DRAFT_FILTER = `_type == "article" && status != "draft"`;
