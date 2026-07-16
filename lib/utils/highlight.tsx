import type { ReactNode } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightText(text: string, query: string): ReactNode {
  const words = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp);

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
