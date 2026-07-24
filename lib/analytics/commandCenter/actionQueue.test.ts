import { describe, expect, it } from "vitest";
import { buildActionQueue } from "./actionQueue";
import { buildPriorityMatrix } from "./priorityMatrix";
import type { Recommendation } from "../growth/recommendations";

function rec(overrides: Partial<Recommendation>): Recommendation {
  return { category: "quick_win", slug: "a", title: "A", message: "m", rank: 0.5, ...overrides };
}

describe("buildActionQueue", () => {
  it("ranks items by real rank, highest first, with sequential priority numbers", () => {
    const matrix = buildPriorityMatrix([rec({ slug: "low", rank: 0.2 }), rec({ slug: "high", rank: 0.9 })]);
    const queue = buildActionQueue(matrix);
    expect(queue[0].action).toBe("A");
    expect(queue[0].link).toBe("/journal/high");
    expect(queue[0].priority).toBe(1);
    expect(queue[1].link).toBe("/journal/low");
  });

  it("caps the queue at topN", () => {
    const recs = Array.from({ length: 15 }, (_, index) => rec({ slug: `s${index}`, rank: index / 15 }));
    const queue = buildActionQueue(buildPriorityMatrix(recs), 5);
    expect(queue).toHaveLength(5);
  });
});
