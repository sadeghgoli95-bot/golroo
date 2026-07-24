import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Ga4Row } from "@/lib/google/ga4Client";
import type { ArticleAnalysis } from "../site/getSiteAnalysis";

const runReportMock = vi.fn<(query: unknown) => Promise<Ga4Row[]>>();

vi.mock("@/lib/google/ga4Client", () => ({
  runReport: (query: unknown) => runReportMock(query),
}));

function makeAnalysis(slug: string, body: string | null): ArticleAnalysis {
  return {
    article: { slug, title: slug, body } as ArticleAnalysis["article"],
  } as ArticleAnalysis;
}

describe("getContentAttribution", () => {
  beforeEach(() => {
    runReportMock.mockReset();
  });

  it("joins real GA4 landing-page sessions to articles via the /journal/<slug> path and scores by sessions + bookingLinkCount*10", async () => {
    const { getContentAttribution } = await import("./contentAttribution");

    runReportMock.mockResolvedValue([
      { dimensions: { landingPage: "/journal/anxiety-in-kids" }, metrics: { sessions: 50, engagementRate: 0.6 } },
      { dimensions: { landingPage: "/journal/anxiety-in-kids?utm_source=x" }, metrics: { sessions: 10, engagementRate: 0.6 } },
      { dimensions: { landingPage: "/" }, metrics: { sessions: 999, engagementRate: 0.1 } },
    ]);

    const analyses = [
      makeAnalysis("anxiety-in-kids", "متن با لینک به [نوبت‌دهی](/appointment) و [تماس](/contact)."),
      makeAnalysis("no-links-article", "متنی بدون هیچ لینکی."),
    ];

    const rows = await getContentAttribution({ start: "2021-01-01", end: "2021-01-31" }, analyses);

    const anxietyRow = rows.find((row) => row.slug === "anxiety-in-kids");
    expect(anxietyRow?.landingSessions).toBe(60);
    expect(anxietyRow?.bookingLinkCount).toBe(2);
    expect(anxietyRow?.estimatedScore).toBe(60 + 2 * 10);

    const noLinksRow = rows.find((row) => row.slug === "no-links-article");
    expect(noLinksRow?.landingSessions).toBe(0);
    expect(noLinksRow?.bookingLinkCount).toBe(0);
  });

  it("sorts descending by estimatedScore and skips articles with a null slug", async () => {
    const { getContentAttribution } = await import("./contentAttribution");
    runReportMock.mockResolvedValue([]);

    const analyses = [makeAnalysis("low", null), makeAnalysis("high", "[book](/appointment)"), makeAnalysis(null as unknown as string, "x")];

    const rows = await getContentAttribution({ start: "2021-01-01", end: "2021-01-31" }, analyses);
    expect(rows).toHaveLength(2);
    expect(rows[0].slug).toBe("high");
  });
});
