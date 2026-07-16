import {groq} from 'next-sanity'

const articleCardProjection = groq`
  _id,
  articleId,
  title,
  slug,
  topic,
  excerpt,
  readingTime,
  publishedAt,
  featuredImage,
  featuredImageAlt,
  category->{title, slug},
  author->{name, slug, image},
  tags[]->{title, slug}
`

export const articlesQuery = groq`
  *[_type == "article" && status != "draft"] | order(publishedAt desc){
    ${articleCardProjection}
  }
`

export const articleQuery = groq`
  *[_type == "article" && status != "draft" && slug.current == $slug][0]{
    ...,
    category->,
    author->,
    tags[]->,
    sources[]->,
    faq[]->
  }
`

// ---------- Category ----------

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0]{ title, description, slug }
`

export const articlesByCategoryQuery = groq`
  *[_type == "article" && status != "draft" && category->slug.current == $slug]
  | order(publishedAt desc) [$start...$end]{
    ${articleCardProjection}
  }
`

export const articlesByCategoryCountQuery = groq`
  count(*[_type == "article" && status != "draft" && category->slug.current == $slug])
`

// ---------- Tag ----------

export const tagBySlugQuery = groq`
  *[_type == "tag" && slug.current == $slug][0]{ title, description, slug }
`

export const articlesByTagQuery = groq`
  *[_type == "article" && status != "draft" && $slug in tags[]->slug.current]
  | order(publishedAt desc) [$start...$end]{
    ${articleCardProjection}
  }
`

export const articlesByTagCountQuery = groq`
  count(*[_type == "article" && status != "draft" && $slug in tags[]->slug.current])
`

export const relatedTagsQuery = groq`
  *[_type == "article" && status != "draft" && $slug in tags[]->slug.current].tags[]->{title, slug}
`

export const popularTagsQuery = groq`
  *[_type == "tag"]{
    title,
    slug,
    "count": count(*[_type == "article" && status != "draft" && ^.slug.current in tags[]->slug.current])
  } | order(count desc) [0...8]
`

// ---------- Author ----------

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0]{
    name, slug, image, title, bio, degree, organization, interests, quote
  }
`

export const articlesByAuthorQuery = groq`
  *[_type == "article" && status != "draft" && author->slug.current == $slug]
  | order(publishedAt desc) [$start...$end]{
    ${articleCardProjection}
  }
`

export const articlesByAuthorCountQuery = groq`
  count(*[_type == "article" && status != "draft" && author->slug.current == $slug])
`

export const authorLatestPublishedAtQuery = groq`
  *[_type == "article" && status != "draft" && author->slug.current == $slug]
  | order(publishedAt desc)[0].publishedAt
`

// ---------- Search ----------

const searchMatchFilter = groq`
  status != "draft" && (
    title match $q ||
    excerpt match $q ||
    pt::text(body) match $q ||
    category->title match $q ||
    author->name match $q ||
    count(tags[]->title[@ match $q]) > 0
  )
`

export const searchResultsQuery = groq`
  *[_type == "article" && ${searchMatchFilter}]
  | score(
      boost(title match $q, 4),
      boost(excerpt match $q, 2),
      boost(category->title match $q, 1),
      boost(author->name match $q, 1),
      boost(pt::text(body) match $q, 1)
    )
  | order(_score desc, publishedAt desc) [$start...$end]{
    ${articleCardProjection}
  }
`

export const searchResultsCountQuery = groq`
  count(*[_type == "article" && ${searchMatchFilter}])
`

export const searchSuggestionsQuery = groq`
  *[_type == "article" && ${searchMatchFilter}]
  | score(
      boost(title match $q, 4),
      boost(excerpt match $q, 2),
      boost(category->title match $q, 1),
      boost(author->name match $q, 1),
      boost(pt::text(body) match $q, 1)
    )
  | order(_score desc, publishedAt desc) [0...8]{
    title,
    slug,
    readingTime,
    publishedAt,
    category->{title, slug}
  }
`

// ---------- FAQ ----------

export const publishedFaqsQuery = groq`
  *[_type == "faq" && published != false] | order(order asc){
    _id,
    question,
    slug,
    answer,
    category,
    order
  }
`
