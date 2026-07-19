import type { ArticleSections } from "../types";

export function extractFinalQuestion(sections: ArticleSections): string | null {
  const finalQuestion = sections.finalQuestion?.trim();
  return finalQuestion ? finalQuestion : null;
}
