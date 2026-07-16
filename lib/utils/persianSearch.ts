// Unicode code points (explicit escapes to avoid any bidi/rendering
// ambiguity with RTL glyphs in source):
//   ي = Arabic Yeh   ی = Persian Yeh
//   ك = Arabic Kaf   ک = Persian Kaf
//   ‌ = Zero-width non-joiner (half-space)
//   ً-ْ, ٰ = Arabic diacritics (tashkeel)

const ARABIC_YEH = "ي";
const PERSIAN_YEH = "ی";
const ARABIC_KAF = "ك";
const PERSIAN_KAF = "ک";
const ZWNJ = "‌";
const ARABIC_DIACRITICS = /[ً-ْٰ]/g;

/**
 * Normalize Persian/Arabic text for search comparison: folds Arabic
 * character variants to their Persian equivalents, strips Arabic
 * diacritics and zero-width joiners, collapses whitespace, and
 * lowercases (for any Latin content mixed in).
 */
export function normalizePersian(input: string): string {
  return input
    .replace(new RegExp(ARABIC_YEH, "g"), PERSIAN_YEH)
    .replace(new RegExp(ARABIC_KAF, "g"), PERSIAN_KAF)
    .replace(ARABIC_DIACRITICS, "")
    .replace(new RegExp(ZWNJ, "g"), " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function includesNormalized(
  haystack: string | undefined | null,
  normalizedNeedle: string
): boolean {
  if (!haystack || !normalizedNeedle) return false;
  return normalizePersian(haystack).includes(normalizedNeedle);
}
