import type { ArticleAnalysis } from "./getSiteAnalysis";
import { average } from "./shared";

export type ExecutiveOverview = {
  siteHealthScore: number;
  avgSeoScore: number;
  avgAeoScore: number;
  avgGeoScore: number;
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  readyToPublish: number;
  criticalIssuesCount: number;
  topRecommendations: string[];
};

const TOP_RECOMMENDATION_COUNT = 5;

/**
 * `siteHealthScore` reuses the exact same `detailedScores.overall` field
 * already computed in getSiteAnalysis (calculateDetailedScores) — the
 * same composite score the dashboard homepage has shown since Phase 1
 * (lib/analytics/dashboard/getOverviewScores.ts), just averaged here
 * across the full corpus again. No second "site health" formula exists
 * anywhere in this codebase.
 */
export function getExecutiveOverview(analyses: ArticleAnalysis[]): ExecutiveOverview {
  const publishedArticles = analyses.filter((item) => item.article.isPublished).length;
  const readyToPublish = analyses.filter((item) => item.review.publishReadiness.status === "ready").length;
  const criticalIssuesCount = analyses.reduce(
    (sum, item) => sum + item.review.contentQuality.suggestions.critical.length,
    0
  );

  const recommendationCounts = new Map<string, number>();
  for (const item of analyses) {
    for (const recommendation of item.review.contentQuality.suggestions.recommended) {
      recommendationCounts.set(recommendation, (recommendationCounts.get(recommendation) ?? 0) + 1);
    }
  }
  const topRecommendations = Array.from(recommendationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_RECOMMENDATION_COUNT)
    .map(([recommendation]) => recommendation);

  return {
    siteHealthScore: average(analyses.map((item) => item.detailedScores.overall)),
    avgSeoScore: average(analyses.map((item) => item.review.seo.score)),
    avgAeoScore: average(analyses.map((item) => item.review.aeo.score)),
    avgGeoScore: average(analyses.map((item) => item.review.geo.score)),
    totalArticles: analyses.length,
    publishedArticles,
    draftArticles: analyses.length - publishedArticles,
    readyToPublish,
    criticalIssuesCount,
    topRecommendations,
  };
}
