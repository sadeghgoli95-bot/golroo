import type { SanityClient } from "next-sanity";
import { groq } from "next-sanity";
import type { Article, ArticleFaqItem, ArticleSource, ArticleSummary } from "../types";
import type { ArticleRepository } from "../repository";
import { mapSanityDocumentToArticle, type SanityArticleDocument } from "../mappers/fromSanity";
import { mapArticleToSummary } from "../mappers/toSummary";
import { mapArticleToSanityDraft, type SanityDraftRefs, type SanityReference } from "../mappers/toSanityDraft";
import { validateArticle } from "../validation";
import { resolveAuthorName } from "../constants";
import { slugify } from "@/lib/utils/slugify";
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
      const refs = await this.resolveDraftRefs(article);
      const payload = mapArticleToSanityDraft(article, refs);
      const created = await this.writeClient.create(payload);
      const slug = (created as { slug?: { current?: string } }).slug?.current ?? payload.slug.current;
      return { slug };
    } catch (error) {
      this.logger.repositoryError(`createDraft("${article.slug}") failed`, error);
      throw toRepositoryError(error, `Failed to create draft "${article.slug ?? "unknown"}"`);
    }
  }

  /**
   * Every reference-typed field on the `article` schema (author, category,
   * tags, faq, sources) needs its target document resolved — or created,
   * for a repeated import — before the draft payload can be built. Run
   * once, shared by createDraft and updateDraft, so both stay in sync.
   */
  private async resolveDraftRefs(article: Article): Promise<SanityDraftRefs> {
    const [author, category, tags, faq, sources] = await Promise.all([
      this.resolveAuthorReference(resolveAuthorName(article.authorName)),
      this.resolveCategoryReference(article.category),
      this.resolveTagReferences(article.tags),
      this.resolveFaqReferences(article.faq),
      this.resolveSourceReferences(article.sources),
    ]);
    return { author, ...(category ? { category } : {}), tags, faq, sources };
  }

  /**
   * Author is a Sanity `reference` field (see sanity/schemaTypes/
   * article.ts), not a plain string, so "always set the default author"
   * means resolving or creating the matching `author` document — looked
   * up by name first so repeated imports reuse the same document instead
   * of creating a duplicate every time.
   */
  private async resolveAuthorReference(name: string): Promise<SanityReference> {
    const existingId = await this.client.fetch<string | null>(groq`*[_type == "author" && name == $name][0]._id`, {
      name,
    });
    if (existingId) return { _type: "reference", _ref: existingId };

    const created = await this.writeClient.create({
      _type: "author",
      name,
      slug: { _type: "slug", current: slugify(name) || "author" },
    });
    return { _type: "reference", _ref: created._id };
  }

  /**
   * `category` and `tag` documents share the exact same shape (title +
   * slug), so one lookup-or-create helper serves both — the only
   * difference between them is the Sanity `_type` name.
   */
  private async resolveTitledReference(type: "category" | "tag", title: string): Promise<SanityReference> {
    const existingId = await this.client.fetch<string | null>(
      groq`*[_type == $type && title == $title][0]._id`,
      { type, title }
    );
    if (existingId) return { _type: "reference", _ref: existingId };

    const created = await this.writeClient.create({
      _type: type,
      title,
      slug: { _type: "slug", current: slugify(title) || type },
    });
    return { _type: "reference", _ref: created._id };
  }

  private async resolveCategoryReference(category: string | null): Promise<SanityReference | null> {
    if (!category) return null;
    return this.resolveTitledReference("category", category);
  }

  private async resolveTagReferences(tags: string[]): Promise<SanityReference[]> {
    const uniqueTags = Array.from(new Set(tags.filter((tag) => tag.trim().length > 0)));
    const refs: SanityReference[] = [];
    for (const tag of uniqueTags) {
      refs.push(await this.resolveTitledReference("tag", tag));
    }
    return refs;
  }

  /**
   * Matched by question text, same "reuse instead of duplicate" rule as
   * author/category/tag — the answer is never overwritten on a match,
   * since Studio is the source of truth once an FAQ document exists.
   */
  private async resolveFaqReferences(items: ArticleFaqItem[]): Promise<SanityReference[]> {
    const refs: SanityReference[] = [];
    for (const item of items) {
      const existingId = await this.client.fetch<string | null>(
        groq`*[_type == "faq" && question == $question][0]._id`,
        { question: item.question }
      );
      if (existingId) {
        refs.push({ _type: "reference", _ref: existingId });
        continue;
      }
      const created = await this.writeClient.create({
        _type: "faq",
        question: item.question,
        slug: { _type: "slug", current: slugify(item.question) || "faq" },
        answer: item.answer,
      });
      refs.push({ _type: "reference", _ref: created._id });
    }
    return refs;
  }

  /**
   * Matched by DOI first, then URL, then title — a source may carry none,
   * some, or all of those identifiers (see extractSources.ts). `source.
   * title` is required by the schema; the parser guarantees a non-empty
   * title for every source it emits, but a `null` title (source list built
   * by hand elsewhere) falls back to whatever identifying text exists
   * rather than sending an invalid document.
   */
  private async resolveSourceReferences(sources: ArticleSource[]): Promise<SanityReference[]> {
    const refs: SanityReference[] = [];
    for (const source of sources) {
      const title = source.title ?? source.url ?? source.doi ?? source.author ?? "منبع بدون عنوان";
      const existingId = await this.client.fetch<string | null>(
        groq`*[_type == "source" && (
          (defined(doi) && doi == $doi) ||
          (defined(url) && url == $url) ||
          title == $title
        )][0]._id`,
        { doi: source.doi, url: source.url, title }
      );
      if (existingId) {
        refs.push({ _type: "reference", _ref: existingId });
        continue;
      }
      const year = source.year !== null ? Number(source.year) : null;
      const created = await this.writeClient.create({
        _type: "source",
        title,
        ...(source.author ? { authors: source.author } : {}),
        ...(source.journal ? { journal: source.journal } : {}),
        ...(year !== null && !Number.isNaN(year) ? { year } : {}),
        ...(source.doi ? { doi: source.doi } : {}),
        ...(source.url ? { url: source.url } : {}),
      });
      refs.push({ _type: "reference", _ref: created._id });
    }
    return refs;
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
      const refs = await this.resolveDraftRefs(article);
      const { _type, ...fields } = mapArticleToSanityDraft(article, refs);
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
