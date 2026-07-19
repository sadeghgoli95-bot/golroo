import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport } from "../types";
import { createNotConfiguredReport, buildSingleUserMessageRequest } from "../constants";
import { buildEntitiesPrompt } from "../prompts/entities";

const AI_SUGGESTION_CONFIDENCE = 50;

export async function analyzeEntities(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredReport();
  }

  const completion = await provider.complete(buildSingleUserMessageRequest(buildEntitiesPrompt(article)));

  return {
    scores: {},
    warnings: [],
    errors: [],
    suggestions: [{ id: "entities-ai", message: completion.content, priority: "low" }],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: AI_SUGGESTION_CONFIDENCE,
  };
}
