import type { RepositoryCache } from "./types";

/**
 * The get-or-fetch-and-set shape every cache consumer needs — pulled out
 * so CachedArticleRepository and every later consumer (Search Console,
 * GA4, site analysis caching) share one implementation instead of each
 * repeating the same three lines.
 */
export async function withCache<T>(cache: RepositoryCache<T>, key: string, fetch: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const value = await fetch();
  cache.set(key, value);
  return value;
}
