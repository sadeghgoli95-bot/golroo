import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { createArticleRepository } from "@/lib/article/repositories";
import { analyzeArticle } from "@/lib/content-analysis/analyzeArticle";
import type { Article, ArticleSummary } from "@/lib/article/types";

/**
 * "Pending review" = every unpublished article the repository has, since
 * no separate review-state exists yet. Each title links to
 * /dashboard/content/review/[slug], where Approve/Reject/Request Changes
 * and manual editing actually happen.
 */
async function getPendingReviewArticles(): Promise<{ articles: Article[]; candidates: ArticleSummary[] }> {
  const repository = createArticleRepository();
  const summaries = await repository.listAll();

  const drafts = summaries.filter((summary) => !summary.isPublished && summary.slug !== null);
  const articles = await Promise.all(drafts.map((summary) => repository.findBySlug(summary.slug as string)));

  return { articles: articles.filter((article): article is Article => article !== null), candidates: summaries };
}

export default async function ReviewPage() {
  const { articles, candidates } = await getPendingReviewArticles();

  if (articles.length === 0) {
    return (
      <>
        <DashboardHeader title="بازبینی" description="مقالات در انتظار بازبینی" />
        <div className="dashboard-empty-state">
          <p>موردی برای بازبینی وجود ندارد.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="بازبینی" description="مقالات در انتظار بازبینی" />
      {articles.map((article) => {
        const otherArticles = candidates.filter((candidate) => candidate.slug !== article.slug);
        const report = analyzeArticle(article, otherArticles);
        return (
          <section key={article.slug} className="dashboard-section">
            <h2 className="dashboard-section-title">
              <Link href={`/dashboard/content/review/${article.slug}`}>{article.title ?? "بدون عنوان"}</Link>
            </h2>
            <ul className="dashboard-insights-list">
              {report.warnings.map((warning) => (
                <li key={warning} className="dashboard-insight dashboard-insight-warning">
                  {warning}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
