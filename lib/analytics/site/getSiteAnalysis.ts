import type { Article } from "@/lib/article/types";
import type { ArticleRepository } from "@/lib/article/repository";
import type { DetailedScores } from "@/lib/content-analysis/types";
import { getAllArticles } from "@/lib/article/getAllArticles";
import { mapArticleToSummary } from "@/lib/article/mappers/toSummary";
import { analyzeExistingArticle, type ReviewAnalysis } from "@/lib/content-pipeline/reviewAnalysis";
import { calculateDetailedScores } from "@/lib/content-analysis/scoring/calculateDetailedScores";
import {
  findBrokenInternalLinks,
  extractExternalLinkUrls,
  type BrokenInternalLink,
} from "@/lib/content-analysis/analyzers/brokenLinkAnalyzer";
import { createMemoryCache, withCache } from "@/lib/article/cache";

export type ArticleAnalysis = {
  article: Article;
  review: ReviewAnalysis;
  /**
   * Same composite score already shown on the dashboard homepage —
   * `.overall` here is that exact per-article number; every "Site Health
   * Score" in the dashboard averages this same field, never a second
   * definition of "health".
   */
  detailedScores: DetailedScores;
  brokenInternalLinks: BrokenInternalLink[];
  externalLinkUrls: string[];
};

const CACHE_TTL_MS = 5 * 60 * 1000; // same TTL as CachedArticleRepository's article/list caches
const cache = createMemoryCache<ArticleAnalysis[]>(CACHE_TTL_MS);
const CACHE_KEY = "site-analysis";

async function computeSiteAnalysis(repository: ArticleRepository): Promise<ArticleAnalysis[]> {
  const articles = await getAllArticles(repository);
  const knownSlugs = new Set(
    articles.filter((article): article is Article & { slug: string } => article.slug !== null).map((a) => a.slug)
  );
  const summaries = articles.map(mapArticleToSummary);

  return articles.map((article) => {
    const candidates = summaries.filter((summary) => summary.slug !== article.slug);
    const review = analyzeExistingArticle(article, candidates);
    return {
      article,
      review,
      detailedScores: calculateDetailedScores(article, review.links.length),
      brokenInternalLinks: findBrokenInternalLinks(article, knownSlugs),
      externalLinkUrls: extractExternalLinkUrls(article.body),
    };
  });
}

/**
 * The single per-article analysis entry point for every Analytics
 * Dashboard page (Overview, Content Analytics, SEO, Site Health,
 * Reports). Reuses analyzeExistingArticle (lib/content-pipeline/
 * reviewAnalysis.ts — the same analysis the review workflow already ran)
 * for every SEO/AEO/GEO/content-quality/publish-readiness/duplicate
 * signal, and adds only the two checks that analysis never covered:
 * broken internal links and the external links a checker would need to
 * verify. No dashboard page is allowed to call an analyzer directly —
 * every page reads from this array instead, so the same article is never
 * analyzed twice with two different code paths.
 *
 * Cached for 5 minutes (Phase 1 Part 7 — "single analysis execution,
 * reuse results across pages"): the O(n²) internal-linking/duplicate
 * work this does for every article now runs at most once per TTL window
 * instead of once per page navigation.
 */
export async function getSiteAnalysis(repository: ArticleRepository): Promise<ArticleAnalysis[]> {
  return withCache(cache, CACHE_KEY, () => computeSiteAnalysis(repository));
}
