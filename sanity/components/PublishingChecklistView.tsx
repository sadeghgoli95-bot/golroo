import type {CSSProperties} from 'react'
import {computeChecklist, summarizeChecklist, type ChecklistStatus, type ArticleChecklistInput} from '../lib/checklist/computeChecklist'
import {countWords, estimateReadingMinutes} from '../lib/textStats'

type DocumentViewProps = {
  document?: {
    displayed?: (Record<string, unknown> & {_createdAt?: string; _updatedAt?: string; publishedAt?: string; body?: unknown}) | null
  }
}

const infoBarStyle: CSSProperties = {
  display: 'flex',
  gap: '1.25rem',
  flexWrap: 'wrap',
  marginBottom: '1.25rem',
  fontSize: '0.8rem',
  color: '#4b5563',
}

const STATUS_META: Record<ChecklistStatus, {icon: string; color: string; label: string}> = {
  complete: {icon: '✓', color: '#2a9d5c', label: 'کامل'},
  warning: {icon: '!', color: '#b98900', label: 'نیاز به توجه'},
  critical: {icon: '✕', color: '#c0392b', label: 'بحرانی'},
  info: {icon: 'ⓘ', color: '#6b7280', label: 'اطلاعات'},
}

const containerStyle: CSSProperties = {padding: '1.5rem', maxWidth: '640px', margin: '0 auto'}
const summaryRowStyle: CSSProperties = {display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap'}
const summaryCardStyle: CSSProperties = {
  flex: '1 1 120px',
  border: '1px solid #d0d5dd',
  borderRadius: '6px',
  padding: '0.75rem 1rem',
  textAlign: 'center',
}
const listStyle: CSSProperties = {listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem'}
const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  border: '1px solid #e2e5e9',
  borderRadius: '6px',
  padding: '0.65rem 0.9rem',
}
const badgeStyle = (color: string): CSSProperties => ({
  flexShrink: 0,
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  background: color,
  fontSize: '0.85rem',
  fontWeight: 700,
})

/**
 * Part 3 item 2 (Publishing Checklist) + Part 4 item 5 (Content Health
 * summary) share this one view rather than two near-identical panels —
 * both requirements describe the same underlying question ("is this
 * article ready to publish, and what's missing?"). Reads the live document
 * via the `document.displayed` prop Sanity's Structure Builder passes to
 * custom views (this runs outside the form's React context, so it can't
 * use useFormValue). No fake score anywhere — only the real counts of
 * complete/warning/missing/info items computed in computeChecklist.ts.
 */
export function PublishingChecklistView(props: DocumentViewProps) {
  const displayed = props.document?.displayed ?? {}
  const doc = displayed as ArticleChecklistInput
  const items = computeChecklist(doc)
  const summary = summarizeChecklist(items)

  const wordCount = countWords(displayed.body)
  const readingMinutes = estimateReadingMinutes(wordCount)
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString('fa-IR') : 'ثبت نشده')

  return (
    <div style={containerStyle}>
      <h2 style={{fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem'}}>چک‌لیست انتشار و سلامت محتوا</h2>
      <p style={{fontSize: '0.85rem', color: '#6b7280', marginTop: 0, marginBottom: '1rem'}}>
        این چک‌لیست فقط برای راهنمایی است و مانع ذخیره یا انتشار نمی‌شود.
      </p>

      <div style={infoBarStyle}>
        <span>تعداد کلمات: {wordCount.toLocaleString('fa-IR')}</span>
        <span>زمان مطالعه تخمینی: {readingMinutes ? `${readingMinutes.toLocaleString('fa-IR')} دقیقه` : '—'}</span>
        <span>تاریخ ایجاد: {formatDate(displayed._createdAt)}</span>
        <span>آخرین ذخیره: {formatDate(displayed._updatedAt)}</span>
        <span>تاریخ انتشار: {formatDate(displayed.publishedAt)}</span>
      </div>

      <div style={summaryRowStyle}>
        <div style={{...summaryCardStyle, borderColor: STATUS_META.complete.color}}>
          <div style={{fontSize: '1.4rem', fontWeight: 700, color: STATUS_META.complete.color}}>{summary.complete}</div>
          <div style={{fontSize: '0.75rem'}}>کامل</div>
        </div>
        <div style={{...summaryCardStyle, borderColor: STATUS_META.warning.color}}>
          <div style={{fontSize: '1.4rem', fontWeight: 700, color: STATUS_META.warning.color}}>{summary.warning}</div>
          <div style={{fontSize: '0.75rem'}}>نیاز به توجه</div>
        </div>
        <div style={{...summaryCardStyle, borderColor: STATUS_META.critical.color}}>
          <div style={{fontSize: '1.4rem', fontWeight: 700, color: STATUS_META.critical.color}}>{summary.critical}</div>
          <div style={{fontSize: '0.75rem'}}>بحرانی</div>
        </div>
      </div>

      <ul style={listStyle}>
        {items.map((item) => {
          const meta = STATUS_META[item.status]
          return (
            <li key={item.id} style={itemStyle}>
              <span style={badgeStyle(meta.color)} aria-label={meta.label} title={meta.label}>
                {meta.icon}
              </span>
              <div>
                <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{item.label}</div>
                <div style={{fontSize: '0.82rem', color: '#4b5563'}}>{item.message}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
