import Container from "./Container";

const story = [
  {
    year: "شروع",
    title: "رفتار، اولین چیزی است که دیده می‌شود.",
    text: "بیشتر خانواده‌ها زمانی مراجعه می‌کنند که رفتار کودک نگران‌کننده شده است؛ اضطراب، پرخاشگری، سکوت، افت تحصیلی یا مشکلات ارتباطی.",
  },
  {
    year: "کمی عمیق‌تر",
    title: "اما رفتار، معمولاً آغاز داستان نیست.",
    text: "رفتار اغلب آخرین حلقه زنجیره‌ای از تجربه‌ها، روابط و احساساتی است که مدت‌ها قبل شکل گرفته‌اند.",
  },
  {
    year: "جایی که درمان آغاز می‌شود",
    title: "ما سعی می‌کنیم داستان را از ابتدا بخوانیم.",
    text: "به جای جنگیدن با نشانه‌ها، تلاش می‌کنیم بفهمیم کودک چه تجربه‌ای را زندگی می‌کند و این تجربه چگونه به رفتار امروز او تبدیل شده است.",
  },
];

export default function Story() {
  return (
    <section className="section">
      <Container>
        <div style={{ marginBottom: 90 }}>
          <div
            style={{
              color: "var(--bronze)",
              letterSpacing: ".22em",
              fontSize: 13,
              marginBottom: 18,
            }}
          >
            A DIFFERENT WAY OF SEEING
          </div>
          <h2
            style={{
              fontSize: "clamp(2.8rem,5vw,4.4rem)",
              lineHeight: 1.7,
              fontWeight: 300,
              maxWidth: 760,
            }}
          >
            گاهی مسئله،
            <br />
            آن چیزی نیست
            <br />
            که در نگاه اول دیده می‌شود.
          </h2>
        </div>

        <div style={{ display: "grid", gap: 70 }}>
          {story.map((item) => (
            <div
              key={item.title}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                gap: 40,
                borderTop: "1px solid var(--line)",
                paddingTop: 36,
              }}
            >
              <div style={{ color: "var(--bronze)", fontSize: 18 }}>
                {item.year}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 32,
                    fontWeight: 300,
                    lineHeight: 1.8,
                    marginBottom: 20,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ fontSize: 18, lineHeight: 2.2, maxWidth: 760 }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
