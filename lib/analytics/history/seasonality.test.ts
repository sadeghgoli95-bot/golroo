import { describe, expect, it } from "vitest";
import { detectSeasonalPattern } from "./seasonality";
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

describe("detectSeasonalPattern", () => {
  it("reports insufficient when real history spans fewer than 2 distinct weeks", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z" }), // Monday
      buildSnapshot({ timestamp: "2026-07-08T00:00:00.000Z" }), // same week, Wednesday
    ];
    const pattern = detectSeasonalPattern(snapshots, "clicks");
    expect(pattern.sufficient).toBe(false);
    expect(pattern.weeksCovered).toBe(1);
  });

  it("declares sufficient once real history spans at least 2 distinct weeks and averages per weekday", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z", clicks: 10 }), // Monday, week 1
      buildSnapshot({ timestamp: "2026-07-13T00:00:00.000Z", clicks: 30 }), // Monday, week 2
    ];
    const pattern = detectSeasonalPattern(snapshots, "clicks");
    expect(pattern.sufficient).toBe(true);
    expect(pattern.weeksCovered).toBe(2);
    const monday = pattern.days.find((d) => d.dayIndex === 1)!; // getUTCDay(): Monday = 1
    expect(monday.average).toBe(20);
    expect(monday.sampleCount).toBe(2);
  });

  it("leaves a weekday's average null when no real snapshot lands on it", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-06T00:00:00.000Z" }),
      buildSnapshot({ timestamp: "2026-07-13T00:00:00.000Z" }),
    ];
    const pattern = detectSeasonalPattern(snapshots, "clicks");
    const sunday = pattern.days.find((d) => d.dayIndex === 0)!;
    expect(sunday.average).toBeNull();
    expect(sunday.sampleCount).toBe(0);
  });
});
