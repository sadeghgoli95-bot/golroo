export type PeriodGranularity = "day" | "week" | "month" | "quarter" | "year";

export type PeriodBounds = { start: Date; end: Date };

/**
 * All bucketing is done in UTC on purpose: AnalyticsSnapshot.timestamp is
 * written as `new Date().toISOString()` (captureSnapshot.ts) — a fixed UTC
 * instant — so bucketing in UTC is the only way "day"/"week"/... boundaries
 * are stable regardless of what timezone this code later runs in (local
 * dev vs. Vercel's server clock).
 */
function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Start of the bucket (inclusive) that `date` falls into for the given granularity. */
export function getBucketStart(granularity: PeriodGranularity, date: Date): Date {
  const day = startOfUtcDay(date);
  switch (granularity) {
    case "day":
      return day;
    case "week": {
      const isoDayOfWeek = (day.getUTCDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
      const monday = new Date(day);
      monday.setUTCDate(monday.getUTCDate() - isoDayOfWeek);
      return monday;
    }
    case "month":
      return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1));
    case "quarter": {
      const quarterStartMonth = Math.floor(day.getUTCMonth() / 3) * 3;
      return new Date(Date.UTC(day.getUTCFullYear(), quarterStartMonth, 1));
    }
    case "year":
      return new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  }
}

/** `date` shifted by `count` whole periods of `granularity` (negative moves backward). */
export function addPeriods(granularity: PeriodGranularity, date: Date, count: number): Date {
  const next = new Date(date);
  switch (granularity) {
    case "day":
      next.setUTCDate(next.getUTCDate() + count);
      return next;
    case "week":
      next.setUTCDate(next.getUTCDate() + count * 7);
      return next;
    case "month":
      next.setUTCMonth(next.getUTCMonth() + count);
      return next;
    case "quarter":
      next.setUTCMonth(next.getUTCMonth() + count * 3);
      return next;
    case "year":
      next.setUTCFullYear(next.getUTCFullYear() + count);
      return next;
  }
}

/** A human label for the bucket starting at `start`. */
export function bucketLabel(granularity: PeriodGranularity, start: Date): string {
  const iso = start.toISOString().slice(0, 10);
  switch (granularity) {
    case "day":
      return iso;
    case "week":
      return `هفته ${iso}`;
    case "month":
      return start.toISOString().slice(0, 7);
    case "quarter": {
      const quarter = Math.floor(start.getUTCMonth() / 3) + 1;
      return `فصل ${quarter} ${start.getUTCFullYear()}`;
    }
    case "year":
      return String(start.getUTCFullYear());
  }
}

/**
 * Item 3 (Day vs Day / Week vs Week / ... / Year vs Year): the bucket
 * containing `referenceDate` and the immediately preceding bucket of equal
 * length. Used by periodComparison.ts's `comparePeriod`.
 */
export function getComparisonBounds(
  granularity: PeriodGranularity,
  referenceDate: Date
): { current: PeriodBounds; previous: PeriodBounds } {
  const currentStart = getBucketStart(granularity, referenceDate);
  const currentEnd = addPeriods(granularity, currentStart, 1);
  const previousStart = addPeriods(granularity, currentStart, -1);
  return { current: { start: currentStart, end: currentEnd }, previous: { start: previousStart, end: currentStart } };
}

/**
 * Item 3 (Custom Range picker): given an arbitrary user-picked [start, end),
 * returns that range as "current" and the immediately preceding range of
 * the same duration as "previous" — the same "equal-length prior period"
 * rule the named granularities use, just without a fixed bucket size.
 */
export function getCustomComparisonBounds(start: Date, end: Date): { current: PeriodBounds; previous: PeriodBounds } {
  const durationMs = end.getTime() - start.getTime();
  const previousStart = new Date(start.getTime() - durationMs);
  return { current: { start, end }, previous: { start: previousStart, end: start } };
}
