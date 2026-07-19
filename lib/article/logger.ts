/**
 * The one sanctioned place repository/cache/validation/hydration code is
 * allowed to log through. Nothing in lib/article ever calls console.*
 * directly — it calls a RepositoryLogger, injected via constructor
 * (see repositories/index.ts), so tests can inject a silent one and a
 * future observability backend can replace consoleRepositoryLogger
 * without touching business logic.
 */
export type RepositoryLogger = {
  cacheHit: (key: string) => void;
  cacheMiss: (key: string) => void;
  repositoryError: (message: string, error: unknown) => void;
  validationWarning: (slug: string | null, warnings: string[]) => void;
  hydrationWarning: (slug: string | null, warnings: string[]) => void;
};

export const consoleRepositoryLogger: RepositoryLogger = {
  cacheHit: (key) => console.debug(`[article-repository] cache hit: ${key}`),
  cacheMiss: (key) => console.debug(`[article-repository] cache miss: ${key}`),
  repositoryError: (message, error) => console.error(`[article-repository] ${message}`, error),
  validationWarning: (slug, warnings) =>
    console.warn(`[article-repository] validation warnings for "${slug ?? "unknown"}":`, warnings),
  hydrationWarning: (slug, warnings) =>
    console.warn(`[article-repository] hydration warnings for "${slug ?? "unknown"}":`, warnings),
};

export const noopRepositoryLogger: RepositoryLogger = {
  cacheHit: () => {},
  cacheMiss: () => {},
  repositoryError: () => {},
  validationWarning: () => {},
  hydrationWarning: () => {},
};
