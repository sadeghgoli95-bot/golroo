// Single source of truth for the site's canonical production URL and name.
// mirora.ir is the real, live custom domain as of the Mirora domain
// migration — matches every existing canonical/OpenGraph URL already in
// the codebase (layout.tsx, siteConfig.ts, per-page metadata).
// lib/siteConfig.ts derives from this file, not the other way around, so
// there is exactly one place this value is declared.
export const SITE_URL = "https://mirora.ir";

// SITE_NAME stays "گل‌رو" — the visible page-title/OG brand text is
// unchanged by design (see ORGANIZATION_NAME below for the umbrella
// platform brand used only in JSON-LD Organization/publisher entities).
export const SITE_NAME = "گل‌رو";

// The clinic/platform brand, distinct from the therapist's personal
// identity (siteConfig.person.name = "محمد صادق گل‌رو"). Used only where
// schema.org expects a genuine Organization — the Person entity must
// never be renamed to this.
export const ORGANIZATION_NAME = "میرورا";
