import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport } from "../types";
import { createNotConfiguredReport, buildSingleUserMessageRequest } from "../constants";
import { buildAeoPrompt } from "../prompts/aeo";

const AI_SUGGESTION_CONFIDENCE = 50;

export async function analyzeAeo(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredReport();
  }

  const completion = await provider.complete(buildSingleUserMessageRequest(buildAeoPrompt(article)));

  return {
    scores: {},
    warnings: [],
    errors: [],
    suggestions: [{ id: "aeo-ai", message: completion.content, priority: "medium" }],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: AI_SUGGESTION_CONFIDENCE,
  };
}
