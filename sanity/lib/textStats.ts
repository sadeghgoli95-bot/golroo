import {WORDS_PER_MINUTE} from './siteDefaults'

type PortableTextSpan = {_type?: string; text?: string}
type PortableTextBlock = {_type?: string; children?: PortableTextSpan[]}

/** The one real word-count function every Studio component that needs it shares — never reimplemented per component. */
export function countWords(body: unknown): number {
  if (!Array.isArray(body)) return 0
  const text = (body as PortableTextBlock[])
    .filter((block) => block?._type === 'block')
    .flatMap((block) => block.children ?? [])
    .map((span) => span?.text ?? '')
    .join(' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function estimateReadingMinutes(wordCount: number): number | null {
  return wordCount > 0 ? Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)) : null
}
