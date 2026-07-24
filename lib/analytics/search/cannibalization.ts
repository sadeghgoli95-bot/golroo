import type { SearchAnalyticsRow } from "@/lib/google/searchConsoleClient";

export type CannibalizingPage = { page: string; clicks: number; impressions: number; averagePosition: number };
export type QueryCannibalization = { query: string; totalImpressions: number; pages: CannibalizingPage[] };

export type CannibalizingQuery = { query: string; pageClicks: number; overlappingPageClicks: number };
export type PageCannibalization = {
  page: string;
  overlappingPage: string;
  sharedQueries: CannibalizingQuery[];
};

/** A page only counts as "meaningfully" competing for a query above this impression floor — avoids flagging noise (a page that got 1 stray impression). */
const MEANINGFUL_IMPRESSIONS = 5;
/** Two pages only count as cannibalizing each other once they share at least this many meaningfully-ranking queries. */
const MIN_SHARED_QUERIES = 2;
/** Pairwise page-overlap comparison is O(n^2); bounded to the top N pages by clicks so it stays cheap at any real site size. */
const MAX_PAGES_FOR_PAIRWISE_COMPARISON = 60;

/**
 * Query Cannibalization Detection (item 10) — real signal from GSC's
 * combined query+page dimensions: a query where more than one distinct
 * page earns meaningful impressions is a sign the site is competing with
 * itself for that query instead of consolidating ranking signal onto one
 * page.
 */
export function detectQueryCannibalization(combinedRows: SearchAnalyticsRow[], limit = 20): QueryCannibalization[] {
  const byQuery = new Map<string, CannibalizingPage[]>();

  for (const row of combinedRows) {
    const [query, page] = row.keys;
    if (!query || !page) continue;
    if (row.impressions < MEANINGFUL_IMPRESSIONS) continue;

    const pages = byQuery.get(query) ?? [];
    pages.push({ page, clicks: row.clicks, impressions: row.impressions, averagePosition: row.position });
    byQuery.set(query, pages);
  }

  const cannibalized: QueryCannibalization[] = [];
  for (const [query, pages] of byQuery) {
    if (pages.length < 2) continue;
    const sortedPages = [...pages].sort((a, b) => b.impressions - a.impressions);
    cannibalized.push({
      query,
      totalImpressions: sortedPages.reduce((sum, page) => sum + page.impressions, 0),
      pages: sortedPages,
    });
  }

  return cannibalized.sort((a, b) => b.totalImpressions - a.totalImpressions).slice(0, limit);
}

/**
 * Page Cannibalization Detection (item 11) — derived from the same
 * combined query+page dataset: two pages that both meaningfully rank for
 * an overlapping set of queries are competing for the same search intent.
 * Bounded to the top-clicked pages so the pairwise comparison stays cheap.
 */
export function detectPageCannibalization(combinedRows: SearchAnalyticsRow[], limit = 20): PageCannibalization[] {
  const queriesByPage = new Map<string, Map<string, { clicks: number; impressions: number }>>();
  const clicksByPage = new Map<string, number>();

  for (const row of combinedRows) {
    const [query, page] = row.keys;
    if (!query || !page) continue;
    if (row.impressions < MEANINGFUL_IMPRESSIONS) continue;

    const queries = queriesByPage.get(page) ?? new Map();
    queries.set(query, { clicks: row.clicks, impressions: row.impressions });
    queriesByPage.set(page, queries);
    clicksByPage.set(page, (clicksByPage.get(page) ?? 0) + row.clicks);
  }

  const pages = [...queriesByPage.keys()]
    .sort((a, b) => (clicksByPage.get(b) ?? 0) - (clicksByPage.get(a) ?? 0))
    .slice(0, MAX_PAGES_FOR_PAIRWISE_COMPARISON);

  const results: PageCannibalization[] = [];
  const seenPairs = new Set<string>();

  for (const page of pages) {
    for (const overlappingPage of pages) {
      if (page >= overlappingPage) continue;
      const pairKey = `${page}::${overlappingPage}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const pageQueries = queriesByPage.get(page)!;
      const overlappingQueries = queriesByPage.get(overlappingPage)!;

      const sharedQueries: CannibalizingQuery[] = [];
      for (const [query, stats] of pageQueries) {
        const overlappingStats = overlappingQueries.get(query);
        if (!overlappingStats) continue;
        sharedQueries.push({ query, pageClicks: stats.clicks, overlappingPageClicks: overlappingStats.clicks });
      }

      if (sharedQueries.length >= MIN_SHARED_QUERIES) {
        results.push({ page, overlappingPage, sharedQueries: sharedQueries.sort((a, b) => b.pageClicks - a.pageClicks) });
      }
    }
  }

  return results.sort((a, b) => b.sharedQueries.length - a.sharedQueries.length).slice(0, limit);
}
