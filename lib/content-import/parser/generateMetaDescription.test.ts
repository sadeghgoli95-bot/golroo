import { describe, expect, it } from "vitest";
import { generateMetaDescription } from "./generateMetaDescription";

describe("generateMetaDescription", () => {
  it("returns null when there is no body", () => {
    expect(generateMetaDescription(null)).toBeNull();
  });

  it("uses the introduction (first paragraph) of the body", () => {
    const body = "# مقدمه\n\nاضطراب کودکان یک موضوع مهم در روان‌شناسی رشد است که بسیاری از والدین با آن مواجه می‌شوند.\n\n## بخش بعدی\n\nمتن دیگر.";
    const result = generateMetaDescription(body);
    expect(result).toContain("اضطراب کودکان یک موضوع مهم");
    expect(result).not.toContain("متن دیگر");
  });

  it("skips a trivially short first paragraph in favor of the first meaningful one", () => {
    const body = "# مقدمه\n\nکوتاه.\n\nاین یک پاراگراف طولانی و معنادار درباره موضوع اصلی مقاله است.";
    const result = generateMetaDescription(body);
    expect(result).toContain("این یک پاراگراف طولانی و معنادار");
  });

  it("removes markdown syntax: bold, italic, links, inline code, bullets", () => {
    const body = [
      "# مقدمه",
      "",
      "این متن شامل **پررنگ**، *مورب*، [یک لینک](https://example.com)، `کد درون‌خطی` و یک نکته کلیدی درباره کودکان است.",
    ].join("\n");
    const result = generateMetaDescription(body)!;
    expect(result).not.toContain("**");
    expect(result).not.toContain("*مورب*");
    expect(result).not.toContain("[");
    expect(result).not.toContain("](");
    expect(result).not.toContain("`");
    expect(result).toContain("پررنگ");
    expect(result).toContain("مورب");
    expect(result).toContain("یک لینک");
    expect(result).toContain("کد درون‌خطی");
  });

  it("removes duplicate spaces and line breaks, collapsing to a single line", () => {
    const body = "# مقدمه\n\nاین متن   دارای   فاصله‌های  اضافه است\nو یک شکست خط دارد که باید حذف شود.";
    const result = generateMetaDescription(body)!;
    expect(result).not.toContain("  ");
    expect(result).not.toContain("\n");
  });

  it("truncates to a maximum of 155 characters, ending on a complete word", () => {
    const longParagraph = Array.from({ length: 60 }, (_, i) => `کلمه${i}`).join(" ");
    const body = `# مقدمه\n\n${longParagraph}`;
    const result = generateMetaDescription(body)!;

    expect(result.length).toBeLessThanOrEqual(156); // 155 + ellipsis
    const withoutEllipsis = result.replace(/…$/, "");
    expect(withoutEllipsis.endsWith(" ")).toBe(false);
    expect(body).toContain(withoutEllipsis.trim());
  });

  it("never wraps the result in quotation marks", () => {
    const body = "# مقدمه\n\nاین یک پاراگراف معمولی و کاملاً طبیعی درباره سلامت روان کودکان است.";
    const result = generateMetaDescription(body)!;
    expect(result.startsWith('"')).toBe(false);
    expect(result.endsWith('"')).toBe(false);
    expect(result.startsWith("«")).toBe(false);
    expect(result.endsWith("»")).toBe(false);
  });

  it("does not force-inject a keyword that isn't naturally present (never keyword-stuffs)", () => {
    const body = "# مقدمه\n\nاین یک متن کاملاً بی‌ربط به موضوع خاصی است.";
    const result = generateMetaDescription(body)!;
    expect(result).not.toContain("ذهنی سازی");
  });

  it("normalizes Arabic glyph variants and strips diacritics via the shared Persian normalization utility", () => {
    const body = "# مقدمه\n\nاين متن شامل حروف عربي كاف و ياء با تشديد اَست و بايد نرمال شود به‌طور کامل.";
    const result = generateMetaDescription(body)!;
    expect(result).not.toContain("ي");
    expect(result).not.toContain("ك");
    expect(result).toContain("این");
    expect(result).toContain("کاف");
  });

  it("returns null when the body has no usable paragraph", () => {
    expect(generateMetaDescription("# فقط یک تیتر")).toBeNull();
    expect(generateMetaDescription("")).toBeNull();
  });
});
