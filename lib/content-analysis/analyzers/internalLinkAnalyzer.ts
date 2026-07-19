import type { AnalyzableArticle, InternalLinkSuggestion, LinkableArticleSummary } from "../types";
import { jaccardSimilarity, LINK_SUGGESTION_MIN_SCORE } from "../constants";

const UNTITLED_FALLBACK = "بدون عنوان";

const KEYWORD_WEIGHT = 0.3;
const TOPIC_WEIGHT = 0.2;
const ENTITY_WEIGHT = 0.2;
const PARENT_CHILD_WEIGHT = 0.15;
const CLUSTER_WEIGHT = 0.1;
const TAG_WEIGHT = 0.05;

function buildReason(signals: string[]): string {
  return signals.length > 0 ? signals.join("، ") : "شباهت کلی موضوعی";
}

/**
 * Real implementation — compares `article` against a candidate corpus and
 * returns ranked link suggestions only. Nothing here writes a link back
 * anywhere; the caller decides whether to act on a suggestion.
 */
export function analyzeInternalLinking(
  article: AnalyzableArticle,
  candidates: LinkableArticleSummary[]
): InternalLinkSuggestion[] {
  const suggestions: InternalLinkSuggestion[] = [];

  for (const candidate of candidates) {
    if (candidate.slug === null || candidate.slug === article.slug) continue;
    if (!candidate.isPublished) continue;

    const signals: string[] = [];
    let score = 0;

    const keywordSimilarity = jaccardSimilarity(article.keywords, candidate.keywords);
    if (keywordSimilarity > 0) {
      score += keywordSimilarity * KEYWORD_WEIGHT;
      signals.push(`اشتراک کلیدواژه (${Math.round(keywordSimilarity * 100)}٪)`);
    }

    const topicMatch = article.topic !== null && article.topic === candidate.topic;
    if (topicMatch) {
      score += TOPIC_WEIGHT;
      signals.push("موضوع یکسان");
    }

    const entitySimilarity = jaccardSimilarity(article.entities, candidate.entities);
    if (entitySimilarity > 0) {
      score += entitySimilarity * ENTITY_WEIGHT;
      signals.push(`اشتراک موجودیت (${Math.round(entitySimilarity * 100)}٪)`);
    }

    const isParentOfCandidate = article.topic !== null && article.topic === candidate.parentTopic;
    const isChildOfCandidate = candidate.topic !== null && candidate.topic === article.parentTopic;
    if (isParentOfCandidate || isChildOfCandidate) {
      score += PARENT_CHILD_WEIGHT;
      signals.push(isParentOfCandidate ? "موضوع والد" : "موضوع فرزند");
    }

    const clusterMatch = article.clusterId !== null && article.clusterId === candidate.clusterId;
    if (clusterMatch) {
      score += CLUSTER_WEIGHT;
      signals.push("خوشه موضوعی یکسان");
    }

    const tagSimilarity = jaccardSimilarity(article.tags, candidate.tags);
    if (tagSimilarity > 0) {
      score += tagSimilarity * TAG_WEIGHT;
      signals.push(`اشتراک برچسب (${Math.round(tagSimilarity * 100)}٪)`);
    }

    if (score < LINK_SUGGESTION_MIN_SCORE) continue;

    suggestions.push({
      targetSlug: candidate.slug,
      targetTitle: candidate.title ?? UNTITLED_FALLBACK,
      reason: buildReason(signals),
      confidence: Math.round(Math.min(score, 1) * 100),
      score: Math.round(score * 100) / 100,
    });
  }

  return suggestions.sort((a, b) => b.score - a.score);
}
