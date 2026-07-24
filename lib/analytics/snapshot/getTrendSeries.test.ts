import { describe, expect, it } from "vitest";
import { filterSnapshotsByRange, buildTrendSeries } from "./getTrendSeries";
import type { AnalyticsSnapshot } from "./types";

function buildSnapshot(overrides: Partial<AnalyticsSnapshot> = {}): AnalyticsSnapshot {
  return {
    timestamp: "2026-07-01T00:00:00.000Z",
    seoScore: 70,
    healthScore: 70,
    aeoScore: 70,
    geoScore: 70,
    clicks: 10,
    impressions: 100,
    ctr: 0.1,
    position: 15,
    users: 5,
    sessions: 8,
    engagementRate: 0.5,
    publishedArticles: 10,
    draftArticles: 2,
    criticalIssues: 1,
    warnings: 3,
    ...overrides,
  };
}

describe("filterSnapshotsByRange", () => {
  const now = new Date("2026-07-23T00:00:00.000Z");

  it("keeps only snapshots within the last N days", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-20T00:00:00.000Z" }), // 3 days ago
      buildSnapshot({ timestamp: "2026-06-01T00:00:00.000Z" }), // outside 7d
    ];
    const filtered = filterSnapshotsByRange(snapshots, "7d", now);
    expect(filtered).toHaveLength(1);
  });

  it("returns every snapshot for 'all'", () => {
    const snapshots = [buildSnapshot({ timestamp: "2020-01-01T00:00:00.000Z" })];
    expect(filterSnapshotsByRange(snapshots, "all", now)).toHaveLength(1);
  });
});

describe("buildTrendSeries", () => {
  it("maps each metric field to a ChartPoint using the date portion of the timestamp as the label", () => {
    const snapshots = [buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", seoScore: 80 })];
    const series = buildTrendSeries(snapshots);
    expect(series.seoScore).toEqual([{ label: "2026-07-01", value: 80 }]);
  });

  it("excludes null values from a metric's series instead of coercing them to 0", () => {
    const snapshots = [buildSnapshot({ clicks: null })];
    const series = buildTrendSeries(snapshots);
    expect(series.clicks).toEqual([]);
  });
});
