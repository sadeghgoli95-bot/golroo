import type { ArticleSections } from "../types";

export function extractWindow(sections: ArticleSections): string | null {
  const windowText = sections.window?.trim();
  return windowText ? windowText : null;
}
