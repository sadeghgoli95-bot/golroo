import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { AnalyticsSnapshot } from "../snapshot/types";
import { getGrowthDashboard, type GrowthDashboard } from "../growth/getGrowthDashboard";
import { getConversionInsightsSafely, type SafeConversionResult } from "../conversion/safeConversionMetrics";
import { getSearchIntelligenceSafely, type SafeMetricsResult } from "../safeGoogleMetrics";
import type { SearchIntelligenceMetrics } from "../search/searchIntelligenceTypes";
import { listAllSnapshots } from "../snapshot/SnapshotRepository";
import { generateInsights, type HistoryInsight } from "../history/insights";
import { findBiggestChanges, type RankedChange } from "../history/rankChanges";
import { buildTimeline, bucketTimelineByRecency, type TimelineEntry, type TimelineBuckets } from "../history/timeline";
import { buildRollups } from "../history/rollups";
import { getSystemStatus, type SystemStatusItem } from "@/lib/dashboard/getSystemStatus";
import type { DateRange } from "../types";
import { compareMetricValue } from "../comparison";
import { buildPriorityMatrix, groupByQuadrant, type PriorityMatrixItem, type MatrixQuadrant } from "./priorityMatrix";
import { buildActionQueue, type ActionQueueItem } from "./actionQueue";
import { buildAlerts, type Alert, type AlertSeverity } from "./alerts";
import { buildExecutiveKpi, type ExecutiveKpi } from "./executiveKpis";
import { buildExecutiveSummary, type ExecutiveSummary } from "./executiveSummary";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };
const TIMELINE_LIMIT = 20;

/** The most recent complete weekly rollup bucket's value for a metric that has no adapter-level previous-period value of its own (e.g. the internal SEO/health scores) — null when fewer than 2 real weekly buckets exist, never a fabricated previous value. */
function getPreviousWeeklyValue(snapshots: AnalyticsSnapshot[], key: "seoScore" | "healthScore"): number | null {
  const buckets = buildRollups(snapshots, "week");
  if (buckets.length < 2) return null;
  return buckets[buckets.length - 2].metrics[key];
}

export type TopPriority = { type: "risk" | "opportunity"; title: string; detail: string } | null;

export type CommandCenter = {
  growth: GrowthDashboard;
  conversion: SafeConversionResult;
  searchIntelligence: SafeMetricsResult<SearchIntelligenceMetrics>;
  historyInsights: HistoryInsight[];
  rankedChanges: { improvements: RankedChange[]; regressions: RankedChange[] };
  timeline: TimelineEntry[];
  timelineBuckets: TimelineBuckets;
  systemStatus: SystemStatusItem[];
  priorityMatrix: PriorityMatrixItem[];
  matrixByQuadrant: Record<MatrixQuadrant, PriorityMatrixItem[]>;
  actionQueue: ActionQueueItem[];
  alerts: Alert[];
  alertCountsBySeverity: Record<AlertSeverity, number>;
  executiveKpis: ExecutiveKpi[];
  topPriority: TopPriority;
  executiveSummary: ExecutiveSummary;
};

/** Exported for the same reason as resolveTopPriority above. */
export function countAlertsBySeverity(alerts: Alert[]): Record<AlertSeverity, number> {
  const counts: Record<AlertSeverity, number> = { critical: 0, warning: 0, opportunity: 0, info: 0 };
  for (const alert of alerts) counts[alert.severity] += 1;
  return counts;
}

/** Exported so other composers (e.g. lib/analytics/reports/getExecutiveReport.ts) reuse the exact same "risk beats opportunity" priority rule instead of re-deriving it. */
export function resolveTopPriority(growth: GrowthDashboard): TopPriority {
  if (growth.biggestRisk) {
    return { type: "risk", title: growth.biggestRisk.title, detail: growth.biggestRisk.detail };
  }
  if (growth.biggestOpportunity) {
    return {
      type: "opportunity",
      title: growth.biggestOpportunity.title,
      detail: `فرصت واقعی در جایگاه ${growth.biggestOpportunity.averagePosition.toFixed(1)} با ${growth.biggestOpportunity.impressions} نمایش`,
    };
  }
  return null;
}

/**
 * Single orchestrator for app/dashboard/command-center/page.tsx (Phase 5).
 * Composes the already-computed real outputs of Phase 3 (getGrowthDashboard),
 * Phase 7 (getConversionInsightsSafely), Phase 2 (getSearchIntelligenceSafely),
 * Phase 6 (snapshot history) and Phase 1 (getSystemStatus) — this file adds
 * no new metric of its own, it only ranks/groups/alerts on top of real
 * numbers those modules already computed, so nothing here can duplicate or
 * diverge from another page's business logic.
 */
export async function getCommandCenter(analyses: ArticleAnalysis[]): Promise<CommandCenter> {
  const [growth, conversion, searchIntelligence, snapshots, systemStatus] = await Promise.all([
    getGrowthDashboard(analyses),
    getConversionInsightsSafely(LAST_30_DAYS, analyses),
    getSearchIntelligenceSafely(LAST_30_DAYS),
    listAllSnapshots().catch(() => []),
    getSystemStatus(),
  ]);

  const historyInsights = generateInsights(snapshots);
  const rankedChanges = findBiggestChanges(snapshots, "week");
  const timeline = buildTimeline(snapshots).slice(0, TIMELINE_LIMIT);
  const timelineBuckets = bucketTimelineByRecency(timeline);

  const allRecommendations = [
    ...growth.recommendations.quickWins,
    ...growth.recommendations.highImpactTasks,
    ...growth.recommendations.maintenanceTasks,
    ...growth.recommendations.republishTasks,
    ...growth.recommendations.criticalIssueTasks,
  ];
  const priorityMatrix = buildPriorityMatrix(allRecommendations);
  const matrixByQuadrant = groupByQuadrant(priorityMatrix);
  const actionQueue = buildActionQueue(priorityMatrix);

  const alerts = buildAlerts({
    systemStatus,
    biggestRisk: growth.biggestRisk,
    criticalIssueCount: growth.recommendations.criticalIssueTasks.length,
    needsUpdatingCount: growth.needsUpdating.length,
    biggestOpportunity: growth.biggestOpportunity,
    quickWinsCount: growth.recommendations.quickWins.length,
    historyInsights,
  });

  const clicksComparison = growth.search.data ? compareMetricValue(growth.search.data.clicks) : null;
  const impressionsComparison = growth.search.data ? compareMetricValue(growth.search.data.impressions) : null;
  const positionComparison = growth.search.data ? compareMetricValue(growth.search.data.averagePosition) : null;
  const usersComparison = growth.traffic.data ? compareMetricValue(growth.traffic.data.users) : null;
  const engagementComparison = growth.traffic.data ? compareMetricValue(growth.traffic.data.engagementRate) : null;
  const conversionComparison = conversion.data ? compareMetricValue(conversion.data.summary.overallConversionRate) : null;

  const executiveKpis: ExecutiveKpi[] = [
    buildExecutiveKpi(
      "siteHealthScore",
      "امتیاز سلامت سایت",
      growth.executiveOverview.siteHealthScore,
      getPreviousWeeklyValue(snapshots, "healthScore")
    ),
    buildExecutiveKpi(
      "avgSeoScore",
      "میانگین امتیاز سئو",
      growth.executiveOverview.avgSeoScore,
      getPreviousWeeklyValue(snapshots, "seoScore")
    ),
    buildExecutiveKpi("clicks30d", "کلیک (۳۰ روز اخیر)", clicksComparison?.current ?? null, clicksComparison?.previous ?? null),
    buildExecutiveKpi(
      "impressions30d",
      "نمایش (۳۰ روز اخیر)",
      impressionsComparison?.current ?? null,
      impressionsComparison?.previous ?? null
    ),
    buildExecutiveKpi(
      "averagePosition30d",
      "میانگین جایگاه",
      positionComparison?.current ?? null,
      positionComparison?.previous ?? null,
      true
    ),
    buildExecutiveKpi("users30d", "کاربران (۳۰ روز اخیر)", usersComparison?.current ?? null, usersComparison?.previous ?? null),
    buildExecutiveKpi(
      "engagementRate30d",
      "نرخ تعامل",
      engagementComparison?.current ?? null,
      engagementComparison?.previous ?? null
    ),
    buildExecutiveKpi(
      "conversionProxyRate30d",
      "نرخ تبدیل تقریبی",
      conversionComparison?.current ?? null,
      conversionComparison?.previous ?? null
    ),
  ];

  const alertCountsBySeverity = countAlertsBySeverity(alerts);

  const executiveSummary = buildExecutiveSummary({
    topPriority: resolveTopPriority(growth),
    alertCountsBySeverity,
    quickWinsCount: growth.recommendations.quickWins.length,
    highImpactCount: growth.recommendations.highImpactTasks.length,
    needsUpdatingCount: growth.needsUpdating.length,
    readyToRepublishCount: growth.readyToRepublish.length,
  });

  return {
    growth,
    conversion,
    searchIntelligence,
    historyInsights,
    rankedChanges,
    timeline,
    timelineBuckets,
    systemStatus,
    priorityMatrix,
    matrixByQuadrant,
    actionQueue,
    alerts,
    alertCountsBySeverity,
    executiveKpis,
    topPriority: resolveTopPriority(growth),
    executiveSummary,
  };
}
