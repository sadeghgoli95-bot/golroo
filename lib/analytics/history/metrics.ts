import type { AnalyticsSnapshot } from "../snapshot/types";

/** Every field of AnalyticsSnapshot except the timestamp — the one list every history/intelligence module iterates over. */
export type MetricKey = Exclude<keyof AnalyticsSnapshot, "timestamp">;

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  /** False for metrics where a *lower* value is the improvement (average search position, issue/warning counts) — every detector below reads this instead of assuming "up is good". */
  higherIsBetter: boolean;
};

/** Single source of truth for "which snapshot fields exist and which direction is good" — every Phase 6 detector (trend, decay, recovery, ranking) reads this instead of re-declaring the field list. */
export const METRICS: MetricDefinition[] = [
  { key: "seoScore", label: "امتیاز سئو", higherIsBetter: true },
  { key: "healthScore", label: "امتیاز سلامت", higherIsBetter: true },
  { key: "aeoScore", label: "امتیاز AEO", higherIsBetter: true },
  { key: "geoScore", label: "امتیاز GEO", higherIsBetter: true },
  { key: "clicks", label: "کلیک‌ها", higherIsBetter: true },
  { key: "impressions", label: "نمایش‌ها", higherIsBetter: true },
  { key: "ctr", label: "CTR", higherIsBetter: true },
  { key: "position", label: "میانگین جایگاه", higherIsBetter: false },
  { key: "users", label: "کاربران", higherIsBetter: true },
  { key: "sessions", label: "نشست‌ها", higherIsBetter: true },
  { key: "engagementRate", label: "نرخ تعامل", higherIsBetter: true },
  { key: "publishedArticles", label: "مقالات منتشرشده", higherIsBetter: true },
  { key: "draftArticles", label: "پیش‌نویس‌ها", higherIsBetter: true },
  { key: "criticalIssues", label: "مشکلات بحرانی", higherIsBetter: false },
  { key: "warnings", label: "هشدارها", higherIsBetter: false },
];

export function metricLabel(key: MetricKey): string {
  return METRICS.find((metric) => metric.key === key)?.label ?? key;
}
