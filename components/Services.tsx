import Container from "./Container";

const services = [
  {
    title: "روان‌درمانی کودک",
    age: "۳ تا ۱۲ سال",
    description:
      "کار با کودک تنها بخشی از درمان است. بخش مهمی از فرایند، در فهم رابطه‌ها و همراهی با والدین شکل می‌گیرد.",
  },
  {
    title: "روان‌درمانی نوجوان",
    age: "۱۲ تا ۱۸ سال",
    description:
      "کمک به نوجوان برای فهم بهتر تجربه‌های درونی، هیجان‌ها، روابط و چالش‌های این دوره از زندگی.",
  },
  {
    title: "مشاوره والدین",
    age: "برای والدین",
    description:
      "گاهی تغییر از جایی آغاز می‌شود که والد بتواند کودک را با نگاهی تازه ببیند، نه صرفاً رفتارش را.",
  },
];

export default function Services() {
  return (
    <section className="section">
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: "5rem",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--bronze)",
                letterSpacing: ".22em",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              SERVICES
            </div>
            <h2
              style={{
                fontSize: "clamp(2.8rem,5vw,4.2rem)",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
            >
              خدمات
            </h2>
          </div>
          <p
            style={{
              maxWidth: 420,
              lineHeight: 2,
              color: "var(--text-muted)",
            }}
          >
            جلسات به‌صورت آنلاین برگزار می‌شوند و برای خانواده‌های داخل و خارج از ایران در دسترس هستند.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "2rem",
          }}
        >
          {services.map((service) => (
            <article
              key={service.title}
              style={{
                border: "1px solid var(--border)",
                padding: "2.5rem",
                transition: ".35s",
              }}
            >
              <div style={{ color: "var(--bronze)", fontSize: 14, marginBottom: 24 }}>
                {service.age}
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 300, marginBottom: 20, lineHeight: 1.8 }}>
                {service.title}
              </h3>
              <p style={{ lineHeight: 2.1, color: "var(--text-muted)" }}>
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
