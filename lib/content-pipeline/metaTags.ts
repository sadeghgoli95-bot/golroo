import type { Article } from "@/lib/article/types";

export type MetaTagsPreview = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string | null;
    description: string | null;
    type: "article";
    url: string | null;
  };
  twitterCard: {
    card: "summary_large_image";
    title: string | null;
    description: string | null;
  };
};

/**
 * Previews exactly what app/journal/[slug]/page.tsx's generateMetadata
 * will render once this article is saved to Sanity — same fallback
 * chain (Sanity seo.metaTitle/seo.metaDescription -> article title/
 * excerpt; Twitter falls back to the OG values), so the dashboard can
 * show the writer real Open Graph / Twitter Card output before publish,
 * not a second, divergent implementation. seo.ogImage/twitterTitle/
 * twitterDescription/noIndex are Sanity-only fields with no import-time
 * equivalent (image selection is manual; title/description overrides
 * are optional refinements a writer adds later in Studio, not required
 * at import), so this always reflects the no-override default path.
 */
export function buildMetaTagsPreview(article: Article): MetaTagsPreview {
  const title = article.title;
  const description = article.metaDescription ?? article.excerpt;

  return {
    title,
    description,
    canonicalUrl: article.canonicalUrl,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      url: article.canonicalUrl,
    },
    twitterCard: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
