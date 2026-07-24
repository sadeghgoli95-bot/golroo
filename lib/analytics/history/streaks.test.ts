import { describe, expect, it } from "vitest";
import { detectDecay, detectRecovery, DECAY_STREAK_THRESHOLD, RECOVERY_STREAK_THRESHOLD } from "./streaks";
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

function series(values: number[], field: keyof AnalyticsSnapshot = "clicks"): AnalyticsSnapshot[] {
  return values.map((value, index) =>
    buildSnapshot({ timestamp: `2026-07-0${index + 1}T00:00:00.000Z`, [field]: value } as Partial<AnalyticsSnapshot>)
  );
}

describe("detectDecay", () => {
  it("does not flag decay for a two-drop streak (below the threshold)", () => {
    const snapshots = series([50, 40, 30]); // 2 consecutive drops
    const event = detectDecay(snapshots, "clicks");
    expect(event.streakLength).toBe(3);
    expect(event.isDecaying).toBe(false);
  });

  it(`flags decay once a higher-is-better metric has dropped for ${DECAY_STREAK_THRESHOLD} consecutive real values`, () => {
    const snapshots = series([50, 40, 30, 20]); // 3 consecutive drops
    const event = detectDecay(snapshots, "clicks");
    expect(event.streakLength).toBe(4);
    expect(event.isDecaying).toBe(true);
  });

  it("flags decay for a lower-is-better metric (position) when it *rises* for the threshold length", () => {
    const snapshots = series([5, 8, 12, 18], "position");
    const event = detectDecay(snapshots, "position");
    expect(event.isDecaying).toBe(true);
  });

  it("does not flag decay when the trailing values are flat or improving", () => {
    const snapshots = series([20, 30, 40, 50]);
    const event = detectDecay(snapshots, "clicks");
    expect(event.isDecaying).toBe(false);
  });
});

describe("detectRecovery", () => {
  it(`flags recovery once a metric improves for ${RECOVERY_STREAK_THRESHOLD} consecutive real values right after a real decay streak`, () => {
    const snapshots = series([50, 40, 30, 20, 30, 45]); // decays for 3 steps, then recovers for 2
    const event = detectRecovery(snapshots, "clicks");
    expect(event.precededByDecay).toBe(true);
    expect(event.isRecovering).toBe(true);
  });

  it("does not flag recovery when the upturn was not preceded by a real decay streak", () => {
    const snapshots = series([50, 55, 60, 65]); // pure growth, never declined
    const event = detectRecovery(snapshots, "clicks");
    expect(event.precededByDecay).toBe(false);
    expect(event.isRecovering).toBe(false);
  });
});
