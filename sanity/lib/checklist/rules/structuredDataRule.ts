import type {ArticleChecklistInput, ChecklistItem} from '../types'

/**
 * "Structured Data" here means: does this document have everything the
 * frontend needs to generate a real, non-empty Article JSON-LD block
 * (title, excerpt as description, featured image, author)? This is a
 * derived check over fields that already exist — never a separate
 * "structured data" field to fill in by hand.
 */
export function checkStructuredData(input: ArticleChecklistInput): ChecklistItem {
  const missing: string[] = []
  if (!input.title?.trim()) missing.push('عنوان')
  if (!input.excerpt?.trim()) missing.push('مقدمه')
  if (!input.featuredImage) missing.push('تصویر شاخص')
  if (!input.author) missing.push('نویسنده')

  if (missing.length === 0) {
    return {
      id: 'structuredData',
      label: 'داده ساخت‌یافته (Structured Data)',
      status: 'complete',
      message: 'همه اطلاعات لازم برای تولید خودکار Structured Data کامل است.',
    }
  }

  return {
    id: 'structuredData',
    label: 'داده ساخت‌یافته (Structured Data)',
    status: 'warning',
    message: `برای Structured Data کامل، این موارد را هم تکمیل کنید: ${missing.join('، ')}.`,
  }
}
