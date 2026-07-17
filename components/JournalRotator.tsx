"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import { client } from "@/sanity/lib/client";
import { articlesQuery } from "@/sanity/lib/queries";
import JournalCard, { type ArticlePreview } from "./Journal/JournalCard";

type Article = ArticlePreview & { _id: string };

const VISIBLE_COUNT = 4;
const ROTATE_INTERVAL_MS = 10000;
const EXIT_DURATION_MS = 400;
const TOUCH_RESUME_DELAY_MS = 3000;
const CARD_STAGGER_MS = 80;

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

function pickFour(articles: Article[], previousIds: Set<string>): Article[] {
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

export default function JournalRotator() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayed, setDisplayed] = useState<Article[]>([]);
  const [entered, setEntered] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const previousIdsRef = useRef<Set<string>>(new Set());
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    client.fetch<Article[]>(articlesQuery).then((data) => {
      setArticles(data);
      const initial = pickFour(data, new Set());
      previousIdsRef.current = new Set(initial.map((a) => a._id));
      setDisplayed(initial);
    });
  }, []);

  const rotate = useCallback(() => {
    setEntered(false); // trigger fade-out + move-down

    exitTimeoutRef.current = setTimeout(() => {
      setArticles((current) => {
        const next = pickFour(current, previousIdsRef.current);
        previousIdsRef.current = new Set(next.map((a) => a._id));
        setDisplayed(next);
        return current;
      });

      // Two rAFs: let the new (offset) cards paint once before animating
      // them back to their resting position, so the browser doesn't
      // collapse the transition into a no-op.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
    }, EXIT_DURATION_MS);
  }, []);

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

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleTouchStart = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), TOUCH_RESUME_DELAY_MS);
  };

  return (
    <section
      className="section"
      style={{ background: "var(--bg-soft)" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: 70,
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                color: "var(--bronze)",
                fontSize: 13,
                letterSpacing: ".22em",
                marginBottom: 18,
              }}
            >
              JOURNAL
            </div>

            <h2
              style={{
                fontSize: "clamp(2.4rem,4vw,3.6rem)",
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: 780,
              }}
            >
              اگر قرار باشد فقط یک بخش از این سایت را بخوانید،
              <br />
              از اینجا شروع کنید.
            </h2>

            <p
              style={{
                marginTop: 24,
                maxWidth: 600,
                fontSize: 17,
                color: "var(--text-muted)",
                lineHeight: 2,
              }}
            >
              این نوشته‌ها حاصل سال‌ها مطالعه، تجربهٔ بالینی و فکر کردن به دنیای کودکان‌اند؛ برای والدینی که می‌خواهند فراتر از توصیه‌های آماده، فرزندشان را عمیق‌تر بفهمند.
            </p>
          </div>

          <Link
            href="/journal"
            style={{
              color: "var(--bronze)",
              fontSize: 16,
            }}
          >
            مشاهده همه یادداشت‌ها →
          </Link>
        </div>

        <div className="journal-rotator-grid">
          {displayed.map((article, index) => (
            <div
              key={article._id}
              className="journal-rotator-card-anim"
              style={{
                height: "100%",
                opacity: entered ? 1 : 0,
                transform: entered ? "translateY(0)" : "translateY(10px)",
                transitionDelay: entered ? `${index * CARD_STAGGER_MS}ms` : "0ms",
              }}
            >
              <JournalCard item={article} compact />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
