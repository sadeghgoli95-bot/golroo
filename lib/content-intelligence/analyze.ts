import type { AIProvider, AnalyzableArticleForAI, IntelligenceReport, Priority } from "./types";
import { analyzeSeo } from "./analyzers/seoAnalyzer";
import { analyzeAeo } from "./analyzers/aeoAnalyzer";
import { analyzeGeo } from "./analyzers/geoAnalyzer";
import { analyzeReadability } from "./analyzers/readabilityAnalyzer";
import { analyzeScientific } from "./analyzers/scientificAnalyzer";
import { analyzeEntities } from "./analyzers/entityAnalyzer";
import { analyzeMetadata } from "./analyzers/metadataAnalyzer";
import { analyzeFaqOpportunities } from "./analyzers/faqAnalyzer";
import { analyzeSnippetOpportunities } from "./analyzers/snippetAnalyzer";
import { analyzeClusterFit } from "./analyzers/clusterAnalyzer";
import { analyzeLinkingOpportunities } from "./analyzers/linkingAnalyzer";
import { analyzeDuplicateRisk } from "./analyzers/duplicateAnalyzer";

const SUB_ANALYZERS = [
  analyzeSeo,
  analyzeAeo,
  analyzeGeo,
  analyzeReadability,
  analyzeScientific,
  analyzeEntities,
  analyzeMetadata,
  analyzeFaqOpportunities,
  analyzeSnippetOpportunities,
  analyzeClusterFit,
  analyzeLinkingOpportunities,
  analyzeDuplicateRisk,
] as const;

const PRIORITY_ACTION_LEVELS: Priority[] = ["critical", "high"];

export async function analyzeArticleWithAI(
  article: AnalyzableArticleForAI,
  provider: AIProvider | null
): Promise<IntelligenceReport> {
  const reports = await Promise.all(SUB_ANALYZERS.map((analyzer) => analyzer(article, provider)));

  const suggestions = reports.flatMap((report) => report.suggestions);
  const averageConfidence =
    reports.length > 0 ? Math.round(reports.reduce((sum, report) => sum + report.confidence, 0) / reports.length) : 0;

  return {
    scores: Object.assign({}, ...reports.map((report) => report.scores)),
    warnings: reports.flatMap((report) => report.warnings),
    errors: reports.flatMap((report) => report.errors),
    suggestions,
    improvements: reports.flatMap((report) => report.improvements),
    priorityActions: suggestions.filter((suggestion) => PRIORITY_ACTION_LEVELS.includes(suggestion.priority)),
    statistics: Object.assign({}, ...reports.map((report) => report.statistics)),
    confidence: provider?.status === "ready" ? averageConfidence : 0,
  };
}
