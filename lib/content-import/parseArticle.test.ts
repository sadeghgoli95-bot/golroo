import { describe, expect, it } from "vitest";
import { parseArticle } from "./parseArticle";

const SAMPLE = [
  "Title: افسردگي كودكان",
  "Slug: child-depression",
  "Focus Keyword: افسردگی کودک",
  "Secondary Keywords: اضطراب, خلق‌وخو",
  "Topic: سلامت روان کودک",
  "Meta Description: راهنمای کامل درباره افسردگي در كودكان و نوجوانان",
  "Category: روان‌شناسی کودک",
  "Tags: افسردگی, کودک",
  "",
  "# مقدمه",
  "",
  "متن  اصلي   مقاله با   يک   اشتباه تايپي و   فاصله‌های اضافه.",
  "",
  "## علائم",
  "",
  "برخي از علائم عبارتند از بي‌خوابي و بي‌اشتهايي.",
  "",
  "## سوالات متداول",
  "",
  "### افسردگي كودكان چيست؟",
  "افسردگي كودكان يک اختلال رواني است.",
  "",
  "## منابع",
  "",
  "- https://example.com/reference",
].join("\r\n");

const NEW_TEMPLATE_SAMPLE = [
  "Title: اضطراب کودکان",
  "Slug: child-anxiety",
  "Topic: سلامت روان کودک",
  "Keywords: ذهنی سازی، دلبستگی، تنظیم هیجان",
  "Meta Description: راهنمای کامل درباره اضطراب در کودکان",
  "",
  "# مقدمه",
  "",
  "اضطراب کودکان یک موضوع مهم است.",
  "",
  "## منابع",
  "",
  "- https://who.int/reference",
].join("\n");

describe("parseArticle — production bug regressions", () => {
  it("does not lose Meta Description when it appears after an unrecognized/combined label line (root cause of the 'Meta Description reported missing' bug)", () => {
    const parsed = parseArticle(NEW_TEMPLATE_SAMPLE);
    expect(parsed.metaDescription).toBe("راهنمای کامل درباره اضطراب در کودکان");
  });

  it("derives Focus Keyword automatically (Title priority) when no explicit Focus Keyword is given, and still folds Keywords into the general keywords list", () => {
    const parsed = parseArticle(NEW_TEMPLATE_SAMPLE);
    // Priority is Title -> Keywords -> Topic (see generateFocusKeyword.ts)
    // — the title itself ("اضطراب کودکان") yields a valid 2-word
    // candidate, so it wins over the Keywords list.
    expect(parsed.focusKeyword).toBe("اضطراب کودکان");
    expect(parsed.keywords).toEqual(["اضطراب کودکان", "ذهنی سازی", "دلبستگی", "تنظیم هیجان"]);
  });

  it("does not lose the body/Meta Description when a deprecated label (e.g. Author:, Reading Time:) appears in the metadata block", () => {
    const raw = [
      "Title: اضطراب کودکان",
      "Slug: child-anxiety",
      "Author: یک نویسنده قدیمی",
      "Reading Time: 5",
      "Meta Description: توضیحات متا واقعی",
      "",
      "# مقدمه",
      "",
      "متن مقاله.",
    ].join("\n");

    const parsed = parseArticle(raw);
    expect(parsed.metaDescription).toBe("توضیحات متا واقعی");
    expect(parsed.body).toBe("# مقدمه\n\nمتن مقاله.");
    expect(parsed.warnings.some((w) => w.includes("خط ناشناخته"))).toBe(true);
  });

  it("computes Reading Time automatically and never blocks on its absence (no Reading Time label exists in the current format)", () => {
    const parsed = parseArticle(NEW_TEMPLATE_SAMPLE);
    expect(parsed.readingTime).not.toBeNull();
    expect(typeof parsed.readingTime).toBe("number");
  });

  it("generates an excerpt from Meta Description when present (single source of truth, no separate excerpt logic)", () => {
    const parsed = parseArticle(NEW_TEMPLATE_SAMPLE);
    expect(parsed.excerpt).toBe(parsed.metaDescription);
  });

  it("does not include a later FAQ answer's unrelated trailing sections (regression for the FAQ-swallows-later-sections bug)", () => {
    const raw = [
      "Title: تست",
      "Slug: test-faq",
      "Meta Description: توضیحات",
      "",
      "# مقدمه",
      "",
      "متن مقاله.",
      "",
      "## سوالات متداول",
      "",
      "### سوال اول؟",
      "پاسخ اول.",
      "",
      "## جمع‌بندی",
      "",
      "این بخش جمع‌بندی است و نباید در پاسخ FAQ باشد.",
      "",
      "## سوال برای فکر کردن",
      "",
      "این بخش هم نباید در پاسخ FAQ باشد.",
      "",
      "## منابع",
      "",
      "- https://apa.org/source",
    ].join("\n");

    const parsed = parseArticle(raw);
    expect(parsed.faq).toHaveLength(1);
    expect(parsed.faq[0].answer).toBe("پاسخ اول.");
    expect(parsed.faq[0].answer).not.toContain("جمع‌بندی");
    expect(parsed.faq[0].answer).not.toContain("سوال برای فکر کردن");
    expect(parsed.sources).toHaveLength(1);
    expect(parsed.sources[0].url).toBe("https://apa.org/source");
  });
});

describe("parseArticle — automatic Meta Description and Focus Keyword generation", () => {
  it("uses the writer's Meta Description unchanged when present", () => {
    const raw = [
      "Title: اضطراب کودکان",
      "Slug: child-anxiety",
      "Meta Description: این توضیحات متا دستی است.",
      "",
      "# مقدمه",
      "",
      "این یک پاراگراف کاملاً متفاوت است که نباید به‌عنوان توضیحات متا استفاده شود.",
    ].join("\n");
    const parsed = parseArticle(raw);
    expect(parsed.metaDescription).toBe("این توضیحات متا دستی است.");
  });

  it("auto-generates Meta Description from the introduction when it's missing", () => {
    const raw = [
      "Title: اضطراب کودکان",
      "Slug: child-anxiety",
      "",
      "# مقدمه",
      "",
      "اضطراب کودکان یک موضوع مهم در روان‌شناسی رشد است که بسیاری از خانواده‌ها با آن روبه‌رو می‌شوند.",
    ].join("\n");
    const parsed = parseArticle(raw);
    expect(parsed.metaDescription).not.toBeNull();
    expect(parsed.metaDescription).toContain("اضطراب کودکان یک موضوع مهم");
    // excerpt must read the same resolved value — single source of truth.
    expect(parsed.excerpt).toBe(parsed.metaDescription);
  });

  it("uses the writer's Focus Keyword unchanged when present", () => {
    const raw = [
      "Title: اضطراب کودکان و نوجوانان",
      "Slug: x",
      "Focus Keyword: یک کلیدواژه دلخواه",
      "",
      "# مقدمه",
      "",
      "متن.",
    ].join("\n");
    const parsed = parseArticle(raw);
    expect(parsed.focusKeyword).toBe("یک کلیدواژه دلخواه");
  });

  it("auto-generates Focus Keyword from the Title when it's missing", () => {
    const raw = ["Title: اضطراب در کودکان", "Slug: x", "", "# مقدمه", "", "متن."].join("\n");
    const parsed = parseArticle(raw);
    expect(parsed.focusKeyword).toBe("اضطراب در کودکان");
  });

  it("does not block or error when neither Meta Description nor Focus Keyword can be generated — only warns", () => {
    const raw = ["Title: چیست؟", "Slug: x", "", "# ", ""].join("\n");
    const parsed = parseArticle(raw);
    expect(() => parsed).not.toThrow();
    expect(parsed.warnings.length).toBeGreaterThan(0);
  });
});

describe("parseArticle Persian normalization integration", () => {
  it("normalizes Arabic glyph variants and collapses stray whitespace before parsing", () => {
    const parsed = parseArticle(SAMPLE);

    expect(parsed.title).toBe("افسردگی کودکان");
    expect(parsed.metaDescription).toBe("راهنمای کامل درباره افسردگی در کودکان و نوجوانان");
    expect(parsed.body).toContain("متن اصلی مقاله با یک اشتباه تایپی و فاصله‌های اضافه.");
    expect(parsed.body).not.toContain("  ");
  });

  it("normalizes heading text and FAQ content parsed from the body", () => {
    const parsed = parseArticle(SAMPLE);

    expect(parsed.headings.some((h) => h.text === "مقدمه")).toBe(true);
    expect(parsed.faq[0]?.question).toBe("افسردگی کودکان چیست؟");
    expect(parsed.faq[0]?.answer).toContain("افسردگی کودکان یک اختلال روانی است.");
  });

  it("leaves the reference URL in Sources untouched", () => {
    const parsed = parseArticle(SAMPLE);
    expect(parsed.sources[0]?.url).toBe("https://example.com/reference");
  });

  it("still supports the standard format with LF-only line endings (backward compatible with the existing Markdown format)", () => {
    const lf = SAMPLE.replace(/\r\n/g, "\n");
    const parsed = parseArticle(lf);
    expect(parsed.title).toBe("افسردگی کودکان");
    expect(parsed.slug).toBe("child-depression");
  });
});
