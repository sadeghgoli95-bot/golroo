import {groq} from 'next-sanity'

export const articlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc){
    _id,
    articleId,
    title,
    slug,
    topic,
    excerpt,
    readingTime,
    publishedAt,
    featuredImage
  }
`

export const articleQuery = groq`
  *[_type == "article" && slug.current == $slug][0]{
    ...,
    category->,
    author->,
    tags[]->,
    sources[]->,
    faq[]->
  }
`