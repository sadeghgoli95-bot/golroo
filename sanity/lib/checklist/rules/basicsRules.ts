import type {ArticleChecklistInput, ChecklistItem} from '../types'

const MIN_EXCERPT_LENGTH = 50

export function checkTitle(input: ArticleChecklistInput): ChecklistItem {
  const title = input.title?.trim() ?? ''
  return {
    id: 'title',
    label: 'عنوان',
    status: title ? 'complete' : 'critical',
    message: title ? 'عنوان مقاله ثبت شده است.' : 'عنوان مقاله خالی است؛ بدون عنوان این مقاله اصلاً قابل انتشار نیست.',
  }
}

export function checkSlug(input: ArticleChecklistInput): ChecklistItem {
  const slug = input.slug?.current?.trim() ?? ''
  return {
    id: 'slug',
    label: 'آدرس صفحه (Slug)',
    status: slug ? 'complete' : 'critical',
    message: slug ? 'آدرس صفحه مشخص است.' : 'آدرس صفحه (Slug) خالی است؛ بدون آن مقاله آدرس اینترنتی ندارد و قابل انتشار نیست.',
  }
}

export function checkExcerpt(input: ArticleChecklistInput): ChecklistItem {
  const excerpt = input.excerpt?.trim() ?? ''
  if (!excerpt) {
    return {id: 'excerpt', label: 'مقدمه انسانی', status: 'warning', message: 'مقدمه مقاله خالی است؛ اولین چیزی است که خواننده می‌بیند.'}
  }
  if (excerpt.length < MIN_EXCERPT_LENGTH) {
    return {
      id: 'excerpt',
      label: 'مقدمه انسانی',
      status: 'warning',
      message: `مقدمه کوتاه است (${excerpt.length} کاراکتر)؛ بهتر است حداقل ${MIN_EXCERPT_LENGTH} کاراکتر باشد.`,
    }
  }
  return {id: 'excerpt', label: 'مقدمه انسانی', status: 'complete', message: 'مقدمه مقاله نوشته شده است.'}
}
