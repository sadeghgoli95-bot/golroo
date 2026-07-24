/**
 * Executive KPI targets. None of this project's real data sources (GA4,
 * GSC, Sanity, the snapshot engine) know a "target" — a target is a
 * business decision only the site owner can make. Every value below
 * defaults to `null` (no target configured) so the Command Center shows an
 * honest "بدون هدف تنظیم‌شده" instead of inventing one. Edit the numbers
 * below to set real targets; they immediately drive real progress-percent
 * math against the real current values computed elsewhere in this
 * dashboard — this file is the single, deliberate exception to "no
 * hardcoded numbers," because a target is not a metric, it's an input.
 */
export type KpiTargetKey =
  | "siteHealthScore"
  | "avgSeoScore"
  | "clicks30d"
  | "impressions30d"
  | "averagePosition30d"
  | "users30d"
  | "engagementRate30d"
  | "conversionProxyRate30d";

export const KPI_TARGETS: Record<KpiTargetKey, number | null> = {
  siteHealthScore: null,
  avgSeoScore: null,
  clicks30d: null,
  impressions30d: null,
  averagePosition30d: null,
  users30d: null,
  engagementRate30d: null,
  conversionProxyRate30d: null,
};
