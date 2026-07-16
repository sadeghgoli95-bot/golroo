"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  slug: { current: string };
};

type Props = {
  faqs: FaqItem[];
};

function findFaqByHash(faqs: FaqItem[]): FaqItem | undefined {
  if (typeof window === "undefined") return undefined;
  const hash = window.location.hash.replace("#", "");
  if (!hash) return undefined;
  return faqs.find((faq) => faq.slug.current === hash);
}

export default function FaqAccordionList({ faqs }: Props) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(() => findFaqByHash(faqs)?._id ?? null);

  useEffect(() => {
    // Scroll the deep-linked question into view once, on mount.
    const match = findFaqByHash(faqs);
    if (!match) return;
    requestAnimationFrame(() => {
      document.getElementById(match.slug.current)?.scrollIntoView({ block: "center" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return faqs;
    return faqs.filter(
      (faq) => faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)
    );
  }, [faqs, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const faq of filtered) {
      const key = faq.category || "سایر";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(faq);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const hasCategories = faqs.some((faq) => faq.category);

  return (
    <div>
      <div style={{ marginBottom: "3rem" }}>
        <input
          type="text"
          className="faq-search-input"
          placeholder="جستجو در پرسش‌ها..."
          aria-label="جستجو در پرسش‌های متداول"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="body-lg" style={{ color: "var(--text)" }}>
            پرسشی با این عبارت پیدا نشد.
          </p>
          <Link href="/contact" className="button button-primary">
            تماس با من
          </Link>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <section key={category} aria-labelledby={hasCategories ? `faq-cat-${category}` : undefined}>
            {hasCategories && (
              <h2 id={`faq-cat-${category}`} className="faq-category-title">
                {category}
              </h2>
            )}
            <div>
              {items.map((faq) => {
                const isOpen = openId === faq._id;
                return (
                  <div
                    key={faq._id}
                    id={faq.slug.current}
                    className="faq-entry"
                    data-open={isOpen}
                  >
                    <h3 style={{ margin: 0 }}>
                      <button
                        type="button"
                        className="faq-question-btn"
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${faq._id}`}
                        onClick={() => setOpenId(isOpen ? null : faq._id)}
                      >
                        <span>{faq.question}</span>
                        <span className="faq-question-icon" aria-hidden="true">
                          +
                        </span>
                      </button>
                    </h3>
                    <div className="faq-answer-wrapper">
                      <div className="faq-answer-inner">
                        <p id={`faq-answer-${faq._id}`}>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
