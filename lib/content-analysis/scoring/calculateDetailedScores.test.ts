import { describe, expect, it } from "vitest";
import { calculateDetailedScores } from "./calculateDetailedScores";
import { buildTestArticle } from "../testFixtures";

describe("calculateDetailedScores — regression fixes", () => {
  it("does not penalize a book source for lacking a DOI (authority score no longer hand-rolls the DOI-for-every-source check)", () => {
    const bookSource = { doi: null, pmid: null, url: null, author: "نویسنده", journal: "انتشارات", year: "2020", title: "کتاب" };
    const article = buildTestArticle({
      authorName: "صادق گل‌رو",
      sources: [bookSource, bookSource, bookSource],
    });
    const scores = calculateDetailedScores(article, 0);
    expect(scores.authority).toBeGreaterThan(0);
  });

  it("uses the real internalLinkSuggestionCount parameter instead of the always-zero article.internalLinkCount field", () => {
    const article = buildTestArticle({ internalLinkCount: 0 });
    const withNoSuggestions = calculateDetailedScores(article, 0);
    const withSuggestions = calculateDetailedScores(article, 3);
    expect(withSuggestions.internalLinking).toBeGreaterThan(withNoSuggestions.internalLinking);
  });

  it("delegates the structure score to calculateContentScore (real signals) instead of the retired legacy-field structureAnalyzer", () => {
    const article = buildTestArticle({ body: null, wordCount: 0, importantPoints: [], finalQuestion: null });
    const scores = calculateDetailedScores(article, 0);
    expect(typeof scores.structure).toBe("number");
  });

  it("computes a real overall weighted score", () => {
    const article = buildTestArticle({ title: "عنوان", slug: "x", authorName: "صادق گل‌رو" });
    const scores = calculateDetailedScores(article, 2);
    expect(scores.overall).toBeGreaterThanOrEqual(0);
    expect(scores.overall).toBeLessThanOrEqual(100);
  });
});
