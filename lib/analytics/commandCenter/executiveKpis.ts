import { KPI_TARGETS, type KpiTargetKey } from "./targets.config";

export type ExecutiveKpi = {
  key: KpiTargetKey;
  label: string;
  current: number | null;
  target: number | null;
  /** null when no target is configured or the current value is unknown — never a fabricated progress figure. */
  progressPercent: number | null;
  invertColor: boolean;
};

/** Executive KPIs with Target/Progress (Phase 5 item). `current` must already be a real value (or null); the target comes only from the user-editable targets.config.ts. */
export function buildExecutiveKpi(key: KpiTargetKey, label: string, current: number | null, invertColor = false): ExecutiveKpi {
  const target = KPI_TARGETS[key];
  const progressPercent = target !== null && target !== 0 && current !== null ? Math.round((current / target) * 1000) / 10 : null;
  return { key, label, current, target, progressPercent, invertColor };
}
