import type { AnalyticsAdapter, DateRange } from "./types";

/**
 * The default adapter for every metrics category until a real provider
 * (GA4, GSC, ...) is connected. Always resolves to the given neutral
 * value regardless of date range — never throws, never fetches.
 */
export function createLocalAdapter<TMetrics>(emptyMetrics: TMetrics): AnalyticsAdapter<TMetrics> {
  return {
    providerId: "local",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- range is part of the AnalyticsAdapter contract; the local adapter ignores it
    getMetrics: async (_range: DateRange) => emptyMetrics,
  };
}
