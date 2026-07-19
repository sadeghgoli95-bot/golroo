import type { Hydrator } from "./types";

const WORDS_PER_MINUTE = 200;

/** Real computation: fills readingTime from wordCount only when the CMS didn't set one. */
export const ReadingTimeHydrator: Hydrator = (article) => {
  if (article.readingTime !== null) return { article, warnings: [] };

  if (article.wordCount === 0) {
    return { article, warnings: ["نمی‌توان زمان مطالعه را محاسبه کرد (متن خالی است)"] };
  }

  const readingTime = Math.max(1, Math.round(article.wordCount / WORDS_PER_MINUTE));
  return { article: { ...article, readingTime }, warnings: [] };
};
