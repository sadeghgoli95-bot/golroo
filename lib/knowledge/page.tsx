import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { topics } from "@/data/topics";
import Link from "next/link";

export default function Knowledge() {
  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <p className="overline">KNOWLEDGE CENTER</p>
            <h1 className="display">مرکز دانش</h1>
            <p className="lead">
              مقاله‌ها، مشاهده‌ها و یادداشت‌هایی درباره رشد، رابطه و تجربه کودک.
            </p>
          </div>
        </section>
        <section>
          <div className="container">
            <div className="grid-3">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/knowledge/${topic.slug}`}
                  className="card"
                >
                  <h2 className="card-title">{topic.title}</h2>
                  <p className="card-text">{topic.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
