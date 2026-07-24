import type { MetricValue } from "../types";

/**
 * Every Phase 7 metric is either real GA4 data (optionally a disclosed
 * proxy for a signal GA4 doesn't actually track — e.g. "appointment page
 * views" standing in for "appointment bookings"), or genuinely
 * unavailable because the underlying signal doesn't exist on the live
 * site (no custom conversion events, no session-path/user-linked data).
 * This union is how every conversion module reports which one it is —
 * no dashboard section is allowed to render a number without one of
 * these two states backing it.
 */
export type NotAvailable = { available: false; reason: string };
export type Available<T> = { available: true; data: T };
export type Maybe<T> = Available<T> | NotAvailable;

export function notAvailable(reason: string): NotAvailable {
  return { available: false, reason };
}

export function available<T>(data: T): Available<T> {
  return { available: true, data };
}

/** Real GA4 pageviews of /appointment and /contact — a disclosed proxy for "someone tried to book/reach out," never presented as a booking count. */
export type ConversionPageViews = {
  appointment: MetricValue;
  contact: MetricValue;
  combined: MetricValue;
};

export type ConversionRateBreakdownRow = {
  segment: string;
  sessions: number;
  conversionPageViews: number;
  /** Percent: conversionPageViews / sessions * 100. */
  conversionRate: number;
};

export type ConversionSummary = {
  pageViews: ConversionPageViews;
  /** Percent MetricValue: (appointment+contact pageviews) / total sessions. The page-view-based proxy for a conversion rate — see item 3 of the Phase 7 brief. */
  overallConversionRate: MetricValue;
  organicConversionRate: MetricValue;
  returningConversionRate: MetricValue;
  newVisitorConversionRate: MetricValue;
  channelBreakdown: ConversionRateBreakdownRow[];
  deviceBreakdown: ConversionRateBreakdownRow[];
  countryBreakdown: ConversionRateBreakdownRow[];
  newVsReturningBreakdown: ConversionRateBreakdownRow[];
};

export type FunnelStage = {
  label: string;
  value: number;
  /** Percent drop vs the immediately preceding stage; null for the first stage. */
  dropOffPercent: number | null;
};

export type ContentAttributionRow = {
  slug: string;
  title: string;
  /** Real GA4 sessions where this article's /journal/<slug> page was the landing page. */
  landingSessions: number;
  /** Real GA4 engagementRate for this article as a landing page. */
  engagementRate: number;
  /** Count of real Markdown links in the article body pointing at /appointment or /contact. */
  bookingLinkCount: number;
  /** landingSessions + bookingLinkCount * 10 — see formula note where this is computed. */
  estimatedScore: number;
};

export type ExitRateRow = {
  page: string;
  pageViews: number;
  exits: number;
  /** Percent: exits / pageViews * 100. */
  exitRate: number;
};

export type CtaSuggestion = {
  slug: string;
  title: string;
  landingSessions: number;
  reason: string;
};

export type ChannelTrendSeries = {
  channel: string;
  points: { label: string; value: number }[];
};

export type ConversionTrends = {
  bucketLabels: string[];
  conversionRate: { label: string; value: number }[];
  organicConversionRate: { label: string; value: number }[];
  funnelViews: { label: string; value: number }[];
  pageViews: { label: string; value: number }[];
  contentViews: { label: string; value: number }[];
  topChannels: ChannelTrendSeries[];
};
