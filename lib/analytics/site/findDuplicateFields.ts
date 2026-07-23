import type { Article } from "@/lib/article/types";

export type DuplicateFieldGroup = {
  value: string;
  slugs: string[];
};

/**
 * Exact-match grouping on a scalar field (title/slug/meta description) —
 * distinct from analyzeDuplicateContent (lib/content-analysis/analyzers/
 * duplicateAnalyzer.ts), which does fuzzy near-duplicate BODY comparison
 * via Jaccard similarity on folded text. That analyzer answers "is this
 * one article too similar to another" per-article; this answers "which
 * groups of articles site-wide share the exact same field value" for a
 * flat dashboard table — a different question, not a re-derivation.
 */
function groupByExactValue(items: { slug: string | null; value: string | null }[]): DuplicateFieldGroup[] {
  const groups = new Map<string, string[]>();

  for (const item of items) {
    if (!item.slug || !item.value) continue;
    const key = item.value.trim();
    if (!key) continue;
    const existing = groups.get(key);
    if (existing) existing.push(item.slug);
    else groups.set(key, [item.slug]);
  }

  return Array.from(groups.entries())
    .filter(([, slugs]) => slugs.length > 1)
    .map(([value, slugs]) => ({ value, slugs }));
}

export function findDuplicateTitles(articles: Article[]): DuplicateFieldGroup[] {
  return groupByExactValue(articles.map((article) => ({ slug: article.slug, value: article.title })));
}

export function findDuplicateMetaDescriptions(articles: Article[]): DuplicateFieldGroup[] {
  return groupByExactValue(articles.map((article) => ({ slug: article.slug, value: article.metaDescription })));
}

export function findDuplicateSlugs(articles: Article[]): DuplicateFieldGroup[] {
  return groupByExactValue(articles.map((article) => ({ slug: article.slug, value: article.slug })));
}
