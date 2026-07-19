import type { Insight } from "@/lib/analytics/types";

type InsightsWidgetProps = {
  insights: Insight[];
};

export default function InsightsWidget({ insights }: InsightsWidgetProps) {
  if (insights.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>بینشی برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <ul className="dashboard-insights-list">
      {insights.map((insight) => (
        <li key={insight.id} className={`dashboard-insight dashboard-insight-${insight.severity}`}>
          {insight.message}
        </li>
      ))}
    </ul>
  );
}
