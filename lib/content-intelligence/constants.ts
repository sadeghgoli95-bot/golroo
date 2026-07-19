import type { IntelligenceReport, OptimizerResult } from "./types";
import type { AICompletionRequest } from "@/lib/ai/types";

/** Shared so every analyzer builds its single-user-turn request the same way instead of repeating the message-wrapping shape. */
export function buildSingleUserMessageRequest(prompt: string): AICompletionRequest {
  return { messages: [{ role: "user", content: prompt }] };
}

export const MIN_TITLE_ALTERNATIVES = 10;
export const MIN_META_ALTERNATIVES = 5;
export const MIN_SLUG_ALTERNATIVES = 5;
export const MAX_FAQ_SUGGESTIONS = 10;

export const NOT_CONFIGURED_WARNING = "AI Provider پیکربندی نشده است";

export function createNotConfiguredReport(): IntelligenceReport {
  return {
    scores: {},
    warnings: [NOT_CONFIGURED_WARNING],
    errors: [],
    suggestions: [],
    improvements: [],
    priorityActions: [],
    statistics: {},
    confidence: 0,
  };
}

export function createNotConfiguredOptimizerResult(): OptimizerResult {
  return { status: "not_configured", alternatives: [] };
}
