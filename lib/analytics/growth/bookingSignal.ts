import type { ArticleAnalysis } from "../site/getSiteAnalysis";
import type { SearchMetrics, SearchPageMetric } from "../search/types";
import type { TrafficMetrics, LandingPageMetric } from "../traffic/types";
import { extractLinkUrls } from "@/lib/content-analysis/analyzers/brokenLinkAnalyzer";
import { matchSlugForPath } from "./shared";

const BOOKING_LINK_PATTERN = /^(?:https?:\/\/[^/]+)?\/(appointment|contact)\/?$/;

/** Whether a real Markdown link target inside the article body points at the site's real /appointment or /contact route. */
function isBookingLink(url: string): boolean {
  return BOOKING_LINK_PATTERN.test(url.split("?")[0] ?? url);
}

export type BookingSignalItem = {
  slug: string;
  title: string;
  /** How many real links this article's own body contains to /appointment or /contact. */
  bookingLinkCount: number;
  /** Real GSC clicks for this article's own page (last 30 days), if the page happened to appear in a fetched slice — null when not observed, never 0. */
  clicks: number | null;
  /** Real GA4 sessions for this article's own landing page (last 30 days), null when not observed. */
  sessions: number | null;
};

function findPageForSlug(slug: string, pages: SearchPageMetric[]): SearchPageMetric | null {
  return pages.find((page) => matchSlugForPath(page.page) === slug) ?? null;
}

function findLandingPageForSlug(slug: string, landingPages: LandingPageMetric[]): LandingPageMetric | null {
  return landingPages.find((page) => matchSlugForPath(page.path) === slug) ?? null;
}

/**
 * Pages Driving Appointment/Contact Interest (item 11) — an internal-link
 * -based proxy, explicitly NOT a session-linked conversion count (that's
 * Phase 7's job). Reuses `extractLinkUrls` (brokenLinkAnalyzer.ts) to find
 * every real Markdown link in the article's real body, flags the ones
 * pointing at the site's two real booking/contact routes, and — only when
 * the article's own page happens to be present in the already-fetched
 * real GSC/GA4 slices — attaches its own real clicks/sessions. No number
 * here is fabricated: articles whose page wasn't observed in this
 * request's fetched slices show `null`, not 0.
 */
export function getBookingSignalItems(
  analyses: ArticleAnalysis[],
  search: SearchMetrics | null,
  traffic: TrafficMetrics | null
): BookingSignalItem[] {
  const pages = search ? [...search.topPages, ...search.pagesNearFirstPage, ...search.highImpressionLowCtrPages] : [];
  const landingPages = traffic?.landingPages ?? [];

  const items: BookingSignalItem[] = [];
  for (const item of analyses) {
    if (!item.article.slug) continue;
    const links = extractLinkUrls(item.article.body);
    const bookingLinkCount = links.filter(isBookingLink).length;
    if (bookingLinkCount === 0) continue;

    const page = findPageForSlug(item.article.slug, pages);
    const landingPage = findLandingPageForSlug(item.article.slug, landingPages);

    items.push({
      slug: item.article.slug,
      title: item.article.title ?? "بدون عنوان",
      bookingLinkCount,
      clicks: page ? page.clicks : null,
      sessions: landingPage ? landingPage.sessions : null,
    });
  }

  return items.sort((a, b) => (b.clicks ?? -1) - (a.clicks ?? -1));
}

/** Item 12's single scoped widget: "N مقاله لینک مستقیم به نوبت‌دهی دارند" — a real count, deliberately not a funnel/session count. */
export function countArticlesLinkingToBooking(items: BookingSignalItem[]): number {
  return items.length;
}
