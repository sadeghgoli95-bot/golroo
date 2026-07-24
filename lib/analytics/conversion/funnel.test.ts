import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";

const runReportMock = vi.fn<(query: unknown) => Promise<Ga4Row[]>>();

vi.mock("@/lib/google/ga4Client", () => ({
  runReport: (query: unknown) => runReportMock(query),
}));

describe("getConversionFunnel", () => {
  beforeEach(() => {
    runReportMock.mockReset();
  });

  it("builds three stages (sessions, pageviews, appointment/contact views) with drop-off percentages", async () => {
    const { getConversionFunnel } = await import("./funnel");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "pagePath") {
        return [
          { dimensions: { pagePath: "/appointment" }, metrics: { screenPageViews: 20 } },
          { dimensions: { pagePath: "/contact" }, metrics: { screenPageViews: 10 } },
          { dimensions: { pagePath: "/journal/x" }, metrics: { screenPageViews: 970 } },
        ];
      }
      return [{ dimensions: {}, metrics: { sessions: 1000, screenPageViews: 1000 } }];
    });

    const stages = await getConversionFunnel({ start: "2021-01-01", end: "2021-01-31" });

    expect(stages).toHaveLength(3);
    expect(stages[0].value).toBe(1000);
    expect(stages[0].dropOffPercent).toBeNull();
    expect(stages[1].value).toBe(1000);
    expect(stages[2].value).toBe(30);
    expect(stages[2].dropOffPercent).toBeCloseTo(97, 5);
  });

  it("returns dropOffPercent null for a stage whose predecessor is zero (never divides by zero)", async () => {
    const { getConversionFunnel } = await import("./funnel");
    runReportMock.mockResolvedValue([]);

    const stages = await getConversionFunnel({ start: "2021-01-01", end: "2021-01-31" });
    expect(stages.every((stage) => Number.isFinite(stage.value))).toBe(true);
    expect(stages[1].dropOffPercent).toBeNull();
  });
});
