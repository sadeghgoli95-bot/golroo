import { describe, expect, it } from "vitest";
import { extractFaq } from "./extractFaq";

describe("extractFaq answer boundaries", () => {
  it("stops an answer at the next FAQ question", () => {
    const section = ["### سوال اول؟", "پاسخ اول.", "### سوال دوم؟", "پاسخ دوم."].join("\n");
    const items = extractFaq(section);
    expect(items).toHaveLength(2);
    expect(items[0].answer).toBe("پاسخ اول.");
    expect(items[1].answer).toBe("پاسخ دوم.");
  });

  it("stops an answer at any H1/H2 heading that leaked into the slice (defense in depth)", () => {
    const section = ["### سوال؟", "پاسخ صحیح.", "## جمع‌بندی", "این نباید در پاسخ باشد."].join("\n");
    const items = extractFaq(section);
    expect(items).toHaveLength(1);
    expect(items[0].answer).toBe("پاسخ صحیح.");
  });

  it("stops an answer at a level-1 heading too", () => {
    const section = ["### سوال؟", "پاسخ صحیح.", "# یک تیتر سطح یک", "متن ناخواسته."].join("\n");
    const items = extractFaq(section);
    expect(items[0].answer).toBe("پاسخ صحیح.");
  });

  it("handles multi-line answers correctly", () => {
    const section = ["### سوال؟", "خط اول پاسخ.", "خط دوم پاسخ."].join("\n");
    const items = extractFaq(section);
    expect(items[0].answer).toBe("خط اول پاسخ.\nخط دوم پاسخ.");
  });

  it("returns an empty array for an undefined section", () => {
    expect(extractFaq(undefined)).toEqual([]);
  });
});
