import { slugify, dedupeSlug } from "./slugify";
import type { ArticleHeading } from "@/lib/article/types";

type PortableTextSpan = { text?: string };
type PortableTextBlock = { _type: string; style?: string; children?: PortableTextSpan[] };

/**
 * Sanity's portable text body has no headings field of its own (unlike the
 * canonical Article type used by content-pipeline) — this reads h2/h3
 * blocks directly out of it so the reading-experience TOC and the
 * heading `id`s rendered by articlePortableTextComponents stay in sync
 * (same slugify, same source blocks).
 */
export function extractPortableTextHeadings(blocks: unknown[] | undefined | null): ArticleHeading[] {
  if (!blocks) return [];

  const seen = new Map<string, number>();

  return (blocks as PortableTextBlock[])
    .filter((block) => block._type === "block" && (block.style === "h2" || block.style === "h3"))
    .map((block) => {
      const text = (block.children ?? []).map((span) => span.text ?? "").join("");
      return { level: block.style === "h2" ? (2 as const) : (3 as const), text, slug: dedupeSlug(seen, slugify(text)) };
    })
    .filter((heading) => heading.text.length > 0);
}
