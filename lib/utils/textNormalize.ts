// Centralized Persian text normalization — the ONLY module in this
// project that defines Arabic/Persian glyph, diacritic, invisible-
// character and whitespace normalization rules. Every other module
// (search fold, import parsing, duplicate detection, keyword matching,
// Sanity writes, API responses, rendering) is expected to normalize
// through the functions exported here rather than re-implementing any
// of this logic.
//
// Two distinct normalization strengths are exported, because they solve
// different problems:
//
// - `normalizePersianText` / `normalizePortableTextBlocks` — DISPLAY-SAFE.
//   Fixes invisible-character and Unicode-form inconsistencies (stray
//   zero-width characters, Arabic vs Persian glyph variants, stray
//   diacritics) without changing meaning or spacing that carries
//   meaning. It deliberately PRESERVES a single ZWNJ (نیم‌فاصله) between
//   compound-word segments (می‌شود، های‌ی) — ZWNJ is correct Persian
//   typography, not noise, and collapsing it to a space would visibly
//   corrupt already-published content. Only *duplicate* ZWNJs collapse.
//
// - `foldPersianText` — LOSSY FOLD, for comparison only (search, keyword
//   matching, duplicate detection). Also converts ZWNJ to a plain space
//   and lowercases, so two strings that only differ by invisible
//   formatting compare equal. Never used to produce anything that gets
//   stored or rendered.

const ARABIC_YEH = "ي"; // ي
const PERSIAN_YEH = "ی"; // ی
const ARABIC_KAF = "ك"; // ك
const PERSIAN_KAF = "ک"; // ک
const ZWNJ = "‌"; // U+200C half-space
const ZERO_WIDTH_SPACE = "​"; // U+200B
const BOM = "﻿"; // U+FEFF
const SOFT_HYPHEN = "­"; // U+00AD
// Arabic combining diacritics (tashkeel): fatha, damma, kasra, tanwin
// variants, shadda, sukun, and the standalone superscript alef (U+0670).
const ARABIC_DIACRITICS_RANGE = "ً-ْٰ";

const YEH_RE = new RegExp(ARABIC_YEH, "g");
const KAF_RE = new RegExp(ARABIC_KAF, "g");
const INVISIBLE_RE = new RegExp(`[${ZERO_WIDTH_SPACE}${BOM}${SOFT_HYPHEN}]`, "g");
const DIACRITICS_RE = new RegExp(`[${ARABIC_DIACRITICS_RANGE}]`, "g");
const MULTI_ZWNJ_RE = new RegExp(`${ZWNJ}{2,}`, "g");
const ZWNJ_ADJACENT_SPACE_RE = new RegExp(`[ \\t]*${ZWNJ}[ \\t]*`, "g");
const CODE_FENCE_RE = /^```/;
// Persian (U+06F0-06F9) and Arabic-Indic (U+0660-0669) digits, in order 0-9.
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const NON_ASCII_DIGITS_RE = new RegExp(`[${PERSIAN_DIGITS}${ARABIC_INDIC_DIGITS}]`, "g");

/**
 * Folds Persian/Arabic-Indic digits to ASCII 0-9. Comparison-only, like
 * the rest of foldPersianText — display text keeps whichever digit
 * script the writer used.
 */
function foldDigitsToAscii(input: string): string {
  return input.replace(NON_ASCII_DIGITS_RE, (digit) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(digit);
    if (persianIndex !== -1) return String(persianIndex);
    return String(ARABIC_INDIC_DIGITS.indexOf(digit));
  });
}

function foldGlyphsAndInvisibles(input: string): string {
  return input
    .normalize("NFC")
    .replace(YEH_RE, PERSIAN_YEH)
    .replace(KAF_RE, PERSIAN_KAF)
    .replace(INVISIBLE_RE, "")
    .replace(DIACRITICS_RE, "");
}

/**
 * Removes Arabic combining diacritics (tashkeel) only — used where callers
 * need this specific transform in isolation (kept for callers migrating
 * from the old lib/utils/persianSearch.ts diacritics-only helper).
 */
export function stripDiacritics(input: string): string {
  return input.replace(DIACRITICS_RE, "");
}

/**
 * Fixes invisible-character and glyph-variant problems in place, without
 * touching leading/trailing whitespace or collapsing regular spaces.
 * Safe to run on text fragments (e.g. individual DOM text nodes) since it
 * never assumes it holds a whole, self-contained string. Preserves a
 * single ZWNJ; only collapses duplicates.
 */
export function stripInvisibleArtifacts(input: string): string {
  return foldGlyphsAndInvisibles(input)
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

/**
 * Lossy fold for comparison-only use (search matching, keyword/duplicate
 * detection). Converts ZWNJ to a plain space and lowercases — never use
 * the result for anything stored or displayed.
 */
export function foldPersianText(input: string): string {
  return foldDigitsToAscii(foldGlyphsAndInvisibles(input))
    .replace(new RegExp(ZWNJ, "g"), " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Normalizes raw multi-line import text BEFORE parsing: per-line glyph/
 * invisible-character/diacritic cleanup, CRLF->LF, trailing-space trim,
 * interior multi-space collapse. Blank lines are preserved (they are
 * structurally meaningful — they separate metadata/body/FAQ/sources).
 * Skips normalizing content inside fenced code blocks (``` ... ```),
 * since exact whitespace matters there and Markdown syntax/URLs are pure
 * ASCII already unaffected by Arabic/Persian glyph or diacritic rules.
 */
export function normalizeImportText(raw: string): string {
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  let inCodeFence = false;

  return lines
    .map((line) => {
      if (CODE_FENCE_RE.test(line.trim())) {
        inCodeFence = !inCodeFence;
        return line;
      }
      if (inCodeFence) return line;

      return stripInvisibleArtifacts(line).replace(/[ \t]{2,}/g, " ").replace(/[ \t]+$/g, "");
    })
    .join("\n");
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
