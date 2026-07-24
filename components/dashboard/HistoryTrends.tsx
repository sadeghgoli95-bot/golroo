"use client";

import { useMemo, useState } from "react";
import TrendChart from "./TrendChart";
import type { AnalyticsSnapshot } from "@/lib/analytics/snapshot/types";
import { filterSnapshotsByRange, buildTrendSeries, type TrendRangeOption } from "@/lib/analytics/snapshot/getTrendSeries";

type HistoryTrendsProps = {
  snapshots: AnalyticsSnapshot[];
};

const RANGE_OPTIONS: { value: TrendRangeOption; label: string }[] = [
  { value: "7d", label: "۷ روز" },
  { value: "30d", label: "۳۰ روز" },
  { value: "90d", label: "۹۰ روز" },
  { value: "all", label: "کل زمان" },
];

const CHART_DEFINITIONS: { key: keyof ReturnType<typeof buildTrendSeries>; title: string }[] = [
  { key: "seoScore", title: "روند امتیاز سئو (SEO Score Trend)" },
  { key: "healthScore", title: "روند سلامت سایت (Health Trend)" },
  { key: "aeoScore", title: "روند AEO" },
  { key: "geoScore", title: "روند GEO" },
  { key: "clicks", title: "روند کلیک‌ها (Clicks Trend)" },
  { key: "impressions", title: "روند نمایش‌ها (Impressions Trend)" },
  { key: "ctr", title: "روند CTR" },
  { key: "position", title: "روند جایگاه (Position Trend)" },
  { key: "users", title: "روند کاربران (Traffic Trend)" },
  { key: "sessions", title: "روند نشست‌ها" },
  { key: "publishedArticles", title: "رشد محتوا (Content Growth)" },
  { key: "criticalIssues", title: "روند مشکلات (Issue Trend)" },
];

/**
 * All history is fetched once, server-side (see app/dashboard/page.tsx) —
 * the 7/30/90/All-time toggle only filters the already-loaded array
 * client-side, never re-fetches.
 */
export default function HistoryTrends({ snapshots }: HistoryTrendsProps) {
  const [range, setRange] = useState<TrendRangeOption>("30d");

  const series = useMemo(() => buildTrendSeries(filterSnapshotsByRange(snapshots, range)), [snapshots, range]);

  if (snapshots.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>هنوز هیچ عکس‌فوری تاریخی ثبت نشده — این نمودارها بعد از اولین اجرای Snapshot روزانه نمایش داده می‌شوند.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-button-row" role="group" aria-label="بازه زمانی">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`dashboard-range-button${range === option.value ? " is-active" : ""}`}
            onClick={() => setRange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="dashboard-trend-grid">
        {CHART_DEFINITIONS.map((definition) => (
          <TrendChart key={definition.key} title={definition.title} points={series[definition.key]} />
        ))}
      </div>
    </div>
  );
}
