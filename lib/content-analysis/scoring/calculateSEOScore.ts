import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { analyzeTitle } from "../analyzers/titleAnalyzer";
import { analyzeSlug } from "../analyzers/slugAnalyzer";
import { analyzeMeta } from "../analyzers/metaAnalyzer";
import { analyzeHeadingStructure } from "../analyzers/headingAnalyzer";
import { analyzeKeywords } from "../analyzers/keywordAnalyzer";
import { analyzeSchema } from "../analyzers/schemaAnalyzer";
import { analyzeImages } from "../analyzers/imageAnalyzer";

export function calculateSEOScore(article: AnalyzableArticle): AnalyzerResult {
  const results = [
    analyzeTitle(article),
    analyzeSlug(article),
    analyzeMeta(article),
    analyzeHeadingStructure(article),
    analyzeKeywords(article),
    analyzeSchema(article),
    analyzeImages(article),
  ];

  const score = Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);

  return {
    score,
    warnings: results.flatMap((result) => result.warnings),
    suggestions: results.flatMap((result) => result.suggestions),
  };
}
