import { groq } from "next-sanity";
import { articleProjection } from "./articleProjection";

/** Unlike publishedArticlesQuery, this intentionally includes drafts — listAll() means all. */
export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc){
    ${articleProjection}
  }
`;
