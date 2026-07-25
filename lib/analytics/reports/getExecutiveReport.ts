import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import { getGrowthDashboard, type GrowthDashboard } from "../growth/getGrowthDashboard";
import { getConversionInsightsSafely, type SafeConversionResult } from "../conversion/safeConversionMetrics";
import { listAllSnapshots } from "../snapshot/SnapshotRepository";
import { findBiggestChanges, type RankedChange } from "../history/rankChanges";
import { buildTimeline, type TimelineEntry } from "../history/timeline";
import { getSystemStatus, type SystemStatusItem } from "@/lib/dashboard/getSystemStatus";
import { resolveTopPriority, countAlertsBySeverity } from "../commandCenter/getCommandCenter";
import { buildAlerts } from "../commandCenter/alerts";
import { buildExecutiveSummary, type ExecutiveSummary } from "../commandCenter/executiveSummary";
import type { Recommendation } from "../growth/recommendations";
import type { DateRange } from "../types";
import { resolveReportStatus, type ReportStatus } from "./reportStatus";
import { explainChange, type ChangeExplanation } from "./explainChange";

const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };

export type ExecutiveReport = {
  status: ReportStatus;
  summary: ExecutiveSummary;
  growth: GrowthDashboard;
  conversion: SafeConversionResult;
  rankedChanges: { improvements: RankedChange[]; regressions: RankedChange[] };
  biggestImprovement: RankedChange | null;
  biggestImprovementExplanation: ChangeExplanation | null;
  biggestDecline: RankedChange | null;
  biggestDeclineExplanation: ChangeExplanation | null;
  mostImportantAction: Recommendation | null;
  timeline: TimelineEntry[];
  systemStatus: SystemStatusItem[];
  dataFreshness: { lastSyncedAt: string | null; hasEnoughHistory: boolean; snapshotCount: number };
};

/**
 * Single orchestrator for app/dashboard/reports/page.tsx's new executive
 * report section (Phase 3 Part 4). Reuses every existing composer/service
 * this dashboard already has instead of recomputing anything: growth
 * (getGrowthDashboard — Phase 3 Part 2), conversion
 * (getConversionInsightsSafely — Phase 7), history
 * (findBiggestChanges/buildTimeline — Phase 6), integration status
 * (getSystemStatus — Phase 1), and the command-center's own
 * topPriority/alert-counting/executive-summary helpers (Phase 3 Part 1).
 * This file adds only: a deterministic report status, and the
 * Observed/Possible-explanation/Unknown "why" layer for the two biggest
 * real week-over-week changes.
 */
export async function getExecutiveReport(analyses: ArticleAnalysis[]): Promise<ExecutiveReport> {
  const [growth, conversion, snapshots, systemStatus] = await Promise.all([
    getGrowthDashboard(analyses),
    getConversionInsightsSafely(LAST_30_DAYS, analyses),
    listAllSnapshots().catch(() => []),
    getSystemStatus(),
  ]);

  const rankedChanges = findBiggestChanges(snapshots, "week");
  const timeline = buildTimeline(snapshots);

  const topPriority = resolveTopPriority(growth);

  const alerts = buildAlerts({
    systemStatus,
    biggestRisk: growth.biggestRisk,
    criticalIssueCount: growth.recommendations.criticalIssueTasks.length,
    needsUpdatingCount: growth.needsUpdating.length,
    biggestOpportunity: growth.biggestOpportunity,
    quickWinsCount: growth.recommendations.quickWins.length,
    historyInsights: [],
  });
  const alertCountsBySeverity = countAlertsBySeverity(alerts);

  const summary = buildExecutiveSummary({
    topPriority,
    alertCountsBySeverity,
    quickWinsCount: growth.recommendations.quickWins.length,
    highImpactCount: growth.recommendations.highImpactTasks.length,
    needsUpdatingCount: growth.needsUpdating.length,
    readyToRepublishCount: growth.readyToRepublish.length,
  });

  const biggestImprovement = rankedChanges.improvements[0] ?? null;
  const biggestDecline = rankedChanges.regressions[0] ?? null;

  const biggestImprovementExplanation = biggestImprovement
    ? explainChange(
        biggestImprovement,
        rankedChanges.improvements.filter((change) => change.key !== biggestImprovement.key).map((change) => change.label)
      )
    : null;

  const biggestDeclineExplanation = biggestDecline
    ? explainChange(
        biggestDecline,
        rankedChanges.regressions.filter((change) => change.key !== biggestDecline.key).map((change) => change.label)
      )
    : null;

  const mostImportantAction = growth.recommendations.weeklyActionPlan[0] ?? null;

  const hasEnoughHistory = snapshots.length >= 2;
  const hasRealData = Boolean(growth.search.data) || Boolean(growth.traffic.data) || Boolean(conversion.data) || hasEnoughHistory;

  const status = resolveReportStatus({
    hasRealData,
    criticalIssueCount: growth.recommendations.criticalIssueTasks.length,
    biggestRiskPresent: growth.biggestRisk !== null,
    needsUpdatingCount: growth.needsUpdating.length,
    regressionCount: rankedChanges.regressions.length,
  });

  const latestSyncedAt = systemStatus.find((item) => item.lastSyncedAt)?.lastSyncedAt ?? null;

  return {
    status,
    summary,
    growth,
    conversion,
    rankedChanges,
    biggestImprovement,
    biggestImprovementExplanation,
    biggestDecline,
    biggestDeclineExplanation,
    mostImportantAction,
    timeline,
    systemStatus,
    dataFreshness: { lastSyncedAt: latestSyncedAt, hasEnoughHistory, snapshotCount: snapshots.length },
  };
}
