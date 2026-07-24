import type { DateRange } from "../types";
import { createArticleRepository } from "@/lib/article/repositories";
import { getSiteAnalysis } from "@/lib/analytics/site/getSiteAnalysis";
import { getExecutiveOverview } from "@/lib/analytics/site/executiveOverview";
import { googleSearchConsoleAdapter } from "../search/googleSearchConsoleAdapter";
import { googleAnalyticsAdapter } from "../traffic/googleAnalyticsAdapter";
import { createSnapshot } from "./SnapshotRepository";
import type { AnalyticsSnapshot } from "./types";

const TODAY_RANGE: DateRange = { preset: "today", start: null, end: null };

export type CaptureSnapshotResult = {
  snapshot: AnalyticsSnapshot;
  errors: string[];
};

/**
 * Gathers one row of history from every real source this project has —
 * internal analysis (always available) plus GSC/GA4 (best-effort: a
 * failure on one provider still lets the snapshot capture the other
 * fields for real, rather than losing the whole day's row). Every
 * skipped field is `null`, reported in `errors`, never a fabricated 0.
 */
export async function captureSnapshot(): Promise<CaptureSnapshotResult> {
  const errors: string[] = [];
  const repository = createArticleRepository();
  const analyses = await getSiteAnalysis(repository);
  const overview = getExecutiveOverview(analyses);
  const warnings = analyses.reduce(
    (sum, item) => sum + item.review.contentQuality.suggestions.recommended.length,
    0
  );

  const [search, traffic] = await Promise.all([
    googleSearchConsoleAdapter.getMetrics(TODAY_RANGE).catch((error) => {
      errors.push(`Search Console: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }),
    googleAnalyticsAdapter.getMetrics(TODAY_RANGE).catch((error) => {
      errors.push(`GA4: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }),
  ]);

  const snapshot: AnalyticsSnapshot = {
    timestamp: new Date().toISOString(),
    seoScore: overview.avgSeoScore,
    healthScore: overview.siteHealthScore,
    aeoScore: overview.avgAeoScore,
    geoScore: overview.avgGeoScore,
    clicks: search?.clicks.current ?? null,
    impressions: search?.impressions.current ?? null,
    ctr: search?.ctr.current ?? null,
    position: search?.averagePosition.current ?? null,
    users: traffic?.users.current ?? null,
    sessions: traffic?.sessions.current ?? null,
    engagementRate: traffic?.engagementRate.current ?? null,
    publishedArticles: overview.publishedArticles,
    draftArticles: overview.draftArticles,
    criticalIssues: overview.criticalIssuesCount,
    warnings,
  };

  await createSnapshot(snapshot);
  return { snapshot, errors };
}
