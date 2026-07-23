import { describe, expect, it } from "vitest";
import { average, topN, bottomN, countBy, countByMulti, bucketizeScores } from "./shared";

describe("average", () => {
  it("rounds the mean of the values", () => {
    expect(average([10, 20, 21])).toBe(17);
  });
  it("returns 0 for an empty array, not NaN", () => {
    expect(average([])).toBe(0);
  });
});

describe("topN / bottomN", () => {
  const items = [{ id: "a", score: 50 }, { id: "b", score: 90 }, { id: "c", score: 10 }];

  it("topN returns the highest-scoring items first", () => {
    expect(topN(items, 2, (i) => i.score).map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("bottomN returns the lowest-scoring items first", () => {
    expect(bottomN(items, 2, (i) => i.score).map((i) => i.id)).toEqual(["c", "a"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...items];
    topN(items, 1, (i) => i.score);
    expect(items).toEqual(copy);
  });
});

describe("countBy", () => {
  it("groups by string key, descending by count", () => {
    const items = [{ topic: "a" }, { topic: "b" }, { topic: "a" }];
    expect(countBy(items, (i) => i.topic)).toEqual([
      { label: "a", count: 2 },
      { label: "b", count: 1 },
    ]);
  });

  it("excludes null keys", () => {
    const items = [{ topic: null }, { topic: "a" }];
    expect(countBy(items, (i) => i.topic)).toEqual([{ label: "a", count: 1 }]);
  });
});

describe("countByMulti", () => {
  it("counts each value across array fields", () => {
    const items = [{ tags: ["a", "b"] }, { tags: ["a"] }];
    expect(countByMulti(items, (i) => i.tags)).toEqual([
      { label: "a", count: 2 },
      { label: "b", count: 1 },
    ]);
  });
});

describe("bucketizeScores", () => {
  it("buckets 0-100 scores into fixed-width ranges, including 100 in the last bucket", () => {
    const buckets = bucketizeScores([5, 25, 45, 65, 85, 100], 20);
    expect(buckets).toEqual([
      { label: "0-20", count: 1 },
      { label: "20-40", count: 1 },
      { label: "40-60", count: 1 },
      { label: "60-80", count: 1 },
      { label: "80-100", count: 2 },
    ]);
  });
});
