import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { analyzePublishReadiness } from "../analyzers/publishAnalyzer";

export function calculateSiteReadiness(article: AnalyzableArticle): AnalyzerResult {
  return analyzePublishReadiness(article);
}
