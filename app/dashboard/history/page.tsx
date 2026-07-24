import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ExportBar from "@/components/dashboard/ExportBar";
import RollupTrends from "@/components/dashboard/RollupTrends";
import ComparisonEngine from "@/components/dashboard/ComparisonEngine";
import { listAllSnapshots } from "@/lib/analytics/snapshot/SnapshotRepository";

export default async function HistoryPage() {
  const snapshots = await listAllSnapshots().catch(() => []);

  return (
    <>
      <DashboardHeader
        title="تاریخچه"
        description="روزانه، هفتگی، ماهانه و سالانه — همه از روی عکس‌فوری‌های واقعی ثبت‌شده محاسبه می‌شود، بدون داده ساختگی."
      />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تاریخچه سئو (SEO History)</h2>
        <RollupTrends snapshots={snapshots} metricKeys={["seoScore", "aeoScore", "geoScore", "position", "ctr"]} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تاریخچه ترافیک (Traffic History)</h2>
        <RollupTrends snapshots={snapshots} metricKeys={["clicks", "impressions", "users", "sessions"]} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تاریخچه تعامل (Engagement History)</h2>
        <RollupTrends snapshots={snapshots} metricKeys={["engagementRate"]} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تاریخچه رشد محتوا (Content Growth History)</h2>
        <RollupTrends snapshots={snapshots} metricKeys={["publishedArticles"]} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تاریخچه انتشار (Publishing History)</h2>
        <p className="dashboard-card-hint" style={{ margin: "0 0 12px" }}>
          این نمودار روند تجمعیِ تعداد پیش‌نویس‌ها را نشان می‌دهد — چون هیچ عکس‌فوری «تعداد مقاله منتشرشده در همان روز» را
          به‌صورت رویداد جداگانه ذخیره نمی‌کند، بلکه فقط شمار کل روزانه را ثبت می‌کند (فیلد draftArticles).
        </p>
        <RollupTrends snapshots={snapshots} metricKeys={["draftArticles"]} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تاریخچه سلامت (Health History)</h2>
        <RollupTrends snapshots={snapshots} metricKeys={["healthScore", "criticalIssues", "warnings"]} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">موتور مقایسه دوره‌ای (Comparison Engine)</h2>
        <ComparisonEngine snapshots={snapshots} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="history-snapshots"
          jsonData={snapshots}
          csvRows={snapshots.map((snapshot) => ({
            timestamp: snapshot.timestamp,
            seoScore: snapshot.seoScore,
            healthScore: snapshot.healthScore,
            aeoScore: snapshot.aeoScore,
            geoScore: snapshot.geoScore,
            clicks: snapshot.clicks,
            impressions: snapshot.impressions,
            ctr: snapshot.ctr,
            position: snapshot.position,
            users: snapshot.users,
            sessions: snapshot.sessions,
            engagementRate: snapshot.engagementRate,
            publishedArticles: snapshot.publishedArticles,
            draftArticles: snapshot.draftArticles,
            criticalIssues: snapshot.criticalIssues,
            warnings: snapshot.warnings,
          }))}
        />
      </section>
    </>
  );
}
