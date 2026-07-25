import type {ArticleChecklistInput, ChecklistItem} from '../types'

export function checkFeaturedImage(input: ArticleChecklistInput): ChecklistItem {
  const hasImage = Boolean(input.featuredImage)
  return {
    id: 'featuredImage',
    label: 'تصویر شاخص',
    status: hasImage ? 'complete' : 'warning',
    message: hasImage ? 'تصویر شاخص ثبت شده است.' : 'تصویر شاخص انتخاب نشده است؛ در لیست مقالات و اشتراک‌گذاری تأثیر دارد.',
  }
}

export function checkAltText(input: ArticleChecklistInput): ChecklistItem {
  const hasImage = Boolean(input.featuredImage)
  const hasAlt = Boolean(input.featuredImageAlt?.trim())

  if (!hasImage) {
    return {
      id: 'altText',
      label: 'توضیح تصویر (Alt)',
      status: 'info',
      message: 'تصویر شاخصی انتخاب نشده تا برایش Alt لازم باشد.',
    }
  }
  return {
    id: 'altText',
    label: 'توضیح تصویر (Alt)',
    status: hasAlt ? 'complete' : 'warning',
    message: hasAlt
      ? 'توضیح تصویر شاخص ثبت شده است.'
      : 'تصویر شاخص دارید ولی توضیح تصویر (Alt) خالی است؛ برای دسترس‌پذیری و سئو مهم است.',
  }
}
