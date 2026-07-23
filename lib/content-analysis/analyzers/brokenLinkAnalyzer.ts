import type { AnalyzableArticle } from "../types";

const MARKDOWN_LINK_PATTERN = /\[[^\]]*\]\(([^)\s]+)\)/g;
const INTERNAL_JOURNAL_LINK_PATTERN = /^(?:https?:\/\/[^/]+)?\/journal\/([a-z0-9-]+)\/?$/;

export type BrokenInternalLink = {
  url: string;
  targetSlug: string;
};

/** Every Markdown link target in the article's raw body — internal and external alike. */
export function extractLinkUrls(body: string | null): string[] {
  if (!body) return [];
  return Array.from(body.matchAll(MARKDOWN_LINK_PATTERN), (match) => match[1]);
}

/** Resolves a URL to the article slug it targets, or null when it isn't a `/journal/<slug>` link. Shared by broken-link and orphan-article detection. */
export function resolveInternalLinkTargetSlug(url: string): string | null {
  return url.match(INTERNAL_JOURNAL_LINK_PATTERN)?.[1] ?? null;
}

/**
 * A broken internal link is a Markdown link that resolves to
 * `/journal/<slug>` where `<slug>` isn't a real, currently-known article
 * — the only thing checkable without a network request (see
 * extractLinkUrls for the raw extraction). `knownSlugs` should be every
 * slug the repository currently has, published or not.
 */
export function findBrokenInternalLinks(
  article: AnalyzableArticle,
  knownSlugs: ReadonlySet<string>
): BrokenInternalLink[] {
  const broken: BrokenInternalLink[] = [];

  for (const url of extractLinkUrls(article.body)) {
    const targetSlug = resolveInternalLinkTargetSlug(url);
    if (targetSlug && !knownSlugs.has(targetSlug)) {
      broken.push({ url, targetSlug });
    }
  }

  return broken;
}

/** Every external (non-`/journal/`) link URL referenced in the article's body — the input to an external link checker. */
export function extractExternalLinkUrls(body: string | null): string[] {
  return extractLinkUrls(body).filter((url) => {
    if (INTERNAL_JOURNAL_LINK_PATTERN.test(url)) return false;
    return /^https?:\/\//i.test(url);
  });
}
