import { describe, expect, it } from "vitest";
import type { SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";
import { computeQueryMovers, computeNewAndLostQueries, computeTrendingQueries } from "./queryDiff";

function row(overrides: Partial<SearchAnalyticsRow> = {}): SearchAnalyticsRow {
  return { keys: [], clicks: 0, impressions: 0, ctr: 0, position: 10, ...overrides };
}

describe("computeQueryMovers", () => {
  it("splits queries into winners (clicks up) and losers (clicks down) using compareValues math", () => {
    const current = [row({ keys: ["winner"], clicks: 20 }), row({ keys: ["loser"], clicks: 5 }), row({ keys: ["flat"], clicks: 10 })];
    const previous = [row({ keys: ["winner"], clicks: 10 }), row({ keys: ["loser"], clicks: 20 }), row({ keys: ["flat"], clicks: 10 })];

    const { winningKeywords, losingKeywords } = computeQueryMovers(current, previous);

    expect(winningKeywords.map((q) => q.query)).toEqual(["winner"]);
    expect(winningKeywords[0].deltaClicks).toBe(10);
    expect(winningKeywords[0].percentChange).toBe(100);

    expect(losingKeywords.map((q) => q.query)).toEqual(["loser"]);
    expect(losingKeywords[0].deltaClicks).toBe(-15);
  });

  it("treats a query with no previous clicks as a winner with previousClicks 0", () => {
    const { winningKeywords } = computeQueryMovers([row({ keys: ["brand-new"], clicks: 5 })], []);
    expect(winningKeywords[0]).toMatchObject({ query: "brand-new", previousClicks: 0, deltaClicks: 5 });
  });
});

describe("computeNewAndLostQueries", () => {
  it("finds queries present only in the current period as new, and only in the previous period as lost", () => {
    const current = [row({ keys: ["kept"], clicks: 5 }), row({ keys: ["new-query"], clicks: 3 })];
    const previous = [row({ keys: ["kept"], clicks: 4 }), row({ keys: ["gone-query"], clicks: 7 })];

    const { newQueries, lostQueries } = computeNewAndLostQueries(current, previous);

    expect(newQueries.map((q) => q.query)).toEqual(["new-query"]);
    expect(lostQueries.map((q) => q.query)).toEqual(["gone-query"]);
  });

  it("returns empty diffs when the query sets are identical", () => {
    const rows = [row({ keys: ["same"], clicks: 1 })];
    const { newQueries, lostQueries } = computeNewAndLostQueries(rows, rows);
    expect(newQueries).toEqual([]);
    expect(lostQueries).toEqual([]);
  });
});

describe("computeTrendingQueries", () => {
  it("ranks queries by impression growth percent, descending, above the minimum previous-impression floor", () => {
    const current = [
      row({ keys: ["big-grower"], impressions: 100 }),
      row({ keys: ["small-grower"], impressions: 12 }),
      row({ keys: ["too-small-base"], impressions: 6 }),
    ];
    const previous = [
      row({ keys: ["big-grower"], impressions: 10 }),
      row({ keys: ["small-grower"], impressions: 10 }),
      row({ keys: ["too-small-base"], impressions: 1 }),
    ];

    const trending = computeTrendingQueries(current, previous);
    expect(trending.map((q) => q.query)).toEqual(["big-grower", "small-grower"]);
    expect(trending[0].impressionGrowthPercent).toBe(900);
  });

  it("excludes queries with no growth or a decline", () => {
    const current = [row({ keys: ["flat"], impressions: 10 }), row({ keys: ["declined"], impressions: 5 })];
    const previous = [row({ keys: ["flat"], impressions: 10 }), row({ keys: ["declined"], impressions: 20 })];
    expect(computeTrendingQueries(current, previous)).toEqual([]);
  });
});
