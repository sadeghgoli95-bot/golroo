import { describe, expect, it } from "vitest";
import { analyzeParagraphLength } from "./paragraphLengthAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeParagraphLength", () => {
  it("scores 0 when there is no body", () => {
    expect(analyzeParagraphLength(buildTestArticle({ body: null })).score).toBe(0);
  });

  it("scores 100 when all paragraphs are within the limit", () => {
    const body = "# مقدمه\n\nیک پاراگراف کوتاه و معقول.";
    expect(analyzeParagraphLength(buildTestArticle({ body })).score).toBe(100);
  });

  it("suggests shortening a paragraph over 150 words", () => {
    const longParagraph = Array.from({ length: 160 }, (_, i) => `کلمه${i}`).join(" ");
    const body = `# مقدمه\n\n${longParagraph}`;
    const result = analyzeParagraphLength(buildTestArticle({ body }));
    expect(result.score).toBeLessThan(100);
    expect(result.suggestions.some((s) => s.includes("طولانی"))).toBe(true);
  });
});
