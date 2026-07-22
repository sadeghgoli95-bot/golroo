import { createKey } from "./createKey";
import { parseInlineSpans, type PortableTextSpan } from "./parseInlineSpans";

type BlockStyle = "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote";

export type PortableTextBlock = {
  _key: string;
  _type: "block";
  style: BlockStyle;
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: [];
  children: PortableTextSpan[];
};

export type PortableTextCodeBlock = {
  _key: string;
  _type: "codeBlock";
  language?: string;
  code: string;
};

export type PortableTextBodyItem = PortableTextBlock | PortableTextCodeBlock;

const FENCE_PATTERN = /^```(\S*)\s*$/;
const HEADING_PATTERN = /^(#{1,4})\s+(.*)$/;
const QUOTE_PATTERN = /^>\s?(.*)$/;
const BULLET_PATTERN = /^[-*]\s+(.*)$/;
const NUMBERED_PATTERN = /^\d+\.\s+(.*)$/;

/**
 * Every block/list-item constructor funnels through here so `_key` and
 * `markDefs` are never forgotten on a new call site — this is the root
 * fix for the Sanity Studio "Missing keys" warning (the previous code
 * built the single body block as a raw object literal with no `_key` at
 * all, and any future block-producing code that repeated that mistake
 * would reproduce the bug).
 */
function buildBlock(text: string, style: BlockStyle, listItem?: "bullet" | "number"): PortableTextBlock | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return {
    _key: createKey(),
    _type: "block",
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs: [],
    children: parseInlineSpans(trimmed),
  };
}

/**
 * Converts the raw Markdown body string produced by the content-import
 * parser (headings/lists/quotes/fenced code still present as literal
 * markdown syntax — see extractBody.ts) into the Portable Text shape the
 * Sanity `article.body` field expects (`sanity/schemaTypes/article.ts`:
 * `of: [block, image, codeBlock, break]`). Only `block` and `codeBlock`
 * are produced — image/break have no corresponding data in the canonical
 * Article model, so fabricating them here would violate the no-fabrication
 * rule the rest of the mapper layer follows.
 */
export function markdownToPortableText(markdown: string | null): PortableTextBodyItem[] {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const items: PortableTextBodyItem[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const block = buildBlock(paragraphBuffer.join(" "), "normal");
    paragraphBuffer = [];
    if (block) items.push(block);
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const fenceMatch = line.match(FENCE_PATTERN);
    if (fenceMatch) {
      flushParagraph();
      const language = fenceMatch[1] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence (or end of input if unterminated)
      items.push({
        _key: createKey(),
        _type: "codeBlock",
        ...(language ? { language } : {}),
        code: codeLines.join("\n"),
      });
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const block = buildBlock(headingMatch[2], `h${level}` as BlockStyle);
      if (block) items.push(block);
      i++;
      continue;
    }

    const quoteMatch = line.match(QUOTE_PATTERN);
    if (quoteMatch) {
      flushParagraph();
      const quoteLines: string[] = [quoteMatch[1]];
      i++;
      while (i < lines.length) {
        const nextMatch = lines[i].match(QUOTE_PATTERN);
        if (!nextMatch) break;
        quoteLines.push(nextMatch[1]);
        i++;
      }
      const block = buildBlock(quoteLines.join(" "), "blockquote");
      if (block) items.push(block);
      continue;
    }

    const bulletMatch = line.match(BULLET_PATTERN);
    if (bulletMatch) {
      flushParagraph();
      const block = buildBlock(bulletMatch[1], "normal", "bullet");
      if (block) items.push(block);
      i++;
      continue;
    }

    const numberedMatch = line.match(NUMBERED_PATTERN);
    if (numberedMatch) {
      flushParagraph();
      const block = buildBlock(numberedMatch[1], "normal", "number");
      if (block) items.push(block);
      i++;
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      i++;
      continue;
    }

    paragraphBuffer.push(line.trim());
    i++;
  }
  flushParagraph();

  return items;
}
