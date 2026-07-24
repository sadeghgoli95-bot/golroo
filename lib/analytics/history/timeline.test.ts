import { describe, expect, it } from "vitest";
import { buildTimeline } from "./timeline";
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

describe("buildTimeline", () => {
  it("returns no entries when there is nothing real to report", () => {
    const snapshots = [buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z" }), buildSnapshot({ timestamp: "2026-07-02T00:00:00.000Z" })];
    expect(buildTimeline(snapshots)).toEqual([]);
  });

  it("flags a real single-snapshot jump of >= 25% as a notable-jump entry", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", clicks: 100 }),
      buildSnapshot({ timestamp: "2026-07-02T00:00:00.000Z", clicks: 200 }), // +100%
    ];
    const timeline = buildTimeline(snapshots);
    expect(timeline.some((entry) => entry.type === "notable-jump" && entry.key === "clicks")).toBe(true);
  });

  it("does not flag a change below the notable-jump threshold", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", clicks: 100 }),
      buildSnapshot({ timestamp: "2026-07-02T00:00:00.000Z", clicks: 105 }), // +5%
    ];
    const timeline = buildTimeline(snapshots);
    expect(timeline.some((entry) => entry.type === "notable-jump" && entry.key === "clicks")).toBe(false);
  });

  it("sorts entries newest first", () => {
    const snapshots = [
      buildSnapshot({ timestamp: "2026-07-01T00:00:00.000Z", clicks: 100 }),
      buildSnapshot({ timestamp: "2026-07-02T00:00:00.000Z", clicks: 200 }),
      buildSnapshot({ timestamp: "2026-07-03T00:00:00.000Z", clicks: 50 }),
    ];
    const timeline = buildTimeline(snapshots);
    for (let i = 1; i < timeline.length; i++) {
      expect(new Date(timeline[i - 1].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(timeline[i].timestamp).getTime());
    }
  });
});
