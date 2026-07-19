import type { EffortLevel, ImpactLevel, PriorityLabel, PrioritizedSuggestion } from "./types";

const PRIORITY_MATRIX: Record<ImpactLevel, Record<EffortLevel, PriorityLabel>> = {
  critical: { low: "critical_fix", medium: "critical_fix", high: "critical_fix" },
  high: { low: "quick_win", medium: "medium", high: "long_term" },
  medium: { low: "quick_win", medium: "medium", high: "long_term" },
  low: { low: "medium", medium: "long_term", high: "long_term" },
};

export function derivePriority(impact: ImpactLevel, effort: EffortLevel): PriorityLabel {
  return PRIORITY_MATRIX[impact][effort];
}

export function prioritize(message: string, impact: ImpactLevel, effort: EffortLevel): PrioritizedSuggestion {
  return { message, impact, effort, priority: derivePriority(impact, effort) };
}
