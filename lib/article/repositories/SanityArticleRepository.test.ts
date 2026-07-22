import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { SanityClient } from "next-sanity";
import { SanityArticleRepository } from "./SanityArticleRepository";
import { buildTestArticle } from "@/lib/content-analysis/testFixtures";
import { DEFAULT_ARTICLE_AUTHOR } from "../constants";

function buildFakeClients(existingId: string | null) {
  const fetch = vi.fn().mockResolvedValue(existingId);
  const create = vi.fn().mockImplementation((doc: { _type: string }) =>
    Promise.resolve(
      doc._type === "article" ? { ...doc, _id: "new-article-id" } : { _id: `new-${doc._type}-id` }
    )
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

describe("SanityArticleRepository — schema/importer field sync (category, tags, faq, sources, readingTime, focusKeyword)", () => {
  beforeEach(() => {
    process.env.SANITY_API_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.SANITY_API_TOKEN;
    vi.restoreAllMocks();
  });

  it("resolves category as a reference (find-or-create), never sends it as a plain string", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", category: "روان‌شناسی کودک" });

    await repository.createDraft(article);

    const categoryCreateCall = create.mock.calls.find(([doc]) => doc._type === "category");
    expect(categoryCreateCall?.[0].title).toBe("روان‌شناسی کودک");

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].category).toEqual({ _type: "reference", _ref: "new-category-id" });
  });

  it("reuses an existing category document by title instead of creating a duplicate", async () => {
    const { client, writeClient, create } = buildFakeClients("existing-category-id");
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", category: "روان‌شناسی کودک" });

    await repository.createDraft(article);

    expect(create.mock.calls.some(([doc]) => doc._type === "category")).toBe(false);
    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].category).toEqual({ _type: "reference", _ref: "existing-category-id" });
  });

  it("omits category entirely when the article has no category (never sends a null reference)", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", category: null });

    await repository.createDraft(article);

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0]).not.toHaveProperty("category");
  });

  it("resolves each tag as its own reference, deduplicated, never as plain strings", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({ title: "عنوان", slug: "test-slug", tags: ["اضطراب", "کودک", "اضطراب"] });

    await repository.createDraft(article);

    const tagCreateCalls = create.mock.calls.filter(([doc]) => doc._type === "tag");
    expect(tagCreateCalls).toHaveLength(2);

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].tags).toEqual([
      { _type: "reference", _ref: "new-tag-id" },
      { _type: "reference", _ref: "new-tag-id" },
    ]);
  });

  it("resolves FAQ items as faq document references, matched by question text", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({
      title: "عنوان",
      slug: "test-slug",
      faq: [{ question: "سوال اول؟", answer: "پاسخ اول." }],
    });

    await repository.createDraft(article);

    const faqCreateCall = create.mock.calls.find(([doc]) => doc._type === "faq");
    expect(faqCreateCall?.[0]).toMatchObject({ question: "سوال اول؟", answer: "پاسخ اول." });

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].faq).toEqual([{ _type: "reference", _ref: "new-faq-id" }]);
  });

  it("resolves sources as source document references, carrying doi/url/year through to the created document", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({
      title: "عنوان",
      slug: "test-slug",
      sources: [
        { doi: "10.1234/example", pmid: null, url: "https://apa.org/source", author: null, journal: null, year: "2020", title: "عنوان منبع" },
      ],
    });

    await repository.createDraft(article);

    const sourceCreateCall = create.mock.calls.find(([doc]) => doc._type === "source");
    expect(sourceCreateCall?.[0]).toMatchObject({
      title: "عنوان منبع",
      doi: "10.1234/example",
      url: "https://apa.org/source",
      year: 2020,
    });

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].sources).toEqual([{ _type: "reference", _ref: "new-source-id" }]);
  });

  it("falls back to url/doi/author when a source has no title, rather than sending an invalid document", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({
      title: "عنوان",
      slug: "test-slug",
      sources: [{ doi: null, pmid: null, url: "https://apa.org/source", author: null, journal: null, year: null, title: null }],
    });

    await repository.createDraft(article);

    const sourceCreateCall = create.mock.calls.find(([doc]) => doc._type === "source");
    expect(sourceCreateCall?.[0].title).toBe("https://apa.org/source");
  });

  it("sends readingTime and focusKeyword as plain scalar values (no reference resolution needed)", async () => {
    const { client, writeClient, create } = buildFakeClients(null);
    const repository = new SanityArticleRepository(client, writeClient);
    const article = buildTestArticle({
      title: "عنوان",
      slug: "test-slug",
      readingTime: 4,
      focusKeyword: "اضطراب کودکان",
    });

    await repository.createDraft(article);

    const articleCreateCall = create.mock.calls.find(([doc]) => doc._type === "article");
    expect(articleCreateCall?.[0].readingTime).toBe(4);
    expect(articleCreateCall?.[0].seo.focusKeyword).toBe("اضطراب کودکان");
  });
});
