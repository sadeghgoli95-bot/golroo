import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { average } from "./aggregate";
import { getBucketStart, addPeriods, bucketLabel, type PeriodGranularity } from "./periods";

export type RollupGranularity = Exclude<PeriodGranularity, "quarter">;

export type RollupBucket = {
  key: string;
  label: string;
  start: string;
  end: string;
  /** How many real snapshot rows fed this bucket — surfaced so the UI can show "based on N days" rather than implying a full period of data. */
  sampleCount: number;
  metrics: Record<MetricKey, number | null>;
};

/**
 * Item 1: Daily/Weekly/Monthly/Yearly History. There is no separate
 * storage for rollups — every bucket is derived live from the real daily
 * AnalyticsSnapshot rows, grouped by bucket and averaged per metric.
 * A metric with zero real (non-null) values in a bucket stays `null`,
 * never a fabricated 0 (see project's absolute rule against fabricated
 * data). "day" granularity is effectively a passthrough with one row per
 * real snapshot day.
 */
export function buildRollups(snapshots: AnalyticsSnapshot[], granularity: RollupGranularity): RollupBucket[] {
  const buckets = new Map<string, AnalyticsSnapshot[]>();

  for (const snapshot of snapshots) {
    const start = getBucketStart(granularity, new Date(snapshot.timestamp));
    const key = start.toISOString();
    const list = buckets.get(key) ?? [];
    list.push(snapshot);
    buckets.set(key, list);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, bucketSnapshots]) => {
      const start = new Date(key);
      const end = addPeriods(granularity, start, 1);

      const metrics = Object.fromEntries(
        METRICS.map((metric) => [
          metric.key,
          average(
            bucketSnapshots
              .map((snapshot) => snapshot[metric.key])
              .filter((value): value is number => value !== null && value !== undefined)
          ),
        ])
      ) as Record<MetricKey, number | null>;

      return {
        key,
        label: bucketLabel(granularity, start),
        start: start.toISOString(),
        end: end.toISOString(),
        sampleCount: bucketSnapshots.length,
        metrics,
      };
    });
}
