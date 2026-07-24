import type { AnalyticsSnapshot } from "../snapshot/types";
import type { MetricKey } from "./metrics";

/** Average of real numbers only — never coerces an empty/all-null set to 0; returns null instead (see project rule against fabricated zeros). */
export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** [start, end) — end is exclusive, matching how buildRollups/getComparisonBounds define bucket boundaries. */
export function snapshotsInRange(snapshots: AnalyticsSnapshot[], start: Date, end: Date): AnalyticsSnapshot[] {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return snapshots.filter((snapshot) => {
    const t = new Date(snapshot.timestamp).getTime();
    return t >= startMs && t < endMs;
  });
}

export function averageMetric(snapshots: AnalyticsSnapshot[], key: MetricKey): number | null {
  const values = snapshots
    .map((snapshot) => snapshot[key])
    .filter((value): value is number => value !== null && value !== undefined);
  return average(values);
}

export function sortChronological(snapshots: AnalyticsSnapshot[]): AnalyticsSnapshot[] {
  return [...snapshots].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
