import Container from "./Container";

const manifesto = [
  "ما عجله‌ای برای نتیجه‌گیری نداریم.",
  "پیش از آنکه درمان را شروع کنیم، تلاش می‌کنیم مسئله را بفهمیم.",
  "هیچ کودکی را فقط با یک تشخیص تعریف نمی‌کنیم.",
  "رفتار، پایان داستان نیست؛ آغاز پرسش است.",
  "هر کودک تاریخچه‌ای دارد که باید شنیده شود.",
  "رابطه، بخشی از درمان است؛ نه فقط زمینه آن.",
];

export default function Manifesto() {
  return (
    <section className="section" style={{ background: "var(--bg)" }}>
      <Container>
        <div style={{ marginBottom: 70 }}>
          <div
            style={{
              color: "var(--bronze)",
              fontSize: 13,
              letterSpacing: ".22em",
              marginBottom: 18,
            }}
          >
            MANIFESTO
          </div>
          <h2
            style={{
              fontSize: "clamp(2.5rem,5vw,4.2rem)",
              lineHeight: 1.7,
              fontWeight: 300,
              maxWidth: 820,
            }}
          >
            چیزهایی که
            <br />
            مسیر کار ما را شکل می‌دهند.
          </h2>
        </div>

        <div style={{ display: "grid", gap: 0 }}>
          {manifesto.map((item, index) => (
            <div
              key={item}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr",
                gap: 24,
                alignItems: "center",
                padding: "2rem 0",
                borderTop: "1px solid var(--line)",
              }}
            >
              <div style={{ color: "var(--text-muted)", fontSize: 15 }}>
                {(index + 1).toString().padStart(2, "0")}
              </div>
              <div style={{ fontSize: 28, lineHeight: 1.9, fontWeight: 300 }}>
                {item}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
