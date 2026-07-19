/**
 * The shape any cache backend must satisfy — in-memory today, Redis or
 * anything else later, without CachedArticleRepository changing at all.
 */
export type RepositoryCache<T> = {
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => void;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
};
