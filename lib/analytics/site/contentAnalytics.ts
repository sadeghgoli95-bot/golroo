import type { ArticleAnalysis } from "./getSiteAnalysis";
import { average, topN, bottomN, countBy, countByMulti, bucketizeScores, type CountBucket } from "./shared";

const BEST_WORST_COUNT = 10;
const READING_TIME_BUCKETS = [
  { label: "کمتر از ۳ دقیقه", max: 3 },
  { label: "۳ تا ۵ دقیقه", max: 5 },
  { label: "۵ تا ۸ دقیقه", max: 8 },
  { label: "۸ تا ۱۲ دقیقه", max: 12 },
  { label: "بیش از ۱۲ دقیقه", max: Infinity },
];

export type ContentAnalytics = {
  bestArticles: { slug: string; title: string; score: number }[];
  worstArticles: { slug: string; title: string; score: number }[];
  contentQualityDistribution: CountBucket[];
  readingTimeDistribution: CountBucket[];
  sourceQualityAverage: number;
  articlesWithNoSources: number;
  topicDistribution: CountBucket[];
  categoryDistribution: CountBucket[];
  tagDistribution: CountBucket[];
  thinContent: { slug: string; title: string }[];
  missingFaq: { slug: string; title: string }[];
  missingSources: { slug: string; title: string }[];
  missingImages: { slug: string; title: string }[];
  missingAltText: { slug: string; title: string }[];
};

function toRow(item: ArticleAnalysis) {
  return { slug: item.article.slug ?? "", title: item.article.title ?? "بدون عنوان" };
}

function contentScoreOf(item: ArticleAnalysis): number {
  return item.review.contentQuality.scores.content;
}

/** Every number here reuses buildContentQualityReport's already-computed scores (lib/content-pipeline/contentQualityAdvisor.ts) — nothing is recalculated. */
export function getContentAnalytics(analyses: ArticleAnalysis[]): ContentAnalytics {
  const best = topN(analyses, BEST_WORST_COUNT, contentScoreOf);
  const worst = bottomN(analyses, BEST_WORST_COUNT, contentScoreOf);

  const readingTimeDistribution: CountBucket[] = READING_TIME_BUCKETS.map((bucket, index) => {
    const min = index === 0 ? 0 : READING_TIME_BUCKETS[index - 1].max;
    const count = analyses.filter((item) => {
      const minutes = item.article.readingTime ?? item.article.estimatedReadingTime;
      return minutes >= min && minutes < bucket.max;
    }).length;
    return { label: bucket.label, count };
  });

  return {
    bestArticles: best.map((item) => ({ ...toRow(item), score: contentScoreOf(item) })),
    worstArticles: worst.map((item) => ({ ...toRow(item), score: contentScoreOf(item) })),
    contentQualityDistribution: bucketizeScores(analyses.map(contentScoreOf)),
    readingTimeDistribution,
    sourceQualityAverage: average(analyses.map((item) => item.review.contentQuality.scores.evidence)),
    articlesWithNoSources: analyses.filter((item) => item.article.sources.length === 0).length,
    topicDistribution: countBy(analyses, (item) => item.article.topic),
    categoryDistribution: countBy(analyses, (item) => item.article.category),
    tagDistribution: countByMulti(analyses, (item) => item.article.tags),
    thinContent: analyses
      .filter((item) => item.review.contentQuality.scores.contentDepth < 50)
      .map(toRow),
    missingFaq: analyses.filter((item) => !item.article.hasFaq).map(toRow),
    missingSources: analyses.filter((item) => item.article.sources.length === 0).map(toRow),
    missingImages: analyses.filter((item) => !item.article.hasFeaturedImage).map(toRow),
    missingAltText: analyses.filter((item) => item.article.imageAltTexts.length === 0).map(toRow),
  };
}
