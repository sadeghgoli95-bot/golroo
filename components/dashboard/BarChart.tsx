type BarChartProps = {
  data: { label: string; count: number }[];
  emptyMessage?: string;
};

/**
 * A plain CSS bar chart (div widths, no canvas/SVG library) — every
 * distribution/trend chart across the dashboard renders through this one
 * component. No charting dependency was added for this dashboard; this
 * covers every requested chart shape (distributions, trends, issue
 * counts) without one.
 */
export default function BarChart({ data, emptyMessage = "داده‌ای برای نمایش وجود ندارد." }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const max = Math.max(1, ...data.map((item) => item.count));

  return (
    <div className="dashboard-bar-chart">
      {data.map((item) => (
        <div key={item.label} className="dashboard-bar-row">
          <span className="dashboard-bar-label">{item.label}</span>
          <div className="dashboard-bar-track">
            <div className="dashboard-bar-fill" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
          <span className="dashboard-bar-value">{item.count}</span>
        </div>
      ))}
    </div>
  );
}
