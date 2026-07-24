import { resolveInternalLinkTargetSlug } from "@/lib/content-analysis/analyzers/brokenLinkAnalyzer";

/**
 * Small, generic helpers every lib/analytics/growth/* module composes —
 * mirrors the "one implementation, reused everywhere" rule already
 * followed by lib/analytics/site/shared.ts. Kept in its own file (rather
 * than extending site/shared.ts) because these helpers are specific to
 * joining real GSC/GA4 page-level rows to a real article slug and to the
 * percentile-based ranking Phase 3 needs — nothing here duplicates an
 * existing aggregation helper.
 */

/** Strips a query string, then reuses the exact same /journal/<slug> matcher the broken-link analyzer already uses — one URL→slug resolver for the whole codebase. */
export function matchSlugForPath(pathOrUrl: string): string | null {
  const withoutQuery = pathOrUrl.split("?")[0] ?? pathOrUrl;
  return resolveInternalLinkTargetSlug(withoutQuery);
}

/** Days between an ISO date string and `now` (defaults to real current time). Returns null when the date is missing — never fabricates an age for unknown dates. */
export function daysSince(isoDate: string | null, now: Date = new Date()): number | null {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return null;
  return Math.floor((now.getTime() - then.getTime()) / (24 * 60 * 60 * 1000));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Percentile rank (0-1) of `value` within `values` — used by the Content
 * Performance Ranking (item 13) to combine fields that live on different
 * scales (a 0-100 score vs. raw clicks vs. raw sessions) without inventing
 * an arbitrary normalization constant: each factor is ranked only against
 * the site's own real corpus.
 */
export function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0;
  const notGreater = values.filter((item) => item <= value).length;
  return notGreater / values.length;
}

export function round(value: number): number {
  return Math.round(value);
}
