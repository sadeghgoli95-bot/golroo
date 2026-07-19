export type CoreWebVitals = {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  fcp: number | null;
  ttfb: number | null;
};

export type PerformanceMetrics = {
  coreWebVitals: CoreWebVitals;
  largestImageBytes: number | null;
  largestJsBytes: number | null;
  largestCssBytes: number | null;
  bundleSizeBytes: number | null;
};
