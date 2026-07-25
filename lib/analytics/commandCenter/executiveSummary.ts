import type { TopPriority } from "./getCommandCenter";
import type { AlertSeverity } from "./alerts";

export type ExecutiveSummary = {
  headline: string;
  points: string[];
};

export type ExecutiveSummaryInput = {
  topPriority: TopPriority;
  alertCountsBySeverity: Record<AlertSeverity, number>;
  quickWinsCount: number;
  highImpactCount: number;
  needsUpdatingCount: number;
  readyToRepublishCount: number;
};

/**
 * Executive Summary (Phase 3 Part 1, item 1). A deterministic template
 * assembled only from real counts/values this module already computed
 * elsewhere (alerts.ts, recommendations.ts, contentFreshness.ts) — no
 * generated prose, no invented number. Every sentence is either the real
 * `topPriority` (already resolved in getCommandCenter.ts) or a plain
 * count restated in Persian; a zero count is simply omitted rather than
 * printed as "۰ مورد" filler.
 */
export function buildExecutiveSummary(input: ExecutiveSummaryInput): ExecutiveSummary {
  const headline = input.topPriority
    ? input.topPriority.type === "risk"
      ? `اولویت امروز: رسیدگی به ریسک «${input.topPriority.title}»`
      : `اولویت امروز: استفاده از فرصت «${input.topPriority.title}»`
    : "سیگنال واقعی کافی برای تعیین یک اولویت واحد امروز وجود ندارد.";

  const points: string[] = [];

  if (input.alertCountsBySeverity.critical > 0) {
    points.push(`${input.alertCountsBySeverity.critical} هشدار بحرانی نیازمند رسیدگی فوری`);
  }
  if (input.alertCountsBySeverity.warning > 0) {
    points.push(`${input.alertCountsBySeverity.warning} هشدار هشداردهنده در حال پایش`);
  }
  if (input.alertCountsBySeverity.opportunity > 0) {
    points.push(`${input.alertCountsBySeverity.opportunity} فرصت واقعی شناسایی‌شده`);
  }
  if (input.quickWinsCount > 0) {
    points.push(`${input.quickWinsCount} برد سریع (Quick Win) با تلاش کم قابل اجراست`);
  }
  if (input.highImpactCount > 0) {
    points.push(`${input.highImpactCount} اقدام با اثر بالا در انتظار برنامه‌ریزی`);
  }
  if (input.needsUpdatingCount > 0) {
    points.push(`${input.needsUpdatingCount} مقاله نیاز به به‌روزرسانی دارد`);
  }
  if (input.readyToRepublishCount > 0) {
    points.push(`${input.readyToRepublishCount} مقاله آماده انتشار یا بازنشر است`);
  }

  return { headline, points };
}
