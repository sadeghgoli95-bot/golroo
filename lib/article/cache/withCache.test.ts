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
});
