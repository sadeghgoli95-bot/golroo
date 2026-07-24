import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ExportBar from "@/components/dashboard/ExportBar";
import { RankedChangeTable, StreakTable, TimelineTable } from "./HistoryInsightTables";
import { listAllSnapshots } from "@/lib/analytics/snapshot/SnapshotRepository";
import { filterSnapshotsByRange, type TrendRangeOption } from "@/lib/analytics/snapshot/getTrendSeries";
import { findBiggestChanges } from "@/lib/analytics/history/rankChanges";
import { detectAllTrends } from "@/lib/analytics/history/trend";
import { detectAllSeasonalPatterns } from "@/lib/analytics/history/seasonality";
import { detectAllDecayEvents, detectAllRecoveryEvents } from "@/lib/analytics/history/streaks";
import { computePositionVolatility } from "@/lib/analytics/history/volatility";
import { generateInsights } from "@/lib/analytics/history/insights";
import { buildTimeline } from "@/lib/analytics/history/timeline";

const VOLATILITY_RANGES: { value: TrendRangeOption; label: string }[] = [
  { value: "7d", label: "۷ روز" },
  { value: "30d", label: "۳۰ روز" },
  { value: "90d", label: "۹۰ روز" },
  { value: "all", label: "کل زمان" },
];

const insightSeverityClass: Record<string, string> = {
  positive: "dashboard-insight-positive",
  warning: "dashboard-insight-warning",
  critical: "dashboard-insight-critical",
  info: "",
};

export default async function HistoryInsightsPage() {
  const snapshots = await listAllSnapshots().catch(() => []);

  const { improvements, regressions } = findBiggestChanges(snapshots, "week");
  const trends = detectAllTrends(snapshots);
  const seasonalPatterns = detectAllSeasonalPatterns(snapshots).filter((pattern) => pattern.sufficient);
  const insufficientSeasonalMetrics = detectAllSeasonalPatterns(snapshots).filter((pattern) => !pattern.sufficient);
  const decayEvents = detectAllDecayEvents(snapshots);
  const recoveryEvents = detectAllRecoveryEvents(snapshots);
  const insights = generateInsights(snapshots);
  const timeline = buildTimeline(snapshots);

  const volatilityByRange = VOLATILITY_RANGES.map((range) => ({
    ...range,
    result: computePositionVolatility(filterSnapshotsByRange(snapshots, range.value)),
  }));

  return (
    <>
      <DashboardHeader
        title="هوش تحلیلی تاریخچه"
        description="بزرگ‌ترین تغییرات، روند بلندمدت، الگوی فصلی، افت/بهبود پیاپی، نوسان رتبه و بینش‌های واقعی — همه از روی عکس‌فوری‌های واقعی."
      />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بزرگ‌ترین بهبودها (هفته اخیر در مقابل هفته قبل)</h2>
        <RankedChangeTable
          rows={improvements}
          emptyMessage="هنوز دو بازه هفتگی کامل با داده واقعی برای مقایسه ثبت نشده — این جدول با انباشته‌شدن عکس‌فوری‌های روزانه پر می‌شود."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بزرگ‌ترین افت‌ها (هفته اخیر در مقابل هفته قبل)</h2>
        <RankedChangeTable
          rows={regressions}
          emptyMessage="هنوز دو بازه هفتگی کامل با داده واقعی برای مقایسه ثبت نشده — این جدول با انباشته‌شدن عکس‌فوری‌های روزانه پر می‌شود."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">روند بلندمدت (Long-Term Trend)</h2>
        <div className="dashboard-score-badge-row">
          {trends.map((trend) => (
            <span key={trend.key} className="dashboard-score-badge">
              <span className="dashboard-score-badge-label">{trend.label}</span>
              <span className="dashboard-score-badge-value">
                {trend.direction === "up" ? "▲ صعودی" : trend.direction === "down" ? "▼ نزولی" : trend.direction === "flat" ? "— ثابت" : "داده ناکافی"}
                {trend.sampleCount > 0 ? ` (${trend.sampleCount} مقدار واقعی)` : ""}
              </span>
            </span>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">الگوی فصلی / روزهای هفته (Seasonal Pattern)</h2>
        {seasonalPatterns.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>تاریخچه واقعی هنوز کمتر از ۲ هفته را پوشش می‌دهد — الگوی روز هفته پس از تکمیل حداقل ۲ هفته داده واقعی نمایش داده می‌شود.</p>
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>معیار</th>
                  {seasonalPatterns[0].days.map((day) => (
                    <th key={day.dayIndex}>{day.dayLabel}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seasonalPatterns.map((pattern) => (
                  <tr key={pattern.key}>
                    <td>{pattern.label}</td>
                    {pattern.days.map((day) => (
                      <td key={day.dayIndex}>{day.average !== null ? Math.round(day.average * 100) / 100 : "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {insufficientSeasonalMetrics.length > 0 ? (
          <p className="dashboard-card-hint" style={{ marginTop: 12 }}>
            بدون الگوی کافی هنوز: {insufficientSeasonalMetrics.map((pattern) => pattern.label).join("، ")}
          </p>
        ) : null}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">افت پیاپی (Decay Events)</h2>
        <StreakTable rows={decayEvents} emptyMessage="در حال حاضر هیچ معیاری افت پیاپی واقعی (۳ بازه یا بیشتر) نداشته است." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بهبود پیاپی (Recovery / Growth Events)</h2>
        <StreakTable rows={recoveryEvents} emptyMessage="در حال حاضر هیچ معیاری در حال بازیابی پس از یک افت پیاپی واقعی نیست." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">نوسان جایگاه جستجو (Ranking Volatility)</h2>
        <div className="dashboard-grid">
          {volatilityByRange.map((range) => (
            <DashboardCard
              key={range.value}
              label={`انحراف معیار جایگاه — ${range.label}`}
              value={range.result.sufficient && range.result.stddev !== null ? range.result.stddev.toFixed(1) : "داده کافی نیست"}
              hint={range.result.sufficient ? `میانگین: ${range.result.mean?.toFixed(1)} | بر اساس ${range.result.sampleCount} روز واقعی` : "حداقل ۲ روز واقعی با مقدار جایگاه لازم است"}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بینش‌ها (Insights)</h2>
        {insights.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>هنوز رویداد واقعی قابل توجهی (افت، بهبود، روند یا نوسان) برای تولید بینش شناسایی نشده است.</p>
          </div>
        ) : (
          <ul className="dashboard-insights-list">
            {insights.map((insight) => (
              <li key={insight.id} className={`dashboard-insight ${insightSeverityClass[insight.severity]}`}>
                <strong>{insight.what}</strong>
                <br />
                {insight.why} — {insight.impact}
                <br />
                <em>{insight.action}</em>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">جدول زمانی / نقاط عطف / تاریخچه تغییرات (Timeline / Milestones / Change Log)</h2>
        <TimelineTable rows={timeline} emptyMessage="هنوز رویداد واقعی قابل‌ثبتی در جدول زمانی وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="history-insights"
          jsonData={{ improvements, regressions, trends, seasonalPatterns, decayEvents, recoveryEvents, insights, timeline }}
          csvRows={timeline.map((entry) => ({
            timestamp: entry.timestamp,
            type: entry.type,
            key: entry.key,
            label: entry.label,
            description: entry.description,
          }))}
        />
      </section>
    </>
  );
}
