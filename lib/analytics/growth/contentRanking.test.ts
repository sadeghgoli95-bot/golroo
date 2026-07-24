import { describe, it, expect } from "vitest";
import { getContentPerformanceRanking } from "./contentRanking";
import { buildTestAnalysis } from "../site/testFixtures";

describe("getContentPerformanceRanking", () => {
  it("ranks published articles higher when real seo/clicks/sessions percentiles are higher", () => {
    const strong = buildTestAnalysis({ article: { slug: "strong", isPublished: true }, seoScore: 90 });
    const weak = buildTestAnalysis({ article: { slug: "weak", isPublished: true }, seoScore: 20 });

    const ranking = getContentPerformanceRanking([strong, weak], null, null);
    expect(ranking[0].slug).toBe("strong");
    expect(ranking[0].performanceScore).toBeGreaterThan(ranking[1].performanceScore);
  });

  it("excludes unpublished articles from the ranking", () => {
    const draft = buildTestAnalysis({ article: { slug: "draft", isPublished: false } });
    expect(getContentPerformanceRanking([draft], null, null)).toHaveLength(0);
  });

  it("treats an unobserved page as 0 for the clicks/sessions percentile rather than crashing", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a", isPublished: true } });
    const ranking = getContentPerformanceRanking([analysis], null, null);
    expect(ranking[0].clicks).toBeNull();
    expect(Number.isFinite(ranking[0].performanceScore)).toBe(true);
  });
});
