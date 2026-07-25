import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { SearchMetrics } from "../search/types";
import { compareValues, type ComparisonResult } from "../comparison";
import { matchSlugForPath } from "./shared";
import { uniquePagesByUrl } from "./visibilityTrends";

export type PageSignal = {
  slug: string;
  title: string;
  page: string;
  impressions: ComparisonResult;
  clicks: ComparisonResult;
  ctr: ComparisonResult;
};

/**
 * Real period-over-period impressions/clicks/CTR comparison per page —
 * the shared join every trend-aware page signal below is built from.
 * Same scope limit as getVisibilityChanges: only pages present in both
 * periods' curated GSC slices (topPages/pagesNearFirstPage/
 * highImpressionLowCtrPages) are comparable.
 */
export function buildPageSignals(current: SearchMetrics, previous: SearchMetrics, analyses: ArticleAnalysis[]): PageSignal[] {
  const bySlug = new Map(analyses.filter((item) => item.article.slug).map((item) => [item.article.slug as string, item]));
  const currentPages = uniquePagesByUrl(current);
  const previousPages = uniquePagesByUrl(previous);

  const signals: PageSignal[] = [];
  for (const [url, currentPage] of currentPages) {
    const previousPage = previousPages.get(url);
    if (!previousPage) continue;
    const slug = matchSlugForPath(url);
    if (!slug) continue;
    const analysis = bySlug.get(slug);
    if (!analysis) continue;

    signals.push({
      slug,
      title: analysis.article.title ?? "بدون عنوان",
      page: url,
      impressions: compareValues(currentPage.impressions, previousPage.impressions),
      clicks: compareValues(currentPage.clicks, previousPage.clicks),
      ctr: compareValues(currentPage.ctr, previousPage.ctr),
    });
  }

  return signals;
}

/**
 * Impression growth without click growth (Phase 3 Part 2, trend signal).
 * Real search visibility is rising for the page but real clicks aren't
 * keeping pace — i.e. the page is being shown more but isn't converting
 * that extra visibility into clicks. Sorted by the real impression gain,
 * biggest first.
 */
export function getImpressionGrowthWithoutClicks(signals: PageSignal[]): PageSignal[] {
  return signals
    .filter((signal) => signal.impressions.trend === "up" && signal.clicks.trend !== "up")
    .sort((a, b) => (b.impressions.difference ?? 0) - (a.impressions.difference ?? 0));
}

/**
 * A real single-page CTR drop of at least this percentage (period vs.
 * period) counts as "sudden" — deterministic threshold, documented here
 * rather than left implicit; chosen to match the same 25% magnitude the
 * history timeline already uses for a "notable jump" (lib/analytics/
 * history/timeline.ts), so "sudden" means the same thing everywhere in
 * this dashboard.
 */
export const SUDDEN_CTR_DROP_THRESHOLD_PERCENT = 25;

/** Sudden CTR drops (Phase 3 Part 2, trend signal) — real page-level CTR fell by at least SUDDEN_CTR_DROP_THRESHOLD_PERCENT, worst first. */
export function getSuddenCtrDrops(signals: PageSignal[]): PageSignal[] {
  return signals
    .filter((signal) => signal.ctr.trend === "down" && signal.ctr.percentChange !== null && signal.ctr.percentChange <= -SUDDEN_CTR_DROP_THRESHOLD_PERCENT)
    .sort((a, b) => (a.ctr.percentChange ?? 0) - (b.ctr.percentChange ?? 0));
}
