/**
 * GOOGLE_SERVICE_ACCOUNT_KEY has two valid shapes depending on environment:
 * a local file path (e.g. ./credentials/google-service-account.json, used
 * in development where the key file exists on disk) or the raw service
 * account JSON itself (used on Vercel, where the gitignored key file
 * never reaches the deployed filesystem — see lib/google/auth.ts). This
 * module is the one place that tells the two apart, so auth.ts stays a
 * thin GoogleAuth wrapper. Never writes a temp file — JSON input is
 * parsed in memory and handed to GoogleAuth's `credentials` option
 * directly.
 */
export type GoogleCredentialSource =
  | { type: "file"; path: string }
  | { type: "json"; credentials: { client_email: string; private_key: string } };

/**
 * A file path never starts with "{" (after trimming incidental
 * whitespace/newlines some env var UIs add), so that one character is
 * enough to distinguish the two shapes without guessing at path syntax.
 */
export function resolveGoogleCredentialSource(rawValue: string): GoogleCredentialSource {
  const trimmed = rawValue.trim();

  if (!trimmed.startsWith("{")) {
    return { type: "file", path: trimmed };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    throw new Error(
      `GOOGLE_SERVICE_ACCOUNT_KEY looks like JSON (starts with "{") but is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Record<string, unknown>).client_email !== "string" ||
    typeof (parsed as Record<string, unknown>).private_key !== "string"
  ) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY JSON is missing required fields (client_email, private_key) — check the downloaded service account key was pasted in full"
    );
  }

  return {
    type: "json",
    credentials: {
      client_email: (parsed as Record<string, string>).client_email,
      private_key: (parsed as Record<string, string>).private_key,
    },
  };
}
