import { runReport } from "@/lib/google/ga4Client";
import type { IsoDateRange } from "../dateRange";
import { compareValues, type ComparisonResult } from "../comparison";
import type { ContentAttributionRow, ExitRateRow, CtaSuggestion, ConversionPageViews } from "./types";

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

/**
 * Lowest Converting High-Traffic Pages (Phase 3 Part 3). Broader than
 * getCtaSuggestions (which only catches the zero-booking-link subset):
 * this ranks every real high-traffic page (landingSessions at/above the
 * real median, same threshold rule as getCtaSuggestions) by its real
 * "conversion density" — estimatedScore ÷ landingSessions — ascending,
 * so a page that has some booking-intent links but still converts poorly
 * relative to its heavy traffic also surfaces here, not just pages with
 * zero links.
 */
export function getLowestConvertingHighTraffic(rows: ContentAttributionRow[]): ContentAttributionRow[] {
  const withSessions = rows.filter((row) => row.landingSessions > 0).sort((a, b) => b.landingSessions - a.landingSessions);
  if (withSessions.length === 0) return [];

  const median = withSessions[Math.floor(withSessions.length / 2)].landingSessions;

  return withSessions
    .filter((row) => row.landingSessions >= median)
    .sort((a, b) => a.estimatedScore / a.landingSessions - b.estimatedScore / b.landingSessions);
}

export type ConversionDropAlert = {
  metric: "appointment" | "contact" | "combined";
  label: string;
  comparison: ComparisonResult;
};

/**
 * A real drop of at least this percentage (period vs. period) in real
 * appointment/contact page views counts as "sudden" — the same 25%
 * magnitude the history timeline (lib/analytics/history/timeline.ts) and
 * the growth dashboard's sudden-CTR-drop signal (lib/analytics/growth/
 * pageSignals.ts) already use, so "sudden" means the same thing across
 * this dashboard.
 */
export const SUDDEN_CONVERSION_DROP_THRESHOLD_PERCENT = 25;

/**
 * Sudden drop in contact/appointment behaviour (Phase 3 Part 3, trend
 * signal). Flags any of the three real ConversionPageViews metrics whose
 * real period-over-period comparison fell by at least the documented
 * threshold — never a fabricated drop, and skipped entirely when there is
 * no real previous-period value to compare against.
 */
export function getSuddenConversionDrop(pageViews: ConversionPageViews): ConversionDropAlert[] {
  const candidates: { metric: ConversionDropAlert["metric"]; label: string }[] = [
    { metric: "appointment", label: "بازدید صفحه نوبت‌دهی" },
    { metric: "contact", label: "بازدید صفحه تماس" },
    { metric: "combined", label: "مجموع بازدید نوبت‌دهی + تماس" },
  ];

  const alerts: ConversionDropAlert[] = [];
  for (const candidate of candidates) {
    const metric = pageViews[candidate.metric];
    const comparison = compareValues(metric.current, metric.previousPeriod);
    if (comparison.percentChange !== null && comparison.percentChange <= -SUDDEN_CONVERSION_DROP_THRESHOLD_PERCENT) {
      alerts.push({ metric: candidate.metric, label: candidate.label, comparison });
    }
  }

  return alerts;
}
