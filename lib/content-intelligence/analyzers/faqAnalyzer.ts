import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport } from "../types";
import { createNotConfiguredReport, buildSingleUserMessageRequest } from "../constants";
import { buildFaqPrompt } from "../prompts/faq";

const AI_SUGGESTION_CONFIDENCE = 50;

export async function analyzeFaqOpportunities(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  if (!provider || provider.status !== "ready") {
    return createNotConfiguredReport();
  }

  const completion = await provider.complete(buildSingleUserMessageRequest(buildFaqPrompt(article)));

  return {
    scores: {},
    warnings: [],
    errors: [],
    suggestions: [{ id: "faq-ai", message: completion.content, priority: "medium" }],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: AI_SUGGESTION_CONFIDENCE,
  };
}
