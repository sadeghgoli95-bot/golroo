import { describe, expect, it } from "vitest";
import { buildPriorityMatrix, groupByQuadrant } from "./priorityMatrix";
import type { Recommendation } from "../growth/recommendations";

function rec(overrides: Partial<Recommendation>): Recommendation {
  return { category: "quick_win", slug: "a", title: "A", message: "m", rank: 0.5, ...overrides };
}

describe("buildPriorityMatrix", () => {
  it("puts a high-impact, low-effort quick_win into do_now", () => {
    const [item] = buildPriorityMatrix([rec({ category: "quick_win", rank: 0.9 })]);
    expect(item.effort).toBe("low");
    expect(item.quadrant).toBe("do_now");
  });

  it("puts a high-impact, high-effort task into schedule", () => {
    const [item] = buildPriorityMatrix([rec({ category: "high_impact", rank: 0.9 })]);
    expect(item.effort).toBe("high");
    expect(item.quadrant).toBe("schedule");
  });

  it("puts a low-impact, low-effort task into fill_in", () => {
    const [item] = buildPriorityMatrix([rec({ category: "republish", rank: 0.1 })]);
    expect(item.quadrant).toBe("fill_in");
  });

  it("puts a low-impact, high-effort task into reconsider", () => {
    const [item] = buildPriorityMatrix([rec({ category: "high_impact", rank: 0.1 })]);
    expect(item.quadrant).toBe("reconsider");
  });
});

describe("groupByQuadrant", () => {
  it("buckets every item into exactly one quadrant group", () => {
    const items = buildPriorityMatrix([rec({ category: "quick_win", rank: 0.9, slug: "a" }), rec({ category: "high_impact", rank: 0.1, slug: "b" })]);
    const groups = groupByQuadrant(items);
    expect(groups.do_now).toHaveLength(1);
    expect(groups.reconsider).toHaveLength(1);
    expect(groups.schedule).toHaveLength(0);
    expect(groups.fill_in).toHaveLength(0);
  });
});
