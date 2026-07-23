import { describe, expect, it } from "vitest";
import { getContentAnalytics } from "./contentAnalytics";
import { buildTestAnalysis } from "./testFixtures";

describe("getContentAnalytics", () => {
  it("ranks bestArticles/worstArticles by contentQuality.scores.content, not any other score", () => {
    const strong = buildTestAnalysis({ article: { slug: "strong", title: "قوی" }, contentScore: 95 });
    const weak = buildTestAnalysis({ article: { slug: "weak", title: "ضعیف" }, contentScore: 20 });
    const content = getContentAnalytics([strong, weak]);
    expect(content.bestArticles[0].slug).toBe("strong");
    expect(content.worstArticles[0].slug).toBe("weak");
  });

  it("flags thin content when contentDepth score is below 50", () => {
    const thin = buildTestAnalysis({ article: { slug: "thin" }, contentDepthScore: 30 });
    const deep = buildTestAnalysis({ article: { slug: "deep" }, contentDepthScore: 80 });
    const content = getContentAnalytics([thin, deep]);
    expect(content.thinContent.map((row) => row.slug)).toEqual(["thin"]);
  });

  it("flags missing FAQ/sources/images/alt text from real Article fields, not inferred", () => {
    const complete = buildTestAnalysis({
      article: { slug: "complete", hasFaq: true, sources: [{ doi: "10.1/x", pmid: null, url: null, author: null, journal: null, year: null, title: "منبع" }], hasFeaturedImage: true, imageAltTexts: ["توضیح"] },
    });
    const incomplete = buildTestAnalysis({
      article: { slug: "incomplete", hasFaq: false, sources: [], hasFeaturedImage: false, imageAltTexts: [] },
    });
    const content = getContentAnalytics([complete, incomplete]);
    expect(content.missingFaq.map((r) => r.slug)).toEqual(["incomplete"]);
    expect(content.missingSources.map((r) => r.slug)).toEqual(["incomplete"]);
    expect(content.missingImages.map((r) => r.slug)).toEqual(["incomplete"]);
    expect(content.missingAltText.map((r) => r.slug)).toEqual(["incomplete"]);
  });

  it("buckets reading time into the fixed ranges", () => {
    const content = getContentAnalytics([
      buildTestAnalysis({ article: { readingTime: 2 } }),
      buildTestAnalysis({ article: { readingTime: 10 } }),
    ]);
    const shortBucket = content.readingTimeDistribution.find((b) => b.label === "کمتر از ۳ دقیقه");
    const longBucket = content.readingTimeDistribution.find((b) => b.label === "۸ تا ۱۲ دقیقه");
    expect(shortBucket?.count).toBe(1);
    expect(longBucket?.count).toBe(1);
  });

  it("counts topic/category/tag distributions from real article fields", () => {
    const content = getContentAnalytics([
      buildTestAnalysis({ article: { topic: "اضطراب", category: "روان‌شناسی", tags: ["کودک", "خانواده"] } }),
      buildTestAnalysis({ article: { topic: "اضطراب", category: "روان‌شناسی", tags: ["کودک"] } }),
    ]);
    expect(content.topicDistribution).toEqual([{ label: "اضطراب", count: 2 }]);
    expect(content.tagDistribution).toEqual([
      { label: "کودک", count: 2 },
      { label: "خانواده", count: 1 },
    ]);
  });
});
