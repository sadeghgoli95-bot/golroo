import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/writeClient";
import type { Article, ArticleSummary } from "../types";
import type { ArticleRepository } from "../repository";
import { createMemoryCache } from "../cache";
import { SanityArticleRepository } from "./SanityArticleRepository";
import { MemoryArticleRepository } from "./MemoryArticleRepository";
import { CachedArticleRepository } from "./CachedArticleRepository";

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Environment decides the repository; no caller ever constructs one
 * directly. Development uses an empty MemoryArticleRepository (no Sanity
 * write token exists in this project yet, so there's nothing for a real
 * dev-mode CMS repository to authenticate with) — production wires the
 * real chain: Sanity -> Cached.
 */
export function createArticleRepository(): ArticleRepository {
  if (process.env.NODE_ENV !== "production") {
    return new MemoryArticleRepository();
  }

  const sanityRepository = new SanityArticleRepository(client, writeClient);
  const articleCache = createMemoryCache<Article | null>(DEFAULT_CACHE_TTL_MS);
  const listCache = createMemoryCache<ArticleSummary[]>(DEFAULT_CACHE_TTL_MS);

  return new CachedArticleRepository(sanityRepository, articleCache, listCache);
}
