import type { DateRange } from "../types";
import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import { resolveDateRange } from "../dateRange";
import { getConversionSummary } from "./conversionSummary";
import { getConversionFunnel } from "./funnel";
import { getContentAttribution } from "./contentAttribution";
import { getExitRateInsights } from "./businessInsights";
import { getConversionTrends } from "./trends";
import type { ConversionSummary, FunnelStage, ContentAttributionRow, ExitRateRow, ConversionTrends } from "./types";

export type ConversionInsights = {
  summary: ConversionSummary;
  funnel: FunnelStage[];
  contentAttribution: ContentAttributionRow[];
  exitRates: ExitRateRow[];
  trends: ConversionTrends;
};

export type SafeConversionResult = { data: ConversionInsights | null; error: string | null };

/**
 * Same "never throw into a page render" pattern as
 * lib/analytics/safeGoogleMetrics.ts (getTrafficMetricsSafely /
 * getSearchMetricsSafely) — a missing/revoked GA4 credential becomes an
 * honest error string the page renders as an empty state, never a
 * crashed page or a fabricated number.
 */
export async function getConversionInsightsSafely(range: DateRange, analyses: ArticleAnalysis[]): Promise<SafeConversionResult> {
  try {
    const bounds = resolveDateRange(range);
    const [summary, funnel, contentAttribution, exitRates, trends] = await Promise.all([
      getConversionSummary(bounds),
      getConversionFunnel(bounds),
      getContentAttribution(bounds, analyses),
      getExitRateInsights(bounds),
      getConversionTrends(bounds),
    ]);
    return { data: { summary, funnel, contentAttribution, exitRates, trends }, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}
