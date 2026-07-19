/** Every threshold this pipeline's readiness gate uses, in one place — no magic numbers at call sites. */
export const READY_MIN_SEO_SCORE = 70;
export const READY_MIN_AEO_SCORE = 60;
export const READY_MIN_GEO_SCORE = 60;

export const ALMOST_READY_MIN_SEO_SCORE = 50;
export const ALMOST_READY_MIN_AEO_SCORE = 40;
export const ALMOST_READY_MIN_GEO_SCORE = 40;

/** analyzeDuplicateContent match types severe enough to block publishing outright. */
export const BLOCKING_DUPLICATE_MATCH_TYPES = ["exact", "slug", "title"] as const;
