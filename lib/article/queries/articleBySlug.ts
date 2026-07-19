import { groq } from "next-sanity";
import { articleProjection } from "./articleProjection";

/** No draft filter here on purpose — findBySlug can load a draft for preview/review flows. */
export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0]{
    ${articleProjection}
  }
`;
