export type SeoIssues = {
  duplicateTitles: number;
  duplicateMeta: number;
  missingMeta: number;
  missingCanonical: number;
  brokenCanonical: number;
  schemaErrors: number;
  missingOpenGraph: number;
  missingTwitterCard: number;
  brokenImages: number;
  brokenLinks: number;
  redirectChains: number;
  notFoundCount: number;
  serverErrorCount: number;
  indexCoverage: number;
};
