import Link from "next/link";
import Container from "./Container";

const services = [
  {
    age: "۰ تا ۴ سال",
    title: "روان‌درمانی کودک و کار با والدین",
    summary: "توجه به رابطه کودک و والد، تنظیم هیجانی و نگرانی‌های دوران اولیه رشد.",
  },
  {
    age: "۴ تا ۸ سال",
    title: "روان‌درمانی کودک و مشاوره والدین",
    summary: "فهم دشواری‌های هیجانی و رفتاری کودک از خلال بازی، رفتار و رابطه.",
  },
  {
    age: "۸ تا ۱۴ سال",
    title: "روان‌درمانی کودک و نوجوان و مشاوره والدین",
    summary: "فضایی برای فهم تجربه درونی نوجوان و رابطه او با خانواده و محیط.",
  },
];

export default function ServicesPreview() {
  return (
    <section className="section" style={{ background: "var(--bg-soft)" }}>
      <Container>
        <p className="overline" style={{ marginBottom: "var(--space-2)" }}>
          SERVICES
        </p>
        <h2 style={{ fontSize: "clamp(2.4rem,4.5vw,3.6rem)", fontWeight: 300, lineHeight: 1.6, marginBottom: "var(--space-5)" }}>
          خدمات
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))",
            gap: "2rem",
          }}
        >
          {services.map((service) => (
            <article key={service.age} className="card card-static">
              <div style={{ color: "var(--bronze)", fontSize: 14, marginBottom: 20 }}>{service.age}</div>
              <h3 style={{ fontSize: 22, fontWeight: 300, marginBottom: 14, lineHeight: 1.7 }}>{service.title}</h3>
              <p style={{ lineHeight: 1.9, color: "var(--text-muted)", marginBottom: "1.6rem" }}>{service.summary}</p>
              <Link href="/about" className="card-link">
                مشاهده جزئیات
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
