import { describe, expect, it } from "vitest";
import { analyzePublishReadiness } from "./publishAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzePublishReadiness — regression fixes", () => {
  it("does not penalize a missing featured image (image selection is a manual Sanity Studio step)", () => {
    const complete = buildTestArticle({
      title: "عنوان",
      metaDescription: "توضیحات",
      slug: "x",
      keywords: ["کلیدواژه"],
      body: "متن",
      sources: [{ doi: "10.1/x", pmid: null, url: null, author: null, journal: null, year: null, title: null }],
      hasFaq: true,
      hasSchema: true,
      hasCanonical: true,
      hasFeaturedImage: false,
    });
    const result = analyzePublishReadiness(complete);
    expect(result.warnings.some((w) => w.includes("Alt Text"))).toBe(false);
    expect(result.score).toBe(100);
  });

  it("skips the internal-link checklist item entirely when no count is provided, rather than always failing it", () => {
    const article = buildTestArticle({ internalLinkCount: 0 });
    const result = analyzePublishReadiness(article);
    expect(result.warnings.some((w) => w.includes("لینک داخلی"))).toBe(false);
  });

  it("scores the internal-link checklist item for real when a count is provided", () => {
    const complete = buildTestArticle({
      title: "عنوان",
      metaDescription: "توضیحات",
      slug: "x",
      keywords: ["کلیدواژه"],
      body: "متن",
      sources: [{ doi: "10.1/x", pmid: null, url: null, author: null, journal: null, year: null, title: null }],
      hasFaq: true,
      hasSchema: true,
      hasCanonical: true,
      hasFeaturedImage: true,
      imageAltTexts: ["توضیح تصویر"],
    });
    const withoutLinks = analyzePublishReadiness(complete, 0);
    const withLinks = analyzePublishReadiness(complete, 3);
    expect(withLinks.score).toBeGreaterThan(withoutLinks.score);
  });
});
