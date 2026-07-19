import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport } from "../types";
import { createNotConfiguredReport, buildSingleUserMessageRequest } from "../constants";
import { buildMetadataPrompt } from "../prompts/metadata";

const AI_SUGGESTION_CONFIDENCE = 50;

export async function analyzeMetadata(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredReport();
  }

  const completion = await provider.complete(buildSingleUserMessageRequest(buildMetadataPrompt(article)));

  return {
    scores: {},
    warnings: [],
    errors: [],
    suggestions: [{ id: "metadata-ai", message: completion.content, priority: "medium" }],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: AI_SUGGESTION_CONFIDENCE,
  };
}
