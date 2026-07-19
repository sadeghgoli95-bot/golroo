import type { Article, ArticleSummary } from "../types";

/** The only sanctioned way to narrow an Article to an ArticleSummary. */
export function mapArticleToSummary(article: Article): ArticleSummary {
  return {
    slug: article.slug,
    title: article.title,
    topic: article.topic,
    keywords: article.keywords,
    entities: article.entities,
    tags: article.tags,
    parentTopic: article.parentTopic,
    clusterId: article.clusterId,
    isPublished: article.isPublished,
    body: article.body,
  };
}
