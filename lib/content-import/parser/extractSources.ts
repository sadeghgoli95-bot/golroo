import type { ArticleSections, ArticleSource } from "../types";

const BULLET_PREFIX_PATTERN = /^[-•*]\s*/;
const DOI_PATTERN = /10\.\d{4,9}\/\S+/i;
const PMID_PATTERN = /PMID:?\s*(\d{4,9})/i;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;
const SOURCE_FIELD_SEPARATOR_PATTERN = /[،,]/;

/**
 * Extraction order: DOI, then PMID, then the remaining comma-separated
 * fields (Author, Title, Journal, Year) purely positionally. A source
 * with no DOI is still extracted in full — DOI is never required for the
 * rest of the fields to populate.
 *
 * ASSUMPTION: no reference example of a Mirora source line existed in the
 * repo. This assumes a comma-separated "Author، Title، Journal، Year،
 * DOI" order. Confirm the real convention before relying on field mapping.
 */
function parseSourceLine(line: string): ArticleSource {
  const doiMatch = line.match(DOI_PATTERN);
  const pmidMatch = line.match(PMID_PATTERN);
  const yearMatch = line.match(YEAR_PATTERN);
  const parts = line
    .split(SOURCE_FIELD_SEPARATOR_PATTERN)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    doi: doiMatch ? doiMatch[0] : null,
    pmid: pmidMatch ? pmidMatch[1] : null,
    year: yearMatch ? yearMatch[0] : null,
    author: parts[0] || null,
    title: parts[1] || null,
    journal: parts[2] || null,
  };
}

export function extractSources(sections: ArticleSections): ArticleSource[] {
  const raw = sections.sources || "";
  return raw
    .split("\n")
    .map((line) => line.replace(BULLET_PREFIX_PATTERN, "").trim())
    .filter((line) => line.length > 0)
    .map(parseSourceLine);
}
