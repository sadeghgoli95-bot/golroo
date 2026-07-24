import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
import { getGscSiteUrl } from "./config";

export type SearchAnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchAnalyticsQuery = {
  startDate: string;
  endDate: string;
  dimensions?: ("date" | "query" | "page" | "country" | "device")[];
  rowLimit?: number;
};

/**
 * Thin, real wrapper around the Search Console API — no business logic
 * (comparisons, growth, brand classification) lives here, only the raw
 * authenticated query. lib/analytics/search/googleSearchConsoleAdapter.ts
 * is the one place allowed to interpret these rows.
 */
export async function querySearchAnalytics(query: SearchAnalyticsQuery): Promise<SearchAnalyticsRow[]> {
  const siteUrl = getGscSiteUrl();
  if (!siteUrl) {
    throw new Error("GSC_SITE_URL is not configured — Search Console integration is unavailable");
  }

  const searchconsole = google.searchconsole({ version: "v1", auth: getGoogleAuth() });
  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: query.startDate,
      endDate: query.endDate,
      dimensions: query.dimensions,
      rowLimit: query.rowLimit ?? 25000,
    },
  });

  return (response.data.rows ?? []).map((row) => ({
    keys: row.keys ?? [],
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

export type SearchConsoleSite = {
  siteUrl: string;
  permissionLevel: string;
};

/** Used by Settings' live-detection check — confirms the credential can actually reach the API, not just that env vars are set. */
export async function listAccessibleSites(): Promise<SearchConsoleSite[]> {
  const searchconsole = google.searchconsole({ version: "v1", auth: getGoogleAuth() });
  const response = await searchconsole.sites.list();
  return (response.data.siteEntry ?? []).map((entry) => ({
    siteUrl: entry.siteUrl ?? "",
    permissionLevel: entry.permissionLevel ?? "",
  }));
}
