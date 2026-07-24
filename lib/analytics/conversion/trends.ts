import type { Ga4Row } from "@/lib/google/ga4Client";
import type { IsoDateRange } from "../dateRange";
import type { ConversionTrends } from "./types";
import { fetchConversionRaw } from "./conversionSummary";

const MAX_BUCKETS = 6;
const JOURNAL_PREFIX = "/journal/";
const ORGANIC_CHANNEL = "Organic Search";
const TOP_CHANNEL_COUNT = 2;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Splits a resolved date range into up to MAX_BUCKETS contiguous, roughly-equal-length sub-ranges — the x-axis for every trend chart in this module. */
function buildBuckets(range: IsoDateRange): IsoDateRange[] {
  const start = new Date(`${range.start}T00:00:00Z`);
  const end = new Date(`${range.end}T00:00:00Z`);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);
  const bucketCount = Math.min(MAX_BUCKETS, totalDays);
  const baseSize = Math.floor(totalDays / bucketCount);
  const remainder = totalDays % bucketCount;

  const buckets: IsoDateRange[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < bucketCount; i += 1) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor);
    bucketEnd.setUTCDate(bucketEnd.getUTCDate() + size - 1);
    buckets.push({ start: toIsoDate(bucketStart), end: toIsoDate(bucketEnd) });
    cursor.setUTCDate(cursor.getUTCDate() + size);
  }
  return buckets;
}

function normalizePath(path: string): string {
  const withoutQuery = path.split("?")[0] ?? "";
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) return withoutQuery.slice(0, -1);
  return withoutQuery || "/";
}

const CONVERSION_PATHS = ["/appointment", "/contact"];

function sumViews(rows: Ga4Row[], filter: (row: Ga4Row) => boolean): number {
  return rows.filter(filter).reduce((sum, row) => sum + (row.metrics.screenPageViews ?? 0), 0);
}

function sumSessions(rows: Ga4Row[], filter: (row: Ga4Row) => boolean): number {
  return rows.filter(filter).reduce((sum, row) => sum + (row.metrics.sessions ?? 0), 0);
}

function toRate(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function bucketLabel(bucket: IsoDateRange): string {
  return bucket.start === bucket.end ? bucket.start : `${bucket.start} تا ${bucket.end}`;
}

/**
 * Item 14 — executive trend charts, built from real, date-bucketed GA4
 * `runReport` calls (two calls per bucket, reusing the exact same
 * pagePath×channel / channel-sessions query shape conversionSummary.ts
 * uses for the current-period numbers — no separate query logic, no
 * snapshot schema change). Every series here is the same page-view-based
 * proxy used everywhere else in Phase 7, just charted over time instead
 * of as a single current-vs-previous number.
 */
export async function getConversionTrends(range: IsoDateRange): Promise<ConversionTrends> {
  const buckets = buildBuckets(range);
  const bucketData = await Promise.all(buckets.map((bucket) => fetchConversionRaw(bucket)));

  const bucketLabels = buckets.map(bucketLabel);

  const conversionRate: { label: string; value: number }[] = [];
  const organicConversionRate: { label: string; value: number }[] = [];
  const funnelViews: { label: string; value: number }[] = [];
  const pageViews: { label: string; value: number }[] = [];
  const contentViews: { label: string; value: number }[] = [];
  const channelTotals = new Map<string, number>();

  bucketData.forEach(({ pathByChannel, sessionsByChannel }, index) => {
    const label = bucketLabels[index];
    const totalSessions = sumSessions(sessionsByChannel, () => true);
    const totalPageViews = sumViews(pathByChannel, () => true);
    const conversionViews = sumViews(pathByChannel, (row) => CONVERSION_PATHS.includes(normalizePath(row.dimensions.pagePath ?? "")));
    const organicSessions = sumSessions(sessionsByChannel, (row) => row.dimensions.sessionDefaultChannelGroup === ORGANIC_CHANNEL);
    const organicViews = sumViews(
      pathByChannel,
      (row) => CONVERSION_PATHS.includes(normalizePath(row.dimensions.pagePath ?? "")) && row.dimensions.sessionDefaultChannelGroup === ORGANIC_CHANNEL
    );
    const journalViews = sumViews(pathByChannel, (row) => normalizePath(row.dimensions.pagePath ?? "").startsWith(JOURNAL_PREFIX));

    conversionRate.push({ label, value: toRate(conversionViews, totalSessions) });
    organicConversionRate.push({ label, value: toRate(organicViews, organicSessions) });
    funnelViews.push({ label, value: conversionViews });
    pageViews.push({ label, value: totalPageViews });
    contentViews.push({ label, value: journalViews });

    for (const row of sessionsByChannel) {
      const channel = row.dimensions.sessionDefaultChannelGroup ?? "";
      channelTotals.set(channel, (channelTotals.get(channel) ?? 0) + (row.metrics.sessions ?? 0));
    }
  });

  const topChannelNames = [...channelTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_CHANNEL_COUNT)
    .map(([channel]) => channel)
    .filter((channel) => channel !== "");

  const topChannels = topChannelNames.map((channel) => ({
    channel,
    points: bucketData.map(({ pathByChannel, sessionsByChannel }, index) => {
      const sessions = sumSessions(sessionsByChannel, (row) => row.dimensions.sessionDefaultChannelGroup === channel);
      const views = sumViews(
        pathByChannel,
        (row) => CONVERSION_PATHS.includes(normalizePath(row.dimensions.pagePath ?? "")) && row.dimensions.sessionDefaultChannelGroup === channel
      );
      return { label: bucketLabels[index], value: toRate(views, sessions) };
    }),
  }));

  return { bucketLabels, conversionRate, organicConversionRate, funnelViews, pageViews, contentViews, topChannels };
}
