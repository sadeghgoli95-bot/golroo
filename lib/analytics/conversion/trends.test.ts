import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";

const runReportMock = vi.fn<(query: unknown) => Promise<Ga4Row[]>>();

vi.mock("@/lib/google/ga4Client", () => ({
  runReport: (query: unknown) => runReportMock(query),
}));

describe("getConversionTrends", () => {
  beforeEach(() => {
    runReportMock.mockReset();
    runReportMock.mockResolvedValue([]);
  });

  it("splits the range into buckets and returns one point per bucket for every series", async () => {
    const { getConversionTrends } = await import("./trends");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "pagePath") {
        return [{ dimensions: { pagePath: "/appointment", sessionDefaultChannelGroup: "Organic Search" }, metrics: { screenPageViews: 2 } }];
      }
      if (q.dimensions?.[0] === "sessionDefaultChannelGroup") {
        return [{ dimensions: { sessionDefaultChannelGroup: "Organic Search" }, metrics: { sessions: 20 } }];
      }
      return [];
    });

    const trends = await getConversionTrends({ start: "2021-01-01", end: "2021-01-12" });

    expect(trends.bucketLabels.length).toBeGreaterThan(0);
    expect(trends.conversionRate.length).toBe(trends.bucketLabels.length);
    expect(trends.organicConversionRate.length).toBe(trends.bucketLabels.length);
    expect(trends.funnelViews.length).toBe(trends.bucketLabels.length);
    expect(trends.pageViews.length).toBe(trends.bucketLabels.length);
    expect(trends.contentViews.length).toBe(trends.bucketLabels.length);
    // 2 views / 20 sessions * 100 = 10, same in every bucket given the constant mock
    expect(trends.conversionRate[0].value).toBeCloseTo(10, 5);
  });

  it("caps buckets at 6 even for a long range, and never exceeds the number of days for a short range", async () => {
    const { getConversionTrends } = await import("./trends");

    const longTrends = await getConversionTrends({ start: "2021-01-01", end: "2021-12-31" });
    expect(longTrends.bucketLabels.length).toBe(6);

    const shortTrends = await getConversionTrends({ start: "2021-01-01", end: "2021-01-02" });
    expect(shortTrends.bucketLabels.length).toBe(2);
  });

  it("ranks topChannels by total sessions across buckets, descending", async () => {
    const { getConversionTrends } = await import("./trends");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "sessionDefaultChannelGroup") {
        return [
          { dimensions: { sessionDefaultChannelGroup: "Organic Search" }, metrics: { sessions: 500 } },
          { dimensions: { sessionDefaultChannelGroup: "Direct" }, metrics: { sessions: 50 } },
        ];
      }
      return [];
    });

    const trends = await getConversionTrends({ start: "2021-01-01", end: "2021-01-05" });
    expect(trends.topChannels[0]?.channel).toBe("Organic Search");
  });
});
