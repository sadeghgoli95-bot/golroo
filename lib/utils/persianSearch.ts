// Thin wrapper over lib/utils/textNormalize.ts (the single shared
// normalization library) for search-fold call sites. Kept as its own
// module so existing imports don't need to change, but it owns no
// normalization logic of its own anymore.

import { foldPersianText } from "./textNormalize";

/**
 * Normalize Persian/Arabic text for search comparison: folds Arabic
 * character variants to their Persian equivalents, strips Arabic
 * diacritics and zero-width joiners, collapses whitespace, and
 * lowercases (for any Latin content mixed in).
 */
export function normalizePersian(input: string): string {
  return foldPersianText(input);
}

export function includesNormalized(
  haystack: string | undefined | null,
  normalizedNeedle: string
): boolean {
  if (!haystack || !normalizedNeedle) return false;
  return foldPersianText(haystack).includes(normalizedNeedle);
}
