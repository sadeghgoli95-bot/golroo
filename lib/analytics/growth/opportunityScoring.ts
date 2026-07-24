import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { SearchPageMetric } from "../search/types";
import { matchSlugForPath, daysSince, clamp, round } from "./shared";

export type OpportunityItem = {
  slug: string;
  title: string;
  page: string;
  /** Real GSC fields this row was built from (last 30 days). */
  impressions: number;
  ctr: number;
  averagePosition: number;
  clicks: number;
  /**
   * Opportunity = impressions × (1 − ctr) × (20 − averagePosition).
   * Only defined for pages already filtered to the 11-20 "near first
   * page" band (see googleSearchConsoleAdapter's pagesNearFirstPage), so
   * (20 − averagePosition) is always in (0, 9]: a page closer to position
   * 11 with more unclicked impressions scores higher — real impressions
   * and real CTR are the only inputs, nothing estimated.
   */
  opportunityScore: number;
  /**
   * Priority = Opportunity × recencyWeight, where
   * recencyWeight = 1 + min(daysSinceLastUpdate / 365, 1) — an article
   * that hasn't been touched in a year gets up to 2× priority over one
   * updated yesterday, because a stale-but-close-to-page-1 article is a
   * more urgent update. daysSinceLastUpdate comes from the article's own
   * real lastUpdated (falling back to publishedAt); when neither date is
   * known, recencyWeight is 1 (no boost) rather than a guessed value.
   */
  priorityScore: number;
  /**
   * Impact = the real clicks this page already earns today (last 30
   * days) — not an estimate, the page's own current performance.
   */
  impactScore: number;
};

function recencyWeight(article: ArticleAnalysis["article"]): number {
  const days = daysSince(article.lastUpdated ?? article.publishedAt);
  if (days === null) return 1;
  return 1 + clamp(days / 365, 0, 1);
}

/**
 * Joins every real "pages near first page" (position 11-20) GSC row to
 * the real article it belongs to (via the /journal/<slug> URL pattern),
 * and computes Opportunity/Priority/Impact for each — the input to both
 * "Today's Biggest Opportunity" and "Articles Most Likely to Gain
 * Traffic". Rows that don't resolve to a known article (e.g. a
 * non-journal page ranking 11-20) are skipped rather than guessed.
 */
export function getOpportunityItems(
  pagesNearFirstPage: SearchPageMetric[],
  analyses: ArticleAnalysis[]
): OpportunityItem[] {
  const bySlug = new Map(analyses.filter((item) => item.article.slug).map((item) => [item.article.slug as string, item]));

  const items: OpportunityItem[] = [];
  for (const page of pagesNearFirstPage) {
    const slug = matchSlugForPath(page.page);
    if (!slug) continue;
    const analysis = bySlug.get(slug);
    if (!analysis) continue;

    const opportunityScore = round(page.impressions * (1 - page.ctr) * (20 - page.averagePosition));
    const priorityScore = round(opportunityScore * recencyWeight(analysis.article));

    items.push({
      slug,
      title: analysis.article.title ?? "بدون عنوان",
      page: page.page,
      impressions: page.impressions,
      ctr: page.ctr,
      averagePosition: page.averagePosition,
      clicks: page.clicks,
      opportunityScore,
      priorityScore,
      impactScore: page.clicks,
    });
  }

  return items.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Today's Biggest Opportunity (item 2) — the single highest-priority real
 * opportunity, or null when there's no real GSC signal to rank. Picks the
 * max by priorityScore directly (rather than assuming the caller already
 * sorted `items`) so this stays correct regardless of input order.
 */
export function getBiggestOpportunity(items: OpportunityItem[]): OpportunityItem | null {
  if (items.length === 0) return null;
  return items.reduce((best, item) => (item.priorityScore > best.priorityScore ? item : best), items[0]);
}
