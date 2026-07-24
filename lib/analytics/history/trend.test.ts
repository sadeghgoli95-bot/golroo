import { describe, expect, it } from "vitest";
import { detectTrend } from "./trend";
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

describe("detectTrend", () => {
  it("reports insufficient-data with fewer than 3 real points", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", seoScore: 50 }),
      buildSnapshot({ timestamp: "2026-07-02T00:00:00.000Z", seoScore: 60 }),
    ];
    const trend = detectTrend(snapshots, "seoScore");
    expect(trend.direction).toBe("insufficient-data");
    expect(trend.slope).toBeNull();
  });

  it("detects an upward trend from a consistently increasing real series", () => {
    const snapshots = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04"].map((day, index) =>
      buildSnapshot({ timestamp: `${day}T00:00:00.000Z`, seoScore: 50 + index * 10 })
    );
    const trend = detectTrend(snapshots, "seoScore");
    expect(trend.direction).toBe("up");
    expect(trend.slope).toBeGreaterThan(0);
  });

  it("detects a downward trend from a consistently decreasing real series", () => {
    const snapshots = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04"].map((day, index) =>
      buildSnapshot({ timestamp: `${day}T00:00:00.000Z`, clicks: 100 - index * 10 })
    );
    const trend = detectTrend(snapshots, "clicks");
    expect(trend.direction).toBe("down");
  });

  it("skips null values instead of treating them as 0 when fitting the trend line", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", clicks: 50 }),
      buildSnapshot({ timestamp: "2026-07-02T00:00:00.000Z", clicks: null }),
      buildSnapshot({ timestamp: "2026-07-03T00:00:00.000Z", clicks: 60 }),
      buildSnapshot({ timestamp: "2026-07-04T00:00:00.000Z", clicks: 70 }),
    ];
    const trend = detectTrend(snapshots, "clicks");
    expect(trend.sampleCount).toBe(3);
    expect(trend.direction).toBe("up");
  });

  it("reports flat when values barely change", () => {
    const snapshots = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04"].map((day) =>
      buildSnapshot({ timestamp: `${day}T00:00:00.000Z`, seoScore: 70 })
    );
    const trend = detectTrend(snapshots, "seoScore");
    expect(trend.direction).toBe("flat");
  });
});
