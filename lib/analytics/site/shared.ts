/** Small, generic aggregation helpers every lib/analytics/site/* module composes — one implementation, reused everywhere. */

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function topN<T>(items: T[], n: number, score: (item: T) => number): T[] {
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, n);
}

export function bottomN<T>(items: T[], n: number, score: (item: T) => number): T[] {
  return [...items].sort((a, b) => score(a) - score(b)).slice(0, n);
}

export type CountBucket = { label: string; count: number };

/** Groups by a single string key, descending by count. Null/empty keys are excluded. */
export function countBy<T>(items: T[], key: (item: T) => string | null): CountBucket[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = key(item);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** Same as countBy, but for fields that hold multiple values per item (tags). */
export function countByMulti<T>(items: T[], keys: (item: T) => string[]): CountBucket[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const value of keys(item)) {
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** Fixed-width buckets over a 0-100 score range (e.g. "0-20", "20-40", ..., "80-100"). */
export function bucketizeScores(values: number[], bucketSize = 20): CountBucket[] {
  const buckets: CountBucket[] = [];
  for (let start = 0; start < 100; start += bucketSize) {
    const end = Math.min(start + bucketSize, 100);
    const count = values.filter((value) => value >= start && (value < end || end === 100)).length;
    buckets.push({ label: `${start}-${end}`, count });
  }
  return buckets;
}
