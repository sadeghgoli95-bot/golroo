import type { DateRange } from "../types";
import { resolveDateRange } from "../dateRange";
import { runReport } from "@/lib/google/ga4Client";
import { createMemoryCache, withCache } from "@/lib/article/cache";
import { matchSlugForPath, round } from "./shared";

export type PageEngagementRow = {
  path: string;
  sessions: number;
  engagementRate: number;
};

const CACHE_TTL_MS = 15 * 60 * 1000; // same TTL policy as the other GA4/GSC caches (lib/analytics/traffic & search adapters)
const cache = createMemoryCache<PageEngagementRow[]>(CACHE_TTL_MS);
const LIMIT = 100;

/**
 * TrafficMetrics (lib/analytics/traffic/types.ts) exposes `landingPages`
 * (sessions only, no per-page engagement) and a single site-wide
 * `engagementRate` — neither lets item 10 ("Pages High Traffic/Low
 * Engagement") flag an individual page. Rather than approximate, this
 * queries the real GA4 Data API directly for `engagementRate` broken down
 * by `landingPage`, using the same thin `runReport` wrapper the existing
 * GA4 adapter uses (no new client, no duplicated auth/report logic) — it
 * only adds the one dimension×metric combination that isn't already
 * exposed. Real per-page GA4 data, not a derived estimate.
 */
async function fetchPageEngagement(bounds: { start: string; end: string }): Promise<PageEngagementRow[]> {
  const rows = await runReport({
    startDate: bounds.start,
    endDate: bounds.end,
    dimensions: ["landingPage"],
    metrics: ["sessions", "engagementRate"],
    limit: LIMIT,
  });

  return rows
    .map((row) => ({
      path: row.dimensions.landingPage ?? "",
      sessions: row.metrics.sessions ?? 0,
      engagementRate: row.metrics.engagementRate ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions);
}

export type SafePageEngagementResult = { data: PageEngagementRow[] | null; error: string | null };

/** Mirrors safeGoogleMetrics.ts's pattern: a thrown error (no GA4 credentials, quota, etc.) becomes an honest "not available" result, never a crash or a fabricated number. */
export async function getPageEngagementSafely(range: DateRange): Promise<SafePageEngagementResult> {
  try {
    const bounds = resolveDateRange(range);
    const cacheKey = `${bounds.start}_${bounds.end}`;
    const data = await withCache(cache, cacheKey, () => fetchPageEngagement(bounds));
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export type HighTrafficLowEngagementItem = {
  slug: string;
  title: string;
  path: string;
  sessions: number;
  engagementRate: number;
  reason: string;
};

/**
 * Pages High Traffic / Low Engagement (item 10). Real rule: sessions at
 * or above the MEDIAN of the fetched real per-page sessions (i.e. this
 * page draws more real traffic than at least half the site's other
 * landing pages) AND engagementRate below the real site-wide
 * `siteEngagementRate` (from TrafficMetrics.engagementRate.current, the
 * same GA4 adapter every other page reads) — both thresholds are derived
 * from real data already in hand, not arbitrary constants.
 */
export function getHighTrafficLowEngagementPages(
  rows: PageEngagementRow[],
  siteEngagementRate: number,
  analyses: { article: { slug: string | null; title: string | null } }[]
): HighTrafficLowEngagementItem[] {
  if (rows.length === 0) return [];

  const bySlug = new Map(
    analyses.filter((item) => item.article.slug).map((item) => [item.article.slug as string, item.article])
  );

  const sortedSessions = [...rows.map((row) => row.sessions)].sort((a, b) => a - b);
  const medianSessions = sortedSessions[Math.floor(sortedSessions.length / 2)];

  const items: HighTrafficLowEngagementItem[] = [];
  for (const row of rows) {
    const slug = matchSlugForPath(row.path);
    if (!slug) continue;
    const article = bySlug.get(slug);
    if (!article) continue;
    if (row.sessions < medianSessions || row.engagementRate >= siteEngagementRate) continue;

    items.push({
      slug,
      title: article.title ?? "بدون عنوان",
      path: row.path,
      sessions: row.sessions,
      engagementRate: row.engagementRate,
      reason: `${row.sessions} نشست واقعی (بالای میانه ${round(medianSessions)}) اما نرخ تعامل ${(row.engagementRate * 100).toFixed(1)}٪ کمتر از میانگین سایت`,
    });
  }

  return items.sort((a, b) => b.sessions - a.sessions);
}
