import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates Persian text", () => {
    expect(slugify("اضطراب کودکان")).toBe("اضطراب-کودکان");
  });

  it("strips punctuation not part of letters/numbers", () => {
    expect(slugify("سلام! دنیا؟")).toBe("سلام-دنیا");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("یک   دو   سه")).toBe("یک-دو-سه");
  });

  it("returns an empty string for input with no letters/numbers", () => {
    expect(slugify("!!!")).toBe("");
  });
});
