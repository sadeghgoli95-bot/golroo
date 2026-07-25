import { describe, it, expect } from "vitest";
import { buildPageSignals, getImpressionGrowthWithoutClicks, getSuddenCtrDrops } from "./pageSignals";
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

describe("buildPageSignals", () => {
  it("only compares real pages observed in both periods", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 5, impressions: 200, ctr: 0.025, averagePosition: 8 }]);
    const previous = metrics([]);
    expect(buildPageSignals(current, previous, [analysis])).toHaveLength(0);
  });
});

describe("getImpressionGrowthWithoutClicks", () => {
  it("flags a page whose real impressions rose while real clicks did not", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 5, impressions: 300, ctr: 0.0167, averagePosition: 8 }]);
    const previous = metrics([{ page: "/journal/a", clicks: 5, impressions: 100, ctr: 0.05, averagePosition: 8 }]);

    const signals = buildPageSignals(current, previous, [analysis]);
    const flagged = getImpressionGrowthWithoutClicks(signals);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].slug).toBe("a");
  });

  it("does not flag a page whose real clicks grew alongside impressions", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 15, impressions: 300, ctr: 0.05, averagePosition: 8 }]);
    const previous = metrics([{ page: "/journal/a", clicks: 5, impressions: 100, ctr: 0.05, averagePosition: 8 }]);

    const signals = buildPageSignals(current, previous, [analysis]);
    expect(getImpressionGrowthWithoutClicks(signals)).toHaveLength(0);
  });
});

describe("getSuddenCtrDrops", () => {
  it("flags a real CTR drop at or beyond the documented threshold", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 5, impressions: 200, ctr: 0.025, averagePosition: 8 }]);
    const previous = metrics([{ page: "/journal/a", clicks: 10, impressions: 200, ctr: 0.05, averagePosition: 8 }]); // -50%

    const signals = buildPageSignals(current, previous, [analysis]);
    const flagged = getSuddenCtrDrops(signals);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].slug).toBe("a");
  });

  it("does not flag a small real CTR dip below the threshold", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const current = metrics([{ page: "/journal/a", clicks: 9, impressions: 200, ctr: 0.045, averagePosition: 8 }]);
    const previous = metrics([{ page: "/journal/a", clicks: 10, impressions: 200, ctr: 0.05, averagePosition: 8 }]); // -10%

    const signals = buildPageSignals(current, previous, [analysis]);
    expect(getSuddenCtrDrops(signals)).toHaveLength(0);
  });
});
