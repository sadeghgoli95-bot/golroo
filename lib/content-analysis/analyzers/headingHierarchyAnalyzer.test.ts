import { describe, expect, it } from "vitest";
import { analyzeHeadingHierarchy } from "./headingHierarchyAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeHeadingHierarchy", () => {
  it("scores 0 with no headings", () => {
    const result = analyzeHeadingHierarchy(buildTestArticle({ headings: [] }));
    expect(result.score).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("passes with a single H1 and no skipped levels", () => {
    const article = buildTestArticle({
      headings: [
        { level: 1, text: "مقدمه", slug: "moghadameh" },
        { level: 2, text: "علائم", slug: "alaem" },
        { level: 3, text: "درمان", slug: "darman" },
      ],
    });
    const result = analyzeHeadingHierarchy(article);
    expect(result.score).toBe(100);
    expect(result.warnings).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
  });

  it("warns when there is more than one H1", () => {
    const article = buildTestArticle({
      headings: [
        { level: 1, text: "مقدمه", slug: "a" },
        { level: 1, text: "بخش دوم", slug: "b" },
      ],
    });
    const result = analyzeHeadingHierarchy(article);
    expect(result.warnings.some((w) => w.includes("H1"))).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it("flags a skipped heading level (H2 straight to H4)", () => {
    const article = buildTestArticle({
      headings: [
        { level: 2, text: "علائم", slug: "a" },
        { level: 4, text: "زیربخش", slug: "b" },
      ],
    });
    const result = analyzeHeadingHierarchy(article);
    expect(result.suggestions.some((s) => s.includes("H2") && s.includes("H4"))).toBe(true);
    expect(result.score).toBeLessThan(100);
  });
});
