import type { RepositoryCache } from "./types";

type CacheEntry<T> = { value: T; expiresAt: number };

/** Stale entries are dropped lazily on read, not swept proactively — sufficient at this data volume. */
export function createMemoryCache<T>(ttlMs: number): RepositoryCache<T> {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;

      if (Date.now() >= entry.expiresAt) {
        store.delete(key);
        return undefined;
      }

      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    invalidate(key) {
      store.delete(key);
    },
    invalidateAll() {
      store.clear();
    },
  };
}
