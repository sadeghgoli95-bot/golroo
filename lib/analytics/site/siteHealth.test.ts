import { describe, expect, it } from "vitest";
import { getSiteHealth } from "./siteHealth";
import { buildTestAnalysis } from "./testFixtures";

describe("getSiteHealth", () => {
  it("computes healthScore as the average of detailedScores.overall — the same field the dashboard homepage already uses", () => {
    const health = getSiteHealth([buildTestAnalysis({ overallScore: 80 }), buildTestAnalysis({ overallScore: 60 })]);
    expect(health.healthScore).toBe(70);
  });

  it("finds duplicate slugs across the corpus", () => {
    const health = getSiteHealth([
      buildTestAnalysis({ article: { slug: "same" } }),
      buildTestAnalysis({ article: { slug: "same" } }),
      buildTestAnalysis({ article: { slug: "unique" } }),
    ]);
    expect(health.duplicateSlugs).toEqual([{ value: "same", slugs: ["same", "same"] }]);
  });

  it("sums brokenInternalLinks across every article", () => {
    const health = getSiteHealth([
      buildTestAnalysis({ brokenInternalLinks: [{ url: "/journal/a", targetSlug: "a" }] }),
      buildTestAnalysis({ brokenInternalLinks: [{ url: "/journal/b", targetSlug: "b" }, { url: "/journal/c", targetSlug: "c" }] }),
    ]);
    expect(health.brokenInternalLinksCount).toBe(3);
  });

  it("flags a published article as orphan when no other article's body links to it", () => {
    const linked = buildTestAnalysis({ article: { slug: "linked", isPublished: true } });
    const orphan = buildTestAnalysis({ article: { slug: "orphan", isPublished: true } });
    const linker = buildTestAnalysis({
      article: { slug: "linker", isPublished: true, body: "بیشتر بخوانید: [مقاله](/journal/linked)" },
    });
    const health = getSiteHealth([linked, orphan, linker]);
    expect(health.orphanArticles.map((row) => row.slug)).toContain("orphan");
    expect(health.orphanArticles.map((row) => row.slug)).not.toContain("linked");
  });

  it("does not flag draft articles as orphan (they are not expected to be linked yet)", () => {
    const draft = buildTestAnalysis({ article: { slug: "draft-article", isPublished: false } });
    const health = getSiteHealth([draft]);
    expect(health.orphanArticles).toEqual([]);
  });

  it("flags a published article as needing an update when its last known date is older than 6 months", () => {
    const now = new Date("2026-07-01T00:00:00.000Z");
    const stale = buildTestAnalysis({
      article: { slug: "stale", isPublished: true, lastUpdated: null, publishedAt: "2025-01-01T00:00:00.000Z" },
    });
    const fresh = buildTestAnalysis({
      article: { slug: "fresh", isPublished: true, lastUpdated: "2026-06-01T00:00:00.000Z", publishedAt: "2024-01-01T00:00:00.000Z" },
    });
    const health = getSiteHealth([stale, fresh], now);
    expect(health.articlesNeedingUpdate.map((row) => row.slug)).toEqual(["stale"]);
  });
});
