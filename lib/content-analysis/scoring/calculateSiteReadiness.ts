import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { analyzePublishReadiness } from "../analyzers/publishAnalyzer";

export function calculateSiteReadiness(
  article: AnalyzableArticle,
  internalLinkSuggestionCount?: number
): AnalyzerResult {
  return analyzePublishReadiness(article, internalLinkSuggestionCount);
}
