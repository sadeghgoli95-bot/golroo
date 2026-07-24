import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import BarChart from "@/components/dashboard/BarChart";
import ExportBar from "@/components/dashboard/ExportBar";
import { OpportunityTable, ContentRankingTable } from "./GrowthTables";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getGrowthDashboard } from "@/lib/analytics/growth/getGrowthDashboard";
import type { GrowthPotentialEstimate } from "@/lib/analytics/growth/growthPotential";
import type { VisibilityChange } from "@/lib/analytics/growth/visibilityTrends";
import type { NeedsUpdatingItem, ReadyToRepublishItem } from "@/lib/analytics/growth/contentFreshness";
import type { HighTrafficLowEngagementItem } from "@/lib/analytics/growth/pageEngagement";
import type { BookingSignalItem } from "@/lib/analytics/growth/bookingSignal";
import type { Recommendation } from "@/lib/analytics/growth/recommendations";
import type { SearchPageMetric } from "@/lib/analytics/search/types";

const pageColumns = [
  { key: "page", label: "صفحه", render: (row: SearchPageMetric) => row.page },
  { key: "clicks", label: "کلیک", render: (row: SearchPageMetric) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: SearchPageMetric) => row.impressions },
  { key: "ctr", label: "CTR", render: (row: SearchPageMetric) => `${(row.ctr * 100).toFixed(1)}٪` },
  { key: "averagePosition", label: "جایگاه", render: (row: SearchPageMetric) => row.averagePosition.toFixed(1) },
];

const growthPotentialColumns = [
  { key: "page", label: "صفحه", render: (row: GrowthPotentialEstimate) => row.page },
  { key: "currentPosition", label: "جایگاه فعلی", render: (row: GrowthPotentialEstimate) => row.currentPosition.toFixed(1) },
  { key: "currentCtr", label: "CTR فعلی", render: (row: GrowthPotentialEstimate) => `${(row.currentCtr * 100).toFixed(1)}٪` },
  {
    key: "estimate",
    label: `تخمین کلیک اضافه (رسیدن به جایگاه ${growthTargetLabel()})`,
    render: (row: GrowthPotentialEstimate) =>
      row.estimatedClickUplift !== null ? `+${row.estimatedClickUplift}` : "داده کافی نیست",
  },
];

function growthTargetLabel(): string {
  return "۴ تا ۶";
}

const visibilityColumns = [
  { key: "title", label: "مقاله", render: (row: VisibilityChange) => row.title },
  { key: "current", label: "کلیک فعلی", render: (row: VisibilityChange) => row.comparison.current },
  { key: "previous", label: "کلیک دوره قبل", render: (row: VisibilityChange) => row.comparison.previous ?? "—" },
  {
    key: "change",
    label: "تغییر",
    render: (row: VisibilityChange) => (row.comparison.difference !== null ? row.comparison.difference : "—"),
  },
];

const needsUpdatingColumns = [
  { key: "title", label: "مقاله", render: (row: NeedsUpdatingItem) => row.title },
  { key: "daysSinceUpdate", label: "روز از آخرین به‌روزرسانی", render: (row: NeedsUpdatingItem) => row.daysSinceUpdate },
  { key: "reason", label: "دلیل", render: (row: NeedsUpdatingItem) => row.reason },
];

const readyToRepublishColumns = [
  { key: "title", label: "مقاله", render: (row: ReadyToRepublishItem) => row.title },
  {
    key: "reason",
    label: "نوع",
    render: (row: ReadyToRepublishItem) => (row.reason === "draft_ready" ? "پیش‌نویس آماده انتشار" : "منتشرشده با تقاضای بالا"),
  },
  { key: "detail", label: "توضیح", render: (row: ReadyToRepublishItem) => row.detail },
];

const engagementColumns = [
  { key: "title", label: "مقاله", render: (row: HighTrafficLowEngagementItem) => row.title },
  { key: "sessions", label: "نشست (۳۰ روز)", render: (row: HighTrafficLowEngagementItem) => row.sessions },
  { key: "engagementRate", label: "نرخ تعامل", render: (row: HighTrafficLowEngagementItem) => `${(row.engagementRate * 100).toFixed(1)}٪` },
];

const bookingColumns = [
  { key: "title", label: "مقاله", render: (row: BookingSignalItem) => row.title },
  { key: "bookingLinkCount", label: "تعداد لینک به نوبت‌دهی/تماس", render: (row: BookingSignalItem) => row.bookingLinkCount },
  { key: "clicks", label: "کلیک واقعی صفحه", render: (row: BookingSignalItem) => row.clicks ?? "مشاهده نشده" },
  { key: "sessions", label: "نشست واقعی صفحه", render: (row: BookingSignalItem) => row.sessions ?? "مشاهده نشده" },
];

function recommendationList(items: Recommendation[], emptyMessage: string) {
  if (items.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return (
    <ul className="dashboard-insights-list">
      {items.map((item) => (
        <li key={`${item.category}-${item.slug}`} className="dashboard-insight">
          {item.message}
        </li>
      ))}
    </ul>
  );
}

export default async function GrowthDashboardPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const dashboard = await getGrowthDashboard(analyses);

  return (
    <>
      <DashboardHeader
        title="رشد بالینی"
        description="داشبورد تصمیم‌گیری برای رشد مراجعه — چه کاری روی محتوا انجام دهیم تا مراجع بیشتری جذب شود"
      />

      <div className="dashboard-grid">
        <DashboardCard label="امتیاز سلامت سایت" value={String(dashboard.executiveOverview.siteHealthScore)} />
        <DashboardCard label="مقالات منتشرشده" value={String(dashboard.executiveOverview.publishedArticles)} />
        <DashboardCard label="پیش‌نویس‌ها" value={String(dashboard.executiveOverview.draftArticles)} />
        <DashboardCard label="آماده انتشار" value={String(dashboard.executiveOverview.readyToPublish)} />
        <DashboardCard label="مشکلات بحرانی" value={String(dashboard.executiveOverview.criticalIssuesCount)} />
        <DashboardCard
          label="مقالات با لینک نوبت‌دهی/تماس"
          value={String(dashboard.articlesLinkingToBookingCount)}
          hint="سیگنال جایگزین لینک‌محور — نه قیف تبدیل واقعی نشست‌محور"
        />
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">امروز — بزرگ‌ترین فرصت و بزرگ‌ترین ریسک</h2>
        <div className="dashboard-grid">
          {dashboard.biggestOpportunity ? (
            <DashboardCard
              label="بزرگ‌ترین فرصت"
              value={dashboard.biggestOpportunity.title}
              hint={`جایگاه ${dashboard.biggestOpportunity.averagePosition.toFixed(1)} با ${dashboard.biggestOpportunity.impressions} نمایش واقعی — امتیاز اولویت ${dashboard.biggestOpportunity.priorityScore}`}
            />
          ) : (
            <DashboardCard label="بزرگ‌ترین فرصت" value="—" hint="داده واقعی Search Console برای این محاسبه در دسترس نیست" />
          )}
          {dashboard.biggestRisk ? (
            <DashboardCard label="بزرگ‌ترین ریسک" value={dashboard.biggestRisk.title} hint={dashboard.biggestRisk.detail} />
          ) : (
            <DashboardCard label="بزرگ‌ترین ریسک" value="—" hint="ریسک قابل‌توجهی بر اساس داده واقعی شناسایی نشد" />
          )}
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالاتی که احتمال رشد ترافیک واقعی دارند (نزدیک صفحه اول)</h2>
        <p className="dashboard-card-hint">
          امتیاز فرصت = نمایش × (۱ − CTR) × (۲۰ − جایگاه). امتیاز اولویت = امتیاز فرصت × وزن قدمت (مقاله‌های قدیمی‌تر وزن بالاتر).
        </p>
        <OpportunityTable
          rows={dashboard.opportunities}
          emptyMessage="داده واقعی Search Console برای این بازه در دسترس نیست یا هیچ صفحه‌ای در جایگاه ۱۱ تا ۲۰ نیست."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">تخمین پتانسیل رشد (رسیدن به جایگاه {growthTargetLabel()})</h2>
        <p className="dashboard-card-hint">
          تخمین بر اساس منحنی واقعی CTR-بر-اساس-جایگاه محاسبه‌شده از صفحات واقعی خود سایت — نه یک منحنی فرضی صنعتی.
        </p>
        <DataTable
          rows={dashboard.growthPotential}
          columns={growthPotentialColumns}
          getRowKey={(row) => row.page}
          emptyMessage="صفحه‌ای در بازه جایگاه ۱۱ تا ۲۰ یافت نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات در حال افت دیدپذیری (۳۰ روز اخیر در مقابل ۳۰ روز قبل)</h2>
        <DataTable
          rows={dashboard.losingVisibility}
          columns={visibilityColumns}
          getRowKey={(row) => row.slug}
          emptyMessage="افت دیدپذیری واقعی در صفحات مشاهده‌شده یافت نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالاتی که نیاز به به‌روزرسانی دارند</h2>
        <p className="dashboard-card-hint">قانون: منتشرشده، بیش از ۱۸۰ روز از آخرین به‌روزرسانی گذشته، و در حال افت کلیک واقعی.</p>
        <DataTable
          rows={dashboard.needsUpdating}
          columns={needsUpdatingColumns}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای با این دو شرط واقعی یافت نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات آماده بازنشر</h2>
        <DataTable
          rows={dashboard.readyToRepublish}
          columns={readyToRepublishColumns}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای یافت نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات نزدیک صفحه اول (جایگاه ۱۱ تا ۲۰)</h2>
        <DataTable
          rows={dashboard.search.data?.pagesNearFirstPage ?? []}
          columns={pageColumns}
          getRowKey={(row) => row.page}
          emptyMessage={dashboard.search.data ? "صفحه‌ای در این بازه یافت نشد." : `Search Console متصل نیست${dashboard.search.error ? ` — ${dashboard.search.error}` : "."}`}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات با نمایش بالا و CTR پایین</h2>
        <DataTable
          rows={dashboard.search.data?.highImpressionLowCtrPages ?? []}
          columns={pageColumns}
          getRowKey={(row) => row.page}
          emptyMessage={dashboard.search.data ? "موردی یافت نشد." : `Search Console متصل نیست${dashboard.search.error ? ` — ${dashboard.search.error}` : "."}`}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحات با ترافیک بالا و تعامل پایین</h2>
        <p className="dashboard-card-hint">
          نشست بالای میانه نشست واقعی صفحات + نرخ تعامل واقعی کمتر از میانگین سایت (هر دو از GA4 واقعی).
        </p>
        <DataTable
          rows={dashboard.highTrafficLowEngagement}
          columns={engagementColumns}
          getRowKey={(row) => row.slug}
          emptyMessage={
            dashboard.highTrafficLowEngagementError
              ? `Google Analytics متصل نیست — ${dashboard.highTrafficLowEngagementError}`
              : "موردی یافت نشد."
          }
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">صفحاتی که به نوبت‌دهی/تماس لینک می‌دهند</h2>
        <p className="dashboard-card-hint">
          سیگنال جایگزین لینک‌محور — مقالاتی که در متن واقعی خود به /appointment یا /contact لینک داده‌اند، به‌همراه ترافیک واقعی خودشان
          (در صورت مشاهده در داده واقعی). این یک قیف تبدیل واقعی نیست.
        </p>
        <DataTable
          rows={dashboard.bookingSignal}
          columns={bookingColumns}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای با لینک واقعی به نوبت‌دهی/تماس یافت نشد."
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">رتبه‌بندی عملکرد محتوا</h2>
        <p className="dashboard-card-hint">
          امتیاز عملکرد = ۴۰٪ صدک امتیاز سئو + ۳۰٪ صدک کلیک واقعی + ۳۰٪ صدک نشست واقعی (صدک نسبت به کل مقالات منتشرشده سایت).
        </p>
        <ContentRankingTable rows={dashboard.contentRanking} emptyMessage="مقاله منتشرشده‌ای یافت نشد." />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">برد سریع (Quick Wins)</h2>
        {recommendationList(dashboard.recommendations.quickWins, "موردی یافت نشد.")}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">اقدامات با اثر بالا</h2>
        {recommendationList(dashboard.recommendations.highImpactTasks, "موردی یافت نشد.")}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مشکلات بحرانی</h2>
        {recommendationList(dashboard.recommendations.criticalIssueTasks, "مشکل بحرانی واقعی ثبت‌شده‌ای یافت نشد.")}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">برنامه اقدام این هفته (۵ اولویت برتر)</h2>
        {recommendationList(dashboard.recommendations.weeklyActionPlan, "داده کافی برای ساخت برنامه هفتگی وجود ندارد.")}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع امتیاز عملکرد محتوا</h2>
        <BarChart
          data={dashboard.contentRanking.slice(0, 15).map((row) => ({ label: row.title, count: row.performanceScore }))}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="growth-dashboard"
          jsonData={dashboard}
          csvRows={dashboard.contentRanking.map((row) => ({
            slug: row.slug,
            title: row.title,
            seoScore: row.seoScore,
            clicks: row.clicks,
            sessions: row.sessions,
            performanceScore: row.performanceScore,
          }))}
        />
      </section>
    </>
  );
}
