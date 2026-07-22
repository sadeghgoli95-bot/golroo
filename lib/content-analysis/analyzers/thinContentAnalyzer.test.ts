import { describe, expect, it } from "vitest";
import { analyzeThinContent } from "./thinContentAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeThinContent", () => {
  it("scores 0 with zero word count", () => {
    expect(analyzeThinContent(buildTestArticle({ wordCount: 0 })).score).toBe(0);
  });

  it("warns (not just suggests) when content is thin (< 300 words)", () => {
    const result = analyzeThinContent(buildTestArticle({ wordCount: 150 }));
    expect(result.score).toBe(0);
    expect(result.warnings.some((w) => w.includes("کم‌عمق"))).toBe(true);
  });

  it("suggests more depth between 300 and 600 words, but still scores 100 (passes the minimum)", () => {
    const result = analyzeThinContent(buildTestArticle({ wordCount: 450 }));
    expect(result.score).toBe(100);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("has no warnings or suggestions at 600+ words", () => {
    const result = analyzeThinContent(buildTestArticle({ wordCount: 700 }));
    expect(result.score).toBe(100);
    expect(result.warnings).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
  });
});
