import { siteConfig, sameAs } from "@/lib/siteConfig";

// Article, BreadcrumbList, and FAQPage builders already live in
// components/Seo/JsonLd.tsx and are already wired into their respective
// pages (journal/[slug], Breadcrumb, faq). Re-exported here rather than
// redefined, so there is exactly one implementation of each schema type.
export {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  personJsonLd,
  speakableJsonLd,
  websiteJsonLd,
  type BreadcrumbItem,
} from "@/components/Seo/JsonLd";

export function professionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.person.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: siteConfig.person.image,
    telephone: siteConfig.contact.phones[0],
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressLocality: "تهران",
      addressCountry: "IR",
    },
    priceRange: "$$",
    sameAs,
  };
}
