import type { Article } from "@/lib/article/types";
import type { DetailedScores } from "@/lib/content-analysis/types";
import type { ArticleStateId } from "../types";

/**
 * Not placed under lib/article/mappers on purpose: it needs
 * DetailedScores (content-analysis) and ArticleStateId (content-pipeline
 * itself), and lib/article must never depend on either of those layers —
 * that would create a cycle. content-pipeline already legitimately
 * depends on both, so this mapper lives here instead.
 */
export type ArticleDashboardRow = {
  title: string;
  slug: string;
  state: ArticleStateId;
  updated: string | null;
  seo: number;
  aeo: number;
  geo: number;
};

export function mapArticleToDashboardRow(
  article: Article,
  state: ArticleStateId,
  scores: DetailedScores,
  updated: string | null
): ArticleDashboardRow {
  return {
    title: article.title ?? "بدون عنوان",
    slug: article.slug ?? "",
    state,
    updated,
    seo: scores.seo,
    aeo: scores.aeo,
    geo: scores.geo,
  };
}
