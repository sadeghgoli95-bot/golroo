import { describe, expect, it } from "vitest";
import { analyzeImages } from "./imageAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeImages", () => {
  it("scores 100 and only warns (never fails) when there is no featured image", () => {
    const result = analyzeImages(buildTestArticle({ hasFeaturedImage: false, imageAltTexts: [] }));
    expect(result.score).toBe(100);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("does not validate alt text at all when there is no image", () => {
    const result = analyzeImages(buildTestArticle({ hasFeaturedImage: false, imageAltTexts: [] }));
    expect(result.suggestions).toHaveLength(0);
  });

  it("scores 100 when an image exists and has alt text", () => {
    const result = analyzeImages(buildTestArticle({ hasFeaturedImage: true, imageAltTexts: ["توضیح تصویر"] }));
    expect(result.score).toBe(100);
    expect(result.warnings).toHaveLength(0);
  });

  it("suggests (not warns) when an image exists but alt text is missing", () => {
    const result = analyzeImages(buildTestArticle({ hasFeaturedImage: true, imageAltTexts: [] }));
    expect(result.score).toBe(0);
    expect(result.suggestions.some((s) => s.includes("Alt Text"))).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });
});
