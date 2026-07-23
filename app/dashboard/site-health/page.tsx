import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import ExternalLinkChecker from "@/components/dashboard/site-health/ExternalLinkChecker";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getSiteHealth } from "@/lib/analytics/site/siteHealth";
import { getContentAnalytics } from "@/lib/analytics/site/contentAnalytics";

export default async function SiteHealthPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const health = getSiteHealth(analyses);
  const content = getContentAnalytics(analyses);

  const articleColumns = [
    { key: "title", label: "عنوان", render: (row: { slug: string; title: string }) => row.title },
    { key: "slug", label: "Slug", render: (row: { slug: string }) => row.slug },
  ];

  return (
    <>
      <DashboardHeader title="سلامت سایت" description="ممیزی مستمر مشکلات ساختاری و انتشار" />

      <div className="dashboard-grid">
        <DashboardCard label="امتیاز سلامت" value={String(health.healthScore)} />
        <DashboardCard label="مشکلات بحرانی" value={String(health.criticalCount)} />
        <DashboardCard label="هشدارها" value={String(health.warningCount)} />
        <DashboardCard label="بررسی‌های موفق" value={`${health.passedChecksCount} / ${health.totalChecksCount}`} />
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">فاقد تصویر شاخص، سوالات متداول یا منبع</h2>
        <DataTable
          rows={[
            ...content.missingImages.map((row) => ({ ...row, issue: "بدون تصویر شاخص" })),
            ...content.missingFaq.map((row) => ({ ...row, issue: "بدون سوالات متداول" })),
            ...content.missingSources.map((row) => ({ ...row, issue: "بدون منبع" })),
          ]}
          getRowKey={(row, index) => `${row.slug}-${index}`}
          emptyMessage="موردی یافت نشد."
          columns={[...articleColumns, { key: "issue", label: "مشکل", render: (row) => row.issue }]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Slugهای تکراری</h2>
        <DataTable
          rows={health.duplicateSlugs}
          getRowKey={(row) => row.value}
          emptyMessage="Slug تکراری یافت نشد."
          columns={[
            { key: "value", label: "Slug", render: (row) => row.value },
            { key: "slugs", label: "تعداد تکرار", render: (row) => row.slugs.length },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالات یتیم (بدون لینک داخلی ورودی)</h2>
        <DataTable
          rows={health.orphanArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله یتیمی یافت نشد."
          columns={articleColumns}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">مقالاتی که نیاز به به‌روزرسانی دارند (بیش از ۶ ماه)</h2>
        <DataTable
          rows={health.articlesNeedingUpdate}
          getRowKey={(row) => row.slug}
          emptyMessage="همه مقالات در ۶ ماه اخیر به‌روزرسانی شده‌اند."
          columns={[
            ...articleColumns,
            { key: "lastKnownDate", label: "آخرین تاریخ ثبت‌شده", render: (row) => row.lastKnownDate ?? "ثبت نشده" },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">لینک‌های داخلی خراب</h2>
        <DashboardCard label="تعداد کل" value={String(health.brokenInternalLinksCount)} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بررسی لینک‌های خارجی</h2>
        <p className="dashboard-header-description">
          این بررسی درخواست HTTP واقعی به هر لینک خارجی ارسال می‌کند — به‌صورت دستی و درخواستی اجرا می‌شود، نه در هر بار
          بارگذاری صفحه.
        </p>
        <ExternalLinkChecker />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="site-health"
          jsonData={health}
          csvRows={analyses.map((item) => ({
            slug: item.article.slug ?? "",
            title: item.article.title ?? "",
            healthScore: item.detailedScores.overall,
            brokenInternalLinks: item.brokenInternalLinks.length,
            hasFeaturedImage: item.article.hasFeaturedImage,
            hasFaq: item.article.hasFaq,
            sourcesCount: item.article.sources.length,
          }))}
        />
      </section>
    </>
  );
}
