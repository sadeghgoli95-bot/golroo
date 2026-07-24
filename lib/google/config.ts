/**
 * Single source of truth for the three env vars every Google integration
 * (Search Console, GA4) needs — same "read once, validate honestly"
 * convention as lib/article/env.ts. Nothing here ever falls back to a
 * guessed/mock value: a missing var means the corresponding feature is
 * unavailable, reported as such (see lib/dashboard/getSystemStatus.ts),
 * never silently defaulted.
 */
export function getGoogleServiceAccountKeyPath(): string | null {
  return process.env.GOOGLE_SERVICE_ACCOUNT_KEY || null;
}

export function getGscSiteUrl(): string | null {
  return process.env.GSC_SITE_URL || null;
}

export function getGa4PropertyId(): string | null {
  return process.env.GA4_PROPERTY_ID || null;
}

export function isGoogleAnalyticsConfigured(): boolean {
  return Boolean(getGoogleServiceAccountKeyPath() && getGa4PropertyId());
}

export function isSearchConsoleConfigured(): boolean {
  return Boolean(getGoogleServiceAccountKeyPath() && getGscSiteUrl());
}
