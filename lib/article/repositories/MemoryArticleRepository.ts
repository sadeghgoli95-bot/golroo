import type { Article, ArticleSummary } from "../types";
import type { ArticleRepository } from "../repository";
import { mapArticleToSummary } from "../mappers/toSummary";

/**
 * In-memory implementation used for local development (see
 * RepositoryFactory) and tests — no network, no Sanity credentials
 * required. Constructed with a fixed article list; nothing here mutates
 * it, matching every other repository's read-only surface.
 */
export class MemoryArticleRepository implements ArticleRepository {
  constructor(private readonly articles: Article[] = []) {}

  async createDraft(article: Article): Promise<{ slug: string }> {
    if (!article.slug) throw new Error("Cannot create a draft without a slug");
    if (this.articles.some((existing) => existing.slug === article.slug)) {
      throw new Error(`An article with slug "${article.slug}" already exists`);
    }

    this.articles.push({ ...article, isPublished: false });
    return { slug: article.slug };
  }

  async updateDraft(slug: string, article: Article): Promise<{ slug: string }> {
    const index = this.articles.findIndex((existing) => existing.slug === slug);
    if (index === -1) throw new Error(`No article with slug "${slug}" exists`);
    if (!article.slug) throw new Error("Cannot save a draft without a slug");

    this.articles[index] = { ...article };
    return { slug: article.slug };
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.articles.find((article) => article.slug === slug) ?? null;
  }

  async findPublished(): Promise<ArticleSummary[]> {
    return this.articles.filter((article) => article.isPublished).map(mapArticleToSummary);
  }

  async findRelated(slug: string, limit: number): Promise<ArticleSummary[]> {
    const source = this.articles.find((article) => article.slug === slug);
    if (!source || source.topic === null) return [];

    return this.articles
      .filter((article) => article.slug !== slug && article.isPublished && article.topic === source.topic)
      .slice(0, limit)
      .map(mapArticleToSummary);
  }

  async search(query: string): Promise<ArticleSummary[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return this.articles
      .filter(
        (article) =>
          (article.title ?? "").toLowerCase().includes(normalized) ||
          article.keywords.some((keyword) => keyword.toLowerCase().includes(normalized))
      )
      .map(mapArticleToSummary);
  }

  async listAll(): Promise<ArticleSummary[]> {
    return this.articles.map(mapArticleToSummary);
  }

  async exists(slug: string): Promise<boolean> {
    return this.articles.some((article) => article.slug === slug);
  }
}
