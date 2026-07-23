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

export type ArticleAnalysis = {
  article: Article;
  review: ReviewAnalysis;
  /**
   * Same composite score already shown on the dashboard homepage
   * (lib/analytics/dashboard/getOverviewScores.ts's `siteHealth`) —
   * `.overall` here is that exact per-article number; every "Site Health
   * Score" in the new dashboard averages this same field, never a second
   * definition of "health".
   */
  detailedScores: DetailedScores;
  brokenInternalLinks: BrokenInternalLink[];
  externalLinkUrls: string[];
};

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
 */
export async function getSiteAnalysis(repository: ArticleRepository): Promise<ArticleAnalysis[]> {
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
