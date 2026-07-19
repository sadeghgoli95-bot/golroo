import type { Article, ArticleSummary } from "../types";
import type { ArticleRepository } from "../repository";
import type { RepositoryCache } from "../cache";
import type { RepositoryLogger } from "../logger";
import { consoleRepositoryLogger } from "../logger";

const PUBLISHED_CACHE_KEY = "__published__";
const LIST_ALL_CACHE_KEY = "__all__";

/**
 * Decorates any ArticleRepository with caching — business logic depends
 * only on the ArticleRepository interface and never knows a cache is
 * involved. Two caches (not one) because a single article and a full
 * list have very different invalidation needs: writing one article
 * shouldn't force every list back through Sanity, but every list must
 * still be dropped since it may now be stale.
 */
export class CachedArticleRepository implements ArticleRepository {
  constructor(
    private readonly inner: ArticleRepository,
    private readonly articleCache: RepositoryCache<Article | null>,
    private readonly listCache: RepositoryCache<ArticleSummary[]>,
    private readonly logger: RepositoryLogger = consoleRepositoryLogger
  ) {}

  async findBySlug(slug: string): Promise<Article | null> {
    const cached = this.articleCache.get(slug);
    if (cached !== undefined) {
      this.logger.cacheHit(slug);
      return cached;
    }

    this.logger.cacheMiss(slug);
    const article = await this.inner.findBySlug(slug);
    this.articleCache.set(slug, article);
    return article;
  }

  async findPublished(): Promise<ArticleSummary[]> {
    return this.cachedList(PUBLISHED_CACHE_KEY, () => this.inner.findPublished());
  }

  async findRelated(slug: string, limit: number): Promise<ArticleSummary[]> {
    return this.cachedList(`__related__${slug}__${limit}`, () => this.inner.findRelated(slug, limit));
  }

  /** Not cached — one query string produces effectively unbounded cache keys with poor hit rates. */
  async search(query: string): Promise<ArticleSummary[]> {
    return this.inner.search(query);
  }

  async listAll(): Promise<ArticleSummary[]> {
    return this.cachedList(LIST_ALL_CACHE_KEY, () => this.inner.listAll());
  }

  async exists(slug: string): Promise<boolean> {
    return this.inner.exists(slug);
  }

  async createDraft(article: Article): Promise<{ slug: string }> {
    const result = await this.inner.createDraft(article);
    this.listCache.invalidateAll();
    return result;
  }

  async updateDraft(slug: string, article: Article): Promise<{ slug: string }> {
    const result = await this.inner.updateDraft(slug, article);
    this.articleCache.invalidate(slug);
    this.listCache.invalidateAll();
    return result;
  }

  invalidate(slug: string): void {
    this.articleCache.invalidate(slug);
    this.listCache.invalidateAll();
  }

  invalidateAll(): void {
    this.articleCache.invalidateAll();
    this.listCache.invalidateAll();
  }

  private async cachedList(
    key: string,
    fetch: () => Promise<ArticleSummary[]>
  ): Promise<ArticleSummary[]> {
    const cached = this.listCache.get(key);
    if (cached !== undefined) {
      this.logger.cacheHit(key);
      return cached;
    }

    this.logger.cacheMiss(key);
    const result = await fetch();
    this.listCache.set(key, result);
    return result;
  }
}
