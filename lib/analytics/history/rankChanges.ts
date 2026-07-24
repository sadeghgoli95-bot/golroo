import type { AnalyticsSnapshot } from "../snapshot/types";
import { METRICS, type MetricKey } from "./metrics";
import { compareValues, type ComparisonResult } from "../comparison";
import { buildRollups, type RollupGranularity } from "./rollups";

export type RankedChange = {
  key: MetricKey;
  label: string;
  higherIsBetter: boolean;
  comparison: ComparisonResult;
  direction: "improvement" | "regression";
  fromLabel: string;
  toLabel: string;
};

/**
 * Item 4: ranks the real change of every metric between the two most
 * recent *complete* rollup buckets of the chosen granularity (default
 * "week"). A metric missing real data in either bucket is skipped
 * entirely rather than compared against a fabricated value — so with the
 * tiny amount of real history this project has today, this will often
 * return empty arrays, which is the honest result.
 */
export function findBiggestChanges(
  snapshots: AnalyticsSnapshot[],
  granularity: RollupGranularity = "week"
): { improvements: RankedChange[]; regressions: RankedChange[] } {
  const buckets = buildRollups(snapshots, granularity);
  if (buckets.length < 2) return { improvements: [], regressions: [] };

  const previous = buckets[buckets.length - 2];
  const current = buckets[buckets.length - 1];

  const changes: RankedChange[] = [];
  for (const metric of METRICS) {
    const currentValue = current.metrics[metric.key];
    const previousValue = previous.metrics[metric.key];
    if (currentValue === null || previousValue === null) continue;

    const comparison = compareValues(currentValue, previousValue);
    if (comparison.trend === "flat") continue;

    const isImprovement = metric.higherIsBetter ? comparison.trend === "up" : comparison.trend === "down";
    changes.push({
      key: metric.key,
      label: metric.label,
      higherIsBetter: metric.higherIsBetter,
      comparison,
      direction: isImprovement ? "improvement" : "regression",
      fromLabel: previous.label,
      toLabel: current.label,
    });
  }

  const magnitude = (change: RankedChange) => Math.abs(change.comparison.percentChange ?? change.comparison.difference ?? 0);
  const improvements = changes.filter((c) => c.direction === "improvement").sort((a, b) => magnitude(b) - magnitude(a));
  const regressions = changes.filter((c) => c.direction === "regression").sort((a, b) => magnitude(b) - magnitude(a));

  return { improvements, regressions };
}
