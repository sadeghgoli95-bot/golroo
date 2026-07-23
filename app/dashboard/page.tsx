import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import BarChart from "@/components/dashboard/BarChart";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getExecutiveOverview } from "@/lib/analytics/site/executiveOverview";
import { getPublishingActivity, getPublishingTrendByMonth } from "@/lib/analytics/site/publishingActivity";

export default async function OverviewPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const overview = getExecutiveOverview(analyses);
  const activity = getPublishingActivity(analyses);
  const publishingTrend = getPublishingTrendByMonth(analyses);

  const scoreCards = [
    { label: "امتیاز سلامت سایت (Site Health)", value: String(overview.siteHealthScore) },
    { label: "امتیاز سئو (SEO)", value: String(overview.avgSeoScore) },
    { label: "امتیاز AEO", value: String(overview.avgAeoScore) },
    { label: "امتیاز GEO", value: String(overview.avgGeoScore) },
  ];

  const countCards = [
    { label: "کل مقالات", value: String(overview.totalArticles) },
    { label: "مقالات منتشرشده", value: String(overview.publishedArticles) },
    { label: "پیش‌نویس‌ها", value: String(overview.draftArticles) },
    { label: "آماده انتشار", value: String(overview.readyToPublish) },
    { label: "مشکلات بحرانی", value: String(overview.criticalIssuesCount) },
  ];

  return (
    <>
      <DashboardHeader title="نمای کلی" description="وضعیت کلی محتوا و سئوی میرورا" />

      <div className="dashboard-grid">
        {scoreCards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">آمار محتوا</h2>
        <div className="dashboard-grid">
          {countCards.map((card) => (
            <DashboardCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">فعالیت انتشار</h2>
        <div className="dashboard-grid">
          <DashboardCard label="۷ روز اخیر" value={String(activity.last7Days)} />
          <DashboardCard label="۳۰ روز اخیر" value={String(activity.last30Days)} />
          <DashboardCard label="۹۰ روز اخیر" value={String(activity.last90Days)} />
          <DashboardCard label="کل زمان" value={String(activity.allTime)} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">پیشنهادات پرتکرار (Recommendations)</h2>
        {overview.topRecommendations.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>در حال حاضر پیشنهاد فوری‌ای برای بهبود وجود ندارد.</p>
          </div>
        ) : (
          <ul className="dashboard-insights-list">
            {overview.topRecommendations.map((recommendation) => (
              <li key={recommendation} className="dashboard-insight dashboard-insight-warning">
                {recommendation}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">روند انتشار ماهانه</h2>
        <BarChart data={publishingTrend} emptyMessage="هنوز مقاله‌ای با تاریخ انتشار ثبت‌شده وجود ندارد." />
      </section>
    </>
  );
}
