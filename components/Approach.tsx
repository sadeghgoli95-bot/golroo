import Container from "./Container";

const approach = [
  {
    title: "مشاهده",
    text: "پیش از هر نتیجه‌گیری، سعی می‌کنیم آنچه را در حال رخ دادن است با دقت ببینیم.",
  },
  {
    title: "فهم",
    text: "هر رفتار در بستری از روابط، تجربه‌ها و تاریخچه زندگی معنا پیدا می‌کند.",
  },
  {
    title: "فرمول‌بندی",
    text: "به جای برچسب زدن، تصویری منسجم از آنچه در حال رخ دادن است شکل می‌دهیم.",
  },
  {
    title: "درمان",
    text: "درمان از دل همین فهم مشترک آغاز می‌شود، نه صرفاً از تکنیک‌ها.",
  },
];

export default function Approach() {
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "6rem",
            alignItems: "start",
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
              OUR APPROACH
            </div>
            <h2
              style={{
                fontSize: "clamp(2.8rem,5vw,4.3rem)",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              درمان
              <br />
              برای ما
              <br />
              یک مسیر است.
            </h2>
          </div>

          <div>
            {approach.map((item, index) => (
              <div
                key={item.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr",
                  gap: 24,
                  padding: "2.2rem 0",
                  borderTop: index === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <div style={{ color: "var(--bronze)", fontSize: 15 }}>
                  {(index + 1).toString().padStart(2, "0")}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: 28,
                      fontWeight: 300,
                      marginBottom: 14,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 18, lineHeight: 2.15 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
