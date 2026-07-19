import type { Article } from "../types";

export type ArticleValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * Repository-level document validation — distinct from
 * lib/content-pipeline/validation.ts, which validates a fully-hydrated
 * article against the corpus (duplicates, corpus-wide rules) before
 * import. This one only asks "is this Sanity document even usable",
 * which is what a repository must know before returning it to a caller.
 *
 * The canonical Article model carries no publish/update date fields
 * today (see lib/article/types.ts), so "missing dates" from the CMS
 * Integration spec has no field to check yet — tracked as technical debt
 * rather than invented here.
 */
export function validateArticle(article: Article): ArticleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!article.title) errors.push("عنوان وجود ندارد");
  if (!article.slug) errors.push("slug وجود ندارد");
  if (!article.body) errors.push("متن مقاله وجود ندارد");

  if (!article.metaDescription) warnings.push("meta description وجود ندارد");
  if (!article.excerpt) warnings.push("خلاصه وجود ندارد");
  if (!article.topic) warnings.push("موضوع وجود ندارد");
  if (!article.authorName) warnings.push("نویسنده وجود ندارد");

  return { valid: errors.length === 0, errors, warnings };
}
