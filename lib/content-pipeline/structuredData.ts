import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, speakableJsonLd } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/seo/site";
import type { Article } from "@/lib/article/types";

export type StructuredData = {
  article: ReturnType<typeof articleJsonLd>;
  faq: ReturnType<typeof faqPageJsonLd> | null;
  breadcrumb: ReturnType<typeof breadcrumbJsonLd> | null;
  organization: ReturnType<typeof organizationJsonLd>;
  speakable: ReturnType<typeof speakableJsonLd> | null;
};

/**
 * Always generated automatically from the already-parsed article —
 * the current import format never asks the writer to hand-author
 * schema. Reuses the site's single JSON-LD implementation
 * (lib/seo/schema.ts) rather than building a second one. Breadcrumb
 * mirrors the real breadcrumb trail rendered on the article page
 * (app/journal/[slug]/page.tsx: خانه > ژورنال > article title).
 */
export function buildStructuredData(article: Article): StructuredData {
  return {
    article: articleJsonLd({
      title: article.title ?? "",
      description: article.metaDescription ?? article.excerpt ?? undefined,
      url: article.canonicalUrl ?? "",
      authorName: article.authorName ?? undefined,
    }),
    faq: article.faq.length > 0 ? faqPageJsonLd(article.faq) : null,
    breadcrumb:
      article.canonicalUrl && article.title
        ? breadcrumbJsonLd([
            { name: "خانه", url: SITE_URL },
            { name: "ژورنال", url: `${SITE_URL}/journal` },
            { name: article.title, url: article.canonicalUrl },
          ])
        : null,
    organization: organizationJsonLd(),
    speakable: article.canonicalUrl && article.excerpt ? speakableJsonLd(article.canonicalUrl) : null,
  };
}
