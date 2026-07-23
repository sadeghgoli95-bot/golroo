import { describe, expect, it } from "vitest";
import { toCsv } from "./toCsv";

describe("toCsv", () => {
  it("returns an empty string for no rows", () => {
    expect(toCsv([])).toBe("");
  });

  it("writes a header row followed by one line per row", () => {
    const csv = toCsv([
      { title: "مقاله یک", score: 80 },
      { title: "مقاله دو", score: 55 },
    ]);
    expect(csv).toBe("title,score\nمقاله یک,80\nمقاله دو,55");
  });

  it("quotes values containing commas, quotes, or newlines", () => {
    const csv = toCsv([{ title: 'عنوان, با "نقل قول" و\nخط جدید', score: 1 }]);
    expect(csv).toBe('title,score\n"عنوان, با ""نقل قول"" و\nخط جدید",1');
  });

  it("renders null as an empty field", () => {
    expect(toCsv([{ title: "x", note: null }])).toBe("title,note\nx,");
  });
});
