import type { TocNode } from "@/lib/content-pipeline/tableOfContents";

type Props = {
  items: TocNode[];
};

function TocList({ items }: Props) {
  return (
    <ol className="article-toc-list">
      {items.map((item) => (
        <li key={item.slug}>
          <a href={`#${item.slug}`}>{item.text}</a>
          {item.children.length > 0 && <TocList items={item.children} />}
        </li>
      ))}
    </ol>
  );
}

export default function ArticleToc({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav className="article-toc" aria-label="فهرست مطالب">
      <p className="article-toc-title">فهرست مطالب</p>
      <TocList items={items} />
    </nav>
  );
}
