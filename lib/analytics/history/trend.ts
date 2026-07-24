import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { sortChronological } from "./aggregate";

export type TrendDirection = "up" | "down" | "flat" | "insufficient-data";

export type MetricTrend = {
  key: MetricKey;
  label: string;
  higherIsBetter: boolean;
  direction: TrendDirection;
  slope: number | null;
  sampleCount: number;
};

/**
 * A slope computed from 2 points is just "the difference between two
 * numbers" restated as a rate — it says nothing about whether a
 * direction is real. 3 is the minimum needed for a line to be a fit
 * rather than a connect-the-dots between the only two points available.
 */
const MIN_POINTS_FOR_TREND = 3;

function linearSlope(points: { x: number; y: number }[]): number {
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Item 5: ordinary-least-squares slope of a metric's real values against
 * their chronological order (x = index among real points, y = value).
 * Degrades to "insufficient-data" below MIN_POINTS_FOR_TREND rather than
 * reporting a direction from too little real history.
 */
export function detectTrend(snapshots: AnalyticsSnapshot[], metricKey: MetricKey): MetricTrend {
  const definition = METRICS.find((metric) => metric.key === metricKey);
  if (!definition) throw new Error(`Unknown metric: ${metricKey}`);

  const sorted = sortChronological(snapshots);
  const points = sorted
    .map((snapshot, index) => ({ x: index, y: snapshot[metricKey] }))
    .filter((point): point is { x: number; y: number } => point.y !== null && point.y !== undefined);

  if (points.length < MIN_POINTS_FOR_TREND) {
    return {
      key: metricKey,
      label: definition.label,
      higherIsBetter: definition.higherIsBetter,
      direction: "insufficient-data",
      slope: null,
      sampleCount: points.length,
    };
  }

  const slope = linearSlope(points);
  const scale = Math.max(...points.map((point) => Math.abs(point.y)), 1);
  const epsilon = scale * 0.005; // ignore slope noise below 0.5% of the metric's typical magnitude

  const direction: TrendDirection = Math.abs(slope) < epsilon ? "flat" : slope > 0 ? "up" : "down";

  return { key: metricKey, label: definition.label, higherIsBetter: definition.higherIsBetter, direction, slope, sampleCount: points.length };
}

export function detectAllTrends(snapshots: AnalyticsSnapshot[]): MetricTrend[] {
  return METRICS.map((metric) => detectTrend(snapshots, metric.key));
}
