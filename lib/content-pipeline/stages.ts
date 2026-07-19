import type { Article, ArticleSummary, ParsedArticleFields } from "@/lib/article/types";
import type { ValidationReport } from "./types";
import type { ArticleDashboardRow } from "./mappers/toDashboardRow";
import type { ContentAnalysisReport } from "@/lib/content-analysis/types";
import type { IntelligenceReport } from "@/lib/content-intelligence/types";

/**
 * Type-level contract for each pipeline stage, per the mandated flow:
 * Import -> Parse -> Canonical Article -> Validation -> Analysis -> AI ->
 * Dashboard -> Sanity. No stage function is implemented here — Sanity and
 * Dashboard persistence don't exist yet, so this only fixes each stage's
 * input/output shape so future implementations can't silently drift.
 */

export type ImportStageOutput = string;

export type ParseStageInput = ImportStageOutput;
export type ParseStageOutput = ParsedArticleFields;

export type CanonicalStageInput = ParseStageOutput;
export type CanonicalStageOutput = Article;

export type ValidationStageInput = {
  parsed: ParsedArticleFields;
  article: Article;
  candidates: ArticleSummary[];
};
export type ValidationStageOutput = ValidationReport;

export type AnalysisStageInput = Article;
export type AnalysisStageOutput = ContentAnalysisReport;

export type AIStageInput = Article;
export type AIStageOutput = IntelligenceReport;

export type DashboardStageInput = ArticleDashboardRow;
export type DashboardStageOutput = ArticleDashboardRow;

export type SanityStageInput = Article;
export type SanityStageOutput = { documentId: string };
