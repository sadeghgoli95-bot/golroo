import { describe, expect, it } from "vitest";
import { explainChange } from "./explainChange";
import type { RankedChange } from "../history/rankChanges";

function change(overrides: Partial<RankedChange> = {}): RankedChange {
  return {
    key: "clicks",
    label: "کلیک‌ها",
    higherIsBetter: true,
    comparison: { current: 50, previous: 100, difference: -50, percentChange: -50, trend: "down" },
    direction: "regression",
    fromLabel: "هفته قبل",
    toLabel: "این هفته",
    ...overrides,
  };
}

describe("explainChange", () => {
  it("states only the real observed numbers, with no possible explanation, when there are no corroborating signals", () => {
    const explanation = explainChange(change());
    expect(explanation.observed).toContain("50.0٪");
    expect(explanation.possibleExplanation).toBeNull();
    expect(explanation.unknown).toMatch(/همبستگی به‌معنای علیت نیست/);
  });

  it("includes a possible explanation, explicitly labeled as such, when real corroborating signals are supplied", () => {
    const explanation = explainChange(change(), ["میانگین جایگاه", "نمایش‌ها"]);
    expect(explanation.possibleExplanation).toContain("میانگین جایگاه");
    expect(explanation.possibleExplanation).toContain("نمایش‌ها");
    expect(explanation.possibleExplanation).toMatch(/نه یک علت اثبات‌شده/);
  });

  it("never omits the unknown disclaimer, even with strong corroboration", () => {
    const explanation = explainChange(change(), ["نمایش‌ها"]);
    expect(explanation.unknown).toBeTruthy();
  });
});
