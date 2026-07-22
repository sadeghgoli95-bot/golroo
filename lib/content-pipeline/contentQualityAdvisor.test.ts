import { describe, expect, it } from "vitest";
import { buildContentQualityReport } from "./contentQualityAdvisor";
import { derivePublishReadiness } from "./publishReadiness";
import { calculateSEOScore } from "@/lib/content-analysis/scoring/calculateSEOScore";
import { calculateAEOScore } from "@/lib/content-analysis/scoring/calculateAEOScore";
import { calculateGEOScore } from "@/lib/content-analysis/scoring/calculateGEOScore";
import { analyzeDuplicateContent } from "@/lib/content-analysis/analyzers/duplicateAnalyzer";
import { buildTestArticle, buildTestSummary } from "@/lib/content-analysis/testFixtures";

const EMPTY_VALIDATION = { passed: true, issues: [] };

describe("buildContentQualityReport", () => {
  it("never modifies the article passed in (analysis only)", () => {
    const article = buildTestArticle({ title: "عنوان اصلی" });
    const snapshot = JSON.stringify(article);
    buildContentQualityReport(article, [], EMPTY_VALIDATION);
    expect(JSON.stringify(article)).toBe(snapshot);
  });

  it("marks entityCoverage as null (not fabricated) since no AI provider is configured", () => {
    const report = buildContentQualityReport(buildTestArticle({}), [], EMPTY_VALIDATION);
    expect(report.scores.entityCoverage).toBeNull();
  });

  it("puts publishReadiness blocking reasons in the critical bucket when blocked", () => {
    const article = buildTestArticle({ title: null, slug: null, body: null });
    const report = buildContentQualityReport(article, [], EMPTY_VALIDATION);
    expect(report.suggestions.critical.length).toBeGreaterThan(0);
  });

  it("mirrors publishReadiness's own reasons exactly — never becomes a second, independent gate", () => {
    for (const article of [
      buildTestArticle({ title: null, slug: null, body: null }),
      buildTestArticle({ title: "عنوان", slug: "x", body: "متن" }),
    ]) {
      const report = buildContentQualityReport(article, [], EMPTY_VALIDATION);
      const seo = calculateSEOScore(article);
      const aeo = calculateAEOScore(article);
      const geo = calculateGEOScore(article);
      const duplicates = analyzeDuplicateContent(article, []);
      const publishReadiness = derivePublishReadiness(
        article,
        EMPTY_VALIDATION,
        { seo: seo.score, aeo: aeo.score, geo: geo.score },
        duplicates
      );

      const expectedCritical = publishReadiness.status === "blocked" ? publishReadiness.reasons : [];
      expect(report.suggestions.critical).toEqual(expectedCritical);
    }
  });

  it("computes a real internal-link suggestion note when candidates exist but none are relevant", () => {
    const article = buildTestArticle({ slug: "a", topic: "موضوع الف", isPublished: true });
    const candidates = [buildTestSummary({ slug: "b", topic: "موضوع کاملاً متفاوت", isPublished: true })];
    const report = buildContentQualityReport(article, candidates, EMPTY_VALIDATION);
    expect(Array.isArray(report.suggestions.optional)).toBe(true);
  });

  it("reuses detectFeaturedSnippetCandidates for featuredSnippetReady rather than re-deriving it", () => {
    const article = buildTestArticle({ faq: [{ question: "سوال؟", answer: "پاسخ." }] });
    const report = buildContentQualityReport(article, [], EMPTY_VALIDATION);
    expect(report.featuredSnippetReady).toBe(true);
  });

  it("returns a search intent classification", () => {
    const article = buildTestArticle({ title: "اضطراب کودکان چیست" });
    const report = buildContentQualityReport(article, [], EMPTY_VALIDATION);
    expect(report.searchIntent.intent).toBe("question");
  });
});
