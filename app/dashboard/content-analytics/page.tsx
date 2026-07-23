import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import BarChart from "@/components/dashboard/BarChart";
import DataTable from "@/components/dashboard/DataTable";
import ExportBar from "@/components/dashboard/ExportBar";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getContentAnalytics } from "@/lib/analytics/site/contentAnalytics";

export default async function ContentAnalyticsPage() {
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const content = getContentAnalytics(analyses);

  const articleColumns = [
    { key: "title", label: "عنوان", render: (row: { slug: string; title: string }) => row.title },
    { key: "slug", label: "Slug", render: (row: { slug: string }) => row.slug },
  ];

  return (
    <>
      <DashboardHeader title="تحلیل محتوا" description="کیفیت، پوشش موضوعی و ساختار محتوای مقالات" />

      <div className="dashboard-grid">
        <DashboardCard label="میانگین کیفیت منابع" value={String(content.sourceQualityAverage)} />
        <DashboardCard label="مقالات بدون منبع" value={String(content.articlesWithNoSources)} />
        <DashboardCard label="محتوای کم‌عمق (Thin Content)" value={String(content.thinContent.length)} />
        <DashboardCard label="فاقد سوالات متداول" value={String(content.missingFaq.length)} />
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">بهترین مقالات (بر اساس کیفیت محتوا)</h2>
        <DataTable
          rows={content.bestArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای ثبت نشده است."
          columns={[
            ...articleColumns,
            { key: "score", label: "امتیاز", render: (row) => row.score },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">ضعیف‌ترین مقالات</h2>
        <DataTable
          rows={content.worstArticles}
          getRowKey={(row) => row.slug}
          emptyMessage="مقاله‌ای ثبت نشده است."
          columns={[
            ...articleColumns,
            { key: "score", label: "امتیاز", render: (row) => row.score },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع کیفیت محتوا</h2>
        <BarChart data={content.contentQualityDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع زمان مطالعه</h2>
        <BarChart data={content.readingTimeDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع موضوعی</h2>
        <BarChart data={content.topicDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع دسته‌بندی</h2>
        <BarChart data={content.categoryDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">توزیع برچسب‌ها</h2>
        <BarChart data={content.tagDistribution} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">فاقد منبع، تصویر یا Alt Text</h2>
        <DataTable
          rows={[
            ...content.missingSources.map((row) => ({ ...row, issue: "بدون منبع" })),
            ...content.missingImages.map((row) => ({ ...row, issue: "بدون تصویر شاخص" })),
            ...content.missingAltText.map((row) => ({ ...row, issue: "بدون Alt Text" })),
          ]}
          getRowKey={(row) => `${row.slug}-${row.issue}`}
          emptyMessage="موردی یافت نشد."
          columns={[
            ...articleColumns,
            { key: "issue", label: "مشکل", render: (row) => row.issue },
          ]}
        />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">خروجی گزارش</h2>
        <ExportBar
          filename="content-analytics"
          jsonData={content}
          csvRows={analyses.map((item) => ({
            slug: item.article.slug ?? "",
            title: item.article.title ?? "",
            contentScore: item.review.contentQuality.scores.content,
            readabilityScore: item.review.contentQuality.scores.readability,
            evidenceScore: item.review.contentQuality.scores.evidence,
            hasFaq: item.article.hasFaq,
            sourcesCount: item.article.sources.length,
          }))}
        />
      </section>
    </>
  );
}
