import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
import { getGa4PropertyId } from "./config";

export type Ga4Row = {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
};

export type Ga4ReportQuery = {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  metrics: string[];
  limit?: number;
};

/**
 * Thin, real wrapper around the GA4 Data API's runReport — maps the
 * generic header/row-index response shape into named dimensions/metrics
 * per row so callers never index into dimensionValues[]/metricValues[]
 * by position. No business logic (comparisons, breakdowns) lives here —
 * see lib/analytics/traffic/googleAnalyticsAdapter.ts.
 */
export async function runReport(query: Ga4ReportQuery): Promise<Ga4Row[]> {
  const propertyId = getGa4PropertyId();
  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID is not configured — GA4 integration is unavailable");
  }

  const analyticsdata = google.analyticsdata({ version: "v1beta", auth: getGoogleAuth() });
  const response = await analyticsdata.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: query.startDate, endDate: query.endDate }],
      dimensions: query.dimensions?.map((name) => ({ name })),
      metrics: query.metrics.map((name) => ({ name })),
      limit: query.limit ? String(query.limit) : undefined,
    },
  });

  const dimensionNames = (response.data.dimensionHeaders ?? []).map((header) => header.name ?? "");
  const metricNames = (response.data.metricHeaders ?? []).map((header) => header.name ?? "");

  return (response.data.rows ?? []).map((row) => {
    const dimensions: Record<string, string> = {};
    (row.dimensionValues ?? []).forEach((value, index) => {
      dimensions[dimensionNames[index]] = value.value ?? "";
    });

    const metrics: Record<string, number> = {};
    (row.metricValues ?? []).forEach((value, index) => {
      metrics[metricNames[index]] = Number(value.value ?? 0);
    });

    return { dimensions, metrics };
  });
}
