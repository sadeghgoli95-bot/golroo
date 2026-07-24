import { describe, expect, it } from "vitest";
import { generateInsights } from "./insights";
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

describe("generateInsights", () => {
  it("returns an empty array when there isn't enough real history to detect anything", () => {
    const insights = generateInsights([buildSnapshot()]);
    expect(insights).toEqual([]);
  });

  it("produces a decay insight backed by a real detected decay streak", () => {
    const snapshots = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04"].map((day, index) =>
      buildSnapshot({ timestamp: `${day}T00:00:00.000Z`, clicks: 100 - index * 20 })
    );
    const insights = generateInsights(snapshots);
    const decayInsight = insights.find((insight) => insight.id === "decay-clicks");
    expect(decayInsight).toBeDefined();
    expect(decayInsight?.severity).toBe("warning");
    expect(decayInsight?.impact).toContain("100");
  });

  it("never fabricates an insight when the underlying detector finds no event for that metric", () => {
    const snapshots = ["2026-07-01", "2026-07-02", "2026-07-03"].map((day) =>
      buildSnapshot({ timestamp: `${day}T00:00:00.000Z`, healthScore: 70 })
    );
    const insights = generateInsights(snapshots);
    expect(insights.some((insight) => insight.id === "decay-healthScore")).toBe(false);
    expect(insights.some((insight) => insight.id === "recovery-healthScore")).toBe(false);
  });
});
