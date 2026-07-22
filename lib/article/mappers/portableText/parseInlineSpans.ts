import { createKey } from "./createKey";

export type PortableTextSpan = {
  _key: string;
  _type: "span";
  text: string;
  marks: string[];
};

// Order matters: bold (**) must be tried before italic (*), or "**x**"
// would be split into two dangling "*" italics instead of one strong span.
const INLINE_TOKEN_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/;

/**
 * Splits a single line of already-extracted plain text into Portable
 * Text spans, recognizing `**bold**`, `*italic*`, and `` `code` ``
 * (the only inline marks the Markdown import template uses). Every span
 * gets its own `_key` via createKey() — this is the only function in the
 * pipeline allowed to construct a span, so a block can never end up with
 * a keyless or markless-by-mistake child.
 */
export function parseInlineSpans(text: string): PortableTextSpan[] {
  const parts = text.split(INLINE_TOKEN_PATTERN).filter((part) => part.length > 0);

  if (parts.length === 0) {
    return [{ _key: createKey(), _type: "span", text: "", marks: [] }];
  }

  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return { _key: createKey(), _type: "span", text: part.slice(2, -2), marks: ["strong"] };
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return { _key: createKey(), _type: "span", text: part.slice(1, -1), marks: ["code"] };
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return { _key: createKey(), _type: "span", text: part.slice(1, -1), marks: ["em"] };
    }
    return { _key: createKey(), _type: "span", text: part, marks: [] };
  });
}
