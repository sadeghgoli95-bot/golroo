import type { AIProviderStatus } from "@/lib/ai/types";

export type { Article as AnalyzableArticleForAI } from "@/lib/article/types";
export type { AIProvider, AIProviderStatus, AICompletionRequest, AICompletionResult } from "@/lib/ai/types";

export type Priority = "critical" | "high" | "medium" | "low";

export type Suggestion = {
  id: string;
  message: string;
  priority: Priority;
};

export type Improvement = {
  id: string;
  message: string;
  priority: Priority;
};

export type IntelligenceReport = {
  scores: Record<string, number>;
  warnings: string[];
  errors: string[];
  suggestions: Suggestion[];
  improvements: Improvement[];
  priorityActions: Suggestion[];
  statistics: Record<string, number>;
  confidence: number;
};

export type TextAlternative = {
  value: string;
  seoScore: number | null;
  aeoScore: number | null;
  ctrEstimate: number | null;
};

export type OptimizerResult = {
  status: AIProviderStatus;
  alternatives: TextAlternative[];
};
