import Image from "next/image";
import type { PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import { slugify } from "@/lib/utils/slugify";
import PullQuote from "./PullQuote";

type HeadingValue = { children?: unknown[] };

// Same slugify as extractPortableTextHeadings.ts, applied to the same
// block's children — keeps rendered anchor ids in sync with the TOC's hrefs.
function headingId(value: HeadingValue): string {
  const text = (value.children ?? [])
    .map((span) => (typeof (span as { text?: unknown }).text === "string" ? (span as { text: string }).text : ""))
    .join("");
  return slugify(text);
}

export const articlePortableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children, value }) => <h2 id={headingId(value)}>{children}</h2>,
    h3: ({ children, value }) => <h3 id={headingId(value)}>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <PullQuote>{children}</PullQuote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href || "#";
      const isExternal = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => (
      <figure>
        <Image
          src={urlFor(value).width(1200).url()}
          alt={value.alt || ""}
          width={1200}
          height={800}
          style={{ width: "100%", height: "auto" }}
        />
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
    ),
    codeBlock: ({ value }) => (
      <pre>
        <code>{value.code}</code>
      </pre>
    ),
    break: () => <hr />,
  },
};
