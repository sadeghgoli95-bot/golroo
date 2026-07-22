import type { AnalyzableArticle, AnalyzerResult } from "../types";
import { ratioScore } from "../constants";

// Recognized authoritative publisher/reference domains. Not exhaustive —
// an unrecognized domain is a suggestion to verify manually, never a
// hard failure, since a real citation can legitimately live anywhere.
// This list is a fallback signal only: a source with a DOI or PMID is
// treated as authoritative regardless of its URL's domain (see
// isAuthoritativeSource below) — domain matching alone was too narrow.
const AUTHORITATIVE_DOMAINS = [
  "doi.org",
  "crossref.org",
  "api.crossref.org",
  "pubmed.ncbi.nlm.nih.gov",
  "ncbi.nlm.nih.gov",
  "nih.gov",
  "who.int",
  "unicef.org",
  "apa.org",
  "aacap.org",
  "psychiatry.org",
  "books.google.com",
  "oup.com",
  "academic.oup.com",
  "oxfordacademic.com",
  "cambridge.org",
  "springer.com",
  "link.springer.com",
  "wiley.com",
  "onlinelibrary.wiley.com",
  "elsevier.com",
  "sciencedirect.com",
  "tandfonline.com",
  "taylorandfrancis.com",
  "sagepub.com",
  "guilford.com",
  "thelancet.com",
  "nature.com",
  "jamanetwork.com",
  "scholar.google.com",
];

/** Any government (.gov, .gov.xx) or academic (.edu, .ac.xx) domain, worldwide — not just .gov/.edu. */
function isGovernmentOrUniversityDomain(hostname: string): boolean {
  const labels = hostname.split(".");
  return labels.includes("gov") || labels.includes("edu") || labels.includes("ac");
}

function isKnownPublisherDomain(hostname: string): boolean {
  return AUTHORITATIVE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

/**
 * A source counts as authoritative when it has a DOI or PMID (a real,
 * externally-verifiable identifier — stronger evidence than any domain
 * guess) OR its URL resolves to a government/university/known-publisher
 * domain. DOI/PMID presence is checked first and independently of the
 * URL, so a source is never penalized for citing via a subdomain or
 * mirror this list doesn't happen to include.
 */
function isAuthoritativeSource(source: AnalyzableArticle["sources"][number]): boolean {
  if (source.doi || source.pmid) return true;
  if (!source.url) return false;

  try {
    const hostname = new URL(source.url).hostname.replace(/^www\./, "");
    return isGovernmentOrUniversityDomain(hostname) || isKnownPublisherDomain(hostname);
  } catch {
    return false;
  }
}

/**
 * Validates external sources: every source must be verifiable somehow
 * (DOI, PMID, URL, or a structured author+journal citation — a book
 * never needs a DOI, matching lib/content-import's parser), and every
 * URL-bearing source is checked for authority via isAuthoritativeSource
 * above. An unrecognized domain (with no DOI/PMID either) is a
 * suggestion to double-check manually, never a failure.
 */
export function analyzeSourceAuthority(article: AnalyzableArticle): AnalyzerResult {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (article.sources.length === 0) {
    return { score: 0, warnings: ["منبعی برای بررسی اعتبار وجود ندارد"], suggestions };
  }

  let verifiableCount = 0;
  let urlSourceCount = 0;
  let authoritativeUrlCount = 0;

  for (const source of article.sources) {
    const hasIdentifier = Boolean(source.doi || source.pmid || source.url);
    const hasStructuredCitation = Boolean(source.author && source.journal);
    if (hasIdentifier || hasStructuredCitation) {
      verifiableCount += 1;
    } else {
      suggestions.push(`منبع «${source.title ?? "بدون عنوان"}» فاقد DOI، PMID، URL یا ساختار استنادی (نویسنده/نشریه) است`);
    }

    if (source.url) {
      urlSourceCount += 1;
      if (isAuthoritativeSource(source)) {
        authoritativeUrlCount += 1;
      } else {
        suggestions.push(`دامنه منبع «${source.url}» در فهرست منابع معتبر شناخته‌شده نیست — به‌صورت دستی بررسی شود`);
      }
    }
  }

  const allVerifiable = verifiableCount === article.sources.length;
  const allUrlsAuthoritative = urlSourceCount === 0 || authoritativeUrlCount === urlSourceCount;

  const checks = [allVerifiable, allUrlsAuthoritative];
  const passed = checks.filter(Boolean).length;

  return { score: ratioScore(passed, checks.length), warnings, suggestions };
}
