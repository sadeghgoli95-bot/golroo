import Container from "./Container";

const observations = [
  "آنچه در رفتار کودک دیده می‌شود، همیشه تمامِ آن چیزی نیست که او تجربه می‌کند.",
  "کودکان در دلِ رابطه‌ها رشد می‌کنند؛ رفتارشان نیز از همان رابطه‌ها تأثیر می‌گیرد.",
  "هر تغییری در رفتار، لزوماً نشانهٔ یک اختلال نیست؛ اما می‌تواند نشانهٔ تغییری در تجربهٔ کودک باشد.",
  "بعضی رفتارها تا زمانی که معنایشان فهمیده نشود، حتی اگر موقتاً متوقف شوند، به شکل دیگری بازمی‌گردند.",
  "هر رفتار، پیش از آنکه راه‌حلی بخواهد، نیاز دارد معنایش فهمیده شود.",
];

export default function Observation() {
  return (
    <section
      className="section"
      style={{
        background: "var(--bg-soft)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <Container>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <p className="overline" style={{ marginBottom: "var(--space-5)" }}>
            OBSERVATIONS
          </p>

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
