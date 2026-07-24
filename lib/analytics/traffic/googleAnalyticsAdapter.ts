import type { AnalyticsAdapter, DateRange } from "../types";
import type { TrafficMetrics, LandingPageMetric, TrafficSourceMetric, DeviceMetric, CountryMetric } from "./types";
import { runReport } from "@/lib/google/ga4Client";
import { resolveDateRange, getPreviousPeriod, type IsoDateRange } from "../dateRange";
import { buildMetricValue } from "../comparison";
import { createMemoryCache, withCache } from "@/lib/article/cache";

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = createMemoryCache<TrafficMetrics>(CACHE_TTL_MS);
const BREAKDOWN_LIMIT = 10;

const SUMMARY_METRICS = [
  "activeUsers",
  "totalUsers",
  "newUsers",
  "sessions",
  "engagedSessions",
  "engagementRate",
  "averageSessionDuration",
  "screenPageViews",
  "bounceRate",
  "screenPageViewsPerSession",
];

async function querySummary(range: IsoDateRange) {
  const rows = await runReport({ startDate: range.start, endDate: range.end, metrics: SUMMARY_METRICS });
  const metrics = rows[0]?.metrics ?? {};
  return {
    users: metrics.activeUsers ?? 0,
    totalUsers: metrics.totalUsers ?? 0,
    newUsers: metrics.newUsers ?? 0,
    sessions: metrics.sessions ?? 0,
    engagedSessions: metrics.engagedSessions ?? 0,
    engagementRate: metrics.engagementRate ?? 0,
    averageSessionDuration: metrics.averageSessionDuration ?? 0,
    pageViews: metrics.screenPageViews ?? 0,
    bounceRate: metrics.bounceRate ?? 0,
    pagesPerSession: metrics.screenPageViewsPerSession ?? 0,
  };
}

async function buildTrafficMetrics(range: IsoDateRange): Promise<TrafficMetrics> {
  const previousRange = getPreviousPeriod(range);

  const [current, previous, landingPageRows, sourceRows, deviceRows, countryRows] = await Promise.all([
    querySummary(range),
    querySummary(previousRange),
    runReport({
      startDate: range.start,
      endDate: range.end,
      dimensions: ["landingPage"],
      metrics: ["sessions", "activeUsers"],
      limit: 100,
    }),
    runReport({
      startDate: range.start,
      endDate: range.end,
      dimensions: ["sessionDefaultChannelGroup"],
      metrics: ["sessions", "activeUsers"],
      limit: 50,
    }),
    runReport({
      startDate: range.start,
      endDate: range.end,
      dimensions: ["deviceCategory"],
      metrics: ["sessions", "activeUsers"],
      limit: 10,
    }),
    runReport({
      startDate: range.start,
      endDate: range.end,
      dimensions: ["country"],
      metrics: ["sessions", "activeUsers"],
      limit: 50,
    }),
  ]);

  const landingPages: LandingPageMetric[] = landingPageRows
    .map((row) => ({
      path: row.dimensions.landingPage ?? "",
      sessions: row.metrics.sessions ?? 0,
      users: row.metrics.activeUsers ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, BREAKDOWN_LIMIT);

  const trafficSources: TrafficSourceMetric[] = sourceRows
    .map((row) => ({
      source: row.dimensions.sessionDefaultChannelGroup ?? "",
      sessions: row.metrics.sessions ?? 0,
      users: row.metrics.activeUsers ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  const devices: DeviceMetric[] = deviceRows
    .map((row) => ({
      device: row.dimensions.deviceCategory ?? "",
      sessions: row.metrics.sessions ?? 0,
      users: row.metrics.activeUsers ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  const countries: CountryMetric[] = countryRows
    .map((row) => ({
      country: row.dimensions.country ?? "",
      sessions: row.metrics.sessions ?? 0,
      users: row.metrics.activeUsers ?? 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, BREAKDOWN_LIMIT);

  return {
    users: buildMetricValue(current.users, previous.users),
    sessions: buildMetricValue(current.sessions, previous.sessions),
    engagedSessions: buildMetricValue(current.engagedSessions, previous.engagedSessions),
    pageViews: buildMetricValue(current.pageViews, previous.pageViews),
    uniqueVisitors: buildMetricValue(current.totalUsers, previous.totalUsers),
    returningVisitors: buildMetricValue(current.totalUsers - current.newUsers, previous.totalUsers - previous.newUsers),
    newUsers: buildMetricValue(current.newUsers, previous.newUsers),
    averageSessionDuration: buildMetricValue(current.averageSessionDuration, previous.averageSessionDuration),
    bounceRate: buildMetricValue(current.bounceRate, previous.bounceRate),
    engagementRate: buildMetricValue(current.engagementRate, previous.engagementRate),
    pagesPerSession: buildMetricValue(current.pagesPerSession, previous.pagesPerSession),
    landingPages,
    trafficSources,
    devices,
    countries,
  };
}

/**
 * Real GA4 adapter — replaces the "local" (empty) adapter for the
 * "google-analytics-4" provider (see localAdapter.ts's own comment on
 * this being the intended extension point). Cached per resolved date
 * range (15 min) — see lib/article/cache.
 */
export const googleAnalyticsAdapter: AnalyticsAdapter<TrafficMetrics> = {
  providerId: "google-analytics-4",
  getMetrics: async (range: DateRange) => {
    const bounds = resolveDateRange(range);
    const cacheKey = `${bounds.start}_${bounds.end}`;
    return withCache(cache, cacheKey, () => buildTrafficMetrics(bounds));
  },
};
