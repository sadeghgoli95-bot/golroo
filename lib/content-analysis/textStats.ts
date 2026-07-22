// Shared plain-text statistics helpers for content-analysis analyzers
// only (paragraph splitting for scoring purposes). Distinct from
// lib/content-import/parser/extractParagraphs.ts, which serves the
// import parser's excerpt/meta-description generation — that module
// produces canonical Article fields; this one derives read-only
// statistics FROM an already-built Article for analysis/reporting. Kept
// separate so content-analysis never depends back on content-import.

const HEADING_LINE_PATTERN = /^#{1,6}\s+.*$/;

/** Every paragraph (consecutive non-heading, non-blank lines joined) in body order. */
export function splitParagraphs(body: string): string[] {
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

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
