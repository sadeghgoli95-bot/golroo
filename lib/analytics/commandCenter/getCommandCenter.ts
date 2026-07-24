import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import { getGrowthDashboard, type GrowthDashboard } from "../growth/getGrowthDashboard";
import { getConversionInsightsSafely, type SafeConversionResult } from "../conversion/safeConversionMetrics";
import { getSearchIntelligenceSafely, type SafeMetricsResult } from "../safeGoogleMetrics";
import type { SearchIntelligenceMetrics } from "../search/searchIntelligenceTypes";
import { listAllSnapshots } from "../snapshot/SnapshotRepository";
import { generateInsights, type HistoryInsight } from "../history/insights";
import { findBiggestChanges, type RankedChange } from "../history/rankChanges";
import { buildTimeline, type TimelineEntry } from "../history/timeline";
import { getSystemStatus, type SystemStatusItem } from "@/lib/dashboard/getSystemStatus";
import type { DateRange } from "../types";
import { buildPriorityMatrix, groupByQuadrant, type PriorityMatrixItem, type MatrixQuadrant } from "./priorityMatrix";
import { buildActionQueue, type ActionQueueItem } from "./actionQueue";
import { buildAlerts, type Alert } from "./alerts";
import { buildExecutiveKpi, type ExecutiveKpi } from "./executiveKpis";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };
const TIMELINE_LIMIT = 20;

export type TopPriority = { type: "risk" | "opportunity"; title: string; detail: string } | null;

export type CommandCenter = {
  growth: GrowthDashboard;
  conversion: SafeConversionResult;
  searchIntelligence: SafeMetricsResult<SearchIntelligenceMetrics>;
  historyInsights: HistoryInsight[];
  rankedChanges: { improvements: RankedChange[]; regressions: RankedChange[] };
  timeline: TimelineEntry[];
  systemStatus: SystemStatusItem[];
  priorityMatrix: PriorityMatrixItem[];
  matrixByQuadrant: Record<MatrixQuadrant, PriorityMatrixItem[]>;
  actionQueue: ActionQueueItem[];
  alerts: Alert[];
  executiveKpis: ExecutiveKpi[];
  topPriority: TopPriority;
};

function resolveTopPriority(growth: GrowthDashboard): TopPriority {
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

  const executiveKpis: ExecutiveKpi[] = [
    buildExecutiveKpi("siteHealthScore", "امتیاز سلامت سایت", growth.executiveOverview.siteHealthScore),
    buildExecutiveKpi("avgSeoScore", "میانگین امتیاز سئو", growth.executiveOverview.avgSeoScore),
    buildExecutiveKpi("clicks30d", "کلیک (۳۰ روز اخیر)", growth.search.data?.clicks.current ?? null),
    buildExecutiveKpi("impressions30d", "نمایش (۳۰ روز اخیر)", growth.search.data?.impressions.current ?? null),
    buildExecutiveKpi("averagePosition30d", "میانگین جایگاه", growth.search.data?.averagePosition.current ?? null, true),
    buildExecutiveKpi("users30d", "کاربران (۳۰ روز اخیر)", growth.traffic.data?.users.current ?? null),
    buildExecutiveKpi("engagementRate30d", "نرخ تعامل", growth.traffic.data?.engagementRate.current ?? null),
    buildExecutiveKpi(
      "conversionProxyRate30d",
      "نرخ تبدیل تقریبی",
      conversion.data?.summary.overallConversionRate.current ?? null
    ),
  ];

  return {
    growth,
    conversion,
    searchIntelligence,
    historyInsights,
    rankedChanges,
    timeline,
    systemStatus,
    priorityMatrix,
    matrixByQuadrant,
    actionQueue,
    alerts,
    executiveKpis,
    topPriority: resolveTopPriority(growth),
  };
}
