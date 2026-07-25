import type { RankedChange } from "../history/rankChanges";

export type ChangeExplanation = {
  /** A fact directly supported by the real comparison data — never an inferred cause. */
  observed: string;
  /** Only set when at least one other real, independently-computed signal moved the same way in the same period; otherwise null. A correlation, explicitly labeled as such — never presented as a confirmed cause. */
  possibleExplanation: string | null;
  /** Always present: an explicit statement that the available data does not establish a single cause. */
  unknown: string;
};

const UNKNOWN_DISCLAIMER = "داده موجود یک علت واحد و قطعی برای این تغییر را تعیین نمی‌کند؛ همبستگی به‌معنای علیت نیست.";

/**
 * Evidence-based "why" layer (Phase 3 Part 4, item 6). Turns one real
 * RankedChange (lib/analytics/history/rankChanges.ts — itself already a
 * real week-over-week comparison of real snapshot data) into the
 * mandatory Observed / Possible explanation / Unknown split:
 *
 * - Observed: restates the real numbers only.
 * - Possible explanation: set only when the caller supplies real
 *   `corroboratingSignals` — other real metrics that moved the same
 *   direction in the same period (see getExecutiveReport.ts, which
 *   derives this from the same rankedChanges list, never invents one).
 * - Unknown: always shown, verbatim, so a reader never mistakes a
 *   correlation for a confirmed cause.
 */
export function explainChange(change: RankedChange, corroboratingSignals: string[] = []): ChangeExplanation {
  const magnitude =
    change.comparison.percentChange !== null
      ? `${Math.abs(change.comparison.percentChange).toFixed(1)}٪`
      : `${Math.abs(change.comparison.difference ?? 0)} واحد`;
  const directionWord = change.direction === "improvement" ? "بهبود" : "افت";

  const observed = `${change.label} به میزان ${magnitude} از ${change.fromLabel} به ${change.toLabel} ${directionWord} یافت (${change.comparison.previous ?? "—"} ← ${change.comparison.current}).`;

  const possibleExplanation =
    corroboratingSignals.length > 0
      ? `توضیح احتمالی: این تغییر هم‌زمان با تغییر در ${corroboratingSignals.join("، ")} رخ داده — یک هم‌زمانی محتمل، نه یک علت اثبات‌شده.`
      : null;

  return { observed, possibleExplanation, unknown: UNKNOWN_DISCLAIMER };
}
