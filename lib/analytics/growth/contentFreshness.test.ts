import { describe, it, expect } from "vitest";
import { getArticlesNeedingUpdate, getArticlesReadyToRepublish, STALE_DAYS_THRESHOLD } from "./contentFreshness";
import { buildTestAnalysis } from "../site/testFixtures";

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

describe("getArticlesNeedingUpdate", () => {
  it("flags only published articles that are both stale by real date AND in the real losing-visibility set", () => {
    const stale = buildTestAnalysis({ article: { slug: "stale", isPublished: true, lastUpdated: daysAgoIso(STALE_DAYS_THRESHOLD + 10) } });
    const fresh = buildTestAnalysis({ article: { slug: "fresh", isPublished: true, lastUpdated: daysAgoIso(5) } });
    const draft = buildTestAnalysis({ article: { slug: "draft", isPublished: false, lastUpdated: daysAgoIso(400) } });

    const result = getArticlesNeedingUpdate([stale, fresh, draft], new Set(["stale", "fresh", "draft"]));
    expect(result.map((r) => r.slug)).toEqual(["stale"]);
  });

  it("does not flag a stale article that isn't declining in real search clicks", () => {
    const stale = buildTestAnalysis({ article: { slug: "stale", isPublished: true, lastUpdated: daysAgoIso(400) } });
    expect(getArticlesNeedingUpdate([stale], new Set())).toHaveLength(0);
  });
});

describe("getArticlesReadyToRepublish", () => {
  it("flags ready drafts", () => {
    const draft = buildTestAnalysis({ article: { slug: "d", isPublished: false }, publishStatus: "ready" });
    const result = getArticlesReadyToRepublish([draft], new Set(), new Set());
    expect(result).toEqual([{ slug: "d", title: "عنوان تست", reason: "draft_ready", detail: expect.any(String) }]);
  });

  it("flags published articles with real opportunity or high-impression-low-ctr signal", () => {
    const published = buildTestAnalysis({ article: { slug: "p", isPublished: true } });
    const result = getArticlesReadyToRepublish([published], new Set(["p"]), new Set());
    expect(result[0].reason).toBe("published_high_opportunity");
  });

  it("does not flag an ordinary published article with no real signal", () => {
    const published = buildTestAnalysis({ article: { slug: "p", isPublished: true } });
    expect(getArticlesReadyToRepublish([published], new Set(), new Set())).toHaveLength(0);
  });
});
