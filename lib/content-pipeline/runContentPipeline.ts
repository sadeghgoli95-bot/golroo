import { parseArticle } from "@/lib/content-import/parseArticle";
import { mapParsedFieldsToArticle } from "@/lib/article/mappers/fromParsedFields";
import type { Article } from "@/lib/article/types";
import type { ArticleRepository } from "@/lib/article/repository";
import type { AnalyzerResult, InternalLinkSuggestion, DuplicateMatch } from "@/lib/content-analysis/types";
import { calculateSEOScore } from "@/lib/content-analysis/scoring/calculateSEOScore";
import { calculateAEOScore } from "@/lib/content-analysis/scoring/calculateAEOScore";
import { calculateGEOScore } from "@/lib/content-analysis/scoring/calculateGEOScore";
import { analyzeInternalLinking } from "@/lib/content-analysis/analyzers/internalLinkAnalyzer";
import { analyzeDuplicateContent } from "@/lib/content-analysis/analyzers/duplicateAnalyzer";
import { analyzeArticleWithAI } from "@/lib/content-intelligence/analyze";
import type { IntelligenceReport } from "@/lib/content-intelligence/types";
import type { AIProvider } from "@/lib/ai/types";
import { runValidationEngine } from "./validation";
import type { ValidationReport } from "./types";
import { derivePublishReadiness, type PublishReadinessResult } from "./publishReadiness";
import { buildExecutiveSummary, type ExecutiveSummary } from "./executiveSummary";
import { buildStructuredData, type StructuredData } from "./structuredData";
import { buildTableOfContents, type TocNode } from "./tableOfContents";
import { buildAiOverviewSummary } from "./aiOverview";
import { buildMetaTagsPreview, type MetaTagsPreview } from "./metaTags";
import {
  detectFeaturedSnippetCandidates,
  type FeaturedSnippetCandidate,
} from "@/lib/content-analysis/analyzers/featuredSnippetAnalyzer";
import { buildContentQualityReport, type ContentQualityReport } from "./contentQualityAdvisor";

export type PipelineResult = {
  article: Article;
  validation: ValidationReport;
  seo: AnalyzerResult;
  aeo: AnalyzerResult;
  geo: AnalyzerResult;
  ai: IntelligenceReport;
  aiConfigured: boolean;
  links: InternalLinkSuggestion[];
  duplicates: DuplicateMatch[];
  publishReadiness: PublishReadinessResult;
  /**
   * Content decay/refresh scoring (traffic trend, reference age, ranking
   * trend) needs historical data an article doesn't have until it has
   * been published and observed — always null for a fresh import. Kept
   * as a field (not omitted) so PipelineResult's shape matches every
   * stage of this project's lifecycle, not just import.
   */
  refreshScore: null;
  executiveSummary: ExecutiveSummary;
  structuredData: StructuredData;
  toc: TocNode[];
  aiOverviewSummary: string | null;
  metaTags: MetaTagsPreview;
  featuredSnippets: FeaturedSnippetCandidate[];
  contentQuality: ContentQualityReport;
  warnings: string[];
  errors: string[];
};

/**
 * THE only entry point into the content pipeline — Import -> Parse ->
 * Canonical Article -> Validation -> SEO/AEO/GEO -> Internal Linking ->
 * Duplicate Detection -> AI Readiness -> Publish Readiness -> one
 * unified result. No page or component may call parseArticle,
 * runValidationEngine, an analyzer, or analyzeArticleWithAI directly —
 * everything goes through this function.
 *
 * `aiProvider` defaults to null (not configured) rather than throwing —
 * every AI-derived field degrades gracefully (see analyzeArticleWithAI
 * and buildExecutiveSummary) instead of blocking the rest of the
 * pipeline, since no concrete AIProvider is wired into this project yet.
 */
export async function runContentPipeline(
  rawText: string,
  repository: ArticleRepository,
  aiProvider: AIProvider | null = null
): Promise<PipelineResult> {
  const parsed = parseArticle(rawText);
  const article = mapParsedFieldsToArticle(parsed);
  const candidates = await repository.listAll();

  const validation = runValidationEngine(parsed, article, candidates);

  const seo = calculateSEOScore(article);
  const aeo = calculateAEOScore(article);
  const geo = calculateGEOScore(article);

  const links = analyzeInternalLinking(article, candidates);
  const duplicates = analyzeDuplicateContent(article, candidates);

  const ai = await analyzeArticleWithAI(article, aiProvider);
  const aiConfigured = aiProvider?.status === "ready";

  const publishReadiness = derivePublishReadiness(
    article,
    validation,
    { seo: seo.score, aeo: aeo.score, geo: geo.score },
    duplicates
  );

  const executiveSummary = buildExecutiveSummary(seo, aeo, geo, validation, ai, aiConfigured, publishReadiness);
  const structuredData = buildStructuredData(article);
  const toc = buildTableOfContents(article.headings);
  const aiOverviewSummary = buildAiOverviewSummary(article);
  const metaTags = buildMetaTagsPreview(article);
  const featuredSnippets = detectFeaturedSnippetCandidates(article);
  const contentQuality = buildContentQualityReport(article, candidates, validation);

  return {
    article,
    validation,
    seo,
    aeo,
    geo,
    ai,
    aiConfigured,
    links,
    duplicates,
    publishReadiness,
    refreshScore: null,
    executiveSummary,
    structuredData,
    toc,
    aiOverviewSummary,
    metaTags,
    featuredSnippets,
    contentQuality,
    warnings: [...parsed.warnings, ...validation.issues.map((issue) => issue.message)],
    errors: ai.errors,
  };
}
