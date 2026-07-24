import { SITE_NAME, ORGANIZATION_NAME } from "@/lib/seo/site";

/**
 * The one place the brand-term list is declared. Both the Phase 1 adapter
 * (googleSearchConsoleAdapter.ts) and the Phase 2 Search Intelligence
 * module (searchIntelligence.ts, intentClassifier.ts) import this instead
 * of each declaring their own list — see CLAUDE.md's ban on duplicated
 * business logic.
 */
export const BRAND_TERMS = [SITE_NAME, ORGANIZATION_NAME, "golroo", "mirora"].map((term) => term.toLowerCase());

export function isBrandQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return BRAND_TERMS.some((term) => lower.includes(term));
}
