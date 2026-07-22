import { describe, expect, it } from "vitest";
import { analyzeTopicCoverage } from "./topicCoverageAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeTopicCoverage", () => {
  it("scores 0 with no headings", () => {
    expect(analyzeTopicCoverage(buildTestArticle({ headings: [] })).score).toBe(0);
  });

  it("scores 0 when there is no focus keyword/topic/secondary keywords to check coverage against", () => {
    const article = buildTestArticle({
      focusKeyword: null,
      topic: null,
      secondaryKeywords: [],
      headings: [{ level: 2, text: "یک تیتر", slug: "a" }],
    });
    expect(analyzeTopicCoverage(article).score).toBe(0);
  });

  it("scores 100 when every heading relates to the focus keyword", () => {
    const article = buildTestArticle({
      focusKeyword: "اضطراب کودکان",
      headings: [
        { level: 2, text: "علائم اضطراب کودکان", slug: "a" },
        { level: 2, text: "درمان اضطراب در کودکان", slug: "b" },
      ],
    });
    expect(analyzeTopicCoverage(article).score).toBe(100);
  });

  it("scores low and suggests improvement when headings are unrelated to the topic", () => {
    const article = buildTestArticle({
      focusKeyword: "اضطراب کودکان",
      headings: [
        { level: 2, text: "دستور پخت غذا", slug: "a" },
        { level: 2, text: "تعمیر خودرو", slug: "b" },
      ],
    });
    const result = analyzeTopicCoverage(article);
    expect(result.score).toBe(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });
});
