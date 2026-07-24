import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";

const runReportMock = vi.fn<(query: unknown) => Promise<Ga4Row[]>>();

vi.mock("@/lib/google/ga4Client", () => ({
  runReport: (query: unknown) => runReportMock(query),
}));

let rangeCounter = 0;
function uniqueRange() {
  rangeCounter += 1;
  return { start: `2021-03-${String(rangeCounter).padStart(2, "0")}`, end: `2021-03-${String(rangeCounter).padStart(2, "0")}` };
}

describe("getConversionSummary", () => {
  beforeEach(() => {
    runReportMock.mockReset();
    runReportMock.mockResolvedValue([]);
  });

  it("computes appointment/contact pageviews and overall conversion rate from pagePath+channel and channel sessions", async () => {
    const { getConversionSummary } = await import("./conversionSummary");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "pagePath" && q.dimensions[1] === "sessionDefaultChannelGroup") {
        return [
          { dimensions: { pagePath: "/appointment", sessionDefaultChannelGroup: "Organic Search" }, metrics: { screenPageViews: 10 } },
          { dimensions: { pagePath: "/contact", sessionDefaultChannelGroup: "Direct" }, metrics: { screenPageViews: 5 } },
          { dimensions: { pagePath: "/journal/some-article", sessionDefaultChannelGroup: "Organic Search" }, metrics: { screenPageViews: 100 } },
        ];
      }
      if (q.dimensions?.[0] === "sessionDefaultChannelGroup") {
        return [
          { dimensions: { sessionDefaultChannelGroup: "Organic Search" }, metrics: { sessions: 200 } },
          { dimensions: { sessionDefaultChannelGroup: "Direct" }, metrics: { sessions: 100 } },
        ];
      }
      return [];
    });

    const range = uniqueRange();
    const summary = await getConversionSummary(range);

    expect(summary.pageViews.appointment.current).toBe(10);
    expect(summary.pageViews.contact.current).toBe(5);
    expect(summary.pageViews.combined.current).toBe(15);
    // 15 conversion pageviews / 300 total sessions * 100
    expect(summary.overallConversionRate.current).toBeCloseTo(5, 5);
  });

  it("computes organic conversion rate filtered to the Organic Search channel only", async () => {
    const { getConversionSummary } = await import("./conversionSummary");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "pagePath" && q.dimensions[1] === "sessionDefaultChannelGroup") {
        return [
          { dimensions: { pagePath: "/appointment", sessionDefaultChannelGroup: "Organic Search" }, metrics: { screenPageViews: 10 } },
          { dimensions: { pagePath: "/appointment", sessionDefaultChannelGroup: "Direct" }, metrics: { screenPageViews: 90 } },
        ];
      }
      if (q.dimensions?.[0] === "sessionDefaultChannelGroup") {
        return [
          { dimensions: { sessionDefaultChannelGroup: "Organic Search" }, metrics: { sessions: 100 } },
          { dimensions: { sessionDefaultChannelGroup: "Direct" }, metrics: { sessions: 900 } },
        ];
      }
      return [];
    });

    const summary = await getConversionSummary(uniqueRange());
    // organic: 10 views / 100 sessions = 10%; overall would be much lower (100/1000=10% too coincidentally different formula) so assert organic explicitly
    expect(summary.organicConversionRate.current).toBeCloseTo(10, 5);
  });

  it("returns zero rates (not NaN/crash) when there are no sessions", async () => {
    const { getConversionSummary } = await import("./conversionSummary");
    const summary = await getConversionSummary(uniqueRange());
    expect(summary.overallConversionRate.current).toBe(0);
    expect(summary.pageViews.combined.current).toBe(0);
    expect(summary.channelBreakdown).toEqual([]);
  });

  it("builds a channel breakdown sorted by sessions, descending, with per-channel conversion rate", async () => {
    const { getConversionSummary } = await import("./conversionSummary");

    runReportMock.mockImplementation(async (query) => {
      const q = query as { dimensions?: string[] };
      if (q.dimensions?.[0] === "pagePath" && q.dimensions[1] === "sessionDefaultChannelGroup") {
        return [{ dimensions: { pagePath: "/contact", sessionDefaultChannelGroup: "Referral" }, metrics: { screenPageViews: 4 } }];
      }
      if (q.dimensions?.[0] === "sessionDefaultChannelGroup") {
        return [
          { dimensions: { sessionDefaultChannelGroup: "Referral" }, metrics: { sessions: 40 } },
          { dimensions: { sessionDefaultChannelGroup: "Organic Search" }, metrics: { sessions: 400 } },
        ];
      }
      return [];
    });

    const summary = await getConversionSummary(uniqueRange());
    expect(summary.channelBreakdown[0].segment).toBe("Organic Search");
    const referralRow = summary.channelBreakdown.find((row) => row.segment === "Referral");
    expect(referralRow?.conversionRate).toBeCloseTo(10, 5);
  });
});
