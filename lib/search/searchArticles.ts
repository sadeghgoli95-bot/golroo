import { client } from "@/sanity/lib/client";
import { searchIndexQuery } from "@/sanity/lib/queries";
import { normalizePersian, includesNormalized } from "@/lib/utils/persianSearch";
import type { ArticlePreview } from "@/components/Journal/JournalCard";
import type { SanityImageSource } from "@sanity/image-url";

export type SearchIndexArticle = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  readingTime?: number;
  publishedAt?: string;
  featuredImage?: SanityImageSource;
  featuredImageAlt?: string;
  categoryTitle?: string;
  categorySlug?: { current: string };
  authorName?: string;
  authorSlug?: { current: string };
  tags?: { title: string; slug: { current: string } }[];
  seoTitle?: string;
  seoDescription?: string;
  bodyText?: string;
  realExampleText?: string;
  scientificText?: string;
  window?: string;
  callout?: string;
  finalThought?: string;
  finalQuestion?: string;
  importantPoints?: string[];
};

export type SearchResult = SearchIndexArticle & { score: number };

let indexCache: { data: SearchIndexArticle[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

async function getSearchIndex(): Promise<SearchIndexArticle[]> {
  const now = Date.now();
  if (indexCache && now - indexCache.fetchedAt < CACHE_TTL_MS) {
    return indexCache.data;
  }
  const data = await client.fetch<SearchIndexArticle[]>(searchIndexQuery);
  indexCache = { data, fetchedAt: now };
  return data;
}

/**
 * Search published articles by normalized substring match across every
 * meaningful field, ranked by field priority: title > excerpt > tags >
 * category > body/related text > author/SEO. Newest article wins ties.
 */
export async function searchArticles(rawQuery: string): Promise<SearchResult[]> {
  const q = normalizePersian(rawQuery);
  if (!q) return [];

  const index = await getSearchIndex();
  const results: SearchResult[] = [];

  for (const article of index) {
    let score = 0;

    if (includesNormalized(article.title, q)) score += 10;
    if (includesNormalized(article.excerpt, q)) score += 6;
    if (article.tags?.some((tag) => includesNormalized(tag.title, q))) score += 5;
    if (includesNormalized(article.categoryTitle, q)) score += 4;
    if (includesNormalized(article.bodyText, q)) score += 3;
    if (includesNormalized(article.realExampleText, q)) score += 3;
    if (includesNormalized(article.scientificText, q)) score += 3;
    if (includesNormalized(article.window, q)) score += 2;
    if (includesNormalized(article.callout, q)) score += 2;
    if (includesNormalized(article.finalThought, q)) score += 2;
    if (includesNormalized(article.finalQuestion, q)) score += 2;
    if (article.importantPoints?.some((point) => includesNormalized(point, q))) score += 2;
    if (includesNormalized(article.authorName, q)) score += 1;
    if (includesNormalized(article.seoTitle, q)) score += 1;
    if (includesNormalized(article.seoDescription, q)) score += 1;

    if (score > 0) {
      results.push({ ...article, score });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bDate - aDate;
  });

  return results;
}

export function toArticlePreview(result: SearchResult): ArticlePreview & { _id: string } {
  return {
    _id: result._id,
    slug: result.slug,
    title: result.title,
    excerpt: result.excerpt,
    readingTime: result.readingTime,
    publishedAt: result.publishedAt,
    featuredImage: result.featuredImage,
    featuredImageAlt: result.featuredImageAlt,
    category: result.categoryTitle
      ? { title: result.categoryTitle, slug: result.categorySlug }
      : undefined,
    author: result.authorName
      ? { name: result.authorName, slug: result.authorSlug }
      : undefined,
    tags: result.tags,
  };
}
