import Link from "next/link";
import { JsonLd, breadcrumbJsonLd, type BreadcrumbItem } from "@/components/Seo/JsonLd";
import { siteConfig } from "@/lib/siteConfig";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
};

export default function Breadcrumb({ items }: Props) {
  const jsonLdItems: BreadcrumbItem[] = items.map((item) => ({
    name: item.label,
    url: item.href ? `${siteConfig.url}${item.href}` : siteConfig.url,
  }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(jsonLdItems)} />
      <nav aria-label="Breadcrumb" className="breadcrumb" style={{ marginBottom: "2.5rem" }}>
        <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: ".6rem", listStyle: "none", padding: 0, margin: 0 }}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.label} style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                {index > 0 && <span className="breadcrumb-sep" aria-hidden="true">←</span>}
                {!isLast && item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
