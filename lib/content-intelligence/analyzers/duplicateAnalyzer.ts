import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport } from "../types";
import { createNotConfiguredReport } from "../constants";

const AI_SUGGESTION_CONFIDENCE = 50;

/**
 * Semantic (AI-driven) duplicate/similarity detection — distinct from the
 * deterministic structural duplicate check in lib/content-analysis. No
 * prompt exists yet for this analyzer since it needs the full content
 * library as context, not a single-article prompt; wiring that is
 * deferred to when a real provider and a content corpus are available.
 */
export async function analyzeDuplicateRisk(
  _article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredReport();
  }

  return {
    scores: {},
    warnings: [],
    errors: [],
    suggestions: [],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: AI_SUGGESTION_CONFIDENCE,
  };
}
