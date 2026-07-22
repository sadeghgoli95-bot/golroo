import type { ArticleSections, ParsedArticleFields, SectionKey } from "./types";
import { SECTION_LABEL_ALIASES, FAQ_SECTION_HEADINGS, SOURCES_SECTION_HEADINGS } from "./types";
import { extractHeader } from "./parser/extractHeader";
import { extractExcerpt } from "./parser/extractExcerpt";
import { extractBody } from "./parser/extractBody";
import { extractHeadings } from "./parser/extractHeadings";
import { extractFaq } from "./parser/extractFaq";
import { extractSources } from "./parser/extractSources";
import { extractWarnings } from "./parser/extractWarnings";
import { generateMetaDescription } from "./parser/generateMetaDescription";
import { normalizeImportText } from "@/lib/utils/textNormalize";

const ALIAS_TO_CANONICAL = new Map<string, SectionKey>();
for (const [canonicalKey, aliases] of Object.entries(SECTION_LABEL_ALIASES) as [SectionKey, readonly string[]][]) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL.set(alias, canonicalKey);
  }
}

const ALL_ALIASES = Array.from(ALIAS_TO_CANONICAL.keys());
const LABEL_LINE_PATTERN = new RegExp(`^[ \\t]*(${ALL_ALIASES.join("|")})\\s*:\\s*(.*)$`);

/**
 * A section-delimiter heading (FAQ/Sources) may or may not carry a "##"
 * marker, and may carry a trailing English/Persian gloss in parentheses
 * or a trailing colon — e.g. "## سوالات متداول", "## سوالات متداول
 * (FAQ)", "External Sources:" are all the same delimiter in practice.
 * The "##" is optional (not "# " through "######") to stay consistent
 * with the original heading-only match and avoid accidentally treating
 * an unrelated H1 title as a section delimiter.
 */
function buildSectionHeadingPattern(labels: readonly string[]): RegExp {
  const alternation = labels.join("|");
  return new RegExp(`^(?:##\\s+)?(?:${alternation})\\s*(?:\\(.*\\))?\\s*:?\\s*$`, "i");
}

const FAQ_HEADING_PATTERN = buildSectionHeadingPattern(FAQ_SECTION_HEADINGS);
const SOURCES_HEADING_PATTERN = buildSectionHeadingPattern(SOURCES_SECTION_HEADINGS);
const ANY_HEADING_PATTERN = /^(#{1,6})\s+.*$/;
const WORDS_PER_MINUTE = 200;

/**
 * Metadata lines can appear in any order and blank lines between them
 * are transparently skipped. The metadata block ends at the first
 * Markdown heading line (`#` through `######`) — the template always
 * opens the body with one (`# Article`). This used to end the block at
 * the first line that wasn't a recognized label, which silently folded
 * every later real label (most commonly Meta Description, coming after
 * an unrecognized line like a bare "Keywords:" or a leftover "Author:"/
 * "Reading Time:" line from the old format) into the article body —
 * losing Meta Description, Focus Keyword, etc. even though the writer
 * typed them correctly. An unrecognized non-heading line is now skipped
 * (and reported back so the caller can warn about it) instead of ending
 * the block.
 */
function splitMetadata(lines: string[]): {
  metadata: ArticleSections;
  restStartIndex: number;
  unrecognizedLines: string[];
} {
  const metadata: ArticleSections = {};
  const unrecognizedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (ANY_HEADING_PATTERN.test(line)) return { metadata, restStartIndex: i, unrecognizedLines };

    const match = line.match(LABEL_LINE_PATTERN);
    if (match) {
      const key = ALIAS_TO_CANONICAL.get(match[1]);
      if (key) metadata[key] = (match[2] ?? "").trim();
    } else {
      unrecognizedLines.push(line.trim());
    }
  }

  return { metadata, restStartIndex: lines.length, unrecognizedLines };
}

/**
 * `## سوالات متداول` and `## منابع` are section delimiters, not labels —
 * everything before the first one is the Markdown body.
 *
 * The FAQ section ends at the next H1/H2 heading of ANY kind, not only
 * the literal Sources heading — this was a real bug: only "## منابع"
 * ended the FAQ slice, so any other section heading between FAQ and
 * Sources (e.g. "## جمع‌بندی", "## سوال برای فکر کردن") leaked into the
 * last FAQ answer's text instead of being excluded from it. Sources is
 * still located by its own explicit heading anywhere after FAQ, so it's
 * found correctly even with an unrecognized section in between.
 */
function splitBodyFaqSources(restLines: string[]): {
  body: string;
  faqSection: string | undefined;
  sourcesSection: string | undefined;
} {
  const faqHeadingIndex = restLines.findIndex((line) => FAQ_HEADING_PATTERN.test(line));
  const sourcesHeadingIndex = restLines.findIndex((line) => SOURCES_HEADING_PATTERN.test(line));

  const bodyEndCandidates = [faqHeadingIndex, sourcesHeadingIndex].filter((index) => index !== -1);
  const bodyEnd = bodyEndCandidates.length > 0 ? Math.min(...bodyEndCandidates) : restLines.length;

  let faqSection: string | undefined;
  if (faqHeadingIndex !== -1) {
    const faqStart = faqHeadingIndex + 1;
    let faqEnd = restLines.length;
    for (let i = faqStart; i < restLines.length; i++) {
      const match = restLines[i].match(ANY_HEADING_PATTERN);
      if (match && match[1].length <= 2) {
        faqEnd = i;
        break;
      }
      // The Sources heading may have no "#" marker at all (e.g. "External
      // Sources:"), so it would never match ANY_HEADING_PATTERN above —
      // check it explicitly or a headless Sources label would be
      // swallowed into the last FAQ answer instead of ending the section.
      if (SOURCES_HEADING_PATTERN.test(restLines[i])) {
        faqEnd = i;
        break;
      }
    }
    faqSection = restLines.slice(faqStart, faqEnd).join("\n");
  }

  const sourcesSection =
    sourcesHeadingIndex !== -1 ? restLines.slice(sourcesHeadingIndex + 1).join("\n") : undefined;

  return { body: restLines.slice(0, bodyEnd).join("\n"), faqSection, sourcesSection };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function parseArticle(raw: string): ParsedArticleFields {
  // Persian normalization (Arabic->Persian glyphs, diacritics, invisible
  // characters, whitespace) must happen before any parsing/splitting —
  // also normalizes CRLF/CR to LF, which every downstream line-based
  // pattern relies on since it anchors with `$` (never matches a
  // trailing "\r").
  const lines = normalizeImportText(raw).split("\n");

  const { metadata, restStartIndex, unrecognizedLines } = splitMetadata(lines);
  const { body: bodyMarkdown, faqSection, sourcesSection } = splitBodyFaqSources(lines.slice(restStartIndex));

  const header = extractHeader(metadata);
  const body = extractBody(bodyMarkdown);
  // Meta Description: use the writer's value unchanged when given;
  // otherwise generate one from the body (see generateMetaDescription.ts)
  // before excerpt is derived, so excerpt's own "use Meta Description
  // first" priority sees the resolved value either way — one source of
  // truth for every downstream reader (validator, SEO report, Open
  // Graph, JSON-LD, AI Overview).
  const metaDescription = header.metaDescription ?? generateMetaDescription(body);
  const excerpt = extractExcerpt(body, metaDescription);
  const headings = extractHeadings(bodyMarkdown);
  const faq = extractFaq(faqSection);
  const sources = extractSources(sourcesSection);

  const wordCount = body ? countWords(body) : 0;
  const characterCount = body ? body.length : 0;
  const estimatedReadingTime = wordCount > 0 ? Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)) : 0;

  const warnings = extractWarnings({
    title: header.title,
    slug: header.slug,
    metaDescription,
    focusKeyword: header.focusKeyword,
    sources,
    body,
    excerpt,
  });
  if (unrecognizedLines.length > 0) {
    warnings.push(`${unrecognizedLines.length} خط ناشناخته قبل از شروع بدنه مقاله نادیده گرفته شد: ${unrecognizedLines.join(" | ")}`);
  }

  return {
    title: header.title,
    slug: header.slug,
    topic: header.topic,
    category: header.category,
    focusKeyword: header.focusKeyword,
    secondaryKeywords: header.secondaryKeywords,
    keywords: header.keywords,
    tags: header.tags,
    metaDescription,
    // No Reading Time label in this format — always computed from body.
    readingTime: estimatedReadingTime,
    excerpt,
    body,
    headings,
    faq,
    sources,
    warnings,
    wordCount,
    characterCount,
    estimatedReadingTime,
  };
}
