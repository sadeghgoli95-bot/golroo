import { compareValues, type ComparisonResult } from "../comparison";
import { KPI_TARGETS, type KpiTargetKey } from "./targets.config";

export type ExecutiveKpi = {
  key: KpiTargetKey;
  label: string;
  current: number | null;
  /** Real previous-period comparison when one exists (adapter-level MetricValue or a real history rollup); null when no real previous value is available — never fabricated. */
  comparison: ComparisonResult | null;
  target: number | null;
  /** null when no target is configured or the current value is unknown — never a fabricated progress figure. */
  progressPercent: number | null;
  invertColor: boolean;
};

/**
 * Executive KPIs with Target/Progress and (when a real previous value is
 * available) Previous/Difference/%Change/Trend (Phase 5 item, extended for
 * Phase 3 Part 1). `current` and `previous` must already be real values (or
 * null); the target comes only from the user-editable targets.config.ts.
 */
export function buildExecutiveKpi(
  key: KpiTargetKey,
  label: string,
  current: number | null,
  previous: number | null = null,
  invertColor = false
): ExecutiveKpi {
  const target = KPI_TARGETS[key];
  const progressPercent = target !== null && target !== 0 && current !== null ? Math.round((current / target) * 1000) / 10 : null;
  const comparison = current !== null ? compareValues(current, previous) : null;
  return { key, label, current, comparison, target, progressPercent, invertColor };
}
