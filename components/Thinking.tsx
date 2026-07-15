import Container from "./Container";

const principles = [
  {
    no: "01",
    title: "مشاهده، پیش از تفسیر",
    text: "پیش از آنکه رفتار را معنا کنیم، سعی می‌کنیم آن را همان‌گونه که هست ببینیم.",
  },
  {
    no: "02",
    title: "پیچیدگی، نه پاسخ‌های ساده",
    text: "مسائل انسانی معمولاً یک علت واحد ندارند؛ بنابراین راه‌حل‌های ساده همیشه بهترین راه نیستند.",
  },
  {
    no: "03",
    title: "رابطه، بخشی از درمان",
    text: "آنچه میان درمانگر و مراجع شکل می‌گیرد، فقط زمینه درمان نیست؛ بخشی از خود درمان است.",
  },
  {
    no: "04",
    title: "کنجکاوی، به جای قضاوت",
    text: "هرجا قضاوت کمتر شود، امکان فهم بیشتر می‌شود.",
  },
];

export default function Thinking() {
  return (
    <section className="section" style={{ background: "var(--bg-soft)" }}>
      <Container>
        <div style={{ marginBottom: 70 }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            HOW WE THINK
          </div>
          <h2
            style={{
              fontSize: "clamp(2.6rem,5vw,4rem)",
              lineHeight: 1.7,
              fontWeight: 300,
              maxWidth: 720,
            }}
          >
            پیش از آنکه بگوییم
            چه می‌کنیم،
            بهتر است بدانید
            چگونه فکر می‌کنیم.
          </h2>
        </div>

        <div style={{ display: "grid", gap: 36 }}>
          {principles.map((item) => (
            <div
              key={item.no}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 280px 1fr",
                gap: 32,
                padding: "2.2rem 0",
                borderTop: "1px solid var(--line)",
                alignItems: "start",
              }}
            >
              <div style={{ color: "var(--bronze)", fontSize: 15 }}>
                {item.no}
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.8 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 18, lineHeight: 2.2 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
