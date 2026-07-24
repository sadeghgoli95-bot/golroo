import { runReport, type Ga4Row } from "@/lib/google/ga4Client";
import { getPreviousPeriod, type IsoDateRange } from "../dateRange";
import { buildMetricValue } from "../comparison";
import { createMemoryCache, withCache } from "@/lib/article/cache";
import type { ConversionSummary, ConversionRateBreakdownRow } from "./types";

/**
 * The site's only real booking/contact entry points (confirmed real
 * routes: app/appointment, app/contact). Every "conversion" number in
 * Phase 7 is ultimately a pageview count on one of these two paths —
 * never a true booking-completed event, because no such event exists on
 * the live site.
 */
export const CONVERSION_PATHS = ["/appointment", "/contact"] as const;

const ORGANIC_CHANNEL = "Organic Search";
const RETURNING_SEGMENT = "returning";
const NEW_SEGMENT = "new";
const BREAKDOWN_LIMIT = 1000;

function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0] ?? "";
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }
  return withoutQuery || "/";
}

function isConversionPath(path: string): boolean {
  return (CONVERSION_PATHS as readonly string[]).includes(normalizePath(path));
}

async function queryPathByDimension(range: IsoDateRange, dimension: string): Promise<Ga4Row[]> {
  return runReport({
    startDate: range.start,
    endDate: range.end,
    dimensions: ["pagePath", dimension],
    metrics: ["screenPageViews"],
    limit: BREAKDOWN_LIMIT,
  });
}

async function querySessionsByDimension(range: IsoDateRange, dimension: string): Promise<Ga4Row[]> {
  return runReport({
    startDate: range.start,
    endDate: range.end,
    dimensions: [dimension],
    metrics: ["sessions"],
    limit: BREAKDOWN_LIMIT,
  });
}

function sumConversionViews(rows: Ga4Row[], dimension: string, dimensionValue?: string): number {
  return rows
    .filter((row) => isConversionPath(row.dimensions.pagePath ?? "") && (dimensionValue === undefined || row.dimensions[dimension] === dimensionValue))
    .reduce((sum, row) => sum + (row.metrics.screenPageViews ?? 0), 0);
}

function sumConversionViewsForPath(rows: Ga4Row[], path: string): number {
  return rows.filter((row) => normalizePath(row.dimensions.pagePath ?? "") === path).reduce((sum, row) => sum + (row.metrics.screenPageViews ?? 0), 0);
}

function sumSessions(rows: Ga4Row[], dimension?: string, dimensionValue?: string): number {
  return rows
    .filter((row) => dimension === undefined || dimensionValue === undefined || row.dimensions[dimension] === dimensionValue)
    .reduce((sum, row) => sum + (row.metrics.sessions ?? 0), 0);
}

function toRate(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

function buildBreakdown(pathRows: Ga4Row[], sessionRows: Ga4Row[], dimension: string): ConversionRateBreakdownRow[] {
  return sessionRows
    .map((row) => {
      const segment = row.dimensions[dimension] ?? "";
      const sessions = row.metrics.sessions ?? 0;
      const conversionPageViews = sumConversionViews(pathRows, dimension, segment);
      return { segment, sessions, conversionPageViews, conversionRate: toRate(conversionPageViews, sessions) };
    })
    .sort((a, b) => b.sessions - a.sessions);
}

/**
 * The one real GA4 fetch shared by the summary and (in trends.ts) the
 * date-bucketed charts: a single pagePath×channel pageview query plus a
 * channel-level session count, from which every path-filtered number
 * (appointment views, contact views, organic conversion, per-channel
 * conversion) is derived without a second round trip per segment.
 */
export async function fetchConversionRaw(range: IsoDateRange) {
  const [pathByChannel, sessionsByChannel] = await Promise.all([
    queryPathByDimension(range, "sessionDefaultChannelGroup"),
    querySessionsByDimension(range, "sessionDefaultChannelGroup"),
  ]);
  return { pathByChannel, sessionsByChannel };
}

async function buildConversionSummaryFor(range: IsoDateRange): Promise<ConversionSummary> {
  const previousRange = getPreviousPeriod(range);

  const [
    { pathByChannel, sessionsByChannel },
    { pathByChannel: pathByChannelPrev, sessionsByChannel: sessionsByChannelPrev },
    pathByDevice,
    sessionsByDevice,
    pathByCountry,
    sessionsByCountry,
    pathByNewVsReturning,
    sessionsByNewVsReturning,
    pathByNewVsReturningPrev,
    sessionsByNewVsReturningPrev,
  ] = await Promise.all([
    fetchConversionRaw(range),
    fetchConversionRaw(previousRange),
    queryPathByDimension(range, "deviceCategory"),
    querySessionsByDimension(range, "deviceCategory"),
    queryPathByDimension(range, "country"),
    querySessionsByDimension(range, "country"),
    queryPathByDimension(range, "newVsReturning"),
    querySessionsByDimension(range, "newVsReturning"),
    queryPathByDimension(previousRange, "newVsReturning"),
    querySessionsByDimension(previousRange, "newVsReturning"),
  ]);

  const appointmentCurrent = sumConversionViewsForPath(pathByChannel, "/appointment");
  const appointmentPrevious = sumConversionViewsForPath(pathByChannelPrev, "/appointment");
  const contactCurrent = sumConversionViewsForPath(pathByChannel, "/contact");
  const contactPrevious = sumConversionViewsForPath(pathByChannelPrev, "/contact");
  const combinedCurrent = appointmentCurrent + contactCurrent;
  const combinedPrevious = appointmentPrevious + contactPrevious;

  const totalSessionsCurrent = sumSessions(sessionsByChannel);
  const totalSessionsPrevious = sumSessions(sessionsByChannelPrev);

  const organicViewsCurrent = sumConversionViews(pathByChannel, "sessionDefaultChannelGroup", ORGANIC_CHANNEL);
  const organicViewsPrevious = sumConversionViews(pathByChannelPrev, "sessionDefaultChannelGroup", ORGANIC_CHANNEL);
  const organicSessionsCurrent = sumSessions(sessionsByChannel, "sessionDefaultChannelGroup", ORGANIC_CHANNEL);
  const organicSessionsPrevious = sumSessions(sessionsByChannelPrev, "sessionDefaultChannelGroup", ORGANIC_CHANNEL);

  const returningViewsCurrent = sumConversionViews(pathByNewVsReturning, "newVsReturning", RETURNING_SEGMENT);
  const returningViewsPrevious = sumConversionViews(pathByNewVsReturningPrev, "newVsReturning", RETURNING_SEGMENT);
  const returningSessionsCurrent = sumSessions(sessionsByNewVsReturning, "newVsReturning", RETURNING_SEGMENT);
  const returningSessionsPrevious = sumSessions(sessionsByNewVsReturningPrev, "newVsReturning", RETURNING_SEGMENT);

  const newViewsCurrent = sumConversionViews(pathByNewVsReturning, "newVsReturning", NEW_SEGMENT);
  const newViewsPrevious = sumConversionViews(pathByNewVsReturningPrev, "newVsReturning", NEW_SEGMENT);
  const newSessionsCurrent = sumSessions(sessionsByNewVsReturning, "newVsReturning", NEW_SEGMENT);
  const newSessionsPrevious = sumSessions(sessionsByNewVsReturningPrev, "newVsReturning", NEW_SEGMENT);

  return {
    pageViews: {
      appointment: buildMetricValue(appointmentCurrent, appointmentPrevious),
      contact: buildMetricValue(contactCurrent, contactPrevious),
      combined: buildMetricValue(combinedCurrent, combinedPrevious),
    },
    overallConversionRate: buildMetricValue(toRate(combinedCurrent, totalSessionsCurrent), toRate(combinedPrevious, totalSessionsPrevious)),
    organicConversionRate: buildMetricValue(toRate(organicViewsCurrent, organicSessionsCurrent), toRate(organicViewsPrevious, organicSessionsPrevious)),
    returningConversionRate: buildMetricValue(
      toRate(returningViewsCurrent, returningSessionsCurrent),
      toRate(returningViewsPrevious, returningSessionsPrevious)
    ),
    newVisitorConversionRate: buildMetricValue(toRate(newViewsCurrent, newSessionsCurrent), toRate(newViewsPrevious, newSessionsPrevious)),
    channelBreakdown: buildBreakdown(pathByChannel, sessionsByChannel, "sessionDefaultChannelGroup"),
    deviceBreakdown: buildBreakdown(pathByDevice, sessionsByDevice, "deviceCategory"),
    countryBreakdown: buildBreakdown(pathByCountry, sessionsByCountry, "country").slice(0, 20),
    newVsReturningBreakdown: buildBreakdown(pathByNewVsReturning, sessionsByNewVsReturning, "newVsReturning"),
  };
}

const CACHE_TTL_MS = 15 * 60 * 1000; // same TTL as the traffic/search GA4 adapters this reuses runReport alongside
const cache = createMemoryCache<ConversionSummary>(CACHE_TTL_MS);

/** Cached (15 min, matches every other GA4-backed adapter) real+proxy conversion summary for a resolved date range. */
export async function getConversionSummary(range: IsoDateRange): Promise<ConversionSummary> {
  const cacheKey = `${range.start}_${range.end}`;
  return withCache(cache, cacheKey, () => buildConversionSummaryFor(range));
}
