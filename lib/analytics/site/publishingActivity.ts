import type { ArticleAnalysis } from "./getSiteAnalysis";
import { countBy } from "./shared";

const DAY_MS = 24 * 60 * 60 * 1000;
const STALE_THRESHOLD_MONTHS = 6;

export type PublishingActivity = {
  last7Days: number;
  last30Days: number;
  last90Days: number;
  allTime: number;
};

/**
 * Real activity counts from `article.publishedAt` (lib/article/types.ts —
 * wired from the actual Sanity field, not fabricated). Score-over-time
 * trend charts (SEO/content-quality/health trend) are intentionally not
 * built anywhere in this dashboard: they would need repeated historical
 * score snapshots this project has never recorded, and inventing numbers
 * for them would violate the no-fabrication rule. Publish *dates*, unlike
 * scores, are a real fact every article already carries — no history
 * needs to have been recorded to know them.
 */
export function getPublishingActivity(analyses: ArticleAnalysis[], now: Date = new Date()): PublishingActivity {
  const publishedDates = analyses
    .map((item) => item.article.publishedAt)
    .filter((value): value is string => value !== null)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  const within = (days: number) => publishedDates.filter((date) => now.getTime() - date.getTime() <= days * DAY_MS).length;

  return {
    last7Days: within(7),
    last30Days: within(30),
    last90Days: within(90),
    allTime: publishedDates.length,
  };
}

/** Real per-month publish counts, derived from actual publishedAt values — a genuine "publishing trend" chart, not a fabricated one. */
export function getPublishingTrendByMonth(analyses: ArticleAnalysis[]) {
  return countBy(analyses, (item) => {
    if (!item.article.publishedAt) return null;
    const date = new Date(item.article.publishedAt);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }).sort((a, b) => (a.label < b.label ? -1 : 1));
}

/** Real per-month publish counts per category — "Category Growth", same honesty rule as above. */
export function getCategoryGrowthByMonth(analyses: ArticleAnalysis[]) {
  const rows: { month: string; category: string }[] = [];
  for (const item of analyses) {
    if (!item.article.publishedAt || !item.article.category) continue;
    const date = new Date(item.article.publishedAt);
    if (Number.isNaN(date.getTime())) continue;
    rows.push({
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      category: item.article.category,
    });
  }
  return countBy(rows, (row) => `${row.month} — ${row.category}`);
}

/** An article "needs an update" when neither lastUpdated nor publishedAt is within the freshness window — a single-point-in-time check, not a decay trend. */
export function getArticlesNeedingUpdate(
  analyses: ArticleAnalysis[],
  now: Date = new Date(),
  staleMonths: number = STALE_THRESHOLD_MONTHS
) {
  const staleBefore = new Date(now);
  staleBefore.setMonth(staleBefore.getMonth() - staleMonths);

  return analyses.filter((item) => {
    if (!item.article.isPublished) return false;
    const referenceDate = item.article.lastUpdated ?? item.article.publishedAt;
    if (!referenceDate) return true;
    const date = new Date(referenceDate);
    if (Number.isNaN(date.getTime())) return true;
    return date < staleBefore;
  });
}
