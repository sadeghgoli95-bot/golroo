import { google } from "googleapis";
import { getGoogleServiceAccountKeyPath } from "./config";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

let cachedAuth: InstanceType<typeof google.auth.GoogleAuth> | null = null;

/**
 * One GoogleAuth instance per server process — google-auth-library
 * already handles token caching/refresh internally, so this only avoids
 * re-reading and re-parsing the service account key file on every call.
 * Throws a clear error (never returns a fake/empty client) when the key
 * path isn't configured — callers decide how to surface that.
 */
export function getGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> {
  if (cachedAuth) return cachedAuth;

  const keyFile = getGoogleServiceAccountKeyPath();
  if (!keyFile) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not configured — Google integrations are unavailable");
  }

  cachedAuth = new google.auth.GoogleAuth({ keyFile, scopes: SCOPES });
  return cachedAuth;
}
