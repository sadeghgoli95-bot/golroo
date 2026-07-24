import type { AnalyticsSnapshot } from "./types";
import type { ChartPoint } from "../charts/types";

export type TrendRangeOption = "7d" | "30d" | "90d" | "all";

const RANGE_DAYS: Record<Exclude<TrendRangeOption, "all">, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** Part 4's 7/30/90/All Time toggle — filters an already-fetched snapshot list, no re-query. */
export function filterSnapshotsByRange(
  snapshots: AnalyticsSnapshot[],
  range: TrendRangeOption,
  now: Date = new Date()
): AnalyticsSnapshot[] {
  if (range === "all") return snapshots;

  const days = RANGE_DAYS[range];
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);

  return snapshots.filter((snapshot) => new Date(snapshot.timestamp) >= cutoff);
}

function toPoints(snapshots: AnalyticsSnapshot[], field: keyof AnalyticsSnapshot): ChartPoint[] {
  return snapshots
    .filter((snapshot) => snapshot[field] !== null && snapshot[field] !== undefined)
    .map((snapshot) => ({ label: snapshot.timestamp.slice(0, 10), value: Number(snapshot[field]) }));
}

export type TrendSeriesSet = {
  seoScore: ChartPoint[];
  healthScore: ChartPoint[];
  aeoScore: ChartPoint[];
  geoScore: ChartPoint[];
  clicks: ChartPoint[];
  impressions: ChartPoint[];
  ctr: ChartPoint[];
  position: ChartPoint[];
  users: ChartPoint[];
  sessions: ChartPoint[];
  publishedArticles: ChartPoint[];
  draftArticles: ChartPoint[];
  criticalIssues: ChartPoint[];
  warnings: ChartPoint[];
};

/** One ChartPoint[] per historical metric (lib/analytics/charts/types.ts — the type this project already defined for charts). */
export function buildTrendSeries(snapshots: AnalyticsSnapshot[]): TrendSeriesSet {
  return {
    seoScore: toPoints(snapshots, "seoScore"),
    healthScore: toPoints(snapshots, "healthScore"),
    aeoScore: toPoints(snapshots, "aeoScore"),
    geoScore: toPoints(snapshots, "geoScore"),
    clicks: toPoints(snapshots, "clicks"),
    impressions: toPoints(snapshots, "impressions"),
    ctr: toPoints(snapshots, "ctr"),
    position: toPoints(snapshots, "position"),
    users: toPoints(snapshots, "users"),
    sessions: toPoints(snapshots, "sessions"),
    publishedArticles: toPoints(snapshots, "publishedArticles"),
    draftArticles: toPoints(snapshots, "draftArticles"),
    criticalIssues: toPoints(snapshots, "criticalIssues"),
    warnings: toPoints(snapshots, "warnings"),
  };
}
