/**
 * The single canonical Article domain model. Every layer (parser,
 * analysis, AI, pipeline, dashboard, Sanity) reads and writes this same
 * shape. No other file in the repository may redefine an "article"
 * concept — narrower shapes (ArticleSummary, ParsedArticleFields,
 * dashboard row views) must derive from this type (Pick/Omit), never
 * restate its fields independently.
 */
export type ArticleSource = {
  doi: string | null;
  pmid: string | null;
  author: string | null;
  journal: string | null;
  year: string | null;
  title: string | null;
};

export type Article = {
  // Identity
  slug: string | null;
  title: string | null;

  // Classification
  topic: string | null;
  keywords: string[];
  tags: string[];
  entities: string[];
  clusterId: string | null;
  parentTopic: string | null;

  // Content
  body: string | null;
  excerpt: string | null;
  callout: string | null;
  window: string | null;
  importantPoints: string[];
  finalThought: string | null;
  finalQuestion: string | null;

  // Metadata
  metaDescription: string | null;
  readingTime: number | null;
  authorName: string | null;

  // Sources
  sources: ArticleSource[];

  // Structural signals
  headingCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  imageAltTexts: string[];
  hasFeaturedImage: boolean;
  hasSchema: boolean;
  hasCanonical: boolean;
  hasFaq: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;

  // Publication
  isPublished: boolean;

  // Derived text statistics
  wordCount: number;
  characterCount: number;
  estimatedReadingTime: number;

  // Parser/validation diagnostics that travel with the article until consumed
  warnings: string[];
};

/**
 * Lightweight view used by anything that needs to compare/list many
 * articles at once (repository results, link/duplicate candidates) — a
 * Pick of Article, never an independent redefinition.
 */
export type ArticleSummary = Pick<
  Article,
  | "slug"
  | "title"
  | "topic"
  | "keywords"
  | "entities"
  | "tags"
  | "parentTopic"
  | "clusterId"
  | "isPublished"
  | "body"
>;

/**
 * What the raw-text parser alone can produce — everything CMS/publication
 * state carries (schema, canonical, links, publish status, entities,
 * cluster) is unknowable from raw text and is not part of this view.
 * lib/article/mappers/fromParsedFields.ts fills the rest with defaults.
 */
export type ParsedArticleFields = Pick<
  Article,
  | "title"
  | "slug"
  | "topic"
  | "keywords"
  | "metaDescription"
  | "readingTime"
  | "excerpt"
  | "callout"
  | "body"
  | "window"
  | "importantPoints"
  | "finalThought"
  | "finalQuestion"
  | "sources"
  | "warnings"
  | "wordCount"
  | "characterCount"
  | "estimatedReadingTime"
>;
