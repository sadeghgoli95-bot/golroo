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
 * `publishedAt`/`lastUpdated` (lib/article/types.ts) are read-only here
 * on purpose — freshness is a Site Health/Reports concern (lib/analytics/
 * site), not a document-validity concern, so this function still doesn't
 * check them.
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
