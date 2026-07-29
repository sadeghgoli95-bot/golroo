import Container from "./Container";
import Button from "./Button";

export default function Contact() {
  return (
    <section
      className="section"
      style={{ borderTop: "1px solid var(--line)" }}
    >
      <Container>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <p className="overline" style={{ marginBottom: "var(--space-3)" }}>
            تماس
          </p>
          <h2
            style={{
              fontSize: "clamp(2.4rem,4.2vw,3.8rem)",
              fontWeight: 300,
              lineHeight: 1.55,
              marginBottom: 32,
              maxWidth: "22ch",
              marginInline: "auto",
            }}
          >
            گاهی فهمیدن یک تجربه، نیاز به نگاهی از زاویه‌ای دیگر دارد.
          </h2>
          <p
            style={{
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 2.2,
              color: "var(--text-muted)",
              marginBottom: "4rem",
            }}
          >
            اگر چیزی در رفتار فرزندتان، در یک رابطه یا در تجربه هیجانی خودتان مدتی است به یک پرسش تبدیل شده، لازم نیست از پیش بدانید دقیقاً مسئله چیست. یک گفت‌وگو می‌تواند کمک کند روشن شود چطور می‌توان به آن نزدیک شد.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button href="/contact">گفت‌وگو را شروع کنید</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
