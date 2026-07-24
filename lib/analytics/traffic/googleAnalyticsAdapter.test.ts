import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";

const runReportMock = vi.fn<(query: unknown) => Promise<Ga4Row[]>>();

vi.mock("@/lib/google/ga4Client", () => ({
  runReport: (query: unknown) => runReportMock(query),
}));

let rangeCounter = 0;
function uniqueCustomRange() {
  rangeCounter += 1;
  return { preset: "custom" as const, start: `2021-02-${String(rangeCounter).padStart(2, "0")}`, end: `2021-02-${String(rangeCounter).padStart(2, "0")}` };
}

describe("googleAnalyticsAdapter", () => {
  beforeEach(() => {
    runReportMock.mockReset();
    runReportMock.mockResolvedValue([]);
  });

  it("builds current/previous MetricValues for users/sessions from two summary queries", async () => {
    const { googleAnalyticsAdapter } = await import("./googleAnalyticsAdapter");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { startDate: string; dimensions?: string[] };
      if (q.dimensions) return [];
      const isCurrent = q.startDate === "2021-02-01";
      return [
        {
          dimensions: {},
          metrics: {
            activeUsers: isCurrent ? 40 : 20,
            totalUsers: isCurrent ? 45 : 22,
            newUsers: isCurrent ? 10 : 5,
            sessions: isCurrent ? 60 : 30,
            engagedSessions: isCurrent ? 50 : 25,
            engagementRate: isCurrent ? 0.7 : 0.5,
            averageSessionDuration: isCurrent ? 120 : 90,
            screenPageViews: isCurrent ? 100 : 50,
            bounceRate: isCurrent ? 0.3 : 0.4,
            screenPageViewsPerSession: isCurrent ? 1.6 : 1.5,
          },
        },
      ];
    });

    const metrics = await googleAnalyticsAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.users.current).toBe(40);
    expect(metrics.users.previousPeriod).toBe(20);
    expect(metrics.sessions.current).toBe(60);
  });

  it("derives returningVisitors as totalUsers minus newUsers", async () => {
    const { googleAnalyticsAdapter } = await import("./googleAnalyticsAdapter");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions) return [];
      return [{ dimensions: {}, metrics: { totalUsers: 50, newUsers: 20 } }];
    });

    const metrics = await googleAnalyticsAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.returningVisitors.current).toBe(30);
  });

  it("sorts landingPages/trafficSources/devices/countries by sessions, descending", async () => {
    const { googleAnalyticsAdapter } = await import("./googleAnalyticsAdapter");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "landingPage") {
        return [
          { dimensions: { landingPage: "/low" }, metrics: { sessions: 5, activeUsers: 5 } },
          { dimensions: { landingPage: "/high" }, metrics: { sessions: 50, activeUsers: 40 } },
        ];
      }
      if (q.dimensions) return [];
      return [{ dimensions: {}, metrics: {} }];
    });

    const metrics = await googleAnalyticsAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.landingPages[0].path).toBe("/high");
  });

  it("returns all-zero metrics (not a crash) when GA4 returns no rows", async () => {
    const { googleAnalyticsAdapter } = await import("./googleAnalyticsAdapter");
    const metrics = await googleAnalyticsAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.users.current).toBe(0);
    expect(metrics.landingPages).toEqual([]);
  });
});
