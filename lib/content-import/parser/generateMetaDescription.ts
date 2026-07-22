import { normalizePersianText } from "@/lib/utils/textNormalize";
import { firstMeaningfulParagraph, truncateAtWholeWord } from "./extractParagraphs";

const MAX_LENGTH = 155;

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> link text
    .replace(/(\*\*\*|___)(.*?)\1/g, "$2") // bold+italic
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(?<!\w)(\*|_)(.*?)\1(?!\w)/g, "$2") // italic
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/^>+\s?/gm, "") // blockquote markers
    .replace(/^[-*+]\s+/gm, "") // bullet list markers
    .replace(/^\d+\.\s+/gm, "") // numbered list markers
    .replace(/#{1,6}\s+/g, ""); // stray heading markers
}

/**
 * Auto-generates a Meta Description when the writer didn't provide one
 * (the header parser passes null here in that case — see
 * lib/content-import/parseArticle.ts). Prefers the article's
 * introduction (its first paragraph); falls back to the first
 * substantial paragraph elsewhere in the body if the introduction is
 * trivially short. Strips Markdown syntax, collapses whitespace/line
 * breaks into a single line, and truncates to 155 characters at a whole
 * word. Never wraps the result in quotes, and never force-injects the
 * focus keyword or topic into the sentence — "include the primary topic
 * naturally" means keep it only if it's already there; rewriting the
 * sentence to fit a keyword in would be keyword stuffing, which this is
 * explicitly asked not to do.
 */
export function generateMetaDescription(body: string | null): string | null {
  if (!body) return null;

  const paragraph = firstMeaningfulParagraph(body.trim());
  if (!paragraph) return null;

  const plain = stripMarkdown(paragraph).replace(/\s+/g, " ").trim();
  const normalized = normalizePersianText(plain);
  if (!normalized) return null;

  return truncateAtWholeWord(normalized, MAX_LENGTH);
}
