import type { ComparisonResult } from "@/lib/analytics/comparison";
import { METRIC_GLOSSARY } from "@/lib/dashboard/metricGlossary";

type DashboardCardProps = {
  label: string;
  value: string;
  hint?: string;
  /** Phase 1 Part 5 — Dashboard Comparison Engine: every KPI card that has a previous-period value to compare against. */
  comparison?: ComparisonResult;
  /** True for metrics where a lower value is the improvement (e.g. average search position) — flips which trend direction renders as positive/negative. */
  invertColor?: boolean;
  /** Optional key into METRIC_GLOSSARY — when set, renders a plain-language explanation of the metric below the card. */
  glossaryKey?: string;
};

const TREND_ARROW: Record<ComparisonResult["trend"], string> = {
  up: "▲",
  down: "▼",
  flat: "—",
};

function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}٪`;
}

/**
 * `comparison.trend` doesn't mean "good"/"bad" on its own (a rising
 * bounce rate is bad, a rising CTR is good) — callers who need the
 * opposite color mapping pass `invertColor`, everyone else gets the
 * default "up = positive" mapping.
 */
function trendClassName(trend: ComparisonResult["trend"], invertColor: boolean): string {
  if (trend === "flat") return "dashboard-trend-flat";
  const isPositive = invertColor ? trend === "down" : trend === "up";
  return isPositive ? "dashboard-trend-positive" : "dashboard-trend-negative";
}

export default function DashboardCard({ label, value, hint, comparison, invertColor = false, glossaryKey }: DashboardCardProps) {
  const glossaryText = glossaryKey ? METRIC_GLOSSARY[glossaryKey] : undefined;

  return (
    <div className="dashboard-card">
      <p className="dashboard-card-label">{label}</p>
      <p className="dashboard-card-value">{value}</p>
      {comparison ? (
        <p className={`dashboard-card-comparison ${trendClassName(comparison.trend, invertColor)}`}>
          <span>{TREND_ARROW[comparison.trend]}</span>
          {comparison.percentChange !== null ? (
            <span>{formatPercent(comparison.percentChange)}</span>
          ) : (
            <span>—</span>
          )}
          {comparison.previous !== null ? (
            <span className="dashboard-card-comparison-previous">
              قبلی: <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{comparison.previous}</span>
            </span>
          ) : null}
        </p>
      ) : null}
      {hint ? <p className="dashboard-card-hint">{hint}</p> : null}
      {glossaryText ? <p className="dashboard-card-glossary">{glossaryText}</p> : null}
    </div>
  );
}
