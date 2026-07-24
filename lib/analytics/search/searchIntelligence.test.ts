import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";

type MockedQuery = { startDate: string; endDate: string; dimensions?: string[]; rowLimit?: number };

const querySearchAnalyticsMock = vi.fn<(query: MockedQuery) => Promise<SearchAnalyticsRow[]>>();

vi.mock("@/lib/google/searchConsoleClient", () => ({
  querySearchAnalytics: (query: MockedQuery) => querySearchAnalyticsMock(query),
}));

// Every test uses a unique single-day custom range so (a) the module's internal cache never collides across tests and (b) the weekly-growth-trend bucketing produces exactly one bucket, identical to the range itself.
let rangeCounter = 0;
function uniqueSingleDayRange() {
  rangeCounter += 1;
  const day = `2021-0${(rangeCounter % 9) + 1}-01`;
  return { preset: "custom" as const, start: day, end: day };
}

function row(overrides: Partial<SearchAnalyticsRow> = {}): SearchAnalyticsRow {
  return { keys: [], clicks: 1, impressions: 10, ctr: 0.1, position: 8, ...overrides };
}

/** Builds a mock implementation given fixed row sets per dimension combination; totals/current vs previous are distinguished by comparing startDate to the range's own start date. */
function buildMockImplementation(options: {
  rangeStart: string;
  totalsCurrent?: SearchAnalyticsRow[];
  totalsPrevious?: SearchAnalyticsRow[];
  queryRowsCurrent?: SearchAnalyticsRow[];
  queryRowsPrevious?: SearchAnalyticsRow[];
  pageRows?: SearchAnalyticsRow[];
  combinedRows?: SearchAnalyticsRow[];
  countryRows?: SearchAnalyticsRow[];
  deviceRows?: SearchAnalyticsRow[];
  appearanceRows?: SearchAnalyticsRow[];
  dateRows?: SearchAnalyticsRow[];
}) {
  return async (query: MockedQuery): Promise<SearchAnalyticsRow[]> => {
    const dims = query.dimensions?.join(",");
    const isCurrent = query.startDate >= options.rangeStart;

    if (!dims) return isCurrent ? options.totalsCurrent ?? [] : options.totalsPrevious ?? [];
    if (dims === "query") return isCurrent ? options.queryRowsCurrent ?? [] : options.queryRowsPrevious ?? [];
    if (dims === "page") return options.pageRows ?? [];
    if (dims === "query,page") return options.combinedRows ?? [];
    if (dims === "country") return options.countryRows ?? [];
    if (dims === "device") return options.deviceRows ?? [];
    if (dims === "searchAppearance") return options.appearanceRows ?? [];
    if (dims === "date") return options.dateRows ?? [];
    return [];
  };
}

describe("searchIntelligenceAdapter", () => {
  beforeEach(() => {
    querySearchAnalyticsMock.mockReset();
  });

  it(
    "returns 0-value totals and empty lists (not a crash) when GSC returns no rows at all",
    async () => {
      // First test in the file pays the cold dynamic-import cost for the whole module graph (comparison, dateRange, cache, brandTerms, intentClassifier, queryDiff, cannibalization) — given a longer timeout than the default 5s for that reason alone, same as this suite's other slow first-import tests.
      const { searchIntelligenceAdapter } = await import("./searchIntelligence");
      querySearchAnalyticsMock.mockResolvedValue([]);

      const metrics = await searchIntelligenceAdapter.getMetrics(uniqueSingleDayRange());
      expect(metrics.clicks.current).toBe(0);
      expect(metrics.topQueries).toEqual([]);
      expect(metrics.queryCannibalization).toEqual([]);
      expect(metrics.insights).toEqual([]);
    },
    15000
  );

  it("computes winning/losing/new/lost/trending queries from the current vs previous query lists", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        queryRowsCurrent: [
          row({ keys: ["winner"], clicks: 20, impressions: 100 }),
          row({ keys: ["brand-new-query"], clicks: 4, impressions: 10 }),
        ],
        queryRowsPrevious: [row({ keys: ["winner"], clicks: 5, impressions: 20 }), row({ keys: ["gone-query"], clicks: 9, impressions: 30 })],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    expect(metrics.winningKeywords.map((q) => q.query)).toContain("winner");
    expect(metrics.newQueries.map((q) => q.query)).toEqual(["brand-new-query"]);
    expect(metrics.lostQueries.map((q) => q.query)).toEqual(["gone-query"]);
    expect(metrics.trendingQueries.map((q) => q.query)).toContain("winner");
  });

  it("flags near-top-10 pages, high-impression/low-CTR pages, and high-CTR/low-impression hidden gems", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        pageRows: [
          row({ keys: ["/near"], position: 14, impressions: 20, ctr: 0.05 }),
          row({ keys: ["/low-ctr"], position: 5, impressions: 200, ctr: 0.005 }),
          row({ keys: ["/gem"], position: 6, impressions: 10, ctr: 0.5 }),
        ],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    expect(metrics.pagesNearTop10.map((p) => p.page)).toEqual(["/near"]);
    expect(metrics.highImpressionLowCtrPages.map((p) => p.page)).toEqual(["/low-ctr"]);
    expect(metrics.highCtrLowImpressionPages.map((p) => p.page)).toContain("/gem");
  });

  it("detects query and page cannibalization from the combined query+page dataset", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        combinedRows: [
          row({ keys: ["shared-query", "/a"], impressions: 40, clicks: 5 }),
          row({ keys: ["shared-query", "/b"], impressions: 30, clicks: 3 }),
        ],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    expect(metrics.queryCannibalization.map((c) => c.query)).toEqual(["shared-query"]);
  });

  it("classifies brand vs non-brand queries and computes brandClicksShare using the real site brand terms", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        queryRowsCurrent: [row({ keys: ["میرورا نظرات"], clicks: 8 }), row({ keys: ["اضطراب کودک"], clicks: 2 })],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    expect(metrics.brandQueries.map((q) => q.query)).toContain("میرورا نظرات");
    expect(metrics.nonBrandQueries.map((q) => q.query)).toContain("اضطراب کودک");
    expect(metrics.brandClicksShare).toBeCloseTo(0.8);
  });

  it("builds an intent breakdown from the rule-based classifier over the real query list", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        queryRowsCurrent: [row({ keys: ["اضطراب کودک چیست"], clicks: 3 }), row({ keys: ["قیمت مشاوره"], clicks: 2 })],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    const intents = metrics.intentBreakdown.map((i) => i.intent);
    expect(intents).toContain("informational");
    expect(intents).toContain("transactional");
  });

  it("builds country/device/searchAppearance breakdowns from their respective GSC dimensions", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        countryRows: [row({ keys: ["irn"], clicks: 10 })],
        deviceRows: [row({ keys: ["MOBILE"], clicks: 7 })],
        appearanceRows: [row({ keys: ["AMP_BLUE_LINK"], clicks: 1 })],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    expect(metrics.countryBreakdown.map((c) => c.label)).toEqual(["irn"]);
    expect(metrics.deviceBreakdown.map((d) => d.label)).toEqual(["MOBILE"]);
    expect(metrics.searchAppearanceBreakdown.map((a) => a.label)).toEqual(["AMP_BLUE_LINK"]);
  });

  it("builds click/impression/ctr/position trend points from the date dimension", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        dateRows: [row({ keys: [range.start], clicks: 12, impressions: 200 })],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    expect(metrics.clicksTrend).toEqual([{ label: range.start, value: 12 }]);
    expect(metrics.impressionsTrend).toEqual([{ label: range.start, value: 200 }]);
  });

  it("generates real, data-derived insights when an opportunity signal exists", async () => {
    const range = uniqueSingleDayRange();
    const { searchIntelligenceAdapter } = await import("./searchIntelligence");

    querySearchAnalyticsMock.mockImplementation(
      buildMockImplementation({
        rangeStart: range.start,
        pageRows: [row({ keys: ["/big-opportunity"], impressions: 500, ctr: 0.001 })],
      })
    );

    const metrics = await searchIntelligenceAdapter.getMetrics(range);
    const opportunityInsight = metrics.insights.find((i) => i.id === "biggest-opportunity");
    expect(opportunityInsight?.message).toContain("/big-opportunity");
  });
});
