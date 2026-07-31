// Single source of truth for the site's canonical production URL and name.
// mirora.ir is the real, live custom domain — matches every existing
// canonical/OpenGraph URL already in the codebase (layout.tsx,
// siteConfig.ts, per-page metadata). "Mirora" is only ever the domain;
// it is never the brand, organization, or on-site identity.
// lib/siteConfig.ts derives from this file, not the other way around, so
// there is exactly one place this value is declared.
export const SITE_URL = "https://mirora.ir";

// SITE_NAME is the site/brand identity shown everywhere — page titles,
// OG brand text, and JSON-LD Organization/publisher (see
// ORGANIZATION_NAME below, which is the same brand, not a separate one).
export const SITE_NAME = "گل‌رو";

// The Organization entity for JSON-LD (publisher, organizationJsonLd),
// distinct from the therapist's personal identity (siteConfig.person.name
// = "محمد صادق گل‌رو"). This is the same برند as SITE_NAME — kept as its
// own export because schema builders import it directly — never "میرورا"
// (that word names only the domain, mirora.ir).
export const ORGANIZATION_NAME = SITE_NAME;

// Final fallback OpenGraph/Twitter image for any route with no more
// specific image (article SEO image / featured image take priority where
// applicable). Never the Hero image — this is a dedicated 1200-class OG
// asset at public/og/golroo-og.webp.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/golroo-og.webp`;
