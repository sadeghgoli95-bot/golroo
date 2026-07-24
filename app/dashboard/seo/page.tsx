import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import BarChart from "@/components/dashboard/BarChart";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getSeoInsights, type StatusBreakdown } from "@/lib/analytics/site/seoInsights";
import { getSearchMetricsSafely } from "@/lib/analytics/safeGoogleMetrics";
import { compareMetricValue } from "@/lib/analytics/comparison";
import type { DateRange } from "@/lib/analytics/types";
import type { SearchQueryMetric, SearchPageMetric } from "@/lib/analytics/search/types";

const LAST_7_DAYS: DateRange = { preset: "last7Days", start: null, end: null };
const LAST_30_DAYS: DateRange = { preset: "last30Days", start: null, end: null };

function statusLabel(status: StatusBreakdown): string {
  return `${status.withIt} دارند / ${status.withoutIt} ندارند`;
}

const queryColumns = [
  { key: "query", label: "عبارت جستجو", render: (row: SearchQueryMetric) => row.query },
  { key: "clicks", label: "کلیک", render: (row: SearchQueryMetric) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: SearchQueryMetric) => row.impressions },
  { key: "ctr", label: "CTR", render: (row: SearchQueryMetric) => `${(row.ctr * 100).toFixed(1)}٪` },
  { key: "averagePosition", label: "جایگاه", render: (row: SearchQueryMetric) => row.averagePosition.toFixed(1) },
];

const pageColumns = [
  { key: "page", label: "صفحه", render: (row: SearchPageMetric) => row.page },
  { key: "clicks", label: "کلیک", render: (row: SearchPageMetric) => row.clicks },
  { key: "impressions", label: "نمایش", render: (row: SearchPageMetric) => row.impressions },
  { key: "ctr", label: "CTR", render: (row: SearchPageMetric) => `${(row.ctr * 100).toFixed(1)}٪` },
  { key: "averagePosition", label: "جایگاه", render: (row: SearchPageMetric) => row.averagePosition.toFixed(1) },
];

export default async function SeoInsightsPage() {
  const repository = createArticleRepository();
  const [analyses, search7d, search30d] = await Promise.all([
    getSiteAnalysis(repository),
    getSearchMetricsSafely(LAST_7_DAYS),
    getSearchMetricsSafely(LAST_30_DAYS),
  ]);
  const seo = getSeoInsights(analyses);

  const articleColumns = [
    { key: "title", label: "عنوان", render: (row: { slug: string; title: string }) => row.title },
    { key: "slug", label: "Slug", render: (row: { slug: string }) => row.slug },
  ];

  return (
    <>
      <DashboardHeader title="سئو" description="وضعیت فنی و رقابتی سئوی مقالات" />

      <div className="dashboard-grid">
        <DashboardCard label="میانگین امتیاز سئو" value={String(seo.averageSeoScore)} />
        <DashboardCard label="Canonical" value={statusLabel(seo.canonicalStatus)} />
        <DashboardCard label="Open Graph" value={statusLabel(seo.openGraphStatus)} />
        <DashboardCard label="Twitter Card" value={statusLabel(seo.twitterCardStatus)} />
        <DashboardCard label="JSON-LD" value={statusLabel(seo.jsonLdStatus)} />
        <DashboardCard label="Breadcrumb" value={`${seo.breadcrumbCoveragePercent}٪`} hint="در تمام صفحات مقاله همیشه فعال است" />
        <DashboardCard label="پوشش Sitemap" value={`${seo.sitemapCoveredCount} در sitemap / ${seo.sitemapExcludedCount} پیش‌نویس`} />
        <DashboardCard label="آماده Featured Snippet" value={String(seo.featuredSnippetReadyCount)} />
        <DashboardCard label="آماده AI Overview" value={String(seo.aiOverviewReadyCount)} />
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۷ روز اخیر در مقابل ۷ روز قبل از آن (Search Console)</h2>
        {search7d.data ? (
          <div className="dashboard-grid">
            <DashboardCard label="کلیک‌ها" value={String(search7d.data.clicks.current)} comparison={compareMetricValue(search7d.data.clicks)} />
            <DashboardCard label="نمایش‌ها" value={String(search7d.data.impressions.current)} comparison={compareMetricValue(search7d.data.impressions)} />
            <DashboardCard label="CTR" value={`${(search7d.data.ctr.current * 100).toFixed(1)}٪`} comparison={compareMetricValue(search7d.data.ctr)} />
            <DashboardCard
              label="میانگین جایگاه"
              value={search7d.data.averagePosition.current.toFixed(1)}
              comparison={compareMetricValue(search7d.data.averagePosition)}
              invertColor
            />
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p>Search Console متصل نیست{search7d.error ? ` — ${search7d.error}` : "."}</p>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">۳۰ روز اخیر در مقابل ۳۰ روز قبل از آن (Search Console)</h2>
        {search30d.data ? (
          <div className="dashboard-grid">
            <DashboardCard label="کلیک‌ها" value={String(search30d.data.clicks.current)} comparison={compareMetricValue(search30d.data.clicks)} />
            <DashboardCard label="نمایش‌ها" value={String(search30d.data.impressions.current)} comparison={compareMetricValue(search30d.data.impressions)} />
            <DashboardCard label="CTR" value={`${(search30d.data.ctr.current * 100).toFixed(1)}٪`} comparison={compareMetricValue(search30d.data.ctr)} />
            <DashboardCard
              label="میانگین جایگاه"
              value={search30d.data.averagePosition.current.toFixed(1)}
              comparison={compareMetricValue(search30d.data.averagePosition)}
              invertColor
            />
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <p>Search Console متصل نیست{search30d.error ? ` — ${search30d.error}` : "."}</p>
          </div>
        )}
      </section>

      {search30d.data ? (
        <>
          <section className="dashboard-section">
            <h2 className="dashboard-section-title">پرکلیک‌ترین عبارت‌های جستجو (۳۰ روز اخیر)</h2>
            <DataTable rows={search30d.data.topQueries} getRowKey={(row) => row.query} emptyMessage="داده‌ای وجود ندارد." columns={queryColumns} />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">پربازدیدترین صفحات در جستجو (۳۰ روز اخیر)</h2>
            <DataTable rows={search30d.data.topPages} getRowKey={(row) => row.page} emptyMessage="داده‌ای وجود ندارد." columns={pageColumns} />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">عبارت‌های در حال رشد (نسبت به ۳۰ روز قبل)</h2>
            <DataTable
              rows={search30d.data.fastestGrowingQueries}
              getRowKey={(row) => row.query}
              emptyMessage="عبارت رو به رشدی یافت نشد."
              columns={queryColumns}
            />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">عبارت‌های در حال افت (نسبت به ۳۰ روز قبل)</h2>
            <DataTable
              rows={search30d.data.losingQueries}
              getRowKey={(row) => row.query}
              emptyMessage="عبارت رو به افتی یافت نشد."
              columns={queryColumns}
            />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">صفحات نزدیک به صفحه اول (جایگاه ۱۱ تا ۲۰)</h2>
            <DataTable
              rows={search30d.data.pagesNearFirstPage}
              getRowKey={(row) => row.page}
              emptyMessage="صفحه‌ای در این بازه یافت نشد."
              columns={pageColumns}
            />
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section-title">نمایش بالا / CTR پایین</h2>
            <DataTable
              rows={search30d.data.highImpressionLowCtrPages}
              getRowKey={(row) => row.page}
              emptyMessage="موردی یافت نشد."
              columns={pageColumns}
            />
          </section>
        </>
      ) : null}

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بهترین مقالات از نظر سئو</h2>
        <DataTable
          rows={seo.topSeoArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای ثبت نشده است."
          columns={[...articleColumns, { key: "score", label: "امتیاز", render: (row) => row.score }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">ضعیف‌ترین مقالات از نظر سئو</h2>
        <DataTable
          rows={seo.lowestSeoArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای ثبت نشده است."
          columns={[...articleColumns, { key: "score", label: "امتیاز", render: (row) => row.score }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">فاقد Meta Description یا Focus Keyword</h2>
        <DataTable
          rows={[
            ...seo.missingMetaDescription.map((row) => ({ ...row, issue: "بدون Meta Description" })),
            ...seo.missingFocusKeyword.map((row) => ({ ...row, issue: "بدون Focus Keyword" })),
          ]}
          getRowKey={(row) => `${row.slug}-${row.issue}`}
          emptyMessage="موردی یافت نشد."
          columns={[...articleColumns, { key: "issue", label: "مشکل", render: (row) => row.issue }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">عناوین، توضیحات و Slugهای تکراری</h2>
        <DataTable
          rows={[
            ...seo.duplicateTitles.map((group) => ({ ...group, type: "عنوان تکراری" })),
            ...seo.duplicateMetaDescriptions.map((group) => ({ ...group, type: "توضیحات متا تکراری" })),
            ...seo.duplicateSlugs.map((group) => ({ ...group, type: "Slug تکراری" })),
          ]}
          getRowKey={(row) => `${row.type}-${row.value}`}
          emptyMessage="هیچ موردی تکراری یافت نشد."
          columns={[
            { key: "type", label: "نوع", render: (row) => row.type },
            { key: "value", label: "مقدار", render: (row) => row.value },
            { key: "slugs", label: "مقالات", render: (row) => row.slugs.join("، ") },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">فرصت‌های لینک‌سازی داخلی</h2>
        <DataTable
          rows={seo.internalLinkOpportunities}
          getRowKey={(row) => row.slug}
          emptyMessage="فرصت لینک‌سازی داخلی جدیدی یافت نشد."
          columns={[...articleColumns, { key: "suggestionCount", label: "تعداد پیشنهاد", render: (row) => row.suggestionCount }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">فرصت‌های لینک‌سازی خارجی (بدون لینک خارجی)</h2>
        <DataTable
          rows={seo.externalLinkOpportunities}
          getRowKey={(row) => row.slug}
          emptyMessage="همه مقالات حداقل یک لینک خارجی دارند."
          columns={articleColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">لینک‌های داخلی خراب</h2>
        <DataTable
          rows={seo.brokenLinks}
          getRowKey={(row, index) => `${row.slug}-${index}`}
          emptyMessage="لینک داخلی خرابی یافت نشد."
          columns={[
            ...articleColumns,
            { key: "targetSlug", label: "مقصد خراب", render: (row) => row.targetSlug },
            { key: "url", label: "URL", render: (row) => row.url },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع امتیاز سئو</h2>
        <BarChart data={seo.seoScoreDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع مشکلات سئو</h2>
        <BarChart data={seo.issueDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="seo-insights"
          jsonData={seo}
          csvRows={analyses.map((item) => ({
            slug: item.article.slug ?? "",
            title: item.article.title ?? "",
            seoScore: item.review.seo.score,
            hasCanonical: item.article.hasCanonical,
            hasOpenGraph: item.article.hasOpenGraph,
            hasTwitterCard: item.article.hasTwitterCard,
            hasSchema: item.article.hasSchema,
          }))}
        />
      </section>
    </>
  );
}
