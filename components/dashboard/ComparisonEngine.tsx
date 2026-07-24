"use client";

import { useMemo, useState } from "react";
import DashboardCard from "./DashboardCard";
import type { AnalyticsSnapshot } from "@/lib/analytics/snapshot/types";
import { comparePeriod, compareCustomRange } from "@/lib/analytics/history/periodComparison";
import { getCustomComparisonBounds, type PeriodGranularity } from "@/lib/analytics/history/periods";

type ComparisonEngineProps = {
  snapshots: AnalyticsSnapshot[];
};

const GRANULARITY_OPTIONS: { value: PeriodGranularity; label: string }[] = [
  { value: "day", label: "روز به روز" },
  { value: "week", label: "هفته به هفته" },
  { value: "month", label: "ماه به ماه" },
  { value: "quarter", label: "فصل به فصل" },
  { value: "year", label: "سال به سال" },
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Item 3: Day vs Day / Week vs Week / Month vs Month / Quarter vs
 * Quarter / Year vs Year + a Custom Range picker. All snapshots are
 * already fetched server-side (see app/dashboard/history/page.tsx) —
 * switching period type or custom dates only re-runs the comparison
 * client-side over the array already in memory, same pattern as
 * HistoryTrends' range toggle.
 */
export default function ComparisonEngine({ snapshots }: ComparisonEngineProps) {
  const [mode, setMode] = useState<PeriodGranularity | "custom">("week");
  const [customStart, setCustomStart] = useState(todayIso());
  const [customEnd, setCustomEnd] = useState(todayIso());

  const result = useMemo(() => {
    if (mode === "custom") {
      const start = new Date(`${customStart}T00:00:00.000Z`);
      const endExclusive = new Date(`${customEnd}T00:00:00.000Z`);
      endExclusive.setUTCDate(endExclusive.getUTCDate() + 1); // the picker's "تا" date is inclusive; bounds internally are [start, end)
      if (endExclusive.getTime() <= start.getTime()) return null;
      const bounds = getCustomComparisonBounds(start, endExclusive);
      return compareCustomRange(snapshots, bounds.current, bounds.previous);
    }
    return comparePeriod(snapshots, mode);
  }, [snapshots, mode, customStart, customEnd]);

  if (snapshots.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>هنوز عکس‌فوری تاریخی‌ای برای مقایسه دوره‌ای ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-button-row" role="group" aria-label="نوع مقایسه">
        {GRANULARITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`dashboard-range-button${mode === option.value ? " is-active" : ""}`}
            onClick={() => setMode(option.value)}
          >
            {option.label}
          </button>
        ))}
        <button
          type="button"
          className={`dashboard-range-button${mode === "custom" ? " is-active" : ""}`}
          onClick={() => setMode("custom")}
        >
          بازه دلخواه
        </button>
      </div>

      {mode === "custom" ? (
        <div className="dashboard-custom-range-picker">
          <label>
            از
            <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
          </label>
          <label>
            تا
            <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
          </label>
        </div>
      ) : null}

      {result === null ? (
        <div className="dashboard-empty-state">
          <p>بازه انتخابی نامعتبر است — تاریخ پایان باید بعد از تاریخ شروع باشد.</p>
        </div>
      ) : (
        <>
          <p className="dashboard-trend-chart-range" style={{ marginTop: 12 }}>
            <span>
              {result.currentLabel} ({result.currentSampleCount} عکس‌فوری)
            </span>
            <span>
              در مقابل {result.previousLabel} ({result.previousSampleCount} عکس‌فوری)
            </span>
          </p>
          <div className="dashboard-grid" style={{ marginTop: 12 }}>
            {result.metrics.map((metric) =>
              metric.hasCurrentData && metric.comparison ? (
                <DashboardCard
                  key={metric.key}
                  label={metric.label}
                  value={String(Math.round(metric.comparison.current * 100) / 100)}
                  comparison={metric.hasPreviousData ? metric.comparison : undefined}
                  invertColor={!metric.higherIsBetter}
                  hint={!metric.hasPreviousData ? "داده دوره قبل ثبت نشده" : undefined}
                />
              ) : (
                <div key={metric.key} className="dashboard-card">
                  <p className="dashboard-card-label">{metric.label}</p>
                  <p className="dashboard-card-hint">داده واقعی برای این دوره ثبت نشده است</p>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
