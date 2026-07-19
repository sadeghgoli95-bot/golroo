import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { analyzeReadability } from "../analyzers/readabilityAnalyzer";
import { analyzeStructure } from "../analyzers/structureAnalyzer";
import { analyzeAccessibility } from "../analyzers/accessibilityAnalyzer";

export function calculateContentScore(article: AnalyzableArticle): AnalyzerResult {
  const results = [analyzeReadability(article), analyzeStructure(article), analyzeAccessibility(article)];

  const score = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);

  return {
    score,
    warnings: results.flatMap((result) => result.warnings),
    suggestions: results.flatMap((result) => result.suggestions),
  };
}
