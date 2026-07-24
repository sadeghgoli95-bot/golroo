import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import BarChart from "@/components/dashboard/BarChart";
import DataTable from "@/components/dashboard/DataTable";
import HistoryTrends from "@/components/dashboard/HistoryTrends";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getExecutiveOverview } from "@/lib/analytics/site/executiveOverview";
import { getPublishingActivity, getPublishingTrendByMonth } from "@/lib/analytics/site/publishingActivity";
import { getSearchMetricsSafely, getTrafficMetricsSafely } from "@/lib/analytics/safeGoogleMetrics";
import { compareMetricValue } from "@/lib/analytics/comparison";
import { listAllSnapshots } from "@/lib/analytics/snapshot/SnapshotRepository";
import type { DateRange } from "@/lib/analytics/types";

const TODAY_RANGE: DateRange = { preset: "today", start: null, end: null };

export default async function OverviewPage() {
  const repository = createArticleRepository();
  const [analyses, searchResult, trafficResult, snapshots] = await Promise.all([
    getSiteAnalysis(repository),
    getSearchMetricsSafely(TODAY_RANGE),
    getTrafficMetricsSafely(TODAY_RANGE),
    listAllSnapshots().catch(() => []),
  ]);

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

  const rowColumns = [
    { key: "label", label: "مورد", render: (row: { label: string; sessions: number; users: number }) => row.label },
    { key: "sessions", label: "نشست", render: (row: { sessions: number }) => row.sessions },
    { key: "users", label: "کاربر", render: (row: { users: number }) => row.users },
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
        <h2 className="dashboard-section-title">عملکرد جستجو (Search Console) — امروز در مقابل دیروز</h2>
        {searchResult.data ? (
          <div className="dashboard-grid">
            <DashboardCard label="کلیک‌ها" value={String(searchResult.data.clicks.current)} comparison={compareMetricValue(searchResult.data.clicks)} />
            <DashboardCard
              label="نمایش‌ها"
              value={String(searchResult.data.impressions.current)}
              comparison={compareMetricValue(searchResult.data.impressions)}
            />
            <DashboardCard
              label="CTR"
              value={`${(searchResult.data.ctr.current * 100).toFixed(1)}٪`}
              comparison={compareMetricValue(searchResult.data.ctr)}
            />
            <DashboardCard
              label="میانگین جایگاه"
              value={searchResult.data.averagePosition.current.toFixed(1)}
              comparison={compareMetricValue(searchResult.data.averagePosition)}
              invertColor
            />
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p>Search Console متصل نیست{searchResult.error ? ` — ${searchResult.error}` : "."}</p>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">ترافیک (Google Analytics 4) — امروز در مقابل دیروز</h2>
        {trafficResult.data ? (
          <>
            <div className="dashboard-grid">
              <DashboardCard label="کاربران" value={String(trafficResult.data.users.current)} comparison={compareMetricValue(trafficResult.data.users)} />
              <DashboardCard
                label="نشست‌ها"
                value={String(trafficResult.data.sessions.current)}
                comparison={compareMetricValue(trafficResult.data.sessions)}
              />
              <DashboardCard
                label="نشست‌های تعامل‌دار"
                value={String(trafficResult.data.engagedSessions.current)}
                comparison={compareMetricValue(trafficResult.data.engagedSessions)}
              />
              <DashboardCard
                label="نرخ تعامل"
                value={`${(trafficResult.data.engagementRate.current * 100).toFixed(1)}٪`}
                comparison={compareMetricValue(trafficResult.data.engagementRate)}
              />
              <DashboardCard
                label="میانگین زمان تعامل"
                value={`${Math.round(trafficResult.data.averageSessionDuration.current)} ثانیه`}
                comparison={compareMetricValue(trafficResult.data.averageSessionDuration)}
              />
              <DashboardCard label="بازدید صفحات" value={String(trafficResult.data.pageViews.current)} comparison={compareMetricValue(trafficResult.data.pageViews)} />
            </div>

            <div className="dashboard-trend-grid" style={{ marginTop: 16 }}>
              <div>
                <p className="dashboard-trend-chart-title">صفحات ورودی (Landing Pages)</p>
                <DataTable
                  rows={trafficResult.data.landingPages.map((row) => ({ label: row.path, sessions: row.sessions, users: row.users }))}
                  getRowKey={(row) => row.label}
                  emptyMessage="داده‌ای وجود ندارد."
                  columns={rowColumns}
                />
              </div>
              <div>
                <p className="dashboard-trend-chart-title">منابع ترافیک (Traffic Sources)</p>
                <DataTable
                  rows={trafficResult.data.trafficSources.map((row) => ({ label: row.source, sessions: row.sessions, users: row.users }))}
                  getRowKey={(row) => row.label}
                  emptyMessage="داده‌ای وجود ندارد."
                  columns={rowColumns}
                />
              </div>
              <div>
                <p className="dashboard-trend-chart-title">دستگاه‌ها (Devices)</p>
                <DataTable
                  rows={trafficResult.data.devices.map((row) => ({ label: row.device, sessions: row.sessions, users: row.users }))}
                  getRowKey={(row) => row.label}
                  emptyMessage="داده‌ای وجود ندارد."
                  columns={rowColumns}
                />
              </div>
              <div>
                <p className="dashboard-trend-chart-title">کشورها (Countries)</p>
                <DataTable
                  rows={trafficResult.data.countries.map((row) => ({ label: row.country, sessions: row.sessions, users: row.users }))}
                  getRowKey={(row) => row.label}
                  emptyMessage="داده‌ای وجود ندارد."
                  columns={rowColumns}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="dashboard-empty-state">
            <p>Google Analytics 4 متصل نیست{trafficResult.error ? ` — ${trafficResult.error}` : "."}</p>
          </div>
        )}
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

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">روندهای تاریخی (Historical Trends)</h2>
        <HistoryTrends snapshots={snapshots} />
      </section>
    </>
  );
}
