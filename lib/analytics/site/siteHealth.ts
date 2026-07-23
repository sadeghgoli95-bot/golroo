import type { ArticleAnalysis } from "./getSiteAnalysis";
import { average } from "./shared";
import { findDuplicateSlugs } from "./findDuplicateFields";
import { resolveInternalLinkTargetSlug, extractLinkUrls } from "@/lib/content-analysis/analyzers/brokenLinkAnalyzer";
import { getArticlesNeedingUpdate } from "./publishingActivity";

const PASSED_CHECKS_PER_ARTICLE = ["hasSchema", "hasCanonical", "hasOpenGraph", "hasTwitterCard", "hasFaq", "hasFeaturedImage"] as const;

export type SiteHealth = {
  healthScore: number;
  criticalCount: number;
  warningCount: number;
  passedChecksCount: number;
  totalChecksCount: number;
  duplicateSlugs: ReturnType<typeof findDuplicateSlugs>;
  brokenInternalLinksCount: number;
  orphanArticles: { slug: string; title: string }[];
  articlesNeedingUpdate: { slug: string; title: string; lastKnownDate: string | null }[];
};

function toRow(item: ArticleAnalysis) {
  return { slug: item.article.slug ?? "", title: item.article.title ?? "بدون عنوان" };
}

/**
 * An article is "orphan" when no other article's body links to it (see
 * brokenLinkAnalyzer.ts for the same `/journal/<slug>` link resolution
 * used to detect broken links — this reuses that exact resolver rather
 * than re-parsing links a second way).
 */
function findOrphanArticles(analyses: ArticleAnalysis[]): ArticleAnalysis[] {
  const linkedSlugs = new Set<string>();
  for (const item of analyses) {
    for (const url of extractLinkUrls(item.article.body)) {
      const targetSlug = resolveInternalLinkTargetSlug(url);
      if (targetSlug) linkedSlugs.add(targetSlug);
    }
  }
  return analyses.filter((item) => item.article.isPublished && item.article.slug && !linkedSlugs.has(item.article.slug));
}

export function getSiteHealth(analyses: ArticleAnalysis[], now: Date = new Date()): SiteHealth {
  const allArticles = analyses.map((item) => item.article);

  const criticalCount = analyses.reduce((sum, item) => sum + item.review.contentQuality.suggestions.critical.length, 0);
  const warningCount = analyses.reduce((sum, item) => sum + item.review.contentQuality.suggestions.recommended.length, 0);

  let passedChecksCount = 0;
  for (const item of analyses) {
    for (const check of PASSED_CHECKS_PER_ARTICLE) {
      if (item.article[check]) passedChecksCount += 1;
    }
  }

  return {
    healthScore: average(analyses.map((item) => item.detailedScores.overall)),
    criticalCount,
    warningCount,
    passedChecksCount,
    totalChecksCount: analyses.length * PASSED_CHECKS_PER_ARTICLE.length,
    duplicateSlugs: findDuplicateSlugs(allArticles),
    brokenInternalLinksCount: analyses.reduce((sum, item) => sum + item.brokenInternalLinks.length, 0),
    orphanArticles: findOrphanArticles(analyses).map(toRow),
    articlesNeedingUpdate: getArticlesNeedingUpdate(analyses, now).map((item) => ({
      ...toRow(item),
      lastKnownDate: item.article.lastUpdated ?? item.article.publishedAt,
    })),
  };
}
