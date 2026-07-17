"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "./Container";
import { client } from "@/sanity/lib/client";
import { articlesQuery } from "@/sanity/lib/queries";

type ArticlePreview = {
  _id: string;
  topic: string;
  title: string;
  slug: { current: string };
};

function pickRandom(items: ArticlePreview[], count: number): ArticlePreview[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function JournalRotator() {
  const [notes, setNotes] = useState<ArticlePreview[]>([]);
  const [displayed, setDisplayed] = useState<ArticlePreview[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    client.fetch<ArticlePreview[]>(articlesQuery).then((data) => {
      setNotes(data);
      setDisplayed(pickRandom(data, 5));
    });
  }, []);

  useEffect(() => {
    if (notes.length === 0) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setDisplayed(pickRandom(notes, 5));
        setVisible(true);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [notes]);

  return (
    <section className="section" style={{ background: "var(--bg-soft)" }}>
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
              اگر قرار بود فقط یک بخش از این سایت را بخوانید، از اینجا شروع کنید.
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
            مشاهده همهٔ یادداشت‌ها →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gap: 26,
            opacity: visible ? 1 : 0,
            transition: "opacity 500ms",
          }}
        >
          {displayed.map((item) => (
            <article
              key={item._id}
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: "2.4rem",
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: "2rem",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  letterSpacing: ".15em",
                }}
              >
                {item.topic}
              </div>

              <Link
                href={`/journal/${item.slug.current}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <h3
                  style={{
                    fontSize: 29,
                    fontWeight: 300,
                    lineHeight: 1.9,
                  }}
                >
                  {item.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
