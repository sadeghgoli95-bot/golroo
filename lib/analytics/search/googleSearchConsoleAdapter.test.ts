import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";

const querySearchAnalyticsMock = vi.fn<(query: unknown) => Promise<SearchAnalyticsRow[]>>();

vi.mock("@/lib/google/searchConsoleClient", () => ({
  querySearchAnalytics: (query: unknown) => querySearchAnalyticsMock(query),
}));

// Every test uses a unique custom date range so the adapter's internal cache (keyed by resolved start/end) never collides across tests.
let rangeCounter = 0;
function uniqueCustomRange() {
  rangeCounter += 1;
  return { preset: "custom" as const, start: `2020-01-${String(rangeCounter).padStart(2, "0")}`, end: `2020-01-${String(rangeCounter).padStart(2, "0")}` };
}

function aggregateRow(overrides: Partial<SearchAnalyticsRow> = {}): SearchAnalyticsRow {
  return { keys: [], clicks: 10, impressions: 100, ctr: 0.1, position: 5, ...overrides };
}

describe("googleSearchConsoleAdapter", () => {
  beforeEach(() => {
    querySearchAnalyticsMock.mockReset();
  });

  it("builds current/previous MetricValues from two aggregate queries (current range + equal-length previous range)", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");

    querySearchAnalyticsMock.mockImplementation(async (query) => {
      const q = query as { startDate: string; dimensions?: string[] };
      if (!q.dimensions) {
        return q.startDate === "2020-01-01" ? [aggregateRow({ clicks: 20 })] : [aggregateRow({ clicks: 10 })];
      }
      return [];
    });

    const metrics = await googleSearchConsoleAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.clicks.current).toBe(20);
    expect(metrics.clicks.previousPeriod).toBe(10);
  });

  it("ranks topQueries by clicks, descending", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");

    querySearchAnalyticsMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "query") {
        return [
          aggregateRow({ keys: ["low"], clicks: 2 }),
          aggregateRow({ keys: ["high"], clicks: 50 }),
        ];
      }
      if (q.dimensions?.[0] === "page") return [];
      return [aggregateRow()];
    });

    const metrics = await googleSearchConsoleAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.topQueries[0].query).toBe("high");
  });

  it("classifies brand vs non-brand queries using the real site name/organization name", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");

    querySearchAnalyticsMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "query") {
        return [aggregateRow({ keys: ["میرورا نظرات"], clicks: 5 }), aggregateRow({ keys: ["اضطراب کودک"], clicks: 5 })];
      }
      if (q.dimensions?.[0] === "page") return [];
      return [aggregateRow()];
    });

    const metrics = await googleSearchConsoleAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.brandQueries.map((q) => q.query)).toContain("میرورا نظرات");
    expect(metrics.nonBrandQueries.map((q) => q.query)).toContain("اضطراب کودک");
  });

  it("flags pages with an average position between 11 and 20 as near-first-page", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");

    querySearchAnalyticsMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "page") {
        return [
          aggregateRow({ keys: ["/journal/near"], position: 15 }),
          aggregateRow({ keys: ["/journal/far"], position: 45 }),
        ];
      }
      if (q.dimensions?.[0] === "query") return [];
      return [aggregateRow()];
    });

    const metrics = await googleSearchConsoleAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.pagesNearFirstPage.map((p) => p.page)).toEqual(["/journal/near"]);
  });

  it("flags high-impression/low-CTR pages using the real impression and CTR thresholds", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");

    querySearchAnalyticsMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "page") {
        return [
          aggregateRow({ keys: ["/journal/low-ctr"], impressions: 200, ctr: 0.005 }),
          aggregateRow({ keys: ["/journal/good-ctr"], impressions: 200, ctr: 0.1 }),
        ];
      }
      if (q.dimensions?.[0] === "query") return [];
      return [aggregateRow()];
    });

    const metrics = await googleSearchConsoleAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.highImpressionLowCtrPages.map((p) => p.page)).toEqual(["/journal/low-ctr"]);
  });

  it("computes fastestGrowingQueries/losingQueries by comparing clicks against the previous period, matched by query text", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");

    querySearchAnalyticsMock.mockImplementation(async (query) => {
      const q = query as { startDate: string; dimensions?: string[] };
      if (q.dimensions?.[0] === "query") {
        const isCurrent = q.startDate >= "2020-01-15";
        if (isCurrent) {
          return [aggregateRow({ keys: ["growing"], clicks: 50 }), aggregateRow({ keys: ["losing"], clicks: 5 })];
        }
        return [aggregateRow({ keys: ["growing"], clicks: 10 }), aggregateRow({ keys: ["losing"], clicks: 40 })];
      }
      if (q.dimensions?.[0] === "page") return [];
      return [aggregateRow()];
    });

    const metrics = await googleSearchConsoleAdapter.getMetrics({ preset: "custom", start: "2020-01-15", end: "2020-01-15" });
    expect(metrics.fastestGrowingQueries.map((q) => q.query)).toContain("growing");
    expect(metrics.losingQueries.map((q) => q.query)).toContain("losing");
  });

  it("returns 0-value totals (not a crash) when the aggregate query has no rows for the range", async () => {
    const { googleSearchConsoleAdapter } = await import("./googleSearchConsoleAdapter");
    querySearchAnalyticsMock.mockResolvedValue([]);

    const metrics = await googleSearchConsoleAdapter.getMetrics(uniqueCustomRange());
    expect(metrics.clicks.current).toBe(0);
    expect(metrics.topQueries).toEqual([]);
  });
});
