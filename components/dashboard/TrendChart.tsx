import type { ChartPoint } from "@/lib/analytics/charts/types";

type TrendChartProps = {
  title: string;
  points: ChartPoint[];
  emptyMessage?: string;
};

const WIDTH = 600;
const HEIGHT = 160;
const PADDING = 8;

/**
 * A dependency-free SVG line chart — same "no charting library" approach
 * as BarChart.tsx, just a polyline instead of CSS bar widths. Reuses
 * ChartPoint (lib/analytics/charts/types.ts, defined for exactly this)
 * rather than a new point shape.
 */
export default function TrendChart({ title, points, emptyMessage = "داده تاریخی کافی برای این نمودار وجود ندارد." }: TrendChartProps) {
  if (points.length === 0) {
    return (
      <div className="dashboard-trend-chart">
        <p className="dashboard-trend-chart-title">{title}</p>
        <div className="dashboard-empty-state">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? WIDTH / 2 : PADDING + (index / (points.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((point.value - min) / range) * (HEIGHT - PADDING * 2);
    return { x, y };
  });

  const pathD = coordinates.map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x},${coordinate.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="dashboard-trend-chart">
      <p className="dashboard-trend-chart-title">{title}</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="dashboard-trend-chart-svg" role="img" aria-label={title}>
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={2} />
        {coordinates.map((coordinate, index) => (
          <circle key={index} cx={coordinate.x} cy={coordinate.y} r={2.5} fill="var(--accent)" />
        ))}
      </svg>
      <div className="dashboard-trend-chart-range">
        <span>
          {first.label}: {first.value}
        </span>
        <span>
          {last.label}: {last.value}
        </span>
      </div>
    </div>
  );
}
