/**
 * One row of history — every field is `number | null`, never a
 * fabricated 0, because a snapshot taken before a given integration was
 * connected (or on a day a call failed) has genuinely no value for that
 * field. See sanity/schemaTypes/analyticsSnapshot.ts for the persisted
 * shape this mirrors exactly.
 */
export type AnalyticsSnapshot = {
  timestamp: string;
  seoScore: number | null;
  healthScore: number | null;
  aeoScore: number | null;
  geoScore: number | null;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  users: number | null;
  sessions: number | null;
  engagementRate: number | null;
  publishedArticles: number | null;
  draftArticles: number | null;
  criticalIssues: number | null;
  warnings: number | null;
};
