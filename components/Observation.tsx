import Container from "./Container";

const observations = [
  "گاهی اضطراب کودک، بیش از آنکه درباره خودش باشد، درباره رابطه‌ای است که در آن زندگی می‌کند.",
  "همه رفتارها نیاز به اصلاح ندارند؛ بعضی فقط نیاز دارند فهمیده شوند.",
  "کودک همیشه با کلمات حرف نمی‌زند؛ گاهی بازی، سکوت یا خشم زبان اوست.",
  "هر نشانه‌ای، پیش از آنکه یک مشکل باشد، تلاشی برای کنار آمدن با چیزی است.",
  "درمان از جایی آغاز می‌شود که مشاهده، جای قضاوت را بگیرد.",
];

export default function Observation() {
  return (
    <section
      className="section"
      style={{
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Container>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 13,
              marginBottom: 42,
            }}
          >
            OBSERVATIONS
          </div>

          {observations.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "2.6rem 0",
                borderTop: index === 0 ? "none" : "1px solid var(--line)",
              }}
            >
              <p
                style={{
                  fontSize: 28,
                  lineHeight: 2,
                  color: "var(--text)",
                  margin: 0,
                }}
              >
                {item}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
