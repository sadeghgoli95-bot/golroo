/**
 * Every error an ArticleRepository implementation throws — no matter what
 * actually failed underneath (a Sanity query, a network timeout, a bad
 * response shape) — must surface as this type. Callers (analyzers,
 * pipeline stages, UI) depend only on RepositoryError, never on knowing
 * that Sanity exists.
 */
export type RepositoryErrorCode =
  | "not_found"
  | "invalid_query"
  | "connection_failed"
  | "unknown";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  readonly cause?: unknown;

  constructor(message: string, code: RepositoryErrorCode = "unknown", cause?: unknown) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
    this.cause = cause;
  }
}

export function toRepositoryError(error: unknown, fallbackMessage: string): RepositoryError {
  if (error instanceof RepositoryError) return error;
  const message = error instanceof Error ? error.message : fallbackMessage;
  return new RepositoryError(message, "connection_failed", error);
}
