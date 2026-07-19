import type { SanityClient } from "next-sanity";
import type { Article, ArticleSummary } from "../types";
import type { ArticleRepository } from "../repository";
import { mapSanityDocumentToArticle, type SanityArticleDocument } from "../mappers/fromSanity";
import { mapArticleToSummary } from "../mappers/toSummary";
import { mapArticleToSanityDraft } from "../mappers/toSanityDraft";
import { validateArticle } from "../validation";
import {
  composeHydrators,
  ReadingTimeHydrator,
  KeywordHydrator,
  EntityHydrator,
  ClusterHydrator,
  ParentTopicHydrator,
  SchemaHydrator,
} from "../hydration";
import { toRepositoryError } from "../errors";
import type { RepositoryLogger } from "../logger";
import { consoleRepositoryLogger } from "../logger";
import {
  articleBySlugQuery,
  publishedArticlesQuery,
  allArticlesQuery,
  relatedArticlesQuery,
  existsBySlugQuery,
} from "../queries";

const DEFAULT_RELATED_LIMIT = 5;

/**
 * The one hydration pipeline every document passes through, in the order
 * the CMS Integration spec asked for: reading time first (cheapest, most
 * reliable), then the fields that currently have no real data source.
 */
const hydrate = composeHydrators(
  ReadingTimeHydrator,
  KeywordHydrator,
  EntityHydrator,
  ClusterHydrator,
  ParentTopicHydrator,
  SchemaHydrator
);

/**
 * The only file in the codebase allowed to know Sanity exists behind
 * ArticleRepository. Every document goes through the same path — GROQ
 * query -> fromSanity mapper -> validateArticle -> hydrate -> canonical
 * Article — before it ever reaches a caller. Sanity errors never leak
 * upward; everything that can throw is caught and rethrown as
 * RepositoryError.
 */
export class SanityArticleRepository implements ArticleRepository {
  constructor(
    private readonly client: SanityClient,
    private readonly writeClient: SanityClient,
    private readonly logger: RepositoryLogger = consoleRepositoryLogger
  ) {}

  /** Fails fast with a typed error if no write token is configured, rather than issuing a doomed request. */
  async createDraft(article: Article): Promise<{ slug: string }> {
    if (!process.env.SANITY_API_TOKEN) {
      throw toRepositoryError(
        new Error("SANITY_API_TOKEN is not configured"),
        "Cannot create a draft: no Sanity write token is configured"
      );
    }

    try {
      const payload = mapArticleToSanityDraft(article);
      const created = await this.writeClient.create(payload);
      const slug = (created as { slug?: { current?: string } }).slug?.current ?? payload.slug.current;
      return { slug };
    } catch (error) {
      this.logger.repositoryError(`createDraft("${article.slug}") failed`, error);
      throw toRepositoryError(error, `Failed to create draft "${article.slug ?? "unknown"}"`);
    }
  }

  /** Patches by query (slug), not by document id — the repository never exposes a Sanity `_id` to callers. */
  async updateDraft(slug: string, article: Article): Promise<{ slug: string }> {
    if (!process.env.SANITY_API_TOKEN) {
      throw toRepositoryError(
        new Error("SANITY_API_TOKEN is not configured"),
        "Cannot update a draft: no Sanity write token is configured"
      );
    }

    try {
      const { _type, ...fields } = mapArticleToSanityDraft(article);
      void _type;
      await this.writeClient
        .patch({ query: `*[_type == "article" && slug.current == $slug][0]`, params: { slug } })
        .set(fields)
        .commit();
      return { slug: article.slug ?? slug };
    } catch (error) {
      this.logger.repositoryError(`updateDraft("${slug}") failed`, error);
      throw toRepositoryError(error, `Failed to update draft "${slug}"`);
    }
  }

  async findBySlug(slug: string): Promise<Article | null> {
    try {
      const doc = await this.client.fetch<SanityArticleDocument | null>(articleBySlugQuery, { slug });
      if (!doc) return null;
      return this.toValidatedArticle(doc);
    } catch (error) {
      this.logger.repositoryError(`findBySlug("${slug}") failed`, error);
      throw toRepositoryError(error, `Failed to fetch article "${slug}"`);
    }
  }

  async findPublished(): Promise<ArticleSummary[]> {
    return this.fetchSummaries(publishedArticlesQuery, {});
  }

  async findRelated(slug: string, limit: number): Promise<ArticleSummary[]> {
    return this.fetchSummaries(relatedArticlesQuery, {
      slug,
      limit: limit > 0 ? limit : DEFAULT_RELATED_LIMIT,
    });
  }

  async search(query: string): Promise<ArticleSummary[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const published = await this.findPublished();
    return published.filter(
      (article) =>
        (article.title ?? "").toLowerCase().includes(normalized) ||
        article.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)) ||
        article.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  }

  async listAll(): Promise<ArticleSummary[]> {
    return this.fetchSummaries(allArticlesQuery, {});
  }

  async exists(slug: string): Promise<boolean> {
    try {
      return await this.client.fetch<boolean>(existsBySlugQuery, { slug });
    } catch (error) {
      this.logger.repositoryError(`exists("${slug}") failed`, error);
      throw toRepositoryError(error, `Failed to check existence of "${slug}"`);
    }
  }

  private async fetchSummaries(
    query: string,
    params: Record<string, unknown>
  ): Promise<ArticleSummary[]> {
    try {
      const docs = await this.client.fetch<SanityArticleDocument[]>(query, params);
      return docs
        .map((doc) => this.toValidatedArticle(doc))
        .filter((article): article is Article => article !== null)
        .map(mapArticleToSummary);
    } catch (error) {
      this.logger.repositoryError("article list query failed", error);
      throw toRepositoryError(error, "Failed to fetch articles");
    }
  }

  /** Missing required fields (validateArticle's `errors`) mean the document is skipped, not thrown. */
  private toValidatedArticle(doc: SanityArticleDocument): Article | null {
    const mapped = mapSanityDocumentToArticle(doc);
    const validation = validateArticle(mapped);

    if (!validation.valid) {
      this.logger.validationWarning(mapped.slug, [...validation.errors, ...validation.warnings]);
      return null;
    }

    if (validation.warnings.length > 0) {
      this.logger.validationWarning(mapped.slug, validation.warnings);
    }

    const hydrated = hydrate(mapped);
    if (hydrated.warnings.length > 0) {
      this.logger.hydrationWarning(mapped.slug, hydrated.warnings);
    }

    return hydrated.article;
  }
}
