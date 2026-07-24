import { runReport } from "@/lib/google/ga4Client";
import type { IsoDateRange } from "../dateRange";
import type { FunnelStage } from "./types";
import { CONVERSION_PATHS } from "./conversionSummary";

/**
 * A real, three-stage funnel built only from numbers that are each
 * independently verifiable in GA4 — sessions, total pageviews, and
 * appointment/contact pageviews. This is NOT a session-linked funnel
 * (GA4's basic runReport has no per-user path join available on this
 * property) — each stage is an aggregate count for the period, not "N
 * users who did stage 1 also did stage 2." The label on this section in
 * the UI must say so; this module only computes the honest numbers.
 */
export async function getConversionFunnel(range: IsoDateRange): Promise<FunnelStage[]> {
  const [summaryRows, pathRows] = await Promise.all([
    runReport({ startDate: range.start, endDate: range.end, metrics: ["sessions", "screenPageViews"] }),
    runReport({ startDate: range.start, endDate: range.end, dimensions: ["pagePath"], metrics: ["screenPageViews"], limit: 1000 }),
  ]);

  const sessions = summaryRows[0]?.metrics.sessions ?? 0;
  const totalPageViews = summaryRows[0]?.metrics.screenPageViews ?? 0;
  const conversionPageViews = pathRows
    .filter((row) => {
      const path = (row.dimensions.pagePath ?? "").split("?")[0]?.replace(/\/$/, "") || "/";
      return (CONVERSION_PATHS as readonly string[]).includes(path);
    })
    .reduce((sum, row) => sum + (row.metrics.screenPageViews ?? 0), 0);

  const stages: { label: string; value: number }[] = [
    { label: "نشست‌های سایت (Sessions)", value: sessions },
    { label: "بازدید صفحات (هر مقاله/فرود)", value: totalPageViews },
    { label: "بازدید صفحه نوبت‌دهی یا تماس", value: conversionPageViews },
  ];

  return stages.map((stage, index) => {
    const previous = stages[index - 1];
    const dropOffPercent = previous && previous.value > 0 ? ((previous.value - stage.value) / previous.value) * 100 : null;
    return { ...stage, dropOffPercent };
  });
}
