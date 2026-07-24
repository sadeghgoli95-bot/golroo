import { isBrandQuery } from "./brandTerms";

export type SearchIntent = "informational" | "navigational" | "transactional" | "local";

export const SEARCH_INTENT_LABELS: Record<SearchIntent, string> = {
  informational: "اطلاعاتی",
  navigational: "ناوبری (برند)",
  transactional: "معاملاتی",
  local: "محلی",
};

/**
 * Explicit, disclosed RULE-BASED intent classifier — deterministic pattern
 * matching over the real query string, not a fabricated/ML label. Rule
 * order (checked top to bottom, first match wins):
 *
 * 1. navigational — the query contains a brand term (BRAND_TERMS, the
 *    same list Phase 1's adapter uses for brand/non-brand — see
 *    brandTerms.ts). Someone searching the brand name is trying to
 *    navigate to this site specifically, regardless of what else the
 *    query says.
 * 2. transactional — Persian/English terms that signal an intent to
 *    book/pay/act right now: "قیمت", "هزینه", "تعرفه" (price/cost/fee),
 *    "رزرو", "نوبت" (appointment/booking), "مشاوره آنلاین" (book online
 *    consultation), "ثبت‌نام"/"ثبت نام" (register), "خرید" (purchase),
 *    or the English equivalents price/cost/book/buy.
 * 3. local — a named Iranian city/region or an explicit "near me" /
 *    "در شهر" phrase, signalling the user wants a location-bound result.
 * 4. informational — question/how-to/definition patterns: "چیست"
 *    (what is), "چگونه"/"چطور" (how), "چرا" (why), "علائم"/"نشانه"
 *    (symptoms/signs), "تفاوت" (difference), "راهنما" (guide), or the
 *    English what/how/why/guide equivalents.
 * 5. Fallback — "informational". This site's content is a clinical
 *    knowledge base (docs/editorial-bible.md); an unmatched query about
 *    child psychology is overwhelmingly more likely to be someone
 *    researching a topic than trying to transact or navigate, so
 *    "informational" is the honest default rather than an invented
 *    "unknown" bucket.
 */
const TRANSACTIONAL_PATTERNS = [
  /قیمت/,
  /هزینه/,
  /تعرفه/,
  /رزرو/,
  /نوبت/,
  /مشاوره\s*آنلاین/,
  /ثبت\s*نام/,
  /خرید/,
  /\bprice\b/i,
  /\bcost\b/i,
  /\bbook(ing)?\b/i,
  /\bbuy\b/i,
];

const LOCAL_PATTERNS = [
  /تهران/,
  /اصفهان/,
  /مشهد/,
  /شیراز/,
  /کرج/,
  /تبریز/,
  /نزدیک\s*من/,
  /در\s*شهر/,
  /near\s*me/i,
];

const INFORMATIONAL_PATTERNS = [
  /چیست/,
  /چگونه/,
  /چطور/,
  /چرا/,
  /علائم/,
  /نشانه/,
  /تفاوت/,
  /راهنما/,
  /یعنی\s*چه/,
  /\bwhat\s+is\b/i,
  /\bhow\s+to\b/i,
  /\bwhy\b/i,
  /\bguide\b/i,
];

export function classifySearchIntent(query: string): SearchIntent {
  const lower = query.toLowerCase();

  if (isBrandQuery(lower)) return "navigational";
  if (TRANSACTIONAL_PATTERNS.some((pattern) => pattern.test(lower))) return "transactional";
  if (LOCAL_PATTERNS.some((pattern) => pattern.test(lower))) return "local";
  if (INFORMATIONAL_PATTERNS.some((pattern) => pattern.test(lower))) return "informational";
  return "informational";
}
