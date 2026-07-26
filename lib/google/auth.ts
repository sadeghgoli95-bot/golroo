import { google } from "googleapis";
import { getGoogleServiceAccountKeyRaw } from "./config";
import { resolveGoogleCredentialSource } from "./credentials";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

let cachedAuth: InstanceType<typeof google.auth.GoogleAuth> | null = null;

/**
 * One GoogleAuth instance per server process — google-auth-library
 * already handles token caching/refresh internally, so this only avoids
 * re-resolving the credential source on every call. Throws a clear error
 * (never returns a fake/empty client) when the key isn't configured or
 * malformed — callers decide how to surface that.
 *
 * GOOGLE_SERVICE_ACCOUNT_KEY is either a local file path (development,
 * where the gitignored key file exists on disk) or the raw service
 * account JSON itself (Vercel, where that file never reaches the
 * deployed filesystem) — resolveGoogleCredentialSource tells them apart.
 * No temp file is ever written for the JSON case; it's handed to
 * GoogleAuth's `credentials` option directly, in memory.
 */
export function getGoogleAuth(): InstanceType<typeof google.auth.GoogleAuth> {
  if (cachedAuth) return cachedAuth;

  const rawValue = getGoogleServiceAccountKeyRaw();
  if (!rawValue) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not configured — Google integrations are unavailable");
  }

  const source = resolveGoogleCredentialSource(rawValue);
  cachedAuth =
    source.type === "json"
      ? new google.auth.GoogleAuth({ credentials: source.credentials, scopes: SCOPES })
      : new google.auth.GoogleAuth({ keyFile: source.path, scopes: SCOPES });

  return cachedAuth;
}
