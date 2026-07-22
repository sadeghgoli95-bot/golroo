import { describe, expect, it } from "vitest";
import { escapeXml } from "./xml";

describe("escapeXml", () => {
  it("escapes the five XML special characters", () => {
    expect(escapeXml(`A & B < C > D "E" 'F'`)).toBe("A &amp; B &lt; C &gt; D &quot;E&quot; &apos;F&apos;");
  });

  it("leaves plain Persian text untouched", () => {
    expect(escapeXml("اضطراب کودکان")).toBe("اضطراب کودکان");
  });
});
