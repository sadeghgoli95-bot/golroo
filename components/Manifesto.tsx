import Container from "./Container";

const manifesto = [
  "والدین معمولاً پیش از آنکه نامِ مشکل را بدانند، تغییرِ فرزندشان را احساس می‌کنند.",
  "رفتار امروز کودک، گاهی ادامهٔ تجربه‌هایی است که مدت‌ها پیش آغاز شده‌اند.",
  "درمان، فقط دربارهٔ کودک نیست؛ دربارهٔ رابطه‌هایی هم هست که کودک در آن‌ها رشد می‌کند.",
  "رفتار را جدا از رابطه‌ها، خانواده و تجربه‌های کودک نمی‌توان فهمید.",
  "هیچ رفتاری را نمی‌توان بدون شناخت تجربه‌هایی که آن را شکل داده‌اند، به‌درستی فهمید.",
  "هدف درمان، فقط تغییر رفتار نیست؛ کمک به رشدی است که از درون کودک آغاز می‌شود.",
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
            آنچه مسیر کار ما را شکل می‌دهد.
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
