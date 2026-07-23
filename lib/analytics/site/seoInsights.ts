import type { ArticleAnalysis } from "./getSiteAnalysis";
import { average, topN, bottomN, bucketizeScores, type CountBucket } from "./shared";
import { findDuplicateTitles, findDuplicateMetaDescriptions, findDuplicateSlugs } from "./findDuplicateFields";

const TOP_BOTTOM_COUNT = 10;

export type StatusBreakdown = { withIt: number; withoutIt: number };

export type SeoInsights = {
  averageSeoScore: number;
  seoScoreDistribution: CountBucket[];
  topSeoArticles: { slug: string; title: string; score: number }[];
  lowestSeoArticles: { slug: string; title: string; score: number }[];
  missingMetaDescription: { slug: string; title: string }[];
  missingFocusKeyword: { slug: string; title: string }[];
  duplicateTitles: ReturnType<typeof findDuplicateTitles>;
  duplicateMetaDescriptions: ReturnType<typeof findDuplicateMetaDescriptions>;
  duplicateSlugs: ReturnType<typeof findDuplicateSlugs>;
  canonicalStatus: StatusBreakdown;
  openGraphStatus: StatusBreakdown;
  twitterCardStatus: StatusBreakdown;
  jsonLdStatus: StatusBreakdown;
  /** breadcrumbJsonLd is unconditionally emitted for every article page (app/journal/[slug]/page.tsx) — true by construction, not measured per-article. */
  breadcrumbCoveragePercent: 100;
  internalLinkOpportunities: { slug: string; title: string; suggestionCount: number }[];
  externalLinkOpportunities: { slug: string; title: string }[];
  brokenLinks: { slug: string; title: string; url: string; targetSlug: string }[];
  /** sitemap.ts includes every non-draft article by construction (status != "draft") — Article only exposes isPublished, so this is that same boolean, not a separate computation. */
  sitemapCoveredCount: number;
  sitemapExcludedCount: number;
  featuredSnippetReadyCount: number;
  aiOverviewReadyCount: number;
  issueDistribution: CountBucket[];
};

function toRow(item: ArticleAnalysis) {
  return { slug: item.article.slug ?? "", title: item.article.title ?? "بدون عنوان" };
}

function breakdown(analyses: ArticleAnalysis[], predicate: (item: ArticleAnalysis) => boolean): StatusBreakdown {
  const withIt = analyses.filter(predicate).length;
  return { withIt, withoutIt: analyses.length - withIt };
}

export function getSeoInsights(analyses: ArticleAnalysis[]): SeoInsights {
  const seoScoreOf = (item: ArticleAnalysis) => item.review.seo.score;
  const allArticles = analyses.map((item) => item.article);

  const issueLabelCounts = new Map<string, number>();
  for (const item of analyses) {
    for (const warning of item.review.seo.warnings) {
      issueLabelCounts.set(warning, (issueLabelCounts.get(warning) ?? 0) + 1);
    }
  }
  const issueDistribution: CountBucket[] = Array.from(issueLabelCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return {
    averageSeoScore: average(analyses.map(seoScoreOf)),
    seoScoreDistribution: bucketizeScores(analyses.map(seoScoreOf)),
    topSeoArticles: topN(analyses, TOP_BOTTOM_COUNT, seoScoreOf).map((item) => ({ ...toRow(item), score: seoScoreOf(item) })),
    lowestSeoArticles: bottomN(analyses, TOP_BOTTOM_COUNT, seoScoreOf).map((item) => ({ ...toRow(item), score: seoScoreOf(item) })),
    missingMetaDescription: analyses.filter((item) => !item.article.metaDescription).map(toRow),
    missingFocusKeyword: analyses.filter((item) => !item.article.focusKeyword).map(toRow),
    duplicateTitles: findDuplicateTitles(allArticles),
    duplicateMetaDescriptions: findDuplicateMetaDescriptions(allArticles),
    duplicateSlugs: findDuplicateSlugs(allArticles),
    canonicalStatus: breakdown(analyses, (item) => item.article.hasCanonical),
    openGraphStatus: breakdown(analyses, (item) => item.article.hasOpenGraph),
    twitterCardStatus: breakdown(analyses, (item) => item.article.hasTwitterCard),
    jsonLdStatus: breakdown(analyses, (item) => item.article.hasSchema),
    breadcrumbCoveragePercent: 100,
    internalLinkOpportunities: analyses
      .filter((item) => item.review.links.length > 0)
      .map((item) => ({ ...toRow(item), suggestionCount: item.review.links.length })),
    externalLinkOpportunities: analyses.filter((item) => item.article.externalLinkCount === 0).map(toRow),
    brokenLinks: analyses.flatMap((item) =>
      item.brokenInternalLinks.map((link) => ({ ...toRow(item), url: link.url, targetSlug: link.targetSlug }))
    ),
    sitemapCoveredCount: analyses.filter((item) => item.article.isPublished).length,
    sitemapExcludedCount: analyses.filter((item) => !item.article.isPublished).length,
    featuredSnippetReadyCount: analyses.filter((item) => item.review.contentQuality.featuredSnippetReady).length,
    aiOverviewReadyCount: analyses.filter((item) => item.review.contentQuality.aiOverviewReady).length,
    issueDistribution,
  };
}
