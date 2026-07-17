// Centralized Persian text rendering normalization.
//
// This is distinct from lib/utils/persianSearch.ts, which lossily folds
// text for search matching (strips diacritics, lowercases, etc). This
// module preserves meaning, punctuation and RTL behavior — it only fixes
// invisible-character and Unicode-form inconsistencies (stray zero-width
// characters, duplicated ZWNJ, Arabic vs Persian glyph variants) that
// cause inconsistent یا broken نیم‌فاصله rendering across browsers and
// Android keyboards/CMS paste sources.

const ARABIC_YEH = "ي"; // ي
const PERSIAN_YEH = "ی"; // ی
const ARABIC_KAF = "ك"; // ك
const PERSIAN_KAF = "ک"; // ک
const ZWNJ = "‌"; // half-space
const ZERO_WIDTH_SPACE = "​";
const BOM = "﻿";
const SOFT_HYPHEN = "­";

const YEH_RE = new RegExp(ARABIC_YEH, "g");
const KAF_RE = new RegExp(ARABIC_KAF, "g");
const INVISIBLE_RE = new RegExp(`[${ZERO_WIDTH_SPACE}${BOM}${SOFT_HYPHEN}]`, "g");
const MULTI_ZWNJ_RE = new RegExp(`${ZWNJ}{2,}`, "g");
const ZWNJ_ADJACENT_SPACE_RE = new RegExp(`[ \\t]*${ZWNJ}[ \\t]*`, "g");

/**
 * Fixes invisible-character and glyph-variant problems in place, without
 * touching leading/trailing whitespace or collapsing regular spaces.
 * Safe to run on text fragments (e.g. individual DOM text nodes) since it
 * never assumes it holds a whole, self-contained string.
 */
export function stripInvisibleArtifacts(input: string): string {
  return input
    .normalize("NFC")
    .replace(YEH_RE, PERSIAN_YEH)
    .replace(KAF_RE, PERSIAN_KAF)
    .replace(INVISIBLE_RE, "")
    .replace(MULTI_ZWNJ_RE, ZWNJ)
    .replace(ZWNJ_ADJACENT_SPACE_RE, ZWNJ);
}

const cache = new Map<string, string>();
const CACHE_LIMIT = 5000;

/**
 * Full normalization for a complete, known-safe string (CMS field, static
 * copy passed as a single prop, etc): fixes invisible artifacts and also
 * collapses accidental double spaces / trims the ends. Memoized since the
 * same field values are re-rendered often (rotation, listings, pagination).
 */
export function normalizePersianText(input?: string | null): string {
  if (!input) return "";

  const cached = cache.get(input);
  if (cached !== undefined) return cached;

  const normalized = stripInvisibleArtifacts(input)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(input, normalized);
  return normalized;
}

type PortableTextSpan = { _type?: string; text?: string; [key: string]: unknown };
type PortableTextBlock = { _type?: string; children?: PortableTextSpan[]; [key: string]: unknown };

/**
 * Normalizes every text span inside a Portable Text block array before it
 * reaches <PortableText>, so Sanity rich-text content (current and future
 * articles) benefits automatically without editors needing to fix spacing.
 */
export function normalizePortableTextBlocks<T>(blocks: T[] | undefined | null): T[] {
  if (!blocks) return [];
  return blocks.map((block) => {
    const b = block as unknown as PortableTextBlock;
    if (b._type === "block" && Array.isArray(b.children)) {
      return {
        ...b,
        children: b.children.map((child) =>
          child._type === "span" && typeof child.text === "string"
            ? { ...child, text: normalizePersianText(child.text) }
            : child
        ),
      } as unknown as T;
    }
    return block;
  });
}
