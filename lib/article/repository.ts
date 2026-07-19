import type { Article, ArticleSummary } from "./types";

/**
 * The single source of articles for every analyzer/engine in this
 * codebase. No analyzer may receive a raw array from an unknown origin —
 * every corpus-dependent function (internal linking, duplicate detection,
 * validation) takes candidates produced by a repository implementation of
 * this interface.
 *
 * Implemented by SanityArticleRepository, MemoryArticleRepository, and
 * CachedArticleRepository (see lib/article/repositories/) — selected by
 * RepositoryFactory, never constructed directly by a caller.
 */
export type ArticleRepository = {
  findBySlug: (slug: string) => Promise<Article | null>;
  findPublished: () => Promise<ArticleSummary[]>;
  findRelated: (slug: string, limit: number) => Promise<ArticleSummary[]>;
  search: (query: string) => Promise<ArticleSummary[]>;
  listAll: () => Promise<ArticleSummary[]>;
  exists: (slug: string) => Promise<boolean>;
  /** Creates a `status: "draft"` document. Never publishes. Fails if the slug already exists — use updateDraft for an existing document. */
  createDraft: (article: Article) => Promise<{ slug: string }>;
  /** Updates an existing document in place (looked up by its current slug). Never changes publish status. */
  updateDraft: (slug: string, article: Article) => Promise<{ slug: string }>;
};
