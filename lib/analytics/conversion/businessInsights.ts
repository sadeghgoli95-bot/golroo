import { runReport } from "@/lib/google/ga4Client";
import type { IsoDateRange } from "../dateRange";
import type { ContentAttributionRow, ExitRateRow, CtaSuggestion } from "./types";

const EXIT_ROW_LIMIT = 20;

/**
 * Real per-page exit rate — "exits" and "screenPageViews" are both real,
 * queryable GA4 Data API metrics; exitRate here is a derived ratio of two
 * real numbers, not a metric GA4 exposes directly by name (the API has no
 * "exitRate" metric), so this module computes it rather than relying on
 * one that doesn't exist.
 */
export async function getExitRateInsights(range: IsoDateRange): Promise<ExitRateRow[]> {
  const rows = await runReport({
    startDate: range.start,
    endDate: range.end,
    dimensions: ["pagePath"],
    metrics: ["exits", "screenPageViews"],
    limit: EXIT_ROW_LIMIT,
  });

  return rows
    .map((row) => {
      const pageViews = row.metrics.screenPageViews ?? 0;
      const exits = row.metrics.exits ?? 0;
      return { page: row.dimensions.pagePath ?? "", pageViews, exits, exitRate: pageViews > 0 ? (exits / pageViews) * 100 : 0 };
    })
    .sort((a, b) => b.exitRate - a.exitRate);
}

/**
 * Articles whose real GA4 engagementRate (as a landing page) is above the
 * period average, yet whose real body content has zero internal links
 * toward /appointment or /contact (from getContentAttribution) — a real,
 * derivable mismatch between "people are engaged here" and "this page
 * never points them toward booking." No fabricated score, just a filter
 * over two already-real fields.
 */
export function getEngagementConversionMismatch(rows: ContentAttributionRow[]): ContentAttributionRow[] {
  const withSessions = rows.filter((row) => row.landingSessions > 0);
  if (withSessions.length === 0) return [];

  const averageEngagement = withSessions.reduce((sum, row) => sum + row.engagementRate, 0) / withSessions.length;

  return withSessions
    .filter((row) => row.engagementRate > averageEngagement && row.bookingLinkCount === 0)
    .sort((a, b) => b.engagementRate - a.engagementRate);
}

/**
 * Real, rule-based CTA suggestions: articles at/above the median real
 * landing-session count that link to zero real booking/contact routes.
 * The suggestion text is qualitative ("add a CTA"), not a fabricated
 * currency or conversion-count claim — see NO_REVENUE_DATA_REASON for why
 * a revenue figure is intentionally not part of this.
 */
export function getCtaSuggestions(rows: ContentAttributionRow[]): CtaSuggestion[] {
  const withSessions = rows.filter((row) => row.landingSessions > 0).sort((a, b) => b.landingSessions - a.landingSessions);
  if (withSessions.length === 0) return [];

  const median = withSessions[Math.floor(withSessions.length / 2)].landingSessions;

  return withSessions
    .filter((row) => row.bookingLinkCount === 0 && row.landingSessions >= median)
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      landingSessions: row.landingSessions,
      reason: `بازدید فرود بالایی دارد (${row.landingSessions} نشست) اما هیچ لینک داخلی به صفحه نوبت‌دهی/تماس ندارد.`,
    }));
}
