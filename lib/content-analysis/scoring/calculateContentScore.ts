import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { analyzeReadability } from "../analyzers/readabilityAnalyzer";
import { analyzeAccessibility } from "../analyzers/accessibilityAnalyzer";
import { analyzeParagraphLength } from "../analyzers/paragraphLengthAnalyzer";
import { analyzeThinContent } from "../analyzers/thinContentAnalyzer";
import { analyzeIntroConclusion } from "../analyzers/introConclusionAnalyzer";

/**
 * Previously composed analyzeStructure, which scored against
 * article.importantPoints/finalQuestion — legacy Mirora fields that are
 * always empty for every article the current Markdown parser produces,
 * so this score always failed 2 of its 3 checks regardless of actual
 * content quality (same bug class already fixed in calculateAEOScore.ts
 * and calculateGEOScore.ts). Replaced with real signals: readability,
 * accessibility, paragraph length, content depth, and a real
 * introduction/conclusion check.
 */
export function calculateContentScore(article: AnalyzableArticle): AnalyzerResult {
  const results = [
    analyzeReadability(article),
    analyzeAccessibility(article),
    analyzeParagraphLength(article),
    analyzeThinContent(article),
    analyzeIntroConclusion(article),
  ];

  const score = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);

  return {
    score,
    warnings: results.flatMap((result) => result.warnings),
    suggestions: results.flatMap((result) => result.suggestions),
  };
}
