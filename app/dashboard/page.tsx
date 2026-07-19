import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { createArticleRepository } from "@/lib/article/repositories";
import { getOverviewScores } from "@/lib/analytics/dashboard/getOverviewScores";

export default async function DashboardHomePage() {
  const repository = createArticleRepository();
  const [scores, articles] = await Promise.all([getOverviewScores(repository), repository.listAll()]);
  const publishedCount = articles.filter((article) => article.isPublished).length;
  const draftCount = articles.length - publishedCount;

  const overviewCards = [
    { label: "سلامت محتوا (Content Health)", value: String(scores.siteHealth) },
    { label: "سئو (SEO)", value: String(scores.seo) },
    { label: "موتورهای پاسخ (AEO)", value: String(scores.aeo) },
    { label: "موتورهای هوش مصنوعی (GEO)", value: String(scores.geo) },
    { label: "مقالات منتشرشده", value: String(publishedCount) },
    { label: "پیش‌نویس‌ها", value: String(draftCount) },
  ];

  return (
    <>
      <DashboardHeader title="داشبورد" description="نمای کلی وضعیت محتوای میرورا" />
      <div className="dashboard-grid">
        {overviewCards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>
    </>
  );
}
