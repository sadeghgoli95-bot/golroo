import type {ArticleChecklistInput, ChecklistItem} from '../types'

const MIN_META_DESCRIPTION = 70
const MAX_META_DESCRIPTION = 160

export function checkMetaDescription(input: ArticleChecklistInput): ChecklistItem {
  const value = input.seo?.metaDescription?.trim() ?? ''
  if (!value) {
    return {id: 'metaDescription', label: 'توضیحات متا', status: 'warning', message: 'توضیحات متا خالی است؛ این متن در نتایج گوگل نمایش داده می‌شود.'}
  }
  if (value.length < MIN_META_DESCRIPTION) {
    return {
      id: 'metaDescription',
      label: 'توضیحات متا',
      status: 'warning',
      message: `توضیحات متا کوتاه است (${value.length} کاراکتر)؛ حداقل ${MIN_META_DESCRIPTION} کاراکتر توصیه می‌شود.`,
    }
  }
  if (value.length > MAX_META_DESCRIPTION) {
    return {
      id: 'metaDescription',
      label: 'توضیحات متا',
      status: 'warning',
      message: `توضیحات متا طولانی است (${value.length} کاراکتر)؛ ممکن است در گوگل بریده شود.`,
    }
  }
  return {id: 'metaDescription', label: 'توضیحات متا', status: 'complete', message: 'طول توضیحات متا مناسب است.'}
}

export function checkFocusKeyword(input: ArticleChecklistInput): ChecklistItem {
  const keyword = input.seo?.focusKeyword?.trim() ?? ''
  if (!keyword) {
    return {id: 'focusKeyword', label: 'کلیدواژه اصلی', status: 'warning', message: 'کلیدواژه اصلی مشخص نشده است.'}
  }
  const title = input.title?.trim() ?? ''
  const inTitle = title.toLowerCase().includes(keyword.toLowerCase())
  return {
    id: 'focusKeyword',
    label: 'کلیدواژه اصلی',
    status: inTitle ? 'complete' : 'info',
    message: inTitle
      ? 'کلیدواژه اصلی مشخص شده و در عنوان هم وجود دارد.'
      : `کلیدواژه اصلی («${keyword}») در عنوان مقاله دیده نمی‌شود؛ در صورت امکان اضافه کنید.`,
  }
}

/** Canonical URL is intentionally rare-use (only for syndicated/duplicate content), so it is informational — an empty value is not a problem. */
export function checkCanonicalUrl(input: ArticleChecklistInput): ChecklistItem {
  const value = input.seo?.canonicalUrl?.trim() ?? ''
  return {
    id: 'canonicalUrl',
    label: 'آدرس اصلی (Canonical URL)',
    status: 'info',
    message: value ? 'آدرس اصلی دستی تنظیم شده است.' : 'خالی است — طبیعی است، فقط برای محتوای تکراری/بازنشرشده لازم است.',
  }
}
