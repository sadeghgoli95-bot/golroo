import { groq } from "next-sanity";
import { articleProjection, NOT_DRAFT_FILTER } from "./articleProjection";

/**
 * Topic-based relatedness at the query layer only (cheap DB-side filter);
 * the repository still runs the result through the same mapper/validation
 * path as every other query. Deeper relatedness (keyword/entity overlap)
 * belongs to content-analysis's analyzeInternalLinking, not here.
 */
export const relatedArticlesQuery = groq`
  *[${NOT_DRAFT_FILTER} && slug.current != $slug && topic == *[_type == "article" && slug.current == $slug][0].topic]
  | order(publishedAt desc) [0...$limit]{
    ${articleProjection}
  }
`;
