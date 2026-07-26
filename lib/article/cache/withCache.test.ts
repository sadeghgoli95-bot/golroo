import { describe, expect, it, vi } from "vitest";
import { withCache } from "./withCache";
import { createMemoryCache } from "./createMemoryCache";

describe("withCache", () => {
  it("calls fetch on a cache miss and stores the result", async () => {
    const cache = createMemoryCache<number>(60_000);
    const fetch = vi.fn().mockResolvedValue(42);

    const result = await withCache(cache, "key", fetch);

    expect(result).toBe(42);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(cache.get("key")).toBe(42);
  });

  it("returns the cached value without calling fetch again on a hit", async () => {
    const cache = createMemoryCache<number>(60_000);
    const fetch = vi.fn().mockResolvedValue(42);

    await withCache(cache, "key", fetch);
    const second = await withCache(cache, "key", fetch);

    expect(second).toBe(42);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses separate cache entries per key", async () => {
    const cache = createMemoryCache<number>(60_000);
    await withCache(cache, "a", () => Promise.resolve(1));
    await withCache(cache, "b", () => Promise.resolve(2));

    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBe(2);
  });

  it("in-flight dedup: concurrent calls with the same cache+key share one fetch instead of firing two", async () => {
    const cache = createMemoryCache<number>(60_000);
    let resolveFetch!: (value: number) => void;
    const fetch = vi.fn(() => new Promise<number>((resolve) => { resolveFetch = resolve; }));

    const first = withCache(cache, "key", fetch);
    const second = withCache(cache, "key", fetch);

    expect(fetch).toHaveBeenCalledTimes(1);
    resolveFetch(42);

    expect(await first).toBe(42);
    expect(await second).toBe(42);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(cache.get("key")).toBe(42);
  });

  it("in-flight dedup is scoped per cache instance — two different caches with the same key never dedupe against each other", async () => {
    const cacheA = createMemoryCache<number>(60_000);
    const cacheB = createMemoryCache<number>(60_000);
    const fetchA = vi.fn().mockResolvedValue(1);
    const fetchB = vi.fn().mockResolvedValue(2);

    const [resultA, resultB] = await Promise.all([withCache(cacheA, "same-key", fetchA), withCache(cacheB, "same-key", fetchB)]);

    expect(resultA).toBe(1);
    expect(resultB).toBe(2);
    expect(fetchA).toHaveBeenCalledTimes(1);
    expect(fetchB).toHaveBeenCalledTimes(1);
  });

  it("clears the in-flight entry on rejection so a later call retries instead of hanging or replaying the error forever", async () => {
    const cache = createMemoryCache<number>(60_000);
    const fetch = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(7);

    await expect(withCache(cache, "key", fetch)).rejects.toThrow("boom");
    const result = await withCache(cache, "key", fetch);

    expect(result).toBe(7);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
