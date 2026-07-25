import type {ArticleChecklistInput, ChecklistItem} from '../types'

export function checkSources(input: ArticleChecklistInput): ChecklistItem {
  const count = input.sources?.length ?? 0
  return {
    id: 'sources',
    label: 'منابع علمی و مراجع',
    status: count > 0 ? 'complete' : 'warning',
    message: count > 0 ? `${count} منبع علمی ثبت شده است.` : 'هیچ منبع علمی/مرجعی ثبت نشده است؛ برای اعتبار علمی مقاله مهم است.',
  }
}

export function checkFaq(input: ArticleChecklistInput): ChecklistItem {
  const count = input.faq?.length ?? 0
  return {
    id: 'faq',
    label: 'سوالات متداول',
    status: count > 0 ? 'complete' : 'info',
    message: count > 0 ? `${count} سوال متداول لینک شده است.` : 'هیچ سوال متداولی برای این مقاله انتخاب نشده است (اختیاری).',
  }
}
