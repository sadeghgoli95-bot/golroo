import Container from "./Container";
import Button from "./Button";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
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
          <h1
            style={{
              fontSize: "clamp(3rem,7vw,5.2rem)",
              lineHeight: 1.35,
              fontWeight: 400,
              marginBottom: 42,
            }}
          >
            هر کودکی
            <br />
            داستانش را
            <br />
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
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <Button href="#contact">رزرو جلسه</Button>
            <a
              href="#about"
              style={{
                padding: "1rem 2.8rem",
                border: "1px solid var(--border)",
                color: "var(--text)",
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
