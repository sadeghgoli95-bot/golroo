import type {
  AnalyzableArticle,
  DuplicateMatch,
  LinkableArticleSummary,
  SemanticDuplicateCheck,
} from "../types";
import {
  jaccardSimilarity,
  EXACT_DUPLICATE_THRESHOLD,
  NEAR_DUPLICATE_THRESHOLD,
  KEYWORD_DUPLICATE_THRESHOLD,
  ENTITY_DUPLICATE_THRESHOLD,
} from "../constants";

const UNTITLED_FALLBACK = "بدون عنوان";

function bodyWords(body: string | null): string[] {
  return body ? body.split(/\s+/).filter(Boolean) : [];
}

/** Real implementation for every match type except semantic (see below). */
export function analyzeDuplicateContent(
  article: AnalyzableArticle,
  candidates: LinkableArticleSummary[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const articleBodyWords = bodyWords(article.body);

  for (const candidate of candidates) {
    if (candidate.slug === null || candidate.slug === article.slug) continue;

    const targetSlug = candidate.slug;
    const targetTitle = candidate.title ?? UNTITLED_FALLBACK;

    if (article.slug !== null && article.slug === candidate.slug) {
      matches.push({ matchType: "slug", targetSlug, targetTitle, confidence: 100 });
    }

    if (article.title !== null && candidate.title !== null && article.title.trim() === candidate.title.trim()) {
      matches.push({ matchType: "title", targetSlug, targetTitle, confidence: 100 });
    }

    const bodySimilarity = jaccardSimilarity(articleBodyWords, bodyWords(candidate.body));
    if (bodySimilarity >= EXACT_DUPLICATE_THRESHOLD) {
      matches.push({ matchType: "exact", targetSlug, targetTitle, confidence: Math.round(bodySimilarity * 100) });
    } else if (bodySimilarity >= NEAR_DUPLICATE_THRESHOLD) {
      matches.push({ matchType: "near", targetSlug, targetTitle, confidence: Math.round(bodySimilarity * 100) });
    }

    const keywordSimilarity = jaccardSimilarity(article.keywords, candidate.keywords);
    if (keywordSimilarity >= KEYWORD_DUPLICATE_THRESHOLD) {
      matches.push({
        matchType: "keyword",
        targetSlug,
        targetTitle,
        confidence: Math.round(keywordSimilarity * 100),
      });
    }

    const entitySimilarity = jaccardSimilarity(article.entities, candidate.entities);
    if (entitySimilarity >= ENTITY_DUPLICATE_THRESHOLD) {
      matches.push({
        matchType: "entity",
        targetSlug,
        targetTitle,
        confidence: Math.round(entitySimilarity * 100),
      });
    }
  }

  return matches;
}

/** Interface only — semantic duplicate detection needs embeddings/an AI provider, which this module has no dependency on. */
export function checkSemanticDuplicate(): SemanticDuplicateCheck {
  return { status: "not_implemented" };
}
