import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { createArticleRepository } from "@/lib/article/repositories";
import { calculateDetailedScores } from "@/lib/content-analysis/scoring/calculateDetailedScores";
import { analyzeInternalLinking } from "@/lib/content-analysis/analyzers/internalLinkAnalyzer";
import { mapArticleToDashboardRow } from "@/lib/content-pipeline/mappers/toDashboardRow";
import type { Article } from "@/lib/article/types";

const columns = ["عنوان", "وضعیت", "به‌روزرسانی", "SEO", "AEO", "GEO", "عملیات"];

/**
 * No lifecycle-state persistence exists yet (see content-pipeline/types.ts
 * ArticleStateId) — "published"/"imported" is the only distinction the
 * repository can actually report today (Article.isPublished), so it's
 * the only honest mapping until a real state machine is wired in.
 */
async function getContentRows() {
  const repository = createArticleRepository();
  const summaries = await repository.listAll();

  const articles = await Promise.all(
    summaries
      .filter((summary): summary is typeof summary & { slug: string } => summary.slug !== null)
      .map((summary) => repository.findBySlug(summary.slug))
  );

  const validArticles = articles.filter((article): article is Article => article !== null);

  return validArticles.map((article) => {
    const otherArticles = validArticles.filter((other) => other.slug !== article.slug);
    const internalLinkSuggestionCount = analyzeInternalLinking(article, otherArticles).length;
    return mapArticleToDashboardRow(
      article,
      article.isPublished ? "published" : "imported",
      calculateDetailedScores(article, internalLinkSuggestionCount),
      null
    );
  });
}

export default async function ContentPage() {
  const rows = await getContentRows();

  return (
    <>
      <DashboardHeader title="محتوا" description="فهرست مقالات میرورا" />
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="dashboard-table-empty">
                  هنوز مقاله‌ای ثبت نشده است.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.slug}>
                  <td>{row.title}</td>
                  <td>{row.state === "published" ? "منتشر شده" : "پیش‌نویس"}</td>
                  <td>{row.updated ?? "—"}</td>
                  <td>{row.seo}</td>
                  <td>{row.aeo}</td>
                  <td>{row.geo}</td>
                  <td>
                    <Link href={`/dashboard/content/review/${row.slug}`}>بازبینی</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
