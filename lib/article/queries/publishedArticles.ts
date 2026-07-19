import { groq } from "next-sanity";
import { articleProjection, NOT_DRAFT_FILTER } from "./articleProjection";

export const publishedArticlesQuery = groq`
  *[${NOT_DRAFT_FILTER}] | order(publishedAt desc){
    ${articleProjection}
  }
`;
