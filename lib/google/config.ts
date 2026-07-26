/**
 * Single source of truth for the three env vars every Google integration
 * (Search Console, GA4) needs — same "read once, validate honestly"
 * convention as lib/article/env.ts. Nothing here ever falls back to a
 * guessed/mock value: a missing var means the corresponding feature is
 * unavailable, reported as such (see lib/dashboard/getSystemStatus.ts),
 * never silently defaulted.
 */
/**
 * Raw value only — either a local file path or a raw JSON credentials
 * blob, depending on environment. See lib/google/credentials.ts for the
 * logic that tells the two apart; nothing here parses or validates it.
 */
export function getGoogleServiceAccountKeyRaw(): string | null {
  return process.env.GOOGLE_SERVICE_ACCOUNT_KEY || null;
}

export function getGscSiteUrl(): string | null {
  return process.env.GSC_SITE_URL || null;
}

export function getGa4PropertyId(): string | null {
  return process.env.GA4_PROPERTY_ID || null;
}

export function isGoogleAnalyticsConfigured(): boolean {
  return Boolean(getGoogleServiceAccountKeyRaw() && getGa4PropertyId());
}

export function isSearchConsoleConfigured(): boolean {
  return Boolean(getGoogleServiceAccountKeyRaw() && getGscSiteUrl());
}
