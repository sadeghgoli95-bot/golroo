import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import { normalizePersianText } from "@/lib/utils/textNormalize";

const FEED_ARTICLE_LIMIT = 50;

const feedArticlesQuery = groq`
  *[_type == "article" && status != "draft" && defined(slug.current)]
  | order(coalesce(publishedAt, _createdAt) desc) [0...${FEED_ARTICLE_LIMIT}] {
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    lastUpdated,
    "authorName": author->name,
    "categoryTitle": category->title
  }
`;

export type FeedArticle = {
  title: string | null;
  slug: string;
  excerpt: string | null;
  publishedAt: string | null;
  lastUpdated: string | null;
  authorName: string | null;
  categoryTitle: string | null;
};

/**
 * Single data source for both the RSS and Atom routes (app/feed.xml,
 * app/atom.xml) — same query, same normalization, so the two formats
 * never drift into listing different articles or differently-cased text.
 * Drafts are excluded at the query level, same as app/sitemap.ts.
 */
export async function getFeedArticles(): Promise<FeedArticle[]> {
  const articles = await client.fetch<FeedArticle[]>(feedArticlesQuery);

  return articles.map((article) => ({
    ...article,
    title: article.title ? normalizePersianText(article.title) : null,
    excerpt: article.excerpt ? normalizePersianText(article.excerpt) : null,
    authorName: article.authorName ? normalizePersianText(article.authorName) : null,
    categoryTitle: article.categoryTitle ? normalizePersianText(article.categoryTitle) : null,
  }));
}
