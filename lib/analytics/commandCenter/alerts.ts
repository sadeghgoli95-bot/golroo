import type { BiggestRisk } from "../growth/visibilityTrends";
import type { OpportunityItem } from "../growth/opportunityScoring";
import type { SystemStatusItem } from "@/lib/dashboard/getSystemStatus";
import type { HistoryInsight } from "../history/insights";

export type AlertSeverity = "critical" | "warning" | "opportunity" | "info";

export type Alert = {
  id: string;
  severity: AlertSeverity;
  message: string;
};

export type BuildAlertsInput = {
  systemStatus: SystemStatusItem[];
  biggestRisk: BiggestRisk | null;
  criticalIssueCount: number;
  needsUpdatingCount: number;
  biggestOpportunity: OpportunityItem | null;
  quickWinsCount: number;
  historyInsights: HistoryInsight[];
};

const CORE_INTEGRATION_LABELS = new Set(["Google Search Console", "Google Analytics 4"]);

/**
 * Alert widgets (Phase 5 item) — every alert here is a direct restatement
 * of a real value already computed elsewhere (system status probes, Phase 3
 * risk/opportunity detection, Phase 6 history insights). No alert is
 * generated from a threshold that isn't backed by a real count/value.
 */
export function buildAlerts(input: BuildAlertsInput): Alert[] {
  const alerts: Alert[] = [];

  for (const item of input.systemStatus) {
    if (CORE_INTEGRATION_LABELS.has(item.label) && item.status === "not_configured") {
      alerts.push({ id: `integration-${item.label}`, severity: "critical", message: `${item.label} متصل نیست — ${item.detail}` });
    }
  }

  if (input.biggestRisk) {
    alerts.push({ id: "biggest-risk", severity: "critical", message: `بزرگ‌ترین ریسک: «${input.biggestRisk.title}» — ${input.biggestRisk.detail}` });
  }

  if (input.criticalIssueCount > 0) {
    alerts.push({ id: "critical-issues", severity: "critical", message: `${input.criticalIssueCount} مقاله دارای مشکل بحرانی محتوایی هستند` });
  }

  for (const insight of input.historyInsights) {
    if (insight.severity === "critical") {
      alerts.push({ id: `history-${insight.id}`, severity: "critical", message: insight.what });
    } else if (insight.severity === "warning") {
      alerts.push({ id: `history-${insight.id}`, severity: "warning", message: insight.what });
    }
  }

  if (input.needsUpdatingCount > 0) {
    alerts.push({ id: "needs-updating", severity: "warning", message: `${input.needsUpdatingCount} مقاله نیاز به به‌روزرسانی دارند` });
  }

  if (input.biggestOpportunity) {
    alerts.push({
      id: "biggest-opportunity",
      severity: "opportunity",
      message: `فرصت واقعی: «${input.biggestOpportunity.title}» در جایگاه ${input.biggestOpportunity.averagePosition.toFixed(1)} با ${input.biggestOpportunity.impressions} نمایش`,
    });
  }

  if (input.quickWinsCount > 0) {
    alerts.push({ id: "quick-wins", severity: "opportunity", message: `${input.quickWinsCount} برد سریع (Quick Win) واقعی شناسایی شد` });
  }

  for (const insight of input.historyInsights) {
    if (insight.severity === "positive") {
      alerts.push({ id: `history-info-${insight.id}`, severity: "info", message: insight.what });
    }
  }

  return alerts;
}
