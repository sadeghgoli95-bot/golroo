import { normalizePersianText, foldPersianText } from "@/lib/utils/textNormalize";

// Not exhaustive — common Persian function words (prepositions,
// conjunctions, articles, copulas) that shouldn't lead/trail a Focus
// Keyword phrase. Only trimmed from the EDGES of a candidate (never the
// middle), so every candidate stays a contiguous, literal substring of
// its source text — this is what makes "must naturally appear in the
// Title" true by construction for title-derived candidates.
const STOP_WORDS = new Set([
  "از",
  "به",
  "در",
  "با",
  "برای",
  "که",
  "این",
  "آن",
  "را",
  "و",
  "یا",
  "اما",
  "تا",
  "بر",
  "چه",
  "هر",
  "همه",
  "یک",
  "چیست",
  "است",
  "بود",
  "اگر",
  "نیز",
  "هم",
  "دیگر",
  "خود",
  "می",
  "شود",
  "شد",
  "کرد",
]);

const MIN_WORDS = 2;
const MAX_WORDS = 5;
const PUNCTUATION_PATTERN = /[؟?!.,،؛:«»"'()]/g;

function tokenize(text: string): string[] {
  return normalizePersianText(text)
    .replace(PUNCTUATION_PATTERN, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function trimStopWordsAtEdges(words: string[]): string[] {
  let start = 0;
  let end = words.length;
  while (start < end && STOP_WORDS.has(words[start])) start += 1;
  while (end > start && STOP_WORDS.has(words[end - 1])) end -= 1;
  return words.slice(start, end);
}

function buildCandidate(text: string): string | null {
  const trimmed = trimStopWordsAtEdges(tokenize(text));
  if (trimmed.length < MIN_WORDS) return null;

  const sliced = trimmed.length > MAX_WORDS ? trimmed.slice(0, MAX_WORDS) : trimmed;
  return sliced.join(" ");
}

function appearsInTitle(candidate: string, titleFold: string): boolean {
  return titleFold.includes(foldPersianText(candidate));
}

/**
 * Generates the Focus Keyword when the writer didn't supply one, per
 * priority: Title -> Keywords -> Topic (an explicit Focus Keyword from
 * the writer always wins and is never re-validated here — see
 * extractHeader.ts). Every candidate is 2-5 words, punctuation-free, and
 * validated to literally appear in the Title (Persian-normalized,
 * diacritics stripped, ZWNJ-insensitive via foldPersianText) before
 * being accepted; if a candidate fails, the next priority is tried.
 * Returns null (never an empty string) when nothing qualifies.
 */
export function generateFocusKeyword(title: string | null, keywords: string[], topic: string | null): string | null {
  if (!title) return null;
  const titleFold = foldPersianText(title);

  // Built directly from the title's own words, so it's guaranteed to
  // appear in the title (modulo the stop words trimmed off the edges).
  const titleCandidate = buildCandidate(title);
  if (titleCandidate) return titleCandidate;

  for (const keyword of keywords) {
    const candidate = buildCandidate(keyword);
    if (candidate && appearsInTitle(candidate, titleFold)) return candidate;
  }

  if (topic) {
    const candidate = buildCandidate(topic);
    if (candidate && appearsInTitle(candidate, titleFold)) return candidate;
  }

  return null;
}
