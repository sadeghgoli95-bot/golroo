import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const sanityFetchMock = vi.fn();
const listAccessibleSitesMock = vi.fn();
const runReportMock = vi.fn();
const getLatestSnapshotMock = vi.fn();

vi.mock("@/sanity/lib/client", () => ({ client: { fetch: (...args: unknown[]) => sanityFetchMock(...args) } }));
vi.mock("@/lib/google/searchConsoleClient", () => ({ listAccessibleSites: () => listAccessibleSitesMock() }));
vi.mock("@/lib/google/ga4Client", () => ({ runReport: (...args: unknown[]) => runReportMock(...args) }));
vi.mock("@/lib/analytics/snapshot/SnapshotRepository", () => ({ getLatestSnapshot: () => getLatestSnapshotMock() }));

const ORIGINAL_ENV = { ...process.env };

describe("getSystemStatus", () => {
  beforeEach(() => {
    vi.resetModules();
    sanityFetchMock.mockReset().mockResolvedValue(1);
    listAccessibleSitesMock.mockReset().mockResolvedValue([{ siteUrl: "sc-domain:mirora.ir", permissionLevel: "siteFullUser" }]);
    runReportMock.mockReset().mockResolvedValue([{ dimensions: {}, metrics: { activeUsers: 1 } }]);
    getLatestSnapshotMock.mockReset().mockResolvedValue(null);
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SANITY_PROJECT_ID: "proj",
      NEXT_PUBLIC_SANITY_DATASET: "production",
      GOOGLE_SERVICE_ACCOUNT_KEY: "./credentials/key.json",
      GSC_SITE_URL: "sc-domain:mirora.ir",
      GA4_PROPERTY_ID: "123",
    };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("reports GSC connected when the target site is in the accessible-sites list", async () => {
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    const gsc = status.find((item) => item.label === "Google Search Console");
    expect(gsc?.status).toBe("connected");
  });

  it("reports GSC not_configured with the real error when the API call throws", async () => {
    listAccessibleSitesMock.mockReset().mockRejectedValue(new Error("403 Forbidden"));
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    const gsc = status.find((item) => item.label === "Google Search Console");
    expect(gsc?.status).toBe("not_configured");
    expect(gsc?.detail).toContain("403 Forbidden");
  });

  it("reports GSC not_configured when the service account has no access to the configured site", async () => {
    listAccessibleSitesMock.mockReset().mockResolvedValue([{ siteUrl: "sc-domain:other.com", permissionLevel: "siteFullUser" }]);
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    const gsc = status.find((item) => item.label === "Google Search Console");
    expect(gsc?.status).toBe("not_configured");
  });

  it("reports GA4 connected on a successful runReport call", async () => {
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    const ga4 = status.find((item) => item.label === "Google Analytics 4");
    expect(ga4?.status).toBe("connected");
  });

  it("reports GA4 not_configured with the real error on failure", async () => {
    runReportMock.mockReset().mockRejectedValue(new Error("insufficient permissions"));
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    const ga4 = status.find((item) => item.label === "Google Analytics 4");
    expect(ga4?.status).toBe("not_configured");
    expect(ga4?.detail).toContain("insufficient permissions");
  });

  it("reports not_configured (no live call attempted) when env vars are missing, for both GSC and GA4", async () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY = "";
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    expect(status.find((i) => i.label === "Google Search Console")?.status).toBe("not_configured");
    expect(status.find((i) => i.label === "Google Analytics 4")?.status).toBe("not_configured");
    expect(listAccessibleSitesMock).not.toHaveBeenCalled();
    expect(runReportMock).not.toHaveBeenCalled();
  });

  it("always reports Microsoft Clarity as not_configured — no integration exists in this codebase", async () => {
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    expect(status.find((i) => i.label === "Microsoft Clarity")?.status).toBe("not_configured");
  });

  it("attaches lastSyncedAt from the most recent snapshot to the GA4/GSC rows", async () => {
    getLatestSnapshotMock.mockReset().mockResolvedValue({ timestamp: "2026-07-20T00:00:00.000Z" });
    const { getSystemStatus } = await import("./getSystemStatus");
    const status = await getSystemStatus();
    expect(status.find((i) => i.label === "Google Analytics 4")?.lastSyncedAt).toBe("2026-07-20T00:00:00.000Z");
  });

  it("real-Sanity-fetches to confirm Sanity read access rather than only checking env presence", async () => {
    const { getSystemStatus } = await import("./getSystemStatus");
    await getSystemStatus();
    expect(sanityFetchMock).toHaveBeenCalled();
  });
});
