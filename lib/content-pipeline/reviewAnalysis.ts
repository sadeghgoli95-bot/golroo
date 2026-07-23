import { calculateSEOScore } from "@/lib/content-analysis/scoring/calculateSEOScore";
import { calculateAEOScore } from "@/lib/content-analysis/scoring/calculateAEOScore";
import { calculateGEOScore } from "@/lib/content-analysis/scoring/calculateGEOScore";
import { analyzeInternalLinking } from "@/lib/content-analysis/analyzers/internalLinkAnalyzer";
import { analyzeDuplicateContent } from "@/lib/content-analysis/analyzers/duplicateAnalyzer";
import { validateArticle, type ArticleValidationResult } from "@/lib/article/validation";
import { derivePublishReadiness, type PublishReadinessResult } from "@/lib/content-pipeline/publishReadiness";
import { buildContentQualityReport, type ContentQualityReport } from "@/lib/content-pipeline/contentQualityAdvisor";
import type { Article, ArticleSummary } from "@/lib/article/types";
import type { AnalyzerResult, InternalLinkSuggestion, DuplicateMatch } from "@/lib/content-analysis/types";

export type ReviewAnalysis = {
  validation: ArticleValidationResult;
  seo: AnalyzerResult;
  aeo: AnalyzerResult;
  geo: AnalyzerResult;
  links: InternalLinkSuggestion[];
  duplicates: DuplicateMatch[];
  publishReadiness: PublishReadinessResult;
  contentQuality: ContentQualityReport;
};

/**
 * The review-workspace equivalent of runContentPipeline — but for an
 * article that already exists in the repository (no parse/hydrate
 * stage), so it reuses validateArticle (the repository-level validator)
 * instead of content-pipeline's import-specific runValidationEngine,
 * which expects parser warnings this article no longer has.
 */
export function analyzeExistingArticle(article: Article, candidates: ArticleSummary[]): ReviewAnalysis {
  const validation = validateArticle(article);
  const validationReport = {
    passed: validation.valid,
    issues: validation.errors.map((message) => ({ code: "validation_error", message })),
  };
  const seo = calculateSEOScore(article);
  const aeo = calculateAEOScore(article);
  const geo = calculateGEOScore(article);
  const links = analyzeInternalLinking(article, candidates);
  const duplicates = analyzeDuplicateContent(article, candidates);

  const publishReadiness = derivePublishReadiness(
    article,
    validationReport,
    { seo: seo.score, aeo: aeo.score, geo: geo.score },
    duplicates
  );

  const contentQuality = buildContentQualityReport(article, candidates, validationReport);

  return { validation, seo, aeo, geo, links, duplicates, publishReadiness, contentQuality };
}
