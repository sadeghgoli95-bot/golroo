import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ScoreOverviewWidget from "@/components/dashboard/analytics/ScoreOverviewWidget";
import InsightsWidget from "@/components/dashboard/analytics/InsightsWidget";
import NotificationsWidget from "@/components/dashboard/analytics/NotificationsWidget";
import { getOverviewScores } from "@/lib/analytics/dashboard/getOverviewScores";
import { getInsights } from "@/lib/analytics/dashboard/getInsights";
import { getNotifications } from "@/lib/analytics/dashboard/getNotifications";
import { createArticleRepository } from "@/lib/article/repositories";

export default async function AnalyticsPage() {
  const repository = createArticleRepository();
  const scores = await getOverviewScores(repository);
  const insights = getInsights();
  const notifications = getNotifications();

  return (
    <>
      <DashboardHeader title="تحلیل‌ها" description="امتیازهای کلی محتوای سایت" />
      <ScoreOverviewWidget scores={scores} />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بینش‌ها (Insights)</h2>
        <InsightsWidget insights={insights} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">اعلان‌ها (Notifications)</h2>
        <NotificationsWidget notifications={notifications} />
      </section>
    </>
  );
}
