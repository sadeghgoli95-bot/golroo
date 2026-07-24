import type { AnalyticsAdapter, DateRange } from "../types";
import type { ChartPoint } from "../charts/types";
import { querySearchAnalytics, type SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";
import { resolveDateRange, getPreviousPeriod, type IsoDateRange } from "../dateRange";
import { buildMetricValue } from "../comparison";
import { createMemoryCache, withCache } from "@/lib/article/cache";
import { isBrandQuery } from "./brandTerms";
import { classifySearchIntent, SEARCH_INTENT_LABELS, type SearchIntent } from "./intentClassifier";
import { computeQueryMovers, computeNewAndLostQueries, computeTrendingQueries } from "./queryDiff";
import { detectQueryCannibalization, detectPageCannibalization } from "./cannibalization";
import type { SearchQueryMetric, SearchPageMetric } from "./types";
import type { SearchIntelligenceMetrics, SearchDimensionMetric, IntentBreakdownItem, SearchInsight } from "./searchIntelligenceTypes";

const CACHE_TTL_MS = 15 * 60 * 1000; // Same 15-minute cache convention as the Phase 1 adapter (Google's own quota + avoiding duplicate API work per page load).
const cache = createMemoryCache<SearchIntelligenceMetrics>(CACHE_TTL_MS);

const FULL_LIST_ROW_LIMIT = 5000; // "real full query-set diff, not just top-10" — needs the actual full query list, not a top-N sample.
const TOP_LIST_SIZE = 25; // item 6 — "a fuller list, e.g. top 25"
const MOVERS_LIST_SIZE = 15;
const NEAR_TOP_10_MIN = 11;
const NEAR_TOP_10_MAX = 20;
const HIGH_IMPRESSION_THRESHOLD = 50;
const LOW_CTR_THRESHOLD = 0.02;
/** A page needs at least this many impressions to be a meaningful "hidden gem" candidate — otherwise a single impression with 1 click (100% CTR) would misleadingly qualify. */
const HIDDEN_GEM_MIN_IMPRESSIONS = 5;
/** A "low impression volume" ceiling for the hidden-gem signal, distinct from HIGH_IMPRESSION_THRESHOLD used for the opposite (high-impression/low-CTR) signal. */
const HIDDEN_GEM_MAX_IMPRESSIONS = 50;

function toQueryMetric(row: SearchAnalyticsRow): SearchQueryMetric {
  return { query: row.keys[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.position };
}

function toPageMetric(row: SearchAnalyticsRow): SearchPageMetric {
  return { page: row.keys[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.position };
}

function toDimensionMetric(row: SearchAnalyticsRow): SearchDimensionMetric {
  return { label: row.keys[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.position };
}

async function queryTotals(range: IsoDateRange) {
  const rows = await querySearchAnalytics({ startDate: range.start, endDate: range.end });
  const row = rows[0];
  return { clicks: row?.clicks ?? 0, impressions: row?.impressions ?? 0, ctr: row?.ctr ?? 0, position: row?.position ?? 0 };
}

/**
 * Search Intent Classification breakdown (item 13) — aggregates the
 * already-fetched query rows by the rule-based classifier in
 * intentClassifier.ts. Every query is counted exactly once.
 */
function buildIntentBreakdown(rows: SearchAnalyticsRow[]): IntentBreakdownItem[] {
  const byIntent = new Map<SearchIntent, IntentBreakdownItem>();

  for (const row of rows) {
    const query = row.keys[0] ?? "";
    const intent = classifySearchIntent(query);
    const existing = byIntent.get(intent) ?? { intent, label: SEARCH_INTENT_LABELS[intent], queryCount: 0, clicks: 0, impressions: 0 };
    existing.queryCount += 1;
    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    byIntent.set(intent, existing);
  }

  return [...byIntent.values()].sort((a, b) => b.clicks - a.clicks);
}

/** Splits an ISO date range into ~weekly buckets — the granularity used for the query/page growth trend (item 18). */
function buildWeeklyBuckets(range: IsoDateRange): { start: string; end: string; label: string }[] {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const buckets: { start: string; end: string; label: string }[] = [];

  let cursor = new Date(start);
  while (cursor <= end) {
    const bucketEnd = new Date(cursor);
    bucketEnd.setUTCDate(bucketEnd.getUTCDate() + 6);
    if (bucketEnd > end) bucketEnd.setTime(end.getTime());

    const startIso = cursor.toISOString().slice(0, 10);
    const endIso = bucketEnd.toISOString().slice(0, 10);
    buckets.push({ start: startIso, end: endIso, label: startIso });

    cursor = new Date(bucketEnd);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return buckets;
}

async function buildQueryGrowthTrends(range: IsoDateRange): Promise<{ queryGrowthTrend: ChartPoint[]; pageGrowthTrend: ChartPoint[] }> {
  const buckets = buildWeeklyBuckets(range);

  const perBucket = await Promise.all(
    buckets.map(async (bucket) => {
      const [queryRows, pageRows] = await Promise.all([
        querySearchAnalytics({ startDate: bucket.start, endDate: bucket.end, dimensions: ["query"], rowLimit: FULL_LIST_ROW_LIMIT }),
        querySearchAnalytics({ startDate: bucket.start, endDate: bucket.end, dimensions: ["page"], rowLimit: FULL_LIST_ROW_LIMIT }),
      ]);
      return { label: bucket.label, queryCount: queryRows.length, pageCount: pageRows.length };
    })
  );

  return {
    queryGrowthTrend: perBucket.map((bucket) => ({ label: bucket.label, value: bucket.queryCount })),
    pageGrowthTrend: perBucket.map((bucket) => ({ label: bucket.label, value: bucket.pageCount })),
  };
}

/**
 * Biggest Opportunity / Biggest Loss / Quick Wins / Highest Growth
 * Potential / Recommended Actions (item 22) — templated strings built
 * from the real, already-computed numbers above. No invented advice.
 */
function buildInsights(input: {
  highImpressionLowCtrPages: SearchPageMetric[];
  losingKeywords: { query: string; deltaClicks: number }[];
  pagesNearTop10: SearchPageMetric[];
  trendingQueries: { query: string; impressionGrowthPercent: number | null }[];
  queryCannibalization: { query: string; pages: unknown[] }[];
}): SearchInsight[] {
  const insights: SearchInsight[] = [];

  const biggestOpportunity = input.highImpressionLowCtrPages[0];
  if (biggestOpportunity) {
    insights.push({
      id: "biggest-opportunity",
      severity: "info",
      message: `بزرگ‌ترین فرصت: صفحه «${biggestOpportunity.page}» با ${biggestOpportunity.impressions} نمایش و CTR تنها ${(biggestOpportunity.ctr * 100).toFixed(1)}٪ — بهبود عنوان/توضیحات متا می‌تواند کلیک بیشتری جذب کند.`,
    });
  }

  const biggestLoss = input.losingKeywords[0];
  if (biggestLoss) {
    insights.push({
      id: "biggest-loss",
      severity: "warning",
      message: `بزرگ‌ترین افت: عبارت «${biggestLoss.query}» با ${Math.abs(biggestLoss.deltaClicks)} کلیک کمتر نسبت به دوره قبل.`,
    });
  }

  const quickWins = input.pagesNearTop10.slice(0, 3);
  if (quickWins.length > 0) {
    insights.push({
      id: "quick-wins",
      severity: "positive",
      message: `فرصت‌های سریع: ${quickWins.length} صفحه در جایگاه ۱۱ تا ۲۰ قرار دارند (${quickWins.map((page) => page.page).join("، ")}) — یک قدم تا صفحه اول.`,
    });
  }

  const highestGrowth = input.trendingQueries[0];
  if (highestGrowth && highestGrowth.impressionGrowthPercent !== null) {
    insights.push({
      id: "highest-growth-potential",
      severity: "positive",
      message: `بیشترین پتانسیل رشد: عبارت «${highestGrowth.query}» با ${Math.round(highestGrowth.impressionGrowthPercent)}٪ رشد نمایش نسبت به دوره قبل.`,
    });
  }

  if (input.queryCannibalization.length > 0) {
    insights.push({
      id: "cannibalization-warning",
      severity: "warning",
      message: `${input.queryCannibalization.length} عبارت جستجو بین چند صفحه مختلف رقابت داخلی دارند (نمونه: «${input.queryCannibalization[0].query}») — تجمیع سیگنال روی یک صفحه پیشنهاد می‌شود.`,
    });
  }

  return insights;
}

async function buildSearchIntelligenceMetrics(range: IsoDateRange): Promise<SearchIntelligenceMetrics> {
  const previousRange = getPreviousPeriod(range);

  const [
    currentTotals,
    previousTotals,
    currentQueryRows,
    previousQueryRows,
    pageRows,
    combinedRows,
    countryRows,
    deviceRows,
    appearanceRows,
    dateRows,
    growthTrends,
  ] = await Promise.all([
    queryTotals(range),
    queryTotals(previousRange),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["query"], rowLimit: FULL_LIST_ROW_LIMIT }),
    querySearchAnalytics({ startDate: previousRange.start, endDate: previousRange.end, dimensions: ["query"], rowLimit: FULL_LIST_ROW_LIMIT }),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["page"], rowLimit: FULL_LIST_ROW_LIMIT }),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["query", "page"], rowLimit: FULL_LIST_ROW_LIMIT }),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["country"], rowLimit: 1000 }),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["device"], rowLimit: 1000 }),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["searchAppearance"], rowLimit: 1000 }),
    querySearchAnalytics({ startDate: range.start, endDate: range.end, dimensions: ["date"], rowLimit: 1000 }),
    buildQueryGrowthTrends(range),
  ]);

  const topQueries = [...currentQueryRows].sort((a, b) => b.clicks - a.clicks).slice(0, TOP_LIST_SIZE).map(toQueryMetric);
  const pageMetrics = pageRows.map(toPageMetric);
  const topPages = [...pageMetrics].sort((a, b) => b.clicks - a.clicks).slice(0, TOP_LIST_SIZE);

  const { winningKeywords, losingKeywords } = computeQueryMovers(currentQueryRows, previousQueryRows);
  const { newQueries, lostQueries } = computeNewAndLostQueries(currentQueryRows, previousQueryRows);
  const trendingQueries = computeTrendingQueries(currentQueryRows, previousQueryRows, 15);

  const pagesNearTop10 = pageMetrics
    .filter((page) => page.averagePosition >= NEAR_TOP_10_MIN && page.averagePosition <= NEAR_TOP_10_MAX)
    .sort((a, b) => a.averagePosition - b.averagePosition);

  const highImpressionLowCtrPages = pageMetrics
    .filter((page) => page.impressions >= HIGH_IMPRESSION_THRESHOLD && page.ctr < LOW_CTR_THRESHOLD)
    .sort((a, b) => b.impressions - a.impressions);

  const averageCtr = pageMetrics.length > 0 ? pageMetrics.reduce((sum, page) => sum + page.ctr, 0) / pageMetrics.length : 0;
  const highCtrLowImpressionPages = pageMetrics
    .filter((page) => page.impressions >= HIDDEN_GEM_MIN_IMPRESSIONS && page.impressions <= HIDDEN_GEM_MAX_IMPRESSIONS && page.ctr > averageCtr)
    .sort((a, b) => b.ctr - a.ctr);

  const queryCannibalization = detectQueryCannibalization(combinedRows);
  const pageCannibalization = detectPageCannibalization(combinedRows);

  const brandQueries = currentQueryRows.filter((row) => isBrandQuery(row.keys[0] ?? "")).map(toQueryMetric).sort((a, b) => b.clicks - a.clicks);
  const nonBrandQueries = currentQueryRows.filter((row) => !isBrandQuery(row.keys[0] ?? "")).map(toQueryMetric).sort((a, b) => b.clicks - a.clicks);
  const totalClicks = brandQueries.reduce((sum, q) => sum + q.clicks, 0) + nonBrandQueries.reduce((sum, q) => sum + q.clicks, 0);
  const brandClicksShare = totalClicks > 0 ? brandQueries.reduce((sum, q) => sum + q.clicks, 0) / totalClicks : null;

  const intentBreakdown = buildIntentBreakdown(currentQueryRows);

  const countryBreakdown = countryRows.map(toDimensionMetric).sort((a, b) => b.clicks - a.clicks);
  const deviceBreakdown = deviceRows.map(toDimensionMetric).sort((a, b) => b.clicks - a.clicks);
  const searchAppearanceBreakdown = appearanceRows.map(toDimensionMetric).sort((a, b) => b.clicks - a.clicks);

  const sortedDateRows = [...dateRows].sort((a, b) => (a.keys[0] ?? "").localeCompare(b.keys[0] ?? ""));
  const clicksTrend: ChartPoint[] = sortedDateRows.map((row) => ({ label: row.keys[0] ?? "", value: row.clicks }));
  const impressionsTrend: ChartPoint[] = sortedDateRows.map((row) => ({ label: row.keys[0] ?? "", value: row.impressions }));
  const ctrTrend: ChartPoint[] = sortedDateRows.map((row) => ({ label: row.keys[0] ?? "", value: Math.round(row.ctr * 1000) / 10 }));
  const positionTrend: ChartPoint[] = sortedDateRows.map((row) => ({ label: row.keys[0] ?? "", value: Math.round(row.position * 10) / 10 }));

  const insights = buildInsights({
    highImpressionLowCtrPages,
    losingKeywords,
    pagesNearTop10,
    trendingQueries,
    queryCannibalization,
  });

  return {
    clicks: buildMetricValue(currentTotals.clicks, previousTotals.clicks),
    impressions: buildMetricValue(currentTotals.impressions, previousTotals.impressions),
    ctr: buildMetricValue(currentTotals.ctr, previousTotals.ctr),
    averagePosition: buildMetricValue(currentTotals.position, previousTotals.position),

    topQueries,
    topPages,

    winningKeywords: winningKeywords.slice(0, MOVERS_LIST_SIZE),
    losingKeywords: losingKeywords.slice(0, MOVERS_LIST_SIZE),
    newQueries: newQueries.slice(0, MOVERS_LIST_SIZE),
    lostQueries: lostQueries.slice(0, MOVERS_LIST_SIZE),
    trendingQueries,

    pagesNearTop10,
    highImpressionLowCtrPages,
    highCtrLowImpressionPages,

    queryCannibalization,
    pageCannibalization,

    brandQueries: brandQueries.slice(0, TOP_LIST_SIZE),
    nonBrandQueries: nonBrandQueries.slice(0, TOP_LIST_SIZE),
    brandClicksShare,

    intentBreakdown,

    countryBreakdown,
    deviceBreakdown,
    searchAppearanceBreakdown,

    clicksTrend,
    impressionsTrend,
    ctrTrend,
    positionTrend,
    queryGrowthTrend: growthTrends.queryGrowthTrend,
    pageGrowthTrend: growthTrends.pageGrowthTrend,

    insights,
  };
}

/**
 * Phase 2 — Search Intelligence adapter. Same shape/caching convention as
 * googleSearchConsoleAdapter.ts (Phase 1), kept as a separate module/cache
 * rather than merged into it, since this module fetches a materially
 * larger, differently-shaped dataset (full query sets, combined
 * query+page rows, country/device/searchAppearance dimensions, weekly
 * buckets for growth trends).
 */
export const searchIntelligenceAdapter: AnalyticsAdapter<SearchIntelligenceMetrics> = {
  providerId: "google-search-console",
  getMetrics: async (range: DateRange) => {
    const bounds = resolveDateRange(range);
    const cacheKey = `${bounds.start}_${bounds.end}`;
    return withCache(cache, cacheKey, () => buildSearchIntelligenceMetrics(bounds));
  },
};
