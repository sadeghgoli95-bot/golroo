"use client";

import { useMemo, useState } from "react";
import TrendChart from "./TrendChart";
import type { AnalyticsSnapshot } from "@/lib/analytics/snapshot/types";
import { buildRollups, type RollupGranularity } from "@/lib/analytics/history/rollups";
import { metricLabel, type MetricKey } from "@/lib/analytics/history/metrics";
import type { ChartPoint } from "@/lib/analytics/charts/types";

type RollupTrendsProps = {
  snapshots: AnalyticsSnapshot[];
  metricKeys: MetricKey[];
};

const GRANULARITY_OPTIONS: { value: RollupGranularity; label: string }[] = [
  { value: "day", label: "روزانه" },
  { value: "week", label: "هفتگی" },
  { value: "month", label: "ماهانه" },
  { value: "year", label: "سالانه" },
];

/**
 * Item 1/2 (Daily/Weekly/Monthly/Yearly History, dedicated metric
 * history views): rollup buckets are always derived live from the real
 * daily snapshots via buildRollups — there is no separate rollup
 * storage. Reuses TrendChart (the project's one SVG line chart) the
 * same way HistoryTrends does for its 7/30/90/all toggle; this toggle
 * is granularity instead of range.
 */
export default function RollupTrends({ snapshots, metricKeys }: RollupTrendsProps) {
  const [granularity, setGranularity] = useState<RollupGranularity>("day");

  const buckets = useMemo(() => buildRollups(snapshots, granularity), [snapshots, granularity]);

  if (snapshots.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>هنوز هیچ عکس‌فوری تاریخی ثبت نشده — این نمودارها بعد از اولین اجرای Snapshot روزانه نمایش داده می‌شوند.</p>
      </div>
    );
  }

  const seriesByMetric: Record<string, ChartPoint[]> = {};
  for (const key of metricKeys) {
    seriesByMetric[key] = buckets
      .filter((bucket) => bucket.metrics[key] !== null)
      .map((bucket) => ({ label: bucket.label, value: bucket.metrics[key] as number }));
  }

  return (
    <div>
      <div className="dashboard-button-row" role="group" aria-label="بازه تجمیع">
        {GRANULARITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`dashboard-range-button${granularity === option.value ? " is-active" : ""}`}
            onClick={() => setGranularity(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="dashboard-trend-grid">
        {metricKeys.map((key) => (
          <TrendChart key={key} title={metricLabel(key)} points={seriesByMetric[key]} />
        ))}
      </div>
    </div>
  );
}
