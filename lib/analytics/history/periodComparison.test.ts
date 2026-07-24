import { describe, expect, it } from "vitest";
import { comparePeriod, compareCustomRange } from "./periodComparison";
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

describe("comparePeriod", () => {
  it("compares the current day's average against the previous day's average for a real metric", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-22T12:00:00.000Z", seoScore: 60 }),
      buildSnapshot({ timestamp: "2026-07-23T12:00:00.000Z", seoScore: 80 }),
    ];
    const result = comparePeriod(snapshots, "day", new Date("2026-07-23T18:00:00.000Z"));
    const seoScore = result.metrics.find((m) => m.key === "seoScore")!;
    expect(seoScore.hasCurrentData).toBe(true);
    expect(seoScore.hasPreviousData).toBe(true);
    expect(seoScore.comparison?.current).toBe(80);
    expect(seoScore.comparison?.previous).toBe(60);
    expect(seoScore.comparison?.trend).toBe("up");
  });

  it("reports hasCurrentData=false and a null comparison when there is no real data in the current period", () => {
    const snapshots = [buildSnapshot({ timestamp: "2026-06-01T00:00:00.000Z" })];
    const result = comparePeriod(snapshots, "day", new Date("2026-07-23T00:00:00.000Z"));
    const seoScore = result.metrics.find((m) => m.key === "seoScore")!;
    expect(seoScore.hasCurrentData).toBe(false);
    expect(seoScore.comparison).toBeNull();
  });
});

describe("compareCustomRange", () => {
  it("compares a picked range against the equal-length range immediately before it", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", clicks: 5 }), // previous range
      buildSnapshot({ timestamp: "2026-07-12T00:00:00.000Z", clicks: 15 }), // current range
    ];
    const currentRange = { start: new Date("2026-07-10T00:00:00.000Z"), end: new Date("2026-07-15T00:00:00.000Z") };
    const result = compareCustomRange(snapshots, currentRange);
    const clicks = result.metrics.find((m) => m.key === "clicks")!;
    expect(clicks.comparison?.current).toBe(15);
    expect(clicks.comparison?.previous).toBe(5);
  });
});
