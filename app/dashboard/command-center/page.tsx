import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getCommandCenter } from "@/lib/analytics/commandCenter/getCommandCenter";
import { QUADRANT_LABELS, type MatrixQuadrant, type PriorityMatrixItem } from "@/lib/analytics/commandCenter/priorityMatrix";
import type { ActionQueueItem } from "@/lib/analytics/commandCenter/actionQueue";
import type { Alert, AlertSeverity } from "@/lib/analytics/commandCenter/alerts";
import type { RankedChange } from "@/lib/analytics/history/rankChanges";
import type { TimelineEntry } from "@/lib/analytics/history/timeline";
import type { Recommendation } from "@/lib/analytics/growth/recommendations";
import type { VisibilityChange } from "@/lib/analytics/growth/visibilityTrends";
import type { NeedsUpdatingItem, ReadyToRepublishItem } from "@/lib/analytics/growth/contentFreshness";

const alertClassName: Record<Alert["severity"], string> = {
  critical: "dashboard-insight dashboard-insight-critical",
  warning: "dashboard-insight dashboard-insight-warning",
  opportunity: "dashboard-insight dashboard-insight-positive",
  info: "dashboard-insight",
};

const alertSeverityOrder: AlertSeverity[] = ["critical", "warning", "opportunity", "info"];
const alertSeverityLabels: Record<AlertSeverity, string> = {
  critical: "بحرانی",
  warning: "هشدار",
  opportunity: "فرصت",
  info: "اطلاع‌رسانی",
};

const quadrantOrder: MatrixQuadrant[] = ["do_now", "schedule", "fill_in", "reconsider"];

const actionQueueColumns = [
  { key: "priority", label: "اولویت", render: (row: ActionQueueItem) => row.priority },
  { key: "action", label: "اقدام", render: (row: ActionQueueItem) => row.action },
  { key: "reason", label: "دلیل", render: (row: ActionQueueItem) => row.reason },
  { key: "impact", label: "اثر مورد انتظار", render: (row: ActionQueueItem) => `${Math.round(row.impact * 100)}٪` },
  { key: "effort", label: "تلاش / زمان تخمینی", render: (row: ActionQueueItem) => row.estimatedEffortLabel },
  { key: "link", label: "لینک", render: (row: ActionQueueItem) => row.link },
];

const recommendationColumns = [
  { key: "title", label: "عنوان", render: (row: Recommendation) => row.title },
  { key: "message", label: "دلیل و اقدام پیشنهادی", render: (row: Recommendation) => row.message },
  { key: "rank", label: "اثر مورد انتظار", render: (row: Recommendation) => `${Math.round(row.rank * 100)}٪` },
];

const matrixColumns = [
  { key: "title", label: "عنوان", render: (row: PriorityMatrixItem) => row.title },
  { key: "message", label: "توضیح", render: (row: PriorityMatrixItem) => row.message },
  { key: "effort", label: "تلاش", render: (row: PriorityMatrixItem) => row.effort },
];

const rankedChangeColumns = [
  { key: "label", label: "معیار", render: (row: RankedChange) => row.label },
  { key: "from", label: "دوره قبل", render: (row: RankedChange) => row.fromLabel },
  { key: "to", label: "دوره فعلی", render: (row: RankedChange) => row.toLabel },
  {
    key: "change",
    label: "تغییر",
    render: (row: RankedChange) => (row.comparison.percentChange !== null ? `${row.comparison.percentChange.toFixed(1)}٪` : String(row.comparison.difference ?? "—")),
  },
];

const visibilityChangeColumns = [
  { key: "title", label: "عنوان", render: (row: VisibilityChange) => row.title },
  { key: "clicks", label: "کلیک فعلی", render: (row: VisibilityChange) => row.comparison.current },
  { key: "previous", label: "کلیک دوره قبل", render: (row: VisibilityChange) => row.comparison.previous ?? "—" },
  {
    key: "change",
    label: "تغییر",
    render: (row: VisibilityChange) => (row.comparison.percentChange !== null ? `${row.comparison.percentChange.toFixed(1)}٪` : String(row.comparison.difference ?? "—")),
  },
];

const needsUpdatingColumns = [
  { key: "title", label: "عنوان", render: (row: NeedsUpdatingItem) => row.title },
  { key: "days", label: "روز از آخرین به‌روزرسانی", render: (row: NeedsUpdatingItem) => row.daysSinceUpdate },
  { key: "reason", label: "دلیل", render: (row: NeedsUpdatingItem) => row.reason },
];

const readyToRepublishColumns = [
  { key: "title", label: "عنوان", render: (row: ReadyToRepublishItem) => row.title },
  { key: "detail", label: "جزئیات", render: (row: ReadyToRepublishItem) => row.detail },
];

const timelineColumns = [
  { key: "timestamp", label: "تاریخ", render: (row: TimelineEntry) => row.timestamp.slice(0, 10) },
  { key: "label", label: "معیار", render: (row: TimelineEntry) => row.label },
  { key: "description", label: "شرح", render: (row: TimelineEntry) => row.description },
];

export default async function CommandCenterPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const center = await getCommandCenter(analyses);

  return (
    <>
      <DashboardHeader
        title="مرکز فرماندهی اجرایی"
        description="خلاصه‌ای از مهم‌ترین اقدام امروز، هشدارها، فرصت‌ها و ریسک‌های واقعی سایت"
      />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خلاصه اجرایی</h2>
        <div className={`dashboard-priority-item dashboard-priority-${center.topPriority?.type === "risk" ? "critical" : "high"}`}>
          <strong>{center.executiveSummary.headline}</strong>
        </div>
        {center.executiveSummary.points.length > 0 ? (
          <ul className="dashboard-insights-list">
            {center.executiveSummary.points.map((point) => (
              <li key={point} className="dashboard-insight">
                {point}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">اولویت امروز</h2>
        {center.topPriority ? (
          <div className={`dashboard-priority-item dashboard-priority-${center.topPriority.type === "risk" ? "critical" : "high"}`}>
            <strong>{center.topPriority.type === "risk" ? "بزرگ‌ترین ریسک: " : "بزرگ‌ترین فرصت: "}</strong>
            {center.topPriority.title} — {center.topPriority.detail}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p>سیگنال واقعی کافی برای تعیین اولویت امروز وجود ندارد.</p>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بزرگ‌ترین فرصت و بزرگ‌ترین ریسک</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <p className="dashboard-card-label">بزرگ‌ترین فرصت</p>
            {center.growth.biggestOpportunity ? (
              <>
                <p className="dashboard-card-value">{center.growth.biggestOpportunity.title}</p>
                <p className="dashboard-card-hint">
                  جایگاه <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{center.growth.biggestOpportunity.averagePosition.toFixed(1)}</span> — <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{center.growth.biggestOpportunity.impressions}</span> نمایش واقعی
                </p>
              </>
            ) : (
              <p className="dashboard-card-hint">سیگنال واقعی کافی برای فرصت وجود ندارد.</p>
            )}
          </div>
          <div className="dashboard-card">
            <p className="dashboard-card-label">بزرگ‌ترین ریسک</p>
            {center.growth.biggestRisk ? (
              <>
                <p className="dashboard-card-value">{center.growth.biggestRisk.title}</p>
                <p className="dashboard-card-hint">{center.growth.biggestRisk.detail}</p>
              </>
            ) : (
              <p className="dashboard-card-hint">سیگنال واقعی کافی برای ریسک وجود ندارد.</p>
            )}
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">هشدارها</h2>
        {alertSeverityOrder.map((severity) => {
          const items = center.alerts.filter((alert) => alert.severity === severity);
          return (
            <div key={severity} style={{ marginTop: "12px" }}>
              <h3 className="dashboard-section-title">
                {alertSeverityLabels[severity]} ({center.alertCountsBySeverity[severity]})
              </h3>
              {items.length > 0 ? (
                <ul className="dashboard-insights-list">
                  {items.map((alert) => (
                    <li key={alert.id} className={alertClassName[alert.severity]}>
                      {alert.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="dashboard-empty-state">
                  <p>هیچ هشدار واقعی‌ای در این دسته ثبت نشده است.</p>
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">شاخص‌های کلیدی اجرایی (KPI)</h2>
        <div className="dashboard-grid">
          {center.executiveKpis.map((kpi) => (
            <DashboardCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.current !== null ? String(kpi.current) : "—"}
              comparison={kpi.comparison ?? undefined}
              invertColor={kpi.invertColor}
              hint={
                kpi.target !== null
                  ? `هدف: ${kpi.target} — پیشرفت: ${kpi.progressPercent !== null ? `${kpi.progressPercent}٪` : "—"}`
                  : "بدون هدف تنظیم‌شده (در lib/analytics/commandCenter/targets.config.ts قابل تنظیم است)"
              }
            />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بردهای سریع (Quick Wins)</h2>
        <DataTable
          rows={center.growth.recommendations.quickWins}
          getRowKey={(row) => `quick-win-${row.slug}`}
          emptyMessage="در حال حاضر برد سریع واقعی شناسایی نشده است."
          columns={recommendationColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">اقدامات با اثر بالا (High Impact Actions)</h2>
        <DataTable
          rows={center.growth.recommendations.highImpactTasks}
          getRowKey={(row) => `high-impact-${row.slug}`}
          emptyMessage="در حال حاضر اقدام با اثر بالای واقعی شناسایی نشده است."
          columns={recommendationColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات نیازمند رسیدگی فوری</h2>
        <DataTable
          rows={center.growth.recommendations.criticalIssueTasks}
          getRowKey={(row) => `critical-${row.slug}`}
          emptyMessage="در حال حاضر صفحه‌ای با مشکل بحرانی واقعی ثبت نشده است."
          columns={recommendationColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صف اقدام (Action Queue)</h2>
        <DataTable rows={center.actionQueue} getRowKey={(row) => `${row.priority}-${row.link}`} emptyMessage="در حال حاضر اقدام اولویت‌داری ثبت نشده است." columns={actionQueueColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">ماتریس اولویت (اثر × تلاش)</h2>
        <div className="dashboard-grid">
          {quadrantOrder.map((quadrant) => (
            <div key={quadrant} className="dashboard-card">
              <p className="dashboard-card-label">{QUADRANT_LABELS[quadrant]}</p>
              <p className="dashboard-card-value">{center.matrixByQuadrant[quadrant].length}</p>
            </div>
          ))}
        </div>
        {quadrantOrder.map((quadrant) => (
          <div key={quadrant} style={{ marginTop: "16px" }}>
            <h3 className="dashboard-section-title">{QUADRANT_LABELS[quadrant]}</h3>
            <DataTable
              rows={center.matrixByQuadrant[quadrant]}
              getRowKey={(row) => `${row.category}-${row.slug}`}
              emptyMessage="موردی در این بخش نیست."
              columns={matrixColumns}
            />
          </div>
        ))}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات با بهبود اخیر</h2>
        <DataTable
          rows={center.growth.improvingVisibility}
          getRowKey={(row) => `improve-page-${row.slug}`}
          emptyMessage="بهبود کلیک قابل‌توجهی نسبت به دوره قبل (۳۰ روز) در صفحات ثبت نشده است."
          columns={visibilityChangeColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات با افت اخیر</h2>
        <DataTable
          rows={center.growth.losingVisibility}
          getRowKey={(row) => `decline-page-${row.slug}`}
          emptyMessage="افت کلیک قابل‌توجهی نسبت به دوره قبل (۳۰ روز) در صفحات ثبت نشده است."
          columns={visibilityChangeColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات آماده به‌روزرسانی</h2>
        <DataTable
          rows={center.growth.needsUpdating}
          getRowKey={(row) => `needs-update-${row.slug}`}
          emptyMessage="در حال حاضر مقاله‌ای که هم قدیمی و هم رو به افت باشد شناسایی نشده است."
          columns={needsUpdatingColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات آماده انتشار یا بازنشر</h2>
        <DataTable
          rows={center.growth.readyToRepublish}
          getRowKey={(row) => `ready-republish-${row.slug}`}
          emptyMessage="در حال حاضر مقاله آماده انتشار یا بازنشر واقعی ثبت نشده است."
          columns={readyToRepublishColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بزرگ‌ترین بهبودها و افت‌های اخیر (هفتگی)</h2>
        <DataTable
          rows={center.rankedChanges.improvements}
          getRowKey={(row) => `improve-${row.key}`}
          emptyMessage="داده تاریخی کافی برای مقایسه هفتگی هنوز ثبت نشده است."
          columns={rankedChangeColumns}
        />
        <DataTable
          rows={center.rankedChanges.regressions}
          getRowKey={(row) => `regress-${row.key}`}
          emptyMessage="افت قابل‌توجهی نسبت به هفته قبل ثبت نشده است."
          columns={rankedChangeColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">جدول زمانی فشرده (امروز / این هفته / این ماه)</h2>
        <h3 className="dashboard-section-title">امروز</h3>
        <DataTable rows={center.timelineBuckets.today} getRowKey={(row) => row.id} emptyMessage="رویداد واقعی امروز ثبت نشده است." columns={timelineColumns} />
        <h3 className="dashboard-section-title">این هفته</h3>
        <DataTable rows={center.timelineBuckets.thisWeek} getRowKey={(row) => row.id} emptyMessage="رویداد واقعی این هفته ثبت نشده است." columns={timelineColumns} />
        <h3 className="dashboard-section-title">این ماه</h3>
        <DataTable rows={center.timelineBuckets.thisMonth} getRowKey={(row) => row.id} emptyMessage="رویداد واقعی این ماه ثبت نشده است." columns={timelineColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">جدول زمانی کامل (تحولات اخیر)</h2>
        <DataTable rows={center.timeline} getRowKey={(row) => row.id} emptyMessage="هنوز رویداد واقعی‌ای ثبت نشده است." columns={timelineColumns} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">وضعیت اتصال یکپارچه‌سازی‌ها</h2>
        <DataTable
          rows={center.systemStatus}
          getRowKey={(row) => row.label}
          emptyMessage="اطلاعاتی ثبت نشده است."
          columns={[
            { key: "label", label: "سرویس", render: (row) => row.label },
            { key: "status", label: "وضعیت", render: (row) => (row.status === "connected" ? "متصل" : "متصل نیست") },
            { key: "detail", label: "جزئیات", render: (row) => row.detail },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="command-center"
          jsonData={center}
          csvRows={center.actionQueue.map((row) => ({
            priority: row.priority,
            action: row.action,
            reason: row.reason,
            impact: row.impact,
            effort: row.effort,
            link: row.link,
          }))}
        />
      </section>
    </>
  );
}
