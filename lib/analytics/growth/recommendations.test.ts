import { describe, it, expect } from "vitest";
import { buildQuickWins, buildCriticalIssueTasks, buildWeeklyActionPlan } from "./recommendations";
import { buildTestAnalysis } from "../site/testFixtures";

describe("buildQuickWins", () => {
  it("builds a real-number-templated recommendation from a high-impression/low-ctr page", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a" } });
    const pages = [{ page: "/journal/a", clicks: 2, impressions: 300, ctr: 0.01, averagePosition: 4 }];
    const wins = buildQuickWins(pages, [analysis]);
    expect(wins).toHaveLength(1);
    expect(wins[0].message).toContain("300");
  });
});

describe("buildCriticalIssueTasks", () => {
  it("builds one task per published article with real critical suggestions", () => {
    const analysis = buildTestAnalysis({ article: { slug: "a", isPublished: true }, criticalSuggestions: ["مشکل ۱"] });
    const tasks = buildCriticalIssueTasks([analysis]);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].message).toContain("مشکل ۱");
  });
});

describe("buildWeeklyActionPlan", () => {
  it("returns the top-N recommendations across categories ranked by their own within-category percentile", () => {
    const items = [
      { category: "quick_win" as const, slug: "a", title: "a", message: "a", rank: 0.2 },
      { category: "high_impact" as const, slug: "b", title: "b", message: "b", rank: 0.9 },
      { category: "maintenance" as const, slug: "c", title: "c", message: "c", rank: 0.5 },
    ];
    const plan = buildWeeklyActionPlan(items, 2);
    expect(plan.map((item) => item.slug)).toEqual(["b", "c"]);
  });
});
