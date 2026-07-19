import type { AnalyzerResult } from "@/lib/content-analysis/types";
import type { IntelligenceReport } from "@/lib/content-intelligence/types";
import type { ValidationReport } from "./types";
import type { PublishReadinessResult } from "./publishReadiness";
import { READY_MIN_SEO_SCORE, READY_MIN_GEO_SCORE } from "./publishReadinessConstants";

const TOP_ITEM_LIMIT = 10;

export type ExecutiveSummary = {
  topProblems: string[];
  topOpportunities: string[];
  estimatedSeoImpact: number;
  estimatedGeoImpact: number;
  /** null when the AI provider isn't configured — confidence 0 in that case means "unmeasured," not "poor," so an improvement estimate would be fabricated. */
  estimatedAiVisibilityImprovement: number | null;
  publishReadiness: PublishReadinessResult;
};

function dedupeTop(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean))).slice(0, TOP_ITEM_LIMIT);
}

export function buildExecutiveSummary(
  seo: AnalyzerResult,
  aeo: AnalyzerResult,
  geo: AnalyzerResult,
  validation: ValidationReport,
  ai: IntelligenceReport,
  aiConfigured: boolean,
  publishReadiness: PublishReadinessResult
): ExecutiveSummary {
  const topProblems = dedupeTop([
    ...validation.issues.map((issue) => issue.message),
    ...seo.warnings,
    ...aeo.warnings,
    ...geo.warnings,
    ...ai.warnings,
  ]);

  const topOpportunities = dedupeTop([
    ...seo.suggestions,
    ...aeo.suggestions,
    ...geo.suggestions,
    ...ai.suggestions.map((suggestion) => suggestion.message),
  ]);

  return {
    topProblems,
    topOpportunities,
    estimatedSeoImpact: Math.max(0, READY_MIN_SEO_SCORE - seo.score),
    estimatedGeoImpact: Math.max(0, READY_MIN_GEO_SCORE - geo.score),
    estimatedAiVisibilityImprovement: aiConfigured ? Math.max(0, 100 - ai.confidence) : null,
    publishReadiness,
  };
}
