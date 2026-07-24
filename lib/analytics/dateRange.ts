import type { DateRange, DateRangePreset } from "./types";

export type IsoDateRange = {
  start: string;
  end: string;
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

/**
 * Both Search Console and GA4 report data with a 1-2 day processing
 * delay — "today" in either API is unreliable/incomplete, so every
 * range's end date is yesterday, not today. This is the single place
 * that decision is made; no caller computes its own date math.
 */
const REPORTING_LAG_DAYS = 1;

/**
 * Resolves a DateRangePreset (lib/analytics/types.ts — the type this
 * project already defined for exactly this purpose) to real ISO date
 * bounds. "today"/"yesterday" resolve to a single-day range.
 */
export function getDateRangeBounds(preset: Exclude<DateRangePreset, "custom">): IsoDateRange {
  switch (preset) {
    case "today":
      return { start: toIsoDate(daysAgo(REPORTING_LAG_DAYS)), end: toIsoDate(daysAgo(REPORTING_LAG_DAYS)) };
    case "yesterday":
      return {
        start: toIsoDate(daysAgo(REPORTING_LAG_DAYS + 1)),
        end: toIsoDate(daysAgo(REPORTING_LAG_DAYS + 1)),
      };
    case "last7Days":
      return { start: toIsoDate(daysAgo(REPORTING_LAG_DAYS + 6)), end: toIsoDate(daysAgo(REPORTING_LAG_DAYS)) };
    case "last30Days":
      return { start: toIsoDate(daysAgo(REPORTING_LAG_DAYS + 29)), end: toIsoDate(daysAgo(REPORTING_LAG_DAYS)) };
    case "last90Days":
      return { start: toIsoDate(daysAgo(REPORTING_LAG_DAYS + 89)), end: toIsoDate(daysAgo(REPORTING_LAG_DAYS)) };
    case "thisYear": {
      const now = new Date();
      const jan1 = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      return { start: toIsoDate(jan1), end: toIsoDate(daysAgo(REPORTING_LAG_DAYS)) };
    }
  }
}

/** Bridges the generic DateRange (lib/analytics/types.ts — what every AnalyticsAdapter receives) to real ISO bounds. */
export function resolveDateRange(range: DateRange): IsoDateRange {
  if (range.preset === "custom") {
    if (!range.start || !range.end) {
      throw new Error("DateRange with preset 'custom' must provide both start and end");
    }
    return { start: range.start, end: range.end };
  }
  return getDateRangeBounds(range.preset);
}

/** The immediately-preceding period of equal length — the comparison baseline for every "vs previous" KPI. */
export function getPreviousPeriod(range: IsoDateRange): IsoDateRange {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const lengthDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;

  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - (lengthDays - 1));

  return { start: toIsoDate(previousStart), end: toIsoDate(previousEnd) };
}
