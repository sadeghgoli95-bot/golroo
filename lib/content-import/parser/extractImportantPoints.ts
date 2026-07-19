import type { ArticleSections } from "../types";

const BULLET_PREFIX_PATTERN = /^[-•*]\s*/;

export function extractImportantPoints(sections: ArticleSections): string[] {
  const raw = sections.importantPoints || "";
  return raw
    .split("\n")
    .map((line) => line.replace(BULLET_PREFIX_PATTERN, "").trim())
    .filter((line) => line.length > 0);
}
