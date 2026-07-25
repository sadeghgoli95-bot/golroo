// Single source of truth for values that used to be re-typed into every
// article. Reuses lib/seo/site.ts (the app's own single source of truth for
// SITE_NAME/ORGANIZATION_NAME/SITE_URL) instead of duplicating those
// strings inside the Studio — Part 2 item 8 ("do not hardcode values inside
// multiple files").
import {SITE_NAME, ORGANIZATION_NAME, SITE_URL} from '@/lib/seo/site'

export {SITE_NAME, ORGANIZATION_NAME, SITE_URL}

/** The one real author this single-author brand publishes under — used to auto-fill new articles' Author field. Looked up by name at document-creation time (never a hardcoded document ID, since IDs can differ per dataset/environment). */
export const DEFAULT_AUTHOR_NAME = 'محمد صادق گل‌رو'

/** Where published articles live — used to build the real canonical-URL suggestion shown in the SEO fields. */
export const JOURNAL_PATH_PREFIX = '/journal'

export function buildArticleUrl(slug: string): string {
  return `${SITE_URL}${JOURNAL_PATH_PREFIX}/${slug}`
}

/** Average adult Persian silent-reading speed, words per minute — used only to *suggest* a reading time, never to silently overwrite an editor's own number. */
export const WORDS_PER_MINUTE = 200
