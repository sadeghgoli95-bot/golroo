import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport } from "../types";
import { createNotConfiguredReport, buildSingleUserMessageRequest } from "../constants";
import { buildGeoPrompt } from "../prompts/geo";

const AI_SUGGESTION_CONFIDENCE = 50;

export async function analyzeGeo(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredReport();
  }

  const completion = await provider.complete(buildSingleUserMessageRequest(buildGeoPrompt(article)));

  return {
    scores: {},
    warnings: [],
    errors: [],
    suggestions: [{ id: "geo-ai", message: completion.content, priority: "medium" }],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: AI_SUGGESTION_CONFIDENCE,
  };
}
