import type { RepositoryCache } from "./types";

/**
 * In-flight requests per cache instance, keyed by cache key — scoped per
 * cache (WeakMap on the cache object itself) so two unrelated caches that
 * happen to use the same key string (e.g. two different date-range
 * adapters both keying on "2021-02-01_2021-02-01") never dedupe against
 * each other.
 */
const pendingByCache = new WeakMap<object, Map<string, Promise<unknown>>>();

/**
 * The get-or-fetch-and-set shape every cache consumer needs — pulled out
 * so CachedArticleRepository and every later consumer (Search Console,
 * GA4, site analysis caching) share one implementation instead of each
 * repeating the same three lines. Also the single-flight guard: if a
 * second call arrives for the same cache+key while the first `fetch()` is
 * still in flight (e.g. two concurrent dashboard page loads), it awaits
 * the same in-progress promise instead of firing a second real request —
 * without this, the TTL cache offers zero protection against exactly the
 * concurrent-request burst that trips GA4/Search Console's quota.
 */
export async function withCache<T>(cache: RepositoryCache<T>, key: string, fetch: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  let pending = pendingByCache.get(cache);
  if (!pending) {
    pending = new Map();
    pendingByCache.set(cache, pending);
  }

  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetch()
    .then((value) => {
      cache.set(key, value);
      return value;
    })
    .finally(() => {
      pending!.delete(key);
    });

  pending.set(key, promise);
  return promise;
}
