/**
 * Session token is an HMAC-SHA256 signature over a fixed payload, keyed by
 * DASHBOARD_PASSWORD — never the password itself in the cookie, and
 * rotating the password invalidates every existing session automatically
 * since verification recomputes the signature from the current env var.
 * Uses Web Crypto (crypto.subtle) so this works unmodified in proxy.ts's
 * Edge runtime as well as Node route handlers.
 */
const SESSION_PAYLOAD = "golroo-dashboard-authenticated";

export const DASHBOARD_SESSION_COOKIE = "golroo_dashboard_session";

export function getDashboardPassword(): string | null {
  return process.env.DASHBOARD_PASSWORD || null;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signSessionToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(SESSION_PAYLOAD));
  return bufferToHex(signature);
}

export async function createSessionToken(): Promise<string | null> {
  const password = getDashboardPassword();
  if (!password) return null;
  return signSessionToken(password);
}

export async function isValidSessionToken(token: string | null | undefined): Promise<boolean> {
  const password = getDashboardPassword();
  if (!password || !token) return false;
  const expected = await signSessionToken(password);
  return token === expected;
}
