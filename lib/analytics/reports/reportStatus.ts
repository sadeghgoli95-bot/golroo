export type ReportStatus = "healthy" | "needs_attention" | "at_risk" | "insufficient_data";

export type ReportStatusInput = {
  /** True when there is at least one real data source to report on (real GSC/GA4 data for this period, or at least 2 real historical snapshots). */
  hasRealData: boolean;
  criticalIssueCount: number;
  biggestRiskPresent: boolean;
  needsUpdatingCount: number;
  regressionCount: number;
};

/**
 * Report Status (Phase 3 Part 4, item 9). A deterministic decision tree
 * over real counts/flags this module's caller already computed elsewhere
 * (growth.recommendations.criticalIssueTasks.length, growth.biggestRisk,
 * growth.needsUpdating.length, rankedChanges.regressions.length) — never
 * an arbitrary decorative label:
 *
 * 1. insufficient_data — there is no real signal to report on at all.
 * 2. at_risk — a real critical content issue or a real biggest-risk
 *    signal exists (the same signal command-center's alerts.ts already
 *    treats as "critical").
 * 3. needs_attention — no critical/risk signal, but a real stale article
 *    or a real week-over-week regression exists.
 * 4. healthy — none of the above.
 */
export function resolveReportStatus(input: ReportStatusInput): ReportStatus {
  if (!input.hasRealData) return "insufficient_data";
  if (input.criticalIssueCount > 0 || input.biggestRiskPresent) return "at_risk";
  if (input.needsUpdatingCount > 0 || input.regressionCount > 0) return "needs_attention";
  return "healthy";
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  healthy: "سالم",
  needs_attention: "نیازمند توجه",
  at_risk: "در معرض خطر",
  insufficient_data: "داده ناکافی",
};
