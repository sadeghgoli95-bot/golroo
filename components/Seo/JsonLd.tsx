import { siteConfig, sameAs } from "@/lib/siteConfig";
import { ORGANIZATION_NAME } from "@/lib/seo/site";
import { resolveAuthorName } from "@/lib/article/constants";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION_NAME,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.ico`,
    sameAs,
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.person.name,
    jobTitle: siteConfig.person.jobTitle,
    url: siteConfig.url,
    image: siteConfig.person.image,
    sameAs,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export type BreadcrumbItem = { name: string; url: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  authorName?: string;
  publishedAt?: string;
  modifiedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image,
    // Falls back to the single central article-author default (see
    // lib/article/constants.ts), not siteConfig.person.name — that's the
    // therapist's full legal name used for the site's Person/
    // ProfessionalService schema, a different value that was previously
    // (wrongly) reused here as the article-author fallback.
    author: { "@type": "Person", name: resolveAuthorName(article.authorName) },
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    mainEntityOfPage: article.url,
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION_NAME,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/favicon.ico` },
    },
  };
}

/**
 * cssSelector defaults to the real classNames the article page uses for
 * headline/lead (see components/Article/ArticleHeader.tsx: h1.display,
 * p.lead) — not placeholder selectors.
 */
export function speakableJsonLd(url: string, cssSelectors: string[] = [".display", ".lead"]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors,
    },
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
