import { describe, expect, it } from "vitest";
import { analyzeSourceAuthority } from "./sourceAuthorityAnalyzer";
import { buildTestArticle } from "../testFixtures";

function source(overrides: Partial<{ doi: string | null; pmid: string | null; url: string | null; author: string | null; journal: string | null; year: string | null; title: string | null }>) {
  return { doi: null, pmid: null, url: null, author: null, journal: null, year: null, title: "منبع", ...overrides };
}

describe("analyzeSourceAuthority", () => {
  it("scores 0 with no sources", () => {
    const result = analyzeSourceAuthority(buildTestArticle({ sources: [] }));
    expect(result.score).toBe(0);
  });

  it("accepts a DOI-bearing source with no domain penalty", () => {
    const article = buildTestArticle({ sources: [source({ doi: "10.1234/example" })] });
    const result = analyzeSourceAuthority(article);
    expect(result.score).toBe(100);
  });

  it("accepts a book citation (author+journal, no DOI) without penalty — books never carry a DOI", () => {
    const article = buildTestArticle({
      sources: [source({ author: "نویسنده", journal: "انتشارات نمونه", title: "کتاب نمونه" })],
    });
    const result = analyzeSourceAuthority(article);
    expect(result.score).toBe(100);
  });

  it("flags a source with no identifier and no structured citation", () => {
    const article = buildTestArticle({ sources: [source({ title: "یک جمله بدون ساختار" })] });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("فاقد DOI"))).toBe(true);
  });

  it("recognizes a known authoritative domain (who.int) without flagging it", () => {
    const article = buildTestArticle({ sources: [source({ url: "https://www.who.int/some-report" })] });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(false);
  });

  it("flags an unrecognized domain as a suggestion, not a failure that blocks", () => {
    const article = buildTestArticle({ sources: [source({ url: "https://random-blog.example.com/post" })] });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(true);
  });

  it("recognizes .gov and .edu domains automatically", () => {
    const article = buildTestArticle({
      sources: [source({ url: "https://cdc.gov/report" }), source({ url: "https://stanford.edu/paper" })],
    });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(false);
  });

  it("recognizes non-US government and university domains (gov.uk, ac.ir), not just .gov/.edu", () => {
    const article = buildTestArticle({
      sources: [source({ url: "https://www.gov.uk/report" }), source({ url: "https://sharif.ac.ir/paper" })],
    });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(false);
  });

  it("recognizes PubMed, Crossref, Google Books, Oxford, Elsevier, SAGE and Guilford", () => {
    const domains = [
      "https://pubmed.ncbi.nlm.nih.gov/12345",
      "https://api.crossref.org/works/10.1234",
      "https://books.google.com/books?id=x",
      "https://academic.oup.com/article",
      "https://www.elsevier.com/article",
      "https://us.sagepub.com/article",
      "https://www.guilford.com/books/x",
    ];
    for (const url of domains) {
      const article = buildTestArticle({ sources: [source({ url })] });
      const result = analyzeSourceAuthority(article);
      expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(false);
    }
  });

  it("does not rely on the domain whitelist alone — a DOI makes a source authoritative even if its URL's domain is unrecognized", () => {
    const article = buildTestArticle({
      sources: [source({ doi: "10.1234/example", url: "https://random-mirror.example.com/article" })],
    });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(false);
  });

  it("a PMID also makes a source authoritative regardless of URL domain", () => {
    const article = buildTestArticle({
      sources: [source({ pmid: "12345678", url: "https://random-mirror.example.com/article" })],
    });
    const result = analyzeSourceAuthority(article);
    expect(result.suggestions.some((s) => s.includes("دامنه منبع"))).toBe(false);
  });
});
