import type { Article, ArticleSummary } from "@/lib/article/types";
import { calculateSEOScore } from "@/lib/content-analysis/scoring/calculateSEOScore";
import { calculateAEOScore } from "@/lib/content-analysis/scoring/calculateAEOScore";
import { calculateGEOScore } from "@/lib/content-analysis/scoring/calculateGEOScore";
import { calculateContentScore } from "@/lib/content-analysis/scoring/calculateContentScore";
import { analyzeReadability } from "@/lib/content-analysis/analyzers/readabilityAnalyzer";
import { analyzeTopicCoverage } from "@/lib/content-analysis/analyzers/topicCoverageAnalyzer";
import { analyzeScientificTrust } from "@/lib/content-analysis/analyzers/scientificAnalyzer";
import { analyzeSourceAuthority } from "@/lib/content-analysis/analyzers/sourceAuthorityAnalyzer";
import { analyzeHeadingStructure } from "@/lib/content-analysis/analyzers/headingAnalyzer";
import { analyzeHeadingHierarchy } from "@/lib/content-analysis/analyzers/headingHierarchyAnalyzer";
import { analyzeThinContent } from "@/lib/content-analysis/analyzers/thinContentAnalyzer";
import { analyzeVoiceSearchReadiness } from "@/lib/content-analysis/analyzers/voiceSearchReadinessAnalyzer";
import { analyzeSearchIntent, type SearchIntentResult } from "@/lib/content-analysis/analyzers/searchIntentAnalyzer";
import { analyzeInternalLinking } from "@/lib/content-analysis/analyzers/internalLinkAnalyzer";
import { analyzeDuplicateContent } from "@/lib/content-analysis/analyzers/duplicateAnalyzer";
import { detectFeaturedSnippetCandidates } from "@/lib/content-analysis/analyzers/featuredSnippetAnalyzer";
import { derivePublishReadiness } from "./publishReadiness";
import type { ValidationReport } from "./types";

const VOICE_SEARCH_READY_THRESHOLD = 66;
const AI_OVERVIEW_READY_THRESHOLD = 66;

export type ContentQualityScores = {
  content: number;
  seo: number;
  aeo: number;
  geo: number;
  readability: number;
  topicCoverage: number;
  evidence: number;
  headingQuality: number;
  contentDepth: number;
  /** null = not available — real entity extraction needs an AI provider, which isn't configured. Never fabricated. */
  entityCoverage: number | null;
};

export type ContentQualitySuggestions = {
  critical: string[];
  recommended: string[];
  optional: string[];
};

export type ContentQualityReport = {
  scores: ContentQualityScores;
  searchIntent: SearchIntentResult;
  voiceSearchReady: boolean;
  aiOverviewReady: boolean;
  featuredSnippetReady: boolean;
  suggestions: ContentQualitySuggestions;
};

/**
 * Analysis only — this function and everything it calls are read-only:
 * the article is never modified, and nothing here ever blocks
 * publishing. "critical" in the returned suggestions is a severity
 * label for the dashboard UI, mirrored from derivePublishReadiness's own
 * blocking reasons when it reports "blocked" — publish-readiness itself
 * remains the single, unchanged source of truth for what actually
 * blocks (lib/content-pipeline/publishReadiness.ts); this advisor never
 * introduces a second gate.
 *
 * Every score/signal reuses an existing analyzer — no analysis logic is
 * re-derived here. `entityCoverage` stays null (not zero, not guessed)
 * because real named-entity extraction needs an AI provider this
 * project doesn't have configured, matching the honest-null convention
 * already used throughout this codebase (see e.g. hasSchema/refreshScore).
 */
export function buildContentQualityReport(
  article: Article,
  candidates: ArticleSummary[],
  validation: ValidationReport
): ContentQualityReport {
  const seo = calculateSEOScore(article);
  const aeo = calculateAEOScore(article);
  const geo = calculateGEOScore(article);
  const content = calculateContentScore(article);
  const readability = analyzeReadability(article);
  const topicCoverage = analyzeTopicCoverage(article);
  const scientific = analyzeScientificTrust(article);
  const sourceAuthority = analyzeSourceAuthority(article);
  const headingCount = analyzeHeadingStructure(article);
  const headingHierarchy = analyzeHeadingHierarchy(article);
  const thinContent = analyzeThinContent(article);
  const voiceSearch = analyzeVoiceSearchReadiness(article);
  const searchIntent = analyzeSearchIntent(article);
  const links = analyzeInternalLinking(article, candidates);
  const duplicates = analyzeDuplicateContent(article, candidates);
  const snippetCandidates = detectFeaturedSnippetCandidates(article);

  const publishReadiness = derivePublishReadiness(
    article,
    validation,
    { seo: seo.score, aeo: aeo.score, geo: geo.score },
    duplicates
  );

  const linkSuggestions =
    links.length === 0 ? ["هیچ پیشنهاد لینک داخلی مرتبطی یافت نشد — مقالات بیشتری درباره موضوعات مرتبط بنویسید"] : [];

  return {
    scores: {
      content: content.score,
      seo: seo.score,
      aeo: aeo.score,
      geo: geo.score,
      readability: readability.score,
      topicCoverage: topicCoverage.score,
      evidence: Math.round((scientific.score + sourceAuthority.score) / 2),
      headingQuality: Math.round((headingCount.score + headingHierarchy.score) / 2),
      contentDepth: thinContent.score,
      entityCoverage: null,
    },
    searchIntent,
    voiceSearchReady: voiceSearch.score >= VOICE_SEARCH_READY_THRESHOLD,
    aiOverviewReady: geo.score >= AI_OVERVIEW_READY_THRESHOLD,
    featuredSnippetReady: snippetCandidates.length > 0,
    suggestions: {
      critical: publishReadiness.status === "blocked" ? publishReadiness.reasons : [],
      recommended: [
        ...seo.warnings,
        ...aeo.warnings,
        ...geo.warnings,
        ...content.warnings,
        ...topicCoverage.warnings,
        ...scientific.warnings,
        ...sourceAuthority.warnings,
        ...headingCount.warnings,
        ...headingHierarchy.warnings,
        ...thinContent.warnings,
      ],
      optional: [
        ...seo.suggestions,
        ...aeo.suggestions,
        ...geo.suggestions,
        ...content.suggestions,
        ...topicCoverage.suggestions,
        ...scientific.suggestions,
        ...sourceAuthority.suggestions,
        ...headingCount.suggestions,
        ...headingHierarchy.suggestions,
        ...thinContent.suggestions,
        ...voiceSearch.suggestions,
        ...linkSuggestions,
      ],
    },
  };
}
