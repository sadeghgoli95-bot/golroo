import type { AnalyticsSnapshot } from "../snapshot/types";
import { detectAllDecayEvents, detectAllRecoveryEvents } from "./streaks";
import { detectAllTrends } from "./trend";
import { findBiggestChanges } from "./rankChanges";
import { computePositionVolatility } from "./volatility";

export type HistoryInsightSeverity = "positive" | "warning" | "critical" | "info";

export type HistoryInsight = {
  id: string;
  what: string;
  why: string;
  impact: string;
  action: string;
  severity: HistoryInsightSeverity;
};

/** Position stddev above this many rank positions is treated as "notably unstable" — arbitrary but grounded: GSC average position for a given query/page realistically ranges ~1-100, so a swing of more than 3 full positions on average is a visible ranking change, not noise. */
const NOTABLE_POSITION_VOLATILITY = 3;

/**
 * Item 10: every insight here is a direct restatement of a real detected
 * event from items 4-9 (rankChanges, trend, seasonality is intentionally
 * NOT included here — see history page notes: seasonal patterns are
 * shown as data, not turned into a prescriptive insight, since "Tuesdays
 * are usually higher" isn't actionable the way a decay/recovery/trend
 * is). Nothing here invents a number: every `impact` string is built
 * from the real values the underlying detector already computed. If a
 * detector found nothing, no insight is produced for it — this can
 * legitimately return an empty array.
 */
export function generateInsights(snapshots: AnalyticsSnapshot[]): HistoryInsight[] {
  const insights: HistoryInsight[] = [];

  for (const event of detectAllDecayEvents(snapshots)) {
    const first = event.values[0];
    const last = event.values[event.values.length - 1];
    insights.push({
      id: `decay-${event.key}`,
      what: `${event.label} به مدت ${event.streakLength} بازه پیاپی رو به افت بوده است`,
      why: `${event.streakLength} مقدار واقعی پیاپی این معیار در جهت نامطلوب حرکت کرده‌اند`,
      impact: `از ${first.value} به ${last.value}`,
      action: `علت افت ${event.label} را بررسی و پیش از تثبیت روند رسیدگی کنید`,
      severity: "warning",
    });
  }

  for (const event of detectAllRecoveryEvents(snapshots)) {
    const first = event.values[0];
    const last = event.values[event.values.length - 1];
    insights.push({
      id: `recovery-${event.key}`,
      what: `${event.label} پس از یک دوره افت، اکنون ${event.streakLength} بازه پیاپی در حال بهبود است`,
      why: `افت پیاپی واقعی پیش از این ثبت شده بود و روند اکنون معکوس شده است`,
      impact: `از ${first.value} به ${last.value}`,
      action: `اقدامات اخیری که باعث بهبود ${event.label} شده‌اند را مستند و تکرار کنید`,
      severity: "positive",
    });
  }

  for (const trend of detectAllTrends(snapshots)) {
    if (trend.direction !== "up" && trend.direction !== "down") continue;
    const isGood = trend.higherIsBetter ? trend.direction === "up" : trend.direction === "down";
    insights.push({
      id: `trend-${trend.key}`,
      what: `روند بلندمدت ${trend.label} ${trend.direction === "up" ? "صعودی" : "نزولی"} است`,
      why: `شیب رگرسیون خطی روی ${trend.sampleCount} مقدار واقعی این جهت را نشان می‌دهد`,
      impact: `شیب: ${trend.slope !== null ? trend.slope.toFixed(3) : "-"} در هر عکس‌فوری`,
      action: isGood ? `این روند مثبت در ${trend.label} را حفظ کنید` : `علت روند نزولی ${trend.label} را بررسی کنید`,
      severity: isGood ? "positive" : "warning",
    });
  }

  const { improvements, regressions } = findBiggestChanges(snapshots, "week");
  if (improvements[0]) {
    const change = improvements[0];
    insights.push({
      id: `biggest-improvement-${change.key}`,
      what: `بزرگ‌ترین بهبود هفته اخیر: ${change.label}`,
      why: `تغییر واقعی از ${change.fromLabel} به ${change.toLabel}`,
      impact: change.comparison.percentChange !== null ? `${change.comparison.percentChange.toFixed(1)}٪` : `${change.comparison.difference}`,
      action: `عوامل احتمالی این بهبود در ${change.label} را مستند کنید تا تکرارپذیر باشد`,
      severity: "positive",
    });
  }
  if (regressions[0]) {
    const change = regressions[0];
    insights.push({
      id: `biggest-regression-${change.key}`,
      what: `بزرگ‌ترین افت هفته اخیر: ${change.label}`,
      why: `تغییر واقعی از ${change.fromLabel} به ${change.toLabel}`,
      impact: change.comparison.percentChange !== null ? `${change.comparison.percentChange.toFixed(1)}٪` : `${change.comparison.difference}`,
      action: `علت افت ${change.label} را در اسرع وقت بررسی کنید`,
      severity: "critical",
    });
  }

  const volatility = computePositionVolatility(snapshots);
  if (volatility.sufficient && volatility.stddev !== null && volatility.stddev > NOTABLE_POSITION_VOLATILITY) {
    insights.push({
      id: "position-volatility",
      what: `نوسان میانگین جایگاه جستجو در بازه موجود بالاست`,
      why: `انحراف معیار میانگین جایگاه (${volatility.stddev.toFixed(1)}) از آستانه ${NOTABLE_POSITION_VOLATILITY} بیشتر است`,
      impact: `میانگین: ${volatility.mean !== null ? volatility.mean.toFixed(1) : "-"} | انحراف معیار: ${volatility.stddev.toFixed(1)} | بر اساس ${volatility.sampleCount} روز واقعی`,
      action: `ثبات رتبه‌بندی را با بررسی تغییرات فنی، الگوریتمی یا رقابتی بررسی کنید`,
      severity: "warning",
    });
  }

  return insights;
}
