import { groq } from "next-sanity";

export const existsBySlugQuery = groq`
  count(*[_type == "article" && slug.current == $slug]) > 0
`;
