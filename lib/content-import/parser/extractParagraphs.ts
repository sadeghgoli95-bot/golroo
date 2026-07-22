const HEADING_LINE_PATTERN = /^#{1,6}\s+.*$/;
const TRUNCATION_SUFFIX = "…";
const MEANINGFUL_MIN_LENGTH = 20;

/** Every paragraph (consecutive non-heading, non-blank lines joined) in body order. */
function allParagraphs(body: string): string[] {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length > 0) paragraphs.push(buffer.join(" "));
    buffer = [];
  };

  for (const line of body.split("\n")) {
    if (HEADING_LINE_PATTERN.test(line) || line.trim() === "") {
      flush();
      continue;
    }
    buffer.push(line.trim());
  }
  flush();

  return paragraphs;
}

/**
 * Single implementation of "what is this article's first paragraph" —
 * used by both extractExcerpt.ts and generateMetaDescription.ts so
 * paragraph-finding logic exists in exactly one place.
 */
export function firstParagraph(body: string): string | null {
  return allParagraphs(body)[0] ?? null;
}

/**
 * Like firstParagraph, but skips a trivially short first paragraph
 * (e.g. a one-word fragment) in favor of the first one that's actually
 * substantial — "the introduction, or otherwise the first meaningful
 * paragraph" (see generateMetaDescription.ts).
 */
export function firstMeaningfulParagraph(body: string): string | null {
  const paragraphs = allParagraphs(body);
  return paragraphs.find((paragraph) => paragraph.length >= MEANINGFUL_MIN_LENGTH) ?? paragraphs[0] ?? null;
}

/** Single implementation of "truncate to N characters without cutting inside a word." */
export function truncateAtWholeWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const words = lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : truncated;

  return `${words.trim()}${TRUNCATION_SUFFIX}`;
}
