import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { compareValues, type ComparisonResult } from "../comparison";
import { averageMetric, snapshotsInRange } from "./aggregate";
import { getComparisonBounds, getCustomComparisonBounds, bucketLabel, type PeriodGranularity, type PeriodBounds } from "./periods";

export type PeriodMetricComparison = {
  key: MetricKey;
  label: string;
  higherIsBetter: boolean;
  /** null when there is no real data at all for the current period — never filled with a fabricated 0. */
  comparison: ComparisonResult | null;
  hasCurrentData: boolean;
  hasPreviousData: boolean;
};

export type PeriodComparisonResult = {
  currentLabel: string;
  previousLabel: string;
  currentRange: PeriodBounds;
  previousRange: PeriodBounds;
  currentSampleCount: number;
  previousSampleCount: number;
  metrics: PeriodMetricComparison[];
};

function buildComparison(
  currentSnapshots: AnalyticsSnapshot[],
  previousSnapshots: AnalyticsSnapshot[],
  currentLabel: string,
  previousLabel: string,
  currentRange: PeriodBounds,
  previousRange: PeriodBounds
): PeriodComparisonResult {
  const metrics: PeriodMetricComparison[] = METRICS.map((metric) => {
    const currentAvg = averageMetric(currentSnapshots, metric.key);
    const previousAvg = averageMetric(previousSnapshots, metric.key);

    return {
      key: metric.key,
      label: metric.label,
      higherIsBetter: metric.higherIsBetter,
      comparison: currentAvg === null ? null : compareValues(currentAvg, previousAvg),
      hasCurrentData: currentAvg !== null,
      hasPreviousData: previousAvg !== null,
    };
  });

  return {
    currentLabel,
    previousLabel,
    currentRange,
    previousRange,
    currentSampleCount: currentSnapshots.length,
    previousSampleCount: previousSnapshots.length,
    metrics,
  };
}

/** Item 3: Day vs Day / Week vs Week / Month vs Month / Quarter vs Quarter / Year vs Year — each metric is the average of its real values within the bucket, compared via the project's one `compareValues` formula. */
export function comparePeriod(
  snapshots: AnalyticsSnapshot[],
  granularity: PeriodGranularity,
  referenceDate: Date = new Date()
): PeriodComparisonResult {
  const { current, previous } = getComparisonBounds(granularity, referenceDate);
  const currentSnapshots = snapshotsInRange(snapshots, current.start, current.end);
  const previousSnapshots = snapshotsInRange(snapshots, previous.start, previous.end);

  return buildComparison(
    currentSnapshots,
    previousSnapshots,
    bucketLabel(granularity, current.start),
    bucketLabel(granularity, previous.start),
    current,
    previous
  );
}

/** Item 3: Custom Range picker — compares a user-picked [start, end) against the immediately preceding range of equal length. */
export function compareCustomRange(snapshots: AnalyticsSnapshot[], currentRange: PeriodBounds, previousRangeOverride?: PeriodBounds): PeriodComparisonResult {
  const { current, previous } = previousRangeOverride
    ? { current: currentRange, previous: previousRangeOverride }
    : getCustomComparisonBounds(currentRange.start, currentRange.end);

  const currentSnapshots = snapshotsInRange(snapshots, current.start, current.end);
  const previousSnapshots = snapshotsInRange(snapshots, previous.start, previous.end);
  const format = (date: Date) => date.toISOString().slice(0, 10);

  return buildComparison(
    currentSnapshots,
    previousSnapshots,
    `${format(current.start)} تا ${format(current.end)}`,
    `${format(previous.start)} تا ${format(previous.end)}`,
    current,
    previous
  );
}
