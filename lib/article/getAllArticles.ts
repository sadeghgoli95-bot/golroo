import type { Article } from "./types";
import type { ArticleRepository } from "./repository";

/**
 * `listAll()` only returns lightweight ArticleSummary rows — every caller
 * that needs full Article objects for every article in the repository
 * (dashboard pages, score aggregation) used to repeat this same
 * summaries -> Promise.all(findBySlug) -> filter(nulls) sequence. Single
 * source of truth now; add a new full-corpus consumer by calling this.
 */
export async function getAllArticles(repository: ArticleRepository): Promise<Article[]> {
  const summaries = await repository.listAll();
  const articles = await Promise.all(
    summaries
      .filter((summary): summary is typeof summary & { slug: string } => summary.slug !== null)
      .map((summary) => repository.findBySlug(summary.slug))
  );
  return articles.filter((article): article is Article => article !== null);
}
