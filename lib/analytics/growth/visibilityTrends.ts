import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { SearchMetrics, SearchPageMetric } from "../search/types";
import { compareValues, type ComparisonResult } from "../comparison";
import { matchSlugForPath } from "./shared";

export type VisibilityChange = {
  slug: string;
  title: string;
  page: string;
  comparison: ComparisonResult; // current vs. previous-period real clicks (lib/analytics/comparison.ts — the one comparison formula)
};

function uniquePagesByUrl(metrics: SearchMetrics): Map<string, SearchPageMetric> {
  const map = new Map<string, SearchPageMetric>();
  for (const page of [...metrics.topPages, ...metrics.pagesNearFirstPage, ...metrics.highImpressionLowCtrPages]) {
    map.set(page.page, page);
  }
  return map;
}

/**
 * Articles Losing Visibility (item 5). This project's GSC adapter only
 * exposes three curated page slices (topPages, pagesNearFirstPage,
 * highImpressionLowCtrPages) rather than the full page-level dataset, so
 * this compares real clicks for every page that appears in the union of
 * those slices in BOTH the current and the previous 30-day window (via
 * compareValues — the single comparison formula, reused rather than
 * reimplemented). A page that fell out of every slice entirely (a worse
 * decline than one still visible) is not representable with the data this
 * adapter exposes — that's a real scope limit, documented here rather
 * than papered over with a guess.
 */
export function getVisibilityChanges(
  current: SearchMetrics,
  previous: SearchMetrics,
  analyses: ArticleAnalysis[]
): VisibilityChange[] {
  const bySlug = new Map(analyses.filter((item) => item.article.slug).map((item) => [item.article.slug as string, item]));
  const currentPages = uniquePagesByUrl(current);
  const previousPages = uniquePagesByUrl(previous);

  const changes: VisibilityChange[] = [];
  for (const [url, currentPage] of currentPages) {
    const previousPage = previousPages.get(url);
    if (!previousPage) continue;
    const slug = matchSlugForPath(url);
    if (!slug) continue;
    const analysis = bySlug.get(slug);
    if (!analysis) continue;

    changes.push({
      slug,
      title: analysis.article.title ?? "بدون عنوان",
      page: url,
      comparison: compareValues(currentPage.clicks, previousPage.clicks),
    });
  }

  return changes;
}

/** The subset of getVisibilityChanges whose real clicks actually declined, worst first. */
export function getLosingVisibility(changes: VisibilityChange[]): VisibilityChange[] {
  return changes
    .filter((change) => change.comparison.trend === "down")
    .sort((a, b) => (a.comparison.difference ?? 0) - (b.comparison.difference ?? 0));
}

export type BiggestRisk = {
  source: "search_decline" | "critical_content_issues";
  slug: string;
  title: string;
  detail: string;
};

/**
 * Today's Biggest Risk (item 3). Primary real signal: the article whose
 * real GSC clicks declined the most (getLosingVisibility[0]). If GSC data
 * isn't available/no declines are observable, falls back to the second
 * real signal this codebase already computes per article — the count of
 * `review.contentQuality.suggestions.critical` (real content-quality
 * findings) — picking the published article with the most of them. If
 * neither real signal has anything to report, returns null rather than
 * inventing a risk.
 */
export function getBiggestRisk(losingVisibility: VisibilityChange[], analyses: ArticleAnalysis[]): BiggestRisk | null {
  const worst = losingVisibility[0];
  if (worst) {
    const lostClicks = Math.abs(worst.comparison.difference ?? 0);
    return {
      source: "search_decline",
      slug: worst.slug,
      title: worst.title,
      detail: `افت ${lostClicks} کلیک واقعی در Search Console نسبت به دوره قبل`,
    };
  }

  const criticalCandidates = analyses
    .filter((item) => item.article.isPublished && item.review.contentQuality.suggestions.critical.length > 0)
    .sort((a, b) => b.review.contentQuality.suggestions.critical.length - a.review.contentQuality.suggestions.critical.length);

  const worstCritical = criticalCandidates[0];
  if (!worstCritical) return null;

  return {
    source: "critical_content_issues",
    slug: worstCritical.article.slug ?? "",
    title: worstCritical.article.title ?? "بدون عنوان",
    detail: `${worstCritical.review.contentQuality.suggestions.critical.length} مشکل بحرانی محتوایی واقعی ثبت‌شده`,
  };
}
