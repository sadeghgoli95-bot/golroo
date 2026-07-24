import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";
import type { ContentAttributionRow } from "./types";
import { getExitRateInsights, getEngagementConversionMismatch, getCtaSuggestions } from "./businessInsights";

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

describe("getExitRateInsights", () => {
  beforeEach(() => {
    runReportMock.mockReset();
  });

  it("computes exitRate as exits/screenPageViews * 100, sorted descending", async () => {
    runReportMock.mockResolvedValue([
      { dimensions: { pagePath: "/a" }, metrics: { exits: 10, screenPageViews: 100 } },
      { dimensions: { pagePath: "/b" }, metrics: { exits: 50, screenPageViews: 100 } },
    ]);

    const rows = await getExitRateInsights({ start: "2021-01-01", end: "2021-01-31" });
    expect(rows[0].page).toBe("/b");
    expect(rows[0].exitRate).toBeCloseTo(50, 5);
    expect(rows[1].exitRate).toBeCloseTo(10, 5);
  });

  it("never divides by zero when a page has zero pageviews", async () => {
    runReportMock.mockResolvedValue([{ dimensions: { pagePath: "/a" }, metrics: { exits: 0, screenPageViews: 0 } }]);
    const rows = await getExitRateInsights({ start: "2021-01-01", end: "2021-01-31" });
    expect(rows[0].exitRate).toBe(0);
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
