import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { SearchMetrics, SearchPageMetric } from "../search/types";
import type { TrafficMetrics, LandingPageMetric } from "../traffic/types";
import { matchSlugForPath, percentileRank, round } from "./shared";

export type ContentRankingItem = {
  slug: string;
  title: string;
  seoScore: number;
  clicks: number | null;
  sessions: number | null;
  /**
   * Content Performance Ranking (item 13). Combines three real, differently
   * -scaled signals by percentile-ranking each against the site's own
   * corpus (never a magic normalization constant):
   *   performanceScore = round(100 × (0.4 × seoPercentile
   *                                  + 0.3 × clicksPercentile
   *                                  + 0.3 × sessionsPercentile))
   * clicksPercentile/sessionsPercentile use 0 for articles whose page
   * wasn't observed in the fetched real GSC/GA4 slices (not "0 clicks" —
   * "not in the ranked/percentiled sample", which the UI must label as
   * such), so an unobserved page never outranks an observed low performer.
   */
  performanceScore: number;
};

function findPage(slug: string, pages: SearchPageMetric[]): SearchPageMetric | null {
  return pages.find((page) => matchSlugForPath(page.page) === slug) ?? null;
}

function findLandingPage(slug: string, landingPages: LandingPageMetric[]): LandingPageMetric | null {
  return landingPages.find((page) => matchSlugForPath(page.path) === slug) ?? null;
}

export function getContentPerformanceRanking(
  analyses: ArticleAnalysis[],
  search: SearchMetrics | null,
  traffic: TrafficMetrics | null
): ContentRankingItem[] {
  const pages = search ? [...search.topPages, ...search.pagesNearFirstPage, ...search.highImpressionLowCtrPages] : [];
  const landingPages = traffic?.landingPages ?? [];

  const rows = analyses
    .filter((item) => item.article.slug && item.article.isPublished)
    .map((item) => {
      const slug = item.article.slug as string;
      const page = findPage(slug, pages);
      const landingPage = findLandingPage(slug, landingPages);
      return {
        slug,
        title: item.article.title ?? "بدون عنوان",
        seoScore: item.review.seo.score,
        clicks: page ? page.clicks : null,
        sessions: landingPage ? landingPage.sessions : null,
      };
    });

  const seoValues = rows.map((row) => row.seoScore);
  const clicksValues = rows.map((row) => row.clicks ?? 0);
  const sessionsValues = rows.map((row) => row.sessions ?? 0);

  const items: ContentRankingItem[] = rows.map((row) => {
    const seoPercentile = percentileRank(seoValues, row.seoScore);
    const clicksPercentile = percentileRank(clicksValues, row.clicks ?? 0);
    const sessionsPercentile = percentileRank(sessionsValues, row.sessions ?? 0);
    const performanceScore = round(100 * (0.4 * seoPercentile + 0.3 * clicksPercentile + 0.3 * sessionsPercentile));

    return { ...row, performanceScore };
  });

  return items.sort((a, b) => b.performanceScore - a.performanceScore);
}
