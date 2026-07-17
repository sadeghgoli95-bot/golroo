import Container from "./Container";

const body = [
  "بیشتر والدین زمانی به فکر کمک گرفتن می‌افتند که رفتار فرزندشان تغییر کرده است؛ وقتی بیشتر از قبل مضطرب می‌شود، زودتر عصبانی می‌شود، از دیگران فاصله می‌گیرد، یا دیگر مانند گذشته بازی و ارتباط برقرار نمی‌کند.",
  "این نگرانی، واقعی و قابل درک است.",
  "اما در بسیاری از موقعیت‌ها، رفتار فقط جایی است که ما متوجه مسئله می‌شویم؛ نه جایی که مسئله از آن آغاز شده باشد.",
  "به همین دلیل، پیش از آنکه به دنبال تغییر رفتار باشم، تلاش می‌کنم بفهمم کودک چه تجربه‌ای را زندگی می‌کند، این تجربه در چه رابطه‌هایی شکل گرفته است و چگونه به رفتاری تبدیل شده که امروز می‌بینیم.",
];

export default function Story() {
  return (
    <section className="section">
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
            گاهی آنچه والد را نگران می‌کند،
            <br />
            همان چیزی نیست که کودک از آن رنج می‌برد.
          </h2>
        </div>

        <div style={{ display: "grid", gap: 32, maxWidth: 760 }}>
          {body.map((paragraph) => (
            <p key={paragraph} style={{ fontSize: 18, lineHeight: 2.2 }}>
              {paragraph}
            </p>
          ))}
        </div>
      </Container>
    </section>
  );
}
