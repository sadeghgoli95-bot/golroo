import type {ArticleChecklistInput, ChecklistItem} from './types'
import {checkTitle, checkSlug, checkExcerpt} from './rules/basicsRules'
import {checkFeaturedImage, checkAltText} from './rules/mediaRules'
import {checkMetaDescription, checkFocusKeyword, checkCanonicalUrl} from './rules/seoRules'
import {checkSources, checkFaq} from './rules/referencesRules'
import {checkHeadings, checkInternalLinks} from './rules/contentStructureRules'
import {checkStructuredData} from './rules/structuredDataRule'

export type {ChecklistItem, ChecklistStatus, ArticleChecklistInput} from './types'

/**
 * The single place every checklist item is assembled — Part 3's
 * "Publishing Checklist" and Part 4's "Content Health" panel both render
 * this same list, so there is exactly one definition of what "ready to
 * publish" means, not two competing ones. Each rule lives in its own small
 * file under rules/, grouped by responsibility (basics, media, seo,
 * references, content structure, structured data).
 */
export function computeChecklist(input: ArticleChecklistInput): ChecklistItem[] {
  return [
    checkTitle(input),
    checkSlug(input),
    checkExcerpt(input),
    checkFeaturedImage(input),
    checkAltText(input),
    checkMetaDescription(input),
    checkFocusKeyword(input),
    checkHeadings(input),
    checkInternalLinks(),
    checkSources(input),
    checkFaq(input),
    checkStructuredData(input),
    checkCanonicalUrl(input),
  ]
}

export type ChecklistSummary = {
  complete: number
  warning: number
  critical: number
  info: number
  total: number
}

export function summarizeChecklist(items: ChecklistItem[]): ChecklistSummary {
  return {
    complete: items.filter((item) => item.status === 'complete').length,
    warning: items.filter((item) => item.status === 'warning').length,
    critical: items.filter((item) => item.status === 'critical').length,
    info: items.filter((item) => item.status === 'info').length,
    total: items.length,
  }
}
