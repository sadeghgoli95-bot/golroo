import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import BarChart from "@/components/dashboard/BarChart";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getSeoInsights, type StatusBreakdown } from "@/lib/analytics/site/seoInsights";

function statusLabel(status: StatusBreakdown): string {
  return `${status.withIt} دارند / ${status.withoutIt} ندارند`;
}

export default async function SeoInsightsPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
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
