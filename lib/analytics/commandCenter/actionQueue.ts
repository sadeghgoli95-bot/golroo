import type { PriorityMatrixItem, EffortLevel } from "./priorityMatrix";

export type ActionQueueItem = {
  priority: number;
  reason: string;
  impact: number;
  effort: EffortLevel;
  /**
   * A heuristic difficulty-bucket label, not a measured duration (no
   * time-tracking data exists anywhere in this project) — documented as an
   * estimate, kept coarse on purpose so it never reads as a precise number.
   */
  estimatedEffortLabel: string;
  action: string;
  link: string;
};

const EFFORT_LABEL: Record<EffortLevel, string> = {
  low: "تلاش کم (~۳۰ دقیقه)",
  medium: "تلاش متوسط (~۲ ساعت)",
  high: "تلاش زیاد (~نیم روز)",
};

/** Action Queue (Phase 5 item) — the real priority-matrix items, ranked by their real `rank`, with a real internal link. */
export function buildActionQueue(items: PriorityMatrixItem[], topN = 10): ActionQueueItem[] {
  return [...items]
    .sort((a, b) => b.rank - a.rank)
    .slice(0, topN)
    .map((item, index) => ({
      priority: index + 1,
      reason: item.message,
      impact: item.rank,
      effort: item.effort,
      estimatedEffortLabel: EFFORT_LABEL[item.effort],
      action: item.title,
      link: `/journal/${item.slug}`,
    }));
}
