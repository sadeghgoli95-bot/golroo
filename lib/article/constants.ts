/**
 * The single default author every imported article is attributed to —
 * the current Markdown import format has no Author field at all (see
 * lib/content-import), so this is the only source of truth for it.
 */
export const DEFAULT_ARTICLE_AUTHOR = "صادق گل‌رو";

/**
 * The one place "what author name does this article show" is decided.
 * Every layer (JSON-LD, Open Graph/Twitter previews, Sanity draft
 * writes, the Sanity-document mapper, dashboard display) must call this
 * instead of independently falling back to DEFAULT_ARTICLE_AUTHOR or,
 * worse, a different name (e.g. siteConfig.person.name, the therapist's
 * full legal name used for unrelated Person/ProfessionalService schema)
 * — that divergence was a real bug this function fixes.
 */
export function resolveAuthorName(name: string | null | undefined): string {
  return name && name.trim() ? name.trim() : DEFAULT_ARTICLE_AUTHOR;
}
