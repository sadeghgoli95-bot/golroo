import type { ArticleSource } from "../types";

const BULLET_PREFIX_PATTERN = /^[-•*]\s*/;
const DOI_PATTERN = /10\.\d{4,9}\/\S+/i;
const PMID_PATTERN = /PMID:?\s*(\d{4,9})/i;
const URL_PATTERN = /https?:\/\/\S+/i;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const SOURCE_FIELD_SEPARATOR_PATTERN = /[،,]/;

/**
 * A source line may be a DOI-bearing paper, a URL, an ISBN-bearing book,
 * or a plain citation with no machine-readable identifier at all — every
 * form is extracted in full; DOI (or any other identifier) is never
 * required for the rest of the fields to populate. Books never carry a
 * DOI, so this deliberately never treats a missing DOI as an error.
 */
function parseSourceLine(line: string): ArticleSource {
  const doiMatch = line.match(DOI_PATTERN);
  const pmidMatch = line.match(PMID_PATTERN);
  const urlMatch = line.match(URL_PATTERN);
  const yearMatch = line.match(YEAR_PATTERN);
  const parts = line
    .split(SOURCE_FIELD_SEPARATOR_PATTERN)
    .map((part) => part.trim())
    .filter(Boolean);

  const base = {
    doi: doiMatch ? doiMatch[0] : null,
    pmid: pmidMatch ? pmidMatch[1] : null,
    url: urlMatch ? urlMatch[0] : null,
    year: yearMatch ? yearMatch[0] : null,
  };

  // No "Author، Title، Journal" structure at all (a bare URL, ISBN, or
  // single-sentence citation) — keep the whole line as the title rather
  // than guessing which field it belongs to.
  if (parts.length <= 1) {
    return { ...base, author: null, title: line.trim() || null, journal: null };
  }

  return { ...base, author: parts[0] || null, title: parts[1] || null, journal: parts[2] || null };
}

/** Input is the raw text of the `## منابع` section only, already sliced out by parseArticle. */
export function extractSources(section: string | undefined): ArticleSource[] {
  if (!section) return [];

  return section
    .split("\n")
    .map((line) => line.replace(BULLET_PREFIX_PATTERN, "").trim())
    .filter((line) => line.length > 0)
    .map(parseSourceLine);
}
