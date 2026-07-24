import { describe, expect, it, vi, beforeEach } from "vitest";

const getSiteAnalysisMock = vi.fn();
const getExecutiveOverviewMock = vi.fn();
const gscGetMetricsMock = vi.fn();
const ga4GetMetricsMock = vi.fn();
const createSnapshotMock = vi.fn();

vi.mock("@/lib/article/repositories", () => ({ createArticleRepository: () => ({}) }));
vi.mock("@/lib/analytics/site/getSiteAnalysis", () => ({ getSiteAnalysis: () => getSiteAnalysisMock() }));
vi.mock("../site/executiveOverview", () => ({ getExecutiveOverview: () => getExecutiveOverviewMock() }));
vi.mock("../search/googleSearchConsoleAdapter", () => ({
  googleSearchConsoleAdapter: { providerId: "google-search-console", getMetrics: () => gscGetMetricsMock() },
}));
vi.mock("../traffic/googleAnalyticsAdapter", () => ({
  googleAnalyticsAdapter: { providerId: "google-analytics-4", getMetrics: () => ga4GetMetricsMock() },
}));
vi.mock("./SnapshotRepository", () => ({ createSnapshot: (snapshot: unknown) => createSnapshotMock(snapshot) }));

function baseOverview() {
  return {
    siteHealthScore: 70,
    avgSeoScore: 75,
    avgAeoScore: 65,
    avgGeoScore: 60,
    totalArticles: 12,
    publishedArticles: 10,
    draftArticles: 2,
    readyToPublish: 3,
    criticalIssuesCount: 4,
    topRecommendations: [],
  };
}

describe("captureSnapshot", () => {
  beforeEach(() => {
    getSiteAnalysisMock.mockReset().mockResolvedValue([
      { review: { contentQuality: { suggestions: { recommended: ["a", "b"] } } } },
      { review: { contentQuality: { suggestions: { recommended: ["c"] } } } },
    ]);
    getExecutiveOverviewMock.mockReset().mockReturnValue(baseOverview());
    createSnapshotMock.mockReset().mockResolvedValue({ id: "snap-1" });
  });

  it("assembles a snapshot from internal scores plus real GSC/GA4 totals", async () => {
    gscGetMetricsMock.mockReset().mockResolvedValue({
      clicks: { current: 42, previousPeriod: null, previousYear: null },
      impressions: { current: 500, previousPeriod: null, previousYear: null },
      ctr: { current: 0.08, previousPeriod: null, previousYear: null },
      averagePosition: { current: 12.5, previousPeriod: null, previousYear: null },
    });
    ga4GetMetricsMock.mockReset().mockResolvedValue({
      users: { current: 30, previousPeriod: null, previousYear: null },
      sessions: { current: 45, previousPeriod: null, previousYear: null },
      engagementRate: { current: 0.6, previousPeriod: null, previousYear: null },
    });

    const { captureSnapshot } = await import("./captureSnapshot");
    const { snapshot, errors } = await captureSnapshot();

    expect(errors).toEqual([]);
    expect(snapshot.seoScore).toBe(75);
    expect(snapshot.healthScore).toBe(70);
    expect(snapshot.clicks).toBe(42);
    expect(snapshot.users).toBe(30);
    expect(snapshot.publishedArticles).toBe(10);
    expect(snapshot.criticalIssues).toBe(4);
    expect(snapshot.warnings).toBe(3); // 2 + 1 recommended suggestions summed across articles
    expect(createSnapshotMock).toHaveBeenCalledWith(snapshot);
  });

  it("stores null (not a fabricated 0) for GSC/GA4 fields when a provider call fails, and reports the error", async () => {
    gscGetMetricsMock.mockReset().mockRejectedValue(new Error("GSC unavailable"));
    ga4GetMetricsMock.mockReset().mockResolvedValue({
      users: { current: 10, previousPeriod: null, previousYear: null },
      sessions: { current: 20, previousPeriod: null, previousYear: null },
      engagementRate: { current: 0.4, previousPeriod: null, previousYear: null },
    });

    const { captureSnapshot } = await import("./captureSnapshot");
    const { snapshot, errors } = await captureSnapshot();

    expect(snapshot.clicks).toBeNull();
    expect(snapshot.impressions).toBeNull();
    expect(snapshot.users).toBe(10);
    expect(errors.some((e) => e.includes("GSC unavailable"))).toBe(true);
  });

  it("still captures a snapshot (internal scores only) when both GSC and GA4 fail", async () => {
    gscGetMetricsMock.mockReset().mockRejectedValue(new Error("no gsc"));
    ga4GetMetricsMock.mockReset().mockRejectedValue(new Error("no ga4"));

    const { captureSnapshot } = await import("./captureSnapshot");
    const { snapshot, errors } = await captureSnapshot();

    expect(snapshot.seoScore).toBe(75);
    expect(snapshot.clicks).toBeNull();
    expect(snapshot.users).toBeNull();
    expect(errors).toHaveLength(2);
    expect(createSnapshotMock).toHaveBeenCalled();
  });
});
