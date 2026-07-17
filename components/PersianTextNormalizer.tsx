"use client";

import { useEffect } from "react";
import { stripInvisibleArtifacts } from "@/lib/utils/textNormalize";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "NOSCRIPT"]);
const PERSIAN_RANGE = /[؀-ۿ]/;

/**
 * Global, non-manual safety net for static/hardcoded Persian copy (nav,
 * footer, headings, buttons, etc). Runs once after hydration and walks
 * text nodes, fixing invisible-character/glyph-variant issues in place —
 * it never trims or collapses whitespace, so it's safe to run on
 * React-fragmented text nodes without risking words running together.
 * CMS content is normalized separately (and more thoroughly) at the data
 * layer — see lib/utils/textNormalize.ts.
 */
export default function PersianTextNormalizer() {
  useEffect(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = (node as Text).parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const node of nodes) {
      const value = node.nodeValue;
      if (!value || !PERSIAN_RANGE.test(value)) continue;
      const fixed = stripInvisibleArtifacts(value);
      if (fixed !== value) node.nodeValue = fixed;
    }
  }, []);

  return null;
}
