import { describe, expect, it } from "vitest";
import { computePositionVolatility } from "./volatility";
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

describe("computePositionVolatility", () => {
  it("reports insufficient with fewer than 2 real position values", () => {
    const result = computePositionVolatility([buildSnapshot({ position: 10 })]);
    expect(result.sufficient).toBe(false);
    expect(result.stddev).toBeNull();
  });

  it("computes mean and sample stddev for a real set of position values", () => {
    const snapshots = [10, 10, 10, 10].map((position) => buildSnapshot({ position }));
    const result = computePositionVolatility(snapshots);
    expect(result.sufficient).toBe(true);
    expect(result.mean).toBe(10);
    expect(result.stddev).toBe(0);
  });

  it("ignores null position values rather than treating them as 0", () => {
    const snapshots = [buildSnapshot({ position: 10 }), buildSnapshot({ position: null }), buildSnapshot({ position: 20 })];
    const result = computePositionVolatility(snapshots);
    expect(result.sampleCount).toBe(2);
    expect(result.mean).toBe(15);
  });
});
