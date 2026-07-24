import type { SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";
import type { SearchQueryMetric } from "./types";
import { compareValues } from "../comparison";

export type QueryMoverMetric = SearchQueryMetric & {
  previousClicks: number;
  deltaClicks: number;
  percentChange: number | null;
};

export type TrendingQueryMetric = SearchQueryMetric & {
  previousImpressions: number;
  impressionGrowthPercent: number | null;
};

function toQueryMetric(row: SearchAnalyticsRow): SearchQueryMetric {
  return { query: row.keys[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, averagePosition: row.position };
}

/**
 * Winning/Losing Keywords (Search Intelligence items 1-2) — clicks
 * current period vs previous period, matched by exact query text, using
 * `compareValues` (lib/analytics/comparison.ts) so the delta/percent math
 * is identical to every KPI card in the dashboard rather than a
 * one-off formula.
 */
export function computeQueryMovers(
  currentRows: SearchAnalyticsRow[],
  previousRows: SearchAnalyticsRow[]
): { winningKeywords: QueryMoverMetric[]; losingKeywords: QueryMoverMetric[] } {
  const previousByQuery = new Map(previousRows.map((row) => [row.keys[0] ?? "", row.clicks]));

  const movers: QueryMoverMetric[] = currentRows.map((row) => {
    const query = row.keys[0] ?? "";
    const previousClicks = previousByQuery.get(query) ?? 0;
    const comparison = compareValues(row.clicks, previousClicks);
    return {
      ...toQueryMetric(row),
      previousClicks,
      deltaClicks: comparison.difference ?? 0,
      percentChange: comparison.percentChange,
    };
  });

  const winningKeywords = movers
    .filter((item) => item.deltaClicks > 0)
    .sort((a, b) => b.deltaClicks - a.deltaClicks);

  const losingKeywords = movers
    .filter((item) => item.deltaClicks < 0)
    .sort((a, b) => a.deltaClicks - b.deltaClicks);

  return { winningKeywords, losingKeywords };
}

/**
 * New/Lost Queries (items 3-4) — a real full query-set diff between the
 * two periods' complete query lists (whatever rowLimit the caller
 * fetched with, not just the top 10 the Phase 1 adapter shows).
 */
export function computeNewAndLostQueries(
  currentRows: SearchAnalyticsRow[],
  previousRows: SearchAnalyticsRow[]
): { newQueries: SearchQueryMetric[]; lostQueries: SearchQueryMetric[] } {
  const currentQueries = new Set(currentRows.map((row) => row.keys[0] ?? ""));
  const previousQueries = new Set(previousRows.map((row) => row.keys[0] ?? ""));

  const newQueries = currentRows
    .filter((row) => !previousQueries.has(row.keys[0] ?? ""))
    .map(toQueryMetric)
    .sort((a, b) => b.clicks - a.clicks);

  const lostQueries = previousRows
    .filter((row) => !currentQueries.has(row.keys[0] ?? ""))
    .map(toQueryMetric)
    .sort((a, b) => b.clicks - a.clicks);

  return { newQueries, lostQueries };
}

/**
 * Trending Queries (item 5) — fastest % growth in impressions, using
 * `compareValues` for the percentage math. A minimum previous-impression
 * floor avoids the noise of a query going from 1 to 3 impressions
 * reading as "+200%"; queries with no previous impressions at all belong
 * to `newQueries` (item 3), not here.
 */
const MIN_PREVIOUS_IMPRESSIONS_FOR_TREND = 5;

export function computeTrendingQueries(
  currentRows: SearchAnalyticsRow[],
  previousRows: SearchAnalyticsRow[],
  limit = 10
): TrendingQueryMetric[] {
  const previousByQuery = new Map(previousRows.map((row) => [row.keys[0] ?? "", row.impressions]));

  const withGrowth: TrendingQueryMetric[] = currentRows
    .map((row) => {
      const query = row.keys[0] ?? "";
      const previousImpressions = previousByQuery.get(query) ?? 0;
      const comparison = compareValues(row.impressions, previousImpressions);
      return { ...toQueryMetric(row), previousImpressions, impressionGrowthPercent: comparison.percentChange };
    })
    .filter((item) => item.previousImpressions >= MIN_PREVIOUS_IMPRESSIONS_FOR_TREND && item.impressionGrowthPercent !== null && item.impressionGrowthPercent > 0);

  return withGrowth.sort((a, b) => (b.impressionGrowthPercent ?? 0) - (a.impressionGrowthPercent ?? 0)).slice(0, limit);
}
