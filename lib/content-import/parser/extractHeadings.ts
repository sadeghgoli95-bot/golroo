import type { ArticleHeading } from "../types";

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;

function slugifyHeading(text: string, usedSlugs: Set<string>): string {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-") || "heading";

  let slug = base;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  usedSlugs.add(slug);
  return slug;
}

/** Table of contents data IS this heading list — no separate TOC generator needed. */
export function extractHeadings(markdown: string): ArticleHeading[] {
  const usedSlugs = new Set<string>();
  const headings: ArticleHeading[] = [];

  for (const line of markdown.split("\n")) {
    const match = line.match(HEADING_PATTERN);
    if (!match) continue;

    const text = match[2].trim();
    if (!text) continue;

    headings.push({
      level: match[1].length as ArticleHeading["level"],
      text,
      slug: slugifyHeading(text, usedSlugs),
    });
  }

  return headings;
}
