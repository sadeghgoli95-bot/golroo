/**
 * Part 4's three validation levels (Information / Warning / Critical),
 * plus 'complete' for an item with nothing to flag. 'critical' is reserved
 * for the two things an article genuinely cannot exist/publish without
 * (title, slug) — everything else that's missing is a real gap worth
 * flagging, but never worth blocking the editor over, so it's 'warning' or
 * 'info' depending on how much it actually matters.
 */
export type ChecklistStatus = 'complete' | 'info' | 'warning' | 'critical'

export type ChecklistItem = {
  id: string
  label: string
  status: ChecklistStatus
  message: string
}

/** Minimal shape this module reads from the live article form — matches article.ts field names exactly, never a parallel/renamed model. */
export type ArticleChecklistInput = {
  title?: string
  slug?: {current?: string}
  excerpt?: string
  body?: unknown
  featuredImage?: unknown
  featuredImageAlt?: string
  author?: unknown
  sources?: unknown[]
  faq?: unknown[]
  seo?: {
    metaDescription?: string
    focusKeyword?: string
    canonicalUrl?: string
  }
}
