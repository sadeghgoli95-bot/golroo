export type { Article as AnalyzableArticle, ArticleSummary as LinkableArticleSummary } from "@/lib/article/types";

export type AnalyzerResult = {
  score: number;
  warnings: string[];
  suggestions: string[];
};

export type InternalLinkSuggestion = {
  targetSlug: string;
  targetTitle: string;
  reason: string;
  confidence: number;
  score: number;
};

export type DuplicateMatchType =
  | "exact"
  | "near"
  | "title"
  | "slug"
  | "keyword"
  | "entity"
  | "semantic";

export type DuplicateMatch = {
  matchType: DuplicateMatchType;
  targetSlug: string;
  targetTitle: string;
  confidence: number;
};

/**
 * Semantic duplicate detection is interface-only — it needs embeddings/an
 * AI provider, which this module has no dependency on. Always returns
 * this shape; never populated in this phase.
 */
export type SemanticDuplicateCheck = {
  status: "not_implemented";
};

export type CategoryScores = {
  seo: number;
  aeo: number;
  geo: number;
  content: number;
  publishReady: number;
};

export type DetailedScores = {
  seo: number;
  aeo: number;
  geo: number;
  scientific: number;
  authority: number;
  trust: number;
  readability: number;
  structure: number;
  internalLinking: number;
  overall: number;
};

export type ContentAnalysisReport = {
  scores: CategoryScores;
  warnings: string[];
  suggestions: string[];
  statistics: Record<string, number>;
};

export type ImpactLevel = "low" | "medium" | "high" | "critical";
export type EffortLevel = "low" | "medium" | "high";
export type PriorityLabel = "quick_win" | "medium" | "long_term" | "critical_fix";

export type PrioritizedSuggestion = {
  message: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  priority: PriorityLabel;
};
