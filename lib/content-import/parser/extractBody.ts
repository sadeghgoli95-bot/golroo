import type { ArticleSections } from "../types";

export function extractBody(sections: ArticleSections): string | null {
  const body = sections.body?.trim();
  return body ? body : null;
}
