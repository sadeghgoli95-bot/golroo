import type {CSSProperties} from 'react'
import type {StringInputProps, TextInputProps} from 'sanity'

type CharCountConfig = {
  /** Length below which the count is shown in the warning color (too short). Omit if there's no "too short" concern. */
  min?: number
  /** Length above which the count is shown in the warning color (too long). */
  max: number
}

const rowStyle: CSSProperties = {display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem'}

function renderCounter(length: number, config: CharCountConfig) {
  const tooShort = config.min !== undefined && length > 0 && length < config.min
  const tooLong = length > config.max
  const color = tooShort || tooLong ? '#b98900' : '#6b7280'

  return (
    <div style={rowStyle}>
      <span style={{fontSize: '0.75rem', color}}>
        {length.toLocaleString('fa-IR')} کاراکتر
        {config.min !== undefined ? ` (بازه پیشنهادی: ${config.min}–${config.max})` : ` (حداکثر پیشنهادی: ${config.max})`}
      </span>
    </div>
  )
}

/**
 * Part 5 item 3 — a live character counter under a text field, shown in a
 * neutral color while the length is in the recommended range and an amber
 * warning color when it's outside it. Never blocks typing, only informs —
 * same "guide, don't block" spirit as the rest of the Studio's validation.
 * Two thin factories share `renderCounter` since Sanity's `string` and
 * `text` field types each expect their own distinct input-component prop
 * type for the `components.input` slot.
 */
export function createStringCharCountInput(config: CharCountConfig) {
  return function StringCharCountInput(props: StringInputProps) {
    return (
      <div>
        {props.renderDefault(props)}
        {renderCounter(props.value?.length ?? 0, config)}
      </div>
    )
  }
}

export function createTextCharCountInput(config: CharCountConfig) {
  return function TextCharCountInput(props: TextInputProps) {
    return (
      <div>
        {props.renderDefault(props)}
        {renderCounter(props.value?.length ?? 0, config)}
      </div>
    )
  }
}
