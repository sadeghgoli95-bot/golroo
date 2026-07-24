import type { Recommendation, RecommendationCategory } from "../growth/recommendations";

export type EffortLevel = "low" | "medium" | "high";
export type MatrixQuadrant = "do_now" | "schedule" | "fill_in" | "reconsider";

export type PriorityMatrixItem = Recommendation & {
  effort: EffortLevel;
  quadrant: MatrixQuadrant;
};

/**
 * Effort isn't a field any real data source in this project tracks (there's
 * no task/time-tracking system) — this is a documented, deterministic
 * editorial classification by recommendation category (how much manual work
 * each category typically implies: a quick_win is a title/meta rewrite, a
 * high_impact task usually needs new sections/research), not a fabricated
 * business metric. Impact comes straight from each Recommendation's real
 * `rank` — already a real percentile of a real underlying signal, computed
 * in lib/analytics/growth/recommendations.ts.
 */
const EFFORT_BY_CATEGORY: Record<RecommendationCategory, EffortLevel> = {
  quick_win: "low",
  republish: "low",
  maintenance: "medium",
  critical: "medium",
  high_impact: "high",
};

const IMPACT_THRESHOLD = 0.5;

function resolveQuadrant(impact: number, effort: EffortLevel): MatrixQuadrant {
  const highImpact = impact >= IMPACT_THRESHOLD;
  const lowEffort = effort === "low";
  if (highImpact && lowEffort) return "do_now";
  if (highImpact && !lowEffort) return "schedule";
  if (!highImpact && lowEffort) return "fill_in";
  return "reconsider";
}

/** Priority Matrix (Phase 5 item — Impact × Effort). Every input recommendation already carries a real `rank`; this only attaches the deterministic effort label and buckets into a quadrant. */
export function buildPriorityMatrix(recommendations: Recommendation[]): PriorityMatrixItem[] {
  return recommendations.map((item) => {
    const effort = EFFORT_BY_CATEGORY[item.category];
    return { ...item, effort, quadrant: resolveQuadrant(item.rank, effort) };
  });
}

export function groupByQuadrant(items: PriorityMatrixItem[]): Record<MatrixQuadrant, PriorityMatrixItem[]> {
  const groups: Record<MatrixQuadrant, PriorityMatrixItem[]> = { do_now: [], schedule: [], fill_in: [], reconsider: [] };
  for (const item of items) groups[item.quadrant].push(item);
  return groups;
}

export const QUADRANT_LABELS: Record<MatrixQuadrant, string> = {
  do_now: "انجام فوری (اثر بالا / تلاش کم)",
  schedule: "برنامه‌ریزی کن (اثر بالا / تلاش زیاد)",
  fill_in: "در فرصت مناسب (اثر کم / تلاش کم)",
  reconsider: "بازنگری کن (اثر کم / تلاش زیاد)",
};
