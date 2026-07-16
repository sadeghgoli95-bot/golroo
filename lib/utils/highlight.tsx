import type { ReactNode } from "react";

const ARABIC_YEH = "ي";
const PERSIAN_YEH = "ی";
const ARABIC_KAF = "ك";
const PERSIAN_KAF = "ک";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a regex source that matches either the Arabic or Persian variant
 * of Yeh/Kaf, so highlighting still finds a visual match even when the
 * stored text uses a different Unicode variant than what was typed.
 */
function toVariantTolerantPattern(word: string): string {
  const yehClass = `[${PERSIAN_YEH}${ARABIC_YEH}]`;
  const kafClass = `[${PERSIAN_KAF}${ARABIC_KAF}]`;
  return escapeRegExp(word)
    .split(PERSIAN_YEH).join(yehClass)
    .split(ARABIC_YEH).join(yehClass)
    .split(PERSIAN_KAF).join(kafClass)
    .split(ARABIC_KAF).join(kafClass);
}

export function highlightText(text: string, query: string): ReactNode {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(toVariantTolerantPattern);

  if (words.length === 0) return text;

  const alternation = words.join("|");
  const splitPattern = new RegExp(`(${alternation})`, "gi");
  const testPattern = new RegExp(`^(${alternation})$`, "i");
  const parts = text.split(splitPattern);

  return parts.map((part, index) =>
    testPattern.test(part) ? (
      <mark key={index} style={{ background: "var(--highlight)", color: "inherit" }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}
