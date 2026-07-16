import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { topics } from "@/data/topics";
import { observations } from "@/data/observations";
import { journal } from "@/data/journal";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: { topic: string };
};

export function generateStaticParams() {
  return topics.map((t) => ({ topic: t.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const topic = topics.find((t) => t.slug === params.topic);
  return {
    title: topic ? `${topic.title} | گل‌رو` : "گل‌رو",
    description: topic?.description,
  };
}

export default function TopicPage({ params }: Props) {
  const topic = topics.find((t) => t.slug === params.topic);

  if (!topic) {
    return (
      <main className="editorial-space">
        <div className="container">
          <p className="lead">این موضوع پیدا نشد.</p>
        </div>
      </main>
    );
  }

  const relatedObservations = observations.filter((o) =>
    o.tags.includes(params.topic)
  );

  const relatedJournal = journal.filter((j) =>
    j.category.toLowerCase() === params.topic
  );

  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <Link href="/knowledge" className="overline" style={{ display: "block", marginBottom: "2rem" }}>
              ← مرکز دانش
            </Link>
            <h1 className="display">{topic.title}</h1>
            <p className="lead">{topic.description}</p>
          </div>
        </section>

        {relatedObservations.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="overline" style={{ marginBottom: "2rem" }}>مشاهده‌ها</p>
              <div className="grid-3">
                {relatedObservations.map((obs) => (
                  <article key={obs.id} className="card card-static">
                    <h3 className="card-title">{obs.title}</h3>
                    <p className="card-text">{obs.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedJournal.length > 0 && (
          <section className="section">
            <div className="container">
              <p className="overline" style={{ marginBottom: "2rem" }}>یادداشت‌ها</p>
              <div className="grid-3">
                {relatedJournal.map((item) => (
                  <article key={item.id} className="card card-static">
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-text">{item.excerpt}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {relatedObservations.length === 0 && relatedJournal.length === 0 && (
          <section className="section">
            <div className="container">
              <p className="lead">محتوایی برای این موضوع هنوز منتشر نشده است.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
