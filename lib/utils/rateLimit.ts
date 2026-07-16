type Bucket = { count: number; windowStart: number };

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

// In-memory best-effort limiter. On serverless platforms each instance has
// its own memory, so this only protects a single warm instance — it is a
// basic deterrent, not a hard guarantee.
const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}
