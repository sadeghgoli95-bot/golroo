import Container from "./Container";
import Button from "./Button";

export default function Hero() {
  return (
    <section className="hero-section">
      <Container>
        <div style={{ maxWidth: 840 }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 14,
              marginBottom: 28,
            }}
          >
            SADEGH GOLROO
          </div>
          <h1 className="hero-heading">
            هر کودکی
            <br className="hero-break" />
            داستانش را
            <br className="hero-break" />
            با کلمات تعریف نمی‌کند.
          </h1>
          <p
            style={{
              maxWidth: 670,
              fontSize: 21,
              color: "var(--text-soft)",
              lineHeight: 2.15,
              marginBottom: 52,
            }}
          >
            بعضی کودکان با بازی،
            بعضی با سکوت،
            بعضی با اضطراب،
            بعضی با خشم
            و بعضی با رفتارهایی حرف می‌زنند که بیشتر از آنکه نیاز به اصلاح داشته باشند،
            نیاز دارند فهمیده شوند.
          </p>
          <div className="hero-actions">
            <Button href="/appointment">رزرو جلسه</Button>
            <a
              href="#about"
              style={{
                padding: "1rem 2.8rem",
                border: "1px solid var(--line)",
                color: "var(--text)",
                display: "inline-block",
              }}
            >
              بیشتر بخوانید
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
