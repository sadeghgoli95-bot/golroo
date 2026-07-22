/**
 * Single source of truth for turning free text into a URL/GROQ-safe slug
 * fragment. Used both for in-document anchors (heading TOC slugs) and for
 * Sanity `slug` fields on find-or-create reference documents (author,
 * category, tag, faq) — the exact same transformation applies to both.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}
