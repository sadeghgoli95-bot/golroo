import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { SanityClient } from "next-sanity";
import { SanityArticleRepository } from "./SanityArticleRepository";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";
import { DEFAULT_ARTICLE_AUTHOR } from "../constants";

function buildFakeClients(existingAuthorId: string | null) {
  const fetch = vi.fn().mockResolvedValue(existingAuthorId);
  const created = { _id: "new-author-id" };
  const create = vi.fn().mockImplementation((doc: { _type: string }) =>
    Promise.resolve(doc._type === "author" ? created : { ...doc, _id: "new-article-id" })
  );
  const set = vi.fn().mockReturnThis();
  const commit = vi.fn().mockResolvedValue({});
  const patch = vi.fn().mockReturnValue({ set, commit });

  const client = { fetch } as unknown as SanityClient;
  const writeClient = { create, patch } as unknown as SanityClient;

  return { client, writeClient, fetch, create, patch, set, commit };
}

describe("SanityArticleRepository author resolution (single central default, persisted as a real reference)", () => {
  beforeEach(() => {
    process.env.SANITY_API_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.SANITY_API_TOKEN;
    vi.restoreAllMocks();
  });

  it("reuses an existing author document found by name instead of creating a duplicate", async () => {
    const { client, writeClient, create } = buildFakeClients("existing-author-id");
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", authorName: DEFAULT_ARTICLE_AUTHOR });

    await repository.createDraft(article);

    const authorCreateCalls = create.mock.calls.filter(([doc]) => doc._type === "author");
    expect(authorCreateCalls).toHaveLength(0);

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].author).toEqual({ _type: "reference", _ref: "existing-author-id" });
  });

  it("creates a new author document when none exists yet, and references it on the article", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", authorName: DEFAULT_ARTICLE_AUTHOR });

    await repository.createDraft(article);

    const authorCreateCall = create.mock.calls.find(([doc]) => doc._type === "author");
    expect(authorCreateCall?.[0].name).toBe(DEFAULT_ARTICLE_AUTHOR);

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].author).toEqual({ _type: "reference", _ref: "new-author-id" });
  });

  it("resolves the central default author even when article.authorName is somehow null", async () => {
    const { client, writeClient, fetch } = buildFakeClients("existing-author-id");
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", authorName: null });

    await repository.createDraft(article);

    expect(fetch).toHaveBeenCalledWith(expect.anything(), { name: DEFAULT_ARTICLE_AUTHOR });
  });
});
