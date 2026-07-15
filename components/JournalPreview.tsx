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

export default async function JournalPreview() {
  const notes = await client.fetch<ArticlePreview[]>(articlesQuery);

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
              }}
            >
              یادداشت‌هایی
              <br />
              برای کندتر فکر کردن.
            </h2>
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

        <div style={{ display: "grid", gap: 26 }}>
          {notes.map((item) => (
            <article
              key={item._id}
              style={{
                borderTop: "1px solid var(--border)",
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
