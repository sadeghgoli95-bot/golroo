import { describe, expect, it } from "vitest";
import { analyzeSearchIntent } from "./searchIntentAnalyzer";
import { buildTestArticle } from "../testFixtures";

describe("analyzeSearchIntent", () => {
  it("classifies a question-style title as 'question'", () => {
    const result = analyzeSearchIntent(buildTestArticle({ title: "افسردگی کودکان چیست" }));
    expect(result.intent).toBe("question");
  });

  it("classifies a comparative title as 'comparative'", () => {
    const result = analyzeSearchIntent(buildTestArticle({ title: "بهترین روش‌های درمان اضطراب" }));
    expect(result.intent).toBe("comparative");
  });

  it("classifies a transactional title as 'transactional'", () => {
    const result = analyzeSearchIntent(buildTestArticle({ title: "رزرو نوبت مشاوره کودک" }));
    expect(result.intent).toBe("transactional");
  });

  it("defaults to 'informational' when no signal matches", () => {
    const result = analyzeSearchIntent(buildTestArticle({ title: "نکاتی درباره رشد کودک" }));
    expect(result.intent).toBe("informational");
  });

  it("always returns at least one signal explaining the classification", () => {
    const result = analyzeSearchIntent(buildTestArticle({ title: "نکاتی درباره رشد کودک" }));
    expect(result.signals.length).toBeGreaterThan(0);
  });
});
