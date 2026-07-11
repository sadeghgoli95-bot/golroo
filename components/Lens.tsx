import Container from "./Container";

const lenses = [
  {
    number: "01",
    title: "رفتار",
    text: "آنچه دیده می‌شود.",
  },
  {
    number: "02",
    title: "تجربه",
    text: "آنچه احساس می‌شود.",
  },
  {
    number: "03",
    title: "رابطه",
    text: "جایی که معنا شکل می‌گیرد.",
  },
  {
    number: "04",
    title: "فهم",
    text: "جایی که درمان آغاز می‌شود.",
  },
];

export default function Lens() {
  return (
    <section className="section" style={{ padding: "12rem 0" }}>
      <Container>
        <div style={{ marginBottom: 90, maxWidth: 760 }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            A DIFFERENT LENS
          </div>
          <h2
            style={{
              fontSize: "clamp(2.8rem,5vw,4.5rem)",
              lineHeight: 1.7,
              fontWeight: 300,
            }}
          >
            یک اتفاق را
            <br />
            می‌توان
            <br />
            از چهار زاویه دید.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 40,
          }}
        >
          {lenses.map((item) => (
            <div
              key={item.number}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 30,
              }}
            >
              <div style={{ color: "var(--bronze)", marginBottom: 30 }}>
                {item.number}
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 300, marginBottom: 20 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 18, lineHeight: 2 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
