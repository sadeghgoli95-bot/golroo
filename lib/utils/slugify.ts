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

/**
 * Appends -2, -3, ... to `slug` if it was already seen in `seen`, so two
 * headings with identical text (e.g. two "جمع‌بندی" sections) don't render
 * the same DOM id and silently break TOC anchor targeting for the second
 * one. Mutates `seen` as a side effect — pass a fresh Map per document.
 */
export function dedupeSlug(seen: Map<string, number>, slug: string): string {
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count + 1}`;
}
