import type {ArticleChecklistInput, ChecklistItem} from '../types'

type PortableTextBlock = {_type?: string; style?: string}

export function checkHeadings(input: ArticleChecklistInput): ChecklistItem {
  const body = Array.isArray(input.body) ? (input.body as PortableTextBlock[]) : []
  const hasHeading = body.some((block) => block?._type === 'block' && /^h[1-6]$/.test(block.style ?? ''))
  return {
    id: 'headings',
    label: 'زیرعنوان‌ها (Headings)',
    status: hasHeading ? 'complete' : 'warning',
    message: hasHeading
      ? 'متن مقاله حداقل یک زیرعنوان دارد.'
      : 'متن مقاله هیچ زیرعنوانی ندارد؛ افزودن زیرعنوان خواندن و سئو را بهتر می‌کند.',
  }
}

/**
 * Internal-link tracking inside the article body is not something this
 * data model currently supports: every article's `body` is produced by
 * markdownToPortableText, which always emits an empty `markDefs` array
 * (see lib/article/mappers/portableText/markdownToPortableText.ts) — so
 * there is no real, deterministic way to detect internal links from this
 * document today. Rather than fake a check, this stays informational and
 * says so plainly.
 */
export function checkInternalLinks(): ChecklistItem {
  return {
    id: 'internalLinks',
    label: 'لینک‌های داخلی',
    status: 'info',
    message: 'بررسی خودکار لینک داخلی هنوز در این ساختار محتوا پشتیبانی نمی‌شود.',
  }
}
