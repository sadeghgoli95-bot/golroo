import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { SearchPageMetric } from "../search/types";
import type { OpportunityItem } from "./opportunityScoring";
import type { NeedsUpdatingItem, ReadyToRepublishItem } from "./contentFreshness";
import { matchSlugForPath, percentileRank, round } from "./shared";

export type RecommendationCategory = "quick_win" | "high_impact" | "maintenance" | "republish" | "critical";

export type Recommendation = {
  category: RecommendationCategory;
  slug: string;
  title: string;
  message: string;
  /** 0-1, this recommendation's rank within its own category (percentile of its category's own priority signal) — the field the weekly plan sorts by. */
  rank: number;
};

/**
 * Quick Wins (item 16) — real signal: highImpressionLowCtrPages (already
 * exposed by the GSC adapter) joined to their article. These are "quick"
 * because the fix (title/meta rewrite) is small relative to the real
 * impressions already being missed; the underlying number
 * (impressions × (1 − ctr)) is the same shape as the Opportunity formula,
 * applied to a different real page set.
 */
export function buildQuickWins(pages: SearchPageMetric[], analyses: ArticleAnalysis[]): Recommendation[] {
  const bySlug = new Map(analyses.filter((item) => item.article.slug).map((item) => [item.article.slug as string, item]));

  const scored = pages
    .map((page) => {
      const slug = matchSlugForPath(page.page);
      if (!slug) return null;
      const analysis = bySlug.get(slug);
      if (!analysis) return null;
      return { slug, title: analysis.article.title ?? "بدون عنوان", missedImpressions: round(page.impressions * (1 - page.ctr)), page };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const values = scored.map((row) => row.missedImpressions);

  return scored
    .map((row) => ({
      category: "quick_win" as const,
      slug: row.slug,
      title: row.title,
      message: `«${row.title}» — CTR واقعی ${(row.page.ctr * 100).toFixed(1)}٪ با وجود ${row.page.impressions} نمایش؛ بازنویسی عنوان/متا می‌تواند کلیک از دست‌رفته را بازیابد`,
      rank: percentileRank(values, row.missedImpressions),
    }))
    .sort((a, b) => b.rank - a.rank);
}

/** High Impact Tasks (item 16) — the highest-priority real opportunities (near-top-10 pages), see opportunityScoring.ts for the formula. */
export function buildHighImpactTasks(opportunities: OpportunityItem[]): Recommendation[] {
  const values = opportunities.map((item) => item.priorityScore);
  return opportunities.map((item) => ({
    category: "high_impact" as const,
    slug: item.slug,
    title: item.title,
    message: `«${item.title}» در جایگاه ${item.averagePosition.toFixed(1)} است — با ${item.impressions} نمایش واقعی، رساندن آن به صفحه اول اولویت بالایی دارد`,
    rank: percentileRank(values, item.priorityScore),
  }));
}

/** Maintenance recommendations from real needs-updating rows (contentFreshness.ts). */
export function buildMaintenanceTasks(items: NeedsUpdatingItem[]): Recommendation[] {
  const values = items.map((item) => item.daysSinceUpdate);
  return items.map((item) => ({
    category: "maintenance" as const,
    slug: item.slug,
    title: item.title,
    message: `به‌روزرسانی «${item.title}» — ${item.daysSinceUpdate} روز است تغییر نکرده و کلیک واقعی آن رو به افت است`,
    rank: percentileRank(values, item.daysSinceUpdate),
  }));
}

/** Republish recommendations from real ready-to-republish rows (contentFreshness.ts). */
export function buildRepublishTasks(items: ReadyToRepublishItem[]): Recommendation[] {
  return items.map((item, index) => ({
    category: "republish" as const,
    slug: item.slug,
    title: item.title,
    message: item.reason === "draft_ready" ? `«${item.title}» آماده انتشار است` : `«${item.title}» را بازنشر/به‌روزرسانی کنید — تقاضای جستجوی واقعی دارد`,
    rank: items.length <= 1 ? 1 : 1 - index / (items.length - 1),
  }));
}

/** Critical Issues (item 16) — directly from the real content-quality critical suggestions every ArticleAnalysis already carries. */
export function buildCriticalIssueTasks(analyses: ArticleAnalysis[]): Recommendation[] {
  const withCritical = analyses.filter((item) => item.article.slug && item.review.contentQuality.suggestions.critical.length > 0);
  const values = withCritical.map((item) => item.review.contentQuality.suggestions.critical.length);

  return withCritical.map((item) => ({
    category: "critical" as const,
    slug: item.article.slug as string,
    title: item.article.title ?? "بدون عنوان",
    message: `«${item.article.title ?? "بدون عنوان"}» — ${item.review.contentQuality.suggestions.critical.length} مشکل بحرانی محتوایی: ${item.review.contentQuality.suggestions.critical[0]}`,
    rank: percentileRank(values, item.review.contentQuality.suggestions.critical.length),
  }));
}

/** Weekly Action Plan (item 17) — top-N across every category above, ranked by each recommendation's own within-category percentile. */
export function buildWeeklyActionPlan(all: Recommendation[], topN = 5): Recommendation[] {
  return [...all].sort((a, b) => b.rank - a.rank).slice(0, topN);
}
