import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";
import type { ContentAttributionRow, ConversionPageViews } from "./types";
import {
  getBounceRateInsights,
  getEngagementConversionMismatch,
  getCtaSuggestions,
  getLowestConvertingHighTraffic,
  getSuddenConversionDrop,
} from "./businessInsights";

function metricValue(current: number, previousPeriod: number | null): ConversionPageViews["appointment"] {
  return { current, previousPeriod, previousYear: null };
}

const runReportMock = vi.fn<(query: unknown) => Promise<Ga4Row[]>>();

vi.mock("@/lib/google/ga4Client", () => ({
  runReport: (query: unknown) => runReportMock(query),
}));

function row(overrides: Partial<ContentAttributionRow>): ContentAttributionRow {
  return {
    slug: "x",
    title: "x",
    landingSessions: 0,
    engagementRate: 0,
    bookingLinkCount: 0,
    estimatedScore: 0,
    ...overrides,
  };
}

describe("getBounceRateInsights", () => {
  beforeEach(() => {
    runReportMock.mockReset();
  });

  it("queries the real GA4 bounceRate metric (not a nonexistent 'exits' metric) and converts it to a 0-100 percent, sorted descending", async () => {
    runReportMock.mockResolvedValue([
      { dimensions: { pagePath: "/a" }, metrics: { bounceRate: 0.1, screenPageViews: 100 } },
      { dimensions: { pagePath: "/b" }, metrics: { bounceRate: 0.5, screenPageViews: 100 } },
    ]);

    const rows = await getBounceRateInsights({ start: "2021-01-01", end: "2021-01-31" });

    expect(runReportMock).toHaveBeenCalledWith(
      expect.objectContaining({ metrics: ["bounceRate", "screenPageViews"] })
    );
    expect(rows[0].page).toBe("/b");
    expect(rows[0].bounceRate).toBeCloseTo(50, 5);
    expect(rows[1].bounceRate).toBeCloseTo(10, 5);
  });

  it("defaults to zero when a page has no bounceRate data", async () => {
    runReportMock.mockResolvedValue([{ dimensions: { pagePath: "/a" }, metrics: { screenPageViews: 0 } }]);
    const rows = await getBounceRateInsights({ start: "2021-01-01", end: "2021-01-31" });
    expect(rows[0].bounceRate).toBe(0);
  });
});

describe("getEngagementConversionMismatch", () => {
  it("flags rows above average engagementRate with zero booking links", () => {
    const rows = [
      row({ slug: "high-no-link", landingSessions: 10, engagementRate: 0.9, bookingLinkCount: 0 }),
      row({ slug: "high-with-link", landingSessions: 10, engagementRate: 0.9, bookingLinkCount: 1 }),
      row({ slug: "low", landingSessions: 10, engagementRate: 0.1, bookingLinkCount: 0 }),
    ];
    const flagged = getEngagementConversionMismatch(rows);
    expect(flagged.map((r) => r.slug)).toEqual(["high-no-link"]);
  });

  it("ignores rows with zero sessions", () => {
    const flagged = getEngagementConversionMismatch([row({ slug: "no-sessions", landingSessions: 0, engagementRate: 0.9, bookingLinkCount: 0 })]);
    expect(flagged).toEqual([]);
  });
});

describe("getCtaSuggestions", () => {
  it("suggests only at/above-median-traffic articles with zero booking links", () => {
    const rows = [
      row({ slug: "top", title: "Top", landingSessions: 100, bookingLinkCount: 0 }),
      row({ slug: "mid", title: "Mid", landingSessions: 50, bookingLinkCount: 0 }),
      row({ slug: "bottom-linked", title: "Bottom", landingSessions: 1, bookingLinkCount: 2 }),
    ];
    const suggestions = getCtaSuggestions(rows);
    expect(suggestions.map((s) => s.slug)).toContain("top");
    expect(suggestions.map((s) => s.slug)).not.toContain("bottom-linked");
  });
});

describe("getLowestConvertingHighTraffic", () => {
  it("ranks real high-traffic pages by lowest conversion density first, including pages that do have some links", () => {
    const rows = [
      row({ slug: "high-traffic-poor", landingSessions: 100, bookingLinkCount: 1, estimatedScore: 110 }), // density 1.1
      row({ slug: "high-traffic-good", landingSessions: 100, bookingLinkCount: 5, estimatedScore: 150 }), // density 1.5
      row({ slug: "low-traffic", landingSessions: 1, bookingLinkCount: 0, estimatedScore: 1 }),
    ];
    const ranked = getLowestConvertingHighTraffic(rows);
    expect(ranked[0].slug).toBe("high-traffic-poor");
    expect(ranked.map((r) => r.slug)).not.toContain("low-traffic");
  });

  it("returns an empty list when there is no real traffic to rank", () => {
    expect(getLowestConvertingHighTraffic([])).toEqual([]);
  });
});

describe("getSuddenConversionDrop", () => {
  it("flags a real drop at or beyond the documented threshold", () => {
    const pageViews: ConversionPageViews = {
      appointment: metricValue(5, 20), // -75%
      contact: metricValue(10, 10), // flat
      combined: metricValue(15, 30), // -50%
    };
    const alerts = getSuddenConversionDrop(pageViews);
    expect(alerts.map((a) => a.metric)).toEqual(["appointment", "combined"]);
  });

  it("does not flag a small real dip below the threshold", () => {
    const pageViews: ConversionPageViews = {
      appointment: metricValue(9, 10), // -10%
      contact: metricValue(10, 10),
      combined: metricValue(19, 20),
    };
    expect(getSuddenConversionDrop(pageViews)).toEqual([]);
  });

  it("skips a metric with no real previous-period value rather than fabricating a drop", () => {
    const pageViews: ConversionPageViews = {
      appointment: metricValue(5, null),
      contact: metricValue(10, 10),
      combined: metricValue(15, null),
    };
    expect(getSuddenConversionDrop(pageViews)).toEqual([]);
  });
});
