import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import BarChart from "@/components/dashboard/BarChart";
import ExportBar from "@/components/dashboard/ExportBar";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getExecutiveOverview } from "@/lib/analytics/site/executiveOverview";
import { getContentAnalytics } from "@/lib/analytics/site/contentAnalytics";
import { getSeoInsights } from "@/lib/analytics/site/seoInsights";
import { getSiteHealth } from "@/lib/analytics/site/siteHealth";
import {
  getPublishingActivity,
  getPublishingTrendByMonth,
  getCategoryGrowthByMonth,
} from "@/lib/analytics/site/publishingActivity";
import { topN, bottomN, average } from "@/lib/analytics/site/shared";

const TOP_TEN = 10;

export default async function ReportsCenterPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);

  const overview = getExecutiveOverview(analyses);
  const content = getContentAnalytics(analyses);
  const seo = getSeoInsights(analyses);
  const health = getSiteHealth(analyses);
  const activity = getPublishingActivity(analyses);
  const publishingTrend = getPublishingTrendByMonth(analyses);
  const categoryGrowth = getCategoryGrowthByMonth(analyses);

  const overallScoreOf = (item: (typeof analyses)[number]) => item.detailedScores.overall;
  const bestOverall = topN(analyses, TOP_TEN, overallScoreOf).map((item) => ({
    slug: item.article.slug ?? "",
    title: item.article.title ?? "بدون عنوان",
    score: overallScoreOf(item),
  }));
  const worstOverall = bottomN(analyses, TOP_TEN, overallScoreOf).map((item) => ({
    slug: item.article.slug ?? "",
    title: item.article.title ?? "بدون عنوان",
    score: overallScoreOf(item),
  }));

  const articleColumns = [
    { key: "title", label: "عنوان", render: (row: { slug: string; title: string }) => row.title },
    { key: "slug", label: "Slug", render: (row: { slug: string }) => row.slug },
  ];

  const fullReport = { overview, content, seo, health, activity, publishingTrend, categoryGrowth, bestOverall, worstOverall };

  return (
    <>
      <DashboardHeader title="گزارش‌ها" description="خلاصه اجرایی وضعیت کل سایت میرورا" />

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خلاصه اجرایی</h2>
        <div className="dashboard-grid">
          <DashboardCard label="امتیاز کلی سایت" value={String(overview.siteHealthScore)} />
          <DashboardCard label="امتیاز سئو" value={String(overview.avgSeoScore)} />
          <DashboardCard label="امتیاز AEO" value={String(overview.avgAeoScore)} />
          <DashboardCard label="امتیاز GEO" value={String(overview.avgGeoScore)} />
          <DashboardCard label="کیفیت محتوا" value={String(average(analyses.map((item) => item.review.contentQuality.scores.content)))} />
          <DashboardCard label="امتیاز سلامت سایت" value={String(health.healthScore)} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۰ مقاله برتر</h2>
        <DataTable
          rows={bestOverall}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای ثبت نشده است."
          columns={[...articleColumns, { key: "score", label: "امتیاز کلی", render: (row) => row.score }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۱۰ مقاله ضعیف‌تر</h2>
        <DataTable
          rows={worstOverall}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای ثبت نشده است."
          columns={[...articleColumns, { key: "score", label: "امتیاز کلی", render: (row) => row.score }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بزرگ‌ترین مشکلات سئو</h2>
        <DataTable
          rows={seo.lowestSeoArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مشکل قابل‌توجهی یافت نشد."
          columns={[...articleColumns, { key: "score", label: "امتیاز سئو", render: (row) => row.score }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بزرگ‌ترین مشکلات محتوا</h2>
        <DataTable
          rows={content.worstArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مشکل قابل‌توجهی یافت نشد."
          columns={[...articleColumns, { key: "score", label: "امتیاز محتوا", render: (row) => row.score }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بالاترین اولویت اصلاح (مشکلات بحرانی)</h2>
        {overview.topRecommendations.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>مورد بحرانی‌ای ثبت نشده است.</p>
          </div>
        ) : (
          <ul className="dashboard-insights-list">
            {overview.topRecommendations.map((recommendation) => (
              <li key={recommendation} className="dashboard-insight dashboard-insight-critical">
                {recommendation}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">آمار زمانی انتشار</h2>
        <div className="dashboard-grid">
          <DashboardCard label="۷ روز اخیر" value={String(activity.last7Days)} />
          <DashboardCard label="۳۰ روز اخیر" value={String(activity.last30Days)} />
          <DashboardCard label="۹۰ روز اخیر" value={String(activity.last90Days)} />
          <DashboardCard label="کل زمان" value={String(activity.allTime)} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات منتشرشده اخیر</h2>
        <DataTable
          rows={bottomN(
            analyses.filter((item) => item.article.publishedAt !== null),
            TOP_TEN,
            (item) => -new Date(item.article.publishedAt as string).getTime()
          ).map((item) => ({ slug: item.article.slug ?? "", title: item.article.title ?? "بدون عنوان", date: item.article.publishedAt ?? "" }))}
          getRowKey={(row) => row.slug}
          emptyMessage="هیچ مقاله‌ای تاریخ انتشار ثبت‌شده ندارد."
          columns={[...articleColumns, { key: "date", label: "تاریخ انتشار", render: (row) => row.date }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات منتشرنشده در ۶ ماه اخیر</h2>
        <DataTable
          rows={health.articlesNeedingUpdate}
          getRowKey={(row) => row.slug}
          emptyMessage="همه مقالات به‌روز هستند."
          columns={[...articleColumns, { key: "lastKnownDate", label: "آخرین تاریخ ثبت‌شده", render: (row) => row.lastKnownDate ?? "ثبت نشده" }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">موارد گمشده در سطح سایت</h2>
        <div className="dashboard-grid">
          <DashboardCard label="فاقد لینک داخلی" value={String(analyses.length - seo.internalLinkOpportunities.length)} />
          <DashboardCard label="فاقد لینک خارجی" value={String(seo.externalLinkOpportunities.length)} />
          <DashboardCard label="فاقد منبع" value={String(content.missingSources.length)} />
          <DashboardCard label="فاقد سوالات متداول" value={String(content.missingFaq.length)} />
          <DashboardCard label="فاقد تصویر" value={String(content.missingImages.length)} />
          <DashboardCard label="فاقد Meta Description" value={String(seo.missingMetaDescription.length)} />
          <DashboardCard label="فاقد Structured Data" value={String(seo.jsonLdStatus.withoutIt)} />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">روند انتشار ماهانه</h2>
        <BarChart data={publishingTrend} emptyMessage="داده کافی برای روند انتشار وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">رشد دسته‌بندی‌ها</h2>
        <BarChart data={categoryGrowth} emptyMessage="داده کافی برای رشد دسته‌بندی وجود ندارد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع زمان مطالعه</h2>
        <BarChart data={content.readingTimeDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع مشکلات</h2>
        <BarChart data={seo.issueDistribution} />
      </section>

      <section className="dashboard-section" data-print-hide>
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <p className="dashboard-header-description">
          گزارش کامل قابل چاپ است (از دکمه «چاپ / PDF» استفاده کنید) و به صورت CSV/JSON نیز قابل دریافت است.
        </p>
        <ExportBar
          filename="reports-center"
          jsonData={fullReport}
          csvRows={analyses.map((item) => ({
            slug: item.article.slug ?? "",
            title: item.article.title ?? "",
            overallScore: item.detailedScores.overall,
            seoScore: item.review.seo.score,
            aeoScore: item.review.aeo.score,
            geoScore: item.review.geo.score,
            contentScore: item.review.contentQuality.scores.content,
            publishReadiness: item.review.publishReadiness.status,
            publishedAt: item.article.publishedAt ?? "",
            lastUpdated: item.article.lastUpdated ?? "",
          }))}
        />
      </section>
    </>
  );
}
