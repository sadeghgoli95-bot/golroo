import type { AnalyticsAdapter, DateRange } from "../types";
import type { SearchMetrics, SearchQueryMetric, SearchPageMetric } from "./types";
import { querySearchAnalytics, type SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";
import { resolveDateRange, getPreviousPeriod, type IsoDateRange } from "../dateRange";
import { buildMetricValue } from "../comparison";
import { createMemoryCache, withCache } from "@/lib/article/cache";
import { SITE_NAME, ORGANIZATION_NAME } from "@/lib/seo/site";

const CACHE_TTL_MS = 15 * 60 * 1000; // Google's own quota + Part 7 (avoid duplicate API work) both want this cached, not refetched per page load.
const cache = createMemoryCache<SearchMetrics>(CACHE_TTL_MS);

const BRAND_TERMS = [SITE_NAME, ORGANIZATION_NAME, "golroo", "mirora"].map((term) => term.toLowerCase());
const TOP_N = 10;
const NEAR_FIRST_PAGE_MIN = 11;
const NEAR_FIRST_PAGE_MAX = 20;
const HIGH_IMPRESSION_THRESHOLD = 50;
const LOW_CTR_THRESHOLD = 0.02;

function isBrandQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return BRAND_TERMS.some((term) => lower.includes(term));
}

function toQueryMetric(row: SearchAnalyticsRow): SearchQueryMetric {
  return { query: row.keys[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.position };
}

function toPageMetric(row: SearchAnalyticsRow): SearchPageMetric {
  return { page: row.keys[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.position };
}

async function queryTotals(range: IsoDateRange) {
  const rows = await querySearchAnalytics({ startDate: range.start, endDate: range.end });
  const row = rows[0];
  return { clicks: row?.clicks ?? 0, impressions: row?.impressions ?? 0, ctr: row?.ctr ?? 0, position: row?.position ?? 0 };
}

async function getQueryMovers(current: IsoDateRange, previous: IsoDateRange) {
  const [currentRows, previousRows] = await Promise.all([
    querySearchAnalytics({ startDate: current.start, endDate: current.end, dimensions: ["query"], rowLimit: 1000 }),
    querySearchAnalytics({ startDate: previous.start, endDate: previous.end, dimensions: ["query"], rowLimit: 1000 }),
  ]);

  const previousClicksByQuery = new Map(previousRows.map((row) => [row.keys[0] ?? "", row.clicks]));
  const withDelta = currentRows.map((row) => ({
    metric: toQueryMetric(row),
    delta: row.clicks - (previousClicksByQuery.get(row.keys[0] ?? "") ?? 0),
  }));

  const fastestGrowingQueries = withDelta
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, TOP_N)
    .map((item) => item.metric);

  const losingQueries = withDelta
    .filter((item) => item.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, TOP_N)
    .map((item) => item.metric);

  return { currentRows, fastestGrowingQueries, losingQueries };
}

async function buildSearchMetrics(range: IsoDateRange): Promise<SearchMetrics> {
  const previousRange = getPreviousPeriod(range);

  const [currentTotals, previousTotals, { currentRows, fastestGrowingQueries, losingQueries }, pageRows] =
    await Promise.all([
      queryTotals(range),
      queryTotals(previousRange),
      getQueryMovers(range, previousRange),
      querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["page"], rowLimit: 1000 }),
    ]);

  const topQueries = [...currentRows].sort((a, b) => b.clicks - a.clicks).slice(0, TOP_N).map(toQueryMetric);
  const brandQueries = currentRows.filter((row) => isBrandQuery(row.keys[0] ?? "")).map(toQueryMetric).slice(0, TOP_N);
  const nonBrandQueries = currentRows
    .filter((row) => !isBrandQuery(row.keys[0] ?? ""))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, TOP_N)
    .map(toQueryMetric);

  const pageMetrics = pageRows.map(toPageMetric);
  const topPages = [...pageMetrics].sort((a, b) => b.clicks - a.clicks).slice(0, TOP_N);
  const pagesNearFirstPage = pageMetrics
    .filter((page) => page.averagePosition >= NEAR_FIRST_PAGE_MIN && page.averagePosition <= NEAR_FIRST_PAGE_MAX)
    .sort((a, b) => a.averagePosition - b.averagePosition);
  const highImpressionLowCtrPages = pageMetrics
    .filter((page) => page.impressions >= HIGH_IMPRESSION_THRESHOLD && page.ctr < LOW_CTR_THRESHOLD)
    .sort((a, b) => b.impressions - a.impressions);

  return {
    clicks: buildMetricValue(currentTotals.clicks, previousTotals.clicks),
    impressions: buildMetricValue(currentTotals.impressions, previousTotals.impressions),
    ctr: buildMetricValue(currentTotals.ctr, previousTotals.ctr),
    averagePosition: buildMetricValue(currentTotals.position, previousTotals.position),
    topQueries,
    fastestGrowingQueries,
    losingQueries,
    brandQueries,
    nonBrandQueries,
    topPages,
    pagesNearFirstPage,
    highImpressionLowCtrPages,
  };
}

/**
 * Real Search Console adapter — replaces the "local" (empty) adapter for
 * the "google-search-console" provider (see lib/analytics/types.ts's
 * AnalyticsAdapter contract, and localAdapter.ts's own comment: "wiring a
 * real provider later means writing a new adapter with this same shape").
 * Cached per resolved date range (15 min) — see lib/article/cache.
 */
export const googleSearchConsoleAdapter: AnalyticsAdapter<SearchMetrics> = {
  providerId: "google-search-console",
  getMetrics: async (range: DateRange) => {
    const bounds = resolveDateRange(range);
    const cacheKey = `${bounds.start}_${bounds.end}`;
    return withCache(cache, cacheKey, () => buildSearchMetrics(bounds));
  },
};
