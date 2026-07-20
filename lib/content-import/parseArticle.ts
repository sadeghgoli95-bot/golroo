import type { ArticleSections, ParsedArticleFields, SectionKey } from "./types";
import { SECTION_LABEL_ALIASES } from "./types";
import { extractHeader } from "./parser/extractHeader";
import { extractExcerpt } from "./parser/extractExcerpt";
import { extractBody } from "./parser/extractBody";
import { extractWindow } from "./parser/extractWindow";
import { extractImportantPoints } from "./parser/extractImportantPoints";
import { extractFinalThought } from "./parser/extractFinalThought";
import { extractFinalQuestion } from "./parser/extractFinalQuestion";
import { extractSources } from "./parser/extractSources";
import { extractWarnings } from "./parser/extractWarnings";

const ALIAS_TO_CANONICAL = new Map<string, SectionKey>();
for (const [canonicalKey, aliases] of Object.entries(SECTION_LABEL_ALIASES) as [SectionKey, readonly string[]][]) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL.set(alias, canonicalKey);
  }
}

const ALL_ALIASES = Array.from(ALIAS_TO_CANONICAL.keys());
const LABEL_LINE_PATTERN = new RegExp(`^[ \\t]*(${ALL_ALIASES.join("|")})\\s*:\\s*(.*)$`);
const WORDS_PER_MINUTE = 200;

/**
 * Order-independent by design: every line is checked against every known
 * alias regardless of position, so a reordered or reshuffled input still
 * parses correctly. A missing section simply never appears in the
 * returned map — extractWarnings (not this function) is what turns that
 * into a warning instead of a crash.
 */
function splitIntoSections(raw: string): ArticleSections {
  const sections: ArticleSections = {};
  let currentKey: SectionKey | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentKey) {
      sections[currentKey] = buffer.join("\n").trim();
    }
  };

  // Normalize CRLF/CR to LF first — LABEL_LINE_PATTERN's `(.*)$` can never
  // match a trailing "\r" (`.` excludes line terminators), so without this
  // every line in Windows-style (\r\n) input fails to match and the whole
  // article parses to an empty sections map.
  for (const line of raw.replace(/\r\n?/g, "\n").split("\n")) {
    const match = line.match(LABEL_LINE_PATTERN);
    if (match) {
      flush();
      const matchedKey = ALIAS_TO_CANONICAL.get(match[1]) ?? null;

      if (matchedKey === "readingTime") {
        // The real article format has no explicit Body: label — Reading
        // Time's value is always a single line, and everything after it
        // is body content until another recognized label appears (if
        // any). Still backward-compatible: an explicit body label later
        // simply matches the `if` branch below and takes over normally.
        sections.readingTime = (match[2] ?? "").trim();
        currentKey = "body";
        buffer = [];
      } else {
        currentKey = matchedKey;
        buffer = match[2] ? [match[2]] : [];
      }
    } else if (currentKey) {
      buffer.push(line);
    }
  }
  flush();

  return sections;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function parseArticle(raw: string): ParsedArticleFields {
  const sections = splitIntoSections(raw);

  const header = extractHeader(sections);
  const body = extractBody(sections);
  const { excerpt, callout } = extractExcerpt(sections, body);
  const windowText = extractWindow(sections);
  const importantPoints = extractImportantPoints(sections);
  const finalThought = extractFinalThought(sections);
  const finalQuestion = extractFinalQuestion(sections);
  const sources = extractSources(sections);

  const wordCount = body ? countWords(body) : 0;
  const characterCount = body ? body.length : 0;
  const estimatedReadingTime = wordCount > 0 ? Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)) : 0;

  const warnings = extractWarnings({
    title: header.title,
    slug: header.slug,
    metaDescription: header.metaDescription,
    readingTime: header.readingTime,
    keywords: header.keywords,
    sources,
    body,
    excerpt,
  });

  return {
    title: header.title,
    slug: header.slug,
    topic: header.topic,
    keywords: header.keywords,
    metaDescription: header.metaDescription,
    readingTime: header.readingTime,
    excerpt,
    callout,
    body,
    window: windowText,
    importantPoints,
    finalThought,
    finalQuestion,
    sources,
    warnings,
    wordCount,
    characterCount,
    estimatedReadingTime,
  };
}
