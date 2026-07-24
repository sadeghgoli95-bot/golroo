import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getCommandCenter } from "@/lib/analytics/commandCenter/getCommandCenter";
import { QUADRANT_LABELS, type MatrixQuadrant, type PriorityMatrixItem } from "@/lib/analytics/commandCenter/priorityMatrix";
import type { ActionQueueItem } from "@/lib/analytics/commandCenter/actionQueue";
import type { Alert } from "@/lib/analytics/commandCenter/alerts";
import type { RankedChange } from "@/lib/analytics/history/rankChanges";
import type { TimelineEntry } from "@/lib/analytics/history/timeline";

const alertClassName: Record<Alert["severity"], string> = {
  critical: "dashboard-insight dashboard-insight-critical",
  warning: "dashboard-insight dashboard-insight-warning",
  opportunity: "dashboard-insight dashboard-insight-positive",
  info: "dashboard-insight",
};

const quadrantOrder: MatrixQuadrant[] = ["do_now", "schedule", "fill_in", "reconsider"];

const actionQueueColumns = [
  { key: "priority", label: "اولویت", render: (row: ActionQueueItem) => row.priority },
  { key: "action", label: "اقدام", render: (row: ActionQueueItem) => row.action },
  { key: "reason", label: "دلیل", render: (row: ActionQueueItem) => row.reason },
  { key: "effort", label: "تلاش", render: (row: ActionQueueItem) => row.estimatedEffortLabel },
  { key: "link", label: "لینک", render: (row: ActionQueueItem) => row.link },
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
        <h2 className="dashboard-section-title">هشدارها</h2>
        {center.alerts.length > 0 ? (
          <ul className="dashboard-insights-list">
            {center.alerts.map((alert) => (
              <li key={alert.id} className={alertClassName[alert.severity]}>
                {alert.message}
              </li>
            ))}
          </ul>
        ) : (
          <div className="dashboard-empty-state">
            <p>هیچ هشدار واقعی‌ای در حال حاضر ثبت نشده است.</p>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">شاخص‌های کلیدی اجرایی (KPI)</h2>
        <div className="dashboard-grid">
          {center.executiveKpis.map((kpi) => (
            <DashboardCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.current !== null ? String(kpi.current) : "—"}
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
        <h2 className="dashboard-section-title">جدول زمانی (تحولات اخیر)</h2>
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
            effort: row.effort,
            link: row.link,
          }))}
        />
      </section>
    </>
  );
}
