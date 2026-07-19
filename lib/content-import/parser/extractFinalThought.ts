import type { ArticleSections } from "../types";

export function extractFinalThought(sections: ArticleSections): string | null {
  const finalThought = sections.finalThought?.trim();
  return finalThought ? finalThought : null;
}
