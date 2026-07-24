import { describe, it, expect } from "vitest";
import { getVisibilityChanges, getLosingVisibility, getBiggestRisk } from "./visibilityTrends";
import { buildTestAnalysis } from "../site/testFixtures";
import type { SearchMetrics, SearchPageMetric } from "../search/types";

function metrics(topPages: SearchPageMetric[]): SearchMetrics {
  return {
    clicks: { current: 0, previousPeriod: null, previousYear: null },
    impressions: { current: 0, previousPeriod: null, previousYear: null },
    ctr: { current: 0, previousPeriod: null, previousYear: null },
    averagePosition: { current: 0, previousPeriod: null, previousYear: null },
    topQueries: [],
    fastestGrowingQueries: [],
    losingQueries: [],
    brandQueries: [],
    nonBrandQueries: [],
    topPages,
    pagesNearFirstPage: [],
    highImpressionLowCtrPages: [],
  };
}

describe("getVisibilityChanges / getLosingVisibility", () => {
  it("compares real clicks for a page present in both periods via compareValues", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 5, impressions: 100, ctr: 0.05, averagePosition: 8 }]);
    const previous = metrics([{ page: "/journal/a", clicks: 20, impressions: 100, ctr: 0.2, averagePosition: 6 }]);

    const changes = getVisibilityChanges(current, previous, [analysis]);
    expect(changes).toHaveLength(1);
    expect(changes[0].comparison.trend).toBe("down");
    expect(changes[0].comparison.difference).toBe(-15);

    const losing = getLosingVisibility(changes);
    expect(losing).toHaveLength(1);
  });

  it("only compares pages observed in both periods' exposed slices", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 5, impressions: 100, ctr: 0.05, averagePosition: 8 }]);
    const previous = metrics([]); // page not observed previously -> not comparable
    expect(getVisibilityChanges(current, previous, [analysis])).toHaveLength(0);
  });
});

describe("getBiggestRisk", () => {
  it("prefers the real search-decline signal when available", () => {
    const losing = [
      {
        slug: "a",
        title: "A",
        page: "/journal/a",
        comparison: { current: 5, previous: 20, difference: -15, percentChange: -75, trend: "down" as const },
      },
    ];
    const risk = getBiggestRisk(losing, []);
    expect(risk?.source).toBe("search_decline");
    expect(risk?.slug).toBe("a");
  });

  it("falls back to real critical content-quality issues when there is no search-decline signal", () => {
    const analysis = buildTestAnalysis({
      article: { slug: "b", isPublished: true },
      criticalSuggestions: ["نقل قول علمی ندارد", "بدون منبع"],
    });
    const risk = getBiggestRisk([], [analysis]);
    expect(risk?.source).toBe("critical_content_issues");
    expect(risk?.slug).toBe("b");
  });

  it("returns null rather than inventing a risk when neither real signal has anything", () => {
    expect(getBiggestRisk([], [])).toBeNull();
  });
});
