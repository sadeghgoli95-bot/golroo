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

// GROQ's `match` operator does exact character comparison, so it can't
// reliably handle Persian/Arabic Unicode variants (ي vs ی, ك vs ک) or
// stemming (نوجوان vs نوجوانی). Instead of filtering in GROQ, we fetch a
// compact search index of every published article's searchable fields
// once (cached briefly server-side — see lib/search/searchArticles.ts)
// and do normalized matching + ranking in JS.
export const searchIndexQuery = groq`
  *[_type == "article" && status != "draft"]{
    _id,
    title,
    slug,
    excerpt,
    readingTime,
    publishedAt,
    featuredImage,
    featuredImageAlt,
    "categoryTitle": category->title,
    "categorySlug": category->slug,
    "authorName": author->name,
    "authorSlug": author->slug,
    "tags": tags[]->{title, slug},
    "seoTitle": seo.metaTitle,
    "seoDescription": seo.metaDescription,
    "bodyText": pt::text(body),
    "realExampleText": pt::text(realExample),
    "scientificText": pt::text(scientificExplanation),
    window,
    callout,
    finalThought,
    finalQuestion,
    importantPoints
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
