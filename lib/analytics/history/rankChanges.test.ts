import { describe, expect, it } from "vitest";
import { findBiggestChanges } from "./rankChanges";
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

describe("findBiggestChanges", () => {
  it("returns empty improvements/regressions when there are fewer than two rollup buckets", () => {
    const snapshots = [buildSnapshot()];
    const result = findBiggestChanges(snapshots, "week");
    expect(result.improvements).toEqual([]);
    expect(result.regressions).toEqual([]);
  });

  it("classifies a metric increase as an improvement for a higher-is-better metric", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-06-29T00:00:00.000Z", clicks: 10 }), // previous week
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", clicks: 40 }), // current week
    ];
    const result = findBiggestChanges(snapshots, "week");
    expect(result.improvements.some((c) => c.key === "clicks")).toBe(true);
    expect(result.regressions.some((c) => c.key === "clicks")).toBe(false);
  });

  it("classifies a position increase (worse ranking) as a regression since lower position is better", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-06-29T00:00:00.000Z", position: 5 }),
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", position: 20 }),
    ];
    const result = findBiggestChanges(snapshots, "week");
    expect(result.regressions.some((c) => c.key === "position")).toBe(true);
  });

  it("skips a metric that is missing real data in either bucket instead of fabricating a comparison", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-06-29T00:00:00.000Z", clicks: null }),
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", clicks: 40 }),
    ];
    const result = findBiggestChanges(snapshots, "week");
    expect([...result.improvements, ...result.regressions].some((c) => c.key === "clicks")).toBe(false);
  });

  it("ranks improvements by magnitude of percent change, largest first", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-06-29T00:00:00.000Z", clicks: 10, users: 10 }),
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", clicks: 12, users: 40 }), // clicks +20%, users +300%
    ];
    const result = findBiggestChanges(snapshots, "week");
    expect(result.improvements[0].key).toBe("users");
  });
});
