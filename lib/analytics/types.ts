export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "last90Days"
  | "thisYear"
  | "custom";

export type DateRange = {
  preset: DateRangePreset;
  start: string | null;
  end: string | null;
};

export type MetricValue = {
  current: number;
  previousPeriod: number | null;
  previousYear: number | null;
};

export type AnalyticsProviderId =
  | "google-search-console"
  | "google-analytics-4"
  | "microsoft-clarity"
  | "bing-webmaster-tools"
  | "cloudflare-analytics"
  | "vercel-analytics"
  | "plausible"
  | "posthog"
  | "matomo";

export type AnalyticsProviderStatus = "not_connected" | "connected" | "error";

export type AnalyticsProvider = {
  id: AnalyticsProviderId;
  label: string;
  status: AnalyticsProviderStatus;
};

/**
 * Every metrics category (traffic, search, content, ...) implements this
 * same adapter shape, so the dashboard/widget layer never needs to know
 * which real provider (GA4, GSC, Plausible, ...) is behind it. Phase 4
 * ships only local (empty-data) adapters — see localAdapter.ts. Wiring a
 * real provider later means writing a new adapter with this same shape,
 * not changing any widget or page.
 */
export type AnalyticsAdapter<TMetrics> = {
  providerId: AnalyticsProviderId | "local";
  getMetrics: (range: DateRange) => Promise<TMetrics>;
};

export type Insight = {
  id: string;
  message: string;
  severity: "info" | "positive" | "warning";
};

export type Notification = {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
};

export type ReportFormat = "pdf" | "excel" | "csv" | "json";
