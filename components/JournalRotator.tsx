"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import { client } from "@/sanity/lib/client";
import { articlesQuery } from "@/sanity/lib/queries";
import type { ArticlePreview } from "./Journal/JournalCard";
import { normalizePersianText } from "@/lib/utils/textNormalize";
import useReducedMotion from "@/hooks/useReducedMotion";

type Article = ArticlePreview & { _id: string };

const VISIBLE_COUNT = 3;
const ROTATE_INTERVAL_MS = 5000;
const EXIT_DURATION_MS = 350;
const TOUCH_RESUME_DELAY_MS = 3000;
const ROW_STAGGER_MS = 70;

// There's no view/analytics tracking in this codebase, so "most-read" is
// approximated with a recency-tier proxy (newest / mid / older) rather than
// real read counts — see the weighting comment below.
function weightedPool(articles: Article[]) {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );
  const n = sorted.length;
  const newestCount = Math.max(1, Math.ceil(n * 0.34));
  const midCount = Math.max(1, Math.ceil(n * 0.33));

  return sorted.map((article, i) => {
    let weight: number;
    if (i < newestCount) {
      weight = 0.5 / newestCount; // newest ~50%
    } else if (i < newestCount + midCount) {
      weight = 0.3 / midCount; // "most-read" proxy ~30%
    } else {
      weight = 0.2 / Math.max(1, n - newestCount - midCount); // archive ~20%
    }
    return { article, weight };
  });
}

function weightedSample(weighted: { article: Article; weight: number }[], count: number): Article[] {
  const pool = [...weighted];
  const picked: Article[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const total = pool.reduce((sum, w) => sum + w.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      r -= pool[idx].weight;
      if (r <= 0) break;
    }
    picked.push(pool[idx].article);
    pool.splice(idx, 1);
  }
  return picked;
}

function sameSet(a: Article[], b: Set<string>): boolean {
  if (a.length !== b.size) return false;
  return a.every((article) => b.has(article._id));
}

/**
 * A stable selection per interval (not a reshuffle every render), biased
 * toward recent articles, that avoids repeating the exact previous set —
 * see the module comment on weightedPool for what "most-read" approximates.
 */
function pickVisible(articles: Article[], previousIds: Set<string>): Article[] {
  if (articles.length <= VISIBLE_COUNT) return articles;

  const weighted = weightedPool(articles);
  let picked = weightedSample(weighted, VISIBLE_COUNT);
  let tries = 0;
  while (sameSet(picked, previousIds) && tries < 5) {
    picked = weightedSample(weighted, VISIBLE_COUNT);
    tries++;
  }
  return picked;
}

function categoryLabel(article: Article): string {
  const raw = (typeof article.category === "string" ? article.category : article.category?.title) || article.topic || "";
  return normalizePersianText(raw);
}

function metaLabel(article: Article): string {
  const parts: string[] = [];
  if (article.readingTime) parts.push(`${article.readingTime} دقیقه مطالعه`);
  if (article.publishedAt) parts.push(new Date(article.publishedAt).toLocaleDateString("fa-IR"));
  return parts.join(" · ");
}

export default function JournalRotator() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayed, setDisplayed] = useState<Article[]>([]);
  const [entered, setEntered] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const previousIdsRef = useRef<Set<string>>(new Set());
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetched once on mount — rotation afterward only re-samples this
  // already-fetched array locally, it never re-queries Sanity.
  useEffect(() => {
    client.fetch<Article[]>(articlesQuery).then((data) => {
      setArticles(data);
      const initial = pickVisible(data, new Set());
      previousIdsRef.current = new Set(initial.map((a) => a._id));
      setDisplayed(initial);
    });
  }, []);

  const rotate = useCallback(() => {
    if (reducedMotion) {
      setArticles((current) => {
        const next = pickVisible(current, previousIdsRef.current);
        previousIdsRef.current = new Set(next.map((a) => a._id));
        setDisplayed(next);
        return current;
      });
      return;
    }

    setEntered(false); // trigger fade-out + subtle horizontal displacement

    exitTimeoutRef.current = setTimeout(() => {
      setArticles((current) => {
        const next = pickVisible(current, previousIdsRef.current);
        previousIdsRef.current = new Set(next.map((a) => a._id));
        setDisplayed(next);
        return current;
      });

      // Two rAFs: let the new (offset) rows paint once before animating
      // them back to their resting position, so the browser doesn't
      // collapse the transition into a no-op.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
    }, EXIT_DURATION_MS);
  }, [reducedMotion]);

  useEffect(() => {
    if (isPaused || articles.length === 0) return;
    const id = setInterval(rotate, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isPaused, articles, rotate]);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  const handleTouchStart = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), TOUCH_RESUME_DELAY_MS);
  };

  return (
    <section className="section journal-editorial" style={{ background: "var(--surface)" }}>
      <Container>
        <div className="journal-editorial-header">
          <div>
            <p className="overline">JOURNAL</p>
            <h2 className="journal-editorial-title">
              اگر قرار باشد فقط یک بخش از این سایت را بخوانید،
              <br className="hero-break" />
              از اینجا شروع کنید.
            </h2>
          </div>

          <Link href="/journal" className="btn-text journal-editorial-link">
            مشاهده همه یادداشت‌ها
          </Link>
        </div>

        <div
          className="journal-rotator-list"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {displayed.map((article, index) => {
            const slug = typeof article.slug === "string" ? article.slug : article.slug.current;
            const title = normalizePersianText(article.title);
            const excerpt = normalizePersianText(article.excerpt);
            const category = categoryLabel(article);
            const meta = metaLabel(article);

            return (
              <Link
                key={article._id}
                href={`/journal/${slug}`}
                className="journal-row"
                style={
                  reducedMotion
                    ? undefined
                    : {
                        opacity: entered ? 1 : 0,
                        transform: entered ? "translateX(0)" : "translateX(12px)",
                        transitionDelay: entered ? `${index * ROW_STAGGER_MS}ms` : "0ms",
                      }
                }
              >
                <div className="journal-row-meta">
                  {category && <span className="journal-row-topic">{category}</span>}
                  {meta && <span className="journal-row-date">{meta}</span>}
                </div>
                <div className="journal-row-body">
                  <h3 className="journal-row-title">{title}</h3>
                  {excerpt && <p className="journal-row-excerpt">{excerpt}</p>}
                </div>
                <span className="journal-row-arrow" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
