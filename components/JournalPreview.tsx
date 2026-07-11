import Container from "./Container";

const notes = [
  {
    title: "وقتی کودک مضطرب است، دقیقاً چه چیزی را تجربه می‌کند؟",
    category: "یادداشت",
  },
  {
    title: "آیا همیشه باید رفتار کودک را اصلاح کرد؟",
    category: "تأمل",
  },
  {
    title: "چرا بعضی کودکان احساساتشان را با بازی نشان می‌دهند؟",
    category: "مشاهده",
  },
];

export default function JournalPreview() {
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
          <a href="/journal" style={{ color: "var(--bronze)", fontSize: 16 }}>
            مشاهده همه یادداشت‌ها →
          </a>
        </div>

        <div style={{ display: "grid", gap: 26 }}>
          {notes.map((item) => (
            <article
              key={item.title}
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
                {item.category}
              </div>
              <h3 style={{ fontSize: 29, fontWeight: 300, lineHeight: 1.9 }}>
                {item.title}
              </h3>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
