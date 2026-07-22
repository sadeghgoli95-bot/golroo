import type { ArticleFaqItem } from "../types";

const QUESTION_HEADING_PATTERN = /^###\s+(.*)$/;
const NON_QUESTION_HEADING_PATTERN = /^#{1,2}\s+.*$/;

/**
 * Input is the raw text of the `## سوالات متداول` section only, already
 * sliced out by parseArticle.ts's splitBodyFaqSources (which itself now
 * ends that slice at the next H1/H2 heading, so this shouldn't normally
 * see one) — this still stops an answer buffer on any H1/H2 heading
 * defensively, so a FAQ answer can never swallow a later section
 * (e.g. "## جمع‌بندی", "## سوال برای فکر کردن") even if the slice
 * boundary logic changes in the future.
 */
export function extractFaq(section: string | undefined): ArticleFaqItem[] {
  if (!section) return [];

  const items: ArticleFaqItem[] = [];
  let currentQuestion: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!currentQuestion) return;
    const answer = buffer.join("\n").trim();
    if (answer) items.push({ question: currentQuestion, answer });
  };

  for (const line of section.split("\n")) {
    const questionMatch = line.match(QUESTION_HEADING_PATTERN);
    if (questionMatch) {
      flush();
      currentQuestion = questionMatch[1].trim();
      buffer = [];
      continue;
    }

    if (NON_QUESTION_HEADING_PATTERN.test(line)) {
      flush();
      currentQuestion = null;
      continue;
    }

    if (currentQuestion) buffer.push(line);
  }
  flush();

  return items;
}
