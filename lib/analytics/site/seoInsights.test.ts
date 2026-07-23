import { describe, expect, it } from "vitest";
import { getSeoInsights } from "./seoInsights";
import { buildTestAnalysis } from "./testFixtures";

describe("getSeoInsights", () => {
  it("ranks top/lowest SEO articles by review.seo.score", () => {
    const strong = buildTestAnalysis({ article: { slug: "strong" }, seoScore: 95 });
    const weak = buildTestAnalysis({ article: { slug: "weak" }, seoScore: 15 });
    const seo = getSeoInsights([strong, weak]);
    expect(seo.topSeoArticles[0].slug).toBe("strong");
    expect(seo.lowestSeoArticles[0].slug).toBe("weak");
  });

  it("flags missing meta description / focus keyword from real Article fields", () => {
    const complete = buildTestAnalysis({ article: { slug: "complete", metaDescription: "توضیحات", focusKeyword: "کلیدواژه" } });
    const incomplete = buildTestAnalysis({ article: { slug: "incomplete", metaDescription: null, focusKeyword: null } });
    const seo = getSeoInsights([complete, incomplete]);
    expect(seo.missingMetaDescription.map((r) => r.slug)).toEqual(["incomplete"]);
    expect(seo.missingFocusKeyword.map((r) => r.slug)).toEqual(["incomplete"]);
  });

  it("reports canonical/openGraph/twitter/jsonLd status from the real boolean Article flags", () => {
    const seo = getSeoInsights([
      buildTestAnalysis({ article: { hasCanonical: true, hasOpenGraph: true, hasTwitterCard: false, hasSchema: true } }),
      buildTestAnalysis({ article: { hasCanonical: false, hasOpenGraph: false, hasTwitterCard: false, hasSchema: true } }),
    ]);
    expect(seo.canonicalStatus).toEqual({ withIt: 1, withoutIt: 1 });
    expect(seo.openGraphStatus).toEqual({ withIt: 1, withoutIt: 1 });
    expect(seo.twitterCardStatus).toEqual({ withIt: 0, withoutIt: 2 });
    expect(seo.jsonLdStatus).toEqual({ withIt: 2, withoutIt: 0 });
  });

  it("lists internal link opportunities only for articles with at least one suggestion", () => {
    const seo = getSeoInsights([
      buildTestAnalysis({ article: { slug: "has-suggestions" }, linkSuggestionCount: 3 }),
      buildTestAnalysis({ article: { slug: "no-suggestions" }, linkSuggestionCount: 0 }),
    ]);
    expect(seo.internalLinkOpportunities).toEqual([
      { slug: "has-suggestions", title: "عنوان تست", suggestionCount: 3 },
    ]);
  });

  it("flattens brokenInternalLinks per article into a flat list", () => {
    const seo = getSeoInsights([
      buildTestAnalysis({
        article: { slug: "broken" },
        brokenInternalLinks: [{ url: "/journal/missing", targetSlug: "missing" }],
      }),
    ]);
    expect(seo.brokenLinks).toEqual([
      { slug: "broken", title: "عنوان تست", url: "/journal/missing", targetSlug: "missing" },
    ]);
  });

  it("counts featuredSnippetReady/aiOverviewReady from contentQuality flags", () => {
    const seo = getSeoInsights([
      buildTestAnalysis({ featuredSnippetReady: true, aiOverviewReady: true }),
      buildTestAnalysis({ featuredSnippetReady: false, aiOverviewReady: false }),
    ]);
    expect(seo.featuredSnippetReadyCount).toBe(1);
    expect(seo.aiOverviewReadyCount).toBe(1);
  });
});
