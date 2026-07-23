import { describe, expect, it } from "vitest";
import { getExecutiveOverview } from "./executiveOverview";
import { buildTestAnalysis } from "./testFixtures";

describe("getExecutiveOverview", () => {
  it("averages siteHealthScore/seo/aeo/geo across the corpus using the same detailedScores.overall field the dashboard homepage already shows", () => {
    const overview = getExecutiveOverview([
      buildTestAnalysis({ overallScore: 80, seoScore: 90 }),
      buildTestAnalysis({ overallScore: 60, seoScore: 70 }),
    ]);
    expect(overview.siteHealthScore).toBe(70);
    expect(overview.avgSeoScore).toBe(80);
  });

  it("counts published vs draft articles from article.isPublished", () => {
    const overview = getExecutiveOverview([
      buildTestAnalysis({ article: { isPublished: true } }),
      buildTestAnalysis({ article: { isPublished: false } }),
      buildTestAnalysis({ article: { isPublished: false } }),
    ]);
    expect(overview.totalArticles).toBe(3);
    expect(overview.publishedArticles).toBe(1);
    expect(overview.draftArticles).toBe(2);
  });

  it("counts readyToPublish from publishReadiness.status === 'ready' only", () => {
    const overview = getExecutiveOverview([
      buildTestAnalysis({ publishStatus: "ready" }),
      buildTestAnalysis({ publishStatus: "almost_ready" }),
      buildTestAnalysis({ publishStatus: "blocked" }),
    ]);
    expect(overview.readyToPublish).toBe(1);
  });

  it("sums critical suggestion counts across every article", () => {
    const overview = getExecutiveOverview([
      buildTestAnalysis({ criticalSuggestions: ["a", "b"] }),
      buildTestAnalysis({ criticalSuggestions: ["c"] }),
    ]);
    expect(overview.criticalIssuesCount).toBe(3);
  });

  it("ranks recommendations by how many articles share them, most frequent first", () => {
    const overview = getExecutiveOverview([
      buildTestAnalysis({ recommendedSuggestions: ["افزودن منبع"] }),
      buildTestAnalysis({ recommendedSuggestions: ["افزودن منبع", "کوتاه کردن پاراگراف"] }),
    ]);
    expect(overview.topRecommendations[0]).toBe("افزودن منبع");
  });

  it("returns 0 scores and empty lists for an empty corpus, never NaN or throwing", () => {
    const overview = getExecutiveOverview([]);
    expect(overview.siteHealthScore).toBe(0);
    expect(overview.totalArticles).toBe(0);
    expect(overview.topRecommendations).toEqual([]);
  });
});
