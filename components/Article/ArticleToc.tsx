"use client";

import { useEffect, useRef, useState } from "react";
import type { TocNode } from "@/lib/content-pipeline/tableOfContents";

type Props = {
  items: TocNode[];
};

function flattenSlugs(items: TocNode[]): string[] {
  return items.flatMap((item) => [item.slug, ...flattenSlugs(item.children)]);
}

function TocList({ items, activeSlug }: Props & { activeSlug: string | null }) {
  return (
    <ol className="article-toc-list">
      {items.map((item) => (
        <li key={item.slug}>
          <a href={`#${item.slug}`} aria-current={activeSlug === item.slug ? "location" : undefined}>
            {item.text}
          </a>
          {item.children.length > 0 && <TocList items={item.children} activeSlug={activeSlug} />}
        </li>
      ))}
    </ol>
  );
}

export default function ArticleToc({ items }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const slugsRef = useRef<string[]>([]);
  slugsRef.current = flattenSlugs(items);

  useEffect(() => {
    const slugs = slugsRef.current;
    if (slugs.length === 0) return;

    const headings = slugs
      .map((slug) => document.getElementById(slug))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveSlug(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="article-toc" aria-label="فهرست مطالب">
      <p className="article-toc-title">فهرست مطالب</p>
      <TocList items={items} activeSlug={activeSlug} />
    </nav>
  );
}
