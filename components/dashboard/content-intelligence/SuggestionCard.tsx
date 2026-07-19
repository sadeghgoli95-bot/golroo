import type { Suggestion } from "@/lib/content-intelligence/types";

type SuggestionCardProps = {
  suggestion: Suggestion;
};

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div className={`dashboard-priority-item dashboard-priority-${suggestion.priority}`}>{suggestion.message}</div>
  );
}
