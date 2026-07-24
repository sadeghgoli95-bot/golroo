import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import { daysSince } from "./shared";

/** An article is "stale" once it's gone this many real days since its lastUpdated (falling back to publishedAt). */
export const STALE_DAYS_THRESHOLD = 180;

export type NeedsUpdatingItem = {
  slug: string;
  title: string;
  daysSinceUpdate: number;
  reason: string;
};

/**
 * Articles That Need Updating (item 6). Real fields used, exactly:
 * - article.isPublished
 * - article.lastUpdated (falls back to article.publishedAt when null)
 * - membership in the real "losing visibility" set (visibilityTrends.ts —
 *   itself built from real GSC click comparisons)
 * A published article qualifies only when it is BOTH stale by its own
 * real date field AND already shown to be declining in real search
 * clicks — date-alone or decline-alone is not enough, to avoid flagging
 * an old-but-still-performing article or a recent article with a
 * temporary dip.
 */
export function getArticlesNeedingUpdate(analyses: ArticleAnalysis[], losingVisibilitySlugs: ReadonlySet<string>): NeedsUpdatingItem[] {
  const items: NeedsUpdatingItem[] = [];

  for (const item of analyses) {
    if (!item.article.isPublished || !item.article.slug) continue;
    if (!losingVisibilitySlugs.has(item.article.slug)) continue;

    const days = daysSince(item.article.lastUpdated ?? item.article.publishedAt);
    if (days === null || days < STALE_DAYS_THRESHOLD) continue;

    items.push({
      slug: item.article.slug,
      title: item.article.title ?? "بدون عنوان",
      daysSinceUpdate: days,
      reason: `${days} روز از آخرین به‌روزرسانی گذشته و کلیک واقعی این صفحه در حال افت است`,
    });
  }

  return items.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

export type ReadyToRepublishItem = {
  slug: string;
  title: string;
  reason: "draft_ready" | "published_high_opportunity";
  detail: string;
};

/**
 * Articles Ready for Republishing (item 7). Two exact real rules:
 * 1. draft_ready: !article.isPublished && review.publishReadiness.status === "ready"
 *    (the same publish-readiness engine every other dashboard page reads).
 * 2. published_high_opportunity: article.isPublished && the article's own
 *    page is a real "near first page" (position 11-20) or "high
 *    impression / low CTR" GSC page — i.e. it already has real search
 *    demand that a refresh (updated stats, stronger title/meta, added
 *    sections) could convert into more clicks.
 */
export function getArticlesReadyToRepublish(
  analyses: ArticleAnalysis[],
  opportunitySlugs: ReadonlySet<string>,
  highImpressionLowCtrSlugs: ReadonlySet<string>
): ReadyToRepublishItem[] {
  const items: ReadyToRepublishItem[] = [];

  for (const item of analyses) {
    if (!item.article.slug) continue;

    if (!item.article.isPublished && item.review.publishReadiness.status === "ready") {
      items.push({
        slug: item.article.slug,
        title: item.article.title ?? "بدون عنوان",
        reason: "draft_ready",
        detail: "پیش‌نویس آماده انتشار است (وضعیت publishReadiness: ready)",
      });
      continue;
    }

    if (item.article.isPublished && (opportunitySlugs.has(item.article.slug) || highImpressionLowCtrSlugs.has(item.article.slug))) {
      items.push({
        slug: item.article.slug,
        title: item.article.title ?? "بدون عنوان",
        reason: "published_high_opportunity",
        detail: "این مقاله در Search Console تقاضای واقعی دارد و بازنشر/به‌روزرسانی می‌تواند بازدهی آن را افزایش دهد",
      });
    }
  }

  return items;
}
