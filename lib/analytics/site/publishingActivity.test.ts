import { describe, expect, it } from "vitest";
import { getPublishingActivity, getPublishingTrendByMonth, getCategoryGrowthByMonth, getArticlesNeedingUpdate } from "./publishingActivity";
import { buildTestAnalysis } from "./testFixtures";

const NOW = new Date("2026-07-23T00:00:00.000Z");

describe("getPublishingActivity", () => {
  it("counts real publishedAt dates within 7/30/90-day windows, from actual timestamps only", () => {
    const activity = getPublishingActivity(
      [
        buildTestAnalysis({ article: { publishedAt: "2026-07-20T00:00:00.000Z" } }), // 3 days ago
        buildTestAnalysis({ article: { publishedAt: "2026-07-01T00:00:00.000Z" } }), // 22 days ago
        buildTestAnalysis({ article: { publishedAt: "2026-05-01T00:00:00.000Z" } }), // ~83 days ago
        buildTestAnalysis({ article: { publishedAt: "2025-01-01T00:00:00.000Z" } }), // outside all windows
        buildTestAnalysis({ article: { publishedAt: null } }),
      ],
      NOW
    );
    expect(activity.last7Days).toBe(1);
    expect(activity.last30Days).toBe(2);
    expect(activity.last90Days).toBe(3);
    expect(activity.allTime).toBe(4);
  });

  it("returns all zeros for a corpus with no publishedAt dates, not NaN", () => {
    const activity = getPublishingActivity([buildTestAnalysis({ article: { publishedAt: null } })], NOW);
    expect(activity).toEqual({ last7Days: 0, last30Days: 0, last90Days: 0, allTime: 0 });
  });
});

describe("getPublishingTrendByMonth", () => {
  it("groups real publishedAt dates by year-month", () => {
    const trend = getPublishingTrendByMonth([
      buildTestAnalysis({ article: { publishedAt: "2026-06-05T00:00:00.000Z" } }),
      buildTestAnalysis({ article: { publishedAt: "2026-06-20T00:00:00.000Z" } }),
      buildTestAnalysis({ article: { publishedAt: "2026-07-01T00:00:00.000Z" } }),
    ]);
    expect(trend).toEqual([
      { label: "2026-06", count: 2 },
      { label: "2026-07", count: 1 },
    ]);
  });
});

describe("getCategoryGrowthByMonth", () => {
  it("groups by month and category together, only for articles with both a publishedAt and a category", () => {
    const growth = getCategoryGrowthByMonth([
      buildTestAnalysis({ article: { publishedAt: "2026-06-05T00:00:00.000Z", category: "روان‌شناسی" } }),
      buildTestAnalysis({ article: { publishedAt: "2026-06-10T00:00:00.000Z", category: null } }),
    ]);
    expect(growth).toEqual([{ label: "2026-06 — روان‌شناسی", count: 1 }]);
  });
});

describe("getArticlesNeedingUpdate", () => {
  it("uses lastUpdated over publishedAt when both exist", () => {
    const items = getArticlesNeedingUpdate(
      [
        buildTestAnalysis({
          article: { isPublished: true, lastUpdated: "2026-07-01T00:00:00.000Z", publishedAt: "2020-01-01T00:00:00.000Z" },
        }),
      ],
      NOW
    );
    expect(items).toEqual([]);
  });

  it("treats a published article with no date at all as needing an update (honest — never assumed fresh)", () => {
    const items = getArticlesNeedingUpdate(
      [buildTestAnalysis({ article: { isPublished: true, lastUpdated: null, publishedAt: null } })],
      NOW
    );
    expect(items).toHaveLength(1);
  });
});
