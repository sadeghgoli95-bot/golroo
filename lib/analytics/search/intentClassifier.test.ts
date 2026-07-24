import { describe, expect, it } from "vitest";
import { classifySearchIntent } from "./intentClassifier";

describe("classifySearchIntent", () => {
  it("classifies brand-term queries as navigational, even when combined with other words", () => {
    expect(classifySearchIntent("میرورا نظرات")).toBe("navigational");
    expect(classifySearchIntent("گل‌رو روان‌درمانگر")).toBe("navigational");
    expect(classifySearchIntent("golroo review")).toBe("navigational");
  });

  it("classifies price/booking terms as transactional", () => {
    expect(classifySearchIntent("قیمت مشاوره کودک")).toBe("transactional");
    expect(classifySearchIntent("رزرو نوبت روان‌شناس کودک")).toBe("transactional");
    expect(classifySearchIntent("book child therapist")).toBe("transactional");
  });

  it("classifies city/location terms as local", () => {
    expect(classifySearchIntent("روان‌درمانگر کودک تهران")).toBe("local");
    expect(classifySearchIntent("therapist near me")).toBe("local");
  });

  it("classifies question/how-to patterns as informational", () => {
    expect(classifySearchIntent("اضطراب کودک چیست")).toBe("informational");
    expect(classifySearchIntent("چگونه با کودک لجباز رفتار کنیم")).toBe("informational");
    expect(classifySearchIntent("what is child anxiety")).toBe("informational");
  });

  it("falls back to informational for an unmatched query, never an invented category", () => {
    expect(classifySearchIntent("لجبازی کودک دو ساله")).toBe("informational");
  });

  it("prioritizes navigational over transactional when both a brand term and a price term appear", () => {
    expect(classifySearchIntent("قیمت مشاوره میرورا")).toBe("navigational");
  });
});
