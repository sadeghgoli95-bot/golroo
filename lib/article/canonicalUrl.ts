import { SITE_URL } from "@/lib/seo/site";

/**
 * The one implementation of "what is this article's canonical URL" —
 * every mapper (parsed-fields, Sanity document) must call this instead
 * of independently interpolating `${SITE_URL}/journal/${slug}`, which
 * had drifted into two copies of the same string template.
 */
export function buildCanonicalUrl(slug: string | null): string | null {
  return slug ? `${SITE_URL}/journal/${slug}` : null;
}
