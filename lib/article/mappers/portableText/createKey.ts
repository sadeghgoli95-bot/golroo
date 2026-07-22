import { randomUUID } from "node:crypto";

/**
 * Single source of truth for every `_key` written into a Portable Text
 * tree (blocks, spans, list items, or any future array-of-objects field).
 * Sanity Studio requires a unique `_key` on every item of every array —
 * omitting one anywhere is what produces the "Missing keys" warning, so
 * every block/span constructor in this package must call this instead of
 * hand-rolling an id.
 */
export function createKey(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}
