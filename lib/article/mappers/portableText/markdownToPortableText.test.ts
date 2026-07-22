import { describe, expect, it } from "vitest";
import { markdownToPortableText, type PortableTextBlock, type PortableTextCodeBlock } from "./markdownToPortableText";

/** Collects every `_key` in the tree (blocks, codeBlocks, and their children) to assert uniqueness. */
function collectKeys(items: ReturnType<typeof markdownToPortableText>): string[] {
  const keys: string[] = [];
  for (const item of items) {
    keys.push(item._key);
    if (item._type === "block") keys.push(...item.children.map((child) => child._key));
  }
  return keys;
}

describe("markdownToPortableText — Sanity Studio 'Missing keys' regression", () => {
  it("returns an empty array for null/empty body instead of a keyless placeholder", () => {
    expect(markdownToPortableText(null)).toEqual([]);
    expect(markdownToPortableText("")).toEqual([]);
    expect(markdownToPortableText("   ")).toEqual([]);
  });

  it("gives every block a non-empty _key", () => {
    const items = markdownToPortableText("# عنوان\n\nیک پاراگراف.\n\n- آیتم اول\n- آیتم دوم");
    for (const item of items) {
      expect(item._key).toBeTruthy();
      expect(typeof item._key).toBe("string");
    }
  });

  it("gives every span child a non-empty _key", () => {
    const items = markdownToPortableText("این یک **پررنگ** و *ایتالیک* و `کد` دارد.");
    const block = items[0] as PortableTextBlock;
    for (const child of block.children) {
      expect(child._key).toBeTruthy();
    }
  });

  it("never produces duplicate _key values across the whole tree", () => {
    const markdown = [
      "# عنوان اصلی",
      "",
      "پاراگراف اول با **پررنگ** و *ایتالیک*.",
      "",
      "## زیرعنوان",
      "",
      "- آیتم اول",
      "- آیتم دوم",
      "- آیتم سوم",
      "",
      "1. مرحله اول",
      "2. مرحله دوم",
      "",
      "> این یک نقل‌قول است.",
      "",
      "```js",
      "console.log('hi');",
      "```",
      "",
      "پاراگراف پایانی.",
    ].join("\n");

    const items = markdownToPortableText(markdown);
    const keys = collectKeys(items);
    expect(keys.length).toBeGreaterThan(0);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("converts a plain paragraph into a single normal block with one span", () => {
    const items = markdownToPortableText("این یک پاراگراف ساده است.");
    expect(items).toHaveLength(1);
    const block = items[0] as PortableTextBlock;
    expect(block._type).toBe("block");
    expect(block.style).toBe("normal");
    expect(block.markDefs).toEqual([]);
    expect(block.children).toHaveLength(1);
    expect(block.children[0].text).toBe("این یک پاراگراف ساده است.");
    expect(block.children[0].marks).toEqual([]);
  });

  it("joins consecutive non-blank lines into a single paragraph block", () => {
    const items = markdownToPortableText("خط اول\nخط دوم\nخط سوم");
    expect(items).toHaveLength(1);
    expect((items[0] as PortableTextBlock).children[0].text).toBe("خط اول خط دوم خط سوم");
  });

  it("converts # through #### into h1-h4 blocks", () => {
    const items = markdownToPortableText("# یک\n\n## دو\n\n### سه\n\n#### چهار") as PortableTextBlock[];
    expect(items.map((b) => b.style)).toEqual(["h1", "h2", "h3", "h4"]);
    expect(items.map((b) => b.children[0].text)).toEqual(["یک", "دو", "سه", "چهار"]);
  });

  it("converts a bullet list into separate blocks with listItem: bullet", () => {
    const items = markdownToPortableText("- مورد اول\n- مورد دوم\n* مورد سوم") as PortableTextBlock[];
    expect(items).toHaveLength(3);
    for (const block of items) {
      expect(block.listItem).toBe("bullet");
      expect(block.level).toBe(1);
    }
    expect(items.map((b) => b.children[0].text)).toEqual(["مورد اول", "مورد دوم", "مورد سوم"]);
  });

  it("converts a numbered list into separate blocks with listItem: number", () => {
    const items = markdownToPortableText("1. اول\n2. دوم\n3. سوم") as PortableTextBlock[];
    expect(items).toHaveLength(3);
    for (const block of items) {
      expect(block.listItem).toBe("number");
      expect(block.level).toBe(1);
    }
  });

  it("converts a blockquote into a single blockquote-style block, merging consecutive quote lines", () => {
    const items = markdownToPortableText("> خط اول نقل‌قول\n> خط دوم نقل‌قول") as PortableTextBlock[];
    expect(items).toHaveLength(1);
    expect(items[0].style).toBe("blockquote");
    expect(items[0].children[0].text).toBe("خط اول نقل‌قول خط دوم نقل‌قول");
  });

  it("converts a fenced code block into a codeBlock object, preserving the language and exact code text (no inline-span parsing inside code)", () => {
    const markdown = ["```ts", "const x = 1;", "console.log(x);", "```"].join("\n");
    const items = markdownToPortableText(markdown);
    expect(items).toHaveLength(1);
    const codeBlock = items[0] as PortableTextCodeBlock;
    expect(codeBlock._type).toBe("codeBlock");
    expect(codeBlock.language).toBe("ts");
    expect(codeBlock.code).toBe("const x = 1;\nconsole.log(x);");
  });

  it("handles a fenced code block with no language annotation", () => {
    const markdown = ["```", "plain code", "```"].join("\n");
    const items = markdownToPortableText(markdown);
    const codeBlock = items[0] as PortableTextCodeBlock;
    expect(codeBlock.language).toBeUndefined();
    expect(codeBlock.code).toBe("plain code");
  });

  it("parses inline **bold**, *italic*, and `code` marks into separate spans within one paragraph block", () => {
    const items = markdownToPortableText("متن با **پررنگ** و *ایتالیک* و `کد درون‌خطی` در یک خط.");
    const block = items[0] as PortableTextBlock;
    const bold = block.children.find((c) => c.marks.includes("strong"));
    const italic = block.children.find((c) => c.marks.includes("em"));
    const code = block.children.find((c) => c.marks.includes("code"));
    expect(bold?.text).toBe("پررنگ");
    expect(italic?.text).toBe("ایتالیک");
    expect(code?.text).toBe("کد درون‌خطی");
  });

  it("handles mixed content — heading, paragraph, list, quote, and code block in sequence — producing the correct block order", () => {
    const markdown = [
      "# مقدمه",
      "",
      "این یک پاراگراف با **تاکید** است.",
      "",
      "## نکات",
      "",
      "- نکته اول",
      "- نکته دوم",
      "",
      "> یک نقل‌قول مهم.",
      "",
      "```python",
      "print('done')",
      "```",
      "",
      "جمع‌بندی نهایی.",
    ].join("\n");

    const items = markdownToPortableText(markdown);
    const shapes = items.map((item) =>
      item._type === "block" ? `block:${item.style}${item.listItem ? `:${item.listItem}` : ""}` : "codeBlock"
    );

    expect(shapes).toEqual([
      "block:h1",
      "block:normal",
      "block:h2",
      "block:normal:bullet",
      "block:normal:bullet",
      "block:blockquote",
      "codeBlock",
      "block:normal",
    ]);
  });

  it("skips blank/whitespace-only lines without emitting empty blocks", () => {
    const items = markdownToPortableText("پاراگراف اول.\n\n\n\nپاراگراف دوم.");
    expect(items).toHaveLength(2);
  });
});
