import type { ArticleHeading } from "@/lib/article/types";

export type TocNode = {
  level: ArticleHeading["level"];
  text: string;
  slug: string;
  children: TocNode[];
};

/**
 * Nests the flat heading list (article.headings, already the source of
 * truth per lib/content-import/parser/extractHeadings.ts) into a real
 * tree by level, so the dashboard/rendered TOC can show proper
 * indentation/collapse instead of a flat list.
 */
export function buildTableOfContents(headings: ArticleHeading[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const heading of headings) {
    const node: TocNode = { level: heading.level, text: heading.text, slug: heading.slug, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }

  return root;
}
