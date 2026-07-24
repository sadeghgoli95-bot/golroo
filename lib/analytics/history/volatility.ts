import type { AnalyticsSnapshot } from "../snapshot/types";

export type VolatilityResult = {
  sampleCount: number;
  mean: number | null;
  stddev: number | null;
  sufficient: boolean;
};

/**
 * Sample standard deviation needs at least 2 points to be defined at
 * all (n - 1 in the denominator). This is a mathematical floor, not a
 * claim that 2 points is a meaningful read — callers should treat
 * `sufficient` as "computable", and prefer widening the window (7d ->
 * 30d -> 90d -> all) when sampleCount is only barely above this floor.
 */
const MIN_SAMPLES_FOR_VOLATILITY = 2;

/**
 * Item 9: sample standard deviation of the real `position` field across
 * the snapshots passed in. Callers filter by window first (e.g. via
 * filterSnapshotsByRange for 7d/30d/90d/all) and pass that slice in —
 * this function itself does no date filtering.
 */
export function computePositionVolatility(snapshots: AnalyticsSnapshot[]): VolatilityResult {
  const values = snapshots.map((snapshot) => snapshot.position).filter((value): value is number => value !== null && value !== undefined);

  if (values.length < MIN_SAMPLES_FOR_VOLATILITY) {
    return { sampleCount: values.length, mean: null, stddev: null, sufficient: false };
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);

  return { sampleCount: values.length, mean, stddev: Math.sqrt(variance), sufficient: true };
}
