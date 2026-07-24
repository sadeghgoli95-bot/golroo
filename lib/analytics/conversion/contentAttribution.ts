import { runReport } from "@/lib/google/ga4Client";
import type { IsoDateRange } from "../dateRange";
import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import { extractLinkUrls } from "@/lib/content-analysis/analyzers/brokenLinkAnalyzer";
import type { ContentAttributionRow } from "./types";

const JOURNAL_LANDING_PREFIX = "/journal/";
const SCORE_WEIGHT_PER_BOOKING_LINK = 10;

/** True when a real Markdown link in an article body points at the site's real booking/contact routes. */
function isBookingIntentLink(url: string): boolean {
  return url.includes("/appointment") || url.includes("/contact");
}

function slugFromLandingPage(landingPage: string): string | null {
  const path = landingPage.split("?")[0] ?? "";
  if (!path.startsWith(JOURNAL_LANDING_PREFIX)) return null;
  const slug = path.slice(JOURNAL_LANDING_PREFIX.length).replace(/\/$/, "");
  return slug || null;
}

/**
 * Item 12 of the Phase 7 brief — a labeled ESTIMATE, not a measured
 * conversion count: real GA4 landing-page sessions/engagement for each
 * article, combined with a real count of the article's own internal
 * links toward /appointment or /contact (via extractLinkUrls, the same
 * link extractor brokenLinkAnalyzer.ts already exports — no second link
 * parser). GA4's Data API has no way to prove any of those sessions
 * actually continued to a booking, so this ranks "estimated booking-intent
 * contribution," not "articles that generated appointments" (item 7,
 * which is rendered as Not available for exactly that reason).
 *
 * estimatedScore = landingSessions + bookingLinkCount * 10 — the 10x
 * weight is a deliberate, disclosed editorial choice (an article that
 * actively links toward booking is a stronger booking-intent signal per
 * visit than raw traffic alone), not a derived statistic.
 */
export async function getContentAttribution(range: IsoDateRange, analyses: ArticleAnalysis[]): Promise<ContentAttributionRow[]> {
  const landingRows = await runReport({
    startDate: range.start,
    endDate: range.end,
    dimensions: ["landingPage"],
    metrics: ["sessions", "engagementRate"],
    limit: 1000,
  });

  const sessionsBySlug = new Map<string, number>();
  const engagementBySlug = new Map<string, number>();
  for (const row of landingRows) {
    const slug = slugFromLandingPage(row.dimensions.landingPage ?? "");
    if (!slug) continue;
    sessionsBySlug.set(slug, (sessionsBySlug.get(slug) ?? 0) + (row.metrics.sessions ?? 0));
    engagementBySlug.set(slug, row.metrics.engagementRate ?? 0);
  }

  return analyses
    .filter((analysis): analysis is ArticleAnalysis & { article: { slug: string } } => analysis.article.slug !== null)
    .map((analysis) => {
      const slug = analysis.article.slug;
      const bookingLinkCount = extractLinkUrls(analysis.article.body).filter(isBookingIntentLink).length;
      const landingSessions = sessionsBySlug.get(slug) ?? 0;
      const engagementRate = engagementBySlug.get(slug) ?? 0;
      return {
        slug,
        title: analysis.article.title ?? slug,
        landingSessions,
        engagementRate,
        bookingLinkCount,
        estimatedScore: landingSessions + bookingLinkCount * SCORE_WEIGHT_PER_BOOKING_LINK,
      };
    })
    .sort((a, b) => b.estimatedScore - a.estimatedScore);
}

export const CONTENT_ATTRIBUTION_FORMULA = "امتیاز تخمینی = نشست‌های فرود مقاله (GA4) + (تعداد لینک داخلی مقاله به نوبت‌دهی/تماس × ۱۰) — یک تخمین است، نه اندازه‌گیری مستقیم تبدیل.";
