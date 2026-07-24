import { describe, expect, it } from "vitest";
import { buildRollups } from "./rollups";
import type { AnalyticsSnapshot } from "../snapshot/types";

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

describe("buildRollups", () => {
  it("groups snapshots into daily buckets one-to-one when granularity is 'day'", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-01T08:00:00.000Z", seoScore: 60 }),
      buildSnapshot({ timestamp: "2026-07-02T08:00:00.000Z", seoScore: 80 }),
    ];
    const buckets = buildRollups(snapshots, "day");
    expect(buckets).toHaveLength(2);
    expect(buckets[0].metrics.seoScore).toBe(60);
    expect(buckets[1].metrics.seoScore).toBe(80);
  });

  it("averages real values of snapshots that fall in the same week bucket", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", seoScore: 60 }), // Monday
      buildSnapshot({ timestamp: "2026-07-08T00:00:00.000Z", seoScore: 80 }), // same ISO week
    ];
    const buckets = buildRollups(snapshots, "week");
    expect(buckets).toHaveLength(1);
    expect(buckets[0].metrics.seoScore).toBe(70);
    expect(buckets[0].sampleCount).toBe(2);
  });

  it("leaves a metric null in a bucket when no snapshot in it has a real value", () => {
    const snapshots = [buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", clicks: null })];
    const buckets = buildRollups(snapshots, "day");
    expect(buckets[0].metrics.clicks).toBeNull();
  });

  it("sorts buckets chronologically ascending regardless of input order", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-08-01T00:00:00.000Z" }),
      buildSnapshot({ timestamp: "2026-06-01T00:00:00.000Z" }),
    ];
    const buckets = buildRollups(snapshots, "month");
    expect(buckets[0].label < buckets[1].label).toBe(true);
  });
});
