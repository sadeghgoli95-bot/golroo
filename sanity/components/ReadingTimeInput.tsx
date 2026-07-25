import {useMemo, type CSSProperties} from 'react'
import {set, useFormValue, type NumberInputProps} from 'sanity'
import {countWords, estimateReadingMinutes} from '../lib/textStats'

const suggestionBoxStyle: CSSProperties = {
  marginTop: '0.5rem',
  padding: '0.6rem 0.8rem',
  borderRadius: '4px',
  border: '1px solid var(--card-border-color, #d0d5dd)',
  background: 'var(--card-bg-color, #f4f6f8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  fontSize: '0.8rem',
}

const applyButtonStyle: CSSProperties = {
  border: '1px solid currentColor',
  borderRadius: '4px',
  background: 'transparent',
  padding: '0.25rem 0.6rem',
  fontSize: '0.75rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

/**
 * Part 2 — "Generate values automatically: Reading Time". Reading time
 * can't be computed once at document-creation (the body is empty then), so
 * this renders the normal number input plus a live, real suggestion
 * computed from the article's actual current word count — never a fake or
 * static number. The editor stays fully in control: applying the
 * suggestion is one click, never automatic/silent. Built with plain
 * elements (no @sanity/ui) since that package isn't hoisted as a directly
 * resolvable dependency in this project.
 */
export function ReadingTimeInput(props: NumberInputProps) {
  const body = useFormValue(['body'])
  const wordCount = useMemo(() => countWords(body), [body])
  const suggestedMinutes = estimateReadingMinutes(wordCount)
  const currentValue = props.value

  return (
    <div>
      {props.renderDefault(props)}
      {suggestedMinutes !== null ? (
        <div style={suggestionBoxStyle}>
          <span>
            بر اساس متن فعلی («{wordCount.toLocaleString('fa-IR')}» کلمه): حدود{' '}
            <strong>{suggestedMinutes.toLocaleString('fa-IR')} دقیقه</strong>
          </span>
          {currentValue !== suggestedMinutes ? (
            <button type="button" style={applyButtonStyle} onClick={() => props.onChange(set(suggestedMinutes))}>
              استفاده از این عدد
            </button>
          ) : null}
        </div>
      ) : (
        <p style={{fontSize: '0.8rem', opacity: 0.7, marginTop: '0.4rem'}}>
          به‌محض نوشتن متن اصلی مقاله، پیشنهاد زمان مطالعه اینجا نمایش داده می‌شود.
        </p>
      )}
    </div>
  )
}
