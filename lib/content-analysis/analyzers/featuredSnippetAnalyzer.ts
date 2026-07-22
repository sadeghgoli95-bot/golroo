import type { AnalyzableArticle } from "../types";

export type FeaturedSnippetCandidate = {
  question: string;
  answer: string;
  source: "faq" | "heading";
};

const QUESTION_ENDING_PATTERN = /[؟?]\s*$/;
const HEADING_LINE_PATTERN = /^(#{1,6})\s+(.*)$/;
const MAX_SNIPPET_WORDS = 58; // Google's typical featured-snippet paragraph length.

function truncateToSnippetLength(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= MAX_SNIPPET_WORDS) return words.join(" ");
  return `${words.slice(0, MAX_SNIPPET_WORDS).join(" ")}…`;
}

/**
 * For every non-empty heading in the raw Markdown body (same scan order
 * and empty-heading skip rule as extractHeadings.ts, so the Nth entry
 * here lines up with article.headings[N]), returns the plain text of the
 * first paragraph that follows it, up to the next heading or a blank
 * line. Real extraction from the actual body text the writer submitted —
 * not a fabricated summary.
 */
function firstParagraphAfterEachHeading(body: string): Map<number, string> {
  const paragraphByHeadingIndex = new Map<number, string>();

  let currentHeadingIndex = -1;
  let buffer: string[] = [];

  const flush = () => {
    if (currentHeadingIndex !== -1 && buffer.length > 0 && !paragraphByHeadingIndex.has(currentHeadingIndex)) {
      paragraphByHeadingIndex.set(currentHeadingIndex, buffer.join(" ").trim());
    }
    buffer = [];
  };

  let headingCounter = -1;
  for (const line of body.split("\n")) {
    const match = line.match(HEADING_LINE_PATTERN);
    if (match) {
      flush();
      if (match[2].trim().length > 0) {
        headingCounter += 1;
        currentHeadingIndex = headingCounter;
      } else {
        currentHeadingIndex = -1;
      }
      continue;
    }
    if (line.trim() === "") {
      flush();
      continue;
    }
    if (currentHeadingIndex !== -1) buffer.push(line.trim());
  }
  flush();

  return paragraphByHeadingIndex;
}

/**
 * Real featured-snippet candidates from two sources: FAQ items (already
 * structured Q&A) and in-body headings phrased as questions paired with
 * the paragraph that follows them. Nothing here is generated text — it's
 * extracted verbatim (then length-capped) from what the writer wrote.
 */
export function detectFeaturedSnippetCandidates(article: AnalyzableArticle): FeaturedSnippetCandidate[] {
  const candidates: FeaturedSnippetCandidate[] = [];

  for (const item of article.faq) {
    candidates.push({ question: item.question, answer: truncateToSnippetLength(item.answer), source: "faq" });
  }

  if (article.body) {
    const paragraphByHeadingIndex = firstParagraphAfterEachHeading(article.body);
    article.headings.forEach((heading, index) => {
      if (!QUESTION_ENDING_PATTERN.test(heading.text.trim())) return;
      const paragraph = paragraphByHeadingIndex.get(index);
      if (paragraph) {
        candidates.push({ question: heading.text, answer: truncateToSnippetLength(paragraph), source: "heading" });
      }
    });
  }

  return candidates;
}
