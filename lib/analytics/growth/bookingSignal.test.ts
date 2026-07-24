import { describe, it, expect } from "vitest";
import { getBookingSignalItems, countArticlesLinkingToBooking } from "./bookingSignal";
import { buildTestAnalysis } from "../site/testFixtures";

describe("getBookingSignalItems", () => {
  it("finds real links to /appointment or /contact inside the article body", () => {
    const analysis = buildTestAnalysis({
      article: { slug: "a", body: "برای شروع [نوبت بگیرید](/appointment) یا [تماس بگیرید](https://golroo.ir/contact)" },
    });
    const items = getBookingSignalItems([analysis], null, null);
    expect(items).toHaveLength(1);
    expect(items[0].bookingLinkCount).toBe(2);
    expect(items[0].clicks).toBeNull();
    expect(items[0].sessions).toBeNull();
  });

  it("excludes articles with no real booking link", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a", body: "بدون هیچ لینکی" } });
    expect(getBookingSignalItems([analysis], null, null)).toHaveLength(0);
  });

  it("attaches real clicks/sessions only when the article's page was actually observed", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a", body: "[نوبت](/appointment)" } });
    const search = {
      clicks: { current: 0, previousPeriod: null, previousYear: null },
      impressions: { current: 0, previousPeriod: null, previousYear: null },
      ctr: { current: 0, previousPeriod: null, previousYear: null },
      averagePosition: { current: 0, previousPeriod: null, previousYear: null },
      topQueries: [],
      fastestGrowingQueries: [],
      losingQueries: [],
      brandQueries: [],
      nonBrandQueries: [],
      topPages: [{ page: "/journal/a", clicks: 12, impressions: 50, ctr: 0.24, averagePosition: 3 }],
      pagesNearFirstPage: [],
      highImpressionLowCtrPages: [],
    };
    const items = getBookingSignalItems([analysis], search, null);
    expect(items[0].clicks).toBe(12);
  });
});

describe("countArticlesLinkingToBooking", () => {
  it("counts real booking-linking articles, not a session/funnel count", () => {
    expect(countArticlesLinkingToBooking([{ slug: "a", title: "a", bookingLinkCount: 1, clicks: null, sessions: null }])).toBe(1);
  });
});
