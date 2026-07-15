import Container from "./Container";

export default function Contact() {
  return (
    <section
      className="section"
      style={{ borderTop: "1px solid var(--line)" }}
    >
      <Container>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 13,
              marginBottom: 22,
            }}
          >
            CONTACT
          </div>
          <h2
            style={{
              fontSize: "clamp(3rem,5vw,5rem)",
              fontWeight: 300,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            شاید
            <br />
            وقت آن رسیده باشد
            <br />
            داستان را از
            <br />
            زاویه‌ای دیگر ببینیم.
          </h2>
          <p
            style={{
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 2.2,
              color: "var(--text-muted)",
              marginBottom: "4rem",
            }}
          >
            اگر احساس می‌کنید زمان مناسبی برای شروع گفت‌وگوست،
            می‌توانید برای رزرو جلسه آنلاین یا دریافت اطلاعات بیشتر
            با ما در ارتباط باشید.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem 2.8rem",
                background: "var(--accent)",
                color: "var(--text)",
                textDecoration: "none",
                transition: ".3s",
              }}
            >
              رزرو جلسه
            </a>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem 2.8rem",
                border: "1px solid var(--line)",
                color: "var(--text)",
                textDecoration: "none",
                transition: ".3s",
              }}
            >
              ارتباط با ما
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
