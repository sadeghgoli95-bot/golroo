import { describe, expect, it, vi, beforeEach } from "vitest";

const getAllArticlesMock = vi.fn();

vi.mock("@/lib/article/getAllArticles", () => ({ getAllArticles: (repository: unknown) => getAllArticlesMock(repository) }));

describe("getSiteAnalysis caching (Phase 1 Part 7 — single analysis execution, reused across pages)", () => {
  beforeEach(() => {
    vi.resetModules();
    getAllArticlesMock.mockReset().mockResolvedValue([]);
  });

  it("computes the corpus only once across repeated calls within the cache TTL", async () => {
    const { getSiteAnalysis } = await import("./getSiteAnalysis");
    const repository = {} as never;

    await getSiteAnalysis(repository);
    await getSiteAnalysis(repository);
    await getSiteAnalysis(repository);

    expect(getAllArticlesMock).toHaveBeenCalledTimes(1);
  });

  it("returns the same result object identity on a cache hit", async () => {
    const { getSiteAnalysis } = await import("./getSiteAnalysis");
    const repository = {} as never;

    const first = await getSiteAnalysis(repository);
    const second = await getSiteAnalysis(repository);

    expect(second).toBe(first);
  });
});
