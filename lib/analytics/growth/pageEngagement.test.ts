import { describe, it, expect } from "vitest";
import { getHighTrafficLowEngagementPages, type PageEngagementRow } from "./pageEngagement";

describe("getHighTrafficLowEngagementPages", () => {
  const analyses = [
    { article: { slug: "high", title: "High" } },
    { article: { slug: "low", title: "Low" } },
    { article: { slug: "mid", title: "Mid" } },
  ];

  it("flags a real page with above-median sessions and below-site-average engagement", () => {
    const rows: PageEngagementRow[] = [
      { path: "/journal/high", sessions: 300, engagementRate: 0.2 },
      { path: "/journal/mid", sessions: 100, engagementRate: 0.6 },
      { path: "/journal/low", sessions: 10, engagementRate: 0.1 },
    ];
    const result = getHighTrafficLowEngagementPages(rows, 0.5, analyses);
    expect(result.map((r) => r.slug)).toEqual(["high"]);
  });

  it("returns an empty list rather than guessing when there is no real per-page data", () => {
    expect(getHighTrafficLowEngagementPages([], 0.5, analyses)).toHaveLength(0);
  });
});
