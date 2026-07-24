import type { MetricValue } from "./types";

export type Trend = "up" | "down" | "flat";

export type ComparisonResult = {
  current: number;
  previous: number | null;
  difference: number | null;
  percentChange: number | null;
  trend: Trend;
};

/**
 * The single comparison formula every KPI card in the dashboard uses
 * (Phase 1 Part 5) — never computed ad hoc per page. `percentChange` is
 * `null` rather than `Infinity`/a fabricated number when the previous
 * value was 0 and the current value isn't — an undefined percentage is
 * more honest than a meaningless one.
 */
export function compareValues(current: number, previous: number | null): ComparisonResult {
  if (previous === null) {
    return { current, previous: null, difference: null, percentChange: null, trend: "flat" };
  }

  const difference = current - previous;
  const percentChange = previous === 0 ? (current === 0 ? 0 : null) : (difference / previous) * 100;
  const trend: Trend = difference > 0 ? "up" : difference < 0 ? "down" : "flat";

  return { current, previous, difference, percentChange, trend };
}

/** MetricValue (lib/analytics/types.ts) is the storage shape; this derives the presentation-layer comparison from it. */
export function compareMetricValue(metric: MetricValue): ComparisonResult {
  return compareValues(metric.current, metric.previousPeriod);
}

export function buildMetricValue(
  current: number,
  previousPeriod: number | null,
  previousYear: number | null = null
): MetricValue {
  return { current, previousPeriod, previousYear };
}
