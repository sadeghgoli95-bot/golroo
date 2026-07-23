import { buildTestArticle } from "@/lib/content-analysis/testFixtures";
import type { Article } from "@/lib/article/types";
import type { ArticleAnalysis } from "./getSiteAnalysis";

type BuildTestAnalysisOptions = {
  article?: Partial<Article>;
  seoScore?: number;
  aeoScore?: number;
  geoScore?: number;
  contentScore?: number;
  readabilityScore?: number;
  evidenceScore?: number;
  headingQualityScore?: number;
  contentDepthScore?: number;
  overallScore?: number;
  publishStatus?: "ready" | "almost_ready" | "blocked";
  criticalSuggestions?: string[];
  recommendedSuggestions?: string[];
  optionalSuggestions?: string[];
  featuredSnippetReady?: boolean;
  aiOverviewReady?: boolean;
  voiceSearchReady?: boolean;
  linkSuggestionCount?: number;
  brokenInternalLinks?: { url: string; targetSlug: string }[];
  externalLinkUrls?: string[];
};

/**
 * Shared ArticleAnalysis fixture for lib/analytics/site/* aggregator
 * tests — every aggregator only reads a handful of fields from the real
 * ReviewAnalysis shape, so this builds a minimal-but-correctly-shaped
 * stand-in instead of running the full real analyzer pipeline per test.
 */
export function buildTestAnalysis(options: BuildTestAnalysisOptions = {}): ArticleAnalysis {
  const article = buildTestArticle(options.article ?? {});
  const seoScore = options.seoScore ?? 70;
  const aeoScore = options.aeoScore ?? 70;
  const geoScore = options.geoScore ?? 70;
  const contentScore = options.contentScore ?? 70;

  return {
    article,
    review: {
      validation: { valid: true, errors: [], warnings: [] },
      seo: { score: seoScore, warnings: [], suggestions: [] },
      aeo: { score: aeoScore, warnings: [], suggestions: [] },
      geo: { score: geoScore, warnings: [], suggestions: [] },
      links: Array.from({ length: options.linkSuggestionCount ?? 0 }, (_, index) => ({
        targetSlug: `related-${index}`,
        targetTitle: `مقاله مرتبط ${index}`,
        reason: "شباهت موضوعی",
        confidence: 50,
        score: 0.5,
      })),
      duplicates: [],
      publishReadiness: { status: options.publishStatus ?? "almost_ready", reasons: [] },
      contentQuality: {
        scores: {
          content: contentScore,
          seo: seoScore,
          aeo: aeoScore,
          geo: geoScore,
          readability: options.readabilityScore ?? 70,
          topicCoverage: 70,
          evidence: options.evidenceScore ?? 70,
          headingQuality: options.headingQualityScore ?? 70,
          contentDepth: options.contentDepthScore ?? 70,
          entityCoverage: null,
        },
        searchIntent: { intent: "informational", signals: [] },
        voiceSearchReady: options.voiceSearchReady ?? false,
        aiOverviewReady: options.aiOverviewReady ?? false,
        featuredSnippetReady: options.featuredSnippetReady ?? false,
        suggestions: {
          critical: options.criticalSuggestions ?? [],
          recommended: options.recommendedSuggestions ?? [],
          optional: options.optionalSuggestions ?? [],
        },
      },
    },
    detailedScores: {
      seo: seoScore,
      aeo: aeoScore,
      geo: geoScore,
      scientific: 70,
      authority: 70,
      trust: 70,
      readability: options.readabilityScore ?? 70,
      structure: contentScore,
      internalLinking: 50,
      overall: options.overallScore ?? contentScore,
    },
    brokenInternalLinks: options.brokenInternalLinks ?? [],
    externalLinkUrls: options.externalLinkUrls ?? [],
  };
}
